"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { formatPrice, useStore } from "@/lib/store";

export function CartView() {
  const cartItems = useStore((s) => s.cartItems);
  const updateQty = useStore((s) => s.updateQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const navigate = useStore((s) => s.navigate);
  const promoCode = useStore((s) => s.promoCode);
  const applyPromoCode = useStore((s) => s.applyPromoCode);
  const requireSignIn = useStore((s) => s.requireSignIn);

  const [promoInput, setPromoInput] = useState("");

  const subtotal = cartItems.reduce((n, i) => n + i.qty * i.product.price, 0);
  const discount = promoCode ? Math.round(0.1 * subtotal * 100) / 100 : 0;
  const shipping = cartItems.length === 0 || subtotal - discount >= 150 ? 0 : 8;
  const total = Math.max(0, subtotal - discount + shipping);
  const count = cartItems.reduce((n, i) => n + i.qty, 0);

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-24 md:px-6 lg:px-10">
        <h1 className="pt-10 font-display text-3xl tracking-tight md:text-4xl">Shopping Bag</h1>
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <ShoppingBag size={52} strokeWidth={1} className="text-stone-300" />
          <p className="mt-6 font-display text-2xl text-stone-900">Your bag is empty</p>
          <p className="mt-2 max-w-sm text-sm text-stone-500">
            Beautiful things take up little space. Start with a piece you will keep for a decade.
          </p>
          <button
            onClick={() => navigate({ name: "shop", title: "All Clothing" })}
            className="mt-8 bg-stone-900 px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-stone-700"
          >
            Explore the Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 md:px-6 lg:px-10">
      <h1 className="pt-10 font-display text-3xl tracking-tight md:text-4xl">
        Shopping Bag <span className="text-lg text-stone-400">({count})</span>
      </h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-6 flex items-center gap-3 border border-stone-200 bg-stone-50 px-5 py-4">
            <Truck size={18} className="shrink-0 text-stone-500" />
            <p className="text-sm text-stone-600">
              {subtotal - discount >= 150 ? (
                <strong className="text-[#5C6B4F]">
                  Your order qualifies for complimentary carbon-neutral shipping.
                </strong>
              ) : (
                <>
                  Add{" "}
                  <strong className="text-stone-900">
                    {formatPrice(150 - subtotal + discount)}
                  </strong>{" "}
                  more for free shipping
                </>
              )}
            </p>
          </div>

          <div className="divide-y divide-stone-100 border-y border-stone-100">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-5 py-6">
                <button
                  onClick={() => navigate({ name: "product", slug: item.product.slug })}
                  className="aspect-[3/4] w-28 shrink-0 overflow-hidden bg-stone-100 sm:w-36"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                </button>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <button
                        onClick={() => navigate({ name: "product", slug: item.product.slug })}
                        className="text-left font-medium text-stone-900 hover:underline"
                      >
                        {item.product.name}
                      </button>
                      <p className="mt-1 text-sm capitalize text-stone-500">
                        {item.color} · Size {item.size}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-400">Ships in 1–2 business days</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.product.name} from bag`}
                      className="text-stone-400 transition hover:text-[#9A3B26]"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                    <div className="flex items-center border border-stone-300">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="flex h-10 w-10 items-center justify-center text-stone-600 hover:bg-stone-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="flex h-10 w-10 items-center justify-center text-stone-600 hover:bg-stone-50"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-stone-900">
                        {formatPrice(item.product.price * item.qty)}
                      </p>
                      <p className="text-xs text-stone-400">{formatPrice(item.product.price)} each</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate({ name: "shop", title: "All Clothing" })}
            className="mt-8 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft size={15} /> Continue Shopping
          </button>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="border border-stone-200 p-7">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.3em]">Order Summary</h2>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Subtotal</span>
                <span className="text-stone-900">{formatPrice(subtotal)}</span>
              </div>
              {promoCode && (
                <div className="flex justify-between text-[#5C6B4F]">
                  <span>
                    Promo {promoCode} (−10%)
                  </span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">Shipping</span>
                <span className="text-stone-900">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-4 text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-stone-400">
                Or 4 interest-free payments of {formatPrice(Math.round(total / 4))}
              </p>
            </div>

            <div className="mt-6">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                <Tag size={12} /> Promo Code
              </p>
              {promoCode ? (
                <p className="flex items-center gap-2 border border-[#5C6B4F]/30 bg-[#5C6B4F]/5 px-3.5 py-3 text-sm text-[#5C6B4F]">
                  <Check size={15} /> {promoCode} applied
                </p>
              ) : (
                <div className="flex">
                  <Input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="ATELIER10"
                    className="h-11 rounded-none border-stone-300 focus-visible:ring-0 focus-visible:border-stone-900"
                  />
                  <button
                    onClick={() => {
                      if (applyPromoCode(promoInput)) {
                        toast.success("Promo applied — 10% off your order");
                      } else {
                        toast.error("That code is not valid. Please check and try again.");
                      }
                    }}
                    className="shrink-0 border border-l-0 border-stone-900 px-5 text-[11px] font-semibold uppercase tracking-[0.2em] transition hover:bg-stone-900 hover:text-white"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (requireSignIn()) navigate({ name: "checkout" });
              }}
              className="mt-7 w-full bg-stone-900 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700"
            >
              Buy Now — {formatPrice(total)}
            </button>
            <p className="mt-4 text-center text-[11px] leading-relaxed text-stone-400">
              Secure 256-bit encrypted checkout · Free 30-day returns · 10-year repair guarantee
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
