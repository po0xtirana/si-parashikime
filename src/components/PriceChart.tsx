import { usePriceHistory } from "@/hooks/useMarkets";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export default function PriceChart({ marketId }: { marketId: string }) {
  const { data: history, isLoading } = usePriceHistory(marketId);

  if (isLoading) {
    return <div className="h-48 rounded-lg bg-muted animate-pulse" />;
  }

  if (!history || history.length === 0) {
    return (
      <div className="h-48 rounded-lg bg-card border border-border flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Asnjë e dhënë çmimi ende. Vendosni baste mbi 100 SI për të gjeneruar të dhëna.</p>
      </div>
    );
  }

  const chartData = history.map((h) => ({
    time: format(new Date(h.timestamp), "MMM d HH:mm"),
    probability: Number(h.yes_probability),
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h4 className="text-sm font-serif font-semibold mb-3 text-muted-foreground">Probabiliteti PO Ndër Kohë</h4>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 0%, 5%)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(0, 0%, 5%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fill: "hsl(0, 0%, 45%)", fontSize: 10 }}
            axisLine={{ stroke: "hsl(0, 0%, 90%)" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "hsl(0, 0%, 45%)", fontSize: 10 }}
            axisLine={{ stroke: "hsl(0, 0%, 90%)" }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(0, 0%, 100%)",
              border: "1px solid hsl(0, 0%, 90%)",
              borderRadius: "6px",
              color: "hsl(0, 0%, 5%)",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, "Probabiliteti PO"]}
          />
          <Area
            type="monotone"
            dataKey="probability"
            stroke="hsl(0, 0%, 5%)"
            strokeWidth={2}
            fill="url(#probGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
