"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { Preloader } from "@/components/site/preloader";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BagDrawer } from "@/components/site/bag-drawer";
import { SearchDialog } from "@/components/site/search-dialog";
import { MobileMenu } from "@/components/site/mobile-menu";
import { HomeView } from "@/components/views/home-view";
import { ShopView } from "@/components/views/shop-view";
import { ProductView } from "@/components/views/product-view";
import { CartView } from "@/components/views/cart-view";
import { CheckoutView } from "@/components/views/checkout-view";
import { WishlistView } from "@/components/views/wishlist-view";
import { AccountView } from "@/components/views/account-view";
import { AboutView } from "@/components/views/about-view";
import { ContactView } from "@/components/views/contact-view";
import { FaqView } from "@/components/views/faq-view";
import { LookbookView } from "@/components/views/lookbook-view";
import { JournalView } from "@/components/views/journal-view";
import { JournalPostView } from "@/components/views/journal-post-view";
import { SearchView } from "@/components/views/search-view";

export default function Page() {
  const route = useStore((s) => s.route);
  const hydrateCart = useStore((s) => s.hydrateCart);
  const fetchUser = useStore((s) => s.fetchUser);
  const syncFromHistory = useStore((s) => s.syncFromHistory);

  useEffect(() => {
    hydrateCart();
    fetchUser();
    const onPop = (e: PopStateEvent) => syncFromHistory(e.state);
    window.addEventListener("popstate", onPop);
    try {
      if (!window.history.state?.route) {
        window.history.replaceState({ route: useStore.getState().route }, "");
      }
    } catch {
      /* noop */
    }
    return () => window.removeEventListener("popstate", onPop);
  }, [hydrateCart, fetchUser, syncFromHistory]);

  const view = (() => {
    switch (route.name) {
      case "shop":
        return <ShopView route={route} />;
      case "product":
        return <ProductView slug={route.slug} />;
      case "cart":
        return <CartView />;
      case "checkout":
        return <CheckoutView />;
      case "wishlist":
        return <WishlistView />;
      case "account":
        return <AccountView />;
      case "about":
        return <AboutView />;
      case "contact":
        return <ContactView />;
      case "faq":
        return <FaqView />;
      case "lookbook":
        return <LookbookView />;
      case "journal":
        return <JournalView />;
      case "journal-post":
        return <JournalPostView slug={route.slug} />;
      case "search":
        return <SearchView q={route.q} />;
      default:
        return <HomeView />;
    }
  })();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Preloader />
      <SiteHeader />
      <main key={route.name + JSON.stringify(route)} className="flex-1 animate-in fade-in duration-300">
        {view}
      </main>
      <SiteFooter />
      <BagDrawer />
      <SearchDialog />
      <MobileMenu />
    </div>
  );
}
