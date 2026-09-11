"use client";

import { useMemo, useState } from "react";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, useStore, type CartProduct } from "@/lib/store";
import { StarRating } from "./star-rating";

export type Product = CartProduct & {
  rating: number;
  reviewCount: number;
  sold: number;
  isNew: boolean;
  isSale: boolean;
  bestseller: boolean;
  stock: number;
  comparePrice: number | null;
  colors: { name: string; hex: string }[];
};

export function ProductCard({
  product,
  eager = false,
}: {
  product: Product;
  eager?: boolean;
}) {
  const navigate = useStore((s) => s.navigate);
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const inWishlist = useStore((s) => s.inWishlist);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const requireSignIn = useStore((s) => s.requireSignIn);

  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);

  const wished = inWishlist(product.id);

  const discount = useMemo(
    () =>
      !product.comparePrice || product.comparePrice <= product.price
        ? null
        : Math.round((1 - product.price / product.comparePrice) * 100),
    [product.price, product.comparePrice]
  );

  const primary = product.images[0];
  const secondary = product.images[1] || product.images[0];

  const open = () => navigate({ name: "product", slug: product.slug });

  const quickAdd = async (size: string) => {
    if (!requireSignIn()) return;
    setAdding(true);
    const color = product.colors[0]?.name || "Default";
    const ok = await addToCart(product, size, color, 1);
    setAdding(false);
    if (ok) {
      toast.success(`${product.name} added to bag`, {
        description: `Size ${size} · ${color}`,
      });
      setCartOpen(true);
    } else {
      toast.error("Could not add to bag. Please try again.");
    }
  };

  const wish = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    toast.success(wished ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <div className="group/card">
      <div
        className="relative aspect-[3/4] overflow-hidden bg-stone-100 cursor-pointer"
        onClick={open}
        role="link"
        tabIndex={0}
        aria-label={product.name}
        onKeyDown={(e) => {
          if (e.key === "Enter") open();
        }}
      >
        {imgError ? (
          <div className="flex h-full w-full items-center justify-center bg-stone-200">
            <span className="font-display text-2xl text-stone-400">Atelier Noir</span>
          </div>
        ) : (
          <>
            <img
              src={primary}
              alt={product.name}
              loading={eager ? "eager" : "lazy"}
              onError={() => setImgError(true)}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover/card:opacity-0"
            />
            <img
              src={secondary}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 group-hover/card:opacity-100 group-hover/card:scale-[1.03]"
            />
          </>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-stone-900 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-white">
              NEW
            </span>
          )}
          {discount && (
            <span className="bg-[#9A3B26] px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-white">
              −{discount}%
            </span>
          )}
          {product.bestseller && (
            <span className="bg-white px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-stone-900 shadow-sm">
              BESTSELLER
            </span>
          )}
        </div>
        <button
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={wish}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110"
        >
          <Heart
            size={16}
            className={wished ? "fill-[#9A3B26] text-[#9A3B26]" : "text-stone-700"}
            aria-hidden
          />
        </button>
        <div className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-white/95 py-3 backdrop-blur transition-transform duration-300 group-hover/card:translate-y-0 md:block">
          <p className="mb-2 text-center text-[10px] font-semibold tracking-[0.25em] text-stone-500">
            {adding ? "ADDING…" : "QUICK ADD — SELECT SIZE"}
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 px-3">
            {product.sizes.map((size) => (
              <button
                key={size}
                disabled={adding}
                onClick={(e) => {
                  e.stopPropagation();
                  quickAdd(size);
                }}
                className="min-w-9 border border-stone-300 px-2 py-1 text-xs text-stone-700 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white disabled:opacity-50"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <button
          aria-label="Quick add to bag"
          onClick={(e) => {
            e.stopPropagation();
            if (product.sizes.length === 1) {
              quickAdd(product.sizes[0]);
            } else {
              open();
            }
          }}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-white shadow-md md:hidden"
        >
          <Plus size={16} aria-hidden />
        </button>
      </div>
      <div className="pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">
            {product.gender === "men" ? "Men" : product.gender === "women" ? "Women" : "Unisex"} ·{" "}
            {product.category}
          </p>
          {product.reviewCount > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-[11px] text-stone-400">
              <StarRating rating={product.rating} size={10} /> {product.rating.toFixed(1)}
            </span>
          )}
        </div>
        <h3
          onClick={open}
          className="mt-1 cursor-pointer font-medium text-stone-900 transition-colors hover:text-[#B08968]"
        >
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`text-[15px] font-semibold ${
              discount ? "text-[#9A3B26]" : "text-stone-900"
            }`}
          >
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-stone-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
        {product.colors.length > 1 && (
          <div className="mt-2 flex gap-1.5">
            {product.colors.slice(0, 5).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3 w-3 rounded-full border border-stone-300"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
