import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Building2 } from "lucide-react";
import BusinessProfileForm from "@/components/BusinessProfileForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const SetupBusiness = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").update({ setup_step: 2 }).eq("user_id", user.id);
  }, [user]);

  const handleSaved = async () => {
    if (user) {
      await supabase.from("profiles").update({ setup_step: 3 }).eq("user_id", user.id);
    }
    navigate("/setup/hours");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Business Profile</h2>
            <p className="text-[11px] text-muted-foreground">What customers will see in the marketplace</p>
          </div>
        </div>
      </div>

      <BusinessProfileForm submitLabel="Continue" onSaved={handleSaved} />
    </div>
  );
};

export default SetupBusiness;
