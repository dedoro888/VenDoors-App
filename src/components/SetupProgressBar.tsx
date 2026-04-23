import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  current: number; // 1-4
  total?: number;
  labels?: string[];
}

const SetupProgressBar = ({ current, total = 4, labels }: Props) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Step {current} of {total}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {Math.round(((current - 1) / total) * 100)}% complete
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;
          return (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                done || active ? "bg-primary" : "bg-muted"
              )}
            />
          );
        })}
      </div>
      {labels && (
        <div className="mt-2 flex items-center justify-between">
          {labels.map((l, i) => (
            <span
              key={l}
              className={cn(
                "text-[10px] font-medium",
                i + 1 <= current ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SetupProgressBar;
