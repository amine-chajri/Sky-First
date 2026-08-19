export type MenuCategory = "breakfast" | "mains" | "desserts" | "beverages";

export type SeatingPreference =
  | "panoramic-rooftop"
  | "indoor-lounge"
  | "standard-dining";

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  image: string;
  tags: string[];
  isVegetarian: boolean;
  isChefsSpecial: boolean;
  isAvailable: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  remaining: number;
}

export interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
}

export interface ReservationInput {
  date: string;
  timeSlot: string;
  guests: number;
  seatingPreference: SeatingPreference;
  name: string;
  phone: string;
  email: string;
  specialRequests: string;
}

export interface ReservationResult {
  id: string;
  confirmationCode: string;
  date: string;
  timeSlot: string;
  guests: number;
  seatingPreference: SeatingPreference;
  name: string;
  status: string;
}

export interface ReservationResponse {
  message: string;
  reservation: ReservationResult;
}

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  message: string;
  id: string;
}

export interface ApiErrorPayload {
  error: string;
  details?: { path: string; message: string }[];
}