"use client";

import { formatPrice, useStore } from "@/lib/store";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function BagDrawer() {
  const cartOpen = useStore((s) => s.cartOpen);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const cartItems = useStore((s) => s.cartItems);
  const updateQty = useStore((s) => s.updateQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const navigate = useStore((s) => s.navigate);

  const count = cartItems.reduce((n, i) => n + i.qty, 0);
  const subtotal = cartItems.reduce((n, i) => n + i.qty * i.product.price, 0);
  const remaining = Math.max(0, 150 - subtotal);
  const progress = Math.min(100, (subtotal / 150) * 100);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col bg-white p-0 sm:max-w-md"
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5">
          <SheetTitle className="text-[12px] font-semibold tracking-[0.3em] uppercase">
            Shopping Bag ({count})
          </SheetTitle>
          <button
            onClick={() => setCartOpen(false)}
            aria-label="Close bag"
            className="text-stone-500 hover:text-stone-900"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag size={44} strokeWidth={1} className="text-stone-300" aria-hidden />
            <p className="font-display text-xl text-stone-900">Your bag is empty</p>
            <p className="max-w-xs text-sm text-stone-500">
              Fill it with things worth keeping — new season pieces are landing weekly.
            </p>
            <Button
              onClick={() => {
                setCartOpen(false);
                navigate({ name: "shop", title: "All Clothing" });
              }}
              className="mt-2 h-11 rounded-none bg-stone-900 px-8 text-[11px] tracking-[0.25em] uppercase hover:bg-stone-700"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-stone-100 px-6 py-3">
              <p className="mb-2 text-[12px] text-stone-600">
                {remaining > 0 ? (
                  <>
                    You are <strong className="text-stone-900">{formatPrice(remaining)}</strong> away
                    from free shipping
                  </>
                ) : (
                  <strong className="text-[#5C6B4F]">
                    ✓ You have unlocked complimentary shipping
                  </strong>
                )}
              </p>
              <div className="h-1 w-full overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-stone-900 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b border-stone-100 py-5 last:border-0"
                >
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      navigate({ name: "product", slug: item.product.slug });
                    }}
                    className="h-28 w-21 shrink-0 overflow-hidden bg-stone-100"
                    style={{ width: "5.25rem" }}
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-stone-900">{item.product.name}</p>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {item.color} · Size {item.size}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.product.name}`}
                        className="text-stone-400 transition hover:text-[#9A3B26]"
                      >
                        <Trash2 size={15} aria-hidden />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-stone-200">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="flex h-8 w-8 items-center justify-center text-stone-600 hover:bg-stone-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} aria-hidden />
                        </button>
                        <span className="w-8 text-center text-sm">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="flex h-8 w-8 items-center justify-center text-stone-600 hover:bg-stone-50"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} aria-hidden />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-stone-900">
                        {formatPrice(item.product.price * item.qty)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 px-6 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
              </div>
              <p className="mb-4 text-xs text-stone-400">
                Shipping &amp; taxes calculated at checkout
              </p>
              <Button
                onClick={() => {
                  setCartOpen(false);
                  navigate({ name: "cart" });
                }}
                className="h-12 w-full rounded-none bg-stone-900 text-[11px] font-semibold tracking-[0.25em] uppercase hover:bg-stone-700"
              >
                Checkout — {formatPrice(subtotal)}
              </Button>
              <button
                onClick={() => {
                  setCartOpen(false);
                  navigate({ name: "cart" });
                }}
                className="mt-3 w-full text-center text-[11px] font-semibold tracking-[0.2em] text-stone-500 uppercase underline underline-offset-4 hover:text-stone-900"
              >
                View Bag
              </button>
            </div>
          </>
        )}
      </SheetContent>
      <Separator className="hidden" />
    </Sheet>
  );
}
