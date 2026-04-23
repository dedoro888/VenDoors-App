import { useRef, useState } from "react";
import { Camera, Loader2, Trash2, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  bucket: "business-logos" | "business-banners";
  userId: string;
  value: string | null;
  onChange: (url: string | null) => void;
  variant?: "logo" | "banner";
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPT = "image/png,image/jpeg,image/webp";

const ImageUploader = ({ bucket, userId, value, onChange, variant = "logo" }: Props) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const handlePick = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type)) {
      toast({ title: "Unsupported format", description: "Use PNG, JPG, or WEBP.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({ title: "Image too large", description: "Max 5 MB.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${variant}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = () => onChange(null);

  if (variant === "banner") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-foreground">Cover Banner</p>
          {value && (
            <button type="button" onClick={handleRemove} className="text-[11px] font-medium text-destructive">
              Remove
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handlePick}
          className={cn(
            "relative flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted active:scale-[0.99] transition-transform",
            value && "border-solid"
          )}
        >
          {value ? (
            <img src={value} alt="Cover banner" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ImagePlus size={20} />
              <span className="text-xs">Add cover banner</span>
              <span className="text-[10px]">Recommended 1200×400</span>
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 size={20} className="animate-spin text-white" />
            </div>
          )}
        </button>
        <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={handleFile} />
      </div>
    );
  }

  // Logo variant
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">Profile Image (Logo)</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePick}
          className="relative h-20 w-20 overflow-hidden rounded-2xl bg-muted border border-border flex items-center justify-center"
        >
          {value ? (
            <img src={value} alt="Logo" className="h-full w-full object-cover" />
          ) : (
            <Camera size={22} className="text-muted-foreground" />
          )}
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 size={18} className="animate-spin text-white" />
            </div>
          )}
        </button>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePick}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            {value ? "Change Logo" : "Upload Logo"}
          </button>
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1 text-xs font-medium text-destructive"
            >
              <Trash2 size={12} /> Remove
            </button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={handleFile} />
    </div>
  );
};

export default ImageUploader;
