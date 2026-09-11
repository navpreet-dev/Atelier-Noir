"use client";

import { formatPrice, useStore } from "@/lib/store";
import { Minus, Plus, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function BagDrawer() {
  const cartOpen = useStore((s) => s.cartOpen);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const cartItems = useStore((s) => s.cartItems);
  const updateQty = useStore((s) => s.updateQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const navigate = useStore((s) => s.navigate);

  const count = cartItems.reduce((n, i) => n + i.qty, 0);
  const subtotal = cartItems.reduce((n, i) => n + i.qty * i.product.price, 0);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col rounded-none bg-white p-0 sm:max-w-md [&>button]:hidden">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <SheetTitle className="font-display text-xl tracking-[0.1em]">
            SHOPPING BAG ({count})
          </SheetTitle>
          <button
            onClick={() => setCartOpen(false)}
            className="flex h-9 w-9 items-center justify-center text-stone-500 transition hover:text-stone-900"
            aria-label="Close bag"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <ShoppingBagIcon />
            <div>
              <p className="font-display text-2xl text-stone-900">Your bag is empty</p>
              <p className="mt-2 text-sm text-stone-500">
                Beautiful things take up little space — but they do need a bag.
              </p>
            </div>
            <Button
              onClick={() => navigate({ name: "shop", title: "All Clothing" })}
              className="h-12 rounded-none bg-stone-900 px-8 text-[11px] font-semibold uppercase tracking-[0.25em] hover:bg-stone-800"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="thin-scrollbar flex-1 divide-y divide-stone-100 overflow-y-auto px-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 py-5">
                  <button
                    onClick={() => navigate({ name: "product", slug: item.product.slug })}
                    className="relative h-28 w-20 shrink-0 overflow-hidden bg-stone-100"
                    aria-label={item.product.name}
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => navigate({ name: "product", slug: item.product.slug })}
                        className="text-left text-sm font-medium text-stone-900 transition hover:text-stone-500"
                      >
                        {item.product.name}
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 transition hover:text-stone-900"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <X size={15} aria-hidden />
                      </button>
                    </div>
                    <p className="mt-1 text-xs capitalize text-stone-500">
                      {item.color} · Size {item.size}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-stone-200">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="flex h-8 w-8 items-center justify-center text-stone-500 transition hover:text-stone-900"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} aria-hidden />
                        </button>
                        <span className="w-8 text-center text-sm">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="flex h-8 w-8 items-center justify-center text-stone-500 transition hover:text-stone-900"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} aria-hidden />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-stone-900">
                        {formatPrice(item.product.price * item.qty)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-200 px-6 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <span className="font-medium text-stone-900">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-stone-400">
                Shipping calculated at checkout — free over $150.
              </p>
              <Button
                onClick={() => navigate({ name: "checkout" })}
                className="mt-4 h-12 w-full rounded-none bg-stone-900 text-[11px] font-semibold uppercase tracking-[0.25em] hover:bg-stone-800"
              >
                Checkout — {formatPrice(subtotal)}
              </Button>
              <Button
                onClick={() => navigate({ name: "cart" })}
                variant="outline"
                className="mt-2 h-12 w-full rounded-none border-stone-300 text-[11px] font-semibold uppercase tracking-[0.25em] hover:bg-stone-50"
              >
                View Bag
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ShoppingBagIcon() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-stone-400"
        aria-hidden
      >
        <path d="M16 10a4 4 0 0 1-8 0" />
        <path d="M3.103 6.034h17.794" />
        <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
      </svg>
    </div>
  );
}
