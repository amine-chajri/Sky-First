import { useEffect } from "react";
import { motion } from "framer-motion";
import { BellRing, Check, ChefHat, Clock, MapPin, Phone, Receipt, Timer } from "lucide-react";
import { useParams } from "react-router-dom";
import { BUSINESS } from "../data/business";
import { ORDER_STAGES, normalizeOrderStatus, stageIndexOf } from "../lib/orderTracking";
import { useOrderTracking } from "../hooks/useOrderTracking";

const STAGE_ICONS = { received: Receipt, preparing: ChefHat, ready: BellRing };

const STAGE_HINTS = {
  received: "We've got it — our team is confirming your order with the kitchen.",
  preparing: "Your dish is on the fire. Our chefs are plating it now.",
  ready: "Plated and ready — your waiter is on the way to your table.",
};

const NODE_STYLES = {
  complete: "border-gold-400/50 bg-gold-400/15 text-gold-300",
  current: "border-gold-400 bg-gold-400 text-night-950 shadow-[0_0_28px_rgba(234,176,53,0.45)]",
  upcoming: "border-white/10 bg-white/[0.03] text-cream/35",
};

function stateFor(index, currentIndex) {
  if (index < currentIndex) return "complete";
  if (index === currentIndex) return "current";
  return "upcoming";
}

function StageNode({ stage, state }) {
  const Icon = STAGE_ICONS[stage.id] ?? Receipt;
  return (
    <span
      aria-hidden="true"
      className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-500 ${NODE_STYLES[state]}`}
    >
      {state === "current" && (
        <span className="absolute -inset-1 rounded-full border border-gold-400/25 animate-pulse" />
      )}
      {state === "complete" ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
    </span>
  );
}

function StageCopy({ stage, state, className = "" }) {
  const labelColor =
    state === "current" ? "text-gold-300" : state === "complete" ? "text-cream/80" : "text-cream/35";
  return (
    <div className={className}>
      <p className={`text-sm font-semibold ${labelColor}`}>{stage.label}</p>
      <p className={`mt-1 text-xs leading-relaxed ${state === "upcoming" ? "text-cream/25" : "text-cream/50"}`}>
        {stage.description}
      </p>
    </div>
  );
}

function LiveBadge({ isLive }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
        isLive
          ? "border-gold-400/30 bg-gold-400/10 text-gold-300"
          : "border-white/15 bg-white/[0.04] text-cream/50"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isLive ? "animate-pulse bg-gold-300" : "bg-cream/40"}`} />
      {isLive ? "Live · auto-updating" : "Waiting for the floor team"}
    </span>
  );
}

function SummaryItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold-400/20 bg-gold-400/10 text-gold-300">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/40">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-cream">{value}</p>
      </div>
    </div>
  );
}

export function OrderStatusTracker() {
  const { orderId } = useParams();
  const { order, isLive } = useOrderTracking(orderId);

  useEffect(() => {
    document.title = `Order ${orderId ?? ""} — ${BUSINESS.name} Rooftop Lounge`.trim();
  }, [orderId]);

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-950 px-4 pb-16 pt-28">
        <div className="glass-strong w-full max-w-md rounded-3xl p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-400/25 bg-gold-400/10 text-gold-300">
            <Receipt className="h-6 w-6" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold text-cream">
            We couldn&rsquo;t find that order
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-cream/60">
            Open this page on the device you placed the order from, or start a fresh order from the
            menu and we&rsquo;ll track it live for you.
          </p>
          <a href="/#menu" className="btn-gold mt-6">
            Browse the Menu
          </a>
        </div>
      </div>
    );
  }

  const currentIndex = stageIndexOf(order.status);
  const currentStage = ORDER_STAGES[currentIndex];
  const statusLabel = normalizeOrderStatus(order.status);
  const placedAt = order.timestamp || "Just now";

  return (
    <div className="relative min-h-screen overflow-hidden bg-night-950 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(234,176,53,0.16),transparent_65%)]" />

      <div className="relative mx-auto w-full max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="section-label">Live Order Tracking</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold text-cream sm:text-4xl">
                Order <span className="gold-text">{order.orderId}</span>
              </h1>
              <p className="mt-2 text-sm text-cream/55">
                Follow your order from the pass to your table — no refresh needed.
              </p>
            </div>
            <LiveBadge isLive={isLive} />
          </div>
        </motion.div>

        {/* Progress card */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-night-900/70 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          aria-label="Order progress"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
          <div className="p-5 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cream/45">
                  Current status
                </p>
                <h2
                  aria-live="polite"
                  className="mt-1 font-display text-2xl font-semibold text-gold-200 sm:text-3xl"
                >
                  {currentStage.label}
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-cream/75 sm:self-auto">
                <Timer className="h-4 w-4 text-gold-300" />
                <span>Estimated</span>
                <span className="font-semibold text-cream">{currentStage.eta}</span>
              </div>
            </div>

            <motion.p
              key={statusLabel}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-2 text-sm leading-relaxed text-cream/55"
            >
              {STAGE_HINTS[statusLabel]}
            </motion.p>

            {/* Horizontal stepper */}
            <ol className="mt-8 hidden sm:grid sm:grid-cols-3 sm:gap-4">
              {ORDER_STAGES.map((stage, index) => {
                const state = stateFor(index, currentIndex);
                return (
                  <li key={stage.id} className="relative">
                    <div className="flex items-center gap-3">
                      <StageNode stage={stage} state={state} />
                      {index < ORDER_STAGES.length - 1 && (
                        <span className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
                          <motion.span
                            initial={false}
                            animate={{ scaleX: index < currentIndex ? 1 : 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-gold-500 to-gold-300"
                          />
                        </span>
                      )}
                    </div>
                    <StageCopy stage={stage} state={state} className="mt-4 pr-2" />
                  </li>
                );
              })}
            </ol>

            {/* Vertical stepper */}
            <ol className="mt-7 sm:hidden">
              {ORDER_STAGES.map((stage, index) => {
                const state = stateFor(index, currentIndex);
                const isLast = index === ORDER_STAGES.length - 1;
                return (
                  <li key={stage.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <StageNode stage={stage} state={state} />
                      {!isLast && (
                        <span className="relative mt-2 w-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
                          <motion.span
                            initial={false}
                            animate={{ scaleY: index < currentIndex ? 1 : 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute inset-0 origin-top rounded-full bg-gradient-to-b from-gold-300 to-gold-500"
                          />
                        </span>
                      )}
                    </div>
                    <StageCopy
                      stage={stage}
                      state={state}
                      className={`min-w-0 flex-1 ${isLast ? "" : "pb-7"}`}
                    />
                  </li>
                );
              })}
            </ol>
          </div>
        </motion.section>

        {/* Confirmation summary */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-5 grid gap-5 lg:grid-cols-5"
        >
          <div className="glass-strong rounded-3xl p-5 sm:p-6 lg:col-span-3">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-cream">
              <Receipt className="h-4 w-4 text-gold-400" />
              Order summary
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SummaryItem
                icon={<Receipt className="h-4 w-4" />}
                label="Order ID"
                value={order.orderId}
              />
              <SummaryItem
                icon={<MapPin className="h-4 w-4" />}
                label="Table / Reservation"
                value={order.tableNumber || "Assigned on arrival"}
              />
              <SummaryItem
                icon={<Timer className="h-4 w-4" />}
                label="Estimated time"
                value={currentStage.eta}
              />
              <SummaryItem
                icon={<Clock className="h-4 w-4" />}
                label="Placed at"
                value={placedAt}
              />
            </div>

            {order.dishName && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-cream">{order.dishName}</p>
                  <span className="shrink-0 rounded-full border border-gold-400/30 bg-gold-400/10 px-2.5 py-0.5 text-xs font-semibold text-gold-300">
                    ×{order.quantity ?? 1}
                  </span>
                </div>
                {order.specialInstructions && (
                  <>
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/40">
                      Notes for the kitchen
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-cream/70">
                      {order.specialInstructions}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="glass flex flex-col rounded-3xl p-5 sm:p-6 lg:col-span-2">
            <h3 className="font-display text-lg font-semibold text-cream">Need something?</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-cream/60">
              Your waiter has this order on their board and is notified at every step. For anything
              else, call the lounge directly.
            </p>
            <a
              href={BUSINESS.phoneHref}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:border-gold-400/60 hover:bg-white/10"
            >
              <Phone className="h-4 w-4 text-gold-300" />
              {BUSINESS.phone}
            </a>
            <a
              href="/#menu"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-gold-300 transition-colors hover:text-gold-200"
            >
              Add another dish
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
