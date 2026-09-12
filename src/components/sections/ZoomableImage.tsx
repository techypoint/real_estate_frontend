"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MediaRef } from "@/lib/types";
import { Icon } from "@/components/IconSprite";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const STEP = 0.5;

/**
 * Click-to-zoom wrapper for a single, standalone image (master plan,
 * location map, a clubhouse photo, a unit floor plan). The gallery has its
 * own trigger markup (Gallery.tsx, for the prev/next case) but both open the
 * same ZoomStage overlay below.
 *
 * `draggable={false}` on the thumbnail matters more than it looks: browsers
 * start a native image drag on mousedown+move by default, which swallows
 * the click that would have opened the overlay — the fix for "clicking the
 * image doesn't always open it."
 */
export function ZoomableImage({
  m,
  alt,
  sizes,
  fill,
  priority,
}: {
  m: MediaRef;
  alt: string;
  sizes: string;
  fill?: boolean;
  priority?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!m.url) return null;

  return (
    <>
      <button type="button" className="zoomable" onClick={() => setOpen(true)} aria-label={`Open ${alt}`}>
        {fill ? (
          <Image src={m.url} alt={alt} fill sizes={sizes} loading={priority ? undefined : "lazy"} draggable={false} />
        ) : (
          <Image
            src={m.url}
            alt={alt}
            width={m.width ?? 1200}
            height={m.height ?? 1600}
            sizes={sizes}
            loading={priority ? undefined : "lazy"}
            draggable={false}
          />
        )}
        <span className="zoom-hint" aria-hidden="true">
          <Icon name="search" className="icon icon-sm" />
        </span>
      </button>

      {open && <ZoomStage url={m.url} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}

function clamp(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(scale * 100) / 100));
}

function touchDistance(a: React.Touch, b: React.Touch): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

/**
 * The fullscreen viewer: +/- buttons, scroll-wheel zoom, double-click to
 * toggle, drag-to-pan once zoomed in, basic two-finger pinch, and optional
 * prev/next (only the gallery passes those — a master plan or a single
 * clubhouse photo has nothing to page through). Renders the raw source URL,
 * not another next/image — the point of zooming is the asset's real
 * resolution, not whatever crop the inline thumbnail picked.
 *
 * Zoom/pan resets on every `url` change so paging to the next photo never
 * carries over the previous one's zoom level.
 */
export function ZoomStage({
  url,
  alt,
  onClose,
  onPrev,
  onNext,
  counter,
}: {
  url: string;
  alt: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  counter?: string;
}) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragOrigin = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const pinchDist = useRef<number | null>(null);

  useEffect(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, [url]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && onPrev) onPrev();
      else if (e.key === "ArrowRight" && onNext) onNext();
      else if (e.key === "+" || e.key === "=") zoomBy(STEP);
      else if (e.key === "-") zoomBy(-STEP);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, onPrev, onNext]);

  function zoomBy(delta: number) {
    setScale((s) => {
      const next = clamp(s + delta);
      if (next === MIN_SCALE) setPos({ x: 0, y: 0 });
      return next;
    });
  }

  function reset() {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? STEP : -STEP);
  }

  function onDoubleClick() {
    if (scale > 1) reset();
    else setScale(2.5);
  }

  function onPointerDown(e: React.PointerEvent<HTMLImageElement>) {
    if (scale <= 1) return;
    dragOrigin.current = { x: pos.x, y: pos.y, startX: e.clientX, startY: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLImageElement>) {
    if (!dragOrigin.current) return;
    setPos({
      x: dragOrigin.current.x + (e.clientX - dragOrigin.current.startX),
      y: dragOrigin.current.y + (e.clientY - dragOrigin.current.startY),
    });
  }
  function onPointerUp() {
    dragOrigin.current = null;
  }

  function onTouchStart(e: React.TouchEvent<HTMLImageElement>) {
    if (e.touches.length === 2) pinchDist.current = touchDistance(e.touches[0], e.touches[1]);
  }
  function onTouchMove(e: React.TouchEvent<HTMLImageElement>) {
    if (e.touches.length === 2 && pinchDist.current) {
      e.preventDefault();
      const d = touchDistance(e.touches[0], e.touches[1]);
      setScale((s) => clamp(s * (d / pinchDist.current!)));
      pinchDist.current = d;
    }
  }
  function onTouchEnd(e: React.TouchEvent<HTMLImageElement>) {
    if (e.touches.length < 2) pinchDist.current = null;
  }

  return (
    <div className="zoom-overlay" role="dialog" aria-modal="true" aria-label={alt} onClick={onClose} onWheel={onWheel}>
      {counter && <div className="zoom-counter">{counter}</div>}

      <div className="zoom-toolbar" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => zoomBy(-STEP)} aria-label="Zoom out" disabled={scale <= MIN_SCALE}>
          −
        </button>
        <span className="zoom-pct">{Math.round(scale * 100)}%</span>
        <button type="button" onClick={() => zoomBy(STEP)} aria-label="Zoom in" disabled={scale >= MAX_SCALE}>
          +
        </button>
        {scale > 1 && (
          <button type="button" className="zoom-reset" onClick={reset}>
            Reset
          </button>
        )}
      </div>

      <button type="button" className="zoom-close" aria-label="Close" onClick={onClose}>
        <Icon name="x" />
      </button>

      {onPrev && (
        <button
          type="button"
          className="zoom-nav zoom-prev"
          aria-label="Previous photo"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          <Icon name="chevron-left" />
        </button>
      )}
      {onNext && (
        <button
          type="button"
          className="zoom-nav zoom-next"
          aria-label="Next photo"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          <Icon name="chevron-right" />
        </button>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element -- full-resolution source, deliberately not next/image */}
      <img
        src={url}
        alt={alt}
        className="zoom-img"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, cursor: scale > 1 ? "grab" : "zoom-in" }}
        draggable={false}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={onDoubleClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />
    </div>
  );
}
