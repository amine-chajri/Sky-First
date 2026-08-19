import { Sparkles } from "lucide-react";
import { BUSINESS } from "../data/business";

export function HighlightsMarquee() {
  const items = BUSINESS.highlights;
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-night-900/60 py-3">
      <div className="flex w-max animate-marquee-slow items-center gap-10">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-2 whitespace-nowrap text-sm font-medium tracking-wide text-cream/70"
          >
            <Sparkles className="h-4 w-4 text-gold-400" />
            {item}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-night-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-night-950 to-transparent" />
    </div>
  );
}