import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Package, Trophy, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type OrderRange = "lifetime" | "today" | "week" | "month";

const RANGE_LABELS: Record<OrderRange, string> = {
  lifetime: "Lifetime",
  today: "Today",
  week: "This Week",
  month: "This Month",
};

// Mock dataset — wire to real aggregates when orders/ratings tables ship.
const MOCK_METRICS = {
  avgRating: 4.6,
  reviewCount: 128,
  orders: { lifetime: 1245, today: 12, week: 87, month: 318 },
  region: "UniPort Area",
  rank: 3,
  percentile: 5,
};

const PerformanceMetrics = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState<OrderRange>("lifetime");
  const [rangeOpen, setRangeOpen] = useState(false);

  const orderCount = MOCK_METRICS.orders[range];

  return (
    <div className="px-4 mt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Business Insights</p>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {/* Avg Rating */}
        <button
          onClick={() => navigate("/insights/reviews")}
          className="text-left animate-fade-in-up stagger-1 rounded-2xl bg-card p-3 shadow-sm border border-border/50 active:scale-[0.98] transition-transform"
        >
          <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-warning/15">
            <Star size={14} className="text-warning" fill="currentColor" />
          </div>
          <p className="text-lg font-bold text-foreground tabular-nums leading-none">
            {MOCK_METRICS.avgRating.toFixed(1)}
            <span className="text-warning ml-0.5">★</span>
          </p>
          <p className="mt-1 text-[10px] font-medium text-foreground leading-tight">Avg Rating</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">({MOCK_METRICS.reviewCount} reviews)</p>
        </button>

        {/* Total Orders */}
        <div className="animate-fade-in-up stagger-2 rounded-2xl bg-card p-3 shadow-sm border border-border/50 active:scale-[0.98] transition-transform">
          <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
            <Package size={14} className="text-primary" />
          </div>
          <p className="text-lg font-bold text-foreground tabular-nums leading-none">
            {orderCount.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] font-medium text-foreground leading-tight">Orders</p>
          <button
            onClick={() => setRangeOpen((v) => !v)}
            className="mt-0.5 inline-flex items-center gap-0.5 text-[9px] text-muted-foreground active:text-foreground"
          >
            {RANGE_LABELS[range]}
            <ChevronDown size={9} className={cn("transition-transform", rangeOpen && "rotate-180")} />
          </button>
          {rangeOpen && (
            <div className="mt-1.5 space-y-0.5 animate-fade-in-up">
              {(Object.keys(RANGE_LABELS) as OrderRange[]).map((k) => (
                <button
                  key={k}
                  onClick={() => { setRange(k); setRangeOpen(false); }}
                  className={cn(
                    "block w-full rounded-md px-1.5 py-0.5 text-left text-[9px] transition-colors",
                    range === k ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground active:bg-muted"
                  )}
                >
                  {RANGE_LABELS[k]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Regional Rank */}
        <button
          onClick={() => navigate("/insights/rankings")}
          className="text-left animate-fade-in-up stagger-3 rounded-2xl bg-card p-3 shadow-sm border border-border/50 active:scale-[0.98] transition-transform"
        >
          <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-success/15">
            <Trophy size={14} className="text-success" />
          </div>
          <p className="text-lg font-bold text-foreground tabular-nums leading-none">
            #{MOCK_METRICS.rank}
          </p>
          <p className="mt-1 text-[10px] font-medium text-foreground leading-tight truncate">
            in {MOCK_METRICS.region}
          </p>
          <p className="text-[9px] text-success mt-0.5 font-medium">Top {MOCK_METRICS.percentile}%</p>
        </button>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
