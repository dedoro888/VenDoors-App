import { useState } from "react";
import { X, Truck, ShoppingBag, UserCheck, UserX, Navigation, Clock, Phone, MapPin, MessageSquare, Timer, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order } from "./OrderCard";

interface OrderDetailModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onMarkReady?: (id: string) => void;
}

const statusStyles = {
  pending: "bg-warning/10 text-warning",
  accepted: "bg-info/10 text-info",
  preparing: "bg-warning/10 text-warning",
  completed: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
};

const OrderDetailModal = ({ order, open, onClose, onAccept, onReject, onMarkReady }: OrderDetailModalProps) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [riderExpanded, setRiderExpanded] = useState(false);

  if (!order) return null;

  const handleAction = async (action: string, callback?: (id: string) => void) => {
    setActionLoading(action);
    await new Promise((r) => setTimeout(r, 800));
    callback?.(order.id);
    setActionLoading(null);
    onClose();
  };

  // Simulated prep timer
  const prepTotal = 20;
  const prepElapsed = order.prepTimeLeft ? prepTotal - parseInt(order.prepTimeLeft) : 0;
  const prepProgress = (prepElapsed / prepTotal) * 360;
  const isLate = order.prepTimeLeft && parseInt(order.prepTimeLeft) <= 2;
  const isHurry = order.prepTimeLeft && parseInt(order.prepTimeLeft) <= 5 && !isLate;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-t-2xl bg-card max-h-[90vh] overflow-y-auto transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="sticky top-0 z-10 bg-card pt-3 pb-2 px-5">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
              <span className="mx-2 text-muted-foreground/40">·</span>
              <span className="text-xs text-muted-foreground">{order.customer}</span>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted active:scale-95 transition-transform">
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>
          <h2 className="mt-1 text-lg font-bold text-foreground">Order Details</h2>
        </div>

        <div className="px-5 pb-6 space-y-4">
          {/* Status Timeline */}
          <div className="flex items-center gap-2 py-2">
            {["pending", "accepted", "preparing", "completed"].map((step, i) => {
              const steps = ["pending", "accepted", "preparing", "completed"];
              const currentIdx = steps.indexOf(order.status);
              const isCompleted = i < currentIdx;
              const isActive = i === currentIdx;
              return (
                <div key={step} className="flex flex-1 items-center gap-2">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      isCompleted && "bg-primary",
                      isActive && "bg-primary shadow-[0_0_0_4px] shadow-primary/20",
                      !isCompleted && !isActive && "bg-muted-foreground/30"
                    )}
                  />
                  {i < steps.length - 1 && (
                    <div className={cn("flex-1 h-0.5", isCompleted ? "bg-primary" : "bg-muted-foreground/20")} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Order Info */}
          <div className="rounded-2xl bg-muted/50 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-bold text-foreground">{order.item}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{order.quantity}</p>
              </div>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize", statusStyles[order.status])}>
                {order.status}
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-primary">{order.amount}</p>
              <span className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
                order.type === "delivery" ? "bg-info/10 text-info" : "bg-primary/10 text-primary"
              )}>
                {order.type === "delivery" ? <Truck size={12} /> : <ShoppingBag size={12} />}
                {order.type === "delivery" ? "Delivery" : "Pickup"}
              </span>
            </div>
          </div>

          {/* Preparation Timer */}
          {order.prepTimeLeft && order.status === "accepted" && (
            <div className={cn(
              "rounded-2xl border-2 p-4",
              isLate ? "border-destructive/30 bg-destructive/5" : isHurry ? "border-warning/30 bg-warning/5" : "border-primary/30 bg-primary/5"
            )}>
              <div className="flex items-center gap-4">
                <div
                  className="relative h-20 w-20 shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(${isLate ? 'hsl(0 84% 60%)' : isHurry ? 'hsl(38 92% 50%)' : 'hsl(152 100% 50%)'} ${prepProgress}deg, hsl(var(--muted)) 0deg)`
                  }}
                >
                  <div className="absolute h-16 w-16 rounded-full bg-card shadow-inner" />
                  <div className="relative z-10 text-center">
                    <p className="text-lg font-bold text-foreground">{order.prepTimeLeft}</p>
                    <p className="text-[8px] text-muted-foreground uppercase">left</p>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Timer size={14} className={cn(
                      isLate ? "text-destructive" : isHurry ? "text-warning" : "text-primary"
                    )} />
                    <span className="text-sm font-semibold text-foreground">Preparation Timer</span>
                  </div>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                    isLate ? "bg-destructive/10 text-destructive" : isHurry ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", isLate ? "bg-destructive" : isHurry ? "bg-warning" : "bg-primary")} />
                    {isLate ? "Running Late" : isHurry ? "Hurry Up" : "On Time"}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1">Est. {prepTotal} min prep time</p>
                </div>
              </div>
            </div>
          )}

          {/* Rider Status */}
          <button
            onClick={() => setRiderExpanded(!riderExpanded)}
            className="w-full rounded-2xl bg-muted/50 p-4 text-left active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {order.riderStatus === "assigned" && <UserCheck size={18} className="text-primary" />}
                {order.riderStatus === "unassigned" && <UserX size={18} className="text-destructive" />}
                {order.riderStatus === "enroute" && <Navigation size={18} className="text-warning" />}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {order.riderStatus === "assigned" && "Rider Assigned"}
                    {order.riderStatus === "unassigned" && "No Rider Yet"}
                    {order.riderStatus === "enroute" && "Rider En Route"}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      order.riderStatus === "assigned" && "bg-primary animate-live-pulse",
                      order.riderStatus === "unassigned" && "bg-destructive",
                      order.riderStatus === "enroute" && "bg-warning animate-live-pulse"
                    )} />
                    Live status
                  </div>
                </div>
              </div>
              <ChevronIcon rotated={riderExpanded} />
            </div>

            {riderExpanded && order.riderStatus !== "unassigned" && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 animate-fade-in-up">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Phone size={14} className="text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Tap to call rider</span>
              </div>
            )}

            {order.riderStatus === "unassigned" && order.prepTimeLeft && (
              <div className="mt-3 pt-3 border-t border-border animate-fade-in-up">
                <div className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-semibold text-secondary-foreground shadow-lg shadow-secondary/20">
                  <Users size={14} />
                  Appoint Rider
                </div>
              </div>
            )}
          </button>

          {/* Special Instructions */}
          <div className="rounded-2xl bg-muted/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={14} className="text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Special Instructions</span>
            </div>
            <p className="text-xs text-muted-foreground italic">No special instructions for this order.</p>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              Ordered {order.orderedAt}
            </span>
            {order.expiresIn && (
              <span className="font-semibold text-destructive animate-pulse-red">
                Expires in {order.expiresIn}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {order.status === "pending" && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleAction("reject", onReject)}
                disabled={!!actionLoading}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground active:scale-95 transition-all disabled:opacity-50"
              >
                {actionLoading === "reject" ? <LoadingSpinner /> : "Reject"}
              </button>
              <button
                onClick={() => handleAction("accept", onAccept)}
                disabled={!!actionLoading}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {actionLoading === "accept" ? <LoadingSpinner /> : "Accept Order"}
              </button>
            </div>
          )}

          {order.status === "accepted" && (
            <button
              onClick={() => handleAction("ready", onMarkReady)}
              disabled={!!actionLoading}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {actionLoading === "ready" ? <LoadingSpinner /> : "Mark Ready"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ChevronIcon = ({ rotated }: { rotated: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-muted-foreground transition-transform duration-300", rotated && "rotate-180")}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="mx-auto h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
);

export default OrderDetailModal;
