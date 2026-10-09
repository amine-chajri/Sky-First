import { Router } from "express";
import {
  listMenuItems,
  menuCategoryCounts,
  MenuItem,
  MENU_CATEGORIES,
} from "../models/MenuItem.js";
import { asyncHandler, ApiError } from "../middleware/index.js";
import { requireAuth, requireActiveUser, requireRole } from "../middleware/auth.js";

const router = Router();

const adminAuth = [requireAuth, requireActiveUser, requireRole("admin")];

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category, q, vegetarian, special } = req.query;

    const items = await listMenuItems({
      category,
      q,
      vegetarian: vegetarian === "true",
      special: special === "true",
    });

    res.json({ items });
  })
);

router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await menuCategoryCounts();
    res.json({ categories });
  })
);

router.get(
  "/all",
  ...adminAuth,
  asyncHandler(async (_req, res) => {
    const items = await MenuItem.find().sort({ sortOrder: 1, name: 1 }).lean();
    res.json({ items });
  })
);

router.post(
  "/",
  ...adminAuth,
  asyncHandler(async (req, res) => {
    const { name, description, category, price } = req.body ?? {};
    if (!name || !description || !MENU_CATEGORIES.includes(category) || typeof price !== "number") {
      throw new ApiError(400, "name, description, category and numeric price are required");
    }
    const item = await MenuItem.create({ ...req.body, isAvailable: req.body.isAvailable ?? true });
    res.status(201).json({ item });
  })
);

router.put(
  "/:id",
  ...adminAuth,
  asyncHandler(async (req, res) => {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) throw new ApiError(404, "Item not found");
    res.json({ item });
  })
);

router.delete(
  "/:id",
  ...adminAuth,
  asyncHandler(async (req, res) => {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) throw new ApiError(404, "Item not found");
    res.json({ message: "Item deleted" });
  })
);

export default router;
