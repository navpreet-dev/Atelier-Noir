"use client";

import { useEffect, useState } from "react";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard, type Product } from "@/components/site/product-card";
import { useStore, type Route } from "@/lib/store";

/* Shared strings from the original build. */
const CX = "text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400";
const CF = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-10";

const POPULAR_CATEGORIES: { label: string; route: Route }[] = [
  { label: "Dresses", route: { name: "shop", gender: "women", category: "dresses", title: "Dresses" } },
  {
    label: "Coats",
    route: { name: "shop", gender: "women", category: "coats", title: "Coats & Outerwear" },
  },
  { label: "Knitwear", route: { name: "shop", gender: "women", category: "knitwear", title: "Knitwear" } },
  { label: "Bags", route: { name: "shop", category: "bags", title: "Bags" } },
];

type SearchResult = { q: string; products: Product[] };

export function SearchView({ q }: { q?: string }) {
  const navigate = useStore((s) => s.navigate);
  const query = q ?? "";
  const [result, setResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/products?search=${encodeURIComponent(query)}&limit=40`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled)
          setResult({ q: query, products: Array.isArray(json.products) ? json.products : [] });
      })
      .catch(() => {
        if (!cancelled) setResult({ q: query, products: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const loading = result === null || result.q !== query;
  const products = loading ? [] : result.products;
  const hasQuery = query.trim().length > 0;
  const count = products.length;

  return (
    <div>
      {/* Intro header */}
      <header className={`${CF} pb-10 pt-14 text-center md:pb-12 md:pt-20`}>
        <p className={`${CX} text-[#B08968]`}>Search</p>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-3xl leading-tight tracking-tight text-stone-900 md:text-5xl">
          Search results for “{query}”
        </h1>
        {!loading && (
          <p className={`${CX} mt-5`}>
            {count} {count === 1 ? "piece" : "pieces"} found
          </p>
        )}
      </header>

      <section className={`${CF} pb-20 md:pb-28`}>
        {loading && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <Skeleton className="aspect-[3/4] w-full rounded-none bg-stone-200" />
                <Skeleton className="mt-4 h-3 w-1/3 rounded-none bg-stone-200" />
                <Skeleton className="mt-2.5 h-4 w-3/4 rounded-none bg-stone-200" />
                <Skeleton className="mt-2 h-4 w-1/4 rounded-none bg-stone-200" />
              </div>
            ))}
          </div>
        )}

        {!loading && count > 0 && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} eager={i < 4} />
            ))}
          </div>
        )}

        {!loading && count === 0 && (
          <div className="mx-auto max-w-xl py-10 text-center md:py-16">
            <SearchX size={44} strokeWidth={1.25} className="mx-auto text-stone-300" aria-hidden />
            <h2 className="mt-6 font-display text-2xl tracking-tight text-stone-900 md:text-3xl">
              {hasQuery ? `No pieces match “${query}”` : "Type something to search"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-500">
              {hasQuery
                ? "Check the spelling or try a broader term — or explore one of our most-loved categories below."
                : "Search by product, category or fabric — try “trench”, “silk” or “denim”."}
            </p>
            <p className={`${CX} mt-10`}>Popular categories</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {POPULAR_CATEGORIES.map((cat) => (
                <Button
                  key={cat.label}
                  variant="outline"
                  onClick={() => navigate(cat.route)}
                  className="h-10 rounded-full border-stone-300 bg-white px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-700 transition-colors hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
            <div className="mt-12">
              <Button
                onClick={() => navigate({ name: "shop", title: "The Collection" })}
                className="h-12 rounded-none bg-stone-900 px-10 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-stone-700"
              >
                Browse Everything
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
