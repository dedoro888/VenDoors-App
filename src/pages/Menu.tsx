import { useState } from "react";
import { Search, Plus, MoreVertical, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  name: string;
  price: string;
  category: string;
  available: boolean;
  image?: string;
}

const menuItems: MenuItem[] = [
  { id: "1", name: "Jollof Rice & Chicken", price: "₦3,500", category: "Rice Dishes", available: true },
  { id: "2", name: "Pounded Yam & Egusi", price: "₦4,200", category: "Swallow", available: true },
  { id: "3", name: "Small Chops Platter", price: "₦5,000", category: "Snacks", available: false },
  { id: "4", name: "Fried Rice & Turkey", price: "₦4,500", category: "Rice Dishes", available: true },
  { id: "5", name: "Amala & Gbegiri", price: "₦2,800", category: "Swallow", available: true },
  { id: "6", name: "Pepper Soup", price: "₦3,000", category: "Soups", available: true },
];

const categories = ["All", "Rice Dishes", "Swallow", "Snacks", "Soups"];

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [items, setItems] = useState(menuItems);

  const filtered = selectedCategory === "All" ? items : items.filter((i) => i.category === selectedCategory);

  const toggleAvailability = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, available: !item.available } : item))
    );
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card px-5 pb-3 pt-12 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Menu</h1>
          <button className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-medium text-primary-foreground active:scale-95 transition-transform">
            <Plus size={14} />
            Add Item
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search menu items..."
            className="w-full rounded-xl border border-border bg-muted py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Categories */}
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                selectedCategory === cat
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-3 px-4 pt-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted">
              <ImageIcon size={24} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.category}</p>
              <p className="mt-1 text-sm font-bold text-primary">{item.price}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted">
                <MoreVertical size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => toggleAvailability(item.id)}
                className={cn(
                  "relative h-7 w-12 rounded-full transition-colors duration-300",
                  item.available ? "bg-success" : "bg-border"
                )}
              >
                <div
                  className={cn(
                    "absolute top-[3px] left-[3px] h-[22px] w-[22px] rounded-full bg-card shadow transition-transform duration-300",
                    item.available && "translate-x-5"
                  )}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
