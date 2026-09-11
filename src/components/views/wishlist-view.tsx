"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, useStore } from "@/lib/store";
import { ProductCard, type Product } from "@/components/site/product-card";

export function WishlistView() {
  const wishlist = useStore((s) => s.wishlist);
  const addToCart = useStore((s) => s.addToCart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const navigate = useStore((s) => s.navigate);
  const requireSignIn = useStore((s) => s.requireSignIn);

  const [products, setProducts] = useState<Record<string, Product>>({});
  const productsRef = useRef<Record<string, Product>>({});

  useEffect(() => {
    let cancelled = false;
    for (const item of wishlist) {
      if (productsRef.current[item.id]) continue;
      fetch(`/api/products/${encodeURIComponent(item.slug)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          const p = json?.product as Product | undefined;
          if (p && !cancelled) {
            productsRef.current[item.id] = p;
            setProducts((prev) => ({ ...prev, [item.id]: p }));
          }
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [wishlist]);

  const moveAllToBag = async () => {
    if (!requireSignIn()) return;
    let moved = 0;
    for (const item of wishlist) {
      let p: Product | undefined = productsRef.current[item.id];
      if (!p) {
        try {
          const res = await fetch(`/api/products/${encodeURIComponent(item.slug)}`);
          const json = await res.json().catch(() => null);
          const fetched = json?.product as Product | undefined;
          if (fetched) {
            p = fetched;
            productsRef.current[item.id] = fetched;
            setProducts((prev) => ({ ...prev, [item.id]: fetched }));
          }
        } catch {
          /* ignore */
        }
      }
      if (!p) continue;
      const ok = await addToCart(p, p.sizes[0] || "M", p.colors[0]?.name || "Default", 1);
      if (ok) moved += 1;
    }
    if (moved > 0) {
      toast.success(`${moved} piece${moved === 1 ? "" : "s"} moved to your bag`);
      setCartOpen(true);
    } else {
      toast.error("Could not move items — please try again");
    }
  };

  const totalPrice = wishlist.reduce((n, i) => n + i.price, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 md:px-6 lg:px-10">
      <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-8 pt-10 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl tracking-tight md:text-4xl">Wishlist</h1>
          <p className="mt-2 text-sm text-stone-500">
            {wishlist.length === 0
              ? "Pieces you save live here, waiting patiently."
              : `${wishlist.length} saved piece${wishlist.length === 1 ? "" : "s"} · ${formatPrice(totalPrice)} total`}
          </p>
        </div>
        {wishlist.length > 0 && (
          <button
            onClick={moveAllToBag}
            className="flex items-center justify-center gap-2.5 bg-stone-900 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700"
          >
            <ShoppingBag size={15} /> Move All to Bag
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <Heart size={52} strokeWidth={1} className="text-stone-300" />
          <p className="mt-6 font-display text-2xl text-stone-900">Nothing saved yet</p>
          <p className="mt-2 max-w-sm text-sm text-stone-500">
            Tap the heart on any piece to keep it here — your future wardrobe, quietly assembled.
          </p>
          <button
            onClick={() => navigate({ name: "shop", title: "All Clothing" })}
            className="mt-8 bg-stone-900 px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-stone-700"
          >
            Browse the Collection
          </button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
          {wishlist.map((item) => {
            const p = products[item.id];
            return p ? <ProductCard key={item.id} product={p} /> : null;
          })}
        </div>
      )}
    </div>
  );
}
