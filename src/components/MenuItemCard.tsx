import { MoreVertical, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/menu";

interface MenuItemCardProps {
  item: MenuItem;
  onTap: (item: MenuItem) => void;
  onThreeDot: (item: MenuItem) => void;
}

const badgeStyles = {
  available: "bg-primary/10 text-primary",
  unavailable: "bg-destructive/10 text-destructive",
  "pre-order": "bg-warning/10 text-warning",
};

const badgeLabels = {
  available: "Available",
  unavailable: "Unavailable",
  "pre-order": "Pre-Order",
};

const MenuItemCard = ({ item, onTap, onThreeDot }: MenuItemCardProps) => {
  const formattedPrice = `₦${item.price.toLocaleString()}`;

  return (
    <div
      onClick={() => onTap(item)}
      className={cn(
        "flex items-center gap-3 rounded-[14px] bg-card p-3 shadow-sm cursor-pointer active:scale-[0.98] transition-all border border-border/50",
        item.availability === "unavailable" && "opacity-[0.85]"
      )}
    >
      {/* Image */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon size={24} className="text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-base font-semibold text-foreground truncate">{item.name}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onThreeDot(item);
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg hover:bg-muted active:scale-95 transition-all"
          >
            <MoreVertical size={16} className="text-muted-foreground" />
          </button>
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</p>
        )}
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-sm font-bold text-primary">{formattedPrice}</p>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", badgeStyles[item.availability])}>
            {badgeLabels[item.availability]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
