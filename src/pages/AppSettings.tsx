import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ToggleRowProps {
  label: string;
  subtitle?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}

const ToggleRow = ({ label, subtitle, checked, onChange, icon }: ToggleRowProps) => (
  <div className="flex items-center justify-between px-4 py-3">
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-10 rounded-full transition-colors", checked ? "bg-primary" : "bg-border")}
    >
      <div className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform", checked && "translate-x-4")} />
    </button>
  </div>
);

const AppSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [orderSound, setOrderSound] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("vendoor_theme") !== "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove("light");
      localStorage.setItem("vendoor_theme", "dark");
    } else {
      root.classList.add("light");
      localStorage.setItem("vendoor_theme", "light");
    }
  }, [darkMode]);

  const clearCache = () => {
    toast({ title: "Cache cleared" });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/95 backdrop-blur-md px-4 py-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:bg-muted/70">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-foreground">App Settings</h1>
      </div>

      <div className="px-4 py-6 space-y-4">
        <div className="rounded-2xl bg-card shadow-sm overflow-hidden">
          <ToggleRow label="Notifications" subtitle="Push notifications for orders" checked={notifications} onChange={setNotifications} />
          <div className="h-px bg-border mx-4" />
          <ToggleRow label="Order Sound" subtitle="Play sound on new orders" checked={orderSound} onChange={setOrderSound} />
          <div className="h-px bg-border mx-4" />
          <ToggleRow
            label="Dark Mode"
            subtitle={darkMode ? "Dark theme active" : "Light theme active"}
            checked={darkMode}
            onChange={setDarkMode}
            icon={darkMode ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-warning" />}
          />
        </div>

        <button
          onClick={clearCache}
          className="flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-sm active:bg-muted transition-colors"
        >
          <Trash2 size={18} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Clear Cache</span>
        </button>

        <p className="text-center text-[10px] text-muted-foreground mt-8">VenDoor v1.0.0</p>
      </div>
    </div>
  );
};

export default AppSettings;
