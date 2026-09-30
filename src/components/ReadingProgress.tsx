"use client";

import { useEffect, useRef } from "react";

/**
 * Thin progress bar showing how far through the article the reader is.
 *
 * Client Component — there is no CSS-only way to read scroll position. Kept as
 * cheap as it can be: one passive scroll listener, coalesced to one write per
 * animation frame, writing a single CSS custom property so the bar is repainted
 * by the browser rather than re-rendered by React.
 *
 * Under `prefers-reduced-motion: reduce` the effect bails out before attaching
 * anything, leaving `--progress` at its CSS default of 0 — the bar scales to
 * zero width and is simply never seen. A bar that tracks scroll position IS the
 * motion, so there is nothing subtler to degrade to; the reader loses only a
 * decorative cue.
 */
export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      // A page shorter than the viewport has nothing to progress through;
      // without this guard the division yields Infinity.
      const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      bar.style.setProperty("--progress", String(ratio));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div ref={ref} className="reading-progress" aria-hidden="true" />;
}
