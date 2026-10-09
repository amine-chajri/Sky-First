import { Router } from "express";
import bcrypt from "bcryptjs";
import { User, USER_ROLES } from "../models/User.js";
import { asyncHandler, ApiError } from "../middleware/index.js";
import { requireAuth, requireActiveUser, requireRole } from "../middleware/auth.js";

const router = Router();

const adminAuth = [requireAuth, requireActiveUser, requireRole("admin")];

router.use(...adminAuth);

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

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const { name, email, password, role, isActive } = req.body ?? {};
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    if (email) {
      const exists = await User.findOne({ email: String(email).toLowerCase(), _id: { $ne: user._id } });
      if (exists) throw new ApiError(409, "Email already in use");
      user.email = String(email).toLowerCase();
    }
    if (name) user.name = name;
    if (role) {
      if (!USER_ROLES.includes(role)) throw new ApiError(400, "Invalid role");
      user.role = role;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }

    await user.save();
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive } });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new ApiError(404, "User not found");
    res.json({ message: "User deleted" });
  })
);

export default router;
