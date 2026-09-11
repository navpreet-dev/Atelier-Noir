"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "@/hooks/use-toast";

export type Route =
  | { name: "home" }
  | { name: "shop"; title?: string; gender?: string; category?: string | string[]; tag?: string; sale?: boolean }
  | { name: "product"; slug: string }
  | { name: "cart" }
  | { name: "checkout" }
  | { name: "wishlist" }
  | { name: "account" }
  | { name: "about" }
  | { name: "contact" }
  | { name: "faq" }
  | { name: "lookbook" }
  | { name: "journal" }
  | { name: "journal-post"; slug: string }
  | { name: "search"; q?: string };

export type CartProduct = {
  id: string;
  slug: string;
  name: string;
  gender: string;
  category: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  [key: string]: unknown;
};

export type CartItem = {
  id: string;
  productId: string;
  size: string;
  color: string;
  qty: number;
  product: CartProduct;
};

export type WishItem = { id: string; slug: string; name: string; price: number; image: string };

export type SessionUser = { id: string; name: string; email: string; createdAt: string };

export type ActivityEntry = { id: string; type: string; meta: string | null; createdAt: string };

type StoreState = {
  route: Route;
  pendingRoute: Route | null;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  cartOpen: boolean;
  sessionId: string;
  cartItems: CartItem[];
  cartLoading: boolean;
  cartHydrated: boolean;
  wishlist: WishItem[];
  promoCode: string | null;
  user: SessionUser | null;
  userReady: boolean;
  orderConfirmation: { orderNumber: string; firstName: string; email: string } | null;

  navigate: (route: Route, opts?: { replace?: boolean }) => void;
  syncFromHistory: (state: unknown) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setCartOpen: (open: boolean) => void;

  fetchUser: () => Promise<void>;
  setUser: (user: SessionUser | null) => void;
  signOut: () => Promise<void>;

  hydrateCart: () => Promise<void>;
  addToCart: (product: CartProduct, size: string, color: string, qty?: number) => Promise<boolean>;
  updateQty: (id: string, qty: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;

  toggleWishlist: (item: WishItem) => void;
  inWishlist: (id: string) => boolean;

  applyPromoCode: (code: string) => boolean;
  clearPromo: () => void;

  requireSignIn: () => boolean;
  logClientActivity: (type: string, meta?: Record<string, unknown>) => void;
};

const makeSessionId = () =>
  "sess-" +
  Math.random().toString(36).slice(2, 10) +
  Date.now().toString(36);

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      route: { name: "home" },
      pendingRoute: null,
      mobileMenuOpen: false,
      searchOpen: false,
      cartOpen: false,
      sessionId: makeSessionId(),
      cartItems: [],
      cartLoading: false,
      cartHydrated: false,
      wishlist: [],
      promoCode: null,
      user: null,
      userReady: false,
      orderConfirmation: null,

      navigate: (route, opts) => {
        set({ route, cartOpen: false, searchOpen: false, mobileMenuOpen: false });
        try {
          if (opts?.replace) {
            window.history.replaceState({ route }, "");
          } else {
            window.history.pushState({ route }, "");
          }
        } catch {
          /* noop */
        }
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      },

      syncFromHistory: (state) => {
        const s = (state ?? window.history.state) as { route?: Route } | null;
        const r = s?.route;
        if (r && typeof r.name === "string") {
          set({ route: r, cartOpen: false, searchOpen: false, mobileMenuOpen: false });
          window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        } else {
          try {
            window.history.replaceState({ route: get().route }, "");
          } catch {
            /* noop */
          }
        }
      },

      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      setCartOpen: (open) => set({ cartOpen: open }),

      fetchUser: async () => {
        try {
          const res = await fetch("/api/auth/me");
          const json = await res.json();
          set({ user: json.user ?? null, userReady: true });
        } catch {
          set({ userReady: true });
        }
      },
      setUser: (user) => set({ user, userReady: true }),
      signOut: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          /* noop */
        }
        set({ user: null });
        get().navigate({ name: "home" });
      },

      hydrateCart: async () => {
        const { sessionId } = get();
        set({ cartLoading: true });
        try {
          const res = await fetch(`/api/cart?sessionId=${encodeURIComponent(sessionId)}`);
          const json = await res.json();
          set({ cartItems: json.items ?? [], cartHydrated: true });
        } catch {
          set({ cartHydrated: true });
        } finally {
          set({ cartLoading: false });
        }
      },

      addToCart: async (product, size, color, qty = 1) => {
        const { sessionId, cartItems } = get();
        try {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, productId: product.id, size, color, qty }),
          });
          if (!res.ok) throw new Error("failed");
          const json = await res.json();
          set({ cartItems: json.items, cartOpen: true });
          return true;
        } catch {
          set({ cartItems });
          return false;
        }
      },

      updateQty: async (id, qty) => {
        const { sessionId } = get();
        try {
          const res = await fetch("/api/cart", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, qty, sessionId }),
          });
          const json = await res.json();
          set({ cartItems: json.items ?? [] });
        } catch {
          /* noop */
        }
      },

      removeFromCart: async (id) => {
        const { sessionId } = get();
        set({ cartItems: get().cartItems.filter((i) => i.id !== id) });
        try {
          const res = await fetch(
            `/api/cart?sessionId=${encodeURIComponent(sessionId)}&id=${encodeURIComponent(id)}`,
            { method: "DELETE" }
          );
          const json = await res.json();
          set({ cartItems: json.items ?? [] });
        } catch {
          /* noop */
        }
      },

      clearCart: async () => {
        const { sessionId } = get();
        set({ cartItems: [] });
        try {
          await fetch(`/api/cart?sessionId=${encodeURIComponent(sessionId)}`, {
            method: "DELETE",
          });
        } catch {
          /* noop */
        }
      },

      toggleWishlist: (item) => {
        if (!get().requireSignIn()) return;
        const wishlist = get().wishlist;
        const exists = wishlist.some((w) => w.id === item.id);
        set({ wishlist: exists ? wishlist.filter((w) => w.id !== item.id) : [item, ...wishlist] });
        get().logClientActivity(exists ? "wishlist_removed" : "wishlist_added", {
          slug: item.slug,
          name: item.name,
        });
      },
      inWishlist: (id) => get().wishlist.some((w) => w.id === id),

      applyPromoCode: (code) => {
        if (code.trim().toUpperCase() === "ATELIER10") {
          set({ promoCode: "ATELIER10" });
          return true;
        }
        return false;
      },
      clearPromo: () => set({ promoCode: null }),

      requireSignIn: () => {
        if (get().user) return true;
        const route = get().route;
        set({ pendingRoute: route.name === "account" ? null : route });
        toast({ title: "Please sign in to continue." });
        get().navigate({ name: "account" });
        return false;
      },

      logClientActivity: (type, meta) => {
        try {
          fetch("/api/account/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, meta }),
          }).catch(() => undefined);
        } catch {
          /* noop */
        }
      },
    }),
    {
      name: "atelier-noir-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        sessionId: s.sessionId,
        wishlist: s.wishlist,
        promoCode: s.promoCode,
      }),
    }
  )
);

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
