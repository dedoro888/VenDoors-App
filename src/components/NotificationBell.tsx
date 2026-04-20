import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  className?: string;
  iconClassName?: string;
}

const NotificationBell = ({ className, iconClassName }: NotificationBellProps) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={() => navigate("/notifications")}
      aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
      className={cn("relative flex h-10 w-10 items-center justify-center rounded-full active:scale-95 transition-transform", className)}
    >
      <Bell size={22} className={cn("text-secondary-foreground", iconClassName)} />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
