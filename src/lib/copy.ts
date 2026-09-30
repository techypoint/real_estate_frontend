/**
 * Shared, load-bearing UI copy.
 *
 * The data-source disclaimer is a factual/legal statement, not decoration:
 * AcreInfotech reproduces what each promoter filed on the relevant state's
 * RERA portal, and performs no verification of its own. That claim was
 * previously hand-written in seven different places with seven slightly
 * different verbs ("verified", "checked against", "approved"), which is how
 * "we show the filing" drifted into "we vouch for the filing". It lives here
 * once so the wording can only change in one place — and so approved legal
 * wording can be dropped in with a one-line edit.
 *
 * Deliberately state-agnostic: today every project is scraped from UP-RERA,
 * but the pipeline is expected to pull other states' RERA portals too, and
 * this text must stay true without an edit when that happens.
 */

/** Canonical disclaimer shown wherever scraped RERA project data appears. */
export const DATA_SOURCE_DISCLAIMER =
  "Project details are reproduced as published on the relevant state RERA portal. " +
  "AcreInfotech does not independently verify them — confirm anything you rely on with " +
  "the promoter and that RERA portal before you transact.";

/**
 * Label for the project hero's registration badge. Deliberately states what
 * the number *is* (a registration on the public register) rather than what we
 * did to it, and deliberately omits a state prefix so it doesn't need
 * touching once non-UP projects are added. The badge also renders without a
 * tick glyph — see `.showcase-badge` in globals.css: a ✓ is a verification
 * claim on its own, whatever words sit next to it.
 */
export const RERA_BADGE_LABEL = "RERA Registration";
