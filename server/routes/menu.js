import { Router } from "express";
import {
  listMenuItems,
  menuCategoryCounts,
} from "../models/MenuItem.js";
import { asyncHandler } from "../middleware/index.js";

const router = Router();

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

export default router;
