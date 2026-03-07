export type AvailabilityStatus = "available" | "unavailable" | "pre-order";

export interface SideItem {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  imageUrl?: string;
  preparationTime: number;
  availability: AvailabilityStatus;
  isAvailable: boolean; // derived from availability !== "unavailable"
  isDeleted: boolean;
  sides: SideItem[];
  stockCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type MenuCategory = "Rice" | "Swallow" | "Snacks" | "Drinks" | "Fast Food" | "Bakery" | "Others";

export const MENU_CATEGORIES: MenuCategory[] = ["Rice", "Swallow", "Snacks", "Drinks", "Fast Food", "Bakery", "Others"];

export const PREP_TIME_OPTIONS = [10, 15, 20, 30, 45, 60];
