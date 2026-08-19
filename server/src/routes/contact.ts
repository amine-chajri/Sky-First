import { Router } from "express";
import { createContact } from "../models/Contact.js";
import { validate, asyncHandler } from "../middleware/index.js";
import { contactSchema } from "../schemas/validation.js";

const router = Router();

router.post(
  "/",
  validate(contactSchema),
  asyncHandler(async (req, res) => {
    const contact = createContact(req.body);
    res.status(201).json({
      message: "Message received. Our team will get back to you shortly.",
      id: contact._id,
    });
  })
);

export default router;