import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = Array.from({ length: 24 }, (_, h) => {
  const hour = h % 12 || 12;
  const ampm = h < 12 ? "AM" : "PM";
  return [`${String(h).padStart(2, "0")}:00`, `${hour}:00 ${ampm}`];
});

interface DaySchedule {
  enabled: boolean;
  open: string;
  close: string;
}

const defaultSchedule: DaySchedule = { enabled: true, open: "08:00", close: "22:00" };

const LAST_HOURS_CHANGE_KEY = "vendoor_last_hours_change";

const OperatingHours = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(
    Object.fromEntries(DAYS.map((d) => [d, { ...defaultSchedule }]))
  );

  const canChangeToday = () => {
    const lastChange = localStorage.getItem(LAST_HOURS_CHANGE_KEY);
    if (!lastChange) return true;
    const today = new Date().toDateString();
    return lastChange !== today;
  };

  const updateDay = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
    setHasChanges(true);
  };

  const applyToAll = () => {
    const monday = schedule["Monday"];
    setSchedule(Object.fromEntries(DAYS.map((d) => [d, { ...monday }])));
    setHasChanges(true);
    toast({ title: "Applied Monday's schedule to all days" });
  };

  const handleSave = async () => {
    if (!canChangeToday()) {
      toast({ title: "Daily limit reached", description: "You can only change operating hours once per day.", variant: "destructive" });
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem(LAST_HOURS_CHANGE_KEY, new Date().toDateString());
    setSaving(false);
    setHasChanges(false);
    toast({ title: "Operating hours saved" });
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur-md px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:bg-muted/70">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-foreground">Operating Hours</h1>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="rounded-xl gap-1.5"
        >
          <Save size={14} />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {!canChangeToday() && (
        <div className="mx-4 mt-4 rounded-xl bg-warning/10 border border-warning/20 p-3">
          <p className="text-xs text-warning font-medium">You've already updated your hours today. Changes can be made again tomorrow.</p>
        </div>
      )}

      <div className="px-4 py-4">
        <button onClick={applyToAll} className="text-xs font-medium text-primary mb-4 active:opacity-70">
          Apply Monday's hours to all days
        </button>

        <div className="space-y-3">
          {DAYS.map((day) => {
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
                      <SelectTrigger className="h-9 flex-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMES.map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">to</span>
                    <Select value={s.close} onValueChange={(v) => updateDay(day, "close", v)}>
                      <SelectTrigger className="h-9 flex-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMES.map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OperatingHours;
