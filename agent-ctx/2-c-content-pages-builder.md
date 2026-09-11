# Task 2-c — content-pages-builder

## Scope
Seven view components for the client-routed Atelier Noir rebuild:
`src/components/views/{about,contact,faq,lookbook,journal,journal-post,search}-view.tsx`

## Key decisions
- Ground truth = DOM dumps (/tmp/shots/*.clean.html) + original site JS (/tmp/site/f0339a7586771414.js). Where the task spec's class strings differed from dumps/JS, the dumps/original were followed (per "copy exact classes where they differ"), e.g.:
  - Page intro headers follow the original `cy` pattern: `${cf} pb-12 pt-14 text-center md:pb-16 md:pt-20`, gold eyebrow `text-[10px] tracking-[0.25em]`, h1 `text-4xl md:text-6xl max-w-3xl`, subtitle `max-w-xl text-sm md:text-[15px]`.
  - About hero = image campaign-1.jpg + bg-stone-900/45 overlay ("The House — Est. 2014"); film band uses atelier-film.mp4 at h-[50vh] min-h-[380px]; stats band is dark (bg-stone-900, gold numerals); gallery is md:grid-cols-5 with 2x2 lead tile; quote uses a serif " character.
  - FAQ uses shadcn Tabs (centered pill TabsList) + single-collapsible Accordion; "Still need help?" card has solid stone border + CircleQuestionMark in a dark circle + primary Contact Us button.
  - Search empty state includes popular-category pills (Dresses/Coats/Knitwear/Bags) and "Browse Everything" CTA.
- Reusable pieces exported from journal-view.tsx (PostMeta, ReadStoryLink, JournalCard) and reused by journal-post-view.tsx (no new shared files created).
- Shared class constants replicated locally per file (CX/CF/CG) to avoid touching other files; SectionHeader from components/site/section-header.tsx used as the original nT.

## Verification
- `bunx eslint <7 files>` → clean.
- `bunx tsc --noEmit` → zero errors in the seven files (remaining errors belong to other agents' pending views / pre-existing files).

## Handoff notes
- page.tsx compile is blocked only by views owned by other agents (shop/product/cart/checkout/wishlist/account).
- Pre-existing bug outside my scope: home-view.tsx imports "./product-card" but product-card.tsx lives in "@/components/site/" (and "./star-rating" likewise).
