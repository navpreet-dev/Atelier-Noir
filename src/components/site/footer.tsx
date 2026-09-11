"use client";

import { useState } from "react";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { toast } from "sonner";
import {
  ACCESSORIES_CATEGORIES,
  MEN_CATEGORIES,
  WOMEN_CATEGORIES,
} from "@/lib/site-data";
import { useStore } from "@/lib/store";

export function SiteFooter() {
  const navigate = useStore((s) => s.navigate);
  const [email, setEmail] = useState("");

  const s =
    (r: Parameters<typeof navigate>[0]) =>
    () =>
      navigate(r);

  const women = WOMEN_CATEGORIES.slice(0, 5).map((c) => ({
    label: c.label,
    onClick: s({ name: "shop", gender: "women", category: c.key, title: c.label }),
  }));
  const men = MEN_CATEGORIES.slice(0, 5).map((c) => ({
    label: c.label,
    onClick: s({ name: "shop", gender: "men", category: c.key, title: c.label }),
  }));
  const acc = ACCESSORIES_CATEGORIES.map((c) => ({
    label: c.label,
    onClick: s({ name: "shop", gender: "all", category: c.key, title: c.label }),
  }));

  const col = (title: string, links: { label: string; onClick: () => void }[]) => (
    <div>
      <h4 className="mb-4 text-[11px] font-semibold tracking-[0.3em] text-stone-400 uppercase">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <button onClick={l.onClick} className="text-sm text-stone-600 transition hover:text-white">
              {l.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="mt-auto bg-stone-900 text-stone-300">
      <div className="border-b border-stone-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-14 text-center lg:flex-row lg:justify-between lg:text-left">
          <div>
            <h3 className="font-display text-2xl text-white md:text-3xl">Join the Atelier List</h3>
            <p className="mt-2 max-w-md text-sm text-stone-400">
              First looks, private sales and 10% off your first order. One considered email a week —
              never more.
            </p>
          </div>
          <form
            className="flex w-full max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                toast.success("Welcome to the Atelier", {
                  description:
                    "You are on the list — expect first looks, private sales and 10% off your first order.",
                });
                setEmail("");
              } else {
                toast.error("Please enter a valid email address");
              }
            }}
          >
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 min-w-0 flex-1 border border-stone-700 bg-stone-800/50 px-4 text-sm text-white placeholder:text-stone-500 focus:border-stone-400 focus:outline-none"
            />
            <button
              type="submit"
              className="h-12 bg-white px-6 text-[11px] font-semibold tracking-[0.25em] text-stone-900 uppercase transition hover:bg-stone-200"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-14 md:grid-cols-3 lg:grid-cols-5 lg:px-10">
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <p className="font-display text-xl tracking-[0.28em] text-white">ATELIER</p>
          <p className="-mt-0.5 text-[10px] font-bold tracking-[0.4em] text-[#B08968]">NOIR</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-400">
            Considered clothing for a considered life. Cut in small runs from responsible materials,
            built to be repaired — never replaced.
          </p>
          <div className="mt-6 flex gap-3">
            {[
              { label: "Instagram", Icon: Instagram },
              { label: "Facebook", Icon: Facebook },
              { label: "Twitter", Icon: Twitter },
              { label: "YouTube", Icon: Youtube },
            ].map(({ label, Icon }) => (
              <button
                key={label}
                aria-label={label}
                onClick={() =>
                  toast.info(`${label} — coming soon`, {
                    description: "We are not on socials just yet. Join the list instead.",
                  })
                }
                className="flex h-9 w-9 items-center justify-center border border-stone-700 text-stone-400 transition hover:border-white hover:text-white"
              >
                <Icon size={16} aria-hidden />
              </button>
            ))}
          </div>
        </div>
        {col("Shop Women", women)}
        {col("Shop Men", men)}
        {col("Accessories", acc)}
        {col(
          "Maison",
          [
            { label: "About Us", r: { name: "about" as const } },
            { label: "The Lookbook", r: { name: "lookbook" as const } },
            { label: "Journal", r: { name: "journal" as const } },
            { label: "Contact", r: { name: "contact" as const } },
            { label: "Help & FAQ", r: { name: "faq" as const } },
            { label: "Wishlist", r: { name: "wishlist" as const } },
          ].map((l) => ({ label: l.label, onClick: s(l.r) }))
        )}
      </div>

      <div className="border-t border-stone-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-[12px] text-stone-500 md:flex-row lg:px-10">
          <p>© {new Date().getFullYear()} Atelier Noir. All rights reserved. A fiction, lovingly crafted.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Shipping</span>
            <div className="flex items-center gap-2 text-stone-400">
              {["VISA", "MC", "AMEX", "PAYPAL"].map((p) => (
                <span key={p} className="border border-stone-700 px-2 py-1 text-[10px] font-semibold tracking-wider">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
