import { Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "classic-tshirt",
    name: "Heavyweight Core T-Shirt",
    category: "Apparel",
    description: "Relaxed fit, structured heavyweight jersey knit. Features a seamless double-needle collar and heavy fabric texture.",
    baseImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
    defaultColor: "#ffffff",
    printWidthIn: 12,
    printHeightIn: 14,
    colors: [
      { name: "Pristine White", value: "#ffffff" },
      { name: "Mineral Gray", value: "#8e9297" },
      { name: "Midnight Onyx", value: "#1a1a1a" },
      { name: "Spruce Green", value: "#2d4a43" },
      { name: "Royal Purple", value: "#4a354f" },
      { name: "Sand Beige", value: "#d3c3b0" },
      { name: "Terracotta Sunset", value: "#b05e49" }
    ],
    editZone: {
      top: 24,
      left: 30,
      width: 40,
      height: 40,
      shape: "rounded",
      label: "Chest Print Zone"
    }
  },
  {
    id: "classic-hoodie",
    name: "Streetwear Fleece Hoodie",
    category: "Apparel",
    description: "Premium fleece pullover hoodie with double-lined hood, tone-on-tone drawcords, and spacious front waist pocket.",
    baseImage: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=80",
    defaultColor: "#d2d2d2",
    printWidthIn: 13,
    printHeightIn: 10,
    colors: [
      { name: "Carbon Heather", value: "#d2d2d2" },
      { name: "Pure Black", value: "#141414" },
      { name: "Oatmeal Cream", value: "#eae3d2" },
      { name: "Vintage Maroon", value: "#6e2a39" },
      { name: "Pacific Blue", value: "#26435c" },
      { name: "Forest Moss", value: "#32432a" }
    ],
    editZone: {
      top: 26,
      left: 28,
      width: 44,
      height: 32,
      shape: "rect",
      label: "Chest & Center Front Zone"
    }
  },
  {
    id: "ceramic-mug",
    name: "Classic Coffee Mug (11oz)",
    category: "Living",
    description: "Sleek ceramic construction with an elegant easy-grip handle, smooth rim, and vibrant high-gloss protective glazing.",
    baseImage: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
    defaultColor: "#fcfcfa",
    printWidthIn: 8,
    printHeightIn: 3.5,
    colors: [
      { name: "Alabaster White", value: "#fcfcfa" },
      { name: "Slate Matte Black", value: "#232324", contrastMugInternal: true },
      { name: "Cyberpunk Pink", value: "#ff5e97" },
      { name: "Lemon Citron", value: "#ffdf5e" },
      { name: "Mint Foam", value: "#a2d9c4" },
      { name: "Terracotta Clay", value: "#db8369" }
    ],
    editZone: {
      top: 18,
      left: 24,
      width: 38,
      height: 48,
      shape: "cylinder",
      label: "Wrap Boundary Editor"
    }
  },
  {
    id: "dad-cap",
    name: "Adjustable Dad Cap",
    category: "Accessories",
    description: "Classic relaxed fit 6-panel unstructured dad hat. Finished with embroidered eyelets and premium strap tri-glide closure.",
    baseImage: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80",
    defaultColor: "#1b283c",
    printWidthIn: 4.5,
    printHeightIn: 2.2,
    colors: [
      { name: "Classic Navy", value: "#1b283c" },
      { name: "Washed Sage", value: "#697a6f" },
      { name: "Stone White", value: "#ededeb" },
      { name: "Charcoal Black", value: "#262626" },
      { name: "Vintage Burgundy", value: "#522424" }
    ],
    editZone: {
      top: 36,
      left: 34,
      width: 32,
      height: 24,
      shape: "rounded",
      label: "Embroidered Center Crown"
    }
  },
  {
    id: "canvas-tote",
    name: "Heavy Canvas Tote Bag",
    category: "Accessories",
    description: "Reinforced 100% natural cotton drill canvas with thick load-bearing shoulder straps and wide gusset bottom.",
    baseImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80",
    defaultColor: "#e6decb",
    printWidthIn: 11,
    printHeightIn: 12,
    colors: [
      { name: "Natural Ecru", value: "#e6decb" },
      { name: "Stealth Black", value: "#171717" },
      { name: "French Riviera Indigo", value: "#364d63" },
      { name: "Olive Field", value: "#525e4c" },
      { name: "Mustard Harvest", value: "#d69f3d" }
    ],
    editZone: {
      top: 24,
      left: 20,
      width: 60,
      height: 52,
      shape: "rect",
      label: "Front Print Area"
    }
  },
  {
    id: "phone-case",
    name: "Sleek Matte Phone Case",
    category: "Accessories",
    description: "Impact-resistant thermoplastic polycarbonate outer shell with a flexible interior liner. Features a raised bezel lens guard.",
    baseImage: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1000&q=80",
    defaultColor: "#141416",
    printWidthIn: 3.5,
    printHeightIn: 6.2,
    colors: [
      { name: "Midnight Black", value: "#141416" },
      { name: "Frosted Arctic White", value: "#f2f2f4" },
      { name: "Sage Jade", value: "#7c9384" },
      { name: "Bubblegum Teal", value: "#69abb5" },
      { name: "Sweet Blush Pink", value: "#dfa3ae" }
    ],
    editZone: {
      top: 14,
      left: 16,
      width: 68,
      height: 74,
      shape: "rounded",
      label: "Full Back Surface Print"
    }
  }
];

export const ARTWORK_PRESETS = [
  {
    name: "Cyber Neon Cat",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    prompt: "A cyber-neon cat badge, vibrant retro futuristic vaporwave illustration, vector art"
  },
  {
    name: "Golden Hour Peaks",
    url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=400&q=80",
    prompt: "Serene mountain geometric illustration at golden hour sunset, minimalist line art shield badge"
  },
  {
    name: "Ethereal Botanical",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80",
    prompt: "Minimalist fine line botanical floral watercolor artwork, beautiful pastel cream accents, clean vector shape"
  },
  {
    name: "Cosmic Odyssey",
    url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=400&q=80",
    prompt: "Circular retro space rocket adventure patch, bold flat vectors, screen-print style cosmic details"
  }
];

export const BACKDROP_PRESETS = [
  { name: "Studio Backdrop (Default)", value: "" },
  { name: "Minimalist Kitchen Counter", prompt: "A coffee mug on a neutral concrete kitchen countertop, sunny soft-focus window bokeh background" },
  { name: "Cozy Wood Dining Room", prompt: "A merchandise item sitting on a clean rustic oak dining table, cozy fireplace lighting" },
  { name: "Retro Industrial Studio", prompt: "A t-shirt flat lay resting on a weathered concrete floor, aesthetic industrial workspace with warm hanging bulbs" },
  { name: "Lush Plant Shelfie", prompt: "A merchandise mockup arranged on a white wall shelf surrounded by potted marble queen pothos houseplants, pastel sunshine" },
  { name: "High-End Retail Showroom", prompt: "An exquisite product mock layout styled on a minimalist timber display podium inside a modern designer boutique store" }
];
