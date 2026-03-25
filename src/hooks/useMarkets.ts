import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Market = Tables<"markets">;

export function useMarkets(status?: string) {
  return useQuery({
    queryKey: ["markets", status],
    queryFn: async () => {
      let query = supabase.from("markets").select("*").order("created_at", { ascending: false });
      if (status) query = query.eq("status", status as Market["status"]);
      const { data, error } = await query;
      if (error) throw error;
      return data as Market[];
    },
  });
}

export function useMarket(id: string) {
  return useQuery({
    queryKey: ["market", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("markets")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Market;
    },
    enabled: !!id,
  });
}

export function useMarketBets(marketId: string) {
  return useQuery({
    queryKey: ["bets", marketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .eq("market_id", marketId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!marketId,
  });
}

export function usePriceHistory(marketId: string) {
  return useQuery({
    queryKey: ["price_history", marketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("price_history")
        .select("*")
        .eq("market_id", marketId)
        .order("timestamp", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!marketId,
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .gt("total_predictions", 0)
        .order("accuracy_rate", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
}

export function useRecentBets() {
  return useQuery({
    queryKey: ["recent_bets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      
      // Fetch related data separately
      if (!data || data.length === 0) return [];
      
      const userIds = [...new Set(data.map(b => b.user_id))];
      const marketIds = [...new Set(data.map(b => b.market_id))];
      
      const [profilesRes, marketsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, username").in("user_id", userIds),
        supabase.from("markets").select("id, title, total_yes, total_no, seed_yes, seed_no").in("id", marketIds),
      ]);
      
      const profileMap = Object.fromEntries((profilesRes.data ?? []).map(p => [p.user_id, p]));
      const marketMap = Object.fromEntries((marketsRes.data ?? []).map(m => [m.id, m]));
      
      return data.map(bet => ({
        ...bet,
        profiles: profileMap[bet.user_id] || null,
        markets: marketMap[bet.market_id] || null,
      }));
    },
    refetchInterval: 10000,
  });
}

// Parimutuel odds calculation helpers
export function calculateOdds(totalYes: number, totalNo: number, seedYes: number, seedNo: number) {
  const yesPool = totalYes + seedYes;
  const noPool = totalNo + seedNo;
  const totalPool = yesPool + noPool;
  return {
    yesOdds: totalPool / yesPool,
    noOdds: totalPool / noPool,
    yesProbability: (yesPool / totalPool) * 100,
    noProbability: (noPool / totalPool) * 100,
  };
}

export function estimatePayout(
  betAmount: number,
  prediction: boolean,
  totalYes: number,
  totalNo: number,
  seedYes: number,
  seedNo: number
) {
  const yesPool = totalYes + seedYes + (prediction ? betAmount : 0);
  const noPool = totalNo + seedNo + (!prediction ? betAmount : 0);
  const totalPool = yesPool + noPool;
  const userPool = prediction ? yesPool : noPool;
  const odds = totalPool / userPool;
  return betAmount * odds;
}
