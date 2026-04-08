import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const BANKS = ["Access Bank", "First Bank", "GTBank", "UBA", "Zenith Bank", "Wema Bank", "Kuda Bank", "Opay", "Moniepoint"];

const LAST_PAYOUT_CHANGE_KEY = "vendoor_last_payout_change";

const PayoutSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [form, setForm] = useState({
    bank: "GTBank",
    accountNumber: "0123456789",
    accountName: "Amaka Johnson",
  });

  const maskedNumber = showAccount ? form.accountNumber : `**** ${form.accountNumber.slice(-4)}`;

  const canChangeThisMonth = () => {
    const lastChange = localStorage.getItem(LAST_PAYOUT_CHANGE_KEY);
    if (!lastChange) return true;
    const lastDate = new Date(lastChange);
    const now = new Date();
    return lastDate.getMonth() !== now.getMonth() || lastDate.getFullYear() !== now.getFullYear();
  };

  const updateField = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveClick = () => {
    if (!form.bank || !form.accountNumber) {
      toast({ title: "Required fields missing", variant: "destructive" });
      return;
    }
    if (!canChangeThisMonth()) {
      toast({ title: "Monthly limit reached", description: "Payout details can only be changed once per month. Contact support for urgent changes.", variant: "destructive" });
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setConfirmOpen(false);
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem(LAST_PAYOUT_CHANGE_KEY, new Date().toISOString());
    setSaving(false);
    setEditing(false);
    setHasChanges(false);
    toast({ title: "Payout settings saved" });
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur-md px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:bg-muted/70">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-foreground">Payout Settings</h1>
        </div>
        {editing && (
          <Button
            size="sm"
            onClick={handleSaveClick}
            disabled={saving || !hasChanges}
            className="rounded-xl gap-1.5"
          >
            <Save size={14} />
            {saving ? "Saving..." : "Save"}
          </Button>
        )}
      </div>

      {!canChangeThisMonth() && (
        <div className="mx-4 mt-4 rounded-xl bg-warning/10 border border-warning/20 p-3">
          <p className="text-xs text-warning font-medium">Payout details were already updated this month. Contact support for urgent changes.</p>
        </div>
      )}

      <div className="px-4 py-6 space-y-5">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bank Name</label>
          {editing ? (
            <Select value={form.bank} onValueChange={(v) => updateField("bank", v)}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BANKS.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input value={form.bank} readOnly className="opacity-60" />
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Account Number</label>
          <div className="relative">
            {editing ? (
              <Input
                value={form.accountNumber}
                onChange={(e) => updateField("accountNumber", e.target.value)}
                className="pr-10"
                maxLength={10}
              />
            ) : (
              <Input value={maskedNumber} readOnly className="pr-10" />
            )}
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
          {editing ? (
            <Input
              value={form.accountName}
              onChange={(e) => updateField("accountName", e.target.value)}
            />
          ) : (
            <Input value={form.accountName} readOnly className="opacity-60" />
          )}
        </div>

        {!editing && (
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => {
              if (!canChangeThisMonth()) {
                toast({ title: "Monthly limit reached", description: "Contact Customer Service → Update Payout Info for urgent changes.", variant: "destructive" });
                return;
              }
              setEditing(true);
            }}
          >
            Edit Bank Details
          </Button>
        )}

        <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
          <p className="text-xs text-muted-foreground">
            Payout details can be changed once per month for security. For urgent changes, go to Help & Support → Update Payout Info.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Payout Changes</DialogTitle>
            <DialogDescription>
              Are you sure you want to update your bank details to {form.bank} - {form.accountNumber}? This can only be changed once per month.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleConfirmSave}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayoutSettings;
