import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  reference: string;
  type: "sale" | "payout" | "refund" | "adjustment";
  status: "pending" | "completed" | "failed";
  gross_amount: number;
  commission_amount: number;
  net_amount: number;
  sender: string | null;
  receiver: string | null;
  order_id: string | null;
  description: string | null;
  created_at: string;
}

const formatNgn = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [txn, setTxn] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setTxn(data as Transaction | null);
        setLoading(false);
      });
  }, [id, user]);

  const copyRef = async () => {
    if (!txn) return;
    await navigator.clipboard.writeText(txn.reference);
    setCopied(true);
    toast({ title: "Reference copied" });
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!txn) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/95 backdrop-blur-md px-4 py-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-foreground">Transaction</h1>
        </div>
        <div className="p-6 text-center text-sm text-muted-foreground">Transaction not found.</div>
      </div>
    );
  }

  const isInbound = txn.type === "sale" || txn.type === "adjustment";
  const verifyUrl = `${window.location.origin}/verify/${txn.reference}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/95 backdrop-blur-md px-4 py-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:bg-muted/70">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Transaction Details</h1>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Amount card */}
        <div className="rounded-2xl bg-secondary p-5 text-center">
          <div className={cn(
            "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full",
            isInbound ? "bg-success/20" : "bg-warning/20"
          )}>
            {isInbound ? <ArrowDownToLine size={22} className="text-success" /> : <ArrowUpFromLine size={22} className="text-warning" />}
          </div>
          <p className="text-xs font-medium text-secondary-foreground/60 uppercase">{txn.type}</p>
          <p className="mt-1 text-3xl font-bold text-secondary-foreground">{formatNgn(Number(txn.net_amount))}</p>
          <p className={cn(
            "mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
            txn.status === "completed" ? "bg-primary/20 text-primary" : txn.status === "pending" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"
          )}>{txn.status}</p>
        </div>

        {/* Details */}
        <div className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
          <Row label="Sender" value={txn.sender || "—"} />
          <Row label="Receiver" value={txn.receiver || "—"} />
          <Row label="Reference">
            <button onClick={copyRef} className="flex items-center gap-1.5 text-xs font-mono text-foreground active:opacity-70">
              {txn.reference}
              {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} className="text-muted-foreground" />}
            </button>
          </Row>
          {txn.order_id && <Row label="Order" value={txn.order_id} />}
          <Row label="Date" value={format(new Date(txn.created_at), "PPpp")} />
          {txn.type === "sale" && (
            <>
              <div className="h-px bg-border my-1" />
              <Row label="Gross" value={formatNgn(Number(txn.gross_amount))} />
              <Row label="Commission" value={`- ${formatNgn(Number(txn.commission_amount))}`} valueClass="text-warning" />
              <Row label="Net" value={formatNgn(Number(txn.net_amount))} valueClass="text-primary font-bold" />
            </>
          )}
          {txn.description && <Row label="Note" value={txn.description} />}
        </div>

        {/* QR */}
        <div className="rounded-2xl bg-card p-5 shadow-sm flex flex-col items-center">
          <p className="text-xs font-semibold text-foreground mb-3">Verification QR</p>
          <div className="rounded-xl bg-white p-3">
            <QRCodeSVG value={verifyUrl} size={160} level="M" includeMargin={false} />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            Admins can scan this code to verify the transaction by reference.
          </p>
          <p className="mt-1 text-[10px] font-mono text-muted-foreground">{txn.reference}</p>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, children, valueClass }: { label: string; value?: string; children?: React.ReactNode; valueClass?: string }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
    {children ?? <span className={cn("text-xs text-foreground text-right", valueClass)}>{value}</span>}
  </div>
);

export default TransactionDetail;
