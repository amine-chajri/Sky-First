import axios from "axios";
import type {
  AvailabilityResponse,
  ContactInput,
  ContactResponse,
  MenuItem,
  ReservationInput,
  ReservationResponse,
} from "../types";

export const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export async function fetchMenu(): Promise<MenuItem[]> {
  const { data } = await api.get<{ items: MenuItem[] }>("/menu");
  return data.items;
}

export async function fetchAvailability(
  date: string
): Promise<AvailabilityResponse> {
  const { data } = await api.get<AvailabilityResponse>(
    "/reservations/availability",
    { params: { date } }
  );
  return data;
}

export async function createReservation(
  payload: ReservationInput
): Promise<ReservationResponse> {
  const { data } = await api.post<ReservationResponse>(
    "/reservations",
    payload
  );
  return data;
}

export async function submitContact(
  payload: ContactInput
): Promise<ContactResponse> {
  const { data } = await api.post<ContactResponse>("/contact", payload);
  return data;
}

export function extractApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const payload = err.response?.data as
      | { error?: string; details?: { message: string }[] }
      | undefined;
    if (payload?.details?.length) {
      return payload.details.map((d) => d.message).join(". ");
    }
    if (payload?.error) return payload.error;
    return err.message;
  }
  return "Something went wrong. Please try again.";
}