"use client";

import { ArrowRight, HeartHandshake, Leaf, Recycle, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaVideo } from "@/components/site/media-video";
import { useStore } from "@/lib/store";

/* Shared strings from the original build. */
const CX = "text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400";
const CF = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-10";
const CG = "py-16 md:py-24";

const VALUES = [
  {
    icon: Scissors,
    title: "Cut & Construction",
    text: "Every prototype is cut by hand in our Florence atelier and worn for two weeks before it earns a place in the collection.",
  },
  {
    icon: Leaf,
    title: "Responsible Materials",
    text: "92% GOTS-certified organic cotton, RWS wool and deadstock silk — with a hard line against virgin polyester.",
  },
  {
    icon: HeartHandshake,
    title: "Fair Partnerships",
    text: "Family-run workshops across Portugal, Italy and India, audited every year for wages, safety and craft.",
  },
  {
    icon: Recycle,
    title: "Repair, Not Replace",
    text: "A 10-year repair guarantee on every garment. Send it back and we will mend, reline or re-cut it — free.",
  },
];

const STATS = [
  { value: "26", label: "Pieces in the SS25 collection" },
  { value: "3", label: "Countries of manufacture" },
  { value: "10-year", label: "Repair guarantee on every piece" },
  { value: "92%", label: "Certified organic cotton" },
];

const GALLERY_IMAGES = [
  "/images/boutique/boutique-3.jpg",
  "/images/campaign/campaign-2.jpg",
  "/images/campaign/campaign-9.jpg",
  "/images/campaign/campaign-5.jpg",
];

/* Original shared section header (`nT`) — exact class strings. */
function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  dark = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  dark?: boolean;
}) {
  return (
    <div
      className={`${align === "center" ? "text-center mx-auto" : "text-left"} max-w-2xl mb-10 md:mb-14`}
    >
      {eyebrow ? (
        <p
          className={`text-[11px] font-semibold tracking-[0.3em] uppercase mb-3 ${
            dark ? "text-stone-400" : "text-[#B08968]"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`font-display text-3xl md:text-[2.75rem] leading-tight tracking-tight ${
          dark ? "text-white" : "text-stone-900"
        }`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-4 text-sm md:text-[15px] leading-relaxed ${
            dark ? "text-stone-400" : "text-stone-500"
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function AboutView() {
  const navigate = useStore((s) => s.navigate);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex h-[72vh] min-h-[520px] items-center justify-center overflow-hidden">
        <img
          src="/images/campaign/campaign-1.jpg"
          alt="Atelier Noir SS25 campaign — two figures in warm neutral tailoring"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/45" aria-hidden />
        <div className="relative z-10 max-w-3xl px-6 text-center text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">
            The House — Est. 2014
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight md:text-6xl">
            Crafted to Outlive Trends
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/85 md:text-[15px]">
            Atelier Noir is a study in restraint: few things, made slowly, from honest materials —
            designed in Paris, cut in Florence, worn everywhere.
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className={CG}>
        <div className={`${CF} grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
          <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
            <img
              src="/images/boutique/boutique-2.jpg"
              alt="Inside the Atelier Noir flagship — rails of neutral garments and stone interiors"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div>
            <SectionHeader
              align="left"
              eyebrow="Our Philosophy"
              title="Fewer, better things."
              subtitle="We believe a wardrobe should be edited, not accumulated — a small cast of pieces that fit, flatter and endure."
            />
            <div className="-mt-4 space-y-4 text-[15px] leading-relaxed text-stone-600 md:-mt-6">
              <p>
                Since 2014 we have produced in small runs of rarely more than 300 pieces, working
                with pattern cutters who still chalk every line by hand. Nothing reaches production
                until someone on the team has lived in it for a fortnight — washed it, sat down in
                it, sweated through a summer afternoon.
              </p>
              <p>
                We spend where the body meets the garment, refuse shortcuts in the supply chain,
                and price honestly. The result is clothing with a quiet confidence: no logos, no
                seasons of regret — just pieces that get better every year you own them.
              </p>
            </div>
            <p className={`${CX} mt-8`}>— Elena Marchetti, Founder &amp; Creative Director</p>
          </div>
        </div>
      </section>

      {/* Atelier film */}
      <section
        aria-label="Atelier film"
        className="relative h-[50vh] min-h-[380px] w-full overflow-hidden bg-stone-400"
      >
        <MediaVideo
          src="/videos/atelier-film.mp4"
          poster="/images/about-film-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover"
          coverClassName="h-full w-full object-cover"
          alt="Atelier Noir studio film — a model in the leather jacket collection"
        />
      </section>

      {/* Values */}
      <section className="border-t border-stone-200 bg-stone-50">
        <div className={`${CF} ${CG}`}>
          <SectionHeader
            eyebrow="What Guides Us"
            title="Values stitched into every seam"
            subtitle="Four commitments that shape each decision, from the first sketch to the last stitch."
          />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="text-center sm:text-left">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-900 sm:mx-0">
                  <Icon size={20} strokeWidth={1.5} aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-lg tracking-tight text-stone-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-stone-900 py-16 text-white md:py-20">
        <div className={`${CF} grid grid-cols-2 gap-y-12 text-center lg:grid-cols-4`}>
          {STATS.map((stat) => (
            <div key={stat.label} className="px-4">
              <p className="font-display text-4xl tracking-tight text-[#B08968] md:text-5xl">
                {stat.value}
              </p>
              <p className={`${CX} mt-3 text-white/60`}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Atelier gallery */}
      <section className={CG}>
        <div className={CF}>
          <SectionHeader
            eyebrow="The Atelier"
            title="Where every piece begins"
            subtitle="Chalk dust, steady machines and four decades of muscle memory — a look inside our Florence workshop and the campaigns it produces."
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
            <div className="group relative col-span-2 overflow-hidden bg-stone-100 md:col-span-2 md:row-span-2">
              <img
                src="/images/boutique/boutique-1.jpg"
                alt="The Atelier Noir workshop — pattern cutting tables in Florence"
                loading="lazy"
                className="h-full w-full object-cover aspect-[4/3] md:aspect-auto transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
            {GALLERY_IMAGES.map((src, i) => (
              <div key={src} className="group relative col-span-1 overflow-hidden bg-stone-100">
                <img
                  src={src}
                  alt={`Atelier Noir atelier and campaign imagery ${i + 2}`}
                  loading="lazy"
                  className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="bg-stone-50">
        <div className={`${CF} ${CG} text-center`}>
          <span className="font-display text-6xl leading-none text-[#B08968]" aria-hidden>
            “
          </span>
          <blockquote className="mx-auto -mt-4 max-w-4xl font-display text-2xl italic leading-snug tracking-tight text-stone-800 md:text-4xl">
            We make few things, slowly, so that they last long enough to become part of you.
          </blockquote>
          <p className={`${CX} mt-8`}>The Atelier Noir promise</p>
        </div>
      </section>

      {/* CTA */}
      <section className={CG}>
        <div className={`${CF} text-center`}>
          <SectionHeader
            eyebrow="The Collection"
            title="Ready when you are"
            subtitle="Twenty-six pieces for the season ahead — each one cut, checked and signed off by hand."
          />
          <Button
            onClick={() => navigate({ name: "shop", title: "The Collection" })}
            className="h-12 rounded-none bg-stone-900 px-10 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-stone-700"
          >
            Shop the Collection
          </Button>
          <div className="mt-6">
            <button
              onClick={() => navigate({ name: "lookbook" })}
              className="group/link inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900 transition-colors hover:text-[#B08968]"
            >
              Or browse the Lookbook
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover/link:translate-x-1"
                aria-hidden
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
