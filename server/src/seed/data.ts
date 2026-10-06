import type { MenuCategory } from "../models/MenuItem.js";

export interface SeedMenuItem {
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  image: string;
  tags: string[];
  isVegetarian: boolean;
  isChefsSpecial: boolean;
  sortOrder: number;
}

const img = (name: string) =>
  `https://images.unsplash.com/${name}?auto=format&fit=crop&w=800&q=80`;

export const seedMenuItems: SeedMenuItem[] = [
  // ---------- Breakfast ----------
  {
    name: "Continental Breakfast",
    description:
      "Freshly baked croissants, artisan bread, butter, jams, seasonal fruit platter, and choice of juice or hot coffee.",
    category: "breakfast",
    price: 65,
    image: img("photo-1533089860892-a7c6f0a88666"),
    tags: ["Continental", "Breakfast"],
    isVegetarian: true,
    isChefsSpecial: false,
    sortOrder: 1,
  },
  {
    name: "Balboula Royale",
    description:
      "Our signature traditional Moroccan balboula (barley porridge) slow-cooked with cinnamon, nuts, and orange blossom.",
    category: "breakfast",
    price: 45,
    image: img("photo-1517673400267-0251440c45dc"),
    tags: ["Traditional", "Chef's Special"],
    isVegetarian: true,
    isChefsSpecial: true,
    sortOrder: 2,
  },
  {
    name: "Berber Pastry Basket",
    description:
      "Selection of msemen, harcha, and beghrir served with honey, olive oil, and Moroccan amlou.",
    category: "breakfast",
    price: 55,
    image: img("photo-1608897013039-887f21d8c804"),
    tags: ["Pastries", "Moroccan"],
    isVegetarian: true,
    isChefsSpecial: false,
    sortOrder: 3,
  },
  {
    name: "Avocado Egg Toast",
    description:
      "Sourdough toast, smashed avocado, poached eggs, cherry tomatoes, and chili flakes with a lemon drizzle.",
    category: "breakfast",
    price: 70,
    image: img("photo-1525351484163-7529414344d8"),
    tags: ["Healthy", "Brunch"],
    isVegetarian: true,
    isChefsSpecial: false,
    sortOrder: 4,
  },

  // ---------- Main Courses (Italian / Pasta, Pizzas) ----------
  {
    name: "Tagliatelle al Tartufo",
    description:
      "Fresh egg tagliatelle in a creamy truffle sauce topped with shaved parmesan and chives.",
    category: "mains",
    price: 95,
    image: img("photo-1621996346565-e3dbc646d9a9"),
    tags: ["Italian", "Pasta", "Chef's Special"],
    isVegetarian: true,
    isChefsSpecial: true,
    sortOrder: 1,
  },
  {
    name: "Spaghetti alle Vongole",
    description:
      "Spaghetti tossed with fresh clams, white wine, garlic, and a hint of chili — a coastal classic.",
    category: "mains",
    price: 90,
    image: img("photo-1563379926898-05f4575a45d8"),
    tags: ["Italian", "Pasta", "Seafood"],
    isVegetarian: false,
    isChefsSpecial: false,
    sortOrder: 2,
  },
  {
    name: "Quattro Formaggi Pizza",
    description:
      "Wood-fired pizza with mozzarella, gorgonzola, parmesan, and goat cheese over a blistered crust.",
    category: "mains",
    price: 85,
    image: img("photo-1513104890138-7c749659a591"),
    tags: ["Pizza", "Vegetarian"],
    isVegetarian: true,
    isChefsSpecial: false,
    sortOrder: 3,
  },
  {
    name: "Pizza Agdal",
    description:
      "Our rooftop signature pizza: tomato base, mozzarella, grilled chicken, roasted peppers, olives, and oregano.",
    category: "mains",
    price: 88,
    image: img("photo-1574071318508-1cdbab80d002"),
    tags: ["Pizza", "Signature"],
    isVegetarian: false,
    isChefsSpecial: true,
    sortOrder: 4,
  },
  {
    name: "Risotto ai Funghi",
    description:
      "Creamy porcini mushroom risotto finished with butter, parmesan, and a drizzle of truffle oil.",
    category: "mains",
    price: 92,
    image: img("photo-1476124369491-e7addf5db371"),
    tags: ["Italian", "Risotto"],
    isVegetarian: true,
    isChefsSpecial: false,
    sortOrder: 5,
  },

  // ---------- Desserts & Chocolate ----------
  {
    name: "Fondant au Chocolat",
    description:
      "Warm Belgian chocolate fondant with a molten center, served with vanilla bean ice cream.",
    category: "desserts",
    price: 55,
    image: img("photo-1606313564200-e75d5e30476c"),
    tags: ["Chocolate", "Hot dessert"],
    isVegetarian: true,
    isChefsSpecial: false,
    sortOrder: 1,
  },
  {
    name: "Chocolate Soufflé Sky First",
    description:
      "Airy dark chocolate soufflé dusted with cocoa powder — our most requested dessert on the terrace.",
    category: "desserts",
    price: 60,
    image: img("photo-1563805042-7684c019e1cb"),
    tags: ["Chocolate", "Chef's Special"],
    isVegetarian: true,
    isChefsSpecial: true,
    sortOrder: 2,
  },
  {
    name: "Mille-Feuille Pistache",
    description:
      "Crispy layers of puff pastry with pistachio cream and candied pistachios.",
    category: "desserts",
    price: 50,
    image: img("photo-1488477181946-6428a0291777"),
    tags: ["Pastry"],
    isVegetarian: true,
    isChefsSpecial: false,
    sortOrder: 3,
  },
  {
    name: "Brioche Gourmande",
    description:
      "Caramelized brioche with dark chocolate chunks and a scoop of salted caramel ice cream.",
    category: "desserts",
    price: 52,
    image: img("photo-1551024506-0bccd828d307"),
    tags: ["Chocolate", "Brioche"],
    isVegetarian: true,
    isChefsSpecial: false,
    sortOrder: 4,
  },

  // ---------- Beverages / Specialty Coffee ----------
  {
    name: "Specialty Flat White",
    description:
      "Double ristretto and velvety micro-foamed milk from single-origin Ethiopian beans.",
    category: "beverages",
    price: 35,
    image: img("photo-1509042239860-f550ce710b93"),
    tags: ["Coffee", "Specialty"],
    isVegetarian: true,
    isChefsSpecial: false,
    sortOrder: 1,
  },
  {
    name: "Iced Matcha Latte",
    description:
      "Ceremonial-grade matcha whisked with oat milk over ice and a hint of vanilla syrup.",
    category: "beverages",
    price: 40,
    image: img("photo-1515823064-d6e0c04616a7"),
    tags: ["Cold", "Tea"],
    isVegetarian: true,
    isChefsSpecial: false,
    sortOrder: 2,
  },
  {
    name: "Moroccan Mint Tea",
    description:
      "Green tea brewed with fresh spearmint and sugar, poured the traditional way.",
    category: "beverages",
    price: 30,
    image: img("photo-1544787219-7f47ccb76574"),
    tags: ["Hot", "Traditional"],
    isVegetarian: true,
    isChefsSpecial: false,
    sortOrder: 3,
  },
  {
    name: "Virgin Agdal Sunset",
    description:
      "Non-alcoholic layered mocktail with mango, passion fruit, and grenadine over crushed ice.",
    category: "beverages",
    price: 45,
    image: img("photo-1544145945-f90425340c7e"),
    tags: ["Cold", "Mocktail"],
    isVegetarian: true,
    isChefsSpecial: true,
    sortOrder: 4,
  },
];

export const reviewsSeed = [
  {
    quote:
      "The breakfast was delicious and the customer service was very nice. Amazing view over Agdal...",
    author: "Verified Google Review",
    rating: 5,
  },
  {
    quote:
      "Food and service is of extreme quality and fantastic value.",
    author: "Verified Google Review",
    rating: 5,
  },
  {
    quote:
      "The rooftop terrace at sunset is unforgettable. Pasta was superb and the staff treated us like family.",
    author: "Verified Google Review",
    rating: 5,
  },
  {
    quote:
      "Best specialty coffee in Rabat. The chocolate fondant alone is worth the trip up.",
    author: "Verified Google Review",
    rating: 4,
  },
] as const;