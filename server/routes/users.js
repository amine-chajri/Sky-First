import { Router } from "express";
import bcrypt from "bcryptjs";
import { User, USER_ROLES } from "../models/User.js";
import { asyncHandler, ApiError } from "../middleware/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    res.json({ users });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body ?? {};
    if (!name || !email || !password || !USER_ROLES.includes(role)) {
      throw new ApiError(400, "name, email, password and role (admin|waiter) are required");
    }
    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) throw new ApiError(409, "Email already in use");
    const user = await User.create({
      name,
      email: String(email).toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role,
    });
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  })
);

export default router;
