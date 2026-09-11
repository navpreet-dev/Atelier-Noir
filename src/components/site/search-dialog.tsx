"use client";

import { useEffect, useRef, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SEARCH_SHORTCUTS, SEARCH_SUGGESTIONS } from "@/lib/site-data";
import { useStore } from "@/lib/store";

export function SearchDialog() {
  const searchOpen = useStore((s) => s.searchOpen);
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const navigate = useStore((s) => s.navigate);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      const t = window.setTimeout(() => {
        setQ("");
        inputRef.current?.focus();
      }, 80);
      return () => window.clearTimeout(t);
    }
  }, [searchOpen]);

  const submit = (term: string) => {
    const query = term.trim();
    if (!query) return;
    navigate({ name: "search", q: query });
  };

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="rounded-none bg-white p-0 sm:max-w-xl [&>button]:hidden">
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <div className="flex items-center gap-3 border-b border-stone-200 px-5 py-4">
          <SearchIcon size={18} className="shrink-0 text-stone-400" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit(q);
            }}
            placeholder="Search products…"
            aria-label="Search products"
            className="h-10 w-full bg-transparent text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center text-stone-400 transition hover:text-stone-900"
            aria-label="Close search"
          >
            <X size={17} aria-hidden />
          </button>
        </div>
        <div className="px-5 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
            Popular Searches
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SEARCH_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => submit(s)}
                className="border border-stone-200 px-3 py-1.5 text-[13px] text-stone-600 transition hover:border-stone-900 hover:text-stone-900"
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
            Browse
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {SEARCH_SHORTCUTS.map((s) => (
              <button
                key={s.label}
                onClick={() =>
                  navigate(
                    s.tag === "THE SALE"
                      ? { name: "shop", sale: true, title: "The Sale" }
                      : s.tag === "NEW SEASON"
                        ? { name: "shop", tag: "new", title: "New Arrivals" }
                        : s.tag === "OUTERWEAR"
                          ? { name: "shop", gender: "women", category: "coats", title: "Outerwear" }
                          : { name: "shop", gender: "all", category: ["bags"], title: "Bags" }
                  )
                }
                className="group flex items-center justify-between border border-stone-200 px-4 py-3 text-left transition hover:border-stone-900"
              >
                <span className="text-sm text-stone-800">{s.label}</span>
                <span className="text-[9px] font-bold tracking-[0.2em] text-[#B08968]">
                  {s.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
