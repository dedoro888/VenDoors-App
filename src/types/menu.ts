export interface MenuItem {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  imageUrl?: string;
  preparationTime: number;
  isAvailable: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MenuCategory = "Rice" | "Swallow" | "Snacks" | "Drinks" | "Fast Food" | "Bakery" | "Others";

export const MENU_CATEGORIES: MenuCategory[] = ["Rice", "Swallow", "Snacks", "Drinks", "Fast Food", "Bakery", "Others"];

export const PREP_TIME_OPTIONS = [10, 15, 20, 30, 45, 60];
