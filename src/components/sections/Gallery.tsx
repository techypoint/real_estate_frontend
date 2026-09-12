"use client";

import Image from "next/image";
import { useState } from "react";
import type { MediaRef } from "@/lib/types";
import { Icon } from "@/components/IconSprite";
import { ZoomStage } from "./ZoomableImage";

/**
 * The gallery is one client component, not N independent ZoomableImages,
 * because prev/next navigation needs one shared "which index is open" state
 * across every thumbnail — the teaser trio and the 20-odd photos behind
 * "View all" alike.
 */
export function Gallery({ items }: { items: MediaRef[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [big, ...rest0] = items;
  const [smallA, smallB, ...rest] = rest0;
  const current = openIndex !== null ? items[openIndex] : null;

  return (
    <>
      <div className="gallery-teaser">
        <Teaser m={big} idx={0} className="g big" onOpen={setOpenIndex} />
        {smallA && <Teaser m={smallA} idx={1} className="g" onOpen={setOpenIndex} />}
        {smallB && <Teaser m={smallB} idx={2} className="g" onOpen={setOpenIndex} />}
      </div>

      {rest.length > 0 && (
        <details className="gallery-more">
          <summary>View all {items.length} photos</summary>
          <div className="media-grid">
            {rest.map((m, i) => (
              <figure key={m.url ?? i}>
                <GridThumb m={m} idx={i + 3} onOpen={setOpenIndex} />
                {(m.caption || m.label) && <figcaption>{m.caption || m.label}</figcaption>}
              </figure>
            ))}
          </div>
        </details>
      )}

      {current?.url && openIndex !== null && (
        <ZoomStage
          url={current.url}
          alt={current.alt || current.label || ""}
          onClose={() => setOpenIndex(null)}
          onPrev={items.length > 1 ? () => setOpenIndex((i) => ((i ?? 0) - 1 + items.length) % items.length) : undefined}
          onNext={items.length > 1 ? () => setOpenIndex((i) => ((i ?? 0) + 1) % items.length) : undefined}
          counter={items.length > 1 ? `${openIndex + 1} / ${items.length}` : undefined}
        />
      )}
    </>
  );
}

function Teaser({
  m,
  idx,
  className,
  onOpen,
}: {
  m?: MediaRef;
  idx: number;
  className: string;
  onOpen: (i: number) => void;
}) {
  if (!m?.url) return null;
  return (
    <div className={className}>
      <button type="button" className="zoomable" onClick={() => onOpen(idx)} aria-label={`Open ${m.alt || m.label || "photo"}`}>
        <Image src={m.url} alt={m.alt || m.label || ""} fill sizes="(min-width:768px) 50vw, 92vw" draggable={false} />
        <span className="zoom-hint" aria-hidden="true">
          <Icon name="search" className="icon icon-sm" />
        </span>
      </button>
      {(m.caption || m.label) && <div className="cap">{m.caption || m.label}</div>}
    </div>
  );
}

function GridThumb({ m, idx, onOpen }: { m: MediaRef; idx: number; onOpen: (i: number) => void }) {
  if (!m.url) return null;
  return (
    <button type="button" className="zoomable" onClick={() => onOpen(idx)} aria-label={`Open ${m.alt || m.label || "photo"}`}>
      <Image
        src={m.url}
        alt={m.alt || m.label || ""}
        width={m.width ?? 480}
        height={m.height ?? 340}
        sizes="(min-width:1024px) 300px, (min-width:600px) 45vw, 92vw"
        loading="lazy"
        draggable={false}
      />
      <span className="zoom-hint" aria-hidden="true">
        <Icon name="search" className="icon icon-sm" />
      </span>
    </button>
  );
}
