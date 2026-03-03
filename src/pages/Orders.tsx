import { useState } from "react";
import { Search } from "lucide-react";
import OrderCard, { Order } from "@/components/OrderCard";
import { cn } from "@/lib/utils";

const activeOrders: Order[] = [
  {
    id: "#ORD-2847",
    customer: "Chioma Adeleke",
    item: "Jollof Rice & Chicken",
    status: "pending",
    amount: "₦3,500",
    quantity: "Qty: 2 plates",
    type: "delivery",
    riderStatus: "unassigned",
    orderedAt: "2:34 PM",
    expiresIn: "02:54",
  },
  {
    id: "#ORD-2846",
    customer: "Oluwaseun Bakare",
    item: "Small Chops Platter",
    status: "pending",
    amount: "₦5,000",
    quantity: "Qty: 1 platter",
    type: "pickup",
    riderStatus: "assigned",
    orderedAt: "2:30 PM",
    expiresIn: "02:00",
  },
  {
    id: "#ORD-2845",
    customer: "Ngozi Okonkwo",
    item: "Pounded Yam & Egusi",
    status: "accepted",
    amount: "₦4,200",
    quantity: "Qty: 1 wrap",
    type: "delivery",
    riderStatus: "enroute",
    orderedAt: "2:15 PM",
    prepTimeLeft: "8 min",
  },
];

const historyOrders: Order[] = [
  {
    id: "#ORD-2839",
    customer: "Fatima Bello",
    item: "Fried Rice & Turkey",
    status: "completed",
    amount: "₦4,500",
    quantity: "Today, 1:45 PM",
    type: "delivery",
    riderStatus: "assigned",
    orderedAt: "1:45 PM",
  },
  {
    id: "#ORD-2835",
    customer: "Emmanuel Chukwu",
    item: "Amala & Gbegiri",
    status: "rejected",
    amount: "₦2,800",
    quantity: "Today, 12:20 PM",
    type: "pickup",
    riderStatus: "unassigned",
    orderedAt: "12:20 PM",
  },
];

const Orders = () => {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card px-5 pb-3 pt-12 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Orders</h1>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
            <Search size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex rounded-xl bg-muted p-1">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all",
              activeTab === "active"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
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
              activeTab === "history"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
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
              <OrderCard
                key={order.id}
                order={order}
                onAccept={(id) => console.log("Accept", id)}
                onReject={(id) => console.log("Reject", id)}
                onMarkReady={(id) => console.log("Mark Ready", id)}
              />
            ))
          : historyOrders.map((order) => (
              <OrderCard key={order.id} order={order} isHistory />
            ))}
      </div>
    </div>
  );
};

export default Orders;
