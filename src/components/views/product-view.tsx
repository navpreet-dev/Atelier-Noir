"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Minus,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Star,
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductCard, type Product } from "@/components/site/product-card";
import { StarRating } from "@/components/site/star-rating";
import { formatPrice, useStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
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

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ProductView({ slug }: { slug: string }) {
  const navigate = useStore((s) => s.navigate);
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const requireSignIn = useStore((s) => s.requireSignIn);
  const logClientActivity = useStore((s) => s.logClientActivity);

  const [product, setProduct] = useState<DetailedProduct | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [adding, setAdding] = useState(false);

  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, true>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setProduct(null);
    setReviews([]);
    setRelated([]);
    setSelectedColor(null);
    setSelectedSize(null);
    setQty(1);
    setImgIdx(0);
    setVideoPlaying(false);
    logClientActivity("product_viewed", { slug });

    fetch(`/api/products/${slug}`)
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("not found"))
      )
      .then((json) => {
        if (cancelled) return;
        const p = (json.product ?? null) as DetailedProduct | null;
        if (!p) {
          setNotFound(true);
          return;
        }
        setProduct(p);
        setSelectedColor(p.colors?.[0]?.name ?? null);

        fetch(`/api/reviews?productId=${encodeURIComponent(p.id)}`)
          .then((r) => r.json())
          .then((rj) => {
            if (!cancelled) setReviews((rj.reviews ?? []) as Review[]);
          })
          .catch(() => undefined);

        const relQuery =
          p.gender === "unisex"
            ? "category=bags,shoes,accessories"
            : `gender=${encodeURIComponent(p.gender)}`;
        fetch(
          `/api/products?exclude=${encodeURIComponent(slug)}&limit=8&${relQuery}`
        )
          .then((r) => r.json())
          .then((rj) => {
            if (!cancelled) setRelated((rj.products ?? []) as Product[]);
          })
          .catch(() => undefined);
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

  const discount = useMemo(() => {
    if (!product?.comparePrice || product.comparePrice <= product.price) return null;
    return Math.round((1 - product.price / product.comparePrice) * 100);
  }, [product?.price, product?.comparePrice]);

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
    });
    const total = reviews.length || 1;
    return counts
      .map((count, idx) => ({
        stars: idx + 1,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .reverse();
  }, [reviews]);

  const recommend = reviews.length
    ? (reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100
    : 84;

  const wished = useStore((s) => (product ? s.inWishlist(product.id) : false));

  const scrollToReviews = () => {
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
  };

  const guardSize = () => {
    if (selectedSize) return true;
    toast({ title: "Please select a size.", variant: "destructive" });
    return false;
  };

  const handleAddToBag = async () => {
    if (!product || adding) return;
    if (!guardSize()) return;
    setAdding(true);
    const ok = await addToCart(product, selectedSize!, selectedColor ?? "Default", qty);
    setAdding(false);
    if (ok) {
      toast({
        title: `${product.name} — added to your bag`,
        description: `${selectedColor} · Size ${selectedSize} · Qty ${qty}`,
      });
    } else {
      toast({ title: "Could not add to bag. Please try again.", variant: "destructive" });
    }
  };

  const handleBuyNow = async () => {
    if (!product || adding) return;
    if (!requireSignIn()) return;
    if (!guardSize()) return;
    setAdding(true);
    const ok = await addToCart(product, selectedSize!, selectedColor ?? "Default", qty);
    setAdding(false);
    if (ok) {
      navigate({ name: "checkout" });
    } else {
      toast({ title: "Could not continue. Please try again.", variant: "destructive" });
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    const wasWished = useStore.getState().inWishlist(product.id);
    toggleWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    if (useStore.getState().user) {
      toast({ title: wasWished ? "Removed from wishlist" : "Saved to wishlist" });
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!formName.trim() || !formTitle.trim() || !formBody.trim()) {
      toast({
        title: "Please fill in your name, a title and your review",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          author: formName.trim(),
          location: formLocation.trim() || undefined,
          rating: formRating,
          title: formTitle.trim(),
          body: formBody.trim(),
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
      toast({ title: "Thank you for your review!", description: "It is now live on this product." });
      setReviewOpen(false);
      setFormName("");
      setFormLocation("");
      setFormTitle("");
      setFormBody("");
      setFormRating(5);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Could not submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const markHelpful = (id: string) => {
    if (helpfulVotes[id]) return;
    setHelpfulVotes((prev) => ({ ...prev, [id]: true }));
    toast({ title: "Thanks for the feedback" });
  };

  if (loading) {
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
  }

  if (notFound || !product) {
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
  }

  const genderLabel = product.gender === "unisex" ? "Accessories" : product.gender === "men" ? "Men" : "Women";
  const sizeList = product.sizes.length ? product.sizes : ["One Size"];
  const materials = product.materials ?? [];
  const details = product.details ?? [];

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-6 lg:px-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-stone-400"
        >
          <button onClick={() => navigate({ name: "home" })} className="hover:text-stone-900">
            Home
          </button>
          <span aria-hidden>/</span>
          <button
            onClick={() =>
              navigate({
                name: "shop",
                gender: product.gender === "unisex" ? "all" : product.gender,
                title: genderLabel,
              })
            }
            className="capitalize hover:text-stone-900"
          >
            {product.gender}
          </button>
          <span aria-hidden>/</span>
          <span className="normal-case text-stone-700">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
              {videoPlaying && product.video ? (
                <video
                  src={product.video}
                  controls
                  autoPlay
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <img
                  src={product.images[imgIdx] ?? product.images[0]}
                  alt={`${product.name} — view ${imgIdx + 1}`}
                  className="h-full w-full object-cover"
                />
              )}
              {(product.isNew || product.bestseller) && (
                <span className="absolute left-4 top-4 bg-stone-900 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-white">
                  {product.isNew ? "NEW SEASON" : "BESTSELLER"}
                </span>
              )}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => {
                    setImgIdx(i);
                    setVideoPlaying(false);
                  }}
                  aria-label={`View image ${i + 1}`}
                  className={`relative aspect-[3/4] overflow-hidden border transition ${
                    !videoPlaying && imgIdx === i
                      ? "border-stone-900"
                      : "border-transparent hover:border-stone-300"
                  }`}
                >
                  <img
                    src={product.images[i] ?? product.images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
              {product.video ? (
                <button
                  onClick={() => setVideoPlaying(true)}
                  aria-label="Play product video"
                  className={`relative aspect-[3/4] overflow-hidden border transition ${
                    videoPlaying ? "border-stone-900" : "border-transparent hover:border-stone-300"
                  }`}
                >
                  <img
                    src={product.images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-stone-900/30">
                    <Play size={18} className="fill-white text-white" aria-hidden />
                  </span>
                </button>
              ) : product.images[3] ? (
                <button
                  onClick={() => {
                    setImgIdx(3);
                    setVideoPlaying(false);
                  }}
                  aria-label="View image 4"
                  className={`relative aspect-[3/4] overflow-hidden border transition ${
                    !videoPlaying && imgIdx === 3
                      ? "border-stone-900"
                      : "border-transparent hover:border-stone-300"
                  }`}
                >
                  <img src={product.images[3]} alt="" className="h-full w-full object-cover" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Details */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B08968]">
              {capitalize(product.gender)} · {product.category}
            </p>
            <h1 className="mt-2 font-display text-3xl tracking-tight text-stone-900 md:text-4xl">
              {product.name}
            </h1>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={scrollToReviews}
                aria-label={`Rated ${product.rating} out of 5`}
                className="flex items-center gap-2 text-xs text-stone-500 hover:underline"
              >
                <StarRating rating={product.rating} size={12} />
                <span>
                  {product.rating.toFixed(1)} {product.reviewCount} reviews
                </span>
              </button>
              <span className="text-stone-200" aria-hidden>
                |
              </span>
              <span className="text-xs text-stone-500">{product.sold}+ sold</span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span
                className={`text-2xl font-semibold ${discount ? "text-[#9A3B26]" : "text-stone-900"}`}
              >
                {formatPrice(product.price)}
              </span>
              {discount && product.comparePrice && (
                <>
                  <span className="text-lg text-stone-400 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                  <span className="ml-1 bg-[#9A3B26]/10 px-2 py-0.5 text-[11px] font-semibold text-[#9A3B26]">
                    −{discount}%
                  </span>
                </>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-stone-600">{product.description}</p>

            {/* Colour */}
            {product.colors.length > 0 && (
              <div className="mt-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Colour:{" "}
                  <span className="ml-1 normal-case tracking-normal">
                    {capitalize(selectedColor ?? "")}
                  </span>
                </p>
                <div className="mt-3 flex gap-3">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      aria-label={`Colour ${c.name}`}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                        selectedColor === c.name
                          ? "border-stone-900"
                          : "border-transparent ring-1 ring-stone-200 hover:ring-stone-400"
                      }`}
                    >
                      <span
                        className="h-7 w-7 rounded-full"
                        style={{ backgroundColor: c.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Size:{" "}
                  <span className="ml-1 normal-case tracking-normal">
                    {selectedSize ?? "Select a size"}
                  </span>
                </p>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 underline hover:text-stone-900"
                >
                  Size Guide
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizeList.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-12 border px-3 py-2.5 text-xs font-medium transition ${
                      selectedSize === size
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-300 text-stone-700 hover:border-stone-900"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + CTAs */}
            <div className="mt-8 flex items-stretch gap-3">
              <div className="flex items-center border border-stone-300">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-12 w-12 items-center justify-center text-stone-600 transition hover:bg-stone-50"
                >
                  <Minus size={15} aria-hidden />
                </button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  aria-label="Increase quantity"
                  className="flex h-12 w-12 items-center justify-center text-stone-600 transition hover:bg-stone-50"
                >
                  <Plus size={15} aria-hidden />
                </button>
              </div>
              <button
                onClick={handleAddToBag}
                disabled={adding}
                className="h-12 flex-1 bg-stone-900 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700 disabled:opacity-60"
              >
                {adding ? "Adding…" : "Add to Bag"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={adding}
                className="h-12 flex-1 border border-stone-900 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900 transition hover:bg-stone-900 hover:text-white disabled:opacity-60"
              >
                Buy Now
              </button>
              <button
                onClick={handleToggleWishlist}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                className="flex h-12 w-12 items-center justify-center border border-stone-300 transition hover:border-stone-900"
              >
                <Heart
                  size={18}
                  className={wished ? "fill-[#9A3B26] text-[#9A3B26]" : "text-stone-700"}
                  aria-hidden
                />
              </button>
            </div>

            {/* Reassurance */}
            <div className="mt-7 grid grid-cols-1 gap-3 border-y border-stone-100 py-4 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Truck size={16} className="shrink-0 text-stone-400" aria-hidden />
                Free shipping over $150
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <RotateCcw size={16} className="shrink-0 text-stone-400" aria-hidden />
                Free 30-day returns
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <ShieldCheck size={16} className="shrink-0 text-stone-400" aria-hidden />
                10-year repair guarantee
              </div>
            </div>

            {/* Accordions */}
            <Accordion type="single" collapsible className="mt-2">
              <AccordionItem value="description" className="border-stone-200">
                <AccordionTrigger className="text-[11px] font-semibold uppercase tracking-[0.25em]">
                  Description & Fit
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-stone-600">
                  {product.description}
                  {materials.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {materials.map((m) => (
                        <li key={m} className="flex gap-2">
                          <span
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-400"
                            aria-hidden
                          />
                          {m}
                        </li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="details" className="border-stone-200">
                <AccordionTrigger className="text-[11px] font-semibold uppercase tracking-[0.25em]">
                  Details & Care
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5 text-sm text-stone-600">
                    {details.map((d) => (
                      <li key={d} className="flex gap-2">
                        <span
                          className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-400"
                          aria-hidden
                        />
                        {d}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping" className="border-stone-200">
                <AccordionTrigger className="text-[11px] font-semibold uppercase tracking-[0.25em]">
                  Shipping & Returns
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-stone-600">
                  Free carbon-neutral shipping on orders over $150. Express $12. Free returns
                  within 30 days. Every piece carries our 10-year repair guarantee.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section
        id="reviews"
        className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-24 md:px-6 lg:px-10"
      >
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B08968]">
            Reviews
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-stone-900">
            What {product.reviewCount} People Say
          </h2>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <p className="font-display text-5xl leading-none text-stone-900">
            {product.rating.toFixed(1)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <StarRating rating={product.rating} size={16} />
            <span className="text-xs text-stone-500">{reviews.length} verified reviews</span>
          </div>
          <div className="mt-5 space-y-2">
            {distribution.map((d) => (
              <div key={d.stars} className="flex items-center gap-3 text-xs text-stone-500">
                <span className="flex w-8 items-center justify-end gap-0.5">
                  {d.stars}
                  <Star size={10} className="fill-[#B08968] text-[#B08968]" aria-hidden />
                </span>
                <div className="h-1.5 w-40 bg-stone-100">
                  <div className="h-full bg-stone-900" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="w-8 text-right">{d.count}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[13px] text-stone-500">
            <strong className="font-semibold text-stone-900">{Math.round(recommend)}%</strong> of
            reviewers recommend this piece.
          </p>
          <button
            onClick={() => setReviewOpen(true)}
            className="mt-5 border border-stone-900 px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] transition hover:bg-stone-900 hover:text-white"
          >
            Write a Review
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="mx-auto mt-10 max-w-md border border-dashed border-stone-300 py-16 text-center">
            <p className="font-display text-xl text-stone-800">
              No reviews yet — be the first
            </p>
            <p className="mt-2 text-sm text-stone-500">
              Share your fit notes and styling tips with the community.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <article key={r.id} className="border border-stone-200 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-sm text-white"
                      aria-hidden
                    >
                      {r.author.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {r.author}
                        {r.verified !== false && (
                          <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                            Verified Buyer
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-stone-400">{r.location || "Verified purchase"}</p>
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
                    onClick={() => markHelpful(r.id)}
                    disabled={!!helpfulVotes[r.id]}
                    className="border border-stone-200 px-3 py-1 transition hover:border-stone-900 hover:text-stone-900 disabled:opacity-60"
                  >
                    Yes ({r.helpful + (helpfulVotes[r.id] ? 1 : 0)})
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-24 md:px-6 lg:px-10">
          <div className="mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B08968]">
              Complete the Look
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-stone-900">
              You May Also Like
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Size guide dialog */}
      <Dialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen}>
        <DialogContent className="rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Size Guide</DialogTitle>
            <DialogDescription className="sr-only">
              Garment measurements in centimetres.
            </DialogDescription>
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

      {/* Write a review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="rounded-none sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Write a Review</DialogTitle>
            <DialogDescription className="sr-only">
              Share your fit notes and styling tips.
            </DialogDescription>
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
                    <Star
                      size={22}
                      className={
                        n <= formRating
                          ? "fill-[#B08968] text-[#B08968]"
                          : "fill-stone-200 text-stone-200"
                      }
                      aria-hidden
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Your name *"
                aria-label="Your name"
                className="h-11 rounded-none border border-stone-300 px-3.5 text-sm focus:border-stone-900 focus:outline-none"
              />
              <input
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="City (optional)"
                aria-label="City"
                className="h-11 rounded-none border border-stone-300 px-3.5 text-sm focus:border-stone-900 focus:outline-none"
              />
            </div>
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Review title *"
              aria-label="Review title"
              className="h-11 w-full rounded-none border border-stone-300 px-3.5 text-sm focus:border-stone-900 focus:outline-none"
            />
            <textarea
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder="How is the fit, fabric and finish? *"
              rows={4}
              aria-label="Your review"
              className="w-full rounded-none border border-stone-300 px-3.5 py-3 text-sm focus:border-stone-900 focus:outline-none"
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
                <X size={14} aria-hidden />
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
