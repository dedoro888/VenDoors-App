import { useEffect, useState } from "react";
import { Loader2, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AddressPicker, { AddressValue } from "@/components/AddressPicker";
import ImageUploader from "@/components/ImageUploader";

interface Props {
  /** Called after a successful save. Receives the saved profile row. */
  onSaved?: () => void;
  submitLabel?: string;
}

interface ProfileRow {
  business_name: string | null;
  business_address: string | null;
  business_lat: number | null;
  business_lng: number | null;
  logo_url: string | null;
  banner_url: string | null;
}

const BusinessProfileForm = ({ onSaved, submitLabel = "Save" }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState<AddressValue>({ address: "", lat: null, lng: null });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("business_name, business_address, business_lat, business_lng, logo_url, banner_url")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        toast({ title: "Couldn't load profile", description: error.message, variant: "destructive" });
      }
      const row = (data || {}) as Partial<ProfileRow>;
      setBusinessName(row.business_name ?? "");
      setAddress({
        address: row.business_address ?? "",
        lat: row.business_lat != null ? Number(row.business_lat) : null,
        lng: row.business_lng != null ? Number(row.business_lng) : null,
      });
      setLogoUrl(row.logo_url ?? null);
      setBannerUrl(row.banner_url ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!businessName.trim()) {
      toast({ title: "Business name is required", variant: "destructive" });
      return;
    }
    if (!address.address.trim()) {
      toast({ title: "Business address is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          business_name: businessName.trim(),
          business_address: address.address.trim(),
          business_lat: address.lat,
          business_lng: address.lng,
          logo_url: logoUrl,
          banner_url: bannerUrl,
          profile_completed: true,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Business profile saved" });
      onSaved?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Banner first (visual hero) */}
      {user && (
        <ImageUploader
          bucket="business-banners"
          userId={user.id}
          value={bannerUrl}
          onChange={setBannerUrl}
          variant="banner"
        />
      )}

      {/* Logo */}
      {user && (
        <ImageUploader
          bucket="business-logos"
          userId={user.id}
          value={logoUrl}
          onChange={setLogoUrl}
          variant="logo"
        />
      )}

      {/* Business Name */}
      <div className="space-y-1.5">
        <Label htmlFor="business-name" className="text-xs">Business Name</Label>
        <div className="relative">
          <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="business-name"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Amaka's Kitchen"
            className="pl-9"
            maxLength={80}
          />
        </div>
      </div>

      {/* Address with map */}
      <AddressPicker value={address} onChange={setAddress} />

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? <Loader2 size={16} className="animate-spin" /> : submitLabel}
      </Button>
    </form>
  );
};

export default BusinessProfileForm;
