"use client";

import { useEffect, useState } from "react";

/**
 * Full-screen preloader seen on first paint — brand mark with a loading rule.
 */
export function Preloader() {
  const [phase, setPhase] = useState<"loading" | "fading" | "gone">("loading");

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("fading"), 900);
    const t2 = window.setTimeout(() => setPhase("gone"), 1500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      data-preloader
      role="status"
      aria-label="Atelier Noir is loading"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white/95 transition-opacity duration-700 ease-[cubic-bezier(0.33,0,0.2,1)] motion-reduce:transition-none ${
        phase === "fading" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <span className="sr-only">Loading</span>
      <div
        aria-hidden
        className="flex select-none flex-col items-center gap-6 transition-opacity duration-700 ease-out motion-reduce:transition-none"
      >
        <p className="font-display text-sm tracking-[0.22em] text-stone-900 transition-all duration-700 ease-out motion-reduce:transition-none">
          ATELIER
          <span className="ml-2 align-top text-[9px] font-bold tracking-[0.3em] text-[#B08968]">
            NOIR
          </span>
        </p>
        <div className="h-px w-24 overflow-hidden bg-stone-200">
          <div
            className={`h-full w-full origin-left bg-stone-900 transition-transform duration-1000 ease-out motion-reduce:transition-none ${
              phase === "loading" ? "scale-x-0" : "scale-x-100"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
