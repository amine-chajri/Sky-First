import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CalendarCheck, ChevronRight, Clock, Star, UtensilsCrossed, } from "lucide-react";
import { BUSINESS, currentOpenStatus, isOpenNow } from "../data/business";
import { useReservationModal } from "./reservation/ReservationModalContext";
import GhostFibers from "./GhostFibers";
const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: (i) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
    }),
};
export function Hero() {
    const { openReservation } = useReservationModal();
    const ref = useRef(null);
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
    return (<section ref={ref} id="top" className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-night-950">
      {/* Dynamic background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <div className="absolute inset-0">
          <GhostFibers
            glowColor="#c07d20"
            layers={2}
            twist={0.7}
            threads={120}
            fiberStyle="lines"
            depthOfField={0.45}
            hoverEffect="focus"
            intro
            mouseInteraction
            lineColor="#ecfdf5"
            secondaryColor="#ebb540"
            gradient="depth"
            waves={1.5}
            volume={1.1}
            spread={1}
            scale={1}
            rotation={18}
            perspective={0.65}
            density={1}
            thickness={1}
            tips={0}
            foldGlow={2}
            speed={0.5}
            flow={0.4}
            rollSpeed={0.15}
            focusDepth={0}
            particles={0.25}
            sparkle={0.2}
            glow={0.8}
            brightness={1}
            vignette={0.3}
            grain={0.06}
            mouseStrength={1}
            pulseOnClick
            lightMode={false}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-night-950/25 via-transparent to-night-950/75"/>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(7,7,12,0.55)_100%)]"/>
      </motion.div>

      {/* Content */}
      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-24 pt-32 text-center sm:px-6 lg:px-8">
        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="show" className="mx-auto max-w-4xl font-display text-4xl font-semibold leading-[1.1] text-cream sm:text-6xl lg:text-7xl">
          Elevate Your Dining Experience at{" "}
          <span className="gold-text">Agdal&rsquo;s Premier Rooftop Lounge</span>
        </motion.h1>

        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="show" className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cream/75 sm:text-lg">
          Continental breakfast at dawn, Italian &amp; international specialties at dusk —
          all framed by a panoramic view of Rabat. Family-friendly, drive-through friendly,
          unforgettable.
        </motion.p>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <button onClick={openReservation} className="btn-gold text-base">
            <CalendarCheck className="h-5 w-5"/>
            Reserve a Table
          </button>
          <a href="#menu" className="btn-ghost text-base">
            Explore Menu
            <ChevronRight className="h-5 w-5"/>
          </a>
        </motion.div>

        {/* Live info bar */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="mx-auto mt-12 w-full max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl border border-gold-400/20 bg-night-950/60 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent"/>
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.04]"/>
            <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <InfoCell icon={<Clock className="h-4 w-4"/>} label={isOpenNow() ? "Open Status" : "Status"} accent={isOpenNow() ? "text-gold-300" : "text-red-300"} value={<span className="inline-flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${isOpenNow() ? "animate-pulse bg-gold-300" : "bg-red-400"}`}/>{currentOpenStatus()}</span>}/>
              <InfoCell icon={<Star className="h-4 w-4 fill-gold-300 text-gold-300"/>} label="Google Rating" value={<span><span className="font-semibold text-cream">{BUSINESS.rating}</span><span className="ml-1.5 text-cream/50">({BUSINESS.reviewCount} reviews)</span></span>}/>
              <InfoCell icon={<UtensilsCrossed className="h-4 w-4"/>} label="Price Range" value={BUSINESS.priceRange}/>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block">
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }} className="flex h-10 w-6 items-start justify-center rounded-full border border-white/25 p-1.5">
          <div className="h-2 w-1 rounded-full bg-gold-400"/>
        </motion.div>
      </motion.div>
    </section>);
}
function InfoCell({ icon, label, value, accent, }) {
    return (<div className="group flex items-center gap-3 px-4 py-3 text-left transition-colors duration-300 hover:bg-white/[0.03] sm:flex-col sm:justify-center sm:gap-2 sm:px-4 sm:py-4 sm:text-center">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-400/25 bg-gold-400/10 text-gold-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 group-hover:border-gold-400/40 group-hover:bg-gold-400/15 group-hover:text-gold-200">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cream/45">
          {label}
        </p>
        <p className={`mt-1 text-sm font-medium tracking-tight ${accent ?? "text-cream"}`}>
          {value}
        </p>
      </div>
    </div>);
}
