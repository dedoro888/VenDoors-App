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

  const activeOrders = orders.filter((o) => !["completed", "rejected", "cancelled"].includes(o.orderStatus));

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card px-5 pb-3 pt-12 shadow-sm border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Orders</h1>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
            <Search size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="mt-4 flex rounded-xl bg-muted p-1">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all",
              activeTab === "active" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Active Orders
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeOrders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
              activeTab === "history" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            History
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3 px-4 pt-4">
        {activeTab === "active"
          ? activeOrders.map((order) => (
              <div key={order.id} onClick={() => setSelectedOrder(order)} className="cursor-pointer">
                <OrderCard
                  order={order}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onMarkReady={handleMarkReady}
                  actionLoading={actionLoading}
                />
              </div>
            ))
          : history.map((order) => (
              <div key={order.id} onClick={() => setSelectedOrder(order)} className="cursor-pointer">
                <OrderCard order={order} isHistory />
              </div>
            ))}
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
