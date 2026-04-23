import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, AlertCircle, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSetupProgress } from "@/hooks/useSetupProgress";
import { useState } from "react";

interface ChecklistItem {
  label: string;
  done: boolean;
  path: string;
}

const SetupChecklist = () => {
  const navigate = useNavigate();
  const { progress, loading } = useSetupProgress();
  const [dismissed, setDismissed] = useState(false);

  if (loading || progress.setup_completed || dismissed) return null;

  const items: ChecklistItem[] = [
    { label: "Verify your account", done: progress.business_email_verified && progress.personal_phone_verified, path: "/verify-account" },
    { label: "Add payout account", done: progress.has_payout_account, path: "/setup/payout" },
    { label: "Complete business profile", done: progress.has_business_profile, path: "/setup/business" },
    { label: "Set operating hours", done: false, path: "/setup/hours" },
    { label: "Choose your plan", done: false, path: "/setup/plan" },
  ];

  const remaining = items.filter((i) => !i.done).length;
  const next = items.find((i) => !i.done);

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-muted-foreground active:text-foreground"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 shrink-0">
          <AlertCircle size={18} />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-sm font-semibold text-foreground">Finish setting up your store</h3>
          <p className="text-[11px] text-muted-foreground">{remaining} step{remaining !== 1 ? "s" : ""} left to start receiving orders</p>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left active:bg-amber-500/10 transition-colors",
              item.done && "opacity-60"
            )}
          >
            {item.done ? (
              <CheckCircle2 size={14} className="text-primary shrink-0" />
            ) : (
              <Circle size={14} className="text-muted-foreground shrink-0" />
            )}
            <span className={cn("text-xs flex-1", item.done ? "line-through text-muted-foreground" : "text-foreground font-medium")}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {next && (
        <Button size="sm" onClick={() => navigate(next.path)} className="w-full gap-1.5">
          {next.label}
          <ArrowRight size={14} />
        </Button>
      )}
    </div>
  );
};

export default SetupChecklist;
