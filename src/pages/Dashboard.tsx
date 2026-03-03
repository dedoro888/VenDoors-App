import { useState } from "react";
import { Bell, ChevronDown, ChevronRight, Package, DollarSign, Clock, AlertCircle, CheckCircle, Info } from "lucide-react";
import ToggleSwitch from "@/components/ToggleSwitch";
import WeeklyChart from "@/components/WeeklyChart";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [storeOpen, setStoreOpen] = useState(true);
  const [weeklyExpanded, setWeeklyExpanded] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);

  const alerts = [
    {
      icon: AlertCircle,
      title: "2 orders waiting for approval",
      subtitle: "New delivery requests from Yaba",
      time: "2 mins ago",
      type: "pending" as const,
    },
    {
      icon: CheckCircle,
      title: "Payout processed",
      subtitle: "₦125,000 deposited to your account",
      time: "3 hours ago",
      type: "payout" as const,
    },
    {
      icon: Info,
      title: "Update your store hours",
      subtitle: "Weekend schedule needs confirmation",
      time: "Yesterday",
      type: "reminder" as const,
    },
  ];

  const alertStyles = {
    pending: "border-l-4 border-l-primary bg-primary-light",
    payout: "border-l-4 border-l-success bg-success-light",
    reminder: "border-l-4 border-l-info bg-info-light",
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-secondary px-5 pb-6 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-secondary-foreground/70">Good Evening, Amaka</p>
            <p className="text-xs text-secondary-foreground/50">Here's your store overview</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              AJ
            </div>
            <button className="relative">
              <Bell size={22} className="text-secondary-foreground" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                3
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Store Status */}
      <div className="px-4 -mt-3">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Store Status</p>
              <p className="text-xs text-muted-foreground">
                {storeOpen ? "You are currently accepting orders" : "Your store is currently closed"}
              </p>
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
            <p className="text-2xl font-bold text-foreground tabular-nums">
              ₦<span>0</span>
            </p>
            <p className="text-xs font-medium text-foreground">Revenue Today</p>
            <p className="text-[10px] text-muted-foreground">Before commission</p>
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
        <div className="rounded-2xl bg-card shadow-sm overflow-hidden">
          <button
            onClick={() => setWeeklyExpanded(!weeklyExpanded)}
            className="flex w-full items-center justify-between p-4"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">Weekly Summary</p>
              <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                <span>
                  Total Orders <span className="font-semibold text-foreground">29</span>
                </span>
                <span>
                  Total Revenue <span className="font-semibold text-foreground">₦284K</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-medium">
              View Breakdown
              <ChevronDown
                size={14}
                className={cn("transition-transform duration-300", weeklyExpanded && "rotate-180")}
              />
            </div>
          </button>

          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              weeklyExpanded ? "max-h-[300px] pb-4" : "max-h-0"
            )}
          >
            <div className="px-4">
              <WeeklyChart />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="px-4 mt-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Alerts</p>
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="text-xs text-primary font-medium"
          >
            {showAlerts ? "Hide" : "Show"}
          </button>
        </div>

        {showAlerts ? (
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={cn(
                  "animate-fade-in-up flex items-start gap-3 rounded-xl p-3",
                  alertStyles[alert.type],
                  i === 0 && "stagger-1",
                  i === 1 && "stagger-2",
                  i === 2 && "stagger-3"
                )}
              >
                <div className="mt-0.5">
                  <alert.icon size={18} className={cn(
                    alert.type === "pending" && "text-primary",
                    alert.type === "payout" && "text-success",
                    alert.type === "reminder" && "text-info"
                  )} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.subtitle}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{alert.time}</p>
                </div>
                {alert.type === "pending" && (
                  <ChevronRight size={16} className="mt-1 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle size={32} className="mb-2 text-success" />
            <p className="text-sm text-muted-foreground">You're all caught up 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
