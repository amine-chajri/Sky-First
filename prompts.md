Act as a Senior Full-Stack Engineer and UI/UX Designer. Build a high-performance, modern, full-stack website for "Sky First", an upscale rooftop restaurant and cafe located at 4 Av. de France, Agdal, Rabat.

### 1. TECHNICAL STACK & ARCHITECTURE
- Frontend: React (Vite), Tailwind CSS, Framer Motion (smooth animations), Lucide React (icons), Axios/React Query.
- Backend: Node.js with Express (or Next.js App Router for full-stack API routes).
- Database: MongoDB (Mongoose) or PostgreSQL (Prisma ORM) to handle bookings, contacts, and dynamic menu items.
- State & Form Handling: React Hook Form + Zod validation.

### 2. DESIGN & BRAND IDENTITY
- Aesthetic: Elegant rooftop lounge vibe. Dark glassmorphism, warm gold/amber accents, modern typography, high contrast, clean spatial grid.
- Key Highlights to Feature: Panoramic Agdal view, Continental Breakfast, Italian & International specialties, rooftop terrace, drive-through option, family-friendly atmosphere.

### 3. FRONTEND CORE PAGES & COMPONENTS

#### A. Hero Section
- High-impact visual background with subtle parallax scrolling.
- Headline: "Elevate Your Dining Experience at Agdal’s Premier Rooftop Lounge"
- Live info bar: Opening Status (Open until 11 PM), Rating Badge ("⭐ 4.6 (519 Reviews)"), Price Range (50–100 MAD).
- CTAs: "Reserve a Table" (Modal trigger) and "Explore Menu".

#### B. Dynamic Menu Section
- Categorized Tabs: Breakfast (Continental, Balboula, Pastries), Main Courses (Italian/Pasta, Pizzas), Desserts & Chocolate, Cold & Hot Beverages / Specialty Coffee.
- Filters: Search bar + Dietary tags (Vegetarian, Chef's Special).
- Item Card: Image, title, description, price (in MAD), and order/add indicator.

#### C. Online Table Reservation System
- Interactive step-by-step modal or dedicated section:
  1. Pick Date & Time Slot (Enforce business hours: 7 AM – 11 PM).
  2. Select Guests (1 to 10+ people).
  3. Seating Preference Options: "Panoramic Outdoor Rooftop Terrace", "Indoor Lounge", or "Standard Dining".
  4. User Details: Name, Phone Number, Email, Special Requests (e.g., Birthday, Ramadan Iftar).
- Form validation via Zod with real-time feedback and instant confirmation screen.

#### D. Interactive Location & Hours (Agdal Focus)
- Address: 4 Av. de France, Rabat 10090 (Plus Code: X5X4+H3 Rabat).
- Interactive Google Maps embed or custom map UI.
- Direct Actions: One-click "Get Directions", "Call (+212 6 59 33 33 30)", and "Order Drive-Through / Takeout".

#### E. Review & Social Proof Section
- Dynamic review slider pulling highlight quotes:
  - "The breakfast was delicious and the customer service was very nice. Amazing view..."
  - "Food and service is of extreme quality and fantastic value."
- Aggregate rating widget (4.6 / 5 based on 519 Google Reviews).

### 4. BACKEND API ENDPOINTS
Create clean Express API routes with input validation:
- `POST /api/reservations` - Validate slot availability, persist to database, return confirmation payload.
- `GET /api/reservations` - Admin list endpoint with date filtering.
- `GET /api/menu` - Fetch menu items by category.
- `POST /api/contact` - Handle general customer queries.

### 5. REQUIREMENTS FOR PRODUCTION READY QUALITY
- Mobile-first, fully responsive design optimized for iPhone/Android.
- SEO Meta tags, OpenGraph support, and structured Schema.org JSON-LD data for `Restaurant` (including geographic coordinates, menu link, priceRange "MAD 50-100", and openingHours).
- Reusable UI component structure with clean TypeScript typing.
- Provide seed data for initial menu items and sample database setup.