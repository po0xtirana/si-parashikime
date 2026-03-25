ALTER TABLE public.bets
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.place_bet(
  p_market_id UUID,
  p_prediction BOOLEAN,
  p_amount NUMERIC,
  p_is_public BOOLEAN DEFAULT true
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

  INSERT INTO bets (user_id, market_id, amount, prediction, odds_at_time_of_bet, is_public)
  VALUES (v_user_id, p_market_id, p_amount, p_prediction, v_odds, p_is_public)
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
