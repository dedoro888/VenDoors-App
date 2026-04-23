import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const VerifyPhone = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const initialPhone = (location.state as { phone?: string } | null)?.phone || "";

  const [phone, setPhone] = useState(initialPhone);
  const [step, setStep] = useState<"enter" | "verify">(initialPhone ? "enter" : "enter");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const sendCode = async () => {
    if (!phone || phone.length < 8) {
      toast({ title: "Enter a valid phone number with country code", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      toast({ title: "Code sent", description: `Check ${phone} for your verification code.` });
      setStep("verify");
      setCooldown(45);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not send code";
      toast({
        title: "Could not send code",
        description: msg.includes("provider") || msg.includes("phone")
          ? "Phone authentication isn't configured yet. Ask your admin to enable an SMS provider in Cloud → Users → Auth Settings."
          : msg,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    if (otp.length !== 6) return;
    setVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
      if (error) throw error;

      // Mark verified on personal_info + profiles
      if (user) {
        await Promise.all([
          supabase.from("personal_info").update({ personal_phone: phone, personal_phone_verified: true }).eq("user_id", user.id),
          supabase.from("profiles").update({ personal_phone_verified: true }).eq("user_id", user.id),
        ]);
      }
      toast({ title: "Phone verified", description: "You're all set." });
      navigate("/setup/payout", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid code";
      toast({ title: "Verification failed", description: msg, variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 pt-10 pb-24">
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            {step === "verify" ? <CheckCircle2 size={26} /> : <Phone size={26} />}
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {step === "verify" ? "Enter verification code" : "Verify your phone"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {step === "verify"
              ? `We sent a 6-digit code to ${phone}`
              : "We'll send a code to confirm your number"}
          </p>
        </div>

        {step === "enter" ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Personal Phone Number</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 801 234 5678"
              />
              <p className="text-[10px] text-muted-foreground">Include your country code (e.g. +234).</p>
            </div>
            <Button onClick={sendCode} disabled={sending} className="w-full">
              {sending ? <Loader2 className="animate-spin" size={16} /> : "Send Code"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={verifyCode} disabled={verifying || otp.length !== 6} className="w-full">
              {verifying ? <Loader2 className="animate-spin" size={16} /> : "Verify & Continue"}
            </Button>
            <button
              type="button"
              onClick={sendCode}
              disabled={cooldown > 0 || sending}
              className="w-full text-xs text-muted-foreground active:text-primary disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
            <button
              type="button"
              onClick={() => setStep("enter")}
              className="w-full text-xs text-primary"
            >
              Change phone number
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPhone;
