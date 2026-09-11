"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  ACCESSORIES_CATEGORIES,
  MEN_CATEGORIES,
  WOMEN_CATEGORIES,
} from "@/lib/site-data";
import { useStore } from "@/lib/store";

export function MobileMenu() {
  const mobileMenuOpen = useStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useStore((s) => s.setMobileMenuOpen);
  const navigate = useStore((s) => s.navigate);

  const g = (r: Parameters<typeof navigate>[0]) => () => navigate(r);

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto bg-white p-0">
        <SheetTitle className="border-b border-stone-100 px-6 py-5 font-display text-lg tracking-[0.25em]">
          ATELIER <span className="text-[#B08968]">NOIR</span>
        </SheetTitle>
        <div className="px-6 py-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="women" className="border-stone-100">
              <AccordionTrigger className="text-[12px] font-semibold uppercase tracking-[0.25em]">
                Women
              </AccordionTrigger>
              <AccordionContent>
                {WOMEN_CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={g({ name: "shop", gender: "women", category: c.key, title: c.label })}
                    className="block py-2 text-[15px] text-stone-600"
                  >
                    {c.label}
                  </button>
                ))}
                <button
                  onClick={g({ name: "shop", gender: "women", title: "Women" })}
                  className="block py-2 text-[15px] font-semibold text-stone-900"
                >
                  Shop All Women
                </button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="men" className="border-stone-100">
              <AccordionTrigger className="text-[12px] font-semibold uppercase tracking-[0.25em]">
                Men
              </AccordionTrigger>
              <AccordionContent>
                {MEN_CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={g({ name: "shop", gender: "men", category: c.key, title: c.label })}
                    className="block py-2 text-[15px] text-stone-600"
                  >
                    {c.label}
                  </button>
                ))}
                <button
                  onClick={g({ name: "shop", gender: "men", title: "Men" })}
                  className="block py-2 text-[15px] font-semibold text-stone-900"
                >
                  Shop All Men
                </button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="acc" className="border-stone-100">
              <AccordionTrigger className="text-[12px] font-semibold uppercase tracking-[0.25em]">
                Accessories
              </AccordionTrigger>
              <AccordionContent>
                {ACCESSORIES_CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={g({ name: "shop", gender: "all", category: c.key, title: c.label })}
                    className="block py-2 text-[15px] text-stone-600"
                  >
                    {c.label}
                  </button>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-4 flex flex-col border-t border-stone-100 pt-4">
            {[
              { label: "New Arrivals", r: { name: "shop" as const, tag: "new", title: "New Arrivals" } },
              { label: "Bestsellers", r: { name: "shop" as const, tag: "bestsellers", title: "Bestsellers" } },
              { label: "The Sale", r: { name: "shop" as const, sale: true, title: "The Sale" }, accent: true },
              { label: "The Lookbook", r: { name: "lookbook" as const } },
              { label: "Journal", r: { name: "journal" as const } },
              { label: "About Us", r: { name: "about" as const } },
              { label: "Contact", r: { name: "contact" as const } },
              { label: "Help & FAQ", r: { name: "faq" as const } },
              { label: "Wishlist", r: { name: "wishlist" as const } },
              { label: "Account", r: { name: "account" as const } },
            ].map((l) => (
              <button
                key={l.label}
                onClick={g(l.r)}
                className={`py-2.5 text-left text-[12px] font-semibold uppercase tracking-[0.25em] ${
                  "accent" in l && l.accent ? "text-[#9A3B26]" : "text-stone-800"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
