import { useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import BusinessProfileForm from "@/components/BusinessProfileForm";

const OnboardBusinessProfile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 pt-10 pb-24">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Store size={22} />
          </div>
          <h1 className="text-xl font-bold text-foreground">Set up your business</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Step 1 of onboarding — this is what customers will see.
          </p>
        </div>

        <BusinessProfileForm
          submitLabel="Continue"
          onSaved={() => navigate("/dashboard", { replace: true })}
        />
      </div>
    </div>
  );
};

export default OnboardBusinessProfile;
