import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Plan, PlanTier } from "@/hooks/useSubscription";

const TIER_META: Record<PlanTier, { icon: typeof Zap; accent: string; ring: string; bullets: string[] }> = {
  standard: {
    icon: Zap,
    accent: "text-foreground",
    ring: "ring-border",
    bullets: [
      "Up to 20 menu items",
      "Single category",
      "Daily orders & monthly revenue",
      "1 active promotion (flat discount)",
      "Weekly payouts · 1 payout account",
      "FAQ + Help Center",
    ],
  },
  pro: {
    icon: Sparkles,
    accent: "text-primary",
    ring: "ring-primary/40",
    bullets: [
      "Unlimited items · Multi-category",
      "Bulk editing · Out-of-stock · Prep time",
      "90-day analytics · Top 5 items · Heatmap",
      "5 promotions · Flash sales · Featured items",
      "Customer profiles · Reply to reviews",
      "Twice-weekly payouts · 2 accounts",
      "Priority support (48h)",
    ],
  },
  premium: {
    icon: Crown,
    accent: "text-amber-500",
    ring: "ring-amber-400/50",
    bullets: [
      "Everything in Pro",
      "Multi-branch · POS integration · QR menus",
      "AI menu suggestions · AI sales forecasting",
      "Inventory tracking · Auto pause orders",
      "Unlimited promotions · Homepage banner · SMS",
      "Full CRM · Loyalty · VIP tagging · NPS",
      "Daily payouts · 5 accounts · Custom commission",
      "Dedicated account manager · 24/7 support",
    ],
  },
};

interface Props {
  plan: Plan;
  isCurrent: boolean;
  recommended?: boolean;
  onSelect: () => void;
  selecting?: boolean;
  ctaLabel?: string;
}

const PlanCard = ({ plan, isCurrent, recommended, onSelect, selecting, ctaLabel }: Props) => {
  const meta = TIER_META[plan.tier as PlanTier];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "relative rounded-2xl bg-card p-5 shadow-sm ring-1 transition-all",
        meta.ring,
        recommended && "ring-2 ring-primary shadow-lg shadow-primary/10"
      )}
    >
      {recommended && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          Most Popular
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <div className={cn("mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-muted", meta.accent)}>
            <Icon size={20} />
          </div>
          <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
          {plan.tagline && <p className="text-[11px] text-muted-foreground">{plan.tagline}</p>}
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-foreground">
            {plan.currency === "NGN" ? "₦" : ""}
            {plan.price_monthly.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">/ month</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {meta.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-xs text-foreground/80">
            <Check size={14} className={cn("mt-0.5 shrink-0", meta.accent)} />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        onClick={onSelect}
        disabled={isCurrent || selecting}
        className={cn(
          "mt-5 w-full",
          plan.tier === "premium" && !isCurrent && "bg-amber-500 hover:bg-amber-500/90 text-white"
        )}
        variant={isCurrent ? "outline" : plan.tier === "standard" ? "outline" : "default"}
      >
        {isCurrent ? "Current Plan" : selecting ? "Selecting..." : ctaLabel || `Choose ${plan.name}`}
      </Button>
    </div>
  );
};

export default PlanCard;
