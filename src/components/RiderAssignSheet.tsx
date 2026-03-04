import { useState } from "react";
import { X, Phone, Star, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Rider } from "@/types/order";

const mockRiders: Rider[] = [
  { id: "r1", name: "Adebayo Olamide", distance: "0.8 km", rating: 4.8, status: "available", phone: "+2348012345678" },
  { id: "r2", name: "Chinedu Emeka", distance: "1.2 km", rating: 4.5, status: "available", phone: "+2348023456789" },
  { id: "r3", name: "Femi Adeyemi", distance: "2.1 km", rating: 4.9, status: "busy", phone: "+2348034567890" },
  { id: "r4", name: "Ibrahim Musa", distance: "0.5 km", rating: 4.3, status: "available", phone: "+2348045678901" },
];

interface RiderAssignSheetProps {
  open: boolean;
  onClose: () => void;
  onAssign: (rider: Rider) => void;
  orderId: string;
}

const RiderAssignSheet = ({ open, onClose, onAssign, orderId }: RiderAssignSheetProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async (rider: Rider) => {
    if (assigning || rider.status === "busy") return;
    setSelected(rider.id);
    setAssigning(true);
    await new Promise((r) => setTimeout(r, 800));
    onAssign(rider);
    setAssigning(false);
    setSelected(null);
    onClose();
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300",
      open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    )}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative w-full max-w-md rounded-t-2xl bg-card max-h-[70vh] overflow-y-auto transition-transform duration-300 pb-[max(1rem,env(safe-area-inset-bottom))]",
        open ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="sticky top-0 z-10 bg-card px-5 pt-4 pb-3 border-b border-border">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Available Riders Nearby</h2>
              <p className="text-[11px] text-muted-foreground">Order {orderId}</p>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted active:scale-95 transition-transform">
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="px-4 py-3 space-y-2">
          {mockRiders.map((rider) => (
            <button
              key={rider.id}
              onClick={() => handleAssign(rider)}
              disabled={rider.status === "busy" || assigning}
              className={cn(
                "w-full flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98]",
                selected === rider.id ? "border-primary bg-primary/5" : "border-border",
                rider.status === "busy" && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
                {rider.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{rider.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin size={10} /> {rider.distance}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-warning">
                    <Star size={10} fill="currentColor" /> {rider.rating}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  rider.status === "available" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {rider.status === "available" ? "Available" : "Busy"}
                </span>
                {selected === rider.id && assigning && (
                  <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiderAssignSheet;
