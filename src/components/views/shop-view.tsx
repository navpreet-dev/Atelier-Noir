"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductCard, type Product } from "@/components/site/product-card";
import { useStore, type Route } from "@/lib/store";
import {
  ACCESSORIES_CATEGORIES,
  MEN_CATEGORIES,
  WOMEN_CATEGORIES,
} from "@/lib/site-data";

type ShopRoute = Extract<Route, { name: "shop" }>;

const BASE_SIZES = ["XS", "S", "M", "L", "XL", "One Size"];

const WOMEN_SIZES = ["XS", "S", "M", "L", "XL", "26", "28", "30", "32", "34"];
const MEN_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
];

const PRICE_RANGES: { key: string; label: string; test: (price: number) => boolean }[] = [
  { key: "u100", label: "Under $100", test: (p) => p < 100 },
  { key: "100-200", label: "$100 — $200", test: (p) => p >= 100 && p < 200 },
  { key: "200-350", label: "$200 — $350", test: (p) => p >= 200 && p < 350 },
  { key: "350p", label: "$350+", test: (p) => p >= 350 },
];

const FALLBACK_COLOURS = [
  { name: "sand", hex: "#D9C7A7" },
  { name: "ink", hex: "#1C1C1C" },
  { name: "olive", hex: "#6B6B47" },
  { name: "mid indigo", hex: "#4C5870" },
  { name: "ivory", hex: "#F2EDE4" },
  { name: "stone", hex: "#A8A296" },
  { name: "sage", hex: "#9CAF88" },
  { name: "cream", hex: "#F5F1E8" },
  { name: "clay", hex: "#B1614A" },
  { name: "charcoal", hex: "#3F3F3C" },
  { name: "toffee", hex: "#9A7B4F" },
];

type CategoryOption = { key: string; label: string };

function buildCategoryOptions(route: ShopRoute): CategoryOption[] {
  if (route.gender === "men") {
    return [{ key: "", label: "All Men" }, ...MEN_CATEGORIES];
  }
  if (route.gender === "women") {
    return [{ key: "", label: "All Women" }, ...WOMEN_CATEGORIES];
  }
  const list: CategoryOption[] = [
    { key: "", label: "All" },
    ...WOMEN_CATEGORIES,
    ...MEN_CATEGORIES.filter((c) => !["denim", "knitwear"].includes(c.key)),
    ...ACCESSORIES_CATEGORIES,
  ];
  return list.filter((c, i, arr) => arr.findIndex((x) => x.key === c.key) === i);
}

export function ShopView({ route }: { route: ShopRoute }) {
  const navigate = useStore((s) => s.navigate);

  const [data, setData] = useState<{ q: string; products: Product[]; error: boolean }>({
    q: "",
    products: [],
    error: false,
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColours, setSelectedColours] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string[]>([]);
  const [sort, setSort] = useState("featured");

  const categoryKey = Array.isArray(route.category)
    ? route.category.join(",")
    : (route.category ?? "");

  /* Reset local filters when the shop route changes (women → sale → bestsellers …) */
  const routeKey = `${route.gender ?? ""}|${categoryKey}|${route.tag ?? ""}|${route.sale ? "1" : "0"}`;
  const [lastRouteKey, setLastRouteKey] = useState(routeKey);
  if (lastRouteKey !== routeKey) {
    setLastRouteKey(routeKey);
    setSelectedSizes([]);
    setSelectedColours([]);
    setPriceRange([]);
    setSort("featured");
  }

  const query = useMemo(() => {
    const params = new URLSearchParams({ limit: "60" });
    if (route.gender && route.gender !== "all") params.set("gender", route.gender);
    if (route.category) {
      params.set(
        "category",
        Array.isArray(route.category) ? route.category.join(",") : route.category
      );
    }
    if (route.tag === "new") params.set("new", "true");
    else if (route.tag === "bestsellers") params.set("bestseller", "true");
    else if (route.tag) params.set("tag", route.tag);
    if (route.sale) params.set("sale", "true");
    if (sort !== "featured") params.set("sort", sort);
    return params.toString();
  }, [route.gender, route.category, route.tag, route.sale, sort]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/products?${query}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((json) => {
        if (!cancelled) {
          setData({ q: query, products: json.products ?? [], error: false });
        }
      })
      .catch(() => {
        if (!cancelled) setData({ q: query, products: [], error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const loading = data.q !== query;
  const hasError = data.error && data.q === query;
  const products = data.products;

  /* Size options — derived from the loaded pieces, falling back to curated lists */
  const sizeOptions = useMemo(() => {
    if (products.length === 0) {
      if (route.gender === "women") return WOMEN_SIZES;
      if (route.gender === "men") return MEN_SIZES;
      return BASE_SIZES;
    }
    const present = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => present.add(s)));
    return BASE_SIZES.filter((s) => present.has(s)).concat(
      [...present].filter((s) => !BASE_SIZES.includes(s))
    );
  }, [products, route.gender]);

  /* Colour options — union of product colours, with a curated fallback */
  const colourOptions = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) =>
      p.colors.forEach((c) => {
        if (!map.has(c.name)) map.set(c.name, c.hex);
      })
    );
    if (map.size === 0) return FALLBACK_COLOURS;
    return [...map.entries()].map(([name, hex]) => ({ name, hex }));
  }, [products]);

  /* Client-side filtering + sorting */
  const visible = useMemo(() => {
    let list = [...products];
    if (selectedSizes.length) {
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }
    if (selectedColours.length) {
      list = list.filter((p) => p.colors.some((c) => selectedColours.includes(c.name)));
    }
    if (priceRange.length) {
      const tests = PRICE_RANGES.filter((r) => priceRange.includes(r.key)).map((r) => r.test);
      list = list.filter((p) => tests.some((test) => test(p.price)));
    }
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
    }
    return list;
  }, [products, selectedSizes, selectedColours, priceRange, sort]);

  const activeCount = selectedSizes.length + selectedColours.length + priceRange.length;

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColours([]);
    setPriceRange([]);
  };

  const title =
    route.title ??
    (route.sale
      ? "The Sale"
      : route.tag === "new"
        ? "New Arrivals"
        : route.tag === "bestsellers"
          ? "Bestsellers"
          : route.gender === "women"
            ? "Women"
            : route.gender === "men"
              ? "Men"
              : "All Clothing");

  const categoryOptions = useMemo(() => buildCategoryOptions(route), [route]);

  const selectCategory = (key: string, label: string) => {
    const base: ShopRoute = {
      name: "shop",
      gender: route.gender,
      tag: route.tag,
      sale: route.sale,
    };
    if (!key) {
      navigate({ ...base, title });
    } else {
      navigate({ ...base, category: key, title: label });
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColour = (name: string) => {
    setSelectedColours((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  /* Shared filter accordion — used by the desktop aside and the mobile sheet */
  const filterPanel = (
    <Accordion
      type="multiple"
      defaultValue={["cat", "size", "color", "price"]}
      className="border-0"
    >
      <AccordionItem value="cat" className="border-stone-200">
        <AccordionTrigger className="text-[11px] font-semibold tracking-[0.25em] uppercase">
          Category
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-1">
            {categoryOptions.map((c) => (
              <button
                key={c.key || "all"}
                onClick={() => selectCategory(c.key, c.label)}
                className={`block py-1 text-sm ${
                  c.key === categoryKey
                    ? "font-semibold text-stone-900"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="size" className="border-stone-200">
        <AccordionTrigger className="text-[11px] font-semibold tracking-[0.25em] uppercase">
          Size
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`min-w-11 border px-2.5 py-1.5 text-xs transition ${
                  selectedSizes.includes(size)
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-300 text-stone-600 hover:border-stone-900"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="color" className="border-stone-200">
        <AccordionTrigger className="text-[11px] font-semibold tracking-[0.25em] uppercase">
          Colour
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 gap-1.5">
            {colourOptions.map((c) => (
              <label
                key={c.name}
                className="flex cursor-pointer items-center gap-2 py-1 text-sm text-stone-600"
              >
                <Checkbox
                  className="size-4"
                  checked={selectedColours.includes(c.name)}
                  onCheckedChange={() => toggleColour(c.name)}
                />
                <span
                  className="h-3.5 w-3.5 rounded-full border border-stone-300"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="capitalize">{c.name}</span>
              </label>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="price" className="border-stone-200">
        <AccordionTrigger className="text-[11px] font-semibold tracking-[0.25em] uppercase">
          Price
        </AccordionTrigger>
        <AccordionContent>
          <RadioGroup
            className="grid gap-3"
            value={priceRange[0] ?? ""}
            onValueChange={(value) => setPriceRange(value ? [value] : [])}
          >
            {PRICE_RANGES.map((r) => (
              <div key={r.key} className="flex items-center gap-2.5 py-1">
                <RadioGroupItem value={r.key} id={`price-${r.key}`} />
                <label
                  htmlFor={`price-${r.key}`}
                  className="cursor-pointer text-sm text-stone-600"
                >
                  {r.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6 lg:px-10">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-stone-400"
        >
          <button
            onClick={() => navigate({ name: "home" })}
            className="hover:text-stone-900"
          >
            Home
          </button>
          <span aria-hidden>/</span>
          <span className="text-stone-700">{title}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 md:px-6 lg:px-10">
        {/* Header + sort */}
        <div className="mt-4 flex flex-col justify-between gap-3 border-b border-stone-200 pb-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl tracking-tight text-stone-900 md:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              {loading
                ? "Loading pieces…"
                : `${visible.length} piece${visible.length === 1 ? "" : "s"} — cut in small runs, made to last.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-[11px] uppercase tracking-[0.15em] text-[#9A3B26] hover:underline"
              >
                <X size={13} aria-hidden />
                Clear ({activeCount})
              </button>
            )}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex items-center gap-2 border border-stone-300 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] lg:hidden"
            >
              <SlidersHorizontal size={14} aria-hidden />
              Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </button>
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-none border border-stone-300 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-700"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Filters + grid */}
        <div className="flex gap-10 pt-8">
          <aside className="hidden w-56 shrink-0 lg:block">{filterPanel}</aside>
          <div className="min-w-0 flex-1">
            {hasError ? (
              <div className="py-24 text-center">
                <p className="font-display text-2xl">Something went wrong</p>
                <p className="mt-2 text-sm text-stone-500">
                  We could not load the collection. Please try again.
                </p>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i}>
                    <div className="aspect-[3/4] animate-pulse bg-stone-100" />
                    <div className="mt-3 h-3 w-2/3 animate-pulse bg-stone-100" />
                    <div className="mt-2 h-3 w-1/3 animate-pulse bg-stone-100" />
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-display text-2xl text-stone-900">
                  No pieces match your filters.
                </p>
                <p className="mt-2 text-sm text-stone-500">
                  Try removing a filter or two — good things are waiting.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 border border-stone-900 px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] hover:bg-stone-900 hover:text-white"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
                {visible.map((product, i) => (
                  <ProductCard key={product.id} product={product} eager={i < 4} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="flex w-[85vw] max-w-sm flex-col gap-0 rounded-none p-0 [&>button]:hidden"
        >
          <SheetTitle className="sr-only">Filters</SheetTitle>
          <SheetDescription className="sr-only">
            Filter pieces by category, size, colour and price.
          </SheetDescription>
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.3em]">
              Filters
            </p>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close filters"
              className="text-stone-500 transition hover:text-stone-900"
            >
              <X size={20} aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">{filterPanel}</div>
          <div className="border-t border-stone-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              onClick={() => setMobileOpen(false)}
              className="w-full bg-stone-900 py-3.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white"
            >
              Show {visible.length} Results
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
