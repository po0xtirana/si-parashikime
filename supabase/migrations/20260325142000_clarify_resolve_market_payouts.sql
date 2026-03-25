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
  v_losing_pool NUMERIC;
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
    v_losing_pool := v_market.total_no;
  ELSE
    v_winning_pool := v_market.total_no;
    v_losing_pool := v_market.total_yes;
  END IF;

  IF v_winning_pool > 0 THEN
    FOR v_bet IN
      SELECT * FROM bets WHERE market_id = p_market_id AND prediction = p_winning_outcome
    LOOP
      v_payout := v_bet.amount + CASE
        WHEN v_losing_pool > 0 THEN (v_bet.amount / v_winning_pool) * v_losing_pool
        ELSE 0
      END;

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

  UPDATE bets
  SET payout = 0
  WHERE market_id = p_market_id
    AND prediction != p_winning_outcome
    AND (payout IS NULL OR payout != 0);

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
