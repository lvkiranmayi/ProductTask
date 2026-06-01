export type Product = {
  id: string;
  name: string;
  price: number;
  rating: number;
  badge: "NEW" | "SALE" | null;
  category: "Jewellery" | "Apparel" | "Beauty" | "Accessories" | "Home";
  image: string | number; // string = remote URL, number = local require()
  tintable?: boolean;     // true only for flat/SVG images that should be colorized by tintColor
};

export const ALL_PRODUCTS: Product[] = [

  // ── Jewellery ──────────────────────────────────────────────────────────
  {
    id: "j1", name: "Amethyst Ring", price: 3999, rating: 4.8, badge: "NEW", category: "Jewellery",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
  },
  {
    id: "j2", name: "Luna Pendant", price: 4599, rating: 4.6, badge: null, category: "Jewellery",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80",
  },
  {
    id: "j3", name: "Gold Bracelet", price: 5999, rating: 4.7, badge: null, category: "Jewellery",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80",
  },
  {
    id: "j4", name: "Pearl Earrings", price: 3199, rating: 4.9, badge: "SALE", category: "Jewellery",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/pearl.webp") as number,
  },
  {
    id: "j5", name: "Diamond Ring", price: 9999, rating: 5.0, badge: "NEW", category: "Jewellery",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80",
  },
  {
    id: "j6", name: "Silver Necklace", price: 3699, rating: 4.5, badge: null, category: "Jewellery",
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400&q=80",
  },
  {
    id: "j7", name: "Rose Gold Ring", price: 5699, rating: 4.8, badge: null, category: "Jewellery",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/rose gold.webp") as number,
  },
  {
    id: "j8", name: "Layered Chain", price: 4299, rating: 4.7, badge: "SALE", category: "Jewellery",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/chain.webp") as number,
  },

  // ── Apparel — Fancy ────────────────────────────────────────────────────
  {
    id: "a1", name: "Evening Gown", price: 12099, rating: 4.9, badge: "NEW", category: "Apparel",
    image: "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400&q=80",
  },
  {
    id: "a2", name: "Cocktail Dress", price: 7399, rating: 4.7, badge: null, category: "Apparel",
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80",
  },
  {
    id: "a3", name: "Party Maxi", price: 5999, rating: 4.6, badge: "SALE", category: "Apparel",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80",
  },

  // ── Apparel — Traditional ──────────────────────────────────────────────
  {
    id: "a4", name: "Silk Saree", price: 9999, rating: 4.9, badge: null, category: "Apparel",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80",
  },
  {
    id: "a5", name: "Anarkali Suit", price: 7899, rating: 4.8, badge: "NEW", category: "Apparel",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/anarkali.jpeg") as number,
  },
  {
    id: "a6", name: "Lehenga Choli", price: 11299, rating: 4.9, badge: null, category: "Apparel",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/lehenga.webp") as number,
  },

  // ── Apparel — Western ──────────────────────────────────────────────────
  {
    id: "a7", name: "Denim Jacket", price: 6499, rating: 4.6, badge: null, category: "Apparel",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80",
  },
  {
    id: "a8", name: "Crop Top Set", price: 3499, rating: 4.5, badge: "SALE", category: "Apparel",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/crop top.webp") as number,
  },
  {
    id: "a9", name: "Linen Dress", price: 5399, rating: 4.7, badge: null, category: "Apparel",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80",
  },
  {
    id: "a10", name: "Cashmere Top", price: 7299, rating: 4.8, badge: "NEW", category: "Apparel",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80",
  },
  {
    id: "svg1", name: "Designer Dress", price: 7899, rating: 4.9, badge: "NEW", category: "Apparel",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/svg 1.png") as number, tintable: true,
  },
  {
    id: "svg2", name: "Floral Midi Dress", price: 7099, rating: 4.8, badge: "NEW", category: "Apparel",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/svg 2.png") as number, tintable: true,
  },
  {
    id: "svg3", name: "Olive Drape Suit", price: 9199, rating: 4.9, badge: "NEW", category: "Apparel",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/svg 3 (2).png") as number,
  },
  {
    id: "svg4", name: "Blush Lehenga", price: 11299, rating: 4.9, badge: "NEW", category: "Apparel",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/svg 4.png") as number, tintable: true,
  },

  // ── Beauty ─────────────────────────────────────────────────────────────
  {
    id: "b1", name: "Glow Serum", price: 2899, rating: 4.9, badge: "SALE", category: "Beauty",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
  },
  {
    id: "b2", name: "Rose Perfume", price: 6499, rating: 4.9, badge: null, category: "Beauty",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/rose perfume.webp") as number,
  },
  {
    id: "b3", name: "Lip Gloss", price: 1799, rating: 4.7, badge: "NEW", category: "Beauty",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/lip gloss.webp") as number,
  },
  {
    id: "b4", name: "Face Cream", price: 3699, rating: 4.8, badge: null, category: "Beauty",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80",
  },
  {
    id: "b5", name: "Eye Shadow Palette", price: 2699, rating: 4.7, badge: "NEW", category: "Beauty",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80",
  },
  {
    id: "b6", name: "Tinted Moisturizer", price: 3299, rating: 4.8, badge: null, category: "Beauty",
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80",
  },

  // ── Accessories ────────────────────────────────────────────────────────
  {
    id: "ac1", name: "Velvet Clutch", price: 3499, rating: 4.8, badge: "NEW", category: "Accessories",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
  },
  {
    id: "ac2", name: "Silk Scarf", price: 3199, rating: 4.6, badge: null, category: "Accessories",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/scarf.webp") as number,
  },
  {
    id: "ac3", name: "Leather Belt", price: 4599, rating: 4.7, badge: null, category: "Accessories",
    image: "https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=400&q=80",
  },
  {
    id: "ac4", name: "Sunglasses", price: 5399, rating: 4.9, badge: "SALE", category: "Accessories",
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&q=80",
  },
  {
    id: "ac5", name: "Canvas Tote", price: 2799, rating: 4.6, badge: null, category: "Accessories",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/canvas.webp") as number,
  },
  {
    id: "ac6", name: "Hair Clip Set", price: 1499, rating: 4.5, badge: "SALE", category: "Accessories",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/hair clip.webp") as number,
  },

  // ── Home & Kitchen ─────────────────────────────────────────────────────
  {
    id: "h1", name: "Ceramic Mug", price: 1999, rating: 4.8, badge: "NEW", category: "Home",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/mug.webp") as number,
  },
  {
    id: "h2", name: "Linen Pillow", price: 2999, rating: 4.6, badge: null, category: "Home",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/pillow.webp") as number,
  },
  {
    id: "h3", name: "Scented Candle", price: 2299, rating: 4.9, badge: "SALE", category: "Home",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80",
  },
  {
    id: "h4", name: "Marble Tray", price: 4299, rating: 4.7, badge: null, category: "Home",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/tray.webp") as number,
  },
  {
    id: "h5", name: "Ceramic Vase", price: 3199, rating: 4.8, badge: "NEW", category: "Home",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  },
  {
    id: "h6", name: "Throw Blanket", price: 3999, rating: 4.7, badge: null, category: "Home",
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require("../assets/images/blanket.webp") as number,
  },
];

export const CATEGORIES = ["All", "Jewellery", "Apparel", "Beauty", "Accessories", "Home"] as const;
export type Category = (typeof CATEGORIES)[number];

export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}
