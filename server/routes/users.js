import { Router } from "express";
import bcrypt from "bcryptjs";
import { User, USER_ROLES, SHIFT_STATUSES } from "../models/User.js";
import { Table } from "../models/Table.js";
import { asyncHandler, ApiError } from "../middleware/index.js";
import { requireAuth, requireActiveUser, requireRole } from "../middleware/auth.js";

const router = Router();

const adminAuth = [requireAuth, requireActiveUser, requireRole("admin")];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const normalizeEmail = (email) => String(email).trim().toLowerCase();

const serializeUser = (user) => ({
  id: String(user._id),
  _id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  shiftStatus: user.shiftStatus || "off-shift",
  isActive: user.isActive !== false,
  createdAt: user.createdAt,
});

router.use(...adminAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { role } = req.query;
    if (role !== undefined && !USER_ROLES.includes(role)) {
      throw new ApiError(400, "Invalid role filter");
    }
    const filter = role ? { role } : {};
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 }).lean();
    res.json({ users: users.map(serializeUser) });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, password, role = "waiter", shiftStatus = "off-shift", isActive } = req.body ?? {};
    const trimmedName = typeof name === "string" ? name.trim() : "";
    if (!trimmedName || !email || typeof password !== "string" || !password) {
      throw new ApiError(400, "name, email and password are required");
    }
    if (!USER_ROLES.includes(role)) {
      throw new ApiError(400, "Invalid role");
    }
    if (!SHIFT_STATUSES.includes(shiftStatus)) {
      throw new ApiError(400, "Invalid shift status");
    }
    if (!EMAIL_PATTERN.test(normalizeEmail(email))) {
      throw new ApiError(400, "Valid email required");
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new ApiError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }

    const normalizedEmail = normalizeEmail(email);
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) throw new ApiError(409, "Email already in use");

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role,
      shiftStatus,
      isActive: typeof isActive === "boolean" ? isActive : true,
    });
    res.status(201).json({ user: serializeUser(user) });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const { name, email, password, role, shiftStatus, isActive } = req.body ?? {};
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");
    const previousName = user.name;

    if (name !== undefined) {
      const trimmedName = typeof name === "string" ? name.trim() : "";
      if (!trimmedName) throw new ApiError(400, "Name is required");
      user.name = trimmedName;
    }
    if (email !== undefined) {
      const normalizedEmail = normalizeEmail(email);
      if (!EMAIL_PATTERN.test(normalizedEmail)) {
        throw new ApiError(400, "Valid email required");
      }
      const exists = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (exists) throw new ApiError(409, "Email already in use");
      user.email = normalizedEmail;
    }
    if (role !== undefined) {
      if (!USER_ROLES.includes(role)) throw new ApiError(400, "Invalid role");
      user.role = role;
    }
    if (shiftStatus !== undefined) {
      if (!SHIFT_STATUSES.includes(shiftStatus)) throw new ApiError(400, "Invalid shift status");
      user.shiftStatus = shiftStatus;
    }
    if (password !== undefined && password !== "") {
      if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
        throw new ApiError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      }
      user.password = await bcrypt.hash(password, 10);
    }
    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }

    await user.save();
    if (user.name !== previousName) {
      await Table.updateMany(
        { "assignedWaiter.id": String(user._id) },
        { $set: { "assignedWaiter.name": user.name } }
      );
    }
    res.json({ user: serializeUser(user) });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    if (String(req.params.id) === String(req.user.id)) {
      throw new ApiError(400, "You cannot delete your own account");
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new ApiError(404, "User not found");
    await Table.updateMany(
      { "assignedWaiter.id": String(user._id) },
      { $set: { "assignedWaiter": { id: null, name: null } } }
    );
    res.json({ message: "User deleted", id: String(user._id) });
  })
);

export default router;
