import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Upload, X, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MENU_CATEGORIES, PREP_TIME_OPTIONS, type MenuItem, type MenuCategory, type AvailabilityStatus, type SideItem } from "@/types/menu";
import { useToast } from "@/hooks/use-toast";

const AddEditItem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const editItem = location.state?.item as MenuItem | undefined;
  const isEdit = !!editItem;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(editItem?.name ?? "");
  const [category, setCategory] = useState<MenuCategory>(editItem?.category ?? "Rice");
  const [price, setPrice] = useState(editItem?.price?.toString() ?? "");
  const [description, setDescription] = useState(editItem?.description ?? "");
  const [prepTime, setPrepTime] = useState(editItem?.preparationTime ?? 20);
  const [availability, setAvailability] = useState<AvailabilityStatus>(editItem?.availability ?? "available");
  const [imagePreview, setImagePreview] = useState<string | null>(editItem?.imageUrl ?? null);
  const [sides, setSides] = useState<SideItem[]>(editItem?.sides ?? []);
  const [stockCount, setStockCount] = useState<string>(editItem?.stockCount?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  // New side form
  const [newSideName, setNewSideName] = useState("");
  const [newSidePrice, setNewSidePrice] = useState("");

  useEffect(() => {
    if (isEdit) {
      const changed = name !== editItem.name || category !== editItem.category ||
        price !== editItem.price.toString() || description !== editItem.description ||
        prepTime !== editItem.preparationTime || availability !== editItem.availability ||
        imagePreview !== editItem.imageUrl || JSON.stringify(sides) !== JSON.stringify(editItem.sides) ||
        stockCount !== (editItem.stockCount?.toString() ?? "");
      setDirty(changed);
    } else {
      setDirty(name.length > 0 || price.length > 0 || description.length > 0 || !!imagePreview || sides.length > 0);
    }
  }, [name, category, price, description, prepTime, availability, imagePreview, sides, stockCount, isEdit, editItem]);

  const handleBack = () => {
    if (dirty) setShowDiscard(true);
    else navigate("/menu");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB allowed", variant: "destructive" });
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast({ title: "Invalid format", description: "Only JPG and PNG accepted", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addSide = () => {
    const trimmedName = newSideName.trim();
    const parsedPrice = Number(newSidePrice);
    if (!trimmedName || !newSidePrice || parsedPrice <= 0) return;
    setSides((prev) => [...prev, { id: `side-${Date.now()}`, name: trimmedName, price: parsedPrice }]);
    setNewSideName("");
    setNewSidePrice("");
  };

  const removeSide = (id: string) => setSides((prev) => prev.filter((s) => s.id !== id));

  const nameValid = name.trim().length >= 3;
  const priceValid = Number(price) > 0;
  const canSave = nameValid && priceValid && !!imagePreview;

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast({ title: isEdit ? "Item updated" : "Item saved", description: `${name} has been ${isEdit ? "updated" : "added"} to your menu.` });
    setSaving(false);
    navigate("/menu", { state: { scrollTo: editItem?.id } });
  };

  const availabilityOptions: { value: AvailabilityStatus; label: string; color: string }[] = [
    { value: "available", label: "Available", color: "text-primary" },
    { value: "unavailable", label: "Unavailable", color: "text-destructive" },
    { value: "pre-order", label: "Pre-Order", color: "text-warning" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-card px-4 py-4 shadow-sm border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted active:scale-95 transition-transform">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{isEdit ? "Edit Item" : "Add New Item"}</h1>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!canSave || saving}
          className="rounded-xl gap-1.5"
        >
          <Save size={14} />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-28 space-y-5">
        {/* Image Upload */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Item Image *</label>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleImageUpload} />
          {imagePreview ? (
            <div className="relative mt-2 h-48 rounded-2xl overflow-hidden border-2 border-primary/30 bg-muted">
              <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              <button onClick={() => setImagePreview(null)} className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 active:scale-95 transition-transform">
                <X size={14} className="text-white" />
              </button>
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} className="mt-2 flex h-48 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/50 active:border-primary transition-colors">
              <Upload size={28} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tap to upload image</span>
              <span className="text-[10px] text-muted-foreground/60">JPG, PNG · Max 5MB</span>
            </button>
          )}
        </div>

        {/* Item Name */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Item Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jollof Rice & Chicken"
            className={cn(
              "mt-2 w-full rounded-xl border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all",
              name.length > 0 && !nameValid ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"
            )}
          />
          {name.length > 0 && !nameValid && <p className="mt-1 text-[11px] text-destructive">Minimum 3 characters required</p>}
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category *</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as MenuCategory)} className="mt-2 w-full appearance-none rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
            {MENU_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price *</label>
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">₦</span>
            <input type="number" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" min="1" className="w-full rounded-xl border border-border bg-muted pl-8 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 200))} placeholder="Short description of this item..." rows={3} className="mt-2 w-full resize-none rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          <p className={cn("text-right text-[11px] mt-1", description.length >= 180 ? "text-destructive" : "text-muted-foreground")}>{description.length}/200</p>
        </div>

        {/* Preparation Time */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preparation Time *</label>
          <select value={prepTime} onChange={(e) => setPrepTime(Number(e.target.value))} className="mt-2 w-full appearance-none rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
            {PREP_TIME_OPTIONS.map((t) => <option key={t} value={t}>{t} minutes</option>)}
          </select>
        </div>

        {/* Sides */}
        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Sides (Optional)</p>
            <p className="text-xs text-muted-foreground">Add optional extras customers can choose</p>
          </div>

          {sides.length > 0 && (
            <div className="space-y-2">
              {sides.map((side) => (
                <div key={side.id} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{side.name}</p>
                    <p className="text-xs text-primary">+₦{side.price.toLocaleString()}</p>
                  </div>
                  <button onClick={() => removeSide(side.id)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-destructive/10 active:scale-95 transition-all">
                    <Trash2 size={14} className="text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground mb-1 block">Side Name</label>
              <input
                value={newSideName}
                onChange={(e) => setNewSideName(e.target.value)}
                placeholder="e.g. Plantain"
                className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="w-28">
              <label className="text-[10px] text-muted-foreground mb-1 block">Price (₦)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₦</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={newSidePrice}
                  onChange={(e) => setNewSidePrice(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="0"
                  className="w-full rounded-lg border border-border bg-muted pl-7 pr-2 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
            <button
              onClick={addSide}
              disabled={!newSideName.trim() || !newSidePrice || Number(newSidePrice) <= 0}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 active:scale-95 transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Stock Count */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stock Count (Optional)</label>
          <input type="number" inputMode="numeric" value={stockCount} onChange={(e) => setStockCount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Leave empty for unlimited" className="mt-2 w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          <p className="mt-1 text-[11px] text-muted-foreground">Customers see "Low Stock" when ≤ 5 remain</p>
        </div>

        {/* Availability */}
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Availability Status</p>
          <div className="flex gap-2">
            {availabilityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAvailability(opt.value)}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-xs font-semibold border transition-all active:scale-95",
                  availability === opt.value
                    ? opt.value === "available"
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : opt.value === "unavailable"
                        ? "bg-destructive/10 border-destructive/30 text-destructive"
                        : "bg-warning/10 border-warning/30 text-warning"
                    : "bg-muted border-border text-muted-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-card px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-md">
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className={cn(
              "w-full rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.98]",
              canSave ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {saving ? <div className="mx-auto h-5 w-5 rounded-full border-2 border-current/30 border-t-current animate-spin" /> : isEdit ? "Update Item" : "Save Item"}
          </button>
        </div>
      </div>

      {/* Discard Changes Modal */}
      {showDiscard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDiscard(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-card p-6">
            <h3 className="text-lg font-bold text-foreground">Discard changes?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Your unsaved changes will be lost.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowDiscard(false)} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground active:scale-95 transition-all">Keep Editing</button>
              <button onClick={() => navigate("/menu")} className="flex-1 rounded-xl bg-destructive py-3 text-sm font-semibold text-destructive-foreground active:scale-95 transition-all">Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEditItem;
