import { Clock, Instagram, MapPin, Phone, Star } from "lucide-react";
import { BUSINESS } from "../data/business";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-night-900/70">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-600 font-display text-xl font-bold text-night-950 shadow-gold-glow">
                S
              </span>
              <div className="leading-tight">
                <p className="font-display text-xl font-semibold text-cream">Sky First</p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold-400">
                  Rooftop Lounge
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-cream/50">
              An upscale rooftop restaurant &amp; café in Agdal, Rabat. Continental
              breakfast, Italian and international specialties, and specialty coffee — with
              a panoramic view.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-sm text-cream/60">
              <Star className="h-4 w-4 fill-gold-400 text-gold-400" />
              {BUSINESS.rating} · {BUSINESS.reviewCount} {BUSINESS.reviewProvider}
            </div>
          </div>

          {/* Menu links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-cream/40">
              Explore
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: "Menu", href: "#menu" },
                { label: "Location & Hours", href: "#location" },
                { label: "Reviews", href: "#reviews" },
                { label: "Contact", href: "#contact" },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-cream/65 transition-colors hover:text-gold-300">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-cream/40">
              <Clock className="h-4 w-4" /> Hours
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/65">
              <li className="flex justify-between gap-4">
                <span>Monday – Sunday</span>
                <span className="font-semibold text-cream">
                  {BUSINESS.openHour}:00 – {BUSINESS.closeHour}:00
                </span>
              </li>
              <li className="text-xs text-cream/40">Breakfast served until 12:00</li>
              <li className="text-xs text-cream/40">Kitchen closes at 22:30</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-cream/40">
              Visit Us
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/65">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                {BUSINESS.address}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gold-400" />
                <a href={BUSINESS.phoneHref} className="transition-colors hover:text-gold-300">
                  {BUSINESS.phone}
                </a>
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              {["Instagram", "Facebook", "TikTok"].map((s) => (
                <a
                  key={s}
                  href="#top"
                  aria-label={s}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-cream/60 transition-all hover:border-gold-400/60 hover:text-gold-300"
                >
                  {s === "Instagram" ? (
                    <Instagram className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">{s[0]}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-cream/35 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
          <p>
            {BUSINESS.shortAddress} · {BUSINESS.plusCode}
          </p>
        </div>
      </div>
    </footer>
  );
}