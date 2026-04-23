import { useEffect, useState } from "react";
import { ArrowLeft, Save, CalendarClock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DAYS, defaultDay, loadSchedule, saveSchedule, type DaySchedule } from "@/hooks/useStoreSchedule";

const TIMES = Array.from({ length: 24 }, (_, h) => {
  const hour = h % 12 || 12;
  const ampm = h < 12 ? "AM" : "PM";
  return [`${String(h).padStart(2, "0")}:00`, `${hour}:00 ${ampm}`] as [string, string];
});

const ORDERED_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const OperatingHours = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(() => {
    const loaded = loadSchedule();
    return Object.fromEntries(DAYS.map((d) => [d, loaded[d] ?? { ...defaultDay }]));
  });
  const [preOrder, setPreOrder] = useState({
    enabled: false,
    start_time: "06:00",
    end_time: "10:00",
    id: null as string | null,
  });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("pre_order_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setPreOrder({ enabled: data.enabled, start_time: data.start_time, end_time: data.end_time, id: data.id });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const updateDay = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
    setHasChanges(true);
  };

  const updatePreOrder = (k: keyof typeof preOrder, v: boolean | string) => {
    setPreOrder((p) => ({ ...p, [k]: v as never }));
    setHasChanges(true);
  };

  const applyToAll = () => {
    const monday = schedule["Monday"];
    setSchedule(Object.fromEntries(DAYS.map((d) => [d, { ...monday }])));
    setHasChanges(true);
    toast({ title: "Applied Monday's schedule to all days" });
  };

  const handleSave = async () => {
    if (!user) return;
    if (preOrder.enabled && preOrder.start_time >= preOrder.end_time) {
      toast({ title: "Pre-order end time must be after start time", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      saveSchedule(schedule);
      const payload = {
        user_id: user.id,
        enabled: preOrder.enabled,
        start_time: preOrder.start_time,
        end_time: preOrder.end_time,
      };
      if (preOrder.id) {
        await supabase.from("pre_order_settings").update(payload).eq("id", preOrder.id);
      } else {
        const { data } = await supabase.from("pre_order_settings").insert(payload).select().maybeSingle();
        if (data) setPreOrder((p) => ({ ...p, id: data.id }));
      }
      setHasChanges(false);
      toast({ title: "Operating hours saved", description: "Store status will reflect changes immediately." });
      navigate(-1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur-md px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:bg-muted/70">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-foreground">Operating Hours</h1>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving || !hasChanges} className="rounded-xl gap-1.5">
          <Save size={14} />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="px-4 py-4">
        <button onClick={applyToAll} className="text-xs font-medium text-primary mb-4 active:opacity-70">
          Apply Monday's hours to all days
        </button>

        <div className="space-y-3">
          {ORDERED_DAYS.map((day) => {
            const s = schedule[day];
            return (
              <div key={day} className="rounded-xl bg-card p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{day}</span>
                  <button
                    onClick={() => updateDay(day, "enabled", !s.enabled)}
                    className={cn(
                      "relative h-6 w-10 rounded-full transition-colors",
                      s.enabled ? "bg-primary" : "bg-border"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform",
                      s.enabled && "translate-x-4"
                    )} />
                  </button>
                </div>
                {s.enabled && (
                  <div className="flex items-center gap-2">
                    <Select value={s.open} onValueChange={(v) => updateDay(day, "open", v)}>
                      <SelectTrigger className="h-9 flex-1 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIMES.map(([val, label]) => <SelectItem key={val} value={val}>{label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">to</span>
                    <Select value={s.close} onValueChange={(v) => updateDay(day, "close", v)}>
                      <SelectTrigger className="h-9 flex-1 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIMES.map(([val, label]) => <SelectItem key={val} value={val}>{label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pre-order recurring window */}
        <div className="mt-5 rounded-2xl bg-card border border-border p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <CalendarClock size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Pre-Orders</h3>
                <p className="text-[11px] text-muted-foreground">A recurring daily window — set once</p>
              </div>
            </div>
            <Switch
              checked={preOrder.enabled}
              onCheckedChange={(v) => updatePreOrder("enabled", v)}
            />
          </div>
          {preOrder.enabled && (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Starts at</Label>
                  <Select value={preOrder.start_time} onValueChange={(v) => updatePreOrder("start_time", v)}>
                    <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIMES.map(([val, label]) => <SelectItem key={val} value={val}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Ends at</Label>
                  <Select value={preOrder.end_time} onValueChange={(v) => updatePreOrder("end_time", v)}>
                    <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIMES.map(([val, label]) => <SelectItem key={val} value={val}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Customers will see: <span className="font-medium text-foreground">"Pre-orders available from {preOrder.start_time} to {preOrder.end_time}"</span>
              </p>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Status updates instantly. Manual toggle on the dashboard overrides the schedule.
        </p>
      </div>
    </div>
  );
};

export default OperatingHours;
