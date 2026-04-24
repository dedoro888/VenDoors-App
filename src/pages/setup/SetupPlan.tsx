import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PlanCard from "@/components/PlanCard";
import { cn } from "@/lib/utils";
import type { Plan } from "@/hooks/useSubscription";

const SetupPlan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data: plansData } = await supabase.from("plans").select("*").order("sort_order");
      if (cancelled) return;
      setPlans((plansData ?? []) as Plan[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleContinue = async () => {
    if (!user || !selectedPlanId) return;
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan) return;

    setSubmitting(true);
    try {
      // Standard activates immediately. Pro/Premium are stored as 'pending'
      // (UI-only payment), but we still record the user's choice so it's clear.
      const status = plan.tier === "standard" ? "active" : "pending";
      const { error } = await supabase
        .from("user_subscriptions")
        .upsert(
          { user_id: user.id, plan_id: plan.id, status, started_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      if (error) throw error;

      await supabase
        .from("profiles")
        .update({ setup_step: 4, setup_completed: true })
        .eq("user_id", user.id);

      if (plan.tier !== "standard") {
        toast({
          title: `${plan.name} requested`,
          description: "Payments are coming soon — we'll notify you when ready.",
        });
      } else {
        toast({ title: "You're all set!", description: "Your store is ready to receive orders." });
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to select plan";
      toast({ title: "Selection failed", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-5 pb-24">
      <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Choose your plan</h2>
            <p className="text-[11px] text-muted-foreground">Pick the package that fits your business</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {plans.map((p) => {
          const isSelected = p.id === selectedPlanId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPlanId(p.id)}
              className={cn(
                "w-full text-left rounded-2xl transition-all relative",
                isSelected ? "ring-2 ring-primary scale-[1.01]" : "active:scale-[0.99]"
              )}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <Check size={14} />
                </div>
              )}
              <PlanCard
                plan={p}
                isCurrent={false}
                recommended={p.tier === "pro"}
                selecting={false}
                ctaLabel={isSelected ? "Selected" : `Choose ${p.name}`}
                onSelect={() => setSelectedPlanId(p.id)}
              />
            </button>
          );
        })}
      </div>

      <div className="rounded-xl bg-muted/40 p-3 text-center">
        <p className="text-[11px] text-muted-foreground">
          Pro & Premium upgrades are payment-pending — you'll keep full access on your selected tier
          while we finalize billing.
        </p>
      </div>

      {/* Sticky footer continue */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-border bg-card/95 backdrop-blur px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-40">
        <Button
          onClick={handleContinue}
          disabled={!selectedPlanId || submitting}
          className="w-full"
          size="lg"
        >
          {submitting
            ? "Saving…"
            : selectedPlanId
            ? "Continue"
            : "Select a plan to continue"}
        </Button>
      </div>
    </div>
  );
};

export default SetupPlan;
