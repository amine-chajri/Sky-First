import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "waiter")[];
}

export function ProtectedRoute({
  children,
  allowedRoles = ["admin", "waiter"],
}: ProtectedRouteProps) {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night-950">
        <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
      </div>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night-950 px-4">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-cream mb-2">
            Access Denied
          </h1>
          <p className="text-cream/60 mb-6">
            You don&apos;t have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn-gold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}