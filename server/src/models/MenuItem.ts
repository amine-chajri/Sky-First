import { createCollection, type BaseDoc, type NewDoc } from "../db/store.js";

export const MENU_CATEGORIES = [
  "breakfast",
  "mains",
  "desserts",
  "beverages",
] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export interface MenuItemDoc extends BaseDoc {
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  image: string;
  tags: string[];
  isVegetarian: boolean;
  isChefsSpecial: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

export type NewMenuItem = NewDoc<MenuItemDoc>;

export interface MenuQuery {
  category?: string;
  q?: string;
  vegetarian?: boolean;
  special?: boolean;
}

export const MenuItem = createCollection<MenuItemDoc>();

export function listMenuItems(query: MenuQuery): MenuItemDoc[] {
  const { category, q, vegetarian, special } = query;
  const term = q?.trim().toLowerCase();

  return MenuItem.all()
    .filter((item) => {
      if (!item.isAvailable) return false;
      if (category && item.category !== category) return false;
      if (vegetarian && !item.isVegetarian) return false;
      if (special && !item.isChefsSpecial) return false;
      if (term) {
        const haystack = `${item.name} ${item.description}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
    );
}

export function menuCategoryCounts(): { _id: MenuCategory; count: number }[] {
  const counts = new Map<MenuCategory, number>();
  for (const item of MenuItem.all()) {
    if (!item.isAvailable) continue;
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ _id: category, count }))
    .sort((a, b) => a._id.localeCompare(b._id));
}