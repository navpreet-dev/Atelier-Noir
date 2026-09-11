"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import {
  ACCESSORIES_CATEGORIES as AccessoriesCategories,
  MEN_CATEGORIES as MenCategories,
  WOMEN_CATEGORIES as WomenCategories,
} from "@/lib/site-data";
import { useStore } from "@/lib/store";

function NavLinkLabel({
  children,
  active,
  accent = false,
}: {
  children: React.ReactNode;
  active?: boolean;
  accent?: boolean;
}) {
  return (
    <>
      {children}
      <span
        className={`absolute inset-x-0 bottom-0 h-px origin-left bg-stone-900 transition-transform duration-300 ${
          active ? "scale-x-100" : "scale-x-0 group-hover/navlink:scale-x-100"
        }`}
      />
    </>
  );
}

function MegaLink({
  label,
  onClick,
  accent = false,
}: {
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group/link block py-1.5 text-left text-[15px] transition-colors ${
        accent ? "font-semibold text-[#9A3B26]" : "text-stone-600 hover:text-stone-900"
      }`}
    >
      <span className="bg-gradient-to-r from-stone-900 to-stone-900 bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover/link:bg-[length:100%_1px]">
        {label}
      </span>
    </button>
  );
}

function PromoCard({
  image,
  eyebrow,
  title,
  onClick,
}: {
  image: string;
  eyebrow: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="group/promo block w-56 shrink-0 text-left">
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover/promo:scale-105"
        />
      </div>
      <p className="mt-3 text-[10px] font-semibold tracking-[0.25em] text-[#B08968] uppercase">
        {eyebrow}
      </p>
      <p className="mt-1 font-display text-lg text-stone-900 group-hover/promo:underline">
        {title}
      </p>
    </button>
  );
}

function MegaPanel({
  open,
  children,
  promo,
}: {
  open: boolean;
  children: React.ReactNode;
  promo: React.ReactNode;
}) {
  return (
    <div
      className={`absolute inset-x-0 top-full z-40 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-200 before:absolute before:inset-x-0 before:-top-10 before:h-10 before:pointer-events-none before:content-[''] ${
        open
          ? "opacity-100 [visibility:visible]"
          : "pointer-events-none opacity-0 [visibility:hidden]"
      }`}
    >
      <div className="border-t border-stone-100 bg-white">
        <div className="mx-auto flex max-w-7xl gap-10 px-6 py-10 lg:px-10">
          {children}
          {promo}
        </div>
      </div>
    </div>
  );
}

const DISCOVER_LINKS = [
  { label: "New Arrivals", tag: "new" as const },
  { label: "Bestsellers", tag: "bestsellers" as const },
  { label: "The Sale", tag: "sale" as const },
];

export function SiteHeader() {
  const cartCount = useStore((s) => s.cartItems.reduce((n, i) => n + i.qty, 0));
  const wishlistCount = useStore((s) => s.wishlist.length);
  const user = useStore((s) => s.user);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const setMobileMenuOpen = useStore((s) => s.setMobileMenuOpen);
  const route = useStore((s) => s.route);

  const [openMenu, setOpenMenu] = useState<"women" | "men" | "accessories" | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeWithDelay = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 180);
  };
  const hoverProps = (menu: "women" | "men" | "accessories") => ({
    onMouseEnter: () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setOpenMenu(menu);
    },
    onMouseLeave: closeWithDelay,
  });

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    setOpenMenu(null);
  }, [route]);

  const g = useStore.getState().navigate;

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b border-stone-200 bg-white/95 backdrop-blur">
        <nav className="relative mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 md:px-6 lg:px-10">
          <div className="flex items-center gap-6">
            <button
              className="flex h-9 w-9 items-center justify-center xl:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} className="text-stone-800" aria-hidden />
            </button>
            <div className="hidden items-center gap-3.5 xl:flex">
              {/* WOMEN */}
              <div className="group/nav" {...hoverProps("women")}>
                <button
                  onClick={() => g({ name: "shop", gender: "women", title: "Women" })}
                  className="group/navlink relative whitespace-nowrap py-2 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors text-stone-800 hover:text-stone-500"
                >
                  <NavLinkLabel active={openMenu === "women"}>Women</NavLinkLabel>
                </button>
                <MegaPanel
                  open={openMenu === "women"}
                  promo={
                    <>
                      <PromoCard
                        image="/images/editorial/editorial-5.jpg"
                        eyebrow="The Edit"
                        title="Coats for Every Autumn"
                        onClick={() =>
                          g({ name: "shop", gender: "women", category: "coats", title: "Women's Coats" })
                        }
                      />
                      <PromoCard
                        image="/images/dresses/dresses-2.jpg"
                        eyebrow="New In"
                        title="Dresses Under the Sun"
                        onClick={() =>
                          g({ name: "shop", gender: "women", category: "dresses", title: "Dresses" })
                        }
                      />
                    </>
                  }
                >
                  <div className="grid grid-cols-2 gap-x-16">
                    <div>
                      <p className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-stone-400 uppercase">
                        Shop by Category
                      </p>
                      {WomenCategories.map((c) => (
                        <MegaLink
                          key={c.key}
                          label={c.label}
                          onClick={() =>
                            g({ name: "shop", gender: "women", category: c.key, title: c.label })
                          }
                        />
                      ))}
                    </div>
                    <div>
                      <p className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-stone-400 uppercase">
                        Discover
                      </p>
                      {DISCOVER_LINKS.map((c) => (
                        <MegaLink
                          key={c.tag}
                          label={c.label}
                          accent={c.tag === "sale"}
                          onClick={() =>
                            g({ name: "shop", gender: "women", tag: c.tag, title: c.label })
                          }
                        />
                      ))}
                      <MegaLink label="The Lookbook" onClick={() => g({ name: "lookbook" })} />
                      <MegaLink label="Journal" onClick={() => g({ name: "journal" })} />
                    </div>
                  </div>
                </MegaPanel>
              </div>

              {/* MEN */}
              <div className="group/nav" {...hoverProps("men")}>
                <button
                  onClick={() => g({ name: "shop", gender: "men", title: "Men" })}
                  className="group/navlink relative whitespace-nowrap py-2 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors text-stone-800 hover:text-stone-500"
                >
                  <NavLinkLabel active={openMenu === "men"}>Men</NavLinkLabel>
                </button>
                <MegaPanel
                  open={openMenu === "men"}
                  promo={
                    <>
                      <PromoCard
                        image="/images/blazers/blazers-5.jpg"
                        eyebrow="Tailoring"
                        title="The Soft Blazer"
                        onClick={() =>
                          g({ name: "shop", gender: "men", category: "blazers", title: "Blazers & Tailoring" })
                        }
                      />
                      <PromoCard
                        image="/images/mshirts/mshirts-1.jpg"
                        eyebrow="Wardrobe Staples"
                        title="Shirting, Reconsidered"
                        onClick={() =>
                          g({ name: "shop", gender: "men", category: "shirts", title: "Shirts" })
                        }
                      />
                    </>
                  }
                >
                  <div className="grid grid-cols-2 gap-x-16">
                    <div>
                      <p className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-stone-400 uppercase">
                        Shop by Category
                      </p>
                      {MenCategories.map((c) => (
                        <MegaLink
                          key={c.key}
                          label={c.label}
                          onClick={() =>
                            g({ name: "shop", gender: "men", category: c.key, title: c.label })
                          }
                        />
                      ))}
                    </div>
                    <div>
                      <p className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-stone-400 uppercase">
                        Discover
                      </p>
                      {DISCOVER_LINKS.map((c) => (
                        <MegaLink
                          key={c.tag}
                          label={c.label}
                          accent={c.tag === "sale"}
                          onClick={() =>
                            g({ name: "shop", gender: "men", tag: c.tag, title: c.label })
                          }
                        />
                      ))}
                      <MegaLink label="The Lookbook" onClick={() => g({ name: "lookbook" })} />
                      <MegaLink label="Journal" onClick={() => g({ name: "journal" })} />
                    </div>
                  </div>
                </MegaPanel>
              </div>

              {/* ACCESSORIES */}
              <div className="group/nav" {...hoverProps("accessories")}>
                <button
                  onClick={() =>
                    g({
                      name: "shop",
                      gender: "all",
                      category: "bags,shoes,accessories",
                      title: "Accessories",
                    })
                  }
                  className="group/navlink relative whitespace-nowrap py-2 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors text-stone-800 hover:text-stone-500"
                >
                  <NavLinkLabel active={openMenu === "accessories"}>Accessories</NavLinkLabel>
                </button>
                <MegaPanel
                  open={openMenu === "accessories"}
                  promo={
                    <PromoCard
                      image="/images/bags/bags-6.jpg"
                      eyebrow="Carry All"
                      title="Bags Built for Decades"
                      onClick={() => g({ name: "shop", gender: "all", category: "bags", title: "Bags" })}
                    />
                  }
                >
                  <div>
                    <p className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-stone-400 uppercase">
                      Shop by Category
                    </p>
                    {AccessoriesCategories.map((c) => (
                      <MegaLink
                        key={c.key}
                        label={c.label}
                        onClick={() =>
                          g({ name: "shop", gender: "all", category: c.key, title: c.label })
                        }
                      />
                    ))}
                  </div>
                </MegaPanel>
              </div>

              <button
                onClick={() => g({ name: "shop", sale: true, title: "The Sale" })}
                className="group/navlink relative whitespace-nowrap py-2 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors text-[#9A3B26]"
              >
                <NavLinkLabel>Sale</NavLinkLabel>
              </button>
              <button
                onClick={() => g({ name: "lookbook" })}
                className="group/navlink relative whitespace-nowrap py-2 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors text-stone-800 hover:text-stone-500"
              >
                <NavLinkLabel>Lookbook</NavLinkLabel>
              </button>
              <button
                onClick={() => g({ name: "journal" })}
                className="group/navlink relative whitespace-nowrap py-2 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors text-stone-800 hover:text-stone-500"
              >
                <NavLinkLabel>Journal</NavLinkLabel>
              </button>
              <button
                onClick={() => g({ name: "about" })}
                className="group/navlink relative whitespace-nowrap py-2 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors text-stone-800 hover:text-stone-500"
              >
                <NavLinkLabel>About</NavLinkLabel>
              </button>
            </div>
          </div>

          <button
            onClick={() => g({ name: "home" })}
            className="justify-self-center px-2 text-center md:px-4"
            aria-label="Atelier Noir home"
          >
            <span className="font-display text-xl tracking-[0.28em] text-stone-900 md:text-2xl">
              ATELIER
            </span>
            <span className="ml-2 align-top text-[9px] font-bold tracking-[0.3em] text-[#B08968]">
              NOIR
            </span>
          </button>

          <div className="flex items-center justify-end gap-1.5 md:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center text-stone-800 transition hover:text-stone-500"
              aria-label="Search"
            >
              <Search size={19} aria-hidden />
            </button>
            <button
              onClick={() => g({ name: "wishlist" })}
              className="relative hidden h-10 w-10 items-center justify-center text-stone-800 transition hover:text-stone-500 sm:flex"
              aria-label={`Wishlist, ${wishlistCount} items`}
            >
              <Heart size={19} aria-hidden />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#9A3B26] px-1 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center text-stone-800 transition hover:text-stone-500"
              aria-label={`Shopping bag, ${cartCount} items`}
            >
              <ShoppingBag size={19} aria-hidden />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-900 px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => g({ name: "account" })}
              className="relative hidden h-10 w-10 items-center justify-center text-stone-800 transition hover:text-stone-500 sm:flex"
              aria-label={
                user ? `Account, signed in as ${user.name}` : "Sign in to your account"
              }
            >
              <User size={19} aria-hidden />
              {user && (
                <span
                  className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#B08968]"
                  aria-hidden
                />
              )}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
