import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Phone,
  User,
  Users,
  X,
} from "lucide-react";
import { useReservationModal } from "./ReservationModalContext";
import {
  DEFAULT_VALUES,
  reservationFormSchema,
  RESERVATION_STEPS,
  seatingOptions,
  stepFields,
  type ReservationFormValues,
} from "./schema";
import { createReservation, extractApiError, fetchAvailability } from "../../lib/api";
import { BUSINESS, SEATING_LABELS } from "../../data/business";
import type { AvailabilityResponse, ReservationResult } from "../../types";
import type { UseFormReturn } from "react-hook-form";

export function ReservationModal() {
  const { open, setOpen } = useReservationModal();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [confirmation, setConfirmation] = useState<ReservationResult | null>(null);

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const watchDate = form.watch("date");
  const watchTimeSlot = form.watch("timeSlot");

  const availability = useQuery({
    queryKey: ["availability", watchDate],
    queryFn: () => fetchAvailability(watchDate),
    enabled: open && !!watchDate,
    staleTime: 1000 * 60,
  });

  const reset = useCallback(() => {
    form.reset(DEFAULT_VALUES);
    setStep(1);
    setServerError("");
    setConfirmation(null);
    setSubmitting(false);
  }, [form]);

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

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

  const next = async () => {
    setServerError("");
    const fields = stepFields[step - 1];
    const valid = await form.trigger(fields);
    if (!valid) return;
    if (step === 1 && !watchTimeSlot) {
      form.setError("timeSlot", { message: "Please choose a time slot" });
      return;
    }
    setStep((s) => Math.min(s + 1, RESERVATION_STEPS));
  };

  const back = () => {
    setServerError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const onSubmit = async (values: ReservationFormValues) => {
    setSubmitting(true);
    setServerError("");
    try {
      const res = await createReservation({
        ...values,
        specialRequests: values.specialRequests ?? "",
      });
      setConfirmation(res.reservation);
    } catch (err) {
      setServerError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toLocaleDateString("en-CA");
  const isLoadingSlots = availability.isFetching;

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
            className="glass-strong relative z-10 flex max-h-[90svh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl shadow-glass"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h3 className="font-display text-2xl font-semibold text-cream">
                  {confirmation ? "Reservation Confirmed" : "Reserve a Table"}
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

            {confirmation ? (
              <ConfirmationScreen
                confirmation={confirmation}
                onClose={() => setOpen(false)}
              />
            ) : (
              <>
                {/* Stepper */}
                <div className="border-b border-white/10 px-6 py-4">
                  <Stepper current={step} />
                </div>

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-1 flex-col overflow-y-auto"
                >
                  <div className="flex-1 px-6 py-6">
                    <AnimatePresence mode="wait">
                      {step === 1 && (
                        <StepDateTime
                          key="step1"
                          form={form}
                          minDate={today}
                          watchDate={watchDate}
                          watchTimeSlot={watchTimeSlot}
                          availability={availability.data}
                          isLoadingSlots={isLoadingSlots}
                        />
                      )}
                      {step === 2 && <StepGuests key="step2" form={form} />}
                      {step === 3 && <StepSeating key="step3" form={form} />}
                      {step === 4 && <StepDetails key="step4" form={form} />}
                    </AnimatePresence>

                    {serverError && (
                      <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {serverError}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-night-900/40 px-6 py-4">
                    <button
                      type="button"
                      onClick={back}
                      disabled={step === 1}
                      className="btn-ghost !px-5 !py-2.5 disabled:opacity-40"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>

                    {step < RESERVATION_STEPS ? (
                      <button type="button" onClick={next} className="btn-gold !px-6 !py-2.5">
                        Continue <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-gold !px-6 !py-2.5"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Confirming…
                          </>
                        ) : (
                          <>
                            Confirm Reservation <CheckCircle2 className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------ Stepper ------------------------------ */

function Stepper({ current }: { current: number }) {
  const labels = ["Date & Time", "Guests", "Seating", "Details"];
  return (
    <ol className="flex items-center gap-2">
      {labels.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                done
                  ? "bg-emerald-500 text-night-950"
                  : active
                    ? "bg-gold-400 text-night-950 shadow-gold-glow"
                    : "border border-white/20 text-cream/40"
              }`}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : idx}
            </span>
            <span
              className={`hidden text-xs font-medium sm:block ${
                active ? "text-cream" : "text-cream/40"
              }`}
            >
              {label}
            </span>
            {idx < RESERVATION_STEPS && (
              <span className="h-px flex-1 bg-white/15" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------ Steps ------------------------------ */

function StepDateTime({
  form,
  minDate,
  watchDate,
  watchTimeSlot,
  availability,
  isLoadingSlots,
}: {
  form: UseFormReturn<ReservationFormValues>;
  minDate: string;
  watchDate: string;
  watchTimeSlot: string;
  availability?: AvailabilityResponse;
  isLoadingSlots: boolean;
}) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div>
        <label htmlFor="res-date" className="mb-2 flex items-center gap-2 text-sm font-semibold text-cream">
          <CalendarDays className="h-4 w-4 text-gold-400" /> 1. Pick a date
        </label>
        <input
          id="res-date"
          type="date"
          min={minDate}
          {...form.register("date")}
          className="input-field"
        />
        {form.formState.errors.date && (
          <p className="field-error">{form.formState.errors.date.message}</p>
        )}
      </div>

      {watchDate && (
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-cream">
            <Clock className="h-4 w-4 text-gold-400" /> 2. Pick a time slot
            <span className="text-xs font-normal text-cream/40">
              (Business hours {BUSINESS.openHour}:00 – {BUSINESS.closeHour}:00)
            </span>
          </label>
          {isLoadingSlots && !availability ? (
            <div className="flex items-center gap-2 py-4 text-sm text-cream/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking availability…
            </div>
          ) : availability ? (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {availability.slots.map((slot) => {
                const disabled = !slot.available;
                const selected = watchTimeSlot === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={disabled}
                    onClick={() => form.setValue("timeSlot", slot.time, { shouldValidate: true })}
                    className={`rounded-lg px-2 py-2 text-xs font-semibold transition-all ${
                      selected
                        ? "bg-gold-400 text-night-950 shadow-gold-glow"
                        : disabled
                          ? "cursor-not-allowed border border-white/5 text-cream/25 line-through"
                          : "border border-white/15 text-cream/75 hover:border-gold-400/50 hover:text-gold-200"
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              Could not load availability. Please try again.
            </div>
          )}
          {form.formState.errors.timeSlot && (
            <p className="field-error">{form.formState.errors.timeSlot.message}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

function StepGuests({ form }: { form: UseFormReturn<ReservationFormValues> }) {
  const guests = form.watch("guests") ?? 2;
  const setGuests = (v: number) =>
    form.setValue("guests", v, { shouldValidate: true });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-cream">
          <Users className="h-4 w-4 text-gold-400" /> How many guests?
        </label>
        <div className="flex items-center justify-center gap-8 rounded-2xl glass px-6 py-10">
          <button
            type="button"
            onClick={() => setGuests(Math.max(1, guests - 1))}
            disabled={guests <= 1}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-2xl text-cream transition-all hover:border-gold-400/60 disabled:opacity-30"
            aria-label="Decrease guests"
          >
            −
          </button>
          <div className="text-center">
            <span className="font-display text-6xl font-semibold text-gold-300">
              {guests}
            </span>
            <p className="mt-1 text-xs uppercase tracking-widest text-cream/40">
              {guests === 1 ? "Guest" : "Guests"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setGuests(Math.min(12, guests + 1))}
            disabled={guests >= 12}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-2xl text-cream transition-all hover:border-gold-400/60 disabled:opacity-30"
            aria-label="Increase guests"
          >
            +
          </button>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {[1, 2, 3, 4, 6, 8, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setGuests(n)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                guests === n
                  ? "bg-gold-400 text-night-950"
                  : "border border-white/15 text-cream/60 hover:text-cream"
              }`}
            >
              {n}+
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-cream/40">
          Hosting a party of more than 12? Call us at{" "}
          <a href={BUSINESS.phoneHref} className="font-semibold text-gold-300">
            {BUSINESS.phone}
          </a>
        </p>
        {form.formState.errors.guests && (
          <p className="field-error text-center">
            {form.formState.errors.guests.message}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function StepSeating({ form }: { form: UseFormReturn<ReservationFormValues> }) {
  const selected = form.watch("seatingPreference") ?? "standard-dining";
  const icons = {
    "panoramic-rooftop": <SunIcon />,
    "indoor-lounge": <SofaIcon />,
    "standard-dining": <TableIcon />,
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-cream">
        <CalendarDays className="h-4 w-4 text-gold-400" /> Where would you like to sit?
      </label>
      <div className="grid gap-3">
        {seatingOptions.map((option) => {
          const isActive = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                form.setValue("seatingPreference", option.value, { shouldValidate: true })
              }
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                isActive
                  ? "border-gold-400/70 bg-gold-400/10 shadow-gold-glow"
                  : "border-white/10 bg-white/[0.03] hover:border-white/25"
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  isActive ? "bg-gold-400 text-night-950" : "bg-white/5 text-cream/60"
                }`}
              >
                {icons[option.value as keyof typeof icons]}
              </span>
              <span>
                <span className="block text-sm font-semibold text-cream">
                  {option.label}
                </span>
                <span className="block text-xs text-cream/50">
                  {option.value === "panoramic-rooftop"
                    ? "Best sunset views over Agdal"
                    : option.value === "indoor-lounge"
                      ? "Cosy lounge seating, climate controlled"
                      : "Classic dining setup for families"}
                </span>
              </span>
              <span
                className={`ml-auto h-5 w-5 rounded-full border-2 transition-all ${
                  isActive ? "border-gold-400 bg-gold-400" : "border-white/25"
                }`}
              />
            </button>
          );
        })}
      </div>
      {form.formState.errors.seatingPreference && (
        <p className="field-error">{form.formState.errors.seatingPreference.message}</p>
      )}
    </motion.div>
  );
}

function StepDetails({ form }: { form: UseFormReturn<ReservationFormValues> }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-cream">
        <User className="h-4 w-4 text-gold-400" /> Your details
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="res-name" className="mb-1.5 block text-xs font-semibold text-cream/70">
            Full name
          </label>
          <input
            id="res-name"
            type="text"
            placeholder="e.g. Yasmine Alaoui"
            {...form.register("name")}
            className="input-field"
            autoComplete="name"
          />
          {form.formState.errors.name && (
            <p className="field-error">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="res-phone" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-cream/70">
            <Phone className="h-3 w-3" /> Phone
          </label>
          <input
            id="res-phone"
            type="tel"
            placeholder="+212 6 XX XX XX XX"
            {...form.register("phone")}
            className="input-field"
            autoComplete="tel"
          />
          {form.formState.errors.phone && (
            <p className="field-error">{form.formState.errors.phone.message}</p>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="res-email" className="mb-1.5 block text-xs font-semibold text-cream/70">
          Email
        </label>
        <input
          id="res-email"
          type="email"
          placeholder="you@example.com"
          {...form.register("email")}
          className="input-field"
          autoComplete="email"
        />
        {form.formState.errors.email && (
          <p className="field-error">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="res-notes" className="mb-1.5 block text-xs font-semibold text-cream/70">
          Special requests <span className="font-normal text-cream/40">(optional)</span>
        </label>
        <textarea
          id="res-notes"
          rows={3}
          placeholder="Birthday celebration, Ramadan Iftar, wheelchair access, high chair…"
          {...form.register("specialRequests")}
          className="input-field resize-none"
        />
        {form.formState.errors.specialRequests && (
          <p className="field-error">{form.formState.errors.specialRequests.message}</p>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------ Confirmation ------------------------------ */

function ConfirmationScreen({
  confirmation,
  onClose,
}: {
  confirmation: ReservationResult;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 py-10 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.1 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-2 ring-emerald-400/50"
      >
        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
      </motion.div>

      <h4 className="mt-6 font-display text-2xl font-semibold text-cream">
        Thank you, {confirmation.name.split(" ")[0]}!
      </h4>
      <p className="mt-2 max-w-sm text-sm text-cream/60">
        Your table at {BUSINESS.name} is reserved. A confirmation has been sent to your
        email.
      </p>

      <div className="mt-6 w-full max-w-sm rounded-2xl border border-dashed border-gold-400/50 bg-gold-400/5 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cream/50">
          Confirmation code
        </p>
        <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-gold-300">
          {confirmation.confirmationCode}
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Date" value={confirmation.date} />
          <Row label="Time" value={confirmation.timeSlot} />
          <Row label="Guests" value={String(confirmation.guests)} />
          <Row
            label="Seating"
            value={SEATING_LABELS[confirmation.seatingPreference]}
          />
        </dl>
      </div>

      <p className="mt-5 text-xs text-cream/40">
        Need to make changes? Call us at{" "}
        <a href={BUSINESS.phoneHref} className="font-semibold text-gold-300">
          {BUSINESS.phone}
        </a>
      </p>

      <button onClick={onClose} className="btn-gold mt-6">
        Done
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-cream/50">{label}</dt>
      <dd className="font-semibold text-cream">{value}</dd>
    </div>
  );
}

/* ------------------------------ Small icons ------------------------------ */

function SunIcon() {
  return <CalendarDays className="h-5 w-5" />;
}
function SofaIcon() {
  return <Clock className="h-5 w-5" />;
}
function TableIcon() {
  return <Users className="h-5 w-5" />;
}