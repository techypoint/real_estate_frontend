"use client";

import { useState } from "react";
import type { MediaRef } from "@/lib/types";
import { ZoomableImage } from "./ZoomableImage";

/**
 * 2D / 3D switch for one unit's floor plan.
 *
 * A client leaf, per the performance budget — the 2D/3D switch and the
 * zoom-to-fullscreen inside ZoomableImage are the only interactive parts of
 * a row. Everything around them (areas, prices, wings, notes, and the
 * row's own expand/collapse) is server-rendered and ships no JS.
 *
 * Both tabs render for every unit so the contract is visible and testable. 3D
 * is deliberately optional: builder brochures contain 2D plans only, so gating
 * publication on 3D would gate the entire catalogue. When a 3D asset is later
 * inserted into media.plan_3d, this fills in with no code change.
 */
export function PlanViewer({
  plan2d,
  plan3d,
  tourUrl,
  unitName,
}: {
  plan2d: MediaRef[];
  plan3d: MediaRef[];
  tourUrl?: string;
  unitName: string;
}) {
  const [view, setView] = useState<"2d" | "3d">("2d");
  const views = [
    { id: "2d" as const, label: "2D Plan", media: plan2d },
    { id: "3d" as const, label: "3D Plan", media: plan3d },
  ];
  const active = views.find((v) => v.id === view)!;

  return (
    <div className="plan-viewer">
      <div className="plan-view-toggle" role="group" aria-label="Plan view">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            className="plan-view-btn"
            aria-pressed={view === v.id}
            data-empty={v.media.length === 0 ? "true" : undefined}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="plan-pane">
        {active.media.length ? (
          active.media.map((m, i) => (
            <figure className="plan-figure" key={m.url ?? i}>
              <ZoomableImage m={m} alt={m.alt || `${active.label} — ${unitName}`} sizes="(min-width: 900px) 620px, 100vw" />
              {m.label && <figcaption>{m.label}</figcaption>}
            </figure>
          ))
        ) : (
          <div className="plan-empty">
            <svg className="icon" aria-hidden="true">
              <use href="#icon-cube" />
            </svg>
            <span>3D plan not yet available for this configuration.</span>
          </div>
        )}
      </div>

      {tourUrl && (
        <a className="plan-tour" href={tourUrl} target="_blank" rel="noopener noreferrer">
          Open 360° tour
        </a>
      )}
    </div>
  );
}
