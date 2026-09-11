"use client";

import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { JOURNAL_POSTS, type JournalPost } from "@/lib/site-data";

/* Shared strings from the original build. */
const CX = "text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400";
const CF = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-10";

/** Category · date · read time meta line (original `cw`). */
export function PostMeta({ post, className = "" }: { post: JournalPost; className?: string }) {
  return (
    <p className={`${CX} ${className}`}>
      <span className="text-[#B08968]">{post.category}</span>
      <span className="mx-2 text-stone-300">·</span>
      {post.date}
      <span className="mx-2 text-stone-300">·</span>
      {post.readTime}
    </p>
  );
}

/** "Read Story" arrow link (original `cv`). */
export function ReadStoryLink({
  onClick,
  className = "",
  children = "Read Story",
}: {
  onClick: () => void;
  className?: string;
  children?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group/link inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900 transition-colors hover:text-[#B08968] ${className}`}
    >
      {children}
      <ArrowRight
        size={14}
        className="transition-transform duration-300 group-hover/link:translate-x-1"
        aria-hidden
      />
    </button>
  );
}

/** Journal grid card (original `cj`). */
export function JournalCard({ post, eager = false }: { post: JournalPost; eager?: boolean }) {
  const navigate = useStore((s) => s.navigate);
  const open = () => navigate({ name: "journal-post", slug: post.slug });
  return (
    <article className="group">
      <div
        className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-stone-100"
        onClick={open}
        role="link"
        tabIndex={0}
        aria-label={post.title}
        onKeyDown={(e) => {
          if (e.key === "Enter") open();
        }}
      >
        <img
          src={post.image}
          alt={post.title}
          loading={eager ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <PostMeta post={post} className="mt-4" />
      <h3
        onClick={open}
        className="mt-2.5 cursor-pointer font-display text-xl leading-snug tracking-tight text-stone-900 transition-colors hover:text-[#B08968]"
      >
        {post.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-500">{post.excerpt}</p>
      <ReadStoryLink onClick={open} className="mt-4" />
    </article>
  );
}

export function JournalView() {
  const navigate = useStore((s) => s.navigate);
  const [featured, ...rest] = JOURNAL_POSTS;
  const openFeatured = () => navigate({ name: "journal-post", slug: featured.slug });

  return (
    <div>
      {/* Intro header */}
      <header className={`${CF} pb-12 pt-14 text-center md:pb-16 md:pt-20`}>
        <p className={`${CX} text-[#B08968]`}>The Journal</p>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl leading-tight tracking-tight text-stone-900 md:text-6xl">
          Stories in fabric
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-stone-500 md:text-[15px]">
          Style guides, studio visits and honest notes on materials — written by the people who
          make the clothes.
        </p>
      </header>

      <section className={`${CF} pb-20 md:pb-28`}>
        {/* Featured story */}
        <article className="group grid overflow-hidden border border-stone-200 lg:grid-cols-2">
          <div
            className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-stone-100 lg:aspect-auto lg:min-h-[480px]"
            onClick={openFeatured}
            role="link"
            tabIndex={0}
            aria-label={featured.title}
            onKeyDown={(e) => {
              if (e.key === "Enter") openFeatured();
            }}
          >
            <img
              src={featured.image}
              alt={featured.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
            <p className={`${CX} text-[#B08968]`}>Featured Story</p>
            <PostMeta post={featured} className="mt-3" />
            <h2
              onClick={openFeatured}
              className="mt-4 cursor-pointer font-display text-3xl leading-tight tracking-tight text-stone-900 transition-colors hover:text-[#B08968] md:text-4xl"
            >
              {featured.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-stone-500 md:text-[15px]">
              {featured.excerpt}
            </p>
            <ReadStoryLink onClick={openFeatured} className="mt-8" />
          </div>
        </article>

        {/* Rest of the stories */}
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 md:mt-20">
          {rest.map((post) => (
            <JournalCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
