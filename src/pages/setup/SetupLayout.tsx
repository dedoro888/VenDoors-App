import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Store } from "lucide-react";
import SetupProgressBar from "@/components/SetupProgressBar";
import { useSetupProgress } from "@/hooks/useSetupProgress";
import { Loader2 } from "lucide-react";

const STEP_PATHS = [
  { step: 1, path: "/setup/payout", label: "Payout" },
  { step: 2, path: "/setup/business", label: "Profile" },
  { step: 3, path: "/setup/hours", label: "Hours" },
  { step: 4, path: "/setup/plan", label: "Plan" },
];

const SetupLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { progress, loading } = useSetupProgress();
  const [redirected, setRedirected] = useState(false);

  // Resolve current step from URL
  const current = STEP_PATHS.find((s) => location.pathname.startsWith(s.path))?.step ?? 1;

  useEffect(() => {
    if (loading || redirected) return;
    // If already finished setup, kick to dashboard.
    if (progress.setup_completed) {
      navigate("/dashboard", { replace: true });
      setRedirected(true);
    }
  }, [loading, progress.setup_completed, navigate, redirected]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 pt-8 pb-32">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Store size={16} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Vendor Setup</h1>
            <p className="text-[10px] text-muted-foreground">Almost there — let's get your store ready</p>
          </div>
        </div>

        <div className="mb-6">
          <SetupProgressBar
            current={current}
            total={4}
            labels={STEP_PATHS.map((s) => s.label)}
          />
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default SetupLayout;
