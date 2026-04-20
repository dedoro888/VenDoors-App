import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface VerifyResult {
  reference: string;
  type: string;
  status: string;
  net_amount: number;
  created_at: string;
  business_name: string | null;
}

const formatNgn = (n: number) =>
  `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const VerifyTransaction = () => {
  const { reference } = useParams<{ reference: string }>();
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reference) return;
    supabase
      .rpc("verify_transaction", { _reference: reference })
      .then(({ data }) => {
        const row = Array.isArray(data) ? data[0] : null;
        setResult(row ?? null);
        setLoading(false);
      });
  }, [reference]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-card shadow-lg p-6 text-center">
        {loading ? (
          <>
            <Loader2 size={36} className="mx-auto mb-3 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Verifying transaction…</p>
          </>
        ) : result ? (
          <>
            <div className={cn(
              "mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full",
              result.status === "completed" ? "bg-primary/15" : "bg-warning/15"
            )}>
              <CheckCircle2 size={32} className={result.status === "completed" ? "text-primary" : "text-warning"} />
            </div>
            <h1 className="text-lg font-bold text-foreground">Transaction Valid</h1>
            <p className="mt-1 text-xs text-muted-foreground">Verified against VenDoor records</p>

            <div className="mt-5 space-y-2 text-left rounded-xl bg-muted/40 p-4">
              <Row label="Reference" value={result.reference} mono />
              <Row label="Type" value={result.type} capitalize />
              <Row label="Status" value={result.status} capitalize />
              <Row label="Amount" value={formatNgn(result.net_amount)} bold />
              <Row label="Vendor" value={result.business_name || "—"} />
              <Row label="Date" value={format(new Date(result.created_at), "PPpp")} />
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15">
              <XCircle size={32} className="text-destructive" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Invalid Transaction</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              No record found for reference <span className="font-mono">{reference}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value, mono, bold, capitalize }: { label: string; value: string; mono?: boolean; bold?: boolean; capitalize?: boolean }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    <span className={cn("text-xs text-foreground", mono && "font-mono", bold && "font-bold text-primary", capitalize && "capitalize")}>{value}</span>
  </div>
);

export default VerifyTransaction;
