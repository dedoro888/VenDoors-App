import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PlanCard from "@/components/PlanCard";
import type { Plan, PlanTier } from "@/hooks/useSubscription";

const SetupPlan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ data: plansData }, { data: subData }] = await Promise.all([
        supabase.from("plans").select("*").order("sort_order"),
        supabase.from("user_subscriptions").select("plan_id").eq("user_id", user.id).maybeSingle(),
      ]);
      if (cancelled) return;
      setPlans((plansData ?? []) as Plan[]);
      setCurrentPlanId(subData?.plan_id ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const finishSetup = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ setup_step: 4, setup_completed: true })
      .eq("user_id", user.id);
    toast({ title: "You're all set!", description: "Your store is ready to receive orders." });
    navigate("/dashboard", { replace: true });
  };

  const handleChoose = async (plan: Plan) => {
    if (!user) return;
    setSelecting(plan.id);
    try {
      // Standard activates immediately; Pro/Premium go to pending (UI-only payment)
      const status = plan.tier === "standard" ? "active" : "pending";
      const { error } = await supabase
        .from("user_subscriptions")
        .upsert(
          { user_id: user.id, plan_id: plan.id, status, started_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      if (error) throw error;

      if (plan.tier !== "standard") {
        toast({
          title: `${plan.name} requested`,
          description: "Payments are coming soon. You're on Standard until then.",
        });
        // Re-assign Standard so user can keep using app fully
        const standard = plans.find((p) => p.tier === "standard");
        if (standard) {
          await supabase
            .from("user_subscriptions")
            .upsert(
              { user_id: user.id, plan_id: standard.id, status: "active" },
              { onConflict: "user_id" }
            );
        }
      }

      await finishSetup();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to select plan";
      toast({ title: "Selection failed", description: msg, variant: "destructive" });
    } finally {
      setSelecting(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Business Suite</h2>
            <p className="text-[11px] text-muted-foreground">Start free on Standard — upgrade anytime</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {plans.map((p) => (
          <PlanCard
            key={p.id}
            plan={p}
            isCurrent={p.id === currentPlanId && p.tier === "standard"}
            recommended={p.tier === "pro"}
            selecting={selecting === p.id}
            ctaLabel={p.tier === "standard" ? "Start with Standard" : `Choose ${p.name}`}
            onSelect={() => handleChoose(p)}
          />
        ))}
      </div>

      <div className="rounded-xl bg-muted/40 p-3 text-center">
        <p className="text-[11px] text-muted-foreground">
          You can change or upgrade your plan anytime from <span className="font-medium text-foreground">Profile → Business Suite</span>.
        </p>
      </div>

      <Button variant="ghost" onClick={finishSetup} className="w-full">
        Skip — keep Standard
      </Button>
    </div>
  );
};

export default SetupPlan;
