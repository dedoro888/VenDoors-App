import { Edit3, ToggleLeft, ToggleRight, Trash2, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AvailabilityStatus, MenuItem } from "@/types/menu";

interface MenuActionSheetProps {
  item: MenuItem | null;
  open: boolean;
  onClose: () => void;
  onEdit: (item: MenuItem) => void;
  onSetAvailability: (item: MenuItem, status: AvailabilityStatus) => void;
  onDelete: (item: MenuItem) => void;
}

const MenuActionSheet = ({ item, open, onClose, onEdit, onSetAvailability, onDelete }: MenuActionSheetProps) => {
  if (!item) return null;

  const availabilityActions = [
    { status: "available" as const, label: "Mark as Available", show: item.availability !== "available", className: "text-primary" },
    { status: "unavailable" as const, label: "Mark as Unavailable", show: item.availability !== "unavailable", className: "text-destructive" },
    { status: "pre-order" as const, label: "Mark as Pre-Order", show: item.availability !== "pre-order", className: "text-warning" },
  ].filter((a) => a.show);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative w-full max-w-md rounded-t-2xl bg-card pb-[max(1rem,env(safe-area-inset-bottom))] transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted active:scale-95 transition-transform">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>
        <div className="px-3 pb-2">
          {/* Edit */}
          <button
            onClick={() => { onEdit(item); onClose(); }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left active:bg-muted/50 transition-colors"
          >
            <Edit3 size={18} className="text-foreground" />
            <span className="text-sm font-medium text-foreground">Edit Item</span>
          </button>

          {/* Availability options */}
          {availabilityActions.map((action) => (
            <button
              key={action.status}
              onClick={() => { onSetAvailability(item, action.status); onClose(); }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left active:bg-muted/50 transition-colors"
            >
              {action.status === "pre-order" ? (
                <Clock size={18} className={action.className} />
              ) : action.status === "available" ? (
                <ToggleRight size={18} className={action.className} />
              ) : (
                <ToggleLeft size={18} className={action.className} />
              )}
              <span className={cn("text-sm font-medium", action.className)}>{action.label}</span>
            </button>
          ))}

          {/* Delete */}
          <button
            onClick={() => { onDelete(item); onClose(); }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left active:bg-muted/50 transition-colors"
          >
            <Trash2 size={18} className="text-destructive" />
            <span className="text-sm font-medium text-destructive">Delete Item</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuActionSheet;
