import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp, ArrowDown, Minus, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Vendor = {
  id: string;
  name: string;
  rating: number;
  orders: number;
  isMe?: boolean;
};

const SEED: Vendor[] = [
  { id: "v1", name: "Mama Cass Kitchen", rating: 4.9, orders: 78 },
  { id: "v2", name: "UniBites", rating: 4.8, orders: 64 },
  { id: "me", name: "Your Store", rating: 4.6, orders: 42, isMe: true },
  { id: "v4", name: "Campus Grill", rating: 4.5, orders: 39 },
  { id: "v5", name: "Sweet Spot", rating: 4.5, orders: 35 },
  { id: "v6", name: "QuickEats", rating: 4.4, orders: 31 },
  { id: "v7", name: "FoodHub PH", rating: 4.3, orders: 27 },
  { id: "v8", name: "Tasty Corner", rating: 4.3, orders: 24 },
  { id: "v9", name: "Hostel Bites", rating: 4.2, orders: 21 },
  { id: "v10", name: "The Plate", rating: 4.1, orders: 18 },
];

const score = (v: Vendor) => v.rating * 0.5 + (v.orders / 100) * 0.3 + 0.95 * 0.2;

const Rankings = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>(SEED);
  const [flash, setFlash] = useState<Record<string, "up" | "down">>({});
  const prevRanks = useRef<Record<string, number>>({});
  const meRowRef = useRef<HTMLDivElement | null>(null);

  // Compute current ranking
  const ranked = useMemo(() => {
    const sorted = [...vendors].sort((a, b) => score(b) - score(a));
    return sorted;
  }, [vendors]);

  // Live mock updates — bump random vendor's orders every ~3s
  useEffect(() => {
    const t = setInterval(() => {
      setVendors((prev) => {
        const idx = Math.floor(Math.random() * prev.length);
        const next = [...prev];
        const delta = Math.random() > 0.4 ? 1 : 0;
        next[idx] = { ...next[idx], orders: next[idx].orders + delta };
        return next;
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // Detect rank changes → flash
  useEffect(() => {
    const newRanks: Record<string, number> = {};
    const flashes: Record<string, "up" | "down"> = {};
    ranked.forEach((v, i) => {
      const newRank = i + 1;
      newRanks[v.id] = newRank;
      const prev = prevRanks.current[v.id];
      if (prev && prev !== newRank) {
        flashes[v.id] = newRank < prev ? "up" : "down";
      }
    });
    prevRanks.current = newRanks;
    if (Object.keys(flashes).length) {
      setFlash(flashes);
      const t = setTimeout(() => setFlash({}), 1200);
      return () => clearTimeout(t);
    }
  }, [ranked]);

  // Auto-focus current vendor on mount
  useEffect(() => {
    const t = setTimeout(() => {
      meRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const me = ranked.find((v) => v.isMe)!;
  const myRank = ranked.findIndex((v) => v.isMe) + 1;

  return (
    <div className="pb-24 min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-gradient-to-br from-secondary to-secondary/80 px-5 pb-5 pt-12 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-secondary-foreground active:scale-95 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-secondary-foreground">Regional Rankings</h1>
        <p className="text-xs text-secondary-foreground/70">Based on performance in your area · UniPort</p>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-secondary-foreground/60">Your Rank</p>
            <p className="text-lg font-bold text-secondary-foreground tabular-nums">#{myRank}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-secondary-foreground/60">Orders Today</p>
            <p className="text-lg font-bold text-secondary-foreground tabular-nums">{me.orders}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-secondary-foreground/60">Rating</p>
            <p className="text-lg font-bold text-secondary-foreground tabular-nums">
              {me.rating.toFixed(1)}<span className="text-warning ml-0.5">★</span>
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="px-4 pt-4 space-y-2">
        {ranked.map((v, i) => {
          const rank = i + 1;
          const f = flash[v.id];
          return (
            <div
              key={v.id}
              ref={v.isMe ? meRowRef : undefined}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3 transition-all duration-500",
                v.isMe
                  ? "bg-primary/8 border-primary/40 shadow-sm"
                  : "bg-card border-border/50",
                f === "up" && "ring-2 ring-success/50",
                f === "down" && "ring-2 ring-destructive/40"
              )}
              style={{ transform: "translateZ(0)" }}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold tabular-nums",
                  rank === 1 && "bg-warning/20 text-warning",
                  rank === 2 && "bg-muted text-foreground",
                  rank === 3 && "bg-warning/10 text-warning",
                  rank > 3 && "bg-muted/60 text-muted-foreground"
                )}
              >
                #{rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("truncate text-sm font-semibold", v.isMe ? "text-primary" : "text-foreground")}>
                  {v.name}{v.isMe && <span className="ml-1.5 text-[10px] font-medium text-primary/70">(You)</span>}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Star size={10} className="text-warning" fill="currentColor" />
                    {v.rating.toFixed(1)}
                  </span>
                  <span>·</span>
                  <span className="tabular-nums">{v.orders} orders</span>
                </div>
              </div>
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                  f === "up" && "bg-success/20 text-success",
                  f === "down" && "bg-destructive/15 text-destructive",
                  !f && "bg-muted text-muted-foreground"
                )}
              >
                {f === "up" ? <ArrowUp size={12} /> : f === "down" ? <ArrowDown size={12} /> : <Minus size={12} />}
              </div>
            </div>
          );
        })}
        <p className="pt-2 text-center text-[10px] text-muted-foreground">
          Updated live · Rankings refresh every few seconds
        </p>
      </div>
    </div>
  );
};

export default Rankings;
