import { Router } from "express";
import { Contact, createContact } from "../models/Contact.js";
import { validate, asyncHandler, ApiError } from "../middleware/index.js";
import { contactSchema } from "../schemas/validation.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post(
  "/",
  validate(contactSchema),
  asyncHandler(async (req, res) => {
    const contact = await createContact(req.body);
    res.status(201).json({
      message: "Message received. Our team will get back to you shortly.",
      id: contact._id,
    });
  })
);

router.get(
  "/",
  requireAuth,
  requireRole("admin", "waiter"),
  asyncHandler(async (_req, res) => {
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();
    res.json({ messages });
  })
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("admin", "waiter"),
  asyncHandler(async (req, res) => {
    const { status } = req.body ?? {};
    if (!["new", "read", "replied"].includes(status)) {
      throw new ApiError(400, "Invalid status");
    }
    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!message) throw new ApiError(404, "Message not found");
    res.json({ message });
  })
);

export default router;
