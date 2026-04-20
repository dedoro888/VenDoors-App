import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, TrendingUp, Receipt, Calculator, Percent, Banknote, ChevronDown, ArrowDownToLine, ArrowUpFromLine, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const dateRanges = ["Today", "This Week", "This Month", "All time"] as const;

interface Wallet {
  available_balance: number;
  pending_balance: number;
  lifetime_earnings: number;
}

interface Transaction {
  id: string;
  reference: string;
  type: "sale" | "payout" | "refund" | "adjustment";
  status: "pending" | "completed" | "failed";
  net_amount: number;
  gross_amount: number;
  commission_amount: number;
  created_at: string;
  description: string | null;
}

const formatNgn = (n: number) =>
  `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const COMMISSION_RATE = 0.10;

const Earnings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRange, setSelectedRange] = useState<string>("This Week");
  const [filterOpen, setFilterOpen] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const refresh = async () => {
    if (!user) return;
    const [{ data: w }, { data: t }] = await Promise.all([
      supabase.from("wallets").select("available_balance, pending_balance, lifetime_earnings").eq("user_id", user.id).maybeSingle(),
      supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    if (w) setWallet(w as Wallet);
    if (t) setTransactions(t as Transaction[]);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [user]);

  // Demo helper: simulate a sale so vendors can see commission deduction in action
  const simulateSale = async () => {
    if (!user) return;
    setSeeding(true);
    const gross = 5000 + Math.floor(Math.random() * 8000);
    const commission = Math.round(gross * COMMISSION_RATE * 100) / 100;
    const net = gross - commission;

    const { error: txError } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "sale",
      status: "completed",
      gross_amount: gross,
      commission_rate: COMMISSION_RATE,
      commission_amount: commission,
      net_amount: net,
      sender: "Customer",
      receiver: "Vendor Wallet",
      description: "Simulated sale (demo)",
    });

    if (!txError) {
      const newAvail = (wallet?.available_balance ?? 0) + net;
      const newLife = (wallet?.lifetime_earnings ?? 0) + net;
      await supabase.from("wallets").update({
        available_balance: newAvail,
        lifetime_earnings: newLife,
      }).eq("user_id", user.id);

      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "payment",
        title: `Sale received: ${formatNgn(net)}`,
        description: `${formatNgn(gross)} − ${formatNgn(commission)} commission`,
        link: "/earnings",
      });

      toast({ title: "Sale recorded", description: `${formatNgn(net)} added to wallet` });
      await refresh();
    }
    setSeeding(false);
  };

  const requestPayout = async () => {
    if (!user || !wallet || wallet.available_balance <= 0) return;
    setRequesting(true);
    const amount = wallet.available_balance;

    const { data: txn } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "payout",
      status: "pending",
      gross_amount: amount,
      commission_amount: 0,
      net_amount: amount,
      sender: "Vendor Wallet",
      receiver: "Bank Account",
      description: "Manual payout request",
    }).select().single();

    await supabase.from("wallets").update({
      available_balance: 0,
      pending_balance: (wallet.pending_balance ?? 0) + amount,
    }).eq("user_id", user.id);

    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "payment",
      title: `Payout requested: ${formatNgn(amount)}`,
      description: "Funds will arrive within 24 hours.",
      link: txn ? `/earnings/transactions/${txn.id}` : "/earnings",
    });

    toast({ title: "Payout requested", description: `${formatNgn(amount)} is on its way.` });
    await refresh();
    setRequesting(false);
  };

  const today = new Date().toDateString();
  const dailyEarnings = transactions
    .filter((t) => t.type === "sale" && new Date(t.created_at).toDateString() === today)
    .reduce((sum, t) => sum + Number(t.net_amount), 0);

  const totalSales = transactions.filter((t) => t.type === "sale");
  const totalCount = totalSales.length;
  const avgOrder = totalCount ? totalSales.reduce((s, t) => s + Number(t.net_amount), 0) / totalCount : 0;
  const totalCommission = totalSales.reduce((s, t) => s + Number(t.commission_amount), 0);

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
                  selectedRange === range ? "bg-primary/10 font-medium text-primary" : "text-foreground hover:bg-muted"
                )}
              >
                {range}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Wallet Card */}
      <div className="px-4">
        <div className="animate-fade-in-up rounded-2xl bg-secondary p-5 shadow-sm">
          <p className="text-xs font-medium text-secondary-foreground/60">Available Balance</p>
          <p className="mt-1 text-3xl font-bold text-secondary-foreground tabular-nums">
            {loading ? "—" : formatNgn(wallet?.available_balance ?? 0)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-xl bg-secondary-foreground/10 p-2.5">
              <p className="text-[10px] text-secondary-foreground/60">Today</p>
              <p className="text-sm font-bold text-secondary-foreground">{formatNgn(dailyEarnings)}</p>
            </div>
            <div className="rounded-xl bg-secondary-foreground/10 p-2.5">
              <p className="text-[10px] text-secondary-foreground/60">Pending</p>
              <p className="text-sm font-bold text-secondary-foreground">{formatNgn(wallet?.pending_balance ?? 0)}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={requestPayout}
              disabled={requesting || !wallet || wallet.available_balance <= 0}
              className="flex-1"
            >
              {requesting ? "Requesting…" : "Request Payout"}
            </Button>
            <Button size="sm" variant="outline" onClick={simulateSale} disabled={seeding} className="gap-1.5">
              <Plus size={14} /> Sale
            </Button>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="mt-4 px-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-card p-3 shadow-sm">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Receipt size={16} className="text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground tabular-nums">{totalCount}</p>
            <p className="text-[10px] font-medium text-muted-foreground">Sales Recorded</p>
          </div>
          <div className="rounded-2xl bg-card p-3 shadow-sm">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Calculator size={16} className="text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground tabular-nums">{formatNgn(avgOrder)}</p>
            <p className="text-[10px] font-medium text-muted-foreground">Avg Order Value</p>
          </div>
          <div className="rounded-2xl bg-card p-3 shadow-sm">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-warning/10">
              <Percent size={16} className="text-warning" />
            </div>
            <p className="text-lg font-bold text-foreground tabular-nums">{formatNgn(totalCommission)}</p>
            <p className="text-[10px] font-medium text-muted-foreground">Platform Fee (10%)</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-5 px-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Recent Transactions</p>
          {transactions.length > 0 && (
            <span className="text-[10px] text-muted-foreground">Tap for details + QR</span>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-2xl bg-card p-6 text-center shadow-sm">
            <Banknote size={28} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No transactions yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Tap "Sale" above to simulate one.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {transactions.map((t) => {
              const isInbound = t.type === "sale" || t.type === "adjustment";
              return (
                <li key={t.id}>
                  <button
                    onClick={() => navigate(`/earnings/transactions/${t.id}`)}
                    className="w-full flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm active:scale-[0.99] transition-transform text-left"
                  >
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      isInbound ? "bg-success/10" : "bg-warning/10"
                    )}>
                      {isInbound ? (
                        <ArrowDownToLine size={16} className="text-success" />
                      ) : (
                        <ArrowUpFromLine size={16} className="text-warning" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground capitalize truncate">
                        {t.type} {t.type === "sale" ? "received" : ""}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(t.created_at), "MMM d, p")} · <span className="font-mono">{t.reference}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-bold", isInbound ? "text-success" : "text-warning")}>
                        {isInbound ? "+" : "−"}{formatNgn(Number(t.net_amount))}
                      </p>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-semibold",
                        t.status === "completed" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                      )}>{t.status}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground px-4">
        Commission ({Math.round(COMMISSION_RATE * 100)}%) is deducted automatically before payout.
      </p>
    </div>
  );
};

export default Earnings;
