import { cn } from "@/lib/utils";
import { Truck, ShoppingBag, UserCheck, UserX, Navigation, Clock } from "lucide-react";
import type { Order } from "@/types/order";

export type { Order };

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  accepted: "bg-info/10 text-info",
  ready: "bg-primary/10 text-primary",
  completed: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const riderIcons = {
  assigned: { icon: UserCheck, className: "text-primary", label: "Rider assigned" },
  unassigned: { icon: UserX, className: "text-destructive", label: "No rider" },
  enroute: { icon: Navigation, className: "text-warning", label: "Rider en route" },
  pickedup: { icon: Navigation, className: "text-primary", label: "Picked up" },
  delivered: { icon: UserCheck, className: "text-primary", label: "Delivered" },
};

interface OrderCardProps {
  order: Order;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onMarkReady?: (id: string) => void;
  isHistory?: boolean;
  actionLoading?: string | null;
}

const OrderCard = ({ order, onAccept, onReject, onMarkReady, isHistory, actionLoading }: OrderCardProps) => {
  const rider = riderIcons[order.riderStatus];
  const RiderIcon = rider.icon;

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm animate-fade-in-up border border-border/50 hover:border-primary/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono font-medium">{order.id}</span>
            <span>·</span>
            <span>{order.customer}</span>
          </div>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{order.item}</p>
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize", statusStyles[order.orderStatus])}>
          {order.orderStatus}
        </span>
      </div>

      <div className="my-3 h-px bg-border" />

      {/* Details */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-foreground">{order.amount}</p>
          <p className="text-[10px] text-muted-foreground">{order.quantity}</p>
        </div>
        {!isHistory ? (
          <div className="flex items-center gap-3">
            <span className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
              order.type === "delivery" ? "bg-info/10 text-info" : "bg-primary/10 text-primary"
            )}>
              {order.type === "delivery" ? <Truck size={10} /> : <ShoppingBag size={10} />}
              {order.type === "delivery" ? "Delivery" : "Pickup"}
            </span>
            <span className={cn("flex items-center gap-1 text-[10px] font-medium", rider.className)}>
              <RiderIcon size={10} />
              {rider.label}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground capitalize">{order.type}</span>
        )}
      </div>

      {/* Footer */}
      {!isHistory && (
        <>
          <div className="my-3 h-px bg-border" />
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-muted-foreground">
              <span>Ordered {order.orderedAt}</span>
              {order.expiresIn && order.orderStatus === "pending" && (
                <span className="ml-2 font-semibold text-destructive animate-pulse-red">
                  Expires in {order.expiresIn}
                </span>
              )}
              {order.prepTimeLeft && order.orderStatus === "accepted" && (
                <span className="ml-2 inline-flex items-center gap-1 text-primary font-medium">
                  <Clock size={10} />
                  Preparing · {order.prepTimeLeft} left
                </span>
              )}
              {order.orderStatus === "ready" && (
                <span className="ml-2 inline-flex items-center gap-1 text-primary font-medium">
                  Ready for Pickup
                </span>
              )}
            </div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {order.orderStatus === "pending" && (
                <>
                  <button
                    onClick={() => onReject?.(order.id)}
                    disabled={!!actionLoading}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {actionLoading === `reject-${order.id}` ? <LoadingSpinner /> : "Reject"}
                  </button>
                  <button
                    onClick={() => onAccept?.(order.id)}
                    disabled={!!actionLoading}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground active:scale-95 transition-transform shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {actionLoading === `accept-${order.id}` ? <LoadingSpinner /> : "Accept"}
                  </button>
                </>
              )}
              {order.orderStatus === "accepted" && (
                <button
                  onClick={() => onMarkReady?.(order.id)}
                  disabled={!!actionLoading}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground active:scale-95 transition-transform shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {actionLoading === `ready-${order.id}` ? <LoadingSpinner /> : "Mark Ready"}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="mx-auto h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
);

export default OrderCard;
