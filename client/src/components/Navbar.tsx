import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, Star, X } from "lucide-react";
import { BUSINESS, currentOpenStatus, isOpenNow } from "../data/business";
import { useReservationModal } from "./reservation/ReservationModalContext";

const NAV_LINKS = [
  { href: "#menu", label: "Menu" },
  { href: "#location", label: "Location" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
] as const;

export function Navbar() {
  const { openReservation } = useReservationModal();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-night-950/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-600 font-display text-lg font-bold text-night-950 shadow-gold-glow">
            S
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold tracking-wide text-cream">
              Sky First
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400">
              Rooftop Lounge
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-cream/80 transition-colors hover:text-gold-300"
            >
              {link.label}
            </a>
          ))}
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isOpenNow()
                ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
                : "bg-red-500/15 text-red-300 ring-1 ring-red-400/30"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOpenNow() ? "animate-pulse bg-emerald-400" : "bg-red-400"
              }`}
            />
            {currentOpenStatus()}
          </div>
          <a href={BUSINESS.phoneHref} className="text-sm font-semibold text-gold-300 hover:text-gold-200">
            {BUSINESS.phone}
          </a>
          <button onClick={openReservation} className="btn-gold !px-5 !py-2.5">
            <Star className="h-4 w-4" />
            Reserve a Table
          </button>
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg p-2 text-cream lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-night-950/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-cream/85 hover:bg-white/5"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={BUSINESS.phoneHref}
                className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-gold-300"
              >
                <Phone className="h-4 w-4" /> {BUSINESS.phone}
              </a>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openReservation();
                }}
                className="btn-gold mt-2"
              >
                Reserve a Table
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}