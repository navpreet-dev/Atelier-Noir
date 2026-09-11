"use client";

import { useEffect, useRef, useState } from "react";

const PRELOADED_KEY = "atelier-noir:preloaded";

/**
 * Full-screen preloader seen on first paint — brand mark with a loading rule.
 * Shown once per browser session (sessionStorage flag), then skipped.
 */
export function Preloader() {
  const [phase, setPhase] = useState<"loading" | "exit" | "done">("loading");
  const [started, setStarted] = useState(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = !!window.sessionStorage.getItem(PRELOADED_KEY);
    } catch {
      seen = false;
    }
    if (seen) {
      const raf = requestAnimationFrame(() => setPhase("done"));
      return () => cancelAnimationFrame(raf);
    }
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setStarted(true))
    );
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;
    const ms = reducedRef.current ? 300 : 900;
    const t = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(PRELOADED_KEY, "1");
      } catch {}
      setPhase("exit");
    }, ms);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "exit") return;
    const t = window.setTimeout(
      () => setPhase("done"),
      reducedRef.current ? 50 : 950
    );
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "done") return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = prev;
    };
  }, [phase]);

  if (phase === "done") return null;

  const trackingClass =
    phase === "exit"
      ? "tracking-[0.42em]"
      : started
        ? "tracking-[0.3em]"
        : "tracking-[0.22em]";

  return (
    <div
      data-preloader=""
      role="status"
      aria-label="Atelier Noir is loading"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white/95 transition-opacity duration-s] ease-[cubic-bezier(0.33,0,0.2,1)] motion-reduce:transition-none ${
        phase === "exit" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <span className="sr-only">Loading</span>
      <div
        aria-hidden="true"
        className={`flex select-none flex-col items-center gap-6 transition-opacity duration-s] ease-out motion-reduce:transition-none ${
          phase === "exit" ? "opacity-0" : "opacity-100"
        }`}
      >
        <p
          className={`font-display text-sm text-stone-900 transition-all duration-700 ease-out motion-reduce:transition-none ${trackingClass}`}
        >
          ATELIER
          <span className="ml-2 align-top text-[9px] font-bold tracking-[0.3em] text-[#B08968]">
            NOIR
          </span>
        </p>
        <div className="h-px w-24 overflow-hidden bg-stone-200">
          <div
            className={`h-full w-full origin-left bg-stone-900 transition-transform duration-s] ease-out motion-reduce:transition-none ${
              started ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
