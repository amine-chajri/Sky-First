import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { BUSINESS } from "../data/business";

const REVIEWS = [
  {
    quote:
      "The breakfast was delicious and the customer service was very nice. Amazing view over Agdal while you enjoy your croissants.",
    author: "Google Review",
    rating: 5,
  },
  {
    quote:
      "Food and service is of extreme quality and fantastic value. The rooftop atmosphere makes it a cut above the rest in Rabat.",
    author: "Google Review",
    rating: 5,
  },
  {
    quote:
      "The rooftop terrace at sunset is unforgettable. The pasta was superb and the team treated us like family.",
    author: "Google Review",
    rating: 5,
  },
  {
    quote:
      "Best specialty coffee in Rabat. The chocolate fondant alone is worth the trip up to the terrace.",
    author: "Google Review",
    rating: 4,
  },
  {
    quote:
      "Took the drive-through on the way home — hot, fast, and delicious. You don't often get that quality to go.",
    author: "Google Review",
    rating: 5,
  },
] as const;

export function ReviewsSection() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(
      () => setIndex((i) => (i + 1) % REVIEWS.length),
      5000
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + REVIEWS.length) % REVIEWS.length);

  return (
    <section
      id="reviews"
      className="relative scroll-mt-24 overflow-hidden bg-night-900/50 py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-gold-400/10 blur-[120px]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="section-label justify-center">Social Proof</p>
          <h2 className="section-title">Loved Across Agdal</h2>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Slider */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="glass relative flex min-h-[280px] flex-col overflow-hidden rounded-3xl p-8 sm:p-10"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <Quote className="h-10 w-10 text-gold-400/60" />
            <div className="relative mt-6 flex-1">
              <motion.blockquote
                key={index}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="text-lg leading-relaxed text-cream/85 sm:text-xl"
              >
                &ldquo;{REVIEWS[index].quote}&rdquo;
              </motion.blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < REVIEWS[index].rating
                          ? "fill-gold-400 text-gold-400"
                          : "text-white/20"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-cream/50">— {REVIEWS[index].author}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
              <div className="flex gap-2">
                {REVIEWS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to review ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index
                        ? "w-6 bg-gold-400"
                        : "w-1.5 bg-white/25 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous review"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-cream/70 transition-all hover:border-gold-400/60 hover:text-gold-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label="Next review"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-cream/70 transition-all hover:border-gold-400/60 hover:text-gold-300"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Aggregate widget */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-strong flex flex-col items-center justify-center rounded-3xl p-8 text-center"
          >
            <p className="font-display text-7xl font-semibold text-gold-300">
              {BUSINESS.rating}
            </p>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.round(BUSINESS.rating)
                      ? "fill-gold-400 text-gold-400"
                      : "text-white/20"
                  }`}
                />
              ))}
            </div>
            <p className="mt-3 text-sm text-cream/60">
              Based on{" "}
              <span className="font-semibold text-cream">{BUSINESS.reviewCount}</span>{" "}
              {BUSINESS.reviewProvider}
            </p>
            <p className="mt-1 text-xs text-cream/40">
              Price range: {BUSINESS.priceRange}
            </p>
            <div className="mt-6 w-full space-y-2.5">
              {[
                { label: "5 stars", pct: 86 },
                { label: "4 stars", pct: 9 },
                { label: "3 stars", pct: 3 },
                { label: "2 stars", pct: 1 },
                { label: "1 star", pct: 1 },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 text-xs">
                  <span className="w-14 text-left text-cream/50">{row.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-cream/50">{row.pct}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}