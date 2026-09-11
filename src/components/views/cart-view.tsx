"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, Truck, X } from "lucide-react";
import { formatPrice, useStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";

export function CartView() {
  const cartItems = useStore((s) => s.cartItems);
  const updateQty = useStore((s) => s.updateQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const promoCode = useStore((s) => s.promoCode);
  const applyPromoCode = useStore((s) => s.applyPromoCode);
  const clearPromo = useStore((s) => s.clearPromo);
  const requireSignIn = useStore((s) => s.requireSignIn);
  const navigate = useStore((s) => s.navigate);

  const [promoInput, setPromoInput] = useState("");

  const count = cartItems.reduce((n, i) => n + i.qty, 0);
  const subtotal = cartItems.reduce((n, i) => n + i.qty * i.product.price, 0);
  const total = promoCode ? subtotal * 0.9 : subtotal;

  function handleApplyPromo() {
    const code = promoInput.trim();
    if (!code) return;
    if (applyPromoCode(code)) {
      toast({ title: "Promo applied — 10% off." });
      setPromoInput("");
    } else {
      toast({ title: "Invalid promo code.", variant: "destructive" });
    }
  }

  function handleBuyNow() {
    if (cartItems.length === 0) return;
    if (!requireSignIn()) return;
    navigate({ name: "checkout" });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 md:px-6 lg:px-10">
      <h1 className="pt-10 font-display text-3xl tracking-tight md:text-4xl">
        Shopping Bag <span className="text-lg text-stone-400">({count})</span>
      </h1>

      {cartItems.length === 0 ? (
        <div className="py-28 text-center">
          <p className="font-display text-2xl">Your bag is empty</p>
          <p className="mt-2 text-sm text-stone-500">
            Beautiful things take up little space — but they do need a bag.
          </p>
          <button
            onClick={() => navigate({ name: "shop", title: "All Clothing" })}
            className="mt-8 border border-stone-900 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition hover:bg-stone-900 hover:text-white"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
          {/* Left — banner, items, continue shopping */}
          <div>
            <div className="mb-6 flex items-center gap-3 border border-stone-200 bg-stone-50 px-5 py-4">
              <Truck size={18} className="shrink-0 text-stone-500" aria-hidden />
              <p className="text-sm text-stone-600">
                <strong className="text-[#5C6B4F]">
                  Your order qualifies for complimentary carbon-neutral shipping.
                </strong>
              </p>
            </div>

            <div className="divide-y divide-stone-100 border-y border-stone-100">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-5 py-6">
                  <button
                    onClick={() => navigate({ name: "product", slug: item.product.slug })}
                    className="aspect-[3/4] w-28 shrink-0 overflow-hidden bg-stone-100 sm:w-36"
                    aria-label={item.product.name}
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
                        <p className="mt-0.5 text-xs text-stone-400">
                          Ships in 1–2 business days
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.product.name} from bag`}
                        className="text-stone-400 transition hover:text-[#9A3B26]"
                      >
                        <Trash2 size={17} aria-hidden />
                      </button>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                      <div className="flex items-center border border-stone-200">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="flex h-9 w-9 items-center justify-center text-stone-600 transition hover:bg-stone-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} aria-hidden />
                        </button>
                        <span className="w-10 text-center text-sm">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="flex h-9 w-9 items-center justify-center text-stone-600 transition hover:bg-stone-50"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} aria-hidden />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] font-semibold text-stone-900">
                          {formatPrice(item.product.price * item.qty)}
                        </p>
                        <p className="text-xs text-stone-400">
                          {formatPrice(item.product.price)} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate({ name: "shop", title: "All Clothing" })}
              className="mt-8 border border-stone-900 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition hover:bg-stone-900 hover:text-white"
            >
              Continue Shopping
            </button>
          </div>

          {/* Right — order summary */}
          <aside className="h-fit border border-stone-200 p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg tracking-[0.1em]">ORDER SUMMARY</h2>

            <div className="mt-4 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {promoCode && (
                <div className="flex justify-between">
                  <span className="text-stone-600">Promo — {promoCode}</span>
                  <span className="text-[#5C6B4F]">−10%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-600">Shipping</span>
                <span className="text-[#5C6B4F]">Free</span>
              </div>
            </div>

            <div className="my-4 border-t border-stone-200" />

            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <div className="mt-6">
              {promoCode ? (
                <div className="flex items-center justify-between border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm">
                  <span className="text-stone-600">{promoCode} — 10% off</span>
                  <button
                    onClick={clearPromo}
                    aria-label="Remove promo code"
                    className="text-stone-400 transition hover:text-[#9A3B26]"
                  >
                    <X size={14} aria-hidden />
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                    Promo Code
                  </p>
                  <div className="mt-2 flex">
                    <input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      placeholder="ATELIER10"
                      aria-label="Promo code"
                      className="h-11 flex-1 rounded-none border border-stone-300 px-3 text-sm uppercase outline-none transition focus:border-stone-900"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="h-11 shrink-0 border border-stone-900 bg-transparent px-5 text-[11px] font-semibold uppercase tracking-[0.2em] transition hover:bg-stone-900 hover:text-white"
                    >
                      Apply
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleBuyNow}
              className="mt-4 h-14 w-full bg-stone-900 text-[11px] font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-stone-700"
            >
              Buy Now
            </button>
            <p className="mt-3 text-center text-xs text-stone-400">
              Taxes included. Shipping calculated at checkout.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
