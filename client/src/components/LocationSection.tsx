import { motion } from "framer-motion";
import { Car, Clock, MapPin, Navigation, Phone, Plus, ShoppingBag } from "lucide-react";
import { BUSINESS, currentOpenStatus, isOpenNow } from "../data/business";

export function LocationSection() {
  return (
    <section
      id="location"
      className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 sm:py-28"
    >
      <div className="mb-10 text-center">
        <p className="section-label justify-center">Find Us</p>
        <h2 className="section-title">Panoramic Terrace in the Heart of Agdal</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-cream/60">
          Perched above 4 Av. de France, we&rsquo;re minutes from everywhere — whether you
          drive, order takeout, or let us host your family on the rooftop.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="glass relative min-h-[360px] overflow-hidden rounded-3xl"
        >
          <iframe
            title={`Map showing ${BUSINESS.name} at ${BUSINESS.address}`}
            src={BUSINESS.mapsEmbedSrc}
            className="h-full min-h-[360px] w-full border-0 grayscale-[0.3] contrast-[1.05]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
          <div className="glass-strong pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-cream">
            <MapPin className="h-3.5 w-3.5 text-gold-400" />
            {BUSINESS.plusCode}
          </div>
        </motion.div>

        {/* Details & actions */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col gap-5"
        >
          <div className="glass rounded-3xl p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold text-cream">
                  {BUSINESS.name} — {BUSINESS.tagline}
                </h3>
                <p className="mt-1 text-sm text-cream/70">{BUSINESS.address}</p>
                <p className="mt-0.5 text-xs text-cream/40">Plus Code: {BUSINESS.plusCode}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-night-900/40 px-4 py-3">
              <Clock className="h-5 w-5 text-gold-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-cream">Open Daily</p>
                <p className="text-xs text-cream/60">
                  {BUSINESS.openHour}:00 AM – {BUSINESS.closeHour}:00 PM
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  isOpenNow()
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-red-500/15 text-red-300"
                }`}
              >
                {currentOpenStatus()}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ActionCard
              href={BUSINESS.mapsDirectionsHref}
              icon={<Navigation className="h-5 w-5" />}
              title="Get Directions"
              subtitle="Google Maps"
            />
            <ActionCard
              href={BUSINESS.phoneHref}
              icon={<Phone className="h-5 w-5" />}
              title="Call Us"
              subtitle={BUSINESS.phone}
            />
            <ActionCard
              href={BUSINESS.whatsappHref}
              icon={<ShoppingBag className="h-5 w-5" />}
              title="Order Drive-Through"
              subtitle="WhatsApp takeout"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4">
              <Car className="h-5 w-5 shrink-0 text-gold-400" />
              <p className="text-xs leading-relaxed text-cream/60">
                <span className="font-semibold text-cream">Drive-through friendly</span> —
                pull up, order, and we&rsquo;ll bring it to your car.
              </p>
            </div>
            <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4">
              <Plus className="h-5 w-5 shrink-0 text-gold-400" />
              <p className="text-xs leading-relaxed text-cream/60">
                <span className="font-semibold text-cream">Family-friendly</span> — high
                chairs, kid-friendly menu, and relaxed terrace seating.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ActionCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="group glass flex flex-col gap-2 rounded-2xl p-4 transition-all duration-300 hover:border-gold-400/50 hover:shadow-gold-glow"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300 transition-colors group-hover:bg-gold-400 group-hover:text-night-950">
        {icon}
      </span>
      <span className="text-sm font-semibold text-cream">{title}</span>
      <span className="text-xs text-cream/50">{subtitle}</span>
    </a>
  );
}