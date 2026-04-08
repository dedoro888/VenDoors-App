import { cn } from "@/lib/utils";
import { useStore } from "@/contexts/StoreContext";

const StoreStatusIndicator = () => {
  const { storeOpen } = useStore();

  return (
    <div className={cn(
      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors",
      storeOpen ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
    )}>
      <div className={cn(
        "h-2 w-2 rounded-full",
        storeOpen ? "bg-primary animate-live-pulse" : "bg-destructive animate-pulse-red"
      )} />
      {storeOpen ? "Open" : "Closed"}
    </div>
  );
};

export default StoreStatusIndicator;
