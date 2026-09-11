"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { formatPrice, useStore, type CartProduct, type WishItem } from "@/lib/store";
import { toast } from "@/hooks/use-toast";

export function WishlistView() {
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const addToCart = useStore((s) => s.addToCart);
  const requireSignIn = useStore((s) => s.requireSignIn);
  const navigate = useStore((s) => s.navigate);

  const [moving, setMoving] = useState<string | null>(null);

  async function moveToBag(item: WishItem) {
    if (moving) return;
    if (!requireSignIn()) return;
    setMoving(item.id);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(item.slug)}`);
      const json = await res.json().catch(() => ({}));
      const product = json.product as CartProduct | undefined;
      if (!product) {
        toast({ title: "This piece is no longer available.", variant: "destructive" });
        return;
      }
      const ok = await addToCart(
        product,
        product.sizes[0] ?? "One Size",
        product.colors[0]?.name ?? "default"
      );
      if (ok) {
        toggleWishlist(item);
      } else {
        toast({ title: "Could not add to bag. Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Could not add to bag. Please try again.", variant: "destructive" });
    } finally {
      setMoving(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 md:px-6 lg:px-10">
      <header className="pt-14 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B08968]">
          Saved Pieces
        </p>
        <h1 className="mt-3 font-display text-3xl md:text-5xl">Wishlist</h1>
        <p className="mt-4 text-sm text-stone-500">Pieces you save live here, waiting patiently.</p>
      </header>

      {wishlist.length === 0 ? (
        <div className="py-20 text-center">
          <h2 className="font-display text-2xl">Nothing saved yet</h2>
          <p className="mt-2 text-sm text-stone-500">
            Tap the heart on any piece to keep it here — your future wardrobe, quietly assembled.
          </p>
          <button
            onClick={() => navigate({ name: "shop", title: "All Clothing" })}
            className="mt-8 border border-stone-900 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition hover:bg-stone-900 hover:text-white"
          >
            Explore the Collection
          </button>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {wishlist.map((item) => (
            <article key={item.id} className="border border-stone-200">
              <button
                onClick={() => navigate({ name: "product", slug: item.slug })}
                className="block aspect-[3/4] w-full overflow-hidden bg-stone-100"
                aria-label={item.name}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </button>
              <div className="p-5">
                <button
                  onClick={() => navigate({ name: "product", slug: item.slug })}
                  className="text-left font-medium text-stone-900 hover:underline"
                >
                  {item.name}
                </button>
                <p className="mt-1 text-sm text-stone-500">{formatPrice(item.price)}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => moveToBag(item)}
                    disabled={moving === item.id}
                    className="flex-1 bg-stone-900 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-stone-700 disabled:opacity-60"
                  >
                    {moving === item.id ? "Adding…" : "Move to Bag"}
                  </button>
                  <button
                    onClick={() => toggleWishlist(item)}
                    aria-label={`Remove ${item.name} from wishlist`}
                    className="flex items-center justify-center border border-stone-200 px-3 text-stone-400 transition hover:border-stone-900 hover:text-stone-900"
                  >
                    <Heart size={15} aria-hidden />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
