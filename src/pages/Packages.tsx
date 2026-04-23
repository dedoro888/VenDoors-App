import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PlanCard from "@/components/PlanCard";
import type { Plan } from "@/hooks/useSubscription";

const Packages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!user) return;
    const [{ data: plansData }, { data: subData }] = await Promise.all([
      supabase.from("plans").select("*").order("sort_order"),
      supabase.from("user_subscriptions").select("plan_id").eq("user_id", user.id).maybeSingle(),
    ]);
    setPlans((plansData ?? []) as Plan[]);
    setCurrentPlanId(subData?.plan_id ?? null);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleChoose = async (plan: Plan) => {
    if (!user) return;
    setSelecting(plan.id);
    try {
      if (plan.tier === "standard") {
        await supabase
          .from("user_subscriptions")
          .upsert(
            { user_id: user.id, plan_id: plan.id, status: "active" },
            { onConflict: "user_id" }
          );
        toast({ title: "Switched to Standard" });
      } else {
        toast({
          title: `${plan.name} — Coming soon`,
          description: "Plan upgrades and payments are launching shortly. We've noted your interest.",
        });
      }
      await fetchAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      toast({ title: "Action failed", description: msg, variant: "destructive" });
    } finally {
      setSelecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/95 backdrop-blur px-4 py-3 border-b border-border">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-muted">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-foreground">Business Suite</h1>
          <p className="text-[11px] text-muted-foreground">Choose the plan that fits your business</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="px-4 pt-5 space-y-5">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Unlock more with Pro & Premium</h2>
                <p className="text-[11px] text-muted-foreground">Bigger menus, deeper analytics, AI tools, faster payouts.</p>
              </div>
            </div>
          </div>

          {plans.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              isCurrent={p.id === currentPlanId}
              recommended={p.tier === "pro"}
              selecting={selecting === p.id}
              ctaLabel={
                p.id === currentPlanId
                  ? "Current Plan"
                  : p.tier === "standard"
                  ? "Switch to Standard"
                  : `Upgrade to ${p.name}`
              }
              onSelect={() => handleChoose(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Packages;
