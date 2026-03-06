import { useState } from "react";
import { Calendar, TrendingUp, TrendingDown, Receipt, Calculator, Percent, Banknote, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import WeeklyChart from "@/components/WeeklyChart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const dateRanges = ["Today", "Yesterday", "This Week", "This Month"] as const;

const payouts = [
  { amount: "₦45,000", bank: "GTBank", date: "Aug 24, 2026", status: "completed" as const },
  { amount: "₦32,500", bank: "Access Bank", date: "Aug 17, 2026", status: "completed" as const },
  { amount: "₦28,000", bank: "GTBank", date: "Aug 10, 2026", status: "processing" as const },
];

const Earnings = () => {
  const [selectedRange, setSelectedRange] = useState<string>("This Week");
  const [filterOpen, setFilterOpen] = useState(false);

  const earningsUp = true;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold text-foreground">Earnings</h1>
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-xl bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm">
              <Calendar size={14} />
              {selectedRange}
              <ChevronDown size={12} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1" align="end">
            {dateRanges.map((range) => (
              <button
                key={range}
                onClick={() => { setSelectedRange(range); setFilterOpen(false); }}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  selectedRange === range
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {range}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Total Earnings Card */}
      <div className="px-4">
        <div className="animate-fade-in-up rounded-2xl bg-secondary p-5 shadow-sm">
          <p className="text-xs font-medium text-secondary-foreground/60">Total Earnings</p>
          <p className="mt-1 text-3xl font-bold text-secondary-foreground tabular-nums">₦85,430</p>
          <p className="mt-1 text-xs text-secondary-foreground/50">From 42 completed orders</p>
          <div className="mt-3 flex items-center gap-1">
            {earningsUp ? (
              <TrendingUp size={14} className="text-primary" />
            ) : (
              <TrendingDown size={14} className="text-destructive" />
            )}
            <span className={cn("text-xs font-medium", earningsUp ? "text-primary" : "text-destructive")}>
              {earningsUp ? "↑" : "↓"} 12% from last week
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="mt-4 px-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="animate-fade-in-up stagger-1 rounded-2xl bg-card p-3 shadow-sm">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Receipt size={16} className="text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground tabular-nums">42</p>
            <p className="text-[10px] font-medium text-muted-foreground">Orders Completed</p>
          </div>

          <div className="animate-fade-in-up stagger-2 rounded-2xl bg-card p-3 shadow-sm">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Calculator size={16} className="text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground tabular-nums">₦2,035</p>
            <p className="text-[10px] font-medium text-muted-foreground">Avg Order Value</p>
          </div>

          <div className="animate-fade-in-up stagger-3 rounded-2xl bg-card p-3 shadow-sm">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-warning/10">
              <Percent size={16} className="text-warning" />
            </div>
            <p className="text-lg font-bold text-foreground tabular-nums">₦6,300</p>
            <p className="text-[10px] font-medium text-muted-foreground">Platform Fee</p>
          </div>
        </div>
      </div>

      {/* Weekly Earnings Chart */}
      <div className="mt-5 px-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-foreground">Weekly Earnings</p>
          <WeeklyChart />
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="mt-5 px-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Recent Payouts</p>
        <div className="space-y-3">
          {payouts.map((payout, i) => (
            <div
              key={i}
              className={cn("animate-fade-in-up flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm", i === 0 && "stagger-1", i === 1 && "stagger-2", i === 2 && "stagger-3")}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Banknote size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{payout.amount} Paid Out</p>
                <p className="text-xs text-muted-foreground">Sent to {payout.bank} · {payout.date}</p>
              </div>
              <span className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                payout.status === "completed"
                  ? "bg-primary/10 text-primary"
                  : "bg-warning/10 text-warning"
              )}>
                {payout.status === "completed" ? "Completed" : "Processing"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Auto Payout Notice */}
      <div className="mt-5 px-4">
        <p className="text-center text-xs text-muted-foreground">
          Payouts are processed automatically every Monday.
        </p>
      </div>
    </div>
  );
};

export default Earnings;
