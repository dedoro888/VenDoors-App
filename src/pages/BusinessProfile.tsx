import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BusinessProfileForm from "@/components/BusinessProfileForm";

const BusinessProfile = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/95 backdrop-blur px-4 py-3 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full active:bg-muted"
          aria-label="Back"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-foreground">Business Profile</h1>
          <p className="text-[11px] text-muted-foreground">Name, address, logo, and banner</p>
        </div>
      </div>

      <div className="px-4 pt-5">
        <BusinessProfileForm submitLabel="Save Changes" onSaved={() => navigate("/profile")} />
      </div>
    </div>
  );
};

export default BusinessProfile;
