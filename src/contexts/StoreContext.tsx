import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useScheduleOpen } from "@/hooks/useStoreSchedule";

interface StoreContextType {
  /** Effective open status — combines schedule + manual override */
  storeOpen: boolean;
  /** Whether the manual toggle is on (vendor's intent) */
  manualOn: boolean;
  /** Whether the schedule says we should be open right now */
  scheduleOpen: boolean;
  setStoreOpen: (open: boolean) => void;
  toggleStore: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const MANUAL_KEY = "vendoor_manual_open";

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [manualOn, setManualOn] = useState<boolean>(() => {
    const raw = localStorage.getItem(MANUAL_KEY);
    return raw === null ? true : raw === "1";
  });
  const scheduleOpen = useScheduleOpen();

  useEffect(() => {
    localStorage.setItem(MANUAL_KEY, manualOn ? "1" : "0");
  }, [manualOn]);

  // Per user choice: manual toggle is the source of truth.
  // Schedule still drives the default until the vendor overrides.
  const storeOpen = manualOn;

  const setStoreOpen = (open: boolean) => setManualOn(open);
  const toggleStore = () => setManualOn((p) => !p);

  return (
    <StoreContext.Provider value={{ storeOpen, manualOn, scheduleOpen, setStoreOpen, toggleStore }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
