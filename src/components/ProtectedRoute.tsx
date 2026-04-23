import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  children: ReactNode;
  /** When true, requires both email + phone verification AND completed setup. Use for restricted pages. */
  requireSetup?: boolean;
}

interface Status {
  setupCompleted: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
}

const ProtectedRoute = ({ children, requireSetup = false }: Props) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [status, setStatus] = useState<Status | null>(null);
  const [checking, setChecking] = useState(requireSetup);

  useEffect(() => {
    if (!requireSetup || !user) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("setup_completed, business_email_verified, personal_phone_verified")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setStatus({
        setupCompleted: data?.setup_completed ?? false,
        emailVerified: Boolean(user.email_confirmed_at) || (data?.business_email_verified ?? false),
        phoneVerified: data?.personal_phone_verified ?? false,
      });
      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, requireSetup]);

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (requireSetup && status) {
    if (!status.emailVerified || !status.phoneVerified) {
      return <Navigate to="/verify-account" replace />;
    }
    if (!status.setupCompleted) {
      return <Navigate to="/setup/payout" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
