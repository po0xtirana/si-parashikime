import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Coins, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { calculateOdds, estimatePayout } from "@/hooks/useMarkets";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Market = Tables<"markets">;

interface QuickBetDialogProps {
  market: Market;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prediction: boolean;
  onPredictionChange: (prediction: boolean) => void;
}

export default function QuickBetDialog({
  market,
  open,
  onOpenChange,
  prediction,
  onPredictionChange,
}: QuickBetDialogProps) {
  const { user, profile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setAmount("");
      setIsPublic(true);
    }
  }, [open]);

  const betAmount = Number(amount) || 0;
  const { yesOdds, noOdds } = calculateOdds(
    market.total_yes,
    market.total_no,
    market.seed_yes,
    market.seed_no
  );
  const estimatedPayout =
    betAmount > 0
      ? estimatePayout(
          betAmount,
          prediction,
          market.total_yes,
          market.total_no,
          market.seed_yes,
          market.seed_no
        )
      : 0;

  const placeQuickBet = async () => {
    if (!user) {
      toast.error("Hyni per te vendosur nje parashikim.");
      return;
    }
    if (betAmount < 10) {
      toast.error("Minimumi eshte 10 SI.");
      return;
    }
    if (betAmount > Number(profile?.balance ?? 0)) {
      toast.error("Balanca nuk mjafton.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc("place_bet", {
      p_market_id: market.id,
      p_prediction: prediction,
      p_amount: betAmount,
      p_is_public: isPublic,
    });
    setLoading(false);

    const result = data as Record<string, unknown> | null;
    if (error || (result && result.error)) {
      toast.error(String(result?.error || error?.message));
      return;
    }

    toast.success(`Parashikimi u vendos ne ${prediction ? "PO" : "JO"}.`);
    queryClient.invalidateQueries({ queryKey: ["markets"] });
    queryClient.invalidateQueries({ queryKey: ["market", market.id] });
    queryClient.invalidateQueries({ queryKey: ["bets", market.id] });
    queryClient.invalidateQueries({ queryKey: ["recent_bets"] });
    refreshProfile();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border border-zinc-200/80 bg-white/95 p-0 shadow-2xl backdrop-blur">
        <div className="rounded-t-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 px-6 py-5 text-white">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="font-sans text-xl font-semibold tracking-tight">
              Parashikim i shpejte
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-300">
              {market.title}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onPredictionChange(true)}
              className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                prediction
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                  : "border-zinc-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Po</p>
              <p className="mt-1 text-2xl font-semibold">{yesOdds.toFixed(2)}x</p>
            </button>
            <button
              type="button"
              onClick={() => onPredictionChange(false)}
              className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                !prediction
                  ? "border-rose-500 bg-rose-50 text-rose-900 shadow-sm"
                  : "border-zinc-200 bg-white hover:border-rose-300 hover:bg-rose-50/40"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Jo</p>
              <p className="mt-1 text-2xl font-semibold">{noOdds.toFixed(2)}x</p>
            </button>
          </div>

          {!user ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 text-zinc-500" />
                <div className="space-y-3">
                  <p className="text-sm text-zinc-600">
                    Hyr ne platforme per te vendosur nje parashikim direkt nga karta.
                  </p>
                  <Button asChild className="rounded-full">
                    <Link to="/auth" onClick={() => onOpenChange(false)}>
                      Hyr tani
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Shuma
                </label>
                <Input
                  type="number"
                  min="10"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Vendos shumen..."
                  className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 font-mono text-base"
                />
                <div className="flex flex-wrap gap-2">
                  {[25, 50, 100, 250].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAmount(String(Math.min(value, Number(profile?.balance ?? value))))}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                    >
                      {value} SI
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <Checkbox
                  id={`quick-bet-public-${market.id}`}
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(checked === true)}
                  className="mt-0.5 rounded border-zinc-300 data-[state=checked]:border-zinc-950 data-[state=checked]:bg-zinc-950"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor={`quick-bet-public-${market.id}`}
                    className="text-sm font-medium text-zinc-900"
                  >
                    Shfaq emrin tim ne aktivitetin live
                  </Label>
                  <p className="text-xs leading-5 text-zinc-500">
                    Nese e caktivizon, basti do te shfaqet si Anonim ne panelin e aktivitetit.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Balanca</span>
                  <span className="font-mono font-semibold text-zinc-900">
                    {Math.floor(Number(profile?.balance ?? 0)).toLocaleString()} SI
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Pagesa e parashikuar</span>
                  <span className="font-mono font-semibold text-zinc-900">
                    {estimatedPayout.toFixed(0)} SI
                  </span>
                </div>
              </div>

              <Button
                onClick={placeQuickBet}
                disabled={loading || betAmount < 10}
                className="h-12 w-full rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800"
              >
                <Coins className="h-4 w-4" />
                {loading ? "Duke vendosur..." : `Parashiko ${prediction ? "Po" : "Jo"}`}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
