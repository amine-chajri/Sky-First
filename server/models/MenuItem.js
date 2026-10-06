import mongoose from "mongoose";

export const MENU_CATEGORIES = [
  "breakfast",
  "mains",
  "desserts",
  "beverages",
];

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

export const MenuItem = mongoose.model("MenuItem", menuItemSchema);

export async function listMenuItems(query = {}) {
  const { category, q, vegetarian, special } = query;
  const filter = { isAvailable: true };

  if (category) filter.category = category;
  if (vegetarian) filter.isVegetarian = true;
  if (special) filter.isChefsSpecial = true;
  if (q && q.trim()) {
    filter.$or = [
      { name: { $regex: q.trim(), $options: "i" } },
      { description: { $regex: q.trim(), $options: "i" } },
    ];
  }

  return MenuItem.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
}

export async function menuCategoryCounts() {
  return MenuItem.aggregate([
    { $match: { isAvailable: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
}
