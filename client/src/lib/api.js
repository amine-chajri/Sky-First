import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api";
export const api = axios.create({
    baseURL: apiUrl,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("skyfirst_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export async function fetchMenu() {
    const { data } = await api.get("/menu");
    return data.items;
}
export async function fetchAvailability(date) {
    const { data } = await api.get("/reservations/availability", { params: { date } });
    return data;
}
export async function createReservation(payload) {
    const { data } = await api.post("/reservations", payload);
    return data;
}
export async function submitContact(payload) {
    const { data } = await api.post("/contact", payload);
    return data;
}
export function extractApiError(err) {
    if (axios.isAxiosError(err)) {
        const payload = err.response?.data;
        if (payload?.details?.length) {
            return payload.details.map((d) => d.message).join(". ");
        }
        if (payload?.error)
            return payload.error;
        return err.message;
    }
    return "Something went wrong. Please try again.";
}
