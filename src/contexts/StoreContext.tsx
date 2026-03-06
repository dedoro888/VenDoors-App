import { createContext, useContext, useState, ReactNode } from "react";

interface StoreContextType {
  storeOpen: boolean;
  setStoreOpen: (open: boolean) => void;
  toggleStore: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [storeOpen, setStoreOpen] = useState(true);
  const toggleStore = () => setStoreOpen((prev) => !prev);

  return (
    <StoreContext.Provider value={{ storeOpen, setStoreOpen, toggleStore }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
