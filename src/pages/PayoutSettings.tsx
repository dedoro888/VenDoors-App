import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BANKS = ["Access Bank", "First Bank", "GTBank", "UBA", "Zenith Bank", "Wema Bank", "Kuda Bank", "Opay", "Moniepoint"];

const PayoutSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [form, setForm] = useState({
    bank: "GTBank",
    accountNumber: "0123456789",
    accountName: "Amaka Johnson",
  });

  const maskedNumber = showAccount ? form.accountNumber : `**** ${form.accountNumber.slice(-4)}`;

  const handleSave = async () => {
    if (!form.bank || !form.accountNumber) {
      toast({ title: "Required fields missing", variant: "destructive" });
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast({ title: "Payout settings saved" });
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/95 backdrop-blur-md px-4 py-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:bg-muted/70">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Payout Settings</h1>
      </div>

      <div className="px-4 py-6 space-y-5">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bank Name</label>
          <Select value={form.bank} onValueChange={(v) => setForm((p) => ({ ...p, bank: v }))}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BANKS.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Account Number</label>
          <div className="relative">
            <Input value={maskedNumber} readOnly className="pr-10" />
            <button
              onClick={() => setShowAccount(!showAccount)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showAccount ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Account Name</label>
          <Input value={form.accountName} readOnly className="opacity-60" />
        </div>

        <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
          <p className="text-xs text-muted-foreground">
            To update your payout details, you'll need to verify your identity. Contact support for changes.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-background/95 backdrop-blur-md p-4">
        <Button className="w-full h-12 rounded-xl font-semibold" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default PayoutSettings;
