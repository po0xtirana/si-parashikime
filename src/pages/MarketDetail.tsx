import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { sq } from "date-fns/locale";
import { Clock, ExternalLink, Newspaper, Users } from "lucide-react";

import BettingPanel from "@/components/BettingPanel";
import PriceChart from "@/components/PriceChart";
import { calculateOdds, useMarket, useMarketBets } from "@/hooks/useMarkets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const categoryLabels: Record<string, string> = {
  Politics: "Politike",
  Sports: "Sport",
  Economy: "Ekonomi",
  Entertainment: "Argetim",
  Technology: "Teknologji",
  Other: "Te tjera",
};

function getArticleHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Burim i lidhur";
  }
}

export default function MarketDetail() {
  const [selectedPrediction, setSelectedPrediction] = useState<boolean | null>(null);
  const [spotlightKey, setSpotlightKey] = useState(0);
  const bettingPanelRef = useRef<HTMLDivElement | null>(null);
  const { id } = useParams<{ id: string }>();
  const { data: market, isLoading } = useMarket(id!);
  const { data: bets } = useMarketBets(id!);

  if (isLoading || !market) {
    return (
      <div className="container py-8">
        <div className="h-64 rounded-lg border border-border bg-card animate-pulse" />
      </div>
    );
  }

  const { yesOdds, noOdds, yesProbability } = calculateOdds(
    market.total_yes,
    market.total_no,
    market.seed_yes,
    market.seed_no
  );
  const totalPool = market.total_yes + market.total_no;
  const articleHost = market.article_url ? getArticleHost(market.article_url) : null;

  const handlePredictionShortcut = (nextPrediction: boolean) => {
    setSelectedPrediction(nextPrediction);
    setSpotlightKey((current) => current + 1);
    bettingPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <Badge variant="outline" className="mb-3">
              {categoryLabels[market.category] || market.category}
            </Badge>
            <h1 className="mb-3 font-serif text-3xl font-bold leading-tight">{market.title}</h1>
            {market.description && (
              <p className="leading-relaxed text-muted-foreground">{market.description}</p>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {market.status === "open"
                  ? `Mbyllet ${formatDistanceToNow(new Date(market.end_time), {
                      addSuffix: true,
                      locale: sq,
                    })}`
                  : format(new Date(market.end_time), "PPP")}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {bets?.length ?? 0} parashikime
              </span>
              <span className="font-mono">{totalPool.toLocaleString()} SI ne pool</span>
            </div>
          </div>

          {market.image_url && (
            <img src={market.image_url} alt="" className="h-64 w-full rounded-lg object-cover" />
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handlePredictionShortcut(true)}
              className="rounded-lg border border-border p-4 text-center transition-all hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-md"
            >
              <p className="mb-1 text-sm text-muted-foreground">PO</p>
              <p className="text-3xl font-mono font-bold text-success">{yesOdds.toFixed(2)}x</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {yesProbability.toFixed(0)}% besueshmeri
              </p>
            </button>
            <button
              type="button"
              onClick={() => handlePredictionShortcut(false)}
              className="rounded-lg border border-border p-4 text-center transition-all hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-md"
            >
              <p className="mb-1 text-sm text-muted-foreground">JO</p>
              <p className="text-3xl font-mono font-bold text-danger">{noOdds.toFixed(2)}x</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {(100 - yesProbability).toFixed(0)}% besueshmeri
              </p>
            </button>
          </div>

          <PriceChart marketId={market.id} />

          {bets && bets.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-4 font-serif text-lg font-semibold">Parashikimet e Fundit</h3>
              <div className="space-y-2">
                {bets.slice(0, 10).map((bet) => (
                  <div
                    key={bet.id}
                    className="flex items-center justify-between border-b border-border py-2 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-mono font-bold ${
                          bet.prediction ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                        }`}
                      >
                        {bet.prediction ? "PO" : "JO"}
                      </span>
                      <span className="text-sm font-mono">
                        {Number(bet.amount).toLocaleString()} SI
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-muted-foreground">
                        me {Number(bet.odds_at_time_of_bet).toFixed(2)}x
                      </span>
                      <p className="text-xs text-muted-foreground/60">
                        {formatDistanceToNow(new Date(bet.created_at), {
                          addSuffix: true,
                          locale: sq,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {market.article_url && (
            <Card className="overflow-hidden border-border/80 bg-gradient-to-br from-card via-card to-secondary/30 shadow-md">
              <CardContent className="p-0">
                <div className="border-b border-border/70 bg-muted/40 px-5 py-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    <Newspaper className="h-4 w-4" />
                    Kontekst Editorial
                  </div>
                </div>
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-2">
                    <p className="font-serif text-2xl font-semibold leading-tight">
                      Lexo artikullin e lidhur me kete treg
                    </p>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                      Ky treg mbeshtetet nga raportim redaksional. Hape artikullin per me shume
                      kontekst, burime dhe zhvillimet qe e bejne kete pyetje me interesante.
                    </p>
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground/80">
                      Burimi: {articleHost}
                    </p>
                  </div>
                  <Button asChild size="lg" className="gap-2 self-start sm:self-auto">
                    <a href={market.article_url} target="_blank" rel="noreferrer">
                      Hap Artikullin
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <div className="border-t border-border/70 bg-background/80 p-3 sm:p-4">
                  <div className="overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm">
                    <iframe
                      src={market.article_url}
                      title={`Artikull i lidhur per ${market.title}`}
                      className="h-[560px] w-full md:h-[720px]"
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    Nese artikulli nuk shfaqet ne menyre te plote ne kete pamje, perdor butonin
                    "Hap Artikullin" per ta lexuar ne faqen origjinale.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div ref={bettingPanelRef} className="sticky top-20">
            <BettingPanel
              market={market}
              selectedPrediction={selectedPrediction}
              spotlightKey={spotlightKey}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
