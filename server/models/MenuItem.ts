import mongoose, { type InferSchemaType } from "mongoose";

export const MENU_CATEGORIES = [
  "breakfast",
  "mains",
  "desserts",
  "beverages",
] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number];

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: MENU_CATEGORIES, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    tags: { type: [String], default: [] },
    isVegetarian: { type: Boolean, default: false },
    isChefsSpecial: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type MenuItemDoc = InferSchemaType<typeof menuItemSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const MenuItem = mongoose.model("MenuItem", menuItemSchema);

export interface MenuQuery {
  category?: string;
  q?: string;
  vegetarian?: boolean;
  special?: boolean;
}

export async function listMenuItems(query: MenuQuery) {
  const { category, q, vegetarian, special } = query;
  const filter: Record<string, unknown> = { isAvailable: true };

  if (category) filter.category = category;
  if (vegetarian) filter.isVegetarian = true;
  if (special) filter.isChefsSpecial = true;
  if (q?.trim()) {
    filter.$or = [
      { name: { $regex: q.trim(), $options: "i" } },
      { description: { $regex: q.trim(), $options: "i" } },
    ];
  }

  return MenuItem.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
}

export async function menuCategoryCounts(): Promise<
  { _id: MenuCategory; count: number }[]
> {
  const rows = await MenuItem.aggregate<{ _id: MenuCategory; count: number }>([
    { $match: { isAvailable: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return rows;
}
