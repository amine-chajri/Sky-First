import { Router } from "express";
import {
  listMenuItems,
  menuCategoryCounts,
  type MenuCategory,
} from "../models/MenuItem.js";
import { asyncHandler } from "../middleware/index.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category, q, vegetarian, special } = req.query as {
      category?: string;
      q?: string;
      vegetarian?: string;
      special?: string;
    };

    const items = listMenuItems({
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
    const categories: { _id: MenuCategory; count: number }[] =
      menuCategoryCounts();
    res.json({ categories });
  })
);

export default router;