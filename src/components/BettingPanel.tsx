import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { calculateOdds, estimatePayout } from "@/hooks/useMarkets";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

type Market = Tables<"markets">;

interface BettingPanelProps {
  market: Market;
  selectedPrediction?: boolean | null;
  spotlightKey?: number;
}

export default function BettingPanel({
  market,
  selectedPrediction = null,
  spotlightKey = 0,
}: BettingPanelProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [prediction, setPrediction] = useState<boolean>(true);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpotlighted, setIsSpotlighted] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (selectedPrediction === null) return;
    setPrediction(selectedPrediction);
  }, [selectedPrediction]);

  useEffect(() => {
    if (spotlightKey === 0) return;
    setIsSpotlighted(true);
    const timeoutId = window.setTimeout(() => setIsSpotlighted(false), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [spotlightKey]);

  const betAmount = parseFloat(amount) || 0;
  const { yesOdds, noOdds, yesProbability } = calculateOdds(
    market.total_yes, market.total_no, market.seed_yes, market.seed_no
  );
  const estPayout = betAmount > 0
    ? estimatePayout(betAmount, prediction, market.total_yes, market.total_no, market.seed_yes, market.seed_no)
    : 0;

  const placeBet = async () => {
    if (!user) { toast.error("Ju lutem hyni për të vendosur baste"); return; }
    if (betAmount < 10) { toast.error("Minimumi është 10 Kredite SI"); return; }
    if (betAmount > (profile?.balance ?? 0)) { toast.error("Balancë e pamjaftueshme"); return; }

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
    } else {
      toast.success(`Basti u vendos! ${prediction ? "PO" : "JO"} me ${(prediction ? yesOdds : noOdds).toFixed(2)}x`);
      setAmount("");
      setIsPublic(true);
      queryClient.invalidateQueries({ queryKey: ["market", market.id] });
      queryClient.invalidateQueries({ queryKey: ["bets", market.id] });
      queryClient.invalidateQueries({ queryKey: ["recent_bets"] });
      refreshProfile();
    }
  };

  if (market.status !== "open") {
    return (
      <div className="rounded-lg border border-border bg-card p-5 text-center">
        <p className="text-muted-foreground font-serif text-lg">
          {market.status === "locked" ? "Tregu i Bllokuar" : "Tregu i Zgjidhur"}
        </p>
        {market.status === "resolved" && market.winning_outcome !== null && (
          <p className="mt-2 text-2xl font-serif font-bold">
            Fituesi: {market.winning_outcome ? "PO" : "JO"}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border bg-card p-5 space-y-4 transition-all duration-500 ${
        isSpotlighted
          ? "border-foreground shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
          : "border-border"
      }`}
    >
      <h3 className="font-serif text-lg font-semibold">Vendos Parashikimin</h3>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setPrediction(true)}
          className={`rounded-md py-3 font-mono text-sm font-semibold transition-all border ${
            prediction
              ? "bg-foreground text-background border-foreground"
              : "bg-background text-foreground border-border hover:border-foreground/40"
          }`}
        >
          PO — {yesOdds.toFixed(2)}x
        </button>
        <button
          onClick={() => setPrediction(false)}
          className={`rounded-md py-3 font-mono text-sm font-semibold transition-all border ${
            !prediction
              ? "bg-foreground text-background border-foreground"
              : "bg-background text-foreground border-border hover:border-foreground/40"
          }`}
        >
          JO — {noOdds.toFixed(2)}x
        </button>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Shuma (Kredite SI)</label>
        <Input
          type="number"
          min="10"
          placeholder="Shkruaj shumën..."
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="font-mono"
        />
        {profile && (
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-muted-foreground">
              Balanca: {Math.floor(profile.balance).toLocaleString()} SI
            </span>
            <div className="flex gap-1">
              {[50, 100, 250].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(String(Math.min(v, profile.balance)))}
                  className="text-xs px-2 py-0.5 rounded border border-border hover:bg-accent"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3">
        <Checkbox
          id={`bet-public-${market.id}`}
          checked={isPublic}
          onCheckedChange={(checked) => setIsPublic(checked === true)}
          className="mt-0.5"
        />
        <div className="space-y-1">
          <Label htmlFor={`bet-public-${market.id}`} className="text-sm font-medium text-foreground">
            Shfaq emrin tim ne aktivitetin live
          </Label>
          <p className="text-xs text-muted-foreground">
            Nese e caktivizon, basti do te shfaqet si Anonim.
          </p>
        </div>
      </div>

      {betAmount > 0 && (
        <div className="rounded-md bg-muted p-3 text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Pagesa e Parashikuar</p>
          <p className="text-xl font-mono font-bold">
            {estPayout.toFixed(0)} SI
          </p>
          <p className="text-xs text-muted-foreground">
            me shumëzuesin {(prediction ? yesOdds : noOdds).toFixed(2)}x
          </p>
        </div>
      )}

      <Button
        onClick={placeBet}
        disabled={loading || betAmount < 10}
        className="w-full font-semibold"
        size="lg"
      >
        {loading ? "Duke vendosur..." : `Bast ${prediction ? "PO" : "JO"} — ${betAmount > 0 ? betAmount.toFixed(0) : "0"} SI`}
      </Button>

      <div className="text-center">
        <span className="text-xs text-muted-foreground">
          Besueshmëria e tregut: <span className="text-success font-mono">{yesProbability.toFixed(0)}% PO</span>
        </span>
      </div>
    </div>
  );
}
