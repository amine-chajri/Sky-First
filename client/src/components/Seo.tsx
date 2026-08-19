import { useEffect } from "react";
import { BUSINESS } from "../data/business";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: BUSINESS.name,
  description:
    "Upscale rooftop restaurant and café in Agdal, Rabat with panoramic city views, continental breakfast, Italian and international specialties.",
  url: "https://skyfirst.ma",
  telephone: BUSINESS.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: "4 Av. de France",
    addressLocality: "Rabat",
    postalCode: "10090",
    addressCountry: "MA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: BUSINESS.latitude,
    longitude: BUSINESS.longitude,
  },
  hasMenu: "https://skyfirst.ma/#menu",
  priceRange: "MAD 50-100",
  servesCuisine: ["Breakfast", "Italian", "International", "Coffee"],
  acceptsReservations: "True",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "07:00",
      closes: "23:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: BUSINESS.rating,
    reviewCount: BUSINESS.reviewCount,
    bestRating: 5,
  },
  amenityFeature: [
    {
      "@type": "LocationFeatureSpecification",
      name: "Panoramic rooftop terrace",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Drive-through / takeout",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Family-friendly seating",
      value: true,
    },
  ],
};

export function Seo() {
  useEffect(() => {
    document.title = `${BUSINESS.name} — ${BUSINESS.tagline} | Agdal, Rabat`;
  }, []);

  return (
    <>
      <meta
        name="description"
        content="Sky First is an upscale rooftop restaurant and café in Agdal, Rabat. Panoramic city views, continental breakfast, Italian & international specialties, specialty coffee and a family-friendly terrace."
      />
      <meta name="theme-color" content="#07070c" />
      <link rel="canonical" href="https://skyfirst.ma" />

      {/* OpenGraph */}
      <meta property="og:type" content="restaurant" />
      <meta property="og:site_name" content={BUSINESS.name} />
      <meta property="og:title" content={BUSINESS.headline} />
      <meta
        property="og:description"
        content={`${BUSINESS.name} — ${BUSINESS.tagline} at ${BUSINESS.shortAddress}. Open daily ${BUSINESS.openHour} AM to ${BUSINESS.closeHour} PM. Reserve your rooftop table.`}
      />
      <meta property="og:url" content="https://skyfirst.ma" />
      <meta property="og:image" content="https://skyfirst.ma/og-image.jpg" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={BUSINESS.headline} />
      <meta
        name="twitter:description"
        content={`Reserve a table at ${BUSINESS.name}, Agdal's premier rooftop lounge in Rabat.`}
      />
      <meta name="twitter:image" content="https://skyfirst.ma/og-image.jpg" />

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}