import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem, AvailabilityStatus } from "@/types/menu";
import MenuItemCard from "@/components/MenuItemCard";
import MenuActionSheet from "@/components/MenuActionSheet";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

const mockItems: MenuItem[] = [
  { id: "m1", vendorId: "v1", name: "Jollof Rice & Chicken", description: "Smoky party-style jollof with grilled chicken", price: 3500, category: "Rice", imageUrl: undefined, preparationTime: 20, availability: "available", isAvailable: true, isDeleted: false, sides: [{ id: "s1", name: "Plantain", price: 300 }, { id: "s2", name: "Coleslaw", price: 200 }], stockCount: 15, createdAt: "", updatedAt: "" },
  { id: "m2", vendorId: "v1", name: "Fried Rice & Turkey", description: "Mixed vegetables fried rice with fried turkey", price: 4500, category: "Rice", imageUrl: undefined, preparationTime: 25, availability: "available", isAvailable: true, isDeleted: false, sides: [], createdAt: "", updatedAt: "" },
  { id: "m3", vendorId: "v1", name: "Pounded Yam & Egusi", description: "Smooth pounded yam with melon soup", price: 4200, category: "Swallow", imageUrl: undefined, preparationTime: 30, availability: "pre-order", isAvailable: true, isDeleted: false, sides: [{ id: "s3", name: "Extra Meat", price: 500 }], createdAt: "", updatedAt: "" },
  { id: "m4", vendorId: "v1", name: "Amala & Gbegiri", description: "Soft amala with beans soup and ewedu", price: 2800, category: "Swallow", imageUrl: undefined, preparationTime: 20, availability: "unavailable", isAvailable: false, isDeleted: false, sides: [], stockCount: 0, createdAt: "", updatedAt: "" },
  { id: "m5", vendorId: "v1", name: "Small Chops Platter", description: "Samosa, spring rolls, puff puff and more", price: 5000, category: "Snacks", imageUrl: undefined, preparationTime: 15, availability: "available", isAvailable: true, isDeleted: false, sides: [], createdAt: "", updatedAt: "" },
  { id: "m6", vendorId: "v1", name: "Pepper Soup", description: "Spicy goat meat pepper soup", price: 3000, category: "Drinks", imageUrl: undefined, preparationTime: 15, availability: "available", isAvailable: true, isDeleted: false, sides: [], createdAt: "", updatedAt: "" },
];

const Menu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState(mockItems);
  const [search, setSearch] = useState("");
  const [actionItem, setActionItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);

  const filtered = items
    .filter((i) => !i.isDeleted)
    .filter((i) => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  const grouped = filtered.reduce<Record<string, MenuItem[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});
  const categories = Object.keys(grouped);
  const singleCategory = categories.length <= 1;

  const handleSetAvailability = (item: MenuItem, status: AvailabilityStatus) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, availability: status, isAvailable: status !== "unavailable" }
          : i
      )
    );
    const labels = { available: "Available", unavailable: "Unavailable", "pre-order": "Pre-Order" };
    toast({ title: `Marked as ${labels[status]}` });
  };

  const handleDelete = (item: MenuItem) => {
    setActionItem(null);
    setDeleteItem(item);
  };

  const confirmDelete = () => {
    if (!deleteItem) return;
    setItems((prev) => prev.map((i) => (i.id === deleteItem.id ? { ...i, isDeleted: true } : i)));
    toast({ title: "Item deleted" });
    setDeleteItem(null);
  };

  const handleEdit = (item: MenuItem) => {
    navigate("/menu/edit", { state: { item } });
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card px-5 pb-4 pt-12 shadow-sm border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Menu</h1>
          <button
            onClick={() => navigate("/menu/add")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95 transition-transform shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="relative mt-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full rounded-xl border border-border bg-muted py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="px-4 pt-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-foreground">No menu items found</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat}>
              {!singleCategory && (
                <p className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat}</p>
              )}
              <div className={cn("space-y-3", singleCategory && "pt-3")}>
                {grouped[cat].map((item) => (
                  <MenuItemCard key={item.id} item={item} onTap={handleEdit} onThreeDot={setActionItem} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <MenuActionSheet
        item={actionItem}
        open={!!actionItem}
        onClose={() => setActionItem(null)}
        onEdit={handleEdit}
        onSetAvailability={handleSetAvailability}
        onDelete={handleDelete}
      />

      <DeleteConfirmModal
        open={!!deleteItem}
        itemName={deleteItem?.name ?? ""}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Menu;
