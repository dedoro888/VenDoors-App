import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Store, Mail, Lock, User, Phone, Building2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("signin");
  const [signupStep, setSignupStep] = useState<1 | 2>(1); // 1 = business, 2 = personal + creds
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [form, setForm] = useState({
    // Business
    businessName: "",
    businessPhone: "",
    businessRegistered: false,
    isOwner: true,
    // Personal
    firstName: "",
    lastName: "",
    personalPhone: "",
    personalEmail: "",
    // Credentials
    email: "",
    password: "",
  });

  const from = (location.state as { from?: string } | null)?.from || "/dashboard";

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("setup_completed, profile_completed, business_email_verified, personal_phone_verified")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;

      if (data?.setup_completed) {
        navigate(from, { replace: true });
        return;
      }

      // Email needs verification or phone needs verification?
      const emailOk = Boolean(user.email_confirmed_at) || data?.business_email_verified;
      const phoneOk = data?.personal_phone_verified;
      if (!emailOk || !phoneOk) {
        navigate("/verify-account", { replace: true });
        return;
      }

      // Otherwise jump into wizard
      navigate("/setup/payout", { replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, navigate, from]);

  const update = (k: keyof typeof form, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) throw error;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast({
        title: "Sign in failed",
        description: msg.includes("Invalid login") ? "Invalid email or password" : msg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) {
      toast({ title: "Business name is required", variant: "destructive" });
      return;
    }
    setSignupStep(2);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.personalPhone.trim()) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            business_name: form.businessName,
            phone: form.businessPhone,
          },
        },
      });
      if (error) throw error;

      // Persist personal info + legitimacy fields
      if (data.user) {
        await Promise.all([
          supabase.from("personal_info").upsert(
            {
              user_id: data.user.id,
              first_name: form.firstName,
              last_name: form.lastName,
              personal_phone: form.personalPhone,
              personal_email: form.personalEmail || null,
            },
            { onConflict: "user_id" }
          ),
          supabase
            .from("profiles")
            .update({
              business_registered: form.businessRegistered,
              is_owner: form.isOwner,
              phone: form.businessPhone || null,
            })
            .eq("user_id", data.user.id),
        ]);
      }

      toast({
        title: "Welcome to VenDoor",
        description: "Check your inbox to verify your business email.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Sign up failed", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast({ title: "Google sign-in failed", description: String(result.error), variant: "destructive" });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-md mx-auto w-full">
        {/* Brand */}
        <div className="text-center mb-7">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Store size={28} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">VenDoor for Vendors</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to manage your store"
              : signupStep === 1
              ? "Tell us about your business"
              : "A bit about you"}
          </p>
        </div>

        {/* Mode Switch */}
        {!(mode === "signup" && signupStep === 2) && (
          <div className="mb-5 grid grid-cols-2 rounded-xl bg-muted p-1">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setSignupStep(1);
                }}
                className={cn(
                  "rounded-lg py-2 text-xs font-semibold transition-colors",
                  mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
        )}

        {/* SIGN IN */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-3">
            <FieldEmail value={form.email} onChange={(v) => update("email", v)} />
            <FieldPassword value={form.password} onChange={(v) => update("password", v)} />
            <Button type="submit" disabled={submitting} className="w-full mt-2">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
            </Button>
          </form>
        )}

        {/* SIGN UP — STEP 1 */}
        {mode === "signup" && signupStep === 1 && (
          <form onSubmit={handleNextSignup} className="space-y-3">
            <Field
              id="businessName" label="Business Name" required icon={Building2}
              value={form.businessName} onChange={(v) => update("businessName", v)}
              placeholder="Amaka's Kitchen"
            />
            <Field
              id="businessPhone" label="Business Phone (optional)" type="tel" icon={Phone}
              value={form.businessPhone} onChange={(v) => update("businessPhone", v)}
              placeholder="+234 801 234 5678"
            />

            <div className="rounded-xl border border-border p-3 space-y-3">
              <ToggleRow
                label="Is your business registered?"
                checked={form.businessRegistered}
                onChange={(v) => update("businessRegistered", v)}
              />
              <ToggleRow
                label="Are you the owner?"
                checked={form.isOwner}
                onChange={(v) => update("isOwner", v)}
              />
            </div>

            <Button type="submit" className="w-full mt-2">Continue</Button>
          </form>
        )}

        {/* SIGN UP — STEP 2 */}
        {mode === "signup" && signupStep === 2 && (
          <form onSubmit={handleSignUp} className="space-y-3">
            <button
              type="button"
              onClick={() => setSignupStep(1)}
              className="flex items-center gap-1 text-xs text-muted-foreground active:text-foreground"
            >
              <ArrowLeft size={12} /> Back
            </button>

            <div className="grid grid-cols-2 gap-3">
              <Field
                id="firstName" label="First Name" required icon={User}
                value={form.firstName} onChange={(v) => update("firstName", v)}
                placeholder="Amaka"
              />
              <Field
                id="lastName" label="Last Name" required
                value={form.lastName} onChange={(v) => update("lastName", v)}
                placeholder="Johnson"
              />
            </div>

            <Field
              id="personalPhone" label="Personal Phone" required type="tel" icon={Phone}
              value={form.personalPhone} onChange={(v) => update("personalPhone", v)}
              placeholder="+234 801 234 5678"
              hint="We'll verify this with a code."
            />
            <Field
              id="personalEmail" label="Personal Email (optional)" type="email"
              value={form.personalEmail} onChange={(v) => update("personalEmail", v)}
              placeholder="amaka@email.com"
            />

            <div className="h-px bg-border my-2" />

            <FieldEmail value={form.email} onChange={(v) => update("email", v)} label="Business Email" hint="Primary verification." />
            <FieldPassword value={form.password} onChange={(v) => update("password", v)} />

            <Button type="submit" disabled={submitting} className="w-full mt-2">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : "Create Account"}
            </Button>
          </form>
        )}

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button type="button" variant="outline" onClick={handleGoogle} disabled={googleLoading} className="w-full gap-2">
          {googleLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          )}
          Continue with Google
        </Button>
      </div>
    </div>
  );
};

// --- helpers ---
const Field = ({
  id, label, value, onChange, placeholder, type = "text", required, icon: Icon, hint,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; icon?: React.ComponentType<{ size?: number; className?: string }>; hint?: string;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-xs">{label}</Label>
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
      <Input
        id={id} required={required} type={type} value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={Icon ? "pl-9" : ""}
      />
    </div>
    {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
  </div>
);

const FieldEmail = ({ value, onChange, label = "Email", hint }: { value: string; onChange: (v: string) => void; label?: string; hint?: string }) => (
  <Field id="email" label={label} required type="email" icon={Mail} value={value} onChange={onChange} placeholder="vendor@vendoor.com" hint={hint} />
);
const FieldPassword = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <Field id="password" label="Password" required type="password" icon={Lock} value={value} onChange={onChange} placeholder="••••••••" />
);

const ToggleRow = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-foreground">{label}</span>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default Auth;
