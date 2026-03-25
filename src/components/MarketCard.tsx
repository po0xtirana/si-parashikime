import { useState } from "react";
import { Link } from "react-router-dom";
import { differenceInHours, formatDistanceToNow } from "date-fns";
import { sq } from "date-fns/locale";
import { ArrowUpRight, Clock3, Flame, TrendingUp } from "lucide-react";

import { calculateOdds } from "@/hooks/useMarkets";
import type { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import QuickBetDialog from "@/components/QuickBetDialog";

type Market = Tables<"markets">;

const categoryLabels: Record<string, string> = {
  Politics: "Politike",
  Sports: "Sport",
  Economy: "Ekonomi",
  Entertainment: "Argetim",
  Technology: "Teknologji",
  Other: "Te tjera",
};

export default function MarketCard({ market }: { market: Market }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quickPrediction, setQuickPrediction] = useState(true);

  const { yesOdds, noOdds, yesProbability } = calculateOdds(
    market.total_yes,
    market.total_no,
    market.seed_yes,
    market.seed_no
  );
  const totalPool = market.total_yes + market.total_no;
  const closesInHours = differenceInHours(new Date(market.end_time), new Date());
  const isClosingSoon = market.status === "open" && closesInHours >= 0 && closesInHours < 48;

  const openQuickBet = (prediction: boolean) => {
    setQuickPrediction(prediction);
    setDialogOpen(true);
  };

  return (
    <>
      <article className="group flex h-full flex-col rounded-[28px] border border-zinc-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-950/5">
        <div className="flex min-h-[13.5rem] items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full border-zinc-200 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                {categoryLabels[market.category] || market.category}
              </Badge>
              {isClosingSoon && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                  <Flame className="h-3.5 w-3.5" />
                  Mbyllet shpejt
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Link
                to={`/market/${market.id}`}
                className="block h-[7.5rem] line-clamp-4 text-xl font-semibold leading-tight tracking-tight text-zinc-950 transition-colors hover:text-zinc-600"
              >
                {market.title}
              </Link>
              <div className="h-[3rem]">
                {market.description ? (
                  <p className="line-clamp-2 text-sm leading-6 text-zinc-500">{market.description}</p>
                ) : null}
              </div>
            </div>
          </div>

          <Link
            to={`/market/${market.id}`}
            className="hidden rounded-full border border-zinc-200 p-2 text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 sm:inline-flex"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 flex-1 space-y-5">
          <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            <span>Po {yesProbability.toFixed(0)}%</span>
            <span>Jo {(100 - yesProbability).toFixed(0)}%</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${yesProbability}%` }}
            />
            <div
              className="h-full bg-rose-500 transition-all duration-500"
              style={{ width: `${100 - yesProbability}%` }}
            />
          </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-zinc-500">
            <div className="rounded-2xl bg-zinc-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Volumi</p>
              <p className="mt-1 font-mono text-base font-semibold text-zinc-900">
                {totalPool.toLocaleString()} SI
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Mbyllet</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-zinc-900">
                <Clock3 className="h-4 w-4 text-zinc-400" />
                {market.status === "open"
                  ? formatDistanceToNow(new Date(market.end_time), { addSuffix: true, locale: sq })
                  : "Mbyllur"}
              </p>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => openQuickBet(true)}
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left transition-all hover:scale-[1.01] hover:border-emerald-300 hover:bg-emerald-100"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Po</p>
              <div className="mt-1 flex items-center gap-2 text-emerald-900">
                <TrendingUp className="h-4 w-4" />
                <span className="text-lg font-semibold">{yesOdds.toFixed(2)}x</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => openQuickBet(false)}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-left transition-all hover:scale-[1.01] hover:border-rose-300 hover:bg-rose-100"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-rose-700">Jo</p>
              <div className="mt-1 flex items-center gap-2 text-rose-900">
                <TrendingUp className="h-4 w-4" />
                <span className="text-lg font-semibold">{noOdds.toFixed(2)}x</span>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link to={`/market/${market.id}`} className="font-medium text-zinc-500 transition-colors hover:text-zinc-900">
            Shih tregun
          </Link>
          {market.article_url && (
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
              Artikull i lidhur
            </span>
          )}
        </div>
      </article>

      <QuickBetDialog
        market={market}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prediction={quickPrediction}
        onPredictionChange={setQuickPrediction}
      />
    </>
  );
}
