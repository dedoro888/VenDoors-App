import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface SetupProgress {
  setup_step: number;
  setup_completed: boolean;
  profile_completed: boolean;
  business_email_verified: boolean;
  personal_phone_verified: boolean;
  has_payout_account: boolean;
  has_business_profile: boolean;
}

const EMPTY: SetupProgress = {
  setup_step: 1,
  setup_completed: false,
  profile_completed: false,
  business_email_verified: false,
  personal_phone_verified: false,
  has_payout_account: false,
  has_business_profile: false,
};

export const useSetupProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<SetupProgress>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setProgress(EMPTY);
      setLoading(false);
      return;
    }
    const [{ data: profile }, { count: payoutCount }] = await Promise.all([
      supabase
        .from("profiles")
        .select("setup_step, setup_completed, profile_completed, business_email_verified, personal_phone_verified, business_name, business_address, logo_url")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("payout_accounts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    setProgress({
      setup_step: profile?.setup_step ?? 1,
      setup_completed: profile?.setup_completed ?? false,
      profile_completed: profile?.profile_completed ?? false,
      business_email_verified: profile?.business_email_verified ?? false,
      personal_phone_verified: profile?.personal_phone_verified ?? false,
      has_payout_account: (payoutCount ?? 0) > 0,
      has_business_profile: Boolean(profile?.business_name && profile?.business_address),
    });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { progress, loading, refresh };
};
