import { motion } from "framer-motion";
import { Mail, MapPin, MessageCircle, MessageSquare, Phone } from "lucide-react";
import { BUSINESS } from "../data/business";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 sm:py-28"
    >
      <div className="mb-10 text-center">
        <p className="section-label justify-center">Get in Touch</p>
        <h2 className="section-title">Questions, Catering, or Private Events?</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-cream/60">
          For large groups, Ramadan Iftar, birthdays, or anything else — message us on
          WhatsApp or call, and our team will reply right away.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Info column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 lg:col-span-2"
        >
          <ContactRow
            icon={<Phone className="h-5 w-5" />}
            title="Call us"
            value={
              <a
                href={BUSINESS.phoneHref}
                className="font-semibold text-gold-300 hover:text-gold-200"
              >
                {BUSINESS.phone}
              </a>
            }
            sub="Daily 7 AM – 11 PM"
          />
          <ContactRow
            icon={<MapPin className="h-5 w-5" />}
            title="Visit us"
            value={<span className="font-semibold text-cream">{BUSINESS.address}</span>}
            sub={`Plus Code: ${BUSINESS.plusCode}`}
          />
          <ContactRow
            icon={<Mail className="h-5 w-5" />}
            title="Email us"
            value={
              <a
                href="mailto:hello@skyfirst.ma"
                className="font-semibold text-gold-300 hover:text-gold-200"
              >
                hello@skyfirst.ma
              </a>
            }
            sub="We reply within 24h"
          />
          <div className="glass flex-1 rounded-3xl p-6">
            <h4 className="flex items-center gap-2 font-display text-lg font-semibold text-cream">
              <MessageSquare className="h-5 w-5 text-gold-400" /> Private events
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-cream/60">
              Birthdays, proposals, Iftar gatherings, and corporate evenings — our rooftop
              terrace hosts up to 12 seated guests. Tell us what you&rsquo;re planning and
              we&rsquo;ll craft the menu.
            </p>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="glass-strong flex h-full flex-col justify-center rounded-3xl p-8 sm:p-10">
            <MessageCircle className="h-10 w-10 text-gold-400" />
            <h3 className="mt-5 font-display text-2xl font-semibold text-cream">
              Fastest way to reach us
            </h3>
            <p className="mt-2 max-w-md text-sm text-cream/60">
              Tap below to start a WhatsApp chat — tell us what you need and we&rsquo;ll
              take it from there.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={BUSINESS.contactWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold !py-3.5 sm:flex-1"
              >
                <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
              </a>
              <a href={BUSINESS.phoneHref} className="btn-ghost !py-3.5 sm:flex-1">
                <Phone className="h-5 w-5" /> {BUSINESS.phone}
              </a>
              <a
                href="mailto:hello@skyfirst.ma"
                className="btn-ghost !py-3.5 sm:flex-1"
              >
                <Mail className="h-5 w-5" /> Email us
              </a>
            </div>

            <p className="mt-6 text-xs text-cream/40">
              For private events and catering, mention the occasion and group size in your
              message.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  title,
  value,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="glass flex items-start gap-4 rounded-2xl p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300">
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-cream/40">{title}</p>
        <p className="mt-1 text-sm">{value}</p>
        <p className="mt-0.5 text-xs text-cream/40">{sub}</p>
      </div>
    </div>
  );
}