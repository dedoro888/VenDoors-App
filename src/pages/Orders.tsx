import { useState } from "react";
import { Search } from "lucide-react";
import OrderCard from "@/components/OrderCard";
import OrderDetailModal from "@/components/OrderDetailModal";
import RiderAssignSheet from "@/components/RiderAssignSheet";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderStatus, RiderStatus } from "@/types/order";

const initialActiveOrders: Order[] = [
  {
    id: "#ORD-2847", customer: "Chioma Adeleke", item: "Jollof Rice & Chicken",
    orderStatus: "pending", amount: "₦3,500", quantity: "Qty: 2 plates",
    type: "delivery", riderStatus: "unassigned", orderedAt: "2:34 PM", expiresIn: "02:54",
  },
  {
    id: "#ORD-2846", customer: "Oluwaseun Bakare", item: "Small Chops Platter",
    orderStatus: "pending", amount: "₦5,000", quantity: "Qty: 1 platter",
    type: "pickup", riderStatus: "assigned", orderedAt: "2:30 PM", expiresIn: "02:00",
  },
  {
    id: "#ORD-2845", customer: "Ngozi Okonkwo", item: "Pounded Yam & Egusi",
    orderStatus: "accepted", amount: "₦4,200", quantity: "Qty: 1 wrap",
    type: "delivery", riderStatus: "enroute", orderedAt: "2:15 PM",
    prepTimeLeft: "8 min", prepTimeTotal: 20,
  },
];

const initialHistory: Order[] = [
  {
    id: "#ORD-2839", customer: "Fatima Bello", item: "Fried Rice & Turkey",
    orderStatus: "completed", amount: "₦4,500", quantity: "Today, 1:45 PM",
    type: "delivery", riderStatus: "delivered", orderedAt: "1:45 PM",
  },
  {
    id: "#ORD-2835", customer: "Emmanuel Chukwu", item: "Amala & Gbegiri",
    orderStatus: "rejected", amount: "₦2,800", quantity: "Today, 12:20 PM",
    type: "pickup", riderStatus: "unassigned", orderedAt: "12:20 PM",
  },
];

type StatusFilter = "new" | "preparing" | "ready" | "transit" | "completed" | "cancelled";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "new", label: "New" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready for Pickup" },
  { key: "transit", label: "In Transit" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const matchesFilter = (order: Order, filter: StatusFilter): boolean => {
  switch (filter) {
    case "new":
      return order.orderStatus === "pending";
    case "preparing":
      return order.orderStatus === "accepted";
    case "ready":
      return order.orderStatus === "ready" && order.riderStatus !== "pickedup";
    case "transit":
      return (
        order.type === "delivery" &&
        (order.riderStatus === "pickedup" || order.riderStatus === "enroute") &&
        order.orderStatus !== "completed"
      );
    case "completed":
      return order.orderStatus === "completed";
    case "cancelled":
      return order.orderStatus === "rejected" || order.orderStatus === "cancelled";
  }
};

const Orders = () => {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("new");
  const [orders, setOrders] = useState(initialActiveOrders);
  const [history] = useState(initialHistory);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [riderAssignOrderId, setRiderAssignOrderId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    if (selectedOrder?.id === id) {
      setSelectedOrder((prev) => prev ? { ...prev, ...updates } : prev);
    }
  };

  const handleAccept = async (id: string) => {
    setActionLoading(`accept-${id}`);
    await new Promise((r) => setTimeout(r, 800));
    updateOrder(id, { orderStatus: "accepted", expiresIn: undefined, prepTimeLeft: "20 min", prepTimeTotal: 20 });
    toast({ title: "Order accepted", description: "Preparation timer started" });
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    setActionLoading(`reject-${id}`);
    await new Promise((r) => setTimeout(r, 800));
    updateOrder(id, { orderStatus: "rejected" });
    toast({ title: "Order rejected" });
    setActionLoading(null);
  };

  const handleMarkReady = async (id: string) => {
    setActionLoading(`ready-${id}`);
    await new Promise((r) => setTimeout(r, 800));
    const order = orders.find((o) => o.id === id);
    updateOrder(id, { orderStatus: "ready", prepTimeLeft: undefined });
    if (order && (order.riderStatus === "assigned" || order.riderStatus === "enroute")) {
      toast({ title: "Order ready", description: "Rider has been notified" });
    } else {
      toast({ title: "Order ready for pickup" });
    }
    setActionLoading(null);
  };

  const handleAssignRider = (rider: any) => {
    if (!riderAssignOrderId) return;
    updateOrder(riderAssignOrderId, { riderStatus: "assigned" });
    toast({ title: "Rider assigned", description: `${rider.name} is on the way` });
    setRiderAssignOrderId(null);
  };

  const allOrders = [...orders, ...history];
  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.key] = allOrders.filter((o) => matchesFilter(o, tab.key)).length;
    return acc;
  }, {} as Record<StatusFilter, number>);

  const q = searchQuery.trim().toLowerCase();
  const filteredOrders = allOrders
    .filter((o) => matchesFilter(o, activeFilter))
    .filter((o) =>
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      o.item.toLowerCase().includes(q)
    );
  const isHistoryFilter = activeFilter === "completed" || activeFilter === "cancelled";

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card px-5 pb-3 pt-12 shadow-sm border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Orders</h1>
          <button
            onClick={() => {
              const next = !searchOpen;
              setSearchOpen(next);
              if (!next) setSearchQuery("");
            }}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
              searchOpen ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
            aria-label={searchOpen ? "Close search" : "Open search"}
          >
            <Search size={18} />
          </button>
        </div>

        {searchOpen && (
          <div className="mt-3 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, customer, or item..."
              className="w-full rounded-xl border border-border bg-muted py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        )}
      </div>

      {/* Status Filter Bar */}
      <div className={cn("sticky z-10 bg-background border-b border-border", searchOpen ? "top-[140px]" : "top-[84px]")}>
        <div
          className="flex gap-2 overflow-x-auto px-4 py-3 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {STATUS_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            const count = counts[tab.key];
            const isNew = tab.key === "new";
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  "flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-muted text-muted-foreground active:bg-muted/70",
                  isNew && count > 0 && !isActive && "animate-pulse"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold transition-colors",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3 px-4 pt-4">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No orders in this category</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Orders will appear here when available
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} onClick={() => setSelectedOrder(order)} className="cursor-pointer">
              <OrderCard
                order={order}
                onAccept={handleAccept}
                onReject={handleReject}
                onMarkReady={handleMarkReady}
                actionLoading={actionLoading}
                isHistory={isHistoryFilter}
              />
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onAccept={handleAccept}
        onReject={handleReject}
        onMarkReady={handleMarkReady}
        onAssignRider={(orderId) => { setSelectedOrder(null); setRiderAssignOrderId(orderId); }}
      />

      {/* Rider Assignment Sheet */}
      <RiderAssignSheet
        open={!!riderAssignOrderId}
        onClose={() => setRiderAssignOrderId(null)}
        onAssign={handleAssignRider}
        orderId={riderAssignOrderId ?? ""}
      />
    </div>
  );
};

export default Orders;
