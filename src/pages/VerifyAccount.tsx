import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSetupProgress } from "@/hooks/useSetupProgress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const VerifyAccount = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { progress, loading, refresh } = useSetupProgress();
  const [resending, setResending] = useState(false);

  const emailVerified = Boolean(user?.email_confirmed_at) || progress.business_email_verified;
  const phoneVerified = progress.personal_phone_verified;
  const allDone = emailVerified && phoneVerified;

  const resendEmail = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      toast({ title: "Verification email sent", description: `Check ${user.email}.` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not resend";
      toast({ title: "Could not resend", description: msg, variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/95 backdrop-blur px-4 py-3 border-b border-border">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-muted">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-foreground">Verify Your Account</h1>
          <p className="text-[11px] text-muted-foreground">Required to receive payouts</p>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-4">
        <div className="rounded-2xl bg-card border border-border p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              emailVerified ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {emailVerified ? <CheckCircle2 size={20} /> : <Mail size={20} />}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Business Email</h3>
              <p className="text-[11px] text-muted-foreground break-all">{user?.email}</p>
              {emailVerified ? (
                <p className="text-[11px] text-primary font-medium mt-1">✓ Verified</p>
              ) : (
                <p className="text-[11px] text-amber-600 font-medium mt-1">Pending verification</p>
              )}
            </div>
            {!emailVerified && (
              <Button size="sm" variant="outline" onClick={resendEmail} disabled={resending}>
                {resending ? <Loader2 className="animate-spin" size={14} /> : "Resend"}
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              phoneVerified ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {phoneVerified ? <CheckCircle2 size={20} /> : <Phone size={20} />}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Personal Phone</h3>
              {phoneVerified ? (
                <p className="text-[11px] text-primary font-medium mt-1">✓ Verified</p>
              ) : (
                <p className="text-[11px] text-amber-600 font-medium mt-1">Pending OTP</p>
              )}
            </div>
            {!phoneVerified && (
              <Button size="sm" onClick={() => navigate("/verify-phone")}>
                Verify
              </Button>
            )}
          </div>
        </div>

        {allDone && (
          <Button onClick={() => navigate("/setup/payout")} className="w-full mt-4">
            Continue Setup
          </Button>
        )}
      </div>
    </div>
  );
};

export default VerifyAccount;
