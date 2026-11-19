import { useState } from "react";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { extractApiError, submitContact } from "../lib/api";
import { BUSINESS } from "../data/business";
import { ContactCard } from "./ui/contact-card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(2, "Please add a subject").max(120),
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters")
    .max(2000),
});

const fieldClassName =
  "border-white/10 bg-night-900/60 focus-visible:border-gold-400/60 focus-visible:ring-gold-400/20";

export function ContactSection() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values) => {
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
      className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mb-8 text-center">
        <p className="section-label justify-center">Get in Touch</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <ContactCard
          title="Questions, Catering, or Private Events?"
          description="For large groups, Ramadan Iftar, birthdays, private events, or anything else — drop us a line and our team will reply within a few hours."
          className="dark border-gold-400/20 bg-night-900/80 text-cream shadow-gold-glow [&>svg]:text-gold-400/70"
          formSectionClassName="border-gold-400/15 bg-night-800/60 sm:p-6"
          contactInfo={[
            {
              icon: Mail,
              label: "Email",
              value: (
                <a
                  href="mailto:hello@skyfirst.ma"
                  className="font-semibold text-gold-300 hover:text-gold-200"
                >
                  hello@skyfirst.ma
                </a>
              ),
            },
            {
              icon: Phone,
              label: "Phone",
              value: (
                <a
                  href={BUSINESS.phoneHref}
                  className="font-semibold text-gold-300 hover:text-gold-200"
                >
                  {BUSINESS.phone}
                </a>
              ),
            },
            {
              icon: MapPin,
              label: "Address",
              value: (
                <a
                  href={BUSINESS.mapsDirectionsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-cream hover:text-gold-200"
                >
                  {BUSINESS.shortAddress}
                </a>
              ),
              className: "col-span-2 lg:col-span-1",
            },
          ]}
        >
          {sent ? (
            <div className="flex h-full w-full flex-col items-center justify-center py-6 text-center">
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
                type="button"
                onClick={() => setSent(false)}
                className="btn-ghost mt-6 !px-5 !py-2.5"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="contact-name" className="text-cream/70">
                  Full name
                </Label>
                <Input
                  id="contact-name"
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  className={fieldClassName}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="field-error">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-email" className="text-cream/70">
                  Email
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={fieldClassName}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="field-error">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-phone" className="text-cream/70">
                  Phone{" "}
                  <span className="font-normal text-cream/40">(optional)</span>
                </Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="+212 6 XX XX XX XX"
                  autoComplete="tel"
                  className={fieldClassName}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="field-error">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-subject" className="text-cream/70">
                  Subject
                </Label>
                <Input
                  id="contact-subject"
                  type="text"
                  placeholder="Private event, catering…"
                  className={fieldClassName}
                  {...register("subject")}
                />
                {errors.subject && (
                  <p className="field-error">{errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-message" className="text-cream/70">
                  Message
                </Label>
                <Textarea
                  id="contact-message"
                  rows={5}
                  placeholder="Tell us how we can help…"
                  className={`${fieldClassName} min-h-[110px] resize-none`}
                  {...register("message")}
                />
                {errors.message && (
                  <p className="field-error">{errors.message.message}</p>
                )}
              </div>

              {serverError && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="h-10 w-full bg-gold-400 px-5 text-night-950 hover:bg-gold-300"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send Message
                  </>
                )}
              </Button>
            </form>
          )}
        </ContactCard>
      </motion.div>
    </section>
  );
}
