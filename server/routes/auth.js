import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { asyncHandler, ApiError } from "../middleware/index.js";
import { requireAuth, requireActiveUser, signToken } from "../middleware/auth.js";

const router = Router();

const authMe = [requireAuth, requireActiveUser];

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new ApiError(401, "Invalid email or password");
    }
    if (!user.isActive) {
      throw new ApiError(401, "Account is disabled");
    }
    res.json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  })
);

router.get("/me", ...authMe, (req, res) => {
  res.json({ user: req.user });
});

export default router;
