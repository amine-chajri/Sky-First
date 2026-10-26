import { createContext, useContext, useMemo, useState } from "react";
import { api } from "./api";
const AuthContext = createContext(null);
const TOKEN_KEY = "skyfirst_token";
const USER_KEY = "skyfirst_user";
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const value = useMemo(() => ({
        user,
        token,
        login: async (email, password) => {
            const { data } = await api.post("/auth/login", { email, password });
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            return data.user;
        },
        logout: () => {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
        },
    }), [user, token]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
