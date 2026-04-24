import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Banknote, KeyRound, ShieldCheck, Loader2, CheckCircle2, Download, Share2, Building2,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PayoutAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  is_primary: boolean;
}

interface PayoutFlowProps {
  open: boolean;
  onClose: () => void;
  availableBalance: number;
  onComplete: () => void;
}

type Step = "amount" | "confirm" | "pin" | "createPin" | "processing" | "receipt";

const formatNgn = (n: number) =>
  `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// Tiny non-cryptographic hash for demo PIN storage (real apps: use bcrypt via edge fn)
const hashPin = async (pin: string): Promise<string> => {
  const enc = new TextEncoder().encode(`vendoor:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const PayoutFlow = ({ open, onClose, availableBalance, onComplete }: PayoutFlowProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<PayoutAccount | null>(null);
  const [pinExists, setPinExists] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [completedTxn, setCompletedTxn] = useState<{
    id: string;
    reference: string;
    amount: number;
    fee: number;
    net: number;
    account: PayoutAccount;
    created_at: string;
  } | null>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep("amount");
      setAmount("");
      setPin("");
      setConfirmPin("");
      setCompletedTxn(null);
    }
  }, [open]);

  // Load accounts + check pin
  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const [{ data: accs }, { data: pinRow }] = await Promise.all([
        supabase
          .from("payout_accounts")
          .select("id, account_name, account_number, bank_name, is_primary")
          .eq("user_id", user.id)
          .order("is_primary", { ascending: false }),
        supabase.from("transaction_pins").select("id").eq("user_id", user.id).maybeSingle(),
      ]);
      setAccounts(accs ?? []);
      setSelectedAccount(accs?.find((a) => a.is_primary) ?? accs?.[0] ?? null);
      setPinExists(Boolean(pinRow));
    })();
  }, [open, user]);

  const PAYOUT_FEE = 50; // flat NGN fee for demo
  const numAmount = Number(amount) || 0;
  const netPayout = Math.max(0, numAmount - PAYOUT_FEE);

  const amountValid =
    numAmount > 0 && numAmount <= availableBalance && numAmount > PAYOUT_FEE;

  const goToConfirm = () => {
    if (!amountValid) {
      toast({
        title: "Invalid amount",
        description:
          numAmount > availableBalance
            ? "Amount exceeds your available balance."
            : numAmount <= PAYOUT_FEE
            ? `Amount must be more than the ${formatNgn(PAYOUT_FEE)} fee.`
            : "Enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedAccount) {
      toast({
        title: "No payout account",
        description: "Add a bank account first.",
        variant: "destructive",
      });
      onClose();
      navigate("/profile/payout-settings");
      return;
    }
    setStep("confirm");
  };

  const goToPin = () => {
    if (pinExists === false) setStep("createPin");
    else setStep("pin");
  };

  const submitNewPin = async () => {
    if (!user) return;
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({ title: "PIN must be 4 digits", variant: "destructive" });
      return;
    }
    if (pin !== confirmPin) {
      toast({ title: "PINs don't match", variant: "destructive" });
      return;
    }
    const hash = await hashPin(pin);
    const { error } = await supabase
      .from("transaction_pins")
      .upsert({ user_id: user.id, pin_hash: hash }, { onConflict: "user_id" });
    if (error) {
      toast({ title: "Couldn't save PIN", description: error.message, variant: "destructive" });
      return;
    }
    setPinExists(true);
    setConfirmPin("");
    // PIN already entered — proceed to process payout
    await processPayout();
  };

  const verifyAndProcess = async () => {
    if (!user) return;
    if (pin.length !== 4) {
      toast({ title: "Enter your 4-digit PIN", variant: "destructive" });
      return;
    }
    const hash = await hashPin(pin);
    const { data: row } = await supabase
      .from("transaction_pins")
      .select("pin_hash")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!row || row.pin_hash !== hash) {
      toast({ title: "Incorrect PIN", description: "Try again.", variant: "destructive" });
      setPin("");
      return;
    }
    await processPayout();
  };

  const processPayout = async () => {
    if (!user || !selectedAccount) return;
    setStep("processing");

    const { data: txn, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "payout",
        status: "pending",
        gross_amount: numAmount,
        commission_amount: PAYOUT_FEE,
        net_amount: netPayout,
        sender: "Vendor Wallet",
        receiver: `${selectedAccount.bank_name} • ${selectedAccount.account_number}`,
        description: "Vendor-initiated payout",
        payout_account_id: selectedAccount.id,
        bank_account_snapshot: {
          account_name: selectedAccount.account_name,
          account_number: selectedAccount.account_number,
          bank_name: selectedAccount.bank_name,
        },
      })
      .select()
      .single();

    if (error || !txn) {
      toast({ title: "Payout failed", description: error?.message ?? "Unknown error", variant: "destructive" });
      setStep("confirm");
      return;
    }

    // Move funds: available -> pending
    const { data: w } = await supabase
      .from("wallets")
      .select("available_balance, pending_balance")
      .eq("user_id", user.id)
      .maybeSingle();

    if (w) {
      await supabase
        .from("wallets")
        .update({
          available_balance: Number(w.available_balance) - numAmount,
          pending_balance: Number(w.pending_balance) + netPayout,
        })
        .eq("user_id", user.id);
    }

    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "payment",
      title: `Payout requested: ${formatNgn(netPayout)}`,
      description: `To ${selectedAccount.bank_name} • ${selectedAccount.account_number}`,
      link: `/earnings/transactions/${txn.id}`,
    });

    setCompletedTxn({
      id: txn.id,
      reference: txn.reference,
      amount: numAmount,
      fee: PAYOUT_FEE,
      net: netPayout,
      account: selectedAccount,
      created_at: txn.created_at,
    });
    setStep("receipt");
    onComplete();
  };

  const buildReceiptText = () => {
    if (!completedTxn) return "";
    return [
      "VENDOOR — PAYOUT RECEIPT",
      "------------------------",
      `Reference:    ${completedTxn.reference}`,
      `Date:         ${format(new Date(completedTxn.created_at), "PPpp")}`,
      "",
      `From:         Vendor Wallet`,
      `To:           ${completedTxn.account.account_name}`,
      `Bank:         ${completedTxn.account.bank_name}`,
      `Account:      ${completedTxn.account.account_number}`,
      "",
      `Amount:       ${formatNgn(completedTxn.amount)}`,
      `Fee:          ${formatNgn(completedTxn.fee)}`,
      `Net Payout:   ${formatNgn(completedTxn.net)}`,
      "",
      "Status:       Pending — funds arrive within 24 hours.",
    ].join("\n");
  };

  const downloadReceipt = () => {
    if (!completedTxn) return;
    const blob = new Blob([buildReceiptText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vendoor-payout-${completedTxn.reference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareReceipt = async () => {
    const text = buildReceiptText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "VenDoor Payout Receipt", text });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Receipt copied to clipboard" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[92vh] overflow-y-auto p-0">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-border sticky top-0 bg-card z-10">
          {step !== "amount" && step !== "receipt" && step !== "processing" && (
            <button
              onClick={() => {
                if (step === "createPin" || step === "pin") setStep("confirm");
                else if (step === "confirm") setStep("amount");
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:bg-muted/70"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h2 className="text-base font-bold text-foreground">
            {step === "amount" && "Request Payout"}
            {step === "confirm" && "Confirm Payout"}
            {step === "pin" && "Enter Transaction PIN"}
            {step === "createPin" && "Create Transaction PIN"}
            {step === "processing" && "Processing…"}
            {step === "receipt" && "Payout Receipt"}
          </h2>
        </div>

        <div className="p-5 space-y-4">
          {/* Step 1: amount */}
          {step === "amount" && (
            <>
              <div className="rounded-2xl bg-secondary p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-secondary-foreground/60">
                  Available Balance
                </p>
                <p className="mt-1 text-2xl font-bold text-secondary-foreground">
                  {formatNgn(availableBalance)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payout-amt" className="text-xs">Amount to withdraw</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">₦</span>
                  <Input
                    id="payout-amt"
                    inputMode="numeric"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="0"
                    className="pl-9 text-lg font-semibold h-14"
                  />
                </div>
                {amount && !amountValid && (
                  <p className="text-xs text-destructive">
                    {numAmount > availableBalance
                      ? "Amount exceeds available balance."
                      : `Minimum payout is ${formatNgn(PAYOUT_FEE + 1)}.`}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  {[25, 50, 100].map((pct) => {
                    const v = Math.floor((availableBalance * pct) / 100);
                    return (
                      <button
                        key={pct}
                        onClick={() => setAmount(String(v))}
                        className="flex-1 rounded-lg bg-muted px-2 py-1.5 text-[11px] font-semibold text-foreground active:bg-muted/70"
                      >
                        {pct === 100 ? "Max" : `${pct}%`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedAccount ? (
                <div className="rounded-xl border border-border p-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {selectedAccount.bank_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">
                      {selectedAccount.account_number} • {selectedAccount.account_name}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { onClose(); navigate("/profile/payout-settings"); }}
                  className="w-full rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground active:bg-muted/50"
                >
                  + Add a payout account first
                </button>
              )}

              <Button onClick={goToConfirm} disabled={!amountValid || !selectedAccount} className="w-full" size="lg">
                Continue
              </Button>
            </>
          )}

          {/* Step 2: confirm */}
          {step === "confirm" && selectedAccount && (
            <>
              <div className="rounded-2xl bg-secondary p-5 text-center">
                <p className="text-[10px] uppercase tracking-wider text-secondary-foreground/60">
                  You will receive
                </p>
                <p className="mt-1 text-3xl font-bold text-secondary-foreground">
                  {formatNgn(netPayout)}
                </p>
              </div>

              <div className="rounded-2xl bg-card border border-border p-4 space-y-2.5">
                <Row label="Amount" value={formatNgn(numAmount)} />
                <Row label="Fee" value={`− ${formatNgn(PAYOUT_FEE)}`} valueClass="text-warning" />
                <div className="h-px bg-border my-1" />
                <Row label="Net Payout" value={formatNgn(netPayout)} valueClass="text-primary font-bold" />
              </div>

              <div className="rounded-2xl bg-card border border-border p-4 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Receiver</p>
                <p className="text-sm font-semibold text-foreground">{selectedAccount.account_name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {selectedAccount.bank_name} • {selectedAccount.account_number}
                </p>
              </div>

              <Button onClick={goToPin} className="w-full" size="lg">
                <ShieldCheck size={16} className="mr-1.5" />
                Confirm with PIN
              </Button>
            </>
          )}

          {/* Step 3a: enter pin */}
          {step === "pin" && (
            <>
              <div className="text-center py-2">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <KeyRound size={26} className="text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter your 4-digit transaction PIN to authorize {formatNgn(netPayout)}.
                </p>
              </div>
              <PinInput value={pin} onChange={setPin} />
              <Button onClick={verifyAndProcess} disabled={pin.length !== 4} className="w-full" size="lg">
                Authorize Payout
              </Button>
            </>
          )}

          {/* Step 3b: create pin */}
          {step === "createPin" && (
            <>
              <div className="text-center py-2">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-warning/10">
                  <KeyRound size={26} className="text-warning" />
                </div>
                <p className="text-sm text-foreground font-semibold">Create your Transaction PIN</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll use this 4-digit PIN to authorize all future payouts.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">New PIN</Label>
                <PinInput value={pin} onChange={setPin} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Confirm PIN</Label>
                <PinInput value={confirmPin} onChange={setConfirmPin} />
              </div>
              <Button
                onClick={submitNewPin}
                disabled={pin.length !== 4 || confirmPin.length !== 4}
                className="w-full"
                size="lg"
              >
                Save PIN & Authorize
              </Button>
            </>
          )}

          {/* Step 4: processing */}
          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={36} className="animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">Processing payout…</p>
              <p className="text-xs text-muted-foreground">Please don't close this screen.</p>
            </div>
          )}

          {/* Step 5: receipt */}
          {step === "receipt" && completedTxn && (
            <>
              <div className="text-center py-3">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
                  <CheckCircle2 size={28} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">Payout requested!</p>
                <p className="text-3xl font-bold text-foreground mt-1">{formatNgn(completedTxn.net)}</p>
                <p className="text-xs text-muted-foreground">Funds arrive within 24 hours.</p>
              </div>

              <div className="rounded-2xl bg-card border border-border p-4 space-y-2.5">
                <Row label="Reference" value={completedTxn.reference} valueClass="font-mono text-xs" />
                <Row label="Date" value={format(new Date(completedTxn.created_at), "PPp")} />
                <div className="h-px bg-border my-1" />
                <Row label="Sender" value="Vendor Wallet" />
                <Row label="Receiver" value={completedTxn.account.account_name} />
                <Row label="Bank" value={completedTxn.account.bank_name} />
                <Row label="Account #" value={completedTxn.account.account_number} valueClass="font-mono" />
                <div className="h-px bg-border my-1" />
                <Row label="Amount" value={formatNgn(completedTxn.amount)} />
                <Row label="Fee" value={`− ${formatNgn(completedTxn.fee)}`} valueClass="text-warning" />
                <Row label="Net" value={formatNgn(completedTxn.net)} valueClass="text-primary font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={downloadReceipt} className="gap-1.5">
                  <Download size={14} /> Download
                </Button>
                <Button variant="outline" onClick={shareReceipt} className="gap-1.5">
                  <Share2 size={14} /> Share
                </Button>
              </div>
              <Button onClick={onClose} className="w-full" size="lg">
                Done
              </Button>
            </>
          )}

          {accounts.length === 0 && step === "amount" && (
            <p className="text-center text-[11px] text-muted-foreground">
              <Banknote size={12} className="inline mr-1" />
              You haven't added a payout account yet.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const Row = ({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
    <span className={cn("text-xs text-foreground text-right", valueClass)}>{value}</span>
  </div>
);

const PinInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <Input
    type="password"
    inputMode="numeric"
    pattern="[0-9]*"
    maxLength={4}
    value={value}
    onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
    placeholder="••••"
    className="text-center text-2xl tracking-[0.6em] h-14 font-bold"
  />
);

export default PayoutFlow;
