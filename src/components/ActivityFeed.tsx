import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { sq } from "date-fns/locale";
import { Activity, Dot } from "lucide-react";

import { calculateOdds, useRecentBets } from "@/hooks/useMarkets";

function getInitials(username: string) {
  return username
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ActivityFeed() {
  const { data: bets, isLoading } = useRecentBets();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-2xl bg-zinc-100" />
        ))}
      </div>
    );
  }

  if (!bets || bets.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">
        Ende nuk ka aktivitet. Parashikimi i pare do ta ndeze kete panel.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-950">Aktivitet live</p>
            <p className="text-xs text-zinc-500">Levizjet e fundit te parashikimeve</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <Dot className="h-5 w-5" />
          Ne kohe reale
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {bets.slice(0, 8).map((bet) => {
            const market = bet.markets as Record<string, unknown> | null;
            const profile = bet.profiles as Record<string, unknown> | null;
            const username = bet.is_public ? String(profile?.username ?? "Anonim") : "Anonim";
            const totalYes = Number(market?.total_yes ?? 0);
            const totalNo = Number(market?.total_no ?? 0);
            const seedYes = Number(market?.seed_yes ?? 500);
            const seedNo = Number(market?.seed_no ?? 500);
            const { yesOdds, noOdds } = calculateOdds(totalYes, totalNo, seedYes, seedNo);
            const odds = bet.prediction ? yesOdds : noOdds;

            return (
              <motion.div
                key={bet.id}
                layout
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700">
                    {getInitials(username)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-6 text-zinc-800">
                      <span className="font-semibold">{username}</span>
                      {" vendosi "}
                      <span className="font-mono font-semibold">
                        {Number(bet.amount).toLocaleString()} SI
                      </span>
                      {" tek "}
                      <span
                        className={bet.prediction ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}
                      >
                        {bet.prediction ? "Po" : "Jo"}
                      </span>
                    </p>
                    <p className="truncate text-sm text-zinc-500">
                      {String(market?.title ?? "Treg i panjohur")} me {odds.toFixed(2)}x
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {formatDistanceToNow(new Date(bet.created_at), { addSuffix: true, locale: sq })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
