"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { JOURNAL_POSTS } from "@/lib/site-data";
import { JournalCard, PostMeta } from "./journal-view";

/* Shared strings from the original build. */
const CX = "text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400";
const CF = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-10";

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

export function JournalPostView({ slug }: { slug: string }) {
  const navigate = useStore((s) => s.navigate);
  const post = JOURNAL_POSTS.find((p) => p.slug === slug);

  const backButton = (
    <button
      onClick={() => navigate({ name: "journal" })}
      className="group/back inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-500 transition-colors hover:text-stone-900"
      aria-label="Back to the Journal"
    >
      <ArrowLeft
        size={14}
        className="transition-transform duration-300 group-hover/back:-translate-x-1"
        aria-hidden
      />
      Back to Journal
    </button>
  );

  if (!post) {
    return (
      <section
        className={`${CF} flex min-h-[60vh] flex-col items-center justify-center py-24 text-center`}
      >
        <p className={`${CX} text-[#B08968]`}>404</p>
        <h1 className="mt-4 font-display text-4xl tracking-tight text-stone-900 md:text-5xl">
          Story not found
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-500">
          The story you&rsquo;re looking for has moved or no longer exists. The rest of the Journal
          is still worth a read.
        </p>
        <div className="mt-8">{backButton}</div>
      </section>
    );
  }

  const more = JOURNAL_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <article className="pb-20 md:pb-28">
      {/* Header */}
      <header className={`${CF} pt-10 md:pt-14`}>
        {backButton}
        <div className="mx-auto mt-10 max-w-3xl text-center">
          <PostMeta post={post} className="justify-center" />
          <h1 className="mt-5 font-display text-4xl leading-tight tracking-tight text-stone-900 md:text-6xl">
            {post.title}
          </h1>
        </div>
      </header>

      {/* Hero image */}
      <div className={`${CF} mt-10 md:mt-14`}>
        <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 md:aspect-[21/10]">
          <img
            src={post.image}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-2xl px-4 pt-12 sm:px-6 md:pt-16">
        <p className="text-lg leading-loose text-stone-700 first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-[#B08968]">
          {post.content[0]}
        </p>
        {post.quote ? (
          <blockquote className="my-10 border-l-2 border-[#B08968] pl-6 font-display text-xl italic leading-snug tracking-tight text-stone-800 md:text-2xl">
            {post.quote}
          </blockquote>
        ) : null}
        {post.content.slice(1).map((paragraph) => (
          <p
            key={paragraph.slice(0, 32)}
            className="mt-6 text-[15px] leading-loose text-stone-600"
          >
            {paragraph}
          </p>
        ))}
        <div className="mt-12 flex items-center gap-4">
          <span className="h-px flex-1 bg-stone-200" aria-hidden />
          <span className="font-display text-sm text-[#B08968]" aria-hidden>
            • • •
          </span>
          <span className="h-px flex-1 bg-stone-200" aria-hidden />
        </div>
        <p className={`${CX} mt-6 text-center`}>Written by the Atelier Noir editorial team</p>
      </div>

      {/* Keep reading */}
      {more.length > 0 ? (
        <section className={`${CF} mt-20 border-t border-stone-200 pt-16 md:mt-28`}>
          <SectionHeader align="left" eyebrow="Keep Reading" title="More Stories" />
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <JournalCard key={p.slug} post={p} />
            ))}
          </div>
          <div className="mt-14 text-center">
            <Button
              onClick={() => navigate({ name: "journal" })}
              className="h-12 rounded-none bg-stone-900 px-10 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-stone-700"
            >
              Back to the Journal
            </Button>
          </div>
        </section>
      ) : null}
    </article>
  );
}
