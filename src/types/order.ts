export type OrderStatus = "pending" | "accepted" | "ready" | "completed" | "rejected" | "cancelled";
export type RiderStatus = "unassigned" | "assigned" | "enroute" | "pickedup" | "delivered";

export interface Order {
  id: string;
  customer: string;
  item: string;
  orderStatus: OrderStatus;
  amount: string;
  quantity: string;
  type: "delivery" | "pickup";
  riderStatus: RiderStatus;
  orderedAt: string;
  expiresIn?: string;
  prepTimeLeft?: string;
  prepTimeTotal?: number;
  specialInstructions?: string;
  scheduleDate?: string;
}

export interface Rider {
  id: string;
  name: string;
  distance: string;
  rating: number;
  status: "available" | "busy";
  phone: string;
}
