import type { MenuCategory, SeatingPreference } from "../types";

export const BUSINESS = {
  name: "Sky First",
  tagline: "Rooftop Restaurant & Café",
  headline: "Elevate Your Dining Experience at Agdal's Premier Rooftop Lounge",
  address: "4 Av. de France, Rabat 10090, Morocco",
  shortAddress: "4 Av. de France, Agdal, Rabat",
  plusCode: "X5X4+H3 Rabat",
  phone: "+212 6 59 33 33 30",
  phoneHref: "tel:+212659333330",
  whatsappHref:
    "https://wa.me/212659333330?text=Hello%20Sky%20First%2C%20I%27d%20like%20to%20order%20drive-through%2Ftakeout.",
  mapsDirectionsHref:
    "https://www.google.com/maps/dir/?api=1&destination=4+Av.+de+France,+Rabat+10090,+Morocco",
  mapsEmbedSrc:
    "https://maps.google.com/maps?q=4%20Av.%20de%20France%2C%20Rabat%2010090%2C%20Morocco&z=15&output=embed",
  openHour: 7,
  closeHour: 23,
  rating: 4.6,
  reviewCount: 519,
  reviewProvider: "Google Reviews",
  priceRange: "50–100 MAD",
  latitude: 34.000716,
  longitude: -6.83394,
  openStatus: "Open until 11 PM",
  highlights: [
    "Panoramic Agdal View",
    "Continental Breakfast",
    "Italian & International Specialties",
    "Rooftop Terrace",
    "Drive-Through & Takeout",
    "Family-Friendly Atmosphere",
  ],
} as const;

export function isOpenNow(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= BUSINESS.openHour && hour < BUSINESS.closeHour;
}

export function currentOpenStatus(): string {
  return isOpenNow() ? "Open now" : "Closed — opens at 7 AM";
}

export const CATEGORY_LABELS: Record<MenuCategory, string> = {
  breakfast: "Breakfast",
  mains: "Main Courses",
  desserts: "Desserts & Chocolate",
  beverages: "Cold & Hot Beverages",
};

export const SEATING_LABELS: Record<SeatingPreference, string> = {
  "panoramic-rooftop": "Panoramic Outdoor Rooftop Terrace",
  "indoor-lounge": "Indoor Lounge",
  "standard-dining": "Standard Dining",
};