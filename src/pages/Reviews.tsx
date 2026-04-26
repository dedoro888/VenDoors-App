import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MessageSquare, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Review = {
  id: string;
  customer: string;
  rating: number;
  text: string;
  date: string;
  orderRef?: string;
  reply?: string;
};

const MOCK: Review[] = [
  { id: "r1", customer: "Ada O.", rating: 5, text: "Best jollof on campus, hands down. Delivery was fast too!", date: "2h ago", orderRef: "VDR-8821" },
  { id: "r2", customer: "User2381", rating: 4, text: "Tasty meal but the packaging was a bit leaky.", date: "Yesterday", orderRef: "VDR-8810" },
  { id: "r3", customer: "Tunde A.", rating: 5, text: "Always consistent. Will keep ordering.", date: "2d ago" },
  { id: "r4", customer: "User9912", rating: 2, text: "Took too long to arrive and food was cold.", date: "3d ago", orderRef: "VDR-8780" },
  { id: "r5", customer: "Chiamaka I.", rating: 5, text: "Customer service was top-notch. 10/10.", date: "4d ago" },
  { id: "r6", customer: "User4471", rating: 1, text: "Wrong order delivered. Very disappointed.", date: "5d ago", orderRef: "VDR-8755" },
  { id: "r7", customer: "Bola E.", rating: 4, text: "Solid meal, would order again.", date: "1w ago" },
  { id: "r8", customer: "User1029", rating: 3, text: "Average. Nothing special but not bad either.", date: "1w ago" },
];

type Filter = "all" | "5" | "low";
type Sort = "recent" | "high" | "low";

const Reviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>(MOCK);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const total = reviews.length;
  const avg = useMemo(() => reviews.reduce((s, r) => s + r.rating, 0) / Math.max(total, 1), [reviews, total]);

  const breakdown = useMemo(() => {
    const b: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { b[r.rating] = (b[r.rating] || 0) + 1; });
    return b;
  }, [reviews]);

  const visible = useMemo(() => {
    let list = reviews;
    if (filter === "5") list = list.filter((r) => r.rating === 5);
    else if (filter === "low") list = list.filter((r) => r.rating <= 3);
    if (sort === "high") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === "low") list = [...list].sort((a, b) => a.rating - b.rating);
    return list;
  }, [reviews, filter, sort]);

  const submitReply = (id: string) => {
    if (!replyText.trim()) return;
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, reply: replyText.trim() } : r)));
    setReplyingTo(null);
    setReplyText("");
    toast.success("Reply posted");
  };

  return (
    <div className="pb-24 min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-secondary to-secondary/80 px-5 pb-5 pt-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-secondary-foreground active:scale-95 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-secondary-foreground">Reviews & Ratings</h1>
        <p className="text-xs text-secondary-foreground/70">Customer feedback on your store</p>
      </div>

      {/* Summary */}
      <div className="px-4 -mt-3">
        <div className="rounded-2xl bg-card p-4 shadow-sm border border-border/50">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground tabular-nums">{avg.toFixed(1)}</p>
              <div className="mt-0.5 flex justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={11} className={cn(n <= Math.round(avg) ? "text-warning" : "text-muted")} fill="currentColor" />
                ))}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">{total} reviews</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = breakdown[star] || 0;
                const pct = total ? (count / total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-3 text-[10px] font-medium text-muted-foreground tabular-nums">{star}</span>
                    <Star size={9} className="text-warning shrink-0" fill="currentColor" />
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-warning rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-[10px] text-muted-foreground tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filter + Sort */}
      <div className="px-4 mt-4 flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {([
            { k: "all", label: "All" },
            { k: "5", label: "5★" },
            { k: "low", label: "1–3★" },
          ] as const).map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                filter === f.k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground border-0 focus:outline-none"
        >
          <option value="recent">Most Recent</option>
          <option value="high">Highest</option>
          <option value="low">Lowest</option>
        </select>
      </div>

      {/* Reviews list */}
      <div className="px-4 mt-3 space-y-2.5">
        {visible.length === 0 && (
          <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground border border-border/50">
            No reviews match this filter.
          </div>
        )}
        {visible.map((r) => {
          const isNegative = r.rating <= 2;
          return (
            <div
              key={r.id}
              className={cn(
                "rounded-2xl bg-card p-3.5 shadow-sm border transition-colors",
                isNegative ? "border-destructive/30 bg-destructive/[0.03]" : "border-border/50"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{r.customer}</p>
                    {isNegative && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[9px] font-medium text-destructive">
                        <AlertTriangle size={9} /> Needs attention
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={10} className={cn(n <= r.rating ? "text-warning" : "text-muted")} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">· {r.date}</span>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-[13px] leading-relaxed text-foreground">{r.text}</p>
              {r.orderRef && (
                <p className="mt-1 text-[10px] text-muted-foreground">Order {r.orderRef}</p>
              )}

              {isNegative && !r.reply && (
                <div className="mt-2 rounded-lg bg-warning/10 px-2.5 py-1.5 text-[10px] text-warning-foreground/90">
                  💡 Suggested: address delivery time and packaging quality.
                </div>
              )}

              {r.reply && (
                <div className="mt-2.5 rounded-xl bg-primary/8 border border-primary/15 p-2.5">
                  <p className="text-[10px] font-semibold text-primary mb-0.5">Your reply</p>
                  <p className="text-[12px] text-foreground leading-relaxed">{r.reply}</p>
                </div>
              )}

              {!r.reply && replyingTo !== r.id && (
                <button
                  onClick={() => { setReplyingTo(r.id); setReplyText(""); }}
                  className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary active:opacity-70"
                >
                  <MessageSquare size={11} /> Reply
                </button>
              )}

              {replyingTo === r.id && (
                <div className="mt-2.5 space-y-1.5">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a thoughtful reply…"
                    rows={2}
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => { setReplyingTo(null); setReplyText(""); }}
                      className="rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground active:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => submitReply(r.id)}
                      disabled={!replyText.trim()}
                      className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground disabled:opacity-50"
                    >
                      Post Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reviews;
