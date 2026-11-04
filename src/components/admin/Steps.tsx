import { Icon } from "@/components/IconSprite";

/** One publishing step's state — done (check) or still to do (open). */
export function StepPill({ done, label, strong = false }: { done: boolean; label: string; strong?: boolean }) {
  return (
    <span className={`adm-pill${done ? " is-done" : ""}${strong ? " is-strong" : ""}`}>
      {done ? <Icon name="check" className="icon" /> : <span className="adm-dot" aria-hidden="true" />}
      {label}
    </span>
  );
}

type StepState = {
  has_detail?: boolean;
  hasBrochure: boolean;
  hasArea: boolean;
  hasContent: boolean;
  published: boolean;
  live: boolean;
};

/**
 * The one thing to do next, in pipeline order. Detail + brochure decide
 * whether the project is live; area and content are what make its page
 * good once it is.
 */
export function nextStep(s: StepState): string {
  if (!s.has_detail) return "Next: capture the RERA detail page with the browser extension.";
  if (!s.hasBrochure) return "Next: find or upload the brochure (buttons arrive in phase 2) — needed to go live.";
  if (!s.hasArea) return "Next: set the area.";
  if (!s.hasContent) return "Next: generate the brochure content (phase 2).";
  if (!s.published) return "Next: review and publish the content.";
  return s.live ? "Live — nothing to do." : "All steps done.";
}
