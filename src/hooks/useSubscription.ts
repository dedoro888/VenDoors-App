import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type PlanTier = "standard" | "pro" | "premium";

export interface Plan {
  id: string;
  tier: PlanTier;
  name: string;
  tagline: string | null;
  price_monthly: number;
  currency: string;
  sort_order: number;
  features: Record<string, unknown>;
}

export interface Subscription {
  id: string;
  plan_id: string;
  status: "active" | "pending" | "cancelled" | "expired";
  started_at: string;
  ends_at: string | null;
  plan: Plan | null;
}

const TIER_RANK: Record<PlanTier, number> = { standard: 0, pro: 1, premium: 2 };

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSub = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("user_subscriptions")
      .select("id, plan_id, status, started_at, ends_at, plans(*)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setSubscription({
        id: data.id,
        plan_id: data.plan_id,
        status: data.status,
        started_at: data.started_at,
        ends_at: data.ends_at,
        // @ts-expect-error supabase types union
        plan: data.plans as Plan | null,
      });
    } else {
      setSubscription(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSub();
  }, [fetchSub]);

  const tier: PlanTier = (subscription?.plan?.tier as PlanTier) || "standard";

  const hasAtLeast = (minTier: PlanTier) => TIER_RANK[tier] >= TIER_RANK[minTier];

  const featureFlag = (key: string): unknown => {
    return subscription?.plan?.features?.[key as keyof typeof subscription.plan.features];
  };

  return { subscription, loading, tier, hasAtLeast, featureFlag, refresh: fetchSub };
};
