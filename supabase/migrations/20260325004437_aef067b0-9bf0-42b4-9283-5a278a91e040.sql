
-- Fix overly permissive price_history INSERT policy
DROP POLICY "System can insert price history" ON public.price_history;
-- Price history is inserted by the place_bet RPC (SECURITY DEFINER), so no direct INSERT policy needed
