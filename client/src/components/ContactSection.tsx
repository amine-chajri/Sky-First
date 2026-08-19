import { useState } from "react";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, Loader2, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";
import { extractApiError, submitContact } from "../lib/api";
import { BUSINESS } from "../data/business";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(2, "Please add a subject").max(120),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(2000),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactSection() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitting(true);
    setServerError("");
    try {
      await submitContact(values);
      setSent(true);
      reset();
    } catch (err) {
      setServerError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 sm:py-28"
    >
      <div className="mb-10 text-center">
        <p className="section-label justify-center">Get in Touch</p>
        <h2 className="section-title">Questions, Catering, or Private Events?</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-cream/60">
          For large groups, Ramadan Iftar, birthdays, or anything else — drop us a line and
          our team will reply within a few hours.
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
            value={<a href={BUSINESS.phoneHref} className="font-semibold text-gold-300 hover:text-gold-200">{BUSINESS.phone}</a>}
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
            value={<a href="mailto:hello@skyfirst.ma" className="font-semibold text-gold-300 hover:text-gold-200">hello@skyfirst.ma</a>}
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

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-3"
        >
          {sent ? (
            <div className="glass-strong flex h-full flex-col items-center justify-center rounded-3xl p-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-2 ring-emerald-400/50">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold text-cream">
                Message sent!
              </h3>
              <p className="mt-2 max-w-sm text-sm text-cream/60">
                Thank you for reaching out. Our team will get back to you shortly.
              </p>
              <button
                onClick={() => setSent(false)}
                className="btn-ghost mt-6 !px-5 !py-2.5"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="glass rounded-3xl p-6 sm:p-8"
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-xs font-semibold text-cream/70">
                    Full name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    {...register("name")}
                    className="input-field"
                    autoComplete="name"
                  />
                  {errors.name && <p className="field-error">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="contact-phone" className="mb-1.5 block text-xs font-semibold text-cream/70">
                    Phone <span className="font-normal text-cream/40">(optional)</span>
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    placeholder="+212 6 XX XX XX XX"
                    {...register("phone")}
                    className="input-field"
                    autoComplete="tel"
                  />
                  {errors.phone && <p className="field-error">{errors.phone.message}</p>}
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block text-xs font-semibold text-cream/70">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className="input-field"
                    autoComplete="email"
                  />
                  {errors.email && <p className="field-error">{errors.email.message}</p>}
                </div>
                <div>
                  <label htmlFor="contact-subject" className="mb-1.5 block text-xs font-semibold text-cream/70">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="Private event, catering…"
                    {...register("subject")}
                    className="input-field"
                  />
                  {errors.subject && <p className="field-error">{errors.subject.message}</p>}
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold text-cream/70">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder="Tell us how we can help…"
                  {...register("message")}
                  className="input-field resize-none"
                />
                {errors.message && <p className="field-error">{errors.message.message}</p>}
              </div>

              {serverError && (
                <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {serverError}
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-gold mt-6 w-full sm:w-auto">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send Message
                  </>
                )}
              </button>
            </form>
          )}
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