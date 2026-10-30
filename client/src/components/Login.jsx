import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { extractApiError } from "../lib/api";
import { SignInCard } from "./ui/sign-in-card-2";

export function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const from = location.state?.from?.pathname;

    const handleSignIn = async ({ email, password }) => {
        setError(null);
        setIsLoading(true);
        try {
            const user = await login(email, password);
            const fallback = user.role === "admin" ? "/admin" : "/waiter";
            navigate(from || fallback, { replace: true });
        }
        catch (err) {
            setError(extractApiError(err));
        }
        finally {
            setIsLoading(false);
        }
    };

    return <SignInCard onSubmit={handleSignIn} isLoading={isLoading} error={error}/>;
}
