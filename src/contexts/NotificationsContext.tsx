import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type NotificationType = "order" | "payment" | "profile" | "system";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  description: string | null;
  link: string | null;
  read_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  resolve: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  seedIfEmpty: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) setNotifications(data as Notification[]);
    setLoading(false);
  }, [user]);

  // Seed a few starter notifications on first login so the bell + center are not empty
  const seedIfEmpty = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (count && count > 0) return;
    await supabase.from("notifications").insert([
      {
        user_id: user.id,
        type: "order",
        title: "Welcome to VenDoor",
        description: "Your vendor account is ready. Start by reviewing your menu.",
        link: "/menu",
      },
      {
        user_id: user.id,
        type: "profile",
        title: "Update your store hours",
        description: "Confirm your weekly schedule so customers know when you're open.",
        link: "/profile/operating-hours",
      },
      {
        user_id: user.id,
        type: "payment",
        title: "Set up payouts",
        description: "Add bank details to start receiving earnings.",
        link: "/profile/payout-settings",
      },
    ]);
    await refresh();
  }, [user, refresh]);

  useEffect(() => {
    setLoading(true);
    refresh().then(() => seedIfEmpty());
  }, [refresh, seedIfEmpty]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
  };

  const resolve = async (id: string) => {
    const now = new Date().toISOString();
    await supabase.from("notifications").update({ resolved_at: now, read_at: now }).eq("id", id);
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, loading, markRead, markAllRead, resolve, refresh, seedIfEmpty }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
};
