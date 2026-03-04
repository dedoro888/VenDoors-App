import { Edit3, ToggleLeft, ToggleRight, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/menu";

interface MenuActionSheetProps {
  item: MenuItem | null;
  open: boolean;
  onClose: () => void;
  onEdit: (item: MenuItem) => void;
  onToggleAvailability: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

const MenuActionSheet = ({ item, open, onClose, onEdit, onToggleAvailability, onDelete }: MenuActionSheetProps) => {
  if (!item) return null;

  const actions = [
    {
      icon: Edit3,
      label: "Edit Item",
      onClick: () => { onEdit(item); onClose(); },
      className: "text-foreground",
    },
    {
      icon: item.isAvailable ? ToggleLeft : ToggleRight,
      label: item.isAvailable ? "Mark as Unavailable" : "Mark as Available",
      onClick: () => { onToggleAvailability(item); onClose(); },
      className: item.isAvailable ? "text-warning" : "text-primary",
    },
    {
      icon: Trash2,
      label: "Delete Item",
      onClick: () => { onDelete(item); onClose(); },
      className: "text-destructive",
    },
  ];

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
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left active:bg-muted/50 transition-colors"
            >
              <action.icon size={18} className={action.className} />
              <span className={cn("text-sm font-medium", action.className)}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuActionSheet;
