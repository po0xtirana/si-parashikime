
-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create market status enum
CREATE TYPE public.market_status AS ENUM ('open', 'locked', 'resolved');

-- Create market category enum
CREATE TYPE public.market_category AS ENUM ('Politics', 'Sports', 'Economy', 'Entertainment', 'Technology', 'Other');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 1000,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  accuracy_rate NUMERIC NOT NULL DEFAULT 0,
  total_predictions INTEGER NOT NULL DEFAULT 0,
  correct_predictions INTEGER NOT NULL DEFAULT 0,
  last_daily_claim TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create markets table
CREATE TABLE public.markets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  status market_status NOT NULL DEFAULT 'open',
  category market_category NOT NULL DEFAULT 'Other',
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_yes NUMERIC NOT NULL DEFAULT 0,
  total_no NUMERIC NOT NULL DEFAULT 0,
  seed_yes NUMERIC NOT NULL DEFAULT 500,
  seed_no NUMERIC NOT NULL DEFAULT 500,
  winning_outcome BOOLEAN,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bets table
CREATE TABLE public.bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  prediction BOOLEAN NOT NULL,
  odds_at_time_of_bet NUMERIC NOT NULL,
  payout NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price_history table
CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  yes_probability NUMERIC NOT NULL CHECK (yes_probability >= 0 AND yes_probability <= 100),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Markets policies
CREATE POLICY "Markets are viewable by everyone" ON public.markets FOR SELECT USING (true);
CREATE POLICY "Admins can create markets" ON public.markets FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update markets" ON public.markets FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Bets policies
CREATE POLICY "Users can view all bets" ON public.bets FOR SELECT USING (true);
CREATE POLICY "Users can place bets" ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Price history policies
CREATE POLICY "Price history is viewable by everyone" ON public.price_history FOR SELECT USING (true);
CREATE POLICY "System can insert price history" ON public.price_history FOR INSERT WITH CHECK (true);

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::text, 8)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_markets_updated_at
  BEFORE UPDATE ON public.markets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPC for placing a bet (atomic transaction)
CREATE OR REPLACE FUNCTION public.place_bet(
  p_market_id UUID,
  p_prediction BOOLEAN,
  p_amount NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_balance NUMERIC;
  v_market RECORD;
  v_total_pool NUMERIC;
  v_odds NUMERIC;
  v_bet_id UUID;
  v_yes_prob NUMERIC;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  SELECT balance INTO v_balance FROM profiles WHERE user_id = v_user_id FOR UPDATE;
  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN json_build_object('error', 'Insufficient balance');
  END IF;

  SELECT * INTO v_market FROM markets WHERE id = p_market_id FOR UPDATE;
  IF v_market IS NULL THEN
    RETURN json_build_object('error', 'Market not found');
  END IF;
  IF v_market.status != 'open' THEN
    RETURN json_build_object('error', 'Market is not open for betting');
  END IF;

  v_total_pool := (v_market.total_yes + v_market.seed_yes) + (v_market.total_no + v_market.seed_no);
  IF p_prediction THEN
    v_odds := v_total_pool / (v_market.total_yes + v_market.seed_yes);
  ELSE
    v_odds := v_total_pool / (v_market.total_no + v_market.seed_no);
  END IF;

  UPDATE profiles SET balance = balance - p_amount WHERE user_id = v_user_id;

  IF p_prediction THEN
    UPDATE markets SET total_yes = total_yes + p_amount WHERE id = p_market_id;
  ELSE
    UPDATE markets SET total_no = total_no + p_amount WHERE id = p_market_id;
  END IF;

  INSERT INTO bets (user_id, market_id, amount, prediction, odds_at_time_of_bet)
  VALUES (v_user_id, p_market_id, p_amount, p_prediction, v_odds)
  RETURNING id INTO v_bet_id;

  IF p_amount >= 100 THEN
    v_yes_prob := ((v_market.total_yes + v_market.seed_yes + CASE WHEN p_prediction THEN p_amount ELSE 0 END) /
                   (v_total_pool + p_amount)) * 100;
    INSERT INTO price_history (market_id, yes_probability)
    VALUES (p_market_id, v_yes_prob);
  END IF;

  RETURN json_build_object(
    'success', true,
    'bet_id', v_bet_id,
    'odds', v_odds,
    'new_balance', v_balance - p_amount
  );
END;
$$;

-- RPC for resolving a market (admin only)
CREATE OR REPLACE FUNCTION public.resolve_market(
  p_market_id UUID,
  p_winning_outcome BOOLEAN
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_market RECORD;
  v_total_pool NUMERIC;
  v_winning_pool NUMERIC;
  v_bet RECORD;
  v_payout NUMERIC;
BEGIN
  v_user_id := auth.uid();
  IF NOT public.has_role(v_user_id, 'admin') THEN
    RETURN json_build_object('error', 'Not authorized');
  END IF;

  SELECT * INTO v_market FROM markets WHERE id = p_market_id FOR UPDATE;
  IF v_market IS NULL THEN
    RETURN json_build_object('error', 'Market not found');
  END IF;
  IF v_market.status = 'resolved' THEN
    RETURN json_build_object('error', 'Market already resolved');
  END IF;

  v_total_pool := v_market.total_yes + v_market.total_no;
  IF p_winning_outcome THEN
    v_winning_pool := v_market.total_yes;
  ELSE
    v_winning_pool := v_market.total_no;
  END IF;

  IF v_winning_pool > 0 THEN
    FOR v_bet IN SELECT * FROM bets WHERE market_id = p_market_id AND prediction = p_winning_outcome LOOP
      v_payout := (v_bet.amount / v_winning_pool) * v_total_pool;
      UPDATE bets SET payout = v_payout WHERE id = v_bet.id;
      UPDATE profiles SET
        balance = balance + v_payout,
        correct_predictions = correct_predictions + 1,
        total_predictions = total_predictions + 1,
        accuracy_rate = CASE
          WHEN total_predictions + 1 > 0
          THEN ((correct_predictions + 1)::NUMERIC / (total_predictions + 1)::NUMERIC) * 100
          ELSE 0
        END
      WHERE user_id = v_bet.user_id;
    END LOOP;
  END IF;

  UPDATE profiles SET
    total_predictions = total_predictions + 1,
    accuracy_rate = CASE
      WHEN total_predictions + 1 > 0
      THEN (correct_predictions::NUMERIC / (total_predictions + 1)::NUMERIC) * 100
      ELSE 0
    END
  WHERE user_id IN (
    SELECT user_id FROM bets WHERE market_id = p_market_id AND prediction != p_winning_outcome
  );

  UPDATE markets SET status = 'resolved', winning_outcome = p_winning_outcome WHERE id = p_market_id;

  RETURN json_build_object('success', true, 'total_paid_out', v_total_pool);
END;
$$;

-- RPC for claiming daily credits
CREATE OR REPLACE FUNCTION public.claim_daily_credits()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_profile RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  SELECT * INTO v_profile FROM profiles WHERE user_id = v_user_id FOR UPDATE;

  IF NOT v_profile.is_verified THEN
    RETURN json_build_object('error', 'Email must be verified to claim daily credits');
  END IF;

  IF v_profile.last_daily_claim IS NOT NULL AND
     v_profile.last_daily_claim > now() - INTERVAL '24 hours' THEN
    RETURN json_build_object('error', 'Already claimed today');
  END IF;

  UPDATE profiles SET
    balance = balance + 50,
    last_daily_claim = now()
  WHERE user_id = v_user_id;

  RETURN json_build_object('success', true, 'new_balance', v_profile.balance + 50);
END;
$$;

-- Enable realtime on all tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE markets;
ALTER PUBLICATION supabase_realtime ADD TABLE bets;
ALTER PUBLICATION supabase_realtime ADD TABLE price_history;

-- Indexes for performance
CREATE INDEX idx_bets_market_id ON public.bets(market_id);
CREATE INDEX idx_bets_user_id ON public.bets(user_id);
CREATE INDEX idx_price_history_market_id ON public.price_history(market_id);
CREATE INDEX idx_markets_status ON public.markets(status);
CREATE INDEX idx_profiles_accuracy ON public.profiles(accuracy_rate DESC);
