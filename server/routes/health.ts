import { Router } from "express";
import { BUSINESS } from "../config/index.js";
import { businessTimeSlots } from "../utils/index.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: BUSINESS.name,
    db: "connected",
    business: {
      name: BUSINESS.name,
      address: BUSINESS.address,
      phone: BUSINESS.phone,
      openHour: BUSINESS.openHour,
      closeHour: BUSINESS.closeHour,
      timeSlots: businessTimeSlots(),
      rating: BUSINESS.rating,
      reviewCount: BUSINESS.reviewCount,
      priceRange: BUSINESS.priceRange,
    },
  });
});

export default router;