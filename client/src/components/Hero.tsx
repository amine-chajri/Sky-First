import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  CalendarCheck,
  ChevronRight,
  Clock,
  MapPin,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { BUSINESS, currentOpenStatus, isOpenNow } from "../data/business";
import { useReservationModal } from "./reservation/ReservationModalContext";

const heroImage =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Hero() {
  const { openReservation } = useReservationModal();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    document.title = `${BUSINESS.name} — ${BUSINESS.tagline} | Agdal, Rabat`;
  }, []);

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Parallax background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10">
        <img
          src={heroImage}
          alt="Panoramic rooftop dining at Sky First, Agdal Rabat"
          className="h-[130%] w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night-950/85 via-night-950/55 to-night-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(7,7,12,0.7)_100%)]" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="mx-auto w-full max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8"
      >
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300 backdrop-blur-md">
            <MapPin className="h-3.5 w-3.5" />
            Agdal, Rabat
          </div>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="max-w-4xl font-display text-4xl font-semibold leading-[1.1] text-cream sm:text-6xl lg:text-7xl"
        >
          Elevate Your Dining Experience at{" "}
          <span className="gold-text">Agdal&rsquo;s Premier Rooftop Lounge</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 max-w-2xl text-base leading-relaxed text-cream/75 sm:text-lg"
        >
          Continental breakfast at dawn, Italian &amp; international specialties at dusk —
          all framed by a panoramic view of Rabat. Family-friendly, drive-through friendly,
          unforgettable.
        </motion.p>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="mt-9 flex flex-wrap items-center gap-4">
          <button onClick={openReservation} className="btn-gold text-base">
            <CalendarCheck className="h-5 w-5" />
            Reserve a Table
          </button>
          <a href="#menu" className="btn-ghost text-base">
            Explore Menu
            <ChevronRight className="h-5 w-5" />
          </a>
        </motion.div>

        {/* Live info bar */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-12 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl glass shadow-glass sm:grid-cols-3"
        >
          <InfoCell
            icon={<Clock className="h-4 w-4" />}
            label={isOpenNow() ? "Open Status" : "Status"}
            value={currentOpenStatus()}
            accent={isOpenNow() ? "text-emerald-300" : "text-red-300"}
          />
          <InfoCell
            icon={<Star className="h-4 w-4 fill-gold-400 text-gold-400" />}
            label="Google Rating"
            value={`⭐ ${BUSINESS.rating} (${BUSINESS.reviewCount} Reviews)`}
          />
          <InfoCell
            icon={<UtensilsCrossed className="h-4 w-4" />}
            label="Price Range"
            value={BUSINESS.priceRange}
          />
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-white/25 p-1.5"
        >
          <div className="h-2 w-1 rounded-full bg-gold-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function InfoCell({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-night-900/40 px-5 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-400/15 text-gold-300">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/50">
          {label}
        </p>
        <p className={`truncate text-sm font-semibold ${accent ?? "text-cream"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}