import MeadowRiseFooter from "./ui/meadow-rise-footer";
import { useReservationModal } from "./reservation/ReservationModalContext";
import { BUSINESS } from "../data/business";
import logo from "../assets/logo.png";

const columns = [
    {
        title: "Explore",
        links: [
            { label: "Menu", href: "/#menu" },
            { label: "Location & Hours", href: "/#location" },
            { label: "Reviews", href: "/#reviews" },
            { label: "Contact", href: "/#contact" },
        ],
    },
    {
        title: "Visit",
        links: [
            { label: "Reserve a Table", href: "/#contact" },
            { label: "Call Us", href: BUSINESS.phoneHref },
            { label: "Get Directions", href: BUSINESS.mapsDirectionsHref },
        ],
    },
    {
        title: "Hours",
        links: [
            { label: "Monday – Sunday", href: "/#location" },
            { label: `${BUSINESS.openHour}:00 – ${BUSINESS.closeHour}:00`, href: "/#location" },
            { label: "Breakfast until 12:00", href: "/#menu" },
        ],
    },
];

const socials = [
    { icon: "instagram", href: "#" },
    { icon: "facebook", href: "#" },
];

const legal = [
    { label: "Get Directions", href: BUSINESS.mapsDirectionsHref },
    { label: "Call Us", href: BUSINESS.phoneHref },
];

export function Footer() {
    const { openReservation } = useReservationModal();
    return (
        <MeadowRiseFooter
            name={BUSINESS.name}
            brandHref="/"
            logo={<img src={logo} alt={`${BUSINESS.name} logo`} className="h-9 w-9 rounded-full object-cover ring-1 ring-gold-400/30" />}
            heading={"Take the *first step*\nup to Sky First."}
            subheading="Reserve a table, explore the menu, or simply say hello — we're open every day."
            cta={{
                label: "Reserve a Table",
                href: "/#contact",
                onClick: (event) => {
                    event.preventDefault();
                    openReservation();
                },
            }}
            tagline="An upscale rooftop restaurant & café in Agdal, Rabat. Continental breakfast, Italian and international specialties, and specialty coffee — with a panoramic view."
            newsletter
            placeholder="Your email for Sky First news"
            successMessage="Thanks for subscribing. We'll send you Sky First news soon."
            columns={columns}
            socials={socials}
            legal={legal}
            preset="obsidian"
            botanicals={false}
            className="border-t border-amber-500/25"
            fontFamily='"Inter", system-ui, sans-serif'
            serifFamily='"Cormorant Garamond", Georgia, serif'
        />
    );
}
