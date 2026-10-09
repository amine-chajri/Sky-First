import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, AlertCircle, Lock, Mail } from "lucide-react";
import { useAuth } from "../lib/auth";
import { extractApiError } from "../lib/api";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: Location })?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setIsLoading(true);
    try {
      const user = await login(data.email, data.password);
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/waiter", { replace: true });
      }
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-night-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-600 font-display text-2xl font-bold text-night-950 shadow-gold-glow">
              S
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-cream">Welcome Back</h1>
          <p className="mt-2 text-cream/60">Sign in to access your dashboard</p>
        </div>

        <div className="bg-night-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {error && (
            <div
              className="mb-6 flex items-center gap-3 rounded-lg bg-red-500/15 border border-red-400/30 p-4 text-red-300"
              role="alert"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-cream/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cream/40" />
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-night-950 border border-white/10 text-cream placeholder-cream/30 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-transparent transition-all"
                  placeholder="admin@skyfirst.ma"
                  disabled={isLoading}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-400" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cream/80 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cream/40" />
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-night-950 border border-white/10 text-cream placeholder-cream/30 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream/60 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-400" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-cream/50">
            <p>Demo credentials:</p>
            <p className="mt-1 font-mono text-xs text-cream/40">
              Admin: admin@skyfirst.ma / admin123
            </p>
            <p className="font-mono text-xs text-cream/40">
              Waiter: waiter@skyfirst.ma / waiter123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}