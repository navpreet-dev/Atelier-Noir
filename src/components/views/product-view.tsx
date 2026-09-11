"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Heart,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaVideo } from "@/components/site/media-video";
import { ProductCard, type Product } from "@/components/site/product-card";
import { StarRating } from "@/components/site/star-rating";
import { formatPrice, useStore } from "@/lib/store";
import { toast } from "sonner";
import { SIZE_GUIDE_ROWS } from "@/lib/site-data";

type DetailedProduct = Product & {
  description: string;
  video: string | null;
  details: string[];
  materials: string[];
};

type Review = {
  id: string;
  author: string;
  location?: string | null;
  rating: number;
  title: string;
  body: string;
  verified?: boolean;
  helpful: number;
  createdAt: string;
};

/* Original nT section header (center + light variant, exact class order). */
function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center mx-auto max-w-2xl mb-10 md:mb-14">
      {eyebrow && (
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase mb-3 text-[#B08968]">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl md:text-[2.75rem] leading-tight tracking-tight text-stone-900">
        {title}
      </h2>
    </div>
  );
}

export function ProductView({ slug }: { slug: string }) {
  const navigate = useStore((s) => s.navigate);
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const requireSignIn = useStore((s) => s.requireSignIn);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const logClientActivity = useStore((s) => s.logClientActivity);

  const [product, setProduct] = useState<DetailedProduct | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setImgIdx(0);
    setSelectedSize(null);
    setSelectedColor(null);
    setQty(1);

    fetch(`/api/products/${slug}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("not found"))))
      .then((json) => {
        if (cancelled) return;
        const p = (json.product ?? null) as DetailedProduct | null;
        setProduct(p);
        setReviews((json.reviews ?? []) as Review[]);
        if (p?.colors?.length) setSelectedColor(p.colors[0].name);
        if (p) {
          logClientActivity("viewed_product", { slug, name: p.name });

          const relQuery =
            p.gender === "unisex" ? "category=bags,shoes,accessories" : `gender=${p.gender}`;
          fetch(`/api/products?exclude=${slug}&limit=8&${relQuery}`)
            .then((r) => r.json())
            .then((rj) => {
              if (!cancelled) setRelated(((rj.products ?? []) as Product[]).slice(0, 4));
            })
            .catch(() => undefined);
        } else {
          setRelated([]);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, logClientActivity]);

  const hasVideo = !!product?.video;
  const totalSlides = (product?.images.length ?? 0) + (hasVideo ? 1 : 0);
  const isVideoSlide = hasVideo && imgIdx === totalSlides - 1;

  const discount = useMemo(() => {
    if (!product?.comparePrice || product.comparePrice <= product.price) return null;
    return Math.round((1 - product.price / product.comparePrice) * 100);
  }, [product?.price, product?.comparePrice]);

  const breakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
    });
    const total = reviews.length || 1;
    return counts
      .reverse()
      .map((count, r) => ({ stars: 5 - r, count, pct: Math.round((count / total) * 100) }));
  }, [reviews]);

  const ensureSize = () => {
    if (selectedSize) return true;
    toast.error("Please select a size first");
    return false;
  };

  const handleAddToBag = async () => {
    if (!product || !requireSignIn() || !ensureSize()) return;
    setAdding(true);
    const ok = await addToCart(product, selectedSize!, selectedColor || "Default", qty);
    setAdding(false);
    if (ok) {
      toast.success(`${product.name} — added to your bag`, {
        description: `${selectedColor} · Size ${selectedSize} · Qty ${qty}`,
      });
      setCartOpen(true);
    } else {
      toast.error("Could not add to bag. Please try again.");
    }
  };

  const handleBuyNow = async () => {
    if (!product || !requireSignIn() || !ensureSize()) return;
    setAdding(true);
    const ok = await addToCart(product, selectedSize!, selectedColor || "Default", qty);
    setAdding(false);
    if (ok) {
      navigate({ name: "cart" });
    } else {
      toast.error("Could not continue. Please try again.");
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    // Store's toggleWishlist expects a WishItem snapshot and is a no-op when
    // signed out (it triggers requireSignIn itself), so the success toast is
    // gated on the user being signed in.
    toggleWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    if (useStore.getState().user) {
      toast.success(wished ? "Removed from wishlist" : "Saved to wishlist");
    }
  };

  const wished = useStore((s) => (product ? s.inWishlist(product.id) : false));

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!formName.trim() || !formTitle.trim() || !formBody.trim()) {
      toast.error("Please fill in your name, a title and your review");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          author: formName,
          rating: formRating,
          title: formTitle,
          body: formBody,
          location: formLocation,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "failed");
      setReviews((prev) => [json.review as Review, ...prev]);
      setProduct((p) =>
        p
          ? {
              ...p,
              rating:
                Math.round(((p.rating * p.reviewCount + formRating) / (p.reviewCount + 1)) * 10) /
                10,
              reviewCount: p.reviewCount + 1,
            }
          : p
      );
      toast.success("Thank you for your review!", { description: "It is now live on this product." });
      setReviewOpen(false);
      setFormName("");
      setFormLocation("");
      setFormTitle("");
      setFormBody("");
      setFormRating(5);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse bg-stone-100" />
          <div className="space-y-4 py-4">
            <div className="h-4 w-24 animate-pulse bg-stone-100" />
            <div className="h-10 w-3/4 animate-pulse bg-stone-100" />
            <div className="h-6 w-32 animate-pulse bg-stone-100" />
            <div className="h-32 w-full animate-pulse bg-stone-100" />
          </div>
        </div>
      </div>
    );

  if (notFound || !product)
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="font-display text-3xl text-stone-900">This piece has retired</p>
        <p className="mt-3 max-w-md text-sm text-stone-500">
          The page you are looking for does not exist or the product is no longer available.
        </p>
        <button
          onClick={() => navigate({ name: "shop", title: "All Clothing" })}
          className="mt-8 bg-stone-900 px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-stone-700"
        >
          Back to Shop
        </button>
      </div>
    );

  return (
    <div className="pb-20">
      <nav
        aria-label="Breadcrumb"
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 pt-6 text-[11px] uppercase tracking-[0.18em] text-stone-400 md:px-6 lg:px-10"
      >
        <button onClick={() => navigate({ name: "home" })} className="hover:text-stone-900">
          Home
        </button>
        <span>/</span>
        <button
          onClick={() =>
            navigate({
              name: "shop",
              gender: product.gender === "unisex" ? "all" : product.gender,
              title:
                product.gender === "unisex"
                  ? "Accessories"
                  : product.gender === "men"
                    ? "Men"
                    : "Women",
            })
          }
          className="capitalize hover:text-stone-900"
        >
          {product.gender === "unisex" ? "Accessories" : product.gender}
        </button>
        <span>/</span>
        <span className="normal-case text-stone-700">{product.name}</span>
      </nav>

      <div className="mx-auto mt-6 grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-10">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <div className="flex gap-3 overflow-x-auto md:w-20 md:flex-col md:overflow-visible">
            {product.images.map((img, idx) => (
              <button
                key={img + idx}
                onClick={() => setImgIdx(idx)}
                className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden border-2 transition md:w-full ${
                  imgIdx === idx && !isVideoSlide
                    ? "border-stone-900"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
            {hasVideo && (
              <button
                onClick={() => setImgIdx(totalSlides - 1)}
                className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden border-2 transition md:w-full ${
                  isVideoSlide
                    ? "border-stone-900"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                aria-label="Play product video"
              >
                <img
                  src={product.images[0]}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-stone-900/30">
                  <Play size={18} className="fill-white text-white" />
                </span>
              </button>
            )}
          </div>
          <div className="relative flex-1 select-none overflow-hidden bg-stone-100">
            <div className="relative aspect-[4/5] w-full">
              {isVideoSlide ? (
                <MediaVideo
                  key={product.slug}
                  src={product.video!}
                  poster={product.images[0]}
                  className="h-full w-full object-cover"
                  coverClassName="h-full w-full object-cover"
                />
              ) : (
                <img
                  key={imgIdx}
                  src={product.images[imgIdx]}
                  alt={`${product.name} — view ${imgIdx + 1}`}
                  className="animate-in fade-in h-full w-full object-cover duration-300"
                />
              )}
            </div>
            <div className="absolute left-4 top-4 flex flex-col gap-1.5">
              {product.isNew && (
                <span className="bg-stone-900 px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-white">
                  NEW SEASON
                </span>
              )}
              {discount && (
                <span className="bg-[#9A3B26] px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-white">
                  SAVE {discount}%
                </span>
              )}
            </div>
            <p className="absolute bottom-4 right-4 bg-white/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-600 backdrop-blur">
              {isVideoSlide ? "Film" : `${imgIdx + 1} / ${product.images.length}`}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B08968]">
            {product.gender === "unisex" ? "Unisex" : product.gender === "men" ? "Men" : "Women"} · {product.category}
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-stone-900 md:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => reviewsRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 text-sm text-stone-600 hover:underline"
            >
              <StarRating rating={product.rating} />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-stone-400 underline underline-offset-2">
                {product.reviewCount} reviews
              </span>
            </button>
            <span className="text-stone-200">|</span>
            <span className="text-sm text-stone-500">{product.sold}+ sold</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span
              className={`text-2xl font-semibold ${discount ? "text-[#9A3B26]" : "text-stone-900"}`}
            >
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-stone-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
            {discount && (
              <span className="text-sm font-medium text-[#9A3B26]">
                You save {formatPrice(product.comparePrice! - product.price)}
              </span>
            )}
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-stone-600">{product.description}</p>

          {/* Colour */}
          <div className="mt-7">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900">
                Colour:{" "}
                <span className="ml-1 font-normal normal-case tracking-normal text-stone-500">
                  {selectedColor}
                </span>
              </p>
            </div>
            <div className="mt-3 flex gap-3">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  title={c.name}
                  aria-label={`Colour ${c.name}`}
                  className={`h-9 w-9 rounded-full border-2 p-0.5 transition ${
                    selectedColor === c.name
                      ? "border-stone-900"
                      : "border-transparent hover:border-stone-300"
                  }`}
                >
                  <span
                    className="block h-full w-full rounded-full border border-stone-200"
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900">
                Size:{" "}
                <span className="ml-1 font-normal normal-case tracking-normal text-stone-500">
                  {selectedSize ?? "Select a size"}
                </span>
              </p>
              <button
                onClick={() => setSizeGuideOpen(true)}
                className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-stone-500 underline underline-offset-4 hover:text-stone-900"
              >
                <Ruler size={13} /> Size Guide
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-12 border px-3.5 py-2.5 text-sm transition ${
                    selectedSize === size
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-300 text-stone-700 hover:border-stone-900"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {product.stock <= 6 && (
              <p className="mt-3 flex items-center gap-2 text-[13px] font-medium text-[#9A3B26]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9A3B26]" />
                Only {product.stock} left — selling fast
              </p>
            )}
          </div>

          {/* Qty + CTAs */}
          <div className="mt-7">
            <div className="flex items-center justify-between sm:hidden">
              <div className="flex h-12 items-center border border-stone-300">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-full w-12 items-center justify-center text-stone-600 hover:bg-stone-50"
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  className="flex h-full w-12 items-center justify-center text-stone-600 hover:bg-stone-50"
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
              <button
                onClick={handleToggleWishlist}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                className="flex h-12 w-14 items-center justify-center border border-stone-300 transition hover:border-stone-900"
              >
                <Heart
                  size={18}
                  className={wished ? "fill-[#9A3B26] text-[#9A3B26]" : "text-stone-700"}
                />
              </button>
            </div>
            <button
              onClick={handleAddToBag}
              disabled={adding}
              className="mt-3 flex w-full items-center justify-center gap-2.5 bg-stone-900 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700 disabled:opacity-60 sm:hidden"
            >
              <ShoppingBag size={16} />
              {adding ? "Adding…" : "Add to Bag"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={adding}
              className="mt-3 flex w-full items-center justify-center border border-stone-900 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900 transition hover:bg-stone-900 hover:text-white disabled:opacity-60 sm:hidden"
            >
              Buy Now
            </button>
            <div className="hidden items-stretch gap-3 sm:flex">
              <div className="flex items-center border border-stone-300">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-full w-11 items-center justify-center text-stone-600 hover:bg-stone-50"
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  className="flex h-full w-11 items-center justify-center text-stone-600 hover:bg-stone-50"
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
              <button
                onClick={handleAddToBag}
                disabled={adding}
                className="flex flex-1 items-center justify-center gap-2.5 bg-stone-900 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700 disabled:opacity-60"
              >
                <ShoppingBag size={16} />
                {adding ? "Adding…" : "Add to Bag"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={adding}
                className="flex flex-1 items-center justify-center border border-stone-900 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900 transition hover:bg-stone-900 hover:text-white disabled:opacity-60"
              >
                Buy Now
              </button>
              <button
                onClick={handleToggleWishlist}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                className="flex w-14 items-center justify-center border border-stone-300 transition hover:border-stone-900"
              >
                <Heart
                  size={18}
                  className={wished ? "fill-[#9A3B26] text-[#9A3B26]" : "text-stone-700"}
                />
              </button>
            </div>
          </div>

          {/* Reassurance */}
          <div className="mt-7 grid grid-cols-3 gap-3 border-y border-stone-100 py-4 text-center">
            {[
              { Icon: Truck, label: "Free shipping over $150" },
              { Icon: RotateCcw, label: "30-day free returns" },
              { Icon: ShieldCheck, label: "10-year repairs" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <Icon size={17} className="text-stone-400" />
                <p className="text-[11px] leading-tight text-stone-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Accordions */}
          <Accordion type="single" collapsible className="mt-2">
            <AccordionItem value="desc" className="border-stone-200">
              <AccordionTrigger className="text-[12px] font-semibold uppercase tracking-[0.2em]">
                Description & Fit
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-stone-600">
                {product.description}
                {" Model is 5′9″ (175 cm) and wears a size S. Fit is true to size with a modern, slightly relaxed cut."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="details" className="border-stone-200">
              <AccordionTrigger className="text-[12px] font-semibold uppercase tracking-[0.2em]">
                Details & Care
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1.5 text-sm text-stone-600">
                  {product.details.map((d) => (
                    <li key={d} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-400" />
                      {d}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                  Materials & Care
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-stone-600">
                  {product.materials.map((m) => (
                    <li key={m} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-400" />
                      {m}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ship" className="border-b-stone-200">
              <AccordionTrigger className="text-[12px] font-semibold uppercase tracking-[0.2em]">
                Shipping & Returns
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-stone-600">
                {
                  "Free carbon-neutral shipping on orders over $150 (2–4 business days). Express available at checkout. Returns are free within 30 days — instant exchanges ship before you send yours back."
                }
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Reviews */}
      <div
        ref={reviewsRef}
        className="mx-auto mt-20 max-w-7xl scroll-mt-28 px-4 md:px-6 lg:px-10"
      >
        <SectionHeader eyebrow="Reviews" title={`What ${product.reviewCount} People Say`} />
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          <div>
            <div className="border border-stone-200 p-6">
              <div className="flex items-end gap-3">
                <p className="font-display text-6xl leading-none text-stone-900">
                  {product.rating.toFixed(1)}
                </p>
                <div className="pb-1">
                  <StarRating rating={product.rating} size={16} />
                  <p className="mt-1 text-xs text-stone-500">
                    {product.reviewCount} verified reviews
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                {breakdown.map((d) => (
                  <div key={d.stars} className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="w-8">{d.stars}★</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-[#B08968]"
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 border-t border-stone-100 pt-4 text-[13px] text-stone-500">
                <strong className="text-stone-900">96%</strong> of reviewers recommend this piece.
              </p>
              <button
                onClick={() => setReviewOpen(true)}
                className="mt-4 w-full border border-stone-900 py-3.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition hover:bg-stone-900 hover:text-white"
              >
                Write a Review
              </button>
            </div>
          </div>
          <div>
            {reviews.length === 0 ? (
              <div className="border border-dashed border-stone-300 py-16 text-center">
                <p className="font-display text-xl text-stone-800">No reviews yet — be the first</p>
                <p className="mt-2 text-sm text-stone-500">
                  Share your fit notes and styling tips with the community.
                </p>
              </div>
            ) : (
              <div className="max-h-[640px] space-y-0 overflow-y-auto pr-1">
                {reviews.map((r) => (
                  <article
                    key={r.id}
                    className="border-b border-stone-100 py-6 first:pt-0 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 font-display text-lg text-stone-700">
                          {r.author.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-stone-900">
                            {r.author}
                            {r.verified && (
                              <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                                Verified Buyer
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-stone-400">
                            {r.location || "Verified purchase"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StarRating rating={r.rating} size={12} />
                        <p className="mt-1 text-[11px] text-stone-400">
                          {new Date(r.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <h4 className="mt-3 text-sm font-semibold text-stone-900">“{r.title}”</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{r.body}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-stone-400">
                      <span>Was this helpful?</span>
                      <button
                        onClick={() => toast.success("Thanks for the feedback")}
                        className="border border-stone-200 px-3 py-1 transition hover:border-stone-900 hover:text-stone-900"
                      >
                        Yes ({r.helpful + 12})
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mx-auto mt-24 max-w-7xl px-4 md:px-6 lg:px-10">
          <SectionHeader eyebrow="Complete the Look" title="You May Also Like" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Size Guide dialog */}
      <Dialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen}>
        <DialogContent className="rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Size Guide</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-stone-500">
            Measurements in cm. Our fits run true to size with a modern, slightly relaxed cut.
          </p>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-[11px] uppercase tracking-wider text-stone-400">
                <th className="py-2">Size</th>
                <th className="py-2">Chest</th>
                <th className="py-2">Waist</th>
                <th className="py-2">Hip</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_GUIDE_ROWS.map((row) => (
                <tr key={row[0]} className="border-b border-stone-100">
                  {row.map((cell, i) => (
                    <td key={i} className="py-2.5 text-stone-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-stone-400">
            Between sizes? Size down for tailoring, up for knitwear.
          </p>
        </DialogContent>
      </Dialog>

      {/* Write a Review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="rounded-none sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Write a Review</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Your rating
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFormRating(n)}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    className="p-1 transition hover:scale-110"
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      className={n <= formRating ? "fill-[#B08968]" : "fill-stone-200"}
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Your name *"
                className="h-11 border border-stone-300 px-3.5 text-sm focus:border-stone-900 focus:outline-none"
              />
              <input
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="City (optional)"
                className="h-11 border border-stone-300 px-3.5 text-sm focus:border-stone-900 focus:outline-none"
              />
            </div>
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Review title *"
              className="h-11 w-full border border-stone-300 px-3.5 text-sm focus:border-stone-900 focus:outline-none"
            />
            <textarea
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder="How is the fit, fabric and finish? *"
              rows={4}
              className="w-full border border-stone-300 px-3.5 py-3 text-sm focus:border-stone-900 focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-stone-900 py-3.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="flex items-center gap-2 border border-stone-300 px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600 hover:border-stone-900"
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
