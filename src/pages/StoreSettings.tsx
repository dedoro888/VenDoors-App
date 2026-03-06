import { useState } from "react";
import { ArrowLeft, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const StoreSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "Amaka's Kitchen",
    email: "amaka@vendoor.com",
    phone: "+234 801 234 5678",
    address: "12 Marina Road, Lagos Island",
    description: "Authentic Nigerian dishes made with love.",
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address) {
      toast({ title: "Required fields missing", description: "Name, phone, and address are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast({ title: "Settings saved" });
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/95 backdrop-blur-md px-4 py-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:bg-muted/70">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Store Settings</h1>
      </div>

      <div className="px-4 py-6 space-y-5">
        {/* Logo */}
        <div className="flex justify-center">
          <button className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground group">
            AJ
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-active:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Store Name *</label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
            <Input value={form.email} readOnly className="opacity-60" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone Number *</label>
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Store Address *</label>
            <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} />
          </div>
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

export default StoreSettings;
