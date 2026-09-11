"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Video with a poster <img> beneath it; fades the video in once it can play,
 * exactly like the original's cover enter/settle behaviour.
 */
export function MediaVideo({
  src,
  poster,
  className = "",
  imgClassName = "",
  alt = "",
  opacityClass = "",
  imgOpacityClass = "",
  eager = false,
}: {
  src: string;
  poster?: string;
  className?: string;
  imgClassName?: string;
  alt?: string;
  opacityClass?: string;
  imgOpacityClass?: string;
  eager?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onPlaying = () => setReady(true);
    v.addEventListener("playing", onPlaying);
    return () => v.removeEventListener("playing", onPlaying);
  }, []);

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload={eager ? "auto" : "metadata"}
        disablePictureInPicture
        className={className}
        style={{ opacity: ready ? 1 : 0 }}
      />
      {poster ? (
        <img
          src={poster}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${imgClassName} ${imgOpacityClass}`}
          style={{ opacity: ready ? 0 : 1 }}
        />
      ) : null}
    </>
  );
}
