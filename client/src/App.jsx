import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Seo } from "./components/Seo";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { HighlightsMarquee } from "./components/HighlightsMarquee";
import { MenuSection } from "./components/MenuSection";
import { LocationSection } from "./components/LocationSection";
import { ReviewsSection } from "./components/ReviewsSection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { ReservationModal } from "./components/reservation/ReservationModal";
import { ReservationModalProvider } from "./components/reservation/ReservationModalContext";
import { Login } from "./components/Login";
import { OrderStatusTracker } from "./components/OrderStatusTracker";
import { AdminDashboard } from "./components/AdminDashboard";
import { WaiterDashboard } from "./components/WaiterDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import FloatingNavDemo from "./components/floating-navbar-demo";
function PublicLayout({ children }) {
    return (<ReservationModalProvider>
      <div className="relative min-h-screen overflow-x-hidden bg-night-950">
        <Seo />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ReservationModal />
      </div>
    </ReservationModalProvider>);
}
function ProtectedLayout({ children }) {
    return (<ReservationModalProvider>
      <div className="min-h-screen bg-night-950">
        <Navbar />
        <main>{children}</main>
      </div>
    </ReservationModalProvider>);
}
function ScrollToHash() {
    const { pathname, hash, key } = useLocation();
    useEffect(() => {
        if (!hash) {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
            return undefined;
        }
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (!target) return undefined;
        const frame = requestAnimationFrame(() => {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        return () => cancelAnimationFrame(frame);
    }, [pathname, hash, key]);
    return null;
}
export default function App() {
    return (<>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<PublicLayout>
              <Hero />
              <HighlightsMarquee />
              <MenuSection />
              <LocationSection />
              <ReviewsSection />
              <ContactSection />
            </PublicLayout>}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/order/:orderId" element={<PublicLayout>
              <OrderStatusTracker />
            </PublicLayout>}/>
        <Route path="/floating-navbar-demo" element={<FloatingNavDemo />}/>
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}>
              <ProtectedLayout>
                <AdminDashboard />
              </ProtectedLayout>
            </ProtectedRoute>}/>
        <Route path="/waiter" element={<ProtectedRoute allowedRoles={["waiter"]}>
              <ProtectedLayout>
                <WaiterDashboard />
              </ProtectedLayout>
            </ProtectedRoute>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </>);
}
