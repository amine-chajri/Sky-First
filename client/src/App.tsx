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

export default function App() {
  return (
    <ReservationModalProvider>
      <div className="relative min-h-screen overflow-x-hidden bg-night-950">
        <Seo />
        <Navbar />
        <main>
          <Hero />
          <HighlightsMarquee />
          <MenuSection />
          <LocationSection />
          <ReviewsSection />
          <ContactSection />
        </main>
        <Footer />
        <ReservationModal />
      </div>
    </ReservationModalProvider>
  );
}