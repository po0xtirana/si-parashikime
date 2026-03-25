import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUpRight, Clock3, Filter, Layers3, Sparkles, TrendingUp } from "lucide-react";

import ActivityFeed from "@/components/ActivityFeed";
import MarketCard from "@/components/MarketCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMarkets } from "@/hooks/useMarkets";

const categoryLabels: Record<string, string> = {
  All: "Te gjitha",
  Politics: "Politike",
  Sports: "Sport",
  Economy: "Ekonomi",
  Entertainment: "Argetim",
  Technology: "Teknologji",
  Other: "Te tjera",
};

const categories = Object.keys(categoryLabels);

const statuses = [
  { value: "", label: "Te gjitha" },
  { value: "open", label: "Hapur" },
  { value: "locked", label: "Bllokuar" },
  { value: "resolved", label: "Zgjidhur" },
];

const statusPriority: Record<string, number> = {
  open: 0,
  locked: 1,
  resolved: 2,
};

export default function Index() {
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const { data: markets, isLoading } = useMarkets(status || undefined);

  const filteredMarkets = useMemo(() => {
    const filtered = (markets ?? []).filter((market) => {
      const matchesCategory = category === "All" || market.category === category;
      const haystack = `${market.title} ${market.description ?? ""}`.toLowerCase();
      const matchesSearch = !searchQuery || haystack.includes(searchQuery);

      const resolvedMoreThanOneDayAgo =
        market.status === "resolved" &&
        Date.now() - new Date(market.updated_at).getTime() >= 1000 * 60 * 60 * 24;

      const shouldHideFromHomepage = !status && resolvedMoreThanOneDayAgo;

      return matchesCategory && matchesSearch && !shouldHideFromHomepage;
    });

    if (status) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const statusDelta = (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99);
      if (statusDelta !== 0) {
        return statusDelta;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [category, markets, searchQuery, status]);

  const dashboardStats = useMemo(() => {
    const source = markets ?? [];
    const openCount = source.filter((market) => market.status === "open").length;
    const closingSoonCount = source.filter((market) => {
      const delta = new Date(market.end_time).getTime() - Date.now();
      return market.status === "open" && delta > 0 && delta < 1000 * 60 * 60 * 48;
    }).length;
    const totalVolume = source.reduce((sum, market) => sum + market.total_yes + market.total_no, 0);

    return [
      {
        label: "Tregje te hapura",
        value: openCount.toString(),
        icon: Layers3,
      },
      {
        label: "Mbyllen shpejt",
        value: closingSoonCount.toString(),
        icon: Clock3,
      },
      {
        label: "Volum total",
        value: `${Math.round(totalVolume).toLocaleString()} SI`,
        icon: TrendingUp,
      },
    ];
  }, [markets]);

  return (
    <div className="container py-5 sm:py-7">
      <section className="rounded-[28px] border border-zinc-200/80 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Panel i tregjeve
            </div>
            <div className="space-y-3">
              <p className="max-w-2xl text-2xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                Mendimi yt ka vlere. Tregtoje.
              </p>
              <p className="max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
                Ndiq tregjet live, shiko levizjet e fundit dhe vendos parashikime direkt nga faqja kryesore.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[500px]">
            {dashboardStats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">{label}</p>
                  <Icon className="h-4 w-4 text-zinc-400" />
                </div>
                <p className="mt-3 text-xl font-semibold tracking-tight text-zinc-950">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  <Filter className="h-3.5 w-3.5" />
                  Filtra tregjesh
                </div>
                <div className="-mx-1 overflow-x-auto pb-1">
                  <div className="flex min-w-max flex-nowrap gap-2 px-1">
                    {categories.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCategory(item)}
                        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          category === item
                            ? "bg-zinc-950 text-white shadow-sm"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                        }`}
                      >
                        {categoryLabels[item]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 xl:min-w-[240px]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Statusi
                </p>
                <Select value={status || "__all__"} onValueChange={(value) => setStatus(value === "__all__" ? "" : value)}>
                  <SelectTrigger className="h-11 rounded-2xl border-zinc-200 bg-zinc-50 px-4 text-sm font-medium text-zinc-700 shadow-none focus:ring-zinc-300">
                    <SelectValue placeholder="Zgjidh statusin" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-200 bg-white">
                    {statuses.map((item) => (
                      <SelectItem
                        key={item.value || "__all__"}
                        value={item.value || "__all__"}
                        className="rounded-xl text-sm"
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {searchQuery && (
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                <p className="text-zinc-500">
                  Rezultatet per <span className="font-semibold text-zinc-900">"{searchQuery}"</span>
                </p>
                <ArrowUpRight className="h-4 w-4 text-zinc-400" />
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-72 animate-pulse rounded-[28px] bg-zinc-100" />
              ))}
            </div>
          ) : filteredMarkets.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredMarkets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-zinc-300 bg-white p-12 text-center">
              <p className="text-lg font-semibold text-zinc-900">Asnje treg nuk perputhet me filtrat.</p>
              <p className="mt-2 text-sm text-zinc-500">
                Provo nje kerkimi me te gjere ose kthehu te te gjitha kategorite.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="sticky top-28 rounded-[28px] border border-zinc-200/80 bg-zinc-50/80 p-5 shadow-sm backdrop-blur sm:p-6">
            <ActivityFeed />
          </div>
        </aside>
      </section>
    </div>
  );
}
