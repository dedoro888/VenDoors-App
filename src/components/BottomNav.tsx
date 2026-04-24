import { Home, ClipboardList, UtensilsCrossed, Wallet, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: ClipboardList, label: "Orders", path: "/orders" },
  { icon: UtensilsCrossed, label: "Menu", path: "/menu" },
  { icon: Wallet, label: "Earnings", path: "/earnings" },
  { icon: User, label: "Profile", path: "/profile" },
];

// Routes where the bottom nav must be fully hidden
const HIDDEN_PREFIXES = [
  "/",          // index redirect (handled exactly below)
  "/auth",
  "/verify",
  "/verify-account",
  "/verify-phone",
  "/setup",
  "/onboarding",
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const hideNav =
    path === "/" ||
    HIDDEN_PREFIXES.some((p) => p !== "/" && (path === p || path.startsWith(p + "/")));

  if (hideNav) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = path === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  isActive && "bg-primary/10"
                )}
              >
                <item.icon size={20} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
