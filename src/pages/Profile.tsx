import { ChevronRight, Store, CreditCard, Clock, HelpCircle, LogOut, Settings } from "lucide-react";

const menuSections = [
  {
    title: "Business",
    items: [
      { icon: Store, label: "Store Settings", subtitle: "Name, address, logo" },
      { icon: Clock, label: "Operating Hours", subtitle: "Set your schedule" },
      { icon: CreditCard, label: "Payout Settings", subtitle: "Bank account details" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help & Support", subtitle: "FAQs and contact us" },
      { icon: Settings, label: "App Settings", subtitle: "Notifications, language" },
    ],
  },
];

const Profile = () => {
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-secondary px-5 pb-8 pt-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
          AJ
        </div>
        <p className="mt-3 text-lg font-semibold text-secondary-foreground">Amaka's Kitchen</p>
        <p className="text-xs text-secondary-foreground/60">amaka@vendoor.com</p>
      </div>

      {/* Menu Sections */}
      <div className="px-4 -mt-4 space-y-4">
        {menuSections.map((section) => (
          <div key={section.title} className="rounded-2xl bg-card shadow-sm overflow-hidden">
            <p className="px-4 pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </p>
            {section.items.map((item, i) => (
              <button
                key={item.label}
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

        <button className="flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-sm active:bg-muted transition-colors">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10">
            <LogOut size={18} className="text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive">Log Out</p>
        </button>
      </div>
    </div>
  );
};

export default Profile;
