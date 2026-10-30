import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { z } from "zod";
import { cn } from "../../lib/utils";
import logo from "../../assets/logo.png";

const REMEMBERED_EMAIL_KEY = "skyfirst_login_email";

const credentialsSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-cream transition-[color,box-shadow,background-color] outline-none placeholder:text-cream/30",
        "focus:border-gold-400/60 focus:bg-white/10 focus:ring-2 focus:ring-gold-400/20",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

/**
 * Sign-in card for the Sky First staff area.
 *
 * Presentational: owns the input/validation state and hands the credentials to
 * `onSubmit`. The parent performs the actual authentication request.
 */
export function SignInCard({ onSubmit, isLoading = false, error = null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  // 3D tilt following the pointer inside the card.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left - rect.width / 2);
    mouseY.set(event.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;

    const result = credentialsSchema.safeParse({ email, password });
    if (!result.success) {
      const nextErrors = {};
      for (const issue of result.error.issues) {
        nextErrors[issue.path[0]] = issue.message;
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    if (rememberMe) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, result.data.email);
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
    await onSubmit?.(result.data);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-night-950 px-4 py-12">
      {/* Warm ambient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold-600/20 via-night-950/80 to-night-950" />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Top radial glow */}
      <div className="absolute left-1/2 top-0 h-[60vh] w-[120vh] -translate-x-1/2 rounded-b-[50%] bg-gold-500/15 blur-[80px]" />
      <motion.div
        className="absolute left-1/2 top-0 h-[60vh] w-[100vh] -translate-x-1/2 rounded-b-full bg-gold-300/15 blur-[60px]"
        animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-[90vh] w-[90vh] -translate-x-1/2 rounded-t-full bg-gold-500/10 blur-[60px]"
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", delay: 1 }}
      />

      {/* Animated glow spots */}
      <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-gold-200/5 opacity-40 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-gold-200/5 opacity-40 blur-[100px] [animation-delay:1000ms]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-sm"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="group relative">
            {/* Card glow */}
            <motion.div
              className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-70"
              animate={{
                boxShadow: [
                  "0 0 10px 2px rgba(234,176,53,0.05)",
                  "0 0 18px 6px rgba(234,176,53,0.12)",
                  "0 0 10px 2px rgba(234,176,53,0.05)",
                ],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
            />

            {/* Traveling light beams */}
            <div className="absolute -inset-px overflow-hidden rounded-2xl">
              {[
                { className: "top-0 left-0 h-[3px] w-1/2 bg-gradient-to-r", axis: "left", from: "-50%", to: "100%", delay: 0 },
                { className: "top-0 right-0 h-1/2 w-[3px] bg-gradient-to-b", axis: "top", from: "-50%", to: "100%", delay: 0.6 },
                { className: "bottom-0 right-0 h-[3px] w-1/2 bg-gradient-to-r", axis: "right", from: "-50%", to: "100%", delay: 1.2 },
                { className: "bottom-0 left-0 h-1/2 w-[3px] bg-gradient-to-b", axis: "bottom", from: "-50%", to: "100%", delay: 1.8 },
              ].map((beam) => (
                <motion.div
                  key={beam.axis}
                  className={cn(beam.className, "absolute from-transparent via-gold-200 to-transparent opacity-60")}
                  initial={{ filter: "blur(2px)" }}
                  animate={{
                    [beam.axis]: [beam.from, beam.to],
                    opacity: [0.25, 0.6, 0.25],
                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"],
                  }}
                  transition={{
                    [beam.axis]: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: beam.delay },
                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: beam.delay },
                    filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: beam.delay },
                  }}
                />
              ))}
            </div>

            {/* Gold border sheen */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-gold-400/10 via-gold-300/25 to-gold-400/10 opacity-0 transition-opacity duration-500 group-hover:opacity-70" />

            {/* Glass card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-night-900/60 p-6 shadow-2xl backdrop-blur-xl sm:p-7">
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)",
                  backgroundSize: "30px 30px",
                }}
              />

              {/* Brand + heading */}
              <div className="relative mb-6 space-y-2 text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="relative mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gold-400/30 bg-night-950 shadow-gold-glow"
                >
                  <img src={logo} alt="Sky First Rooftop Lounge" className="h-full w-full rounded-full object-cover" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-display text-2xl font-semibold text-cream"
                >
                  Welcome Back
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs text-cream/55"
                >
                  Sign in to the Sky First staff dashboard
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="relative space-y-4" noValidate>
                {error && (
                  <div
                    className="flex items-start gap-2.5 rounded-lg border border-red-400/30 bg-red-500/15 p-3 text-red-200"
                    role="alert"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-xs leading-relaxed">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Email */}
                  <div>
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Mail
                        className={cn(
                          "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300",
                          focusedInput === "email" ? "text-gold-300" : "text-cream/35"
                        )}
                      />
                      <Input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="Email address"
                        aria-label="Email address"
                        aria-invalid={!!fieldErrors.email}
                        value={email}
                        disabled={isLoading}
                        onChange={(event) => setEmail(event.target.value)}
                        onFocus={() => setFocusedInput("email")}
                        onBlur={() => setFocusedInput(null)}
                        className="pl-10"
                      />
                    </motion.div>
                    {fieldErrors.email && (
                      <p className="mt-1.5 text-[11px] text-red-300" role="alert">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Lock
                        className={cn(
                          "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300",
                          focusedInput === "password" ? "text-gold-300" : "text-cream/35"
                        )}
                      />
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Password"
                        aria-label="Password"
                        aria-invalid={!!fieldErrors.password}
                        value={password}
                        disabled={isLoading}
                        onChange={(event) => setPassword(event.target.value)}
                        onFocus={() => setFocusedInput("password")}
                        onBlur={() => setFocusedInput(null)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 transition-colors duration-300 hover:text-gold-300 focus:outline-none focus-visible:text-gold-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </motion.div>
                    {fieldErrors.password && (
                      <p className="mt-1.5 text-[11px] text-red-300" role="alert">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="relative">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe((value) => !value)}
                      className="h-4 w-4 appearance-none rounded border border-white/20 bg-white/5 transition-all duration-200 checked:border-gold-400 checked:bg-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-300/40"
                    />
                    {rememberMe && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="pointer-events-none absolute inset-0 flex items-center justify-center text-night-950"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                  <label
                    htmlFor="remember-me"
                    className="cursor-pointer text-xs text-cream/55 transition-colors duration-200 hover:text-cream/80"
                  >
                    Remember my email
                  </label>
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="group/button relative mt-2 w-full disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 rounded-lg bg-gold-400/30 opacity-0 blur-lg transition-opacity duration-300 group-hover/button:opacity-70" />
                  <div className="relative flex h-11 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 font-semibold text-night-950 shadow-gold-glow transition-all duration-300">
                    <motion.div
                      className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                      style={{ opacity: isLoading ? 1 : 0, transition: "opacity 0.3s ease" }}
                    />
                    <AnimatePresence mode="wait" initial={false}>
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center"
                        >
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-night-950/70 border-t-transparent" />
                          <span className="sr-only">Signing in</span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="button-text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-1.5 text-sm font-semibold"
                        >
                          Sign In
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/button:translate-x-1" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
