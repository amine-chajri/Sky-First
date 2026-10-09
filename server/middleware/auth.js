import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { User } from "../models/User.js";

export function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const requireActiveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    if (!user.isActive) {
      return res.status(401).json({ error: "Account is disabled" });
    }
    req.user = { id: user._id, email: user.email, role: user.role, name: user.name };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
