export type ProductColor = { name: string; hex: string; image?: number };

export type ProductDetail = {
  description: string;
  colors: ProductColor[];
  sizes?: string[];
  reviewCount: number;
  subcategory: string;
};

export const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  // ── Jewellery ──────────────────────────────────────────────────────────────
  j1: {
    description: "A delicate amethyst stone set in 925 sterling silver. Ethically sourced gemstone, hand-polished for a brilliant finish. Hypoallergenic and tarnish-resistant.",
    colors: [{ name: "Silver", hex: "#C0C0C0" }, { name: "Gold", hex: "#D4AF37" }, { name: "Rose Gold", hex: "#B76E79" }],
    sizes: ["5", "6", "7", "8", "9"],
    reviewCount: 89,
    subcategory: "Rings",
  },
  j2: {
    description: "A crescent moon pendant on a delicate 18-inch chain. Perfect for layering or wearing alone for subtle elegance. 925 sterling silver.",
    colors: [{ name: "Silver", hex: "#C0C0C0" }, { name: "Gold", hex: "#D4AF37" }],
    sizes: ["16\"", "18\"", "20\""],
    reviewCount: 64,
    subcategory: "Necklaces",
  },
  j3: {
    description: "A classic gold bracelet with adjustable clasp. Hypoallergenic and tarnish-resistant, suitable for everyday wear. Plated over brass.",
    colors: [{ name: "Gold", hex: "#D4AF37" }, { name: "Rose Gold", hex: "#B76E79" }, { name: "Silver", hex: "#C0C0C0" }],
    sizes: ["6\"", "7\"", "8\""],
    reviewCount: 112,
    subcategory: "Bracelets",
  },
  j4: {
    description: "Freshwater pearl earrings with sterling silver posts. Luminous and lightweight, ideal for everyday wear and special occasions alike.",
    colors: [{ name: "White", hex: "#F5F5F0" }, { name: "Blush", hex: "#F4A7B9" }, { name: "Lavender", hex: "#C4B5FD" }],
    reviewCount: 203,
    subcategory: "Earrings",
  },
  j5: {
    description: "A stunning solitaire diamond set in 18K white gold. Conflict-free certified, VS1 clarity. Arrives with authenticity certificate.",
    colors: [{ name: "White Gold", hex: "#E8E8E8" }, { name: "Yellow Gold", hex: "#D4AF37" }, { name: "Rose Gold", hex: "#B76E79" }],
    sizes: ["5", "6", "7", "8"],
    reviewCount: 47,
    subcategory: "Rings",
  },
  j6: {
    description: "A dainty sterling silver chain necklace, perfect for layering. Lobster clasp closure with 2-inch extender for adjustability.",
    colors: [{ name: "Silver", hex: "#C0C0C0" }, { name: "Gold", hex: "#D4AF37" }],
    sizes: ["16\"", "18\"", "20\""],
    reviewCount: 78,
    subcategory: "Necklaces",
  },
  j7: {
    description: "A romantic rose gold ring with a floral-inspired design. Made from recycled 14K rose gold. Each petal is individually set by hand.",
    colors: [{ name: "Rose Gold", hex: "#B76E79" }, { name: "Gold", hex: "#D4AF37" }, { name: "Silver", hex: "#C0C0C0" }],
    sizes: ["5", "6", "7", "8"],
    reviewCount: 91,
    subcategory: "Rings",
  },
  j8: {
    description: "A trendy layered chain necklace set with mixed metal textures. Wear all three together or separately. Clasp closures on each layer.",
    colors: [{ name: "Gold", hex: "#D4AF37" }, { name: "Silver", hex: "#C0C0C0" }],
    sizes: ["16\"", "18\""],
    reviewCount: 134,
    subcategory: "Necklaces",
  },

  // ── Apparel ────────────────────────────────────────────────────────────────
  a1: {
    description: "A breathtaking floor-length evening gown in satin-finished fabric. Features a sweetheart neckline and dramatic train. Fully lined with boned bodice for structure.",
    colors: [{ name: "Midnight", hex: "#1E1B4B" }, { name: "Blush", hex: "#F4A7B9" }, { name: "Ivory", hex: "#F5F0E8" }, { name: "Sage", hex: "#9CAF88" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    reviewCount: 167,
    subcategory: "Fancy",
  },
  a2: {
    description: "A chic knee-length cocktail dress with a structured bodice and flared skirt. Concealed side zip. Dry-clean only. Perfect for semi-formal events.",
    colors: [{ name: "Black", hex: "#1A1A1A" }, { name: "Burgundy", hex: "#800020" }, { name: "Navy", hex: "#1E3A5F" }, { name: "Blush", hex: "#F4A7B9" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    reviewCount: 89,
    subcategory: "Fancy",
  },
  a3: {
    description: "A flowy maxi dress with a vibrant print, perfect for parties and celebrations. Made from lightweight chiffon with a self-tie waist and subtle shimmer thread.",
    colors: [{ name: "Coral", hex: "#FF7F7F" }, { name: "Teal", hex: "#008080" }, { name: "Violet", hex: "#7C5FFF" }, { name: "Ivory", hex: "#F5F0E8" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    reviewCount: 213,
    subcategory: "Fancy",
  },
  a4: {
    description: "A luxurious handwoven silk saree with intricate zari borders. Comes with an unstitched blouse piece. Crafted by artisans in Kanchipuram.",
    colors: [{ name: "Gold", hex: "#D4AF37" }, { name: "Crimson", hex: "#C0392B" }, { name: "Royal Blue", hex: "#2C3E8F" }, { name: "Peacock", hex: "#336B87" }],
    sizes: ["Free Size"],
    reviewCount: 298,
    subcategory: "Traditional",
  },
  a5: {
    description: "A graceful floor-length Anarkali suit with delicate floral embroidery. Includes churidar and matching dupatta. Crafted from georgette with a breathable cotton lining.",
    colors: [{ name: "Rose", hex: "#F4A7B9" }, { name: "Mint", hex: "#98E0C0" }, { name: "Lavender", hex: "#C4B5FD" }, { name: "Peach", hex: "#FFCBA4" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    reviewCount: 176,
    subcategory: "Traditional",
  },
  a6: {
    description: "A resplendent bridal Lehenga Choli with heavy embellishments, mirror work, and stone detailing. A showstopper for weddings and festive occasions.",
    colors: [{ name: "Red", hex: "#C0392B" }, { name: "Pink", hex: "#F0A0D8" }, { name: "Royal Blue", hex: "#2C3E8F" }, { name: "Gold", hex: "#D4AF37" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    reviewCount: 142,
    subcategory: "Traditional",
  },
  a7: {
    description: "A classic denim jacket with a slightly oversized fit. Versatile enough to style over dresses or with jeans. 100% cotton denim, pre-washed for softness.",
    colors: [{ name: "Light Blue", hex: "#89CFF0" }, { name: "Dark Blue", hex: "#1E3A5F" }, { name: "Black", hex: "#1A1A1A" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    reviewCount: 322,
    subcategory: "Western",
  },
  a8: {
    description: "A trendy matching crop top and high-waist trouser set. Perfect for brunches, outings, and casual evenings. Made from wrinkle-resistant crepe fabric.",
    colors: [{ name: "White", hex: "#F8F8F8" }, { name: "Black", hex: "#1A1A1A" }, { name: "Lilac", hex: "#C4B5FD" }, { name: "Beige", hex: "#D4B896" }],
    sizes: ["XS", "S", "M", "L"],
    reviewCount: 188,
    subcategory: "Western",
  },
  a9: {
    description: "A breezy linen sundress with a relaxed silhouette. Made from 100% European linen, naturally breathable and moisture-wicking. Machine washable.",
    colors: [{ name: "Sand", hex: "#C2A98E" }, { name: "Sky", hex: "#89CFF0" }, { name: "Olive", hex: "#8B8B45" }, { name: "White", hex: "#F8F8F8" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    reviewCount: 245,
    subcategory: "Western",
  },
  a10: {
    description: "A luxuriously soft cashmere top with a relaxed fit. Grade-A Mongolian cashmere, hand-washed and air-dried for a cloud-like feel. Hand wash cold.",
    colors: [{ name: "Oat", hex: "#D4B896" }, { name: "Blush", hex: "#F4A7B9" }, { name: "Slate", hex: "#708090" }, { name: "Ivory", hex: "#F5F0E8" }],
    sizes: ["XS", "S", "M", "L"],
    reviewCount: 134,
    subcategory: "Western",
  },
  svg1: {
    description: "An elegant designer dress with a flattering silhouette. Crafted from premium fabric with refined detailing. Available in a range of vibrant colors to suit every occasion.",
    colors: [
      { name: "Red",       hex: "#E53935" },
      { name: "Royal Blue", hex: "#1565C0" },
      { name: "Emerald",   hex: "#2E7D32" },
      { name: "Purple",    hex: "#6A1B9A" },
      { name: "Black",     hex: "#212121" },
      { name: "Rose",      hex: "#F06292" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    reviewCount: 58,
    subcategory: "Western",
  },
  svg2: {
    description: "A charming floral midi dress with a flowing silhouette. Made from lightweight breathable fabric, perfect for any occasion. Choose your favourite color to make it yours.",
    colors: [
      { name: "Coral",     hex: "#FF6B6B" },
      { name: "Sky Blue",  hex: "#0288D1" },
      { name: "Mauve",     hex: "#AD5DBD" },
      { name: "Olive",     hex: "#827717" },
      { name: "Teal",      hex: "#00796B" },
      { name: "Blush",     hex: "#F48FB1" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    reviewCount: 42,
    subcategory: "Western",
  },
  svg4: {
    description: "A stunning blush pink lehenga choli adorned with delicate floral embroidery and shimmering sequins. Perfect for weddings, receptions, and festive celebrations.",
    colors: [
      { name: "Blush",     hex: "#F4B8C1" },
      { name: "Mint",      hex: "#A8D5BA" },
      { name: "Lavender",  hex: "#C9B1D9" },
      { name: "Peach",     hex: "#F4C49E" },
      { name: "Ivory",     hex: "#F5F0E8" },
      { name: "Lilac",     hex: "#D8B4FE" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    reviewCount: 74,
    subcategory: "Traditional",
  },
  svg3: {
    description: "An exquisite drape suit with intricate floral embroidery and a graceful silhouette. Crafted from premium satin fabric, perfect for weddings and festive occasions.",
    colors: [
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      { name: "Olive",   hex: "#6B7C3A", image: require("../assets/images/svg 3 (2).png") as number },
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      { name: "Magenta", hex: "#8B1A6B", image: require("../assets/images/svg color 3.png") as number },
      { name: "Navy",    hex: "#1A237E" },
      { name: "Teal",    hex: "#00695C" },
      { name: "Maroon",  hex: "#800020" },
      { name: "Ivory",   hex: "#F5F0E8" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    reviewCount: 61,
    subcategory: "Traditional",
  },

  // ── Beauty ─────────────────────────────────────────────────────────────────
  b1: {
    description: "A brightening vitamin C serum that targets dark spots and gives your skin a luminous glow. Dermatologist tested. Apply 3–4 drops to cleansed skin morning and night.",
    colors: [{ name: "30ml", hex: "#FFD700" }, { name: "50ml", hex: "#FFA500" }],
    reviewCount: 412,
    subcategory: "Skincare",
  },
  b2: {
    description: "A sophisticated floral fragrance with top notes of rose and peony, heart of patchouli, and a warm vanilla base. Long-lasting 12-hour wear.",
    colors: [{ name: "30ml", hex: "#F4A7B9" }, { name: "50ml", hex: "#C4B5FD" }, { name: "100ml", hex: "#7C5FFF" }],
    reviewCount: 287,
    subcategory: "Fragrance",
  },
  b3: {
    description: "A non-sticky, ultra-shiny lip gloss in wearable shades. Infused with vitamin E and hyaluronic acid for plumping hydration. Vegan and cruelty-free.",
    colors: [{ name: "Nude", hex: "#D4B896" }, { name: "Berry", hex: "#800020" }, { name: "Petal", hex: "#F0A0D8" }, { name: "Red", hex: "#C0392B" }],
    reviewCount: 356,
    subcategory: "Lip",
  },
  b4: {
    description: "A rich moisturizing face cream with hyaluronic acid, ceramides, and niacinamide. Suitable for all skin types. Fragrance-free and dermatologist approved.",
    colors: [{ name: "50ml", hex: "#F5F5F0" }, { name: "100ml", hex: "#E8E8E8" }],
    reviewCount: 198,
    subcategory: "Skincare",
  },
  b5: {
    description: "A highly pigmented 18-pan eyeshadow palette with matte, shimmer, and glitter finishes. Buildable coverage with minimal fallout. Stays on for 12+ hours.",
    colors: [{ name: "Nudes", hex: "#D4B896" }, { name: "Jewel Tones", hex: "#7C5FFF" }, { name: "Warm Rust", hex: "#C0602A" }],
    reviewCount: 523,
    subcategory: "Eyes",
  },
  b6: {
    description: "A lightweight tinted moisturizer with SPF 30. Evens skin tone while providing all-day hydration. Non-comedogenic and suitable for sensitive skin.",
    colors: [{ name: "Fair", hex: "#F5DEB3" }, { name: "Light", hex: "#DEB887" }, { name: "Medium", hex: "#C4A078" }, { name: "Tan", hex: "#A0785A" }],
    reviewCount: 289,
    subcategory: "Foundation",
  },

  // ── Accessories ────────────────────────────────────────────────────────────
  ac1: {
    description: "A luxurious velvet evening clutch with a gold-toned kiss-lock clasp. Fits your phone, cards, and essentials. Removable wrist chain included.",
    colors: [{ name: "Plum", hex: "#7C5FFF" }, { name: "Blush", hex: "#F0A0D8" }, { name: "Midnight", hex: "#1E1B4B" }, { name: "Emerald", hex: "#2ECC71" }],
    reviewCount: 134,
    subcategory: "Bags",
  },
  ac2: {
    description: "A hand-painted silk scarf with an artistic botanical print. Versatile enough to wear as a headband, belt, necktie, or bag accent.",
    colors: [{ name: "Ivory", hex: "#F5F0E8" }, { name: "Sky", hex: "#89CFF0" }, { name: "Blush", hex: "#F4A7B9" }],
    reviewCount: 87,
    subcategory: "Scarves",
  },
  ac3: {
    description: "A full-grain leather belt with a brushed silver buckle. Handcrafted in Italy using vegetable-tanned leather. Develops a beautiful patina over time.",
    colors: [{ name: "Tan", hex: "#D2691E" }, { name: "Black", hex: "#1A1A1A" }, { name: "Cognac", hex: "#9B4F0F" }],
    sizes: ["S (26-30\")", "M (30-34\")", "L (34-38\")", "XL (38-42\")"],
    reviewCount: 201,
    subcategory: "Belts",
  },
  ac4: {
    description: "UV400 polarized cat-eye sunglasses with lightweight acetate frames. Blocks 100% of UVA and UVB rays. Comes with a hard case and cleaning cloth.",
    colors: [{ name: "Tortoise", hex: "#8B6914" }, { name: "Black", hex: "#1A1A1A" }, { name: "Clear", hex: "#E8E8E8" }],
    reviewCount: 318,
    subcategory: "Eyewear",
  },
  ac5: {
    description: "A spacious organic cotton canvas tote with two interior slip pockets and a zip pocket. Machine washable and eco-friendly. 15-inch laptop fits easily.",
    colors: [{ name: "Natural", hex: "#D4C5A9" }, { name: "Black", hex: "#1A1A1A" }, { name: "Sage", hex: "#9CAF88" }],
    reviewCount: 156,
    subcategory: "Bags",
  },
  ac6: {
    description: "A set of 8 resin hair clips in complementary colors. Lightweight and gentle on all hair types. Strong hold all day. Suitable for thick and fine hair.",
    colors: [{ name: "Pastels", hex: "#C4B5FD" }, { name: "Neutrals", hex: "#D4B896" }, { name: "Brights", hex: "#F0A0D8" }],
    reviewCount: 445,
    subcategory: "Hair",
  },

  // ── Home ───────────────────────────────────────────────────────────────────
  h1: {
    description: "A hand-thrown ceramic mug with a matte reactive glaze. Each piece is unique. Microwave and dishwasher safe. Holds 12oz with a comfortable C-handle.",
    colors: [{ name: "Stone", hex: "#9E9E9E" }, { name: "Sage", hex: "#9CAF88" }, { name: "Blush", hex: "#F4A7B9" }, { name: "Navy", hex: "#1E3A5F" }],
    sizes: ["8oz", "12oz", "16oz"],
    reviewCount: 287,
    subcategory: "Drinkware",
  },
  h2: {
    description: "A stonewashed Belgian linen pillow cover with a hidden zip. Sustainably made in Lithuania. Pre-washed for a lived-in softness. Insert not included.",
    colors: [{ name: "Oat", hex: "#D4B896" }, { name: "Sage", hex: "#9CAF88" }, { name: "Stone", hex: "#9E9E9E" }, { name: "Dusty Rose", hex: "#C9848A" }],
    sizes: ["18\"×18\"", "20\"×20\"", "22\"×22\""],
    reviewCount: 198,
    subcategory: "Pillows",
  },
  h3: {
    description: "A hand-poured soy wax candle with calming eucalyptus and lavender essential oils. Lead-free cotton wick. Burns cleanly for 60+ hours.",
    colors: [{ name: "Ivory", hex: "#F5F0E8" }, { name: "Sage", hex: "#9CAF88" }, { name: "Blush", hex: "#F4A7B9" }],
    sizes: ["4oz", "8oz", "12oz"],
    reviewCount: 412,
    subcategory: "Candles",
  },
  h4: {
    description: "A genuine Italian marble tray with brushed gold handles. Perfect for organizing perfumes, jewelry, or serving breakfast in bed. Wipe clean only.",
    colors: [{ name: "White Marble", hex: "#F5F5F5" }, { name: "Black Marble", hex: "#2A2A2A" }],
    sizes: ["Small (8\"×5\")", "Large (12\"×8\")"],
    reviewCount: 167,
    subcategory: "Decor",
  },
  h5: {
    description: "A hand-painted ceramic vase with a reactive glaze that makes each piece one-of-a-kind. Waterproof interior. Perfect for fresh or dried flowers.",
    colors: [{ name: "Sage", hex: "#9CAF88" }, { name: "Terracotta", hex: "#C27352" }, { name: "Cobalt", hex: "#0047AB" }],
    sizes: ["Small (6\")", "Medium (9\")", "Large (12\")"],
    reviewCount: 223,
    subcategory: "Decor",
  },
  h6: {
    description: "A heavyweight Belgian linen throw, stonewashed for that lived-in softness. Ethically woven by a small mill in Lithuania. Machine washable on cold.",
    colors: [{ name: "Oat", hex: "#D4B896" }, { name: "Mocha", hex: "#7B5E3A" }, { name: "Navy", hex: "#1E3A5F" }, { name: "Dusty Rose", hex: "#C9848A" }],
    sizes: ["50×60", "60×80", "80×100"],
    reviewCount: 312,
    subcategory: "Throws",
  },
};
