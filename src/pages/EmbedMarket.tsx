import { ExternalLink, Flame, Newspaper, Timer } from "lucide-react";
import { differenceInHours, formatDistanceToNow } from "date-fns";
import { sq } from "date-fns/locale";
import { useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculateOdds, useMarket } from "@/hooks/useMarkets";

const categoryLabels: Record<string, string> = {
  Politics: "Politike",
  Sports: "Sport",
  Economy: "Ekonomi",
  Entertainment: "Argetim",
  Technology: "Teknologji",
  Other: "Te tjera",
};

export default function EmbedMarket() {
  const { id } = useParams<{ id: string }>();
  const { data: market, isLoading } = useMarket(id!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent p-4">
        <div className="mx-auto h-72 max-w-2xl animate-pulse rounded-[28px] border border-zinc-200/80 bg-white/90" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-transparent p-4">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-zinc-200/80 bg-white/95 p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-zinc-950">Tregu nuk u gjet.</p>
          <p className="mt-2 text-sm text-zinc-500">Kontrollo linkun ose krijo nje embed me ID te sakte.</p>
        </div>
      </div>
    );
  }

  const { yesOdds, noOdds, yesProbability } = calculateOdds(
    market.total_yes,
    market.total_no,
    market.seed_yes,
    market.seed_no
  );

  const closesInHours = differenceInHours(new Date(market.end_time), new Date());
  const isClosingSoon = market.status === "open" && closesInHours >= 0 && closesInHours < 48;
  const totalPool = market.total_yes + market.total_no;
  const marketUrl = `/market/${market.id}`;

  return (
    <div className="min-h-screen bg-transparent p-4">
      <article className="mx-auto max-w-2xl rounded-[28px] border border-zinc-200/80 bg-white/95 p-5 shadow-lg shadow-zinc-950/5 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full border-zinc-200 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                {categoryLabels[market.category] || market.category}
              </Badge>
              {market.article_url && (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  <Newspaper className="h-3.5 w-3.5" />
                  Artikull i lidhur
                </span>
              )}
              {isClosingSoon && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                  <Flame className="h-3.5 w-3.5" />
                  Mbyllet shpejt
                </span>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-2xl font-semibold leading-tight tracking-tight text-zinc-950">{market.title}</p>
              {market.description && (
                <p className="line-clamp-2 text-sm leading-6 text-zinc-500">{market.description}</p>
              )}
            </div>
          </div>

          <a
            href={marketUrl}
            target="_top"
            rel="noreferrer"
            className="hidden shrink-0 rounded-full border border-zinc-200 p-2 text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 sm:inline-flex"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              <span>Po {yesProbability.toFixed(0)}%</span>
              <span>Jo {(100 - yesProbability).toFixed(0)}%</span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full bg-emerald-500" style={{ width: `${yesProbability}%` }} />
              <div className="h-full bg-rose-500" style={{ width: `${100 - yesProbability}%` }} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-zinc-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Volumi</p>
              <p className="mt-1 font-mono text-base font-semibold text-zinc-900">{totalPool.toLocaleString()} SI</p>
            </div>
            <div className="rounded-2xl bg-zinc-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Po</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">{yesOdds.toFixed(2)}x</p>
            </div>
            <div className="rounded-2xl bg-zinc-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Jo</p>
              <p className="mt-1 text-lg font-semibold text-rose-700">{noOdds.toFixed(2)}x</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Timer className="h-4 w-4 text-zinc-400" />
              {market.status === "open"
                ? `Mbyllet ${formatDistanceToNow(new Date(market.end_time), { addSuffix: true, locale: sq })}`
                : "Ky treg nuk eshte me i hapur"}
            </div>
            <Button asChild className="rounded-full px-5">
              <a href={marketUrl} target="_top" rel="noreferrer">
                Parashiko tani
              </a>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
