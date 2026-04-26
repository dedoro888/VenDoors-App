import { useEffect, useState } from "react";
import { ChevronDown, Package, DollarSign, Clock } from "lucide-react";
import ToggleSwitch from "@/components/ToggleSwitch";
import WeeklyChart from "@/components/WeeklyChart";
import NotificationBell from "@/components/NotificationBell";
import StoreStatusIndicator from "@/components/StoreStatusIndicator";
import SetupChecklist from "@/components/SetupChecklist";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { storeOpen, setStoreOpen, scheduleOpen } = useStore();
  const { user } = useAuth();
  const [weeklyExpanded, setWeeklyExpanded] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("logo_url")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) setLogoUrl(data?.logo_url ?? null);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const businessInitials = (user?.user_metadata?.business_name || user?.email || "VV")
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  const firstName = (user?.user_metadata?.business_name || user?.email?.split("@")[0] || "Vendor").split(" ")[0];

  return (
    <div className="pb-24">
      {/* Header — bell on the LEFT */}
      <div className="bg-secondary px-5 pb-6 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div>
              <p className="text-sm text-secondary-foreground/70">{greeting}, {firstName}</p>
              <p className="text-xs text-secondary-foreground/50">Here's your store overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StoreStatusIndicator />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                businessInitials
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Setup Checklist (only shows if setup not completed) */}
      <SetupChecklist />

      {/* Business Insights — Avg Rating, Orders, Regional Rank */}
      <PerformanceMetrics />

      {/* Store Status */}
      <div className="px-4 mt-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Store Status</p>
              <p className="text-xs text-muted-foreground">
                {storeOpen ? "You are currently accepting orders" : "Your store is currently closed"}
              </p>
              {!scheduleOpen && storeOpen && (
                <p className="mt-1 text-[10px] text-warning">Outside scheduled hours — open manually</p>
              )}
            </div>
            <ToggleSwitch checked={storeOpen} onToggle={setStoreOpen} />
          </div>
        </div>
      </div>

      {/* Today's Performance */}
      <div className="px-4 mt-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Today's Performance</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="animate-fade-in-up stagger-1 rounded-2xl bg-card p-4 shadow-sm active:scale-[0.98] transition-transform">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Package size={18} className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">0</p>
            <p className="text-xs font-medium text-foreground">Orders Today</p>
            <p className="text-[10px] text-muted-foreground">Completed & Accepted</p>
          </div>
          <div className="animate-fade-in-up stagger-2 rounded-2xl bg-card p-4 shadow-sm active:scale-[0.98] transition-transform">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-success/10">
              <DollarSign size={18} className="text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">₦<span>0</span></p>
            <p className="text-xs font-medium text-foreground">Revenue Today</p>
            <p className="text-[10px] text-muted-foreground">Net of commission</p>
          </div>
        </div>
        <div className="mt-3 animate-fade-in-up stagger-3 rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Clock size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs font-medium text-foreground">Pending Orders</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground">Awaiting response</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="px-4 mt-5">
        <div className="rounded-2xl bg-card shadow-sm overflow-hidden border border-border/50">
          <button
            onClick={() => setWeeklyExpanded(!weeklyExpanded)}
            className="flex w-full items-center justify-between p-4"
          >
            <div>
              <p className="text-base font-bold text-foreground">Weekly Summary</p>
              <div className="mt-1.5 flex gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Orders </span>
                  <span className="text-sm font-bold text-foreground">29</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Revenue </span>
                  <span className="text-sm font-bold text-primary">₦284K</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-medium">
              {weeklyExpanded ? "Collapse" : "Expand"}
              <ChevronDown size={14} className={cn("transition-transform duration-300", weeklyExpanded && "rotate-180")} />
            </div>
          </button>

          <div className={cn("overflow-hidden transition-all duration-300", weeklyExpanded ? "max-h-[300px] pb-4" : "max-h-0")}>
            <div className="px-4">
              <WeeklyChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
