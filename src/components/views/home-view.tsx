"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { ProductCard, type Product } from "@/components/site/product-card";
import { StarRating } from "@/components/site/star-rating";
import { COLLECTION_TILES, INSTAGRAM_IMAGES, LOOKBOOK_LOOKS, PRESS_NAMES, TESTIMONIALS } from "@/lib/site-data";
import { useStore } from "@/lib/store";

const PAGE_COUNT = 3;

export function HomeView() {
  const navigate = useStore((s) => s.navigate);
  return (
    <div>
      <Hero />
      <CategoryCards />
      <ProductRail
        eyebrow="Just Landed"
        title="New Arrivals"
        subtitle="The first light of SS25 — small runs, quiet details, honest fabrics."
        cta="View All"
        onCta={() => navigate({ name: "shop", tag: "new", title: "New Arrivals" })}
        query="/api/products?new=true&sort=newest&limit=8"
        layout="grid"
      />
      <CampaignFilm />
      <CraftSection />
      <ProductRail
        eyebrow="Community Favourites"
        title="The Bestsellers"
        subtitle="The pieces our customers re-order, gift, and write poems about."
        cta="Shop All Bestsellers"
        onCta={() => navigate({ name: "shop", tag: "bestsellers", title: "Bestsellers" })}
        query="/api/products?bestseller=true&sort=popular&limit=4"
        layout="bestsellers"
      />
      <LookbookBanner />
      <CollectionTiles />
      <QuoteSection />
      <Testimonials />
      <WornByYou />
      <FabricFilm />
      <PressBar />
    </div>
  );
}

function Hero() {
  const navigate = useStore((s) => s.navigate);
  return (
    <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden bg-stone-900 text-white">
      <MediaBg src="/videos/hero.mp4" poster="/images/editorial/editorial-8.jpg" imgClassName="opacity-60" eager />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950/50 via-stone-950/20 to-stone-950/60" />
      <div className="an-fade-up relative z-10 max-w-3xl px-6 text-center">
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
          Dress Like You
          <br />
          <em className="text-[#E3C9A8]">Mean It</em>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-stone-200">
          Considered clothing cut in small runs from responsible materials — designed to be worn
          for decades, not seasons.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => navigate({ name: "shop", gender: "women", title: "Women" })}
            className="group flex items-center gap-3 bg-white px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900 transition hover:bg-stone-200"
          >
            Shop Women
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden />
          </button>
          <button
            onClick={() => navigate({ name: "shop", gender: "men", title: "Men" })}
            className="border border-white/70 px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-stone-900"
          >
            Shop Men
          </button>
        </div>
      </div>
    </section>
  );
}

export function MediaBg({
  src,
  poster,
  imgClassName = "",
  eager = false,
  videoClassName = "",
}: {
  src: string;
  poster: string;
  imgClassName?: string;
  eager?: boolean;
  videoClassName?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const on = () => setReady(true);
    v.addEventListener("playing", on);
    return () => v.removeEventListener("playing", on);
  }, []);
  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload={eager ? "auto" : "metadata"}
        disablePictureInPicture
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${videoClassName}`}
        style={{ opacity: ready ? 1 : 0 }}
      />
      <img
        src={poster}
        alt=""
        aria-hidden
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${imgClassName}`}
        style={{ opacity: ready ? 0 : imgClassName.includes("opacity-") ? undefined : 1 }}
      />
    </>
  );
}

function CategoryCards() {
  const navigate = useStore((s) => s.navigate);
  const cards = [
    { title: "Women", image: "/images/editorial/editorial-3.jpg", route: { name: "shop", gender: "women", title: "Women" } as const },
    { title: "Men", image: "/images/blazers/blazers-2.jpg", route: { name: "shop", gender: "men", title: "Men" } as const },
    { title: "Accessories", image: "/images/bags/bags-3.jpg", route: { name: "shop", gender: "all", category: ["bags", "shoes", "accessories"] as string[], title: "Accessories" } as const },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-10">
      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        {cards.map((c) => (
          <button
            key={c.title}
            onClick={() => navigate(c.route)}
            className="group relative aspect-[3/4] overflow-hidden text-left md:aspect-[4/5]"
          >
            <img
              src={c.image}
              alt={`Shop ${c.title}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
            <div className="absolute bottom-7 left-7">
              <p className="font-display text-3xl text-white">{c.title}</p>
              <p className="mt-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/85">
                Shop Now
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden />
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function ProductRail({
  eyebrow,
  title,
  subtitle,
  cta,
  onCta,
  query,
  layout,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta?: string;
  onCta?: () => void;
  query: string;
  layout: "grid" | "bestsellers";
}) {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let live = true;
    fetch(query)
      .then((r) => r.json())
      .then((d) => {
        if (live) setProducts(d.products ?? []);
      })
      .catch(() => live && setProducts([]));
    return () => {
      live = false;
    };
  }, [query]);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6 lg:px-10">
      <div
        className={`mb-10 ${
          layout === "grid"
            ? "flex items-end justify-between"
            : "flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        }`}
      >
        <div className="mb-10 max-w-2xl text-left md:mb-14">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B08968]">
            {eyebrow}
          </p>
          <h2 className="font-display text-3xl leading-tight tracking-tight text-stone-900 md:text-[2.75rem]">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-stone-500 md:text-[15px]">{subtitle}</p>
        </div>
        {cta && layout === "grid" && (
          <button
            onClick={onCta}
            className="mb-10 hidden shrink-0 items-center gap-2 border-b border-stone-900 pb-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900 hover:text-stone-500 md:flex"
          >
            {cta} <ArrowRight size={14} aria-hidden />
          </button>
        )}
      </div>
      <div className={layout === "grid" ? "grid grid-cols-2 gap-6 md:grid-cols-4" : "grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6"}>
        {products === null
          ? [0, 1, 2, 3].map((i) => (
              <div key={i}>
                <div className="aspect-[3/4] animate-pulse bg-stone-100" />
              </div>
            ))
          : products.map((p, i) => <ProductCard key={p.id} product={p} eager={i < 4} />)}
      </div>
      {cta && layout === "bestsellers" && (
        <div className="mt-12 text-center">
          <button
            onClick={onCta}
            className="border border-stone-900 px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900 transition hover:bg-stone-900 hover:text-white"
          >
            {cta}
          </button>
        </div>
      )}
    </section>
  );
}

function CampaignFilm() {
  const navigate = useStore((s) => s.navigate);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6 lg:px-10">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="mb-10 max-w-2xl text-left md:mb-14">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B08968]">
            The Campaign Film
          </p>
          <h2 className="font-display text-3xl leading-tight tracking-tight text-stone-900 md:text-[2.75rem]">
            Worn in Motion
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-stone-500 md:text-[15px]">
            Sixteen seconds of SS25 — shot in Madrid, cut to nothing but the clothes.
          </p>
        </div>
        <button
          onClick={() => navigate({ name: "lookbook" })}
          className="mb-10 hidden shrink-0 items-center gap-2 border-b border-stone-900 pb-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900 hover:text-stone-500 md:flex"
        >
          Shop the Film <ArrowRight size={14} aria-hidden />
        </button>
      </div>
      <div className="group relative -mx-4 h-[calc(100svh-4rem)] overflow-hidden bg-stone-950 md:mx-0 md:aspect-video md:h-auto md:border md:border-stone-200">
        <MediaBg src="/videos/film-ss25.mp4" poster="/images/film-poster.jpg" eager />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/55 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-6 max-w-[70%]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/90">
            Atelier Noir — SS25
          </p>
          <p className="mt-1.5 font-display text-xl text-white md:text-2xl">“Second Nature”</p>
        </div>
        <button
          aria-label={muted ? "Unmute film" : "Mute film"}
          onClick={() => {
            const v = videoRef.current;
            setMuted((m) => {
              if (v) v.muted = !m;
              return !m;
            });
          }}
          className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center border border-white/50 text-white backdrop-blur-sm transition hover:bg-white hover:text-stone-900"
        >
          {muted ? <VolumeX size={17} aria-hidden /> : <Volume2 size={17} aria-hidden />}
        </button>
      </div>
    </section>
  );
}

function CraftSection() {
  const navigate = useStore((s) => s.navigate);
  return (
    <section className="bg-stone-100">
      <div className="mx-auto grid max-w-7xl items-center gap-0 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[560px]">
          <MediaBg src="/videos/editorial-1.mp4" poster="/images/boutique/boutique-2.jpg" />
        </div>
        <div className="px-8 py-14 lg:px-16 lg:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#B08968]">
            The Craft
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-stone-900 md:text-5xl">
            Made Slowly,
            <br />
            On Purpose
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-stone-600">
            Every Atelier Noir piece begins as a hand-cut paper pattern in our Florence workshop. We
            produce in runs of 300 or fewer, inspect every bolt of fabric, and design for the third
            decade — not the third wash.
          </p>
          <ul className="mt-8 space-y-3.5">
            {[
              "Small-run production — never more than 300 pieces per style",
              "GOTS organic cotton, RWS wool, stone-washed silk",
              "10-year repair guarantee on every single garment",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm text-stone-700">
                <span className="mt-[7px] h-1 w-4 shrink-0 bg-[#B08968]" />
                {t}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate({ name: "about" })}
            className="mt-10 inline-flex items-center gap-3 bg-stone-900 px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700"
          >
            Our Story <ArrowRight size={15} aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}

function LookbookBanner() {
  const navigate = useStore((s) => s.navigate);
  return (
    <section className="group relative h-[70vh] min-h-[480px] overflow-hidden">
      <img
        src="/images/campaign/campaign-2.jpg"
        alt="The SS25 lookbook"
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-stone-950/45" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-stone-200">
          Nine Looks. One Attitude.
        </p>
        <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight md:text-6xl">
          The SS25 Lookbook
        </h2>
        <p className="mt-5 max-w-lg text-[15px] text-stone-200">
          Shot over three days in Madrid — layering, light and the pieces that make getting dressed
          feel like getting it right.
        </p>
        <button
          onClick={() => navigate({ name: "lookbook" })}
          className="mt-9 border border-white/80 px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] transition hover:bg-white hover:text-stone-900"
        >
          View the Lookbook
        </button>
      </div>
    </section>
  );
}

function CollectionTiles() {
  const navigate = useStore((s) => s.navigate);
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-10">
      <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B08968]">
          Collections
        </p>
        <h2 className="font-display text-3xl leading-tight tracking-tight text-stone-900 md:text-[2.75rem]">
          Shop by Collection
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <button
          onClick={() => navigate({ name: "shop", tag: "new", title: "New Arrivals" })}
          className="group relative aspect-[4/3] overflow-hidden md:row-span-2 md:aspect-auto md:h-full"
        >
          <img
            src={COLLECTION_TILES[0].image}
            alt="New Arrivals"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-stone-950/5 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <p className="font-display text-2xl text-white md:text-3xl">New Arrivals</p>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80">
              Explore →
            </p>
          </div>
        </button>
        <button
          onClick={() => navigate({ name: "shop", tag: "bestsellers", title: "Bestsellers" })}
          className="group relative aspect-[4/3] overflow-hidden"
        >
          <img
            src={COLLECTION_TILES[1].image}
            alt="Bestsellers"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-stone-950/5 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <p className="font-display text-2xl text-white md:text-3xl">Bestsellers</p>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80">
              Explore →
            </p>
          </div>
        </button>
        <button
          onClick={() => navigate({ name: "shop", sale: true, title: "The Sale" })}
          className="group relative aspect-[4/3] overflow-hidden"
        >
          <img
            src={COLLECTION_TILES[2].image}
            alt="The Sale"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-stone-950/5 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <p className="font-display text-2xl text-white md:text-3xl">The Sale</p>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80">
              Explore →
            </p>
          </div>
          <span className="absolute right-5 top-5 bg-[#9A3B26] px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-white">
            UP TO −40%
          </span>
        </button>
      </div>
    </section>
  );
}

function QuoteSection() {
  return (
    <section className="relative h-[65vh] min-h-[440px] overflow-hidden bg-stone-900">
      <MediaBg src="/videos/editorial-2.mp4" poster="/images/editorial/editorial-5.jpg" imgClassName="opacity-55" />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <blockquote className="max-w-3xl text-center text-white">
          <QuoteIcon />
          <p className="font-display text-2xl leading-snug md:text-4xl">
            “Buy less, choose well, make it last. We built Atelier Noir on those five words.”
          </p>
          <footer className="mt-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-300">
            — Elena Marchetti, Founder
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

function QuoteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto mb-6 text-[#E3C9A8]"
      aria-hidden
    >
      <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
      <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
    </svg>
  );
}

function Testimonials() {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(TESTIMONIALS.length / PAGE_COUNT);
  const items = TESTIMONIALS.slice(page * PAGE_COUNT, page * PAGE_COUNT + PAGE_COUNT);
  return (
    <section className="border-y border-stone-100 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-10">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B08968]">
            Kind Words
          </p>
          <h2 className="font-display text-3xl leading-tight tracking-tight text-stone-900 md:text-[2.75rem]">
            From Our Community
          </h2>
        </div>
        <div className="relative">
          <div className="grid gap-6 md:grid-cols-3">
            {items.map((t) => (
              <figure key={t.name} className="border border-stone-200 bg-white p-8">
                <StarRating rating={t.rating} />
                <blockquote className="mt-4 text-[15px] leading-relaxed text-stone-700">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-6 border-t border-stone-100 pt-4 text-sm">
                  <span className="font-semibold text-stone-900">{t.name}</span>
                  <span className="ml-2 text-stone-400">{t.location}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => (p - 1 + pageCount) % pageCount)}
              aria-label="Previous testimonials"
              className="flex h-10 w-10 items-center justify-center border border-stone-300 transition hover:border-stone-900"
            >
              <ArrowRight size={16} className="rotate-180" aria-hidden />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  aria-label={`Testimonials page ${i + 1}`}
                  className={`h-1.5 w-6 transition ${i === page ? "bg-stone-900" : "bg-stone-300"}`}
                />
              ))}
            </div>
            <button
              onClick={() => setPage((p) => (p + 1) % pageCount)}
              aria-label="Next testimonials"
              className="flex h-10 w-10 items-center justify-center border border-stone-300 transition hover:border-stone-900"
            >
              <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function WornByYou() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-10">
      <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B08968]">
          @ateliernoir
        </p>
        <h2 className="font-display text-3xl leading-tight tracking-tight text-stone-900 md:text-[2.75rem]">
          Worn by You
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-stone-500">
          Tag @ateliernoir to be featured — the best looks we see every week come from you.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {INSTAGRAM_IMAGES.map((img, i) => (
          <button
            key={img}
            onClick={() => window.open("https://instagram.com", "_blank")}
            aria-label={`Instagram post ${i + 1}`}
            className="group relative aspect-square overflow-hidden bg-stone-100"
          >
            <img
              src={img}
              alt={`Community look ${i + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-stone-950/0 opacity-0 transition group-hover:bg-stone-950/30 group-hover:opacity-100">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white" aria-hidden>
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function FabricFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ending, setEnding] = useState(false);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (!v.duration) return;
      const left = v.duration - v.currentTime;
      setEnding(left <= 3 && left > 0.05);
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, []);
  return (
    <section
      aria-label="Fabric detail film"
      className="relative h-[50vh] min-h-[380px] w-full overflow-hidden bg-stone-400"
    >
      <video
        ref={videoRef}
        src="/videos/fabric-detail.mp4"
        poster="/images/fabric/fabric-4.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden={!ending}
        className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-stone-950/30 transition-opacity duration-1000 ${
          ending ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="font-display text-4xl tracking-[0.4em] text-white md:text-6xl">ATELIER</p>
      </div>
    </section>
  );
}

function PressBar() {
  return (
    <section className="border-t border-stone-100">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-14 gap-y-4 px-6 py-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
          As seen in
        </p>
        {PRESS_NAMES.map((n) => (
          <span key={n} className="font-display text-lg tracking-[0.2em] text-stone-400">
            {n}
          </span>
        ))}
      </div>
    </section>
  );
}
