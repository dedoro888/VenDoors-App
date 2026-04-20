import { ArrowLeft, Bell, ShoppingBag, Wallet, User, Info, Check, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useNotifications, type NotificationType } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  order: { icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
  payment: { icon: Wallet, color: "text-success", bg: "bg-success/10" },
  profile: { icon: User, color: "text-info", bg: "bg-info/10" },
  system: { icon: Info, color: "text-muted-foreground", bg: "bg-muted" },
};

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markRead, markAllRead, resolve } = useNotifications();

  const handleTap = async (id: string, link: string | null, resolved: boolean) => {
    if (resolved) return;
    await markRead(id);
    if (link) navigate(link);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur-md px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:bg-muted/70"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Notifications</h1>
            <p className="text-[11px] text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-[11px] font-medium text-foreground active:scale-95 transition-transform"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Bell size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No notifications yet</p>
            <p className="mt-1 text-xs text-muted-foreground">You'll see order updates, payouts, and system messages here.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => {
              const cfg = typeConfig[n.type];
              const Icon = cfg.icon;
              const isResolved = !!n.resolved_at;
              const isUnread = !n.read_at;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => handleTap(n.id, n.link, isResolved)}
                    disabled={isResolved}
                    className={cn(
                      "w-full flex items-start gap-3 rounded-2xl border p-3 text-left transition-colors",
                      isResolved
                        ? "bg-muted/30 border-border/50 opacity-60 cursor-default"
                        : "bg-card border-border active:scale-[0.99] active:bg-muted/50",
                      isUnread && !isResolved && "border-l-4 border-l-primary"
                    )}
                  >
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl shrink-0", cfg.bg)}>
                      {isResolved ? (
                        <Check size={16} className="text-muted-foreground" />
                      ) : (
                        <Icon size={16} className={cfg.color} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-semibold", isResolved ? "text-muted-foreground" : "text-foreground")}>
                          {n.title}
                        </p>
                        {isUnread && !isResolved && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      {n.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.description}</p>
                      )}
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </span>
                        {!isResolved && (
                          <button
                            onClick={(e) => { e.stopPropagation(); resolve(n.id); }}
                            className="text-[10px] font-medium text-primary active:opacity-70"
                          >
                            Mark resolved
                          </button>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
