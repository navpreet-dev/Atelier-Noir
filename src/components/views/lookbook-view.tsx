"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { LOOKBOOK_LOOKS, type Look } from "@/lib/site-data";

/* Shared strings from the original build. */
const CX = "text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400";
const CF = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-10";

/* Per-look aspect ratios from the original build. */
const ASPECTS = [
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-[1/1]",
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-[1/1]",
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-[4/5]",
];

function LookCard({ look, aspect, eager = false }: { look: Look; aspect: string; eager?: boolean }) {
  const navigate = useStore((s) => s.navigate);
  return (
    <article className="group relative mb-3 break-inside-avoid overflow-hidden bg-stone-100 md:mb-4">
      <div className={`relative overflow-hidden ${aspect}`}>
        <img
          src={look.image}
          alt={`Look ${look.id} — ${look.title}`}
          loading={eager ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-900 backdrop-blur">
          {look.season}
        </span>
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-stone-900/75 via-stone-900/15 to-transparent p-5 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
          <h3 className="font-display text-xl tracking-tight text-white md:text-2xl">
            {look.title}
          </h3>
          <p className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-white/75">
            {look.pieces.join(" · ")}
          </p>
          <Button
            onClick={() => navigate({ name: "shop", title: "The Lookbook" })}
            className="mt-4 h-10 w-fit rounded-none bg-white px-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-900 transition-colors hover:bg-white hover:text-[#B08968]"
            aria-label={`Shop the look — ${look.title}`}
          >
            Shop the Look
            <ArrowUpRight size={14} className="ml-1" aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );
}

export function LookbookView() {
  const navigate = useStore((s) => s.navigate);
  const first = LOOKBOOK_LOOKS.slice(0, 3);
  const rest = LOOKBOOK_LOOKS.slice(3);

  return (
    <div>
      {/* Intro header */}
      <header className={`${CF} pb-12 pt-14 text-center md:pb-16 md:pt-20`}>
        <p className={`${CX} text-[#B08968]`}>Editorial SS25</p>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl leading-tight tracking-tight text-stone-900 md:text-6xl">
          The Lookbook — SS25
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-stone-500 md:text-[15px]">
          Nine looks shot between Madrid and the coast of Puglia. Warm neutrals, washed silk and
          denim worn to softness.
        </p>
      </header>

      {/* First masonry grid */}
      <section className={`${CF} pb-4`}>
        <div className="columns-1 gap-3 sm:columns-2 md:gap-4 lg:columns-3">
          {first.map((look, i) => (
            <LookCard key={look.id} look={look} aspect={ASPECTS[i]} eager={i === 0} />
          ))}
        </div>
      </section>

      {/* Campaign film banner */}
      <section className="relative my-14 h-[55vh] min-h-[420px] overflow-hidden md:my-20">
        <video
          src="/videos/editorial-1.mp4"
          poster="/images/editorial/editorial-4.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[2000ms]"
        />
        <div className="absolute inset-0 bg-stone-900/40" aria-hidden />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">
            In Motion — The Campaign Film
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight tracking-tight md:text-5xl">
            SS25: A Study in Softness
          </h2>
          <Button
            onClick={() => navigate({ name: "shop", title: "SS25 Collection" })}
            className="mt-8 h-12 rounded-none bg-white px-10 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900 transition-colors hover:bg-white hover:text-[#B08968]"
          >
            Shop the Collection
          </Button>
        </div>
      </section>

      {/* Second masonry grid */}
      <section className={`${CF} pb-20 md:pb-28`}>
        <div className="columns-1 gap-3 sm:columns-2 md:gap-4 lg:columns-3">
          {rest.map((look, i) => (
            <LookCard key={look.id} look={look} aspect={ASPECTS[i + 3]} />
          ))}
        </div>
      </section>
    </div>
  );
}
