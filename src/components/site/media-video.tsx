"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Video with a poster <img> cover on top.
 * The cover fades in (cover-enter) and settles (cover-settle blur);
 * once the video is actually playing the cover fades out, revealing it.
 * If playback stalls/pauses, the cover comes back.
 */
export function MediaVideo({
  src,
  poster,
  className = "",
  coverClassName = "",
  alt = "",
  onVideoRef,
}: {
  src: string;
  poster?: string;
  className?: string;
  coverClassName?: string;
  alt?: string;
  onVideoRef?: (video: HTMLVideoElement | null) => void;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [showCover, setShowCover] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    let stalledTimer: number | undefined;

    const ensurePlay = () => {
      if (video.paused) {
        try {
          const p = video.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } catch {}
      }
    };

    const clearStalled = () => {
      if (stalledTimer !== undefined) {
        window.clearTimeout(stalledTimer);
        stalledTimer = undefined;
      }
    };

    const onWaiting = () => {
      clearStalled();
      ensurePlay();
      stalledTimer = window.setTimeout(() => {
        if (video.paused || video.ended || video.readyState < 3) {
          setShowCover(true);
          ensurePlay();
        } else {
          setShowCover(false);
        }
      }, 4000);
    };

    const listeners: Array<
      [EventTarget, string, EventListener, (AddEventListenerOptions | boolean)?]
    > = [
      [
        video,
        "playing",
        () => {
          clearStalled();
          setPlaying(true);
          setShowCover(false);
        },
      ],
      [video, "play", () => setPlaying(true)],
      [
        video,
        "pause",
        () => {
          clearStalled();
          setShowCover(true);
          window.setTimeout(() => {
            if (video.paused) ensurePlay();
          }, 250);
        },
      ],
      [video, "waiting", onWaiting],
      [video, "stalled", onWaiting],
      [video, "ended", ensurePlay],
      [video, "canplay", ensurePlay],
      [video, "loadeddata", ensurePlay],
      [
        document,
        "visibilitychange",
        () => {
          if (!document.hidden) ensurePlay();
        },
      ],
      [window, "touchend", ensurePlay, { passive: true }],
      [window, "click", ensurePlay],
      [window, "pointerdown", ensurePlay],
      [window, "keydown", ensurePlay],
      [window, "wheel", ensurePlay, { passive: true }],
    ];
    listeners.forEach(([el, ev, fn, opts]) => el.addEventListener(ev, fn, opts));

    const t0 = window.setTimeout(() => {
      if (!video.paused) {
        setPlaying(true);
        setShowCover(false);
      }
    }, 0);
    const t1 = window.setTimeout(() => setMounted(true), 100);
    ensurePlay();
    const interval = window.setInterval(() => {
      if (video.paused) {
        setShowCover(true);
        ensurePlay();
      } else {
        setPlaying(true);
        setShowCover(false);
      }
    }, 1500);

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      clearStalled();
      window.clearInterval(interval);
      listeners.forEach(([el, ev, fn, opts]) =>
        el.removeEventListener(ev, fn, opts)
      );
    };
  }, [src]);

  return (
    <>
      <video
        ref={(el) => {
          ref.current = el;
          if (el) el.muted = true;
          onVideoRef?.(el);
        }}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        className={`${className} transition-opacity duration-[2000ms]`}
        style={{ opacity: !mounted || (showCover && playing) ? 0 : undefined }}
      />
      {poster ? (
        <img
          src={poster}
          alt={alt}
          aria-hidden={alt === "" || undefined}
          fetchPriority="high"
          className={`animate-cover-enter animate-cover-settle pointer-events-none absolute inset-0 transition-opacity duration-[2000ms] ${coverClassName}`}
          style={{ opacity: showCover ? undefined : 0 }}
        />
      ) : null}
    </>
  );
}
