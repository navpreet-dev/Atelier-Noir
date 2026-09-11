"use client";

import { useEffect, useRef, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SEARCH_SUGGESTIONS } from "@/lib/site-data";
import { formatPrice, useStore, type Route } from "@/lib/store";
import { StarRating } from "./star-rating";

type SearchHit = {
  id: string;
  slug: string;
  name: string;
  gender: string;
  category: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  rating: number;
  reviewCount: number;
};

const SEARCH_LINKS: { img: string; label: string; route: Route }[] = [
  {
    img: "/images/editorial/editorial-5.jpg",
    label: "New Season",
    route: { name: "shop", tag: "new", title: "New Arrivals" },
  },
  {
    img: "/images/wcoats/wcoats-1.jpg",
    label: "Outerwear",
    route: { name: "shop", gender: "women", category: "coats", title: "Coats" },
  },
  {
    img: "/images/bags/bags-1.jpg",
    label: "Bags",
    route: { name: "shop", gender: "all", category: "bags", title: "Bags" },
  },
  {
    img: "/images/street/street-3.jpg",
    label: "The Sale",
    route: { name: "shop", sale: true, title: "The Sale" },
  },
];

export function SearchDialog() {
  const searchOpen = useStore((s) => s.searchOpen);
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const navigate = useStore((s) => s.navigate);
  const logClientActivity = useStore((s) => s.logClientActivity);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setQ("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=8`);
        const data = await res.json();
        setResults(data.products ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const submit = () => {
    if (!q.trim()) return;
    setSearchOpen(false);
    logClientActivity("searched", { q: q.trim() });
    navigate({ name: "search", q: q.trim() });
  };

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent
        className="top-0 max-h-[85vh] translate-y-0 gap-0 overflow-y-auto rounded-none border-0 bg-white p-0 sm:top-0 sm:max-w-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <div className="flex items-center gap-3 border-b border-stone-200 px-5 py-4">
          <SearchIcon size={20} className="shrink-0 text-stone-400" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Search the collection…"
            aria-label="Search products"
            className="h-10 flex-1 bg-transparent text-lg text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
          <button
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            className="text-stone-500 hover:text-stone-900"
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        <div className="px-5 py-5">
          {!q.trim() && (
            <div>
              <p className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-stone-400 uppercase">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {SEARCH_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQ(s)}
                    className="border border-stone-200 px-3.5 py-1.5 text-[13px] text-stone-600 transition hover:border-stone-900 hover:text-stone-900"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {SEARCH_LINKS.map((l) => (
                  <button
                    key={l.label}
                    onClick={() => {
                      setSearchOpen(false);
                      navigate(l.route);
                    }}
                    className="group text-left"
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-stone-100">
                      <img
                        src={l.img}
                        alt={l.label}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-stone-700 group-hover:underline">
                      {l.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {q.trim() && (
            <div>
              <p className="mb-4 text-[10px] font-semibold tracking-[0.3em] text-stone-400 uppercase">
                {loading
                  ? "Searching…"
                  : `${results.length} result${results.length === 1 ? "" : "s"}`}
              </p>
              {!loading && results.length === 0 && (
                <div className="py-10 text-center">
                  <p className="font-display text-xl text-stone-800">Nothing found for “{q}”</p>
                  <p className="mt-2 text-sm text-stone-500">
                    Try “coat”, “dress”, “denim” or “bag”.
                  </p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSearchOpen(false);
                      navigate({ name: "product", slug: r.slug });
                    }}
                    className="group flex gap-4 text-left"
                  >
                    <div className="h-24 w-20 shrink-0 overflow-hidden bg-stone-100">
                      <img
                        src={r.images[0]}
                        alt={r.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-900 group-hover:underline">
                        {r.name}
                      </p>
                      <p className="mt-0.5 text-xs uppercase tracking-wider text-stone-400">
                        {r.gender} · {r.category}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-900">
                          {formatPrice(r.price)}
                        </span>
                        {r.comparePrice && r.comparePrice > r.price && (
                          <span className="text-xs text-stone-400 line-through">
                            {formatPrice(r.comparePrice)}
                          </span>
                        )}
                      </div>
                      {r.reviewCount > 0 && (
                        <span className="mt-1 flex items-center gap-1 text-[11px] text-stone-400">
                          <StarRating rating={r.rating} size={10} /> ({r.reviewCount})
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {results.length > 0 && (
                <button
                  onClick={submit}
                  className="mt-5 w-full border border-stone-300 py-3 text-[11px] font-semibold tracking-[0.25em] uppercase text-stone-800 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                >
                  View all results for “{q}”
                </button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
