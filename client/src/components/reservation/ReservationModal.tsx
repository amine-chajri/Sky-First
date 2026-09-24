import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Clock, MessageCircle, Phone, Users, X } from "lucide-react";
import { useReservationModal } from "./ReservationModalContext";
import { BUSINESS } from "../../data/business";

export function ReservationModal() {
  const { open, setOpen } = useReservationModal();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-night-950/80 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Reserve a table"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="glass-strong relative z-10 flex max-h-[90svh] w-full max-w-md flex-col overflow-hidden rounded-3xl shadow-glass"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h3 className="font-display text-2xl font-semibold text-cream">
                  Reserve a Table
                </h3>
                <p className="text-xs text-cream/50">
                  {BUSINESS.name} · Open daily {BUSINESS.openHour}:00 – {BUSINESS.closeHour}:00
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close reservation dialog"
                className="rounded-full p-2 text-cream/60 transition-colors hover:bg-white/10 hover:text-cream"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto px-6 py-8">
              <div className="grid gap-3 text-sm">
                <InfoRow
                  icon={<CalendarDays className="h-4 w-4 text-gold-400" />}
                  text="Reserve in seconds or plan ahead — same day bookings welcome."
                />
                <InfoRow
                  icon={<Users className="h-4 w-4 text-gold-400" />}
                  text="Tables for up to 12 guests. Larger parties are handled by phone."
                />
                <InfoRow
                  icon={<Clock className="h-4 w-4 text-gold-400" />}
                  text={`Open daily ${BUSINESS.openHour}:00 – ${BUSINESS.closeHour}:00.`}
                />
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href={BUSINESS.reservationWhatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold w-full !py-3.5 text-base"
                >
                  <MessageCircle className="h-5 w-5" /> Reserve on WhatsApp
                </a>
                <a href={BUSINESS.phoneHref} className="btn-ghost w-full !py-3.5">
                  <Phone className="h-5 w-5" /> {BUSINESS.phone}
                </a>
              </div>

              <p className="text-center text-xs text-cream/40">
                Prefer to talk? Our team answers daily from{" "}
                {BUSINESS.openHour}:00 to {BUSINESS.closeHour}:00.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-400/10">
        {icon}
      </span>
      <p className="leading-relaxed text-cream/70">{text}</p>
    </div>
  );
}