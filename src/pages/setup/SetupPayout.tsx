import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Banknote, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const BANKS = [
  "Access Bank", "First Bank", "GTBank", "UBA", "Zenith Bank",
  "Wema Bank", "Kuda Bank", "Opay", "Moniepoint", "Stanbic IBTC",
  "Sterling Bank", "FCMB", "Fidelity Bank", "Polaris Bank", "Union Bank",
];

const SetupPayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAcct, setShowAcct] = useState(false);
  const [form, setForm] = useState({
    account_name: "",
    account_number: "",
    bank_name: "",
  });
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("payout_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_primary", true)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setExistingId(data.id);
        setForm({
          account_name: data.account_name,
          account_number: data.account_number,
          bank_name: data.bank_name,
        });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.account_name.trim() || !form.account_number.trim() || !form.bank_name) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    if (!/^\d{10}$/.test(form.account_number.trim())) {
      toast({ title: "Account number must be 10 digits", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (existingId) {
        const { error } = await supabase
          .from("payout_accounts")
          .update({ ...form, is_primary: true })
          .eq("id", existingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("payout_accounts")
          .insert({ ...form, user_id: user.id, is_primary: true });
        if (error) throw error;
      }
      await supabase
        .from("profiles")
        .update({ setup_step: 2 })
        .eq("user_id", user.id);
      navigate("/setup/business");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Banknote size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Settlement Account</h2>
            <p className="text-[11px] text-muted-foreground">Where we'll send your earnings</p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="account_name" className="text-xs">Account Holder Name</Label>
        <Input
          id="account_name"
          value={form.account_name}
          onChange={(e) => update("account_name", e.target.value)}
          placeholder="As shown on your bank account"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="account_number" className="text-xs">Account Number</Label>
        <div className="relative">
          <Input
            id="account_number"
            value={form.account_number}
            onChange={(e) => update("account_number", e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="0123456789"
            type={showAcct ? "text" : "password"}
            inputMode="numeric"
            maxLength={10}
            required
          />
          <button
            type="button"
            onClick={() => setShowAcct((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showAcct ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bank_name" className="text-xs">Bank Name</Label>
        <Select value={form.bank_name} onValueChange={(v) => update("bank_name", v)}>
          <SelectTrigger><SelectValue placeholder="Select your bank" /></SelectTrigger>
          <SelectContent>
            {BANKS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-muted/50 p-3">
        <p className="text-[11px] text-muted-foreground">
          🔒 Your payout details are encrypted and only used for settlements.
        </p>
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? <Loader2 className="animate-spin" size={16} /> : "Continue"}
      </Button>
    </form>
  );
};

export default SetupPayout;
