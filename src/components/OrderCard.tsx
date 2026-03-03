import { cn } from "@/lib/utils";
import { Truck, ShoppingBag, UserCheck, UserX, Navigation, Clock } from "lucide-react";

export interface Order {
  id: string;
  customer: string;
  item: string;
  status: "pending" | "accepted" | "preparing" | "completed" | "rejected";
  amount: string;
  quantity: string;
  type: "delivery" | "pickup";
  riderStatus: "assigned" | "unassigned" | "enroute";
  orderedAt: string;
  expiresIn?: string;
  prepTimeLeft?: string;
}

const statusStyles = {
  pending: "bg-warning/10 text-warning",
  accepted: "bg-info/10 text-info",
  preparing: "bg-warning/10 text-warning",
  completed: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
};

const riderIcons = {
  assigned: { icon: UserCheck, className: "text-primary", label: "Rider assigned" },
  unassigned: { icon: UserX, className: "text-destructive", label: "No rider" },
  enroute: { icon: Navigation, className: "text-warning", label: "Rider en route" },
};

interface OrderCardProps {
  order: Order;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onMarkReady?: (id: string) => void;
  isHistory?: boolean;
}

const OrderCard = ({ order, onAccept, onReject, onMarkReady, isHistory }: OrderCardProps) => {
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
        <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize", statusStyles[order.status])}>
          {order.status}
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
              {order.expiresIn && (
                <span className="ml-2 font-semibold text-destructive animate-pulse-red">
                  Expires in {order.expiresIn}
                </span>
              )}
              {order.prepTimeLeft && (
                <span className="ml-2 inline-flex items-center gap-1 text-primary font-medium">
                  <Clock size={10} />
                  Preparing · {order.prepTimeLeft} left
                </span>
              )}
            </div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {order.status === "pending" && (
                <>
                  <button
                    onClick={() => onReject?.(order.id)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground active:scale-95 transition-transform"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onAccept?.(order.id)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground active:scale-95 transition-transform shadow-lg shadow-primary/20"
                  >
                    Accept
                  </button>
                </>
              )}
              {order.status === "accepted" && (
                <button
                  onClick={() => onMarkReady?.(order.id)}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground active:scale-95 transition-transform shadow-lg shadow-primary/20"
                >
                  Mark Ready
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderCard;
