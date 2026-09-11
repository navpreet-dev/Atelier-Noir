"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Quote,
  Volume2,
  VolumeX,
} from "lucide-react";
import { MediaVideo } from "@/components/site/media-video";
import { ProductCard, type Product } from "@/components/site/product-card";
import { StarRating } from "@/components/site/star-rating";
import { COLLECTION_TILES, INSTAGRAM_IMAGES, PRESS_NAMES, TESTIMONIALS } from "@/lib/site-data";
import { useStore } from "@/lib/store";

const PAGE_COUNT = 3;

/* Section header — matches the original's shared intro header component */
function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  dark?: boolean;
}) {
  return (
    <div
      className={`${
        align === "center" ? "text-center mx-auto" : "text-left"
      } max-w-2xl mb-10 md:mb-14`}
    >
      {eyebrow && (
        <p
          className={`text-[11px] font-semibold tracking-[0.3em] uppercase mb-3 ${
            dark ? "text-stone-400" : "text-[#B08968]"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-display text-3xl md:text-[2.75rem] leading-tight tracking-tight ${
          dark ? "text-white" : "text-stone-900"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-sm md:text-[15px] leading-relaxed ${
            dark ? "text-stone-400" : "text-stone-500"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function HomeView() {
  return (
    <>
      <Hero />
      <CategoryCards />
      <NewArrivals />
      <CampaignFilm />
      <CraftSection />
      <Bestsellers />
      <LookbookBanner />
      <CollectionTiles />
      <QuoteSection />
      <Testimonials />
      <WornByYou />
      <PressBar />
      <FabricFilm />
    </>
  );
}

function Hero() {
  const navigate = useStore((s) => s.navigate);
  return (
    <section className="relative flex min-h-[calc(88vh+8px)] items-center justify-center overflow-hidden bg-stone-900 pb-[8px] text-white">
      <MediaVideo
        src="/videos/hero.mp4"
        poster="/images/editorial/editorial-8.jpg"
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        coverClassName="h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950/50 via-stone-950/20 to-stone-950/60" />
      <div className="relative z-10 max-w-3xl px-6 text-center">
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
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
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

function CategoryCards() {
  const navigate = useStore((s) => s.navigate);
  const cards = [
    { title: "Women", image: "/images/editorial/editorial-3.jpg", route: { name: "shop", gender: "women", title: "Women" } as const },
    { title: "Men", image: "/images/blazers/blazers-2.jpg", route: { name: "shop", gender: "men", title: "Men" } as const },
    { title: "Accessories", image: "/images/bags/bags-3.jpg", route: { name: "shop", gender: "all", category: "bags,shoes,accessories", title: "Accessories" } as const },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pt-[74px] pb-20 md:px-6 lg:px-10">
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
                Shop Now <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function NewArrivals() {
  const navigate = useStore((s) => s.navigate);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let live = true;
    fetch("/api/products?new=true&sort=newest&limit=8")
      .then((r) => r.json())
      .then((d) => {
        if (live) setProducts(d.products ?? []);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6 lg:px-10">
      <div className="mb-10 flex items-end justify-between">
        <SectionHeader
          align="left"
          eyebrow="Just Landed"
          title="New Arrivals"
          subtitle="The first light of SS25 — small runs, quiet details, honest fabrics."
        />
        <button
          onClick={() => navigate({ name: "shop", tag: "new", title: "New Arrivals" })}
          className="mb-10 hidden shrink-0 items-center gap-2 border-b border-stone-900 pb-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900 hover:text-stone-500 md:flex"
        >
          View All <ArrowRight size={14} />
        </button>
      </div>
      {products.length > 0 ? (
        <div className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 lg:grid-cols-4">
          {products.slice(0, 8).map((p, i) => (
            <div key={p.id} className="w-64 shrink-0 snap-start md:w-auto">
              <ProductCard product={p} eager={i < 4} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] animate-pulse bg-stone-100" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CampaignFilm() {
  const navigate = useStore((s) => s.navigate);
  const [unmuted, setUnmuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6 lg:px-10">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          align="left"
          eyebrow="The Campaign Film"
          title="Worn in Motion"
          subtitle="Sixteen seconds of SS25 — shot in Madrid, cut to nothing but the clothes."
        />
        <button
          onClick={() => navigate({ name: "shop", gender: "women", title: "Women" })}
          className="mb-10 hidden shrink-0 items-center gap-2 border-b border-stone-900 pb-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900 hover:text-stone-500 md:flex"
        >
          Shop the Film <ArrowRight size={14} />
        </button>
      </div>
      <div className="group relative -mx-4 h-[calc(100svh-4rem)] overflow-hidden bg-stone-950 md:mx-0 md:aspect-video md:h-auto md:border md:border-stone-200">
        <MediaVideo
          src="/videos/film-ss25.mp4"
          poster="/images/film-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover"
          coverClassName="h-full w-full object-cover"
          onVideoRef={(v) => (videoRef.current = v)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/55 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-6 max-w-[70%]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/90">
            Atelier Noir — SS25
          </p>
          <p className="mt-1.5 font-display text-xl text-white md:text-2xl">“Second Nature”</p>
        </div>
        <button
          onClick={() => {
            const v = videoRef.current;
            if (v) {
              v.muted = unmuted;
              setUnmuted(!unmuted);
              if (unmuted) v.play().catch(() => {});
            }
          }}
          aria-label={unmuted ? "Mute film" : "Unmute film"}
          className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center border border-white/50 text-white backdrop-blur-sm transition hover:bg-white hover:text-stone-900"
        >
          {unmuted ? <Volume2 size={17} /> : <VolumeX size={17} />}
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
          <MediaVideo
            src="/videos/editorial-1.mp4"
            poster="/images/boutique/boutique-2.jpg"
            className="absolute inset-0 h-full w-full object-cover"
            coverClassName="h-full w-full object-cover"
          />
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
            Our Story <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

function Bestsellers() {
  const navigate = useStore((s) => s.navigate);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let live = true;
    fetch("/api/products?bestseller=true&sort=popular&limit=4")
      .then((r) => r.json())
      .then((d) => {
        if (live) setProducts(d.products ?? []);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-10">
      <SectionHeader
        eyebrow="Community Favourites"
        title="The Bestsellers"
        subtitle="The pieces our customers re-order, gift, and write poems about."
      />
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {(products.length
          ? products
          : Array.from({ length: 4 }).map(() => null)
        ).map((p, i) =>
          p ? (
            <ProductCard key={p.id} product={p} />
          ) : (
            <div key={i} className="aspect-[3/4] animate-pulse bg-stone-100" />
          )
        )}
      </div>
      <div className="mt-12 text-center">
        <button
          onClick={() => navigate({ name: "shop", tag: "bestsellers", title: "Bestsellers" })}
          className="border border-stone-900 px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900 transition hover:bg-stone-900 hover:text-white"
        >
          Shop All Bestsellers
        </button>
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
  const spanClass: Record<string, string> = {
    tall: "md:row-span-2 md:aspect-auto",
    wide: "md:col-span-2",
    normal: "",
  };
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-10">
      <SectionHeader eyebrow="Curated For You" title="Shop by Collection" />
      <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2 md:gap-6">
        {COLLECTION_TILES.map((t) => (
          <button
            key={t.title}
            onClick={() => navigate({ name: "shop", tag: t.tag, title: t.title })}
            className={`group relative aspect-[4/3] overflow-hidden ${spanClass[t.span] ?? ""}`}
          >
            <img
              src={t.image}
              alt={t.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-stone-950/5 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <p className="font-display text-2xl text-white md:text-3xl">{t.title}</p>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80">
                Explore →
              </p>
            </div>
            {t.tag === "sale" && (
              <span className="absolute right-5 top-5 bg-[#9A3B26] px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-white">
                UP TO −40%
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function QuoteSection() {
  return (
    <section className="relative h-[65vh] min-h-[440px] overflow-hidden bg-stone-900">
      <MediaVideo
        src="/videos/editorial-2.mp4"
        poster="/images/editorial/editorial-5.jpg"
        className="absolute inset-0 h-full w-full object-cover opacity-55"
        coverClassName="h-full w-full object-cover opacity-55"
      />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <blockquote className="max-w-3xl text-center text-white">
          <Quote size={28} className="mx-auto mb-6 text-[#E3C9A8]" />
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

function Testimonials() {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(TESTIMONIALS.length / PAGE_COUNT);
  const items = TESTIMONIALS.slice(page * PAGE_COUNT, page * PAGE_COUNT + PAGE_COUNT);
  return (
    <section className="border-y border-stone-100 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-10">
        <SectionHeader eyebrow="Kind Words" title="From Our Community" />
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
              <ChevronLeft size={16} />
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
              <ChevronRight size={16} />
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
      <SectionHeader
        eyebrow="@ateliernoir"
        title="Worn by You"
        subtitle="Tag @ateliernoir to be featured — the best looks we see every week come from you."
      />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {INSTAGRAM_IMAGES.map((img, i) => (
          <button
            key={`${img}-${i}`}
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
              <Instagram size={22} className="text-white" />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function FabricFilm() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
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
      <MediaVideo
        src="/videos/fabric-detail.mp4"
        poster="/images/fabric/fabric-4.jpg"
        className="absolute inset-0 h-full w-full object-cover"
        coverClassName="h-full w-full object-cover"
        onVideoRef={(v) => (videoRef.current = v)}
        alt="Close-up film of a tailored jacket being crafted in the workshop"
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
