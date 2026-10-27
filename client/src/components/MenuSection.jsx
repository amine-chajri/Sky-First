import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Minus, Plus, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { CATEGORY_LABELS } from "../data/business";
import { useMenu } from "../hooks/useMenu";
import { extractApiError, submitContact } from "../lib/api";
const CATEGORIES = Object.keys(CATEGORY_LABELS);
export function MenuSection() {
    const { data: items, isLoading, error } = useMenu();
    const [activeCategory, setActiveCategory] = useState("all");
    const [query, setQuery] = useState("");
    const [vegetarianOnly, setVegetarianOnly] = useState(false);
    const [chefsOnly, setChefsOnly] = useState(false);
    const [selectedDish, setSelectedDish] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [tableNumber, setTableNumber] = useState("4");
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [orderError, setOrderError] = useState("");
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const filtered = useMemo(() => {
        if (!items)
            return [];
        const q = query.trim().toLowerCase();
        return items.filter((item) => {
            if (activeCategory !== "all" && item.category !== activeCategory)
                return false;
            if (vegetarianOnly && !item.isVegetarian)
                return false;
            if (chefsOnly && !item.isChefsSpecial)
                return false;
            if (q) {
                const haystack = `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
                if (!haystack.includes(q))
                    return false;
            }
            return true;
        });
    }, [items, activeCategory, query, vegetarianOnly, chefsOnly]);
    return (<section id="menu" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 sm:py-28">
      <div className="mb-10 text-center">
        <p className="section-label justify-center">Seasonal &amp; Artisan</p>
        <h2 className="section-title">Explore the Menu</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-cream/60">
          From continental breakfast and traditional balboula to Italian specialties,
          wood-fired pizzas, chocolate indulgences, and specialty coffee — all at prices
          from 50 to 100 MAD.
        </p>
      </div>

      {/* Category tabs */}
      <div className="mb-6 flex flex-wrap justify-center gap-2" role="tablist">
        <TabButton active={activeCategory === "all"} onClick={() => setActiveCategory("all")}>
          All
        </TabButton>
        {CATEGORIES.map((cat) => (<TabButton key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)}>
            {CATEGORY_LABELS[cat]}
          </TabButton>))}
      </div>

      {/* Filters */}
      <div className="mb-10 flex flex-col items-center justify-between gap-4 rounded-2xl glass p-4 sm:flex-row">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40"/>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search dishes…" className="input-field !pl-10" aria-label="Search menu"/>
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-cream/40"/>
          <FilterChip active={vegetarianOnly} onClick={() => setVegetarianOnly((v) => !v)}>
            Vegetarian
          </FilterChip>
          <FilterChip active={chefsOnly} onClick={() => setChefsOnly((v) => !v)}>
            <Star className="h-3.5 w-3.5"/> Chef's Special
          </FilterChip>
        </div>
      </div>

      {/* Results */}
      {isLoading && (<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-72 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]"/>))}
        </div>)}

      {error && (<div className="mx-auto max-w-lg rounded-xl border border-red-400/30 bg-red-500/10 p-5 text-center text-sm text-red-300">
          {extractApiError(error)}
        </div>)}

      {!isLoading && !error && filtered.length === 0 && (<div className="mx-auto max-w-md rounded-xl border border-dashed border-white/15 p-10 text-center text-sm text-cream/50">
          No dishes match your filters. Try clearing the search.
        </div>)}

      <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (<MenuItemCard key={item._id} item={item} onOrder={() => {
            setSelectedDish(item);
            setQuantity(1);
            setTableNumber("4");
            setSpecialInstructions("");
            setOrderError("");
          }}/>))}
        </AnimatePresence>
      </motion.div>

      {selectedDish && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSubmittingOrder) setSelectedDish(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="custom-order-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-white/10 bg-night-900 shadow-2xl sm:rounded-2xl">
            <div className="relative h-48 overflow-hidden sm:h-56">
              <img src={selectedDish.image} alt={selectedDish.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night-900 via-night-900/20 to-black/10" />
              <button type="button" onClick={() => setSelectedDish(null)} disabled={isSubmittingOrder} aria-label="Close order dialog" className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/40 p-2 text-white transition-colors hover:bg-black/70 disabled:opacity-50"><X className="h-5 w-5" /></button>
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
                <h2 id="custom-order-title" className="font-display text-2xl font-semibold text-cream sm:text-3xl">{selectedDish.name}</h2>
                <span className="shrink-0 rounded-full border border-gold-400/30 bg-night-950/80 px-3 py-1.5 text-sm font-bold text-gold-300">{selectedDish.price} MAD</span>
              </div>
            </div>
            <form onSubmit={async (event) => {
              event.preventDefault();
              if (!selectedDish || !tableNumber || Number(tableNumber) < 1) {
                setOrderError("Please enter a valid table number.");
                return;
              }
              const orderId = `ORD-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
              const order = {
                orderId,
                tableNumber: `Table ${Number(tableNumber)}`,
                dishName: selectedDish.name,
                quantity,
                specialInstructions: specialInstructions.trim(),
                status: "Pending",
                timestamp: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date()),
              };
              setIsSubmittingOrder(true);
              setOrderError("");
              try {
                await submitContact({
                  name: order.tableNumber,
                  email: "orders@skyfirst.ma",
                  subject: `Order ${order.orderId}: ${order.dishName}`,
                  message: `New customer order\nOrder ID: ${order.orderId}\nTable: ${order.tableNumber}\nDish: ${order.dishName}\nQuantity: ${order.quantity}\nSpecial instructions: ${order.specialInstructions || "None"}`,
                  order,
                });
                setSelectedDish(null);
              } catch (error) {
                setOrderError(extractApiError(error));
              } finally {
                setIsSubmittingOrder(false);
              }
            }} className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-cream">Quantity</p>
                  <div className="mt-2 inline-flex items-center gap-4 rounded-full border border-white/10 bg-night-950 px-2 py-1.5">
                    <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} aria-label="Decrease quantity" className="flex h-8 w-8 items-center justify-center rounded-full text-cream transition-colors hover:bg-white/10 disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                    <span className="min-w-5 text-center font-semibold text-cream" aria-live="polite">{quantity}</span>
                    <button type="button" onClick={() => setQuantity((value) => Math.min(20, value + 1))} disabled={quantity >= 20} aria-label="Increase quantity" className="flex h-8 w-8 items-center justify-center rounded-full text-cream transition-colors hover:bg-white/10 disabled:opacity-30"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
                <label htmlFor="order-table-number" className="text-sm font-medium text-cream">Table number<input id="order-table-number" type="number" min="1" max="999" required value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} className="mt-2 block w-32 rounded-xl border border-white/10 bg-night-950 px-3 py-2.5 text-cream focus:border-gold-400/60 focus:outline-none focus:ring-2 focus:ring-gold-400/20" /></label>
              </div>
              <label htmlFor="order-instructions" className="block text-sm font-medium text-cream">Special Instructions / Notes for the Waiter<textarea id="order-instructions" rows={4} maxLength={1000} value={specialInstructions} onChange={(event) => setSpecialInstructions(event.target.value)} placeholder="e.g., No onions, sauce on the side, extra spicy, allergic to nuts..." className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-night-950 px-4 py-3 text-sm text-cream placeholder:text-cream/35 focus:border-gold-400/60 focus:outline-none focus:ring-2 focus:ring-gold-400/20" /></label>
              {orderError && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{orderError}</p>}
              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
                <button type="button" disabled={isSubmittingOrder} onClick={() => setSelectedDish(null)} className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-cream transition-colors hover:border-white/40 hover:bg-white/5 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSubmittingOrder} className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-5 py-3 text-sm font-bold text-night-950 transition-colors hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60">{isSubmittingOrder ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</> : "Send Order & Message to Waiter"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>);
}
function TabButton({ active, onClick, children, }) {
    return (<button role="tab" aria-selected={active} onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${active
            ? "bg-gold-400 text-night-950 shadow-gold-glow"
            : "glass text-cream/70 hover:text-cream"}`}>
      {children}
    </button>);
}
function FilterChip({ active, onClick, children, }) {
    return (<button onClick={onClick} className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${active
            ? "bg-gold-400/20 text-gold-300 ring-1 ring-gold-400/50"
            : "text-cream/60 ring-1 ring-white/15 hover:text-cream"}`}>
      {children}
    </button>);
}
function MenuItemCard({ item, onOrder }) {
    return (<motion.article layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-night-800/50 transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/40 hover:shadow-gold-glow">
      <div className="relative h-48 overflow-hidden">
        <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"/>
        <div className="absolute inset-0 bg-gradient-to-t from-night-900/80 to-transparent"/>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {item.isChefsSpecial && (<span className="flex items-center gap-1 rounded-full bg-gold-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-night-950">
              <Star className="h-3 w-3 fill-night-950"/> Chef's Special
            </span>)}
          {item.isVegetarian && (<span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-night-950">
              Vegetarian
            </span>)}
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-night-950/80 px-3 py-1 text-sm font-bold text-gold-300 backdrop-blur-sm">
          {item.price} MAD
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold text-cream">{item.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-cream/60">
          {item.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag) => (<span key={tag} className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-cream/50">
                {tag}
              </span>))}
          </div>
          <button type="button" onClick={onOrder} aria-label={`Order ${item.name}`} className="shrink-0 rounded-full bg-gold-400 px-4 py-1.5 text-xs font-bold text-night-950 transition-all hover:bg-gold-300">
            Order
          </button>
        </div>
      </div>
    </motion.article>);
}
