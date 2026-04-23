import { useEffect, useState } from "react";
import { ChevronRight, Store, CreditCard, Clock, HelpCircle, LogOut, Settings, Camera, Building2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const menuSections = [
  {
    title: "Business",
    items: [
      { icon: Building2, label: "Business Profile", subtitle: "Name, address, logo, banner", path: "/profile/business-profile" },
      { icon: Sparkles, label: "Business Suite", subtitle: "View & upgrade your plan", path: "/profile/packages" },
      { icon: Store, label: "Store Settings", subtitle: "Operating preferences", path: "/profile/store-settings" },
      { icon: Clock, label: "Operating Hours", subtitle: "Schedule & pre-orders", path: "/profile/operating-hours" },
      { icon: CreditCard, label: "Payout Settings", subtitle: "Bank account details", path: "/profile/payout-settings" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help & Support", subtitle: "FAQs and contact us", path: "/profile/help-support" },
      { icon: Settings, label: "App Settings", subtitle: "Notifications, language", path: "/profile/app-settings" },
    ],
  },
];

const Profile = () => {
  const navigate = useNavigate();
  const { storeOpen, setStoreOpen } = useStore();
  const { user, signOut } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);
  const [profile, setProfile] = useState<{ business_name: string | null; logo_url: string | null; banner_url: string | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("business_name, logo_url, banner_url")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) setProfile(data ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const businessName = profile?.business_name || (user?.user_metadata?.business_name as string) || "Your Store";
  const email = user?.email || "";
  const initials = businessName.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const logoUrl = profile?.logo_url;
  const bannerUrl = profile?.banner_url;

  const handleLogout = async () => {
    setLogoutOpen(false);
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="pb-24">
      {/* Profile Header with cover banner */}
      <div className="relative bg-secondary">
        <div className="h-28 w-full overflow-hidden">
          {bannerUrl ? (
            <img src={bannerUrl} alt="Cover banner" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/30 to-secondary" />
          )}
        </div>
        <div className="px-5 pb-6 pt-0 text-center">
          <button
            onClick={() => navigate("/profile/business-profile")}
            className="relative -mt-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground ring-4 ring-secondary overflow-hidden group"
            aria-label="Edit business profile"
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-active:opacity-100 transition-opacity">
              <Camera size={18} className="text-primary-foreground" />
            </div>
          </button>
          <button onClick={() => navigate("/profile/business-profile")} className="mt-3 block mx-auto">
            <p className="text-lg font-semibold text-secondary-foreground">{businessName}</p>
            <p className="text-xs text-secondary-foreground/60">{email}</p>
          </button>
        </div>
      </div>

      {/* Store Status Toggle — separate card below header */}
      <div className="px-4 mt-5 mb-4">
        <button
          onClick={() => setStoreOpen(!storeOpen)}
          className={cn(
            "flex w-full items-center justify-between rounded-2xl px-4 py-3.5 shadow-sm transition-colors",
            storeOpen ? "bg-primary/10 border border-primary/20" : "bg-destructive/10 border border-destructive/20"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn("h-3 w-3 rounded-full", storeOpen ? "bg-primary animate-live-pulse" : "bg-destructive animate-pulse-red")} />
            <span className={cn("text-sm font-semibold", storeOpen ? "text-primary" : "text-destructive")}>
              {storeOpen ? "Open for Orders" : "Closed"}
            </span>
          </div>
          <div className={cn(
            "relative h-7 w-12 rounded-full transition-colors",
            storeOpen ? "bg-primary" : "bg-destructive/40"
          )}>
            <div className={cn(
              "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-card shadow transition-transform",
              storeOpen && "translate-x-5"
            )} />
          </div>
        </button>
      </div>

      {/* Menu Sections */}
      <div className="px-4 space-y-4">
        {menuSections.map((section) => (
          <div key={section.title} className="rounded-2xl bg-card shadow-sm overflow-hidden">
            <p className="px-4 pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </p>
            {section.items.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex w-full items-center gap-3 px-4 py-3 active:bg-muted transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  <item.icon size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        ))}

        <button
          onClick={() => setLogoutOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-sm active:bg-muted transition-colors"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10">
            <LogOut size={18} className="text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive">Log Out</p>
        </button>
      </div>

      {/* Avatar Bottom Sheet */}
      <Sheet open={avatarSheetOpen} onOpenChange={setAvatarSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Update Store Logo</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-1">
            {["Take Photo", "Upload from Gallery", "Remove Logo"].map((opt) => (
              <button
                key={opt}
                onClick={() => setAvatarSheetOpen(false)}
                className={cn(
                  "w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors active:bg-muted",
                  opt === "Remove Logo" ? "text-destructive" : "text-foreground"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Logout Confirmation */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle>Log Out?</DialogTitle>
            <DialogDescription>Are you sure you want to log out?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setLogoutOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleLogout}>Log Out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
