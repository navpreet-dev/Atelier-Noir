/* Static editorial content — extracted 1:1 from the original Atelier Noir site. */

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  quote?: string;
  content: string[];
};

export const JOURNAL_POSTS: JournalPost[] = [
  {
    slug: "the-art-of-layering",
    title: "The Art of Layering",
    excerpt:
      "Master the interplay of texture and proportion — our stylists break down the five rules of effortless layering for the transitional season.",
    category: "Style Guide",
    date: "March 12, 2025",
    readTime: "6 min read",
    image: "/images/street/street-10.jpg",
    quote: "Layering is not about adding more — it is about revealing intention.",
    content: [
      "Layering is the quiet language of a considered wardrobe. Done well, it reads as effortless; done poorly, it reads as costume. The difference lies in restraint — three pieces, chosen with intention, will always outperform five chosen without.",
      "Begin with a foundation of fine merino or a crisp cotton poplin. These base layers should sit close to the body and disappear underneath everything else. Their job is not to be seen, but to be felt — a collar peeking precisely, a cuff breaking exactly at the wrist bone.",
      "The mid-layer carries the silhouette. An unstructured blazer, a chore jacket, or a fine-gauge cardigan introduces texture without bulk. Keep tonal: sand over ecru, charcoal over slate. Let one piece break the palette — a scarf, a belt, a sock.",
      "Finally, the outer layer sets the tone. A tailored wool coat sharpens; a washed denim jacket softens. Proportion is everything here — if the base is slim, let the coat oversize. If the base is relaxed, keep the outer layer precise.",
      "The result should look inevitable, as if you simply reached for what was closest. That is the art of it.",
    ],
  },
  {
    slug: "inside-the-atelier",
    title: "Inside the Atelier: Where Every Piece Begins",
    excerpt:
      "A behind-the-scenes visit to our Florence workshop, where pattern cutters with four decades of craft still cut every prototype by hand.",
    category: "Craft",
    date: "February 28, 2025",
    readTime: "8 min read",
    image: "/images/boutique/boutique-1.jpg",
    quote:
      "A garment should be repaired, not replaced. We design for the third decade, not the third wash.",
    content: [
      "The workshop sits above a cobblestone courtyard on the edge of Florence — three rooms of steady machines, chalk dust and morning espresso. There are no screens on the cutting tables. There are, however, four decades of muscle memory.",
      "Every Atelier Noir prototype begins as a full-scale paper pattern, cut by hand from a sketch. Nothing moves to production until it has been worn for two weeks by someone on the team — washed, sweated in, sat down in, lived in.",
      "We produce in small runs: rarely more than 300 pieces per style. It is slower and it is more expensive, but it means every bolt of fabric is inspected, every seamstress signs off her section, and nothing is made that we would not wear ourselves.",
      "Our promise is longevity. Every garment carries a repair guarantee — send it back within ten years and we will mend it, reline it, or re-cut it. Most come back. A jacket returned last spring had travelled to thirty-one countries. We fixed one zip and sent it back out.",
      "This is what we mean by quiet luxury: not a logo, but a garment that outlives trends, and perhaps its owner’s patience with it.",
    ],
  },
  {
    slug: "ss25-trend-report",
    title: "The SS25 Trend Report",
    excerpt:
      "Fluid tailoring, washed silk and a return to warm neutrals — the five movements defining our spring collection, and how to wear them now.",
    category: "Trends",
    date: "February 10, 2025",
    readTime: "5 min read",
    image: "/images/editorial/editorial-3.jpg",
    content: [
      "Spring 2025 is a study in softness. After seasons of structure, the pendulum swings toward fluid tailoring — trousers that drape rather than press, blazers with shoulders that follow the body instead of building above it.",
      "Colour returns to warmth. Bone, sand, toffee and clay replace the sterility of grey. These are not safe neutrals; they are depth neutrals, and they layer beautifully against one another.",
      "Washed silk leads the fabric story. Hand-feel matters more than sheen — pieces should look lived-in from the first wear. Our silk slip dress is stone-washed twice for exactly this reason.",
      "The fifth movement is the long skirt: midi lengths with movement, cut on the bias or gathered with intention. Style with a flat leather sandal now, a knee boot in autumn.",
      "Our advice — adopt one movement per season. Style is cumulative, never wholesale.",
    ],
  },
  {
    slug: "denim-guide",
    title: "A Forever Guide to Denim",
    excerpt:
      "Raw, washed, rigid or relaxed — everything you need to know before your next pair, including why we wash ours in Japanese Kaihara mills.",
    category: "Fabric 101",
    date: "January 22, 2025",
    readTime: "7 min read",
    image: "/images/wdenim/wdenim-7.jpg",
    quote: "Buy it once, wear it for a decade, repair it forever.",
    content: [
      "Denim is the most democratic fabric in fashion and the most misunderstood. The weight of the selvedge, the origin of the cotton, the geometry of the cut — each decides whether a jean becomes a uniform or a regret.",
      "We weave our denim in the Kaihara mill in Hiroshima, on shuttle looms that run at a third of modern speed. The result is a tighter, more characterful twill that fades with your life, not with a factory wash.",
      "Fit comes down to two decisions: the rise and the leg. A mid-rise with a straight leg flatters nearly everyone; a high-rise elongates; a relaxed leg needs a considered hem. When in doubt, cuff once.",
      "Care is simple and counterintuitive: wash rarely, cold, inside out. Line dry. The first wash should happen after the first month of wear — the jeans will remember it.",
      "A good jean should be repaired, not replaced. We offer free lifetime hemming and patching on all denim, because a jean that is ten years old is not old. It is proven.",
    ],
  },
  {
    slug: "capsule-wardrobe",
    title: "Building the Capsule Wardrobe",
    excerpt:
      "Thirty pieces. Four seasons. Zero logos. Our creative director shares the exact formula behind a wardrobe that gets better every year.",
    category: "Style Guide",
    date: "January 8, 2025",
    readTime: "6 min read",
    image: "/images/campaign/campaign-2.jpg",
    content: [
      "The capsule wardrobe is not about owning less — it is about owning deliberately. Thirty pieces that interlock mean that every morning begins with yes, not compromise.",
      "The formula: five layers, eight tops, six bottoms, two dresses (or two knits), four pairs of shoes, three bags, two pieces of jewelry. Every piece must pair with at least three others. If it pairs with fewer, it is not a capsule piece — it is an impulse.",
      "Palette discipline is the silent hero. Keep to two neutrals and one accent across everything you own. Ours are stone, ink and toffee.",
      "Spend where the body meets the garment — shoulders, waist, seat. A well-cut coat over a simple tee will always read more luxurious than the reverse.",
      "And finally: the wardrobe should age with you. Buy the best wool you can afford. Re-sole the shoes. Let the denim fade. The goal is a wardrobe that, in ten years, looks like a collection.",
    ],
  },
  {
    slug: "responsible-materials",
    title: "Responsible Materials, Honestly Explained",
    excerpt:
      "GOTS cotton, RWS wool, deadstock silk — what our certifications actually mean, and the three materials we refuse to work with.",
    category: "Sustainability",
    date: "December 14, 2024",
    readTime: "9 min read",
    image: "/images/fabric/fabric-1.jpg",
    quote: "Sustainability is not a collection. It is a supply chain you can name.",
    content: [
      "Every season brings a new green buzzword, so we would rather explain the boring truth: what our materials are, where they come from, and what they cost the planet.",
      "Ninety-two percent of our cotton is GOTS-certified organic, grown in the Aegean region without synthetic pesticides and processed in mills that recycle 85% of their water.",
      "Our wool carries the Responsible Wool Standard — every farm is audited for land management and animal welfare, and mulesing is an automatic disqualifier.",
      "We refuse three materials outright: virgin polyester, conventional viscose, and any leather from tanneries that fail the Leather Working Group’s Gold standard. No exceptions, no green-room loopholes.",
      "The uncomfortable remainder — the 8% — is elastane in our denim, which we are actively replacing with a Roica V550 biodegradable alternative. Honesty includes the gaps.",
    ],
  },
];

export type FaqItem = { q: string; a: string; cat: string };

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "How long does delivery take?",
    a: "Standard delivery takes 2–4 business days and is complimentary on all orders over $150. Express delivery (1–2 business days) is available at checkout for $12. Every order ships carbon-neutral with tracked, plastic-free packaging.",
    cat: "Shipping & Returns",
  },
  {
    q: "What is your return policy?",
    a: "We offer free returns within 30 days of delivery — no questions asked. Items must be unworn with tags attached. Refunds are processed within 3 business days of the parcel reaching our warehouse.",
    cat: "Shipping & Returns",
  },
  {
    q: "Do you offer exchanges?",
    a: "Yes. Choose an instant exchange at checkout and we will ship the new size before we receive your return, subject to availability. Size exchanges are always free, including return postage.",
    cat: "Shipping & Returns",
  },
  {
    q: "How do your sizes run?",
    a: "Our fits are true to size with a modern, slightly relaxed cut. Each product page includes a detailed size guide with garment measurements. If you are between sizes, we generally recommend sizing down for tailoring and up for knitwear.",
    cat: "Product & Fit",
  },
  {
    q: "Where are your garments made?",
    a: "We produce in small runs across family-run workshops in Portugal, Italy and India — each audited annually for fair wages and working conditions. Our denim is woven in Kaihara, Japan; our silk is stone-washed in Como.",
    cat: "Product & Fit",
  },
  {
    q: "Do you repair garments?",
    a: "Every Atelier Noir piece carries a 10-year repair guarantee. Send us the garment with a note describing the issue and we will mend, reline or re-cut it free of charge — you only pay return postage once.",
    cat: "Product & Fit",
  },
  {
    q: "Is my payment secure?",
    a: "Absolutely. All transactions are encrypted end-to-end and processed by PCI-DSS compliant providers. We accept all major cards, PayPal, Apple Pay and Google Pay. We never store card details on our servers.",
    cat: "Orders & Payment",
  },
  {
    q: "Do you restock sold-out items?",
    a: "Core pieces (our Essentials line) restock every 6–8 weeks. Seasonal and limited pieces are produced once and retire forever — join the waitlist on any sold-out product and we will email you the moment it returns.",
    cat: "Orders & Payment",
  },
];

export const TESTIMONIALS = [
  {
    name: "Amelia R.",
    location: "London",
    text: "The trench coat is the single best piece of clothing I have ever owned. Three winters in and it still turns heads.",
    rating: 5,
  },
  {
    name: "Daniel K.",
    location: "New York",
    text: "Finally a brand that understands fit. The trousers feel bespoke at a fraction of the price.",
    rating: 5,
  },
  {
    name: "Priya S.",
    location: "Mumbai",
    text: "The silk dress I wore to a wedding in Goa — four people asked where it was from. The packaging alone felt like a gift.",
    rating: 5,
  },
  {
    name: "Marcus T.",
    location: "Berlin",
    text: "Minimal, honest, incredibly made. My entire wardrobe is slowly becoming Atelier Noir.",
    rating: 4,
  },
  {
    name: "Sofia L.",
    location: "Milan",
    text: "Their knitwear survived a Milanese winter and thirty washes. Customer care repaired a loose cuff for free.",
    rating: 5,
  },
  {
    name: "James W.",
    location: "Sydney",
    text: "Ordered on Monday, wore the oxford shirt on Thursday. The quality-to-price ratio is genuinely unmatched.",
    rating: 5,
  },
];

export type Look = {
  id: number;
  title: string;
  season: string;
  image: string;
  pieces: string[];
};

export const LOOKBOOK_LOOKS: Look[] = [
  { id: 1, title: "Morning in Madrid", season: "SS25", image: "/images/street/street-10.jpg", pieces: ["Linen Shirt", "Relaxed Denim", "Leather Tote"] },
  { id: 2, title: "The Coat Walk", season: "AW24", image: "/images/editorial/editorial-4.jpg", pieces: ["Oversized Trench", "Ribbed Knit", "Chelsea Boots"] },
  { id: 3, title: "Studio Sessions", season: "SS25", image: "/images/editorial/editorial-10.jpg", pieces: ["Silk Slip Dress", "Layered Necklace"] },
  { id: 4, title: "City Uniform", season: "AW24", image: "/images/street/street-3.jpg", pieces: ["Wool Blazer", "Oxford Shirt", "Slim Chinos"] },
  { id: 5, title: "Weekend Layers", season: "SS25", image: "/images/campaign/campaign-3.jpg", pieces: ["Denim Jacket", "Essential Tee", "Minimal Sneakers"] },
  { id: 6, title: "Golden Hour", season: "SS25", image: "/images/editorial/editorial-5.jpg", pieces: ["Floral Midi Dress", "Acetate Sunglasses"] },
  { id: 7, title: "Quiet Power", season: "AW24", image: "/images/campaign/campaign-1.jpg", pieces: ["Wool Long Coat", "Leather Crossbody"] },
  { id: 8, title: "Denim on Denim", season: "SS25", image: "/images/wdenim/wdenim-2.jpg", pieces: ["Heavy Denim Jacket", "High-Rise Denim"] },
  { id: 9, title: "First Frost", season: "AW24", image: "/images/woolcoat/woolcoat-2.jpg", pieces: ["Merino Sweater", "Wool Scarf"] },
];

export const INSTAGRAM_IMAGES = [
  "/images/editorial/editorial-12.jpg",
  "/images/street/street-4.jpg",
  "/images/dresses/dresses-3.jpg",
  "/images/bags/bags-1.jpg",
  "/images/campaign/campaign-5.jpg",
  "/images/shoes/shoes-1.jpg",
  "/images/knit/knit-1.jpg",
  "/images/mjackets/mjackets-1.jpg",
];

export const COLLECTION_TILES = [
  { title: "New Arrivals", tag: "new", image: "/images/editorial/editorial-11.jpg", span: "tall" },
  { title: "Bestsellers", tag: "bestsellers", image: "/images/campaign/campaign-1.jpg", span: "wide" },
  { title: "The Sale", tag: "sale", image: "/images/street/street-3.jpg", span: "normal" },
];

export const SIZE_GUIDE_ROWS: string[][] = [
  ["XS", "80–84", "60–64", "86–91"],
  ["S", "84–88", "64–68", "91–96"],
  ["M", "88–96", "68–76", "96–104"],
  ["L", "96–104", "76–84", "104–112"],
  ["XL", "104–112", "84–94", "112–120"],
];

export const PRESS_NAMES = ["VOGUE", "ELLE", "GQ", "BAZAAR", "MONOCLE", "KINFOLK"];

export const WOMEN_CATEGORIES = [
  { key: "dresses", label: "Dresses" },
  { key: "tops", label: "Tops & Blouses" },
  { key: "knitwear", label: "Knitwear" },
  { key: "coats", label: "Coats & Outerwear" },
  { key: "denim", label: "Denim" },
  { key: "skirts", label: "Skirts" },
];

export const MEN_CATEGORIES = [
  { key: "shirts", label: "Shirts" },
  { key: "blazers", label: "Blazers & Tailoring" },
  { key: "jackets", label: "Jackets" },
  { key: "knitwear", label: "Knitwear" },
  { key: "pants", label: "Trousers" },
  { key: "denim", label: "Denim" },
];

export const ACCESSORIES_CATEGORIES = [
  { key: "bags", label: "Bags" },
  { key: "shoes", label: "Shoes" },
  { key: "accessories", label: "Jewelry & Accessories" },
];

export const CONTACT_CHANNELS = [
  { label: "Visit", lines: ["12 Rue de Sévigné", "75004 Paris — Flagship & Atelier Showroom"] },
  { label: "Email", lines: ["care@ateliernoir.com", "press@ateliernoir.com"] },
  { label: "Call", lines: ["+33 1 42 77 08 90", "Customer care, Mon–Fri 9:00–18:00 CET"] },
  { label: "Store Hours", lines: ["Monday – Saturday · 10:00 – 19:00", "Sunday · 12:00 – 18:00"] },
];

export const CONTACT_SUBJECTS = [
  "Order enquiry",
  "Returns & exchanges",
  "Product & sizing advice",
  "Repairs & care",
  "Press & partnerships",
  "Something else",
];

export const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Singapore",
  "Australia",
  "Germany",
  "France",
  "Japan",
];

export const SEARCH_SUGGESTIONS = [
  "Trench Coat",
  "Silk Dress",
  "Merino Sweater",
  "Denim",
  "Leather Bag",
  "Blazer",
  "Linen Shirt",
];

export const SEARCH_SHORTCUTS = [
  { label: "New Season", tag: "NEW SEASON" },
  { label: "Outerwear", tag: "OUTERWEAR" },
  { label: "Bags", tag: "BAGS" },
  { label: "The Sale", tag: "THE SALE" },
];
