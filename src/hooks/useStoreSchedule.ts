import { useEffect, useState } from "react";

export interface DaySchedule {
  enabled: boolean;
  open: string;  // "HH:MM"
  close: string; // "HH:MM"
}

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const STORAGE_KEY = "vendoor_schedule";

export const defaultDay: DaySchedule = { enabled: true, open: "08:00", close: "22:00" };

export const loadSchedule = (): Record<string, DaySchedule> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return Object.fromEntries(DAYS.map((d) => [d, { ...defaultDay }]));
};

export const saveSchedule = (schedule: Record<string, DaySchedule>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  // Notify same-tab listeners
  window.dispatchEvent(new Event("vendoor:schedule-updated"));
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};

export const isWithinSchedule = (schedule: Record<string, DaySchedule>, now = new Date()): boolean => {
  const day = DAYS[now.getDay()];
  const today = schedule[day];
  if (!today || !today.enabled) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const open = toMinutes(today.open);
  const close = toMinutes(today.close);
  // Handle close < open (overnight) gracefully
  if (close <= open) return minutes >= open || minutes < close;
  return minutes >= open && minutes < close;
};

/**
 * Returns whether the store SHOULD be open based on the schedule + current time.
 * Re-evaluates every minute and on schedule updates.
 */
export const useScheduleOpen = (): boolean => {
  const [open, setOpen] = useState(() => isWithinSchedule(loadSchedule()));

  useEffect(() => {
    const evaluate = () => setOpen(isWithinSchedule(loadSchedule()));
    evaluate();
    const interval = setInterval(evaluate, 60_000);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) evaluate();
    };
    const onCustom = () => evaluate();
    window.addEventListener("storage", onStorage);
    window.addEventListener("vendoor:schedule-updated", onCustom);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("vendoor:schedule-updated", onCustom);
    };
  }, []);

  return open;
};
