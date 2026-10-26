import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, Star, X, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { BUSINESS, currentOpenStatus, isOpenNow } from "../data/business";
import { useReservationModal } from "./reservation/ReservationModalContext";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";
const NAV_LINKS = [
    { href: "#menu", label: "Menu" },
    { href: "#location", label: "Location" },
    { href: "#reviews", label: "Reviews" },
    { href: "#contact", label: "Contact" },
];
export function Navbar() {
    const { openReservation } = useReservationModal();
    const { user, logout, token } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    const handleLogout = () => {
        logout();
        navigate("/");
    };
    const renderAuthLinks = () => {
        if (!token) {
            return (<a href="/login" className="btn-gold whitespace-nowrap !px-3 !py-1.5">
          <LogIn className="h-4 w-4 mr-2"/>
          Sign In
        </a>);
        }
        if (user?.role === "admin") {
            return (<>
          <a href="/admin" className="btn-gold flex items-center gap-2 whitespace-nowrap !px-3 !py-1.5">
            <LayoutDashboard className="h-4 w-4"/>
            Admin Dashboard
          </a>
          <button onClick={handleLogout} className="btn-outline inline-flex items-center whitespace-nowrap !px-3 !py-1.5">
            <LogOut className="h-4 w-4 mr-2"/>
            Logout
          </button>
        </>);
        }
        if (user?.role === "waiter") {
            return (<>
          <a href="/waiter" className="btn-gold flex items-center gap-2 whitespace-nowrap !px-3 !py-1.5">
            <LayoutDashboard className="h-4 w-4"/>
            Waiter Dashboard
          </a>
          <button onClick={handleLogout} className="btn-outline inline-flex items-center whitespace-nowrap !px-3 !py-1.5">
            <LogOut className="h-4 w-4 mr-2"/>
            Logout
          </button>
        </>);
        }
        return (<button onClick={handleLogout} className="btn-outline inline-flex items-center whitespace-nowrap !px-3 !py-1.5">
        <LogOut className="h-4 w-4 mr-2"/>
        Logout
      </button>);
    };
    return (<header className={`fixed inset-x-0 top-0 z-50 overflow-hidden transition-all duration-300 ${scrolled
            ? "border-b border-white/10 bg-night-950/80 backdrop-blur-xl"
            : "bg-transparent"}`}>
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <a href="#top" className="group flex shrink-0 items-center gap-2 whitespace-nowrap">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-600 font-display text-lg font-bold text-night-950 shadow-gold-glow">
            S
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold leading-tight tracking-wide text-cream">
              Sky First
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400">
              Rooftop Lounge
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-6 lg:flex">
          <div className="flex items-center gap-4">
            {NAV_LINKS.map((link) => (<a key={link.href} href={link.href} className="whitespace-nowrap text-sm font-medium text-cream/80 transition-colors hover:text-gold-300">
              {link.label}
            </a>))}
            <div className={`hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold xl:flex ${isOpenNow()
              ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
              : "bg-red-500/15 text-red-300 ring-1 ring-red-400/30"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isOpenNow() ? "animate-pulse bg-emerald-400" : "bg-red-400"}`}/>
              {currentOpenStatus()}
            </div>
            <a href={BUSINESS.phoneHref} className="hidden shrink-0 whitespace-nowrap text-sm font-semibold text-gold-300 hover:text-gold-200 xl:inline-flex">
              {BUSINESS.phone}
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={openReservation} className="btn-gold whitespace-nowrap !px-3 !py-1.5">
              <Star className="h-4 w-4"/>
              Reserve a Table
            </button>
            {renderAuthLinks()}
          </div>
        </div>

        <button onClick={() => setMobileOpen((v) => !v)} className="rounded-lg p-2 text-cream lg:hidden" aria-label="Toggle navigation">
          {mobileOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-white/10 bg-night-950/95 backdrop-blur-xl lg:hidden">
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (<a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-cream/85 hover:bg-white/5">
                  {link.label}
                </a>))}
              <a href={BUSINESS.phoneHref} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-gold-300">
                <Phone className="h-4 w-4"/> {BUSINESS.phone}
              </a>
              <button onClick={() => {
                setMobileOpen(false);
                openReservation();
            }} className="btn-gold mt-2">
                Reserve a Table
              </button>
              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                {renderAuthLinks()}
              </div>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </header>);
}
