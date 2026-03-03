import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onToggle: (val: boolean) => void;
}

const ToggleSwitch = ({ checked, onToggle }: ToggleSwitchProps) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    onToggle(!checked);
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative h-8 w-14 rounded-full transition-colors duration-300",
        loading ? "bg-muted-foreground/40" : checked ? "bg-success animate-pulse-glow" : "bg-border"
      )}
    >
      <div
        className={cn(
          "absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-card shadow transition-transform duration-300",
          checked && "translate-x-6"
        )}
      >
        {loading && <Loader2 size={14} className="animate-spin text-primary" />}
      </div>
    </button>
  );
};

export default ToggleSwitch;
