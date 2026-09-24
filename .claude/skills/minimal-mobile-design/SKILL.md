---
name: minimal-mobile-design
description: Bold, mobile-first design language for the UP-RERA real-estate directory (uprera-realestate-server / frontend) — two user-selectable themes, "Arctic Violet" (light, default) and "Mono + Pop" (dark). Use whenever building or restyling any page, component, or piece of UI in this project — tokens, layout rules, component patterns, and a review checklist.
---

# Bold, Mobile-First Design Language

**v3 — full rebuild from a design brief the user gave answer-by-answer**
(supersedes v1/v2 entirely — both were built on assumptions the user
rejected — "I don't like the design, let's start again with basic
principles"). **v4 (2026-08-30)** kept every v3 decision except color: the
brief's "dark-only, Deep Emerald" call was overturned in favor of a real
light/dark toggle — see §1 below. Nothing here is assumed; every decision
traces to an explicit answer. If a new UI question comes up that isn't
answered here, ask the user — don't extrapolate silently, that's what
caused the previous rebuild.

## The brief (source of truth)

- **Direction:** Bold / distinctive — not corporate-quiet, not generic SaaS.
- **No reference site** — original judgment within the brief below.
- **Color (superseded 2026-08-30 — see note below):** dark theme, "Deep
  Emerald" — user picked this from 5 mocked-up options shown as real
  components (header/card/button), not swatches. Dark-only, no light mode.
- **Second accent:** a gold/status token (its literal hue is now themed —
  green-gold on Arctic Violet, white on Mono + Pop, see v4 note above),
  reserved for the one "verified / full detail captured" status signal —
  kept distinct from the brand accent so the two never mean the same thing
  at a glance.
- **Typography:** bold display face + plain simple body face (two distinct
  families, not one family at two weights — user chose the "different
  characterful pairing" option, not the single-family option).
- **Logo:** new mark to be designed (no existing brand asset).
- **Shape language:** sharp & structured — minimal/near-zero corner
  radius everywhere, including chips/pills (no carve-out for "friendly"
  rounded pills — apply the choice consistently).
- **Mobile nav:** bottom tab bar (confirmed explicitly, not assumed).
- **Wide data tables on mobile:** card-per-row (confirmed explicitly).
- **Density:** spacious — generous whitespace, premium/calm pacing, not
  data-dense.
- **Icons:** bold/thick stroke-weight line icons (not thin, not filled).
- **Motion:** rich/expressive — animation is part of the personality, not
  just functional transitions.

---

## 1. Design tokens

### Color — two user-selectable themes (v4 — supersedes dark-only)

**2026-08-30: the "dark-only" decision above is superseded.** The user asked
for a real light/dark toggle, shipped from exactly two named palettes that
had been sitting in the (until-then dev-only) theme-preview tool: **Arctic
Violet** (light) and **Mono + Pop** (dark). Every other palette that tool
carried was deleted outright — these two are the only themes AcreInfotech ships.
Arctic Violet is the **default** for first-time visitors (an explicit
answer, not a guess); Mono + Pop is the opt-in dark theme. A user's choice
persists in `localStorage` (see `components/ThemeToggle.tsx`) and is applied
before first paint via a blocking script, same mechanism the old dev widget
used for `data-theme-preview`, now productionized as `data-theme="dark"` on
`<html>` (no attribute = light/default).

The shape/type/spacing/motion/icon decisions elsewhere in this brief are
unaffected — only the color system gained a second, real palette.

```css
/* :root — Arctic Violet (light, default) */
--bg:            #f7f6fb;
--surface:       #ffffff;
--surface-2:     #ede9f7;
--border:        #e1dcf0;
--border-strong: #cbc2e6;

--text:        #1b1730;
--text-muted:  #6c6591;
--text-faint:  #a49dc4;

--accent:        #7c5cf0; /* violet — links, primary actions, focus */
--accent-strong: #6a48e0; /* hover/active — darker on light, not brighter */
--accent-on:     #ffffff;
--accent-glow:   rgba(124,92,240,.30);

--gold:        #1a9c6b;  /* status accent — "full detail available" ONLY */
--gold-soft:   #e2f5ec;
--gold-strong: #127850;

/* :root[data-theme="dark"] — Mono + Pop (dark, opt-in) */
--bg:            #0a0a0a;
--surface:       #161616;
--surface-2:     #1e1e1e;
--border:        #2c2c2c;
--border-strong: #3a3a3a;

--text:        #f5f5f5;
--text-muted:  #9e9e9e;
--text-faint:  #666666;

--accent:        #d4ff3f; /* acid lime — links, primary actions, focus */
--accent-strong: #e3ff70; /* hover/active — brighter on dark, not darker */
--accent-on:     #0a0a0a;
--accent-glow:   rgba(212,255,63,.30);

--gold:        #ffffff;  /* status accent — "full detail available" ONLY */
--gold-soft:   #242424;
--gold-strong: #ffffff;
```

Rules:
- Accent = brand/action, in whichever hue the active theme defines (violet
  on light, lime on dark). Gold = the one verified-status signal, redefined
  per theme so it stays legible on that theme's surfaces. They never swap
  roles and nothing else on the page uses either token — that's the whole
  reason a second accent exists (accent-on-accent would make "verified"
  invisible as a distinct signal).
- Body text is `--text` or `--text-muted` on `--bg`/`--surface` only.
- Every color used must trace to one of these tokens — **no ad hoc hex**,
  and never branch on `prefers-color-scheme`: the toggle is a manual user
  choice (`data-theme`), not an OS-preference mirror.

### Typography — bold display + plain body, two real families

Self-hosted (woff2 files in `frontend/fonts/`, referenced from
`frontend/css/fonts.css` — no runtime font-CDN dependency, matches the
project's no-external-dependency convention):

- **Display — Archivo Black** (weight 900 only, that's the face). Bold,
  geometric, high-impact. Used *only* for the hero headline, section
  titles, and the biggest stat numbers — sparingly, because it's loud by
  design and loses impact if overused.
- **Body/UI — Public Sans** (400/500/600/700/800, variable font, one file).
  Chosen deliberately, not as a generic default: Public Sans is the
  U.S. Web Design System's typeface — a government-design-system face
  fits a *registry* product thematically, and it has strong tabular-figure
  support for the data-heavy tables/fees/dates throughout the site. Carries
  everything else: labels, body copy, table data, buttons, nav.

```css
--font-display: "Archivo Black", system-ui, sans-serif;
--font-body: "Public Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

Type scale (mobile-first; spacious density means generous line-height, not
a huge scale jump):

| Token | Size | Face | Use |
|---|---|---|---|
| `--text-xs` | 0.75rem | body | meta, captions, table labels |
| `--text-sm` | 0.875rem | body | secondary text, table cells |
| `--text-base` | 1rem | body | body copy, inputs |
| `--text-md` | 1.125rem | body/600 | card titles, panel headings |
| `--text-lg` | 1.5rem | body/700 | section titles |
| `--text-xl` | 2.25rem | **display** | hero headline (mobile), big stat numbers |
| `--text-2xl` | 3.5rem | **display** | hero headline (desktop, `min-width:768px`) |

Numbers that line up in columns (fees, dates, areas, counts) get
`font-variant-numeric: tabular-nums`.

### Spacing — spacious

```css
--sp-1:4px --sp-2:8px --sp-3:12px --sp-4:16px --sp-5:20px --sp-6:24px
--sp-8:32px --sp-10:40px --sp-12:48px --sp-16:64px --sp-20:80px --sp-24:96px
```
Section padding runs generous: hero `--sp-16`–`--sp-24` vertical, cards
`--sp-5`–`--sp-6` internal padding (not the tight `--sp-4` a data-dense
system would use). Space is spent generously on structural/hero areas; the
one place density still matters is inside the card-per-row mobile tables
(376 rows) — those stay compact internally so spaciousness doesn't turn
into endless scrolling.

### Shape — sharp & structured, applied consistently

```css
--radius-xs: 2px;  /* just enough to soften a hard pixel edge */
--radius-sm: 4px;  /* buttons, inputs, cards, chips — the one radius most things use */
--radius-md: 6px;  /* larger panels/sheets, rarely more than this */
```
No `--radius-full` token — chips/badges are small rectangles (`--radius-xs`
or `--radius-sm`), not pills. This was a deliberate, explicit choice
(sharp & structured "including chips/pills, no carve-out") — don't
reintroduce pill shapes for "friendliness."

### Elevation & glow

Dark + bold earns something light-minimal themes can't use well: a colored
glow instead of a neutral shadow, on the handful of elements that should
feel "alive" (primary buttons, focused inputs, the active bottom-nav item).
Neutral shadow still exists for pure depth (sheets, sticky nav).

```css
--shadow-1: 0 1px 2px rgba(0,0,0,.4), 0 16px 32px -14px rgba(0,0,0,.65);
--glow-accent: 0 0 0 1px rgba(52,211,153,.35), 0 8px 24px -6px var(--accent-glow);
```
Use `--glow-accent` on: primary button hover/focus, the active filter
chip, the active bottom-nav icon. Don't put a glow on every card — it's a
highlight, not ambient texture; if everything glows, nothing does.

### Motion — rich/expressive, but purposeful

```css
--ease: cubic-bezier(.16,1,.3,1); /* expo-out — confident, fast-start settle */
--dur-fast: 150ms;
--dur: 300ms;
--dur-slow: 500ms;
```
"Rich" here means a small number of *orchestrated* moments, not motion
sprinkled everywhere (scattered effects read as busier, not more premium):
- **Homepage load-in**: hero heading/copy/search fade+rise in a short
  stagger (~60ms between elements), stat numbers count up from 0 once
  visible.
- **Card hover** (pointer devices only): lift 3px + `--glow-accent` ring.
- **Button press**: scale down slightly (`transform: scale(.96)`), not just
  a color change.
- **Filter sheet**: slide up with `--ease`, scrim fades in parallel.
- **Collapsible detail panels**: smooth open/close height animation (CSS
  grid-rows `0fr → 1fr` technique + a `toggle` event listener keeping the
  native `<details open>` state in sync with the animation), not the
  instant native snap.
- **Ambient hero background**: a slow, subtle accent-tinted radial-gradient
  glow (`--ambient-1`/`--ambient-2`, themed per palette) behind the headline
  — barely animated (very slow drift/pulse, or fully
  static if motion feels like too much once built) — this is the one
  decorative touch, everything else above is functional/responsive to a
  real interaction.
All motion wrapped in `prefers-reduced-motion: no-preference`; the reduced
variant drops straight to end-states, no exceptions.

### Icons — bold/thick stroke

Inline `<svg><symbol>` sprite (self-contained, no icon font/CDN), stroke
width **2.25–2.5** (up from a "thin line" 1.5–1.75) so they carry visual
weight consistent with Archivo Black headlines and the sharp/structured
shape language. `currentColor`, 20×20 viewBox, `stroke-linecap`/`linejoin:
round` (round caps keep a thick stroke from looking clumsy at small sizes
even though corners elsewhere are sharp — this is about stroke ends, not
component shape, no conflict with "sharp & structured").

### Breakpoints — mobile-first (`min-width` only)

```css
@media (min-width: 600px)  { /* sm */ }
@media (min-width: 768px)  { /* md: tablet — display headline steps up, data tables switch card→grid */ }
@media (min-width: 1024px) { /* lg: desktop — bottom nav disappears, header nav takes over */ }
@media (min-width: 1280px) { /* xl: content max-width (1180px) */ }
```

---

## 2. Layout rules

- Bottom tab bar, mobile only (`<1024px`), same contextual-per-page pattern
  as before: Home/Filters/Search on the listing page, Home/Documents/Top on
  detail pages.
- Wide tables (unit/plan inventory: 13 cols × up to 376 rows) render as
  card-per-row below `md` (bold heading from the most identifying
  columns + label:value list), a real sticky-header grid table at `md`+.
  Single CSS-only markup, no duplicate rendering (`data-label` attrs driving
  `::before` content on the mobile card, suppressed at `md`+).
- Filters: bottom sheet on mobile, inline bar at `md`+ — same DOM,
  responsive CSS repurposes it (no duplicate markup/ids).
- Grid item overflow discipline (learned from a real bug last round): any
  grid/flex container holding a wide table needs `min-width: 0` on the
  item itself, and any text that can be a single long unbroken token
  (filenames, long field values) needs `overflow-wrap: anywhere` — verify
  both whenever a new wide/long-content component is added, this is the
  single most likely way to reintroduce horizontal page scroll.

## 2a. Project detail page — information architecture (v2 — supersedes the single-scroll version below)

**The single-scroll, jump-nav, no-tabs version originally in this section is
superseded.** It's kept at the bottom of this section as history/rationale
— the NN/g accordion research is still correct, it just answers a different
question than the one that mattered once the brief changed. Read on for why.

**The brief changed the premise.** The original IA treated the page as one
audience (someone verifying a registry entry) checking multiple sections in
one visit — accordions/tabs hide content that audience needs, so a single
scroll made sense. The revised brief (2026-08-15/16) said the page actually
serves **two different intents**: a buyer deciding whether to be interested
in the project (brochure content — gallery, amenities, floor plans), and
someone verifying the UP-RERA compliance record (documents, bank accounts,
land records). Those aren't sections of one task the way Documents/Units/
Bank-Accounts are to a verifier — they're two different visits with
different goals, which is exactly the case where splitting *does* make
sense (NN/g's objection is to hiding parts of *one* task, not to separating
two distinct ones).

**Two tabs, CSS-only, zero client JS:**
- **Overview** (default) — the buyer-facing showcase. **Legal Data** — the
  UP-RERA record.
- Built from two hidden `<input type="radio" name="dtab">` placed as
  siblings of both `.container` (the tab bar + panels) and `<BottomNav>`,
  with `:checked ~` sibling-combinator CSS doing the panel toggling —
  same zero-JS philosophy as the `<details>` patterns elsewhere on the
  site. `<label for="tab-overview">` elsewhere in the DOM (e.g. inside
  `BottomNav`) still works via native `for`/`id` matching regardless of
  DOM position, which is what lets the mobile bottom-nav carry its own
  Overview/Legal Data tab pair without duplicating the radios.
- Mobile: the two tab labels are the 3rd/4th bottom-nav slots (after Home/
  Browse), replacing the old single "Sections" sheet — there's no separate
  jump-nav or Sections sheet anymore in either tab; each tab is short
  enough on its own that a page-level wayfinding aid stopped earning its
  keep. (Flagged as a real, deliberate departure from the NN/g-driven
  jump-nav guidance below — revisit if either tab grows long again.)
- A project with no captured detail (`has_detail: false`, no RERA sections)
  renders **Overview only** — no tab bar at all, matching the old rule's
  spirit: don't show a switch with nothing to switch to.

**Overview tab — hero + curated sections, real photography leads:**
- Hero uses the project's own lead gallery photo (lowest `order`) as a
  full-bleed background behind a scrim, not the earlier text-only masthead
  — a real photo is the whole point of a showcase page. `--gold` "RERA
  Verified" badge, buyer-relevant facts only (configurations, starting
  price, possession, land parcel — registration number/date moved to the
  Legal Data tab, since those are compliance facts, not sales facts).
  `marketing.highlights` gets its own strip below the hero when present.
  "Download Brochure" / "Enquire Now" buttons render (per an explicit
  answer to "keep visually, wire later") but are genuinely inert — no
  brochure-URL field or lead endpoint exists yet — with a small note saying
  so; never fabricate a working affordance.
- Section order: Gallery → Amenities → Clubhouses → Configurations & Floor
  Plans → Master Plan → Location & Connectivity. Each gets a one-line,
  non-data eyebrow label (static per section id, e.g. "Find your fit" —
  UI copy only, never a project fact) plus the real, data-driven `<h2>`.
- **Gallery**: a curated 3-image teaser (order 1–3: one large + two small)
  leads; the rest sit behind a zero-JS `<details>` "View all N photos."
  `order` is the only curation signal the schema has — a convention, not
  an enforced "featured" flag.
- **Amenities**: column-per-group, however many groups a project has (this
  is *not* a fixed site-wide taxonomy — keep the brochure's own grouping
  verbatim, per the schema's own extraction note). A restricted group gets
  the gold `.badge.tier` ("Iconic owners only", etc.) — same gold token as
  the verified badge, same semantic: this is the one other place gold is
  allowed to appear, and only because it's still a "special/verified-tier"
  signal, not decoration.
- **Configurations & Floor Plans**: a comparison table (reuses `.ptable-*`,
  the same CSS-grid-desktop/card-per-row-mobile primitive the Legal Data
  tables use — one column set, no separate mobile markup), **every unit
  type visible at once**, not a pick-one switcher. A flat chip-picker was
  tried and explicitly rejected once real data showed 8 units across 4
  tower families with no natural "3 tabs" shape. Each row is a native
  `<details>` — click anywhere on the row to expand inline to that unit's
  2D/3D plan + full facts, zero JS for the expand itself; only the 2D/3D
  switch and the image zoom (below) are client leaves.
- **Master Plan / Location & Connectivity**: unchanged single-image +
  (for Location) category-grouped connectivity list — these already fit
  the existing primitives and didn't need new layout work.

**Legal Data tab** — unchanged in spirit from the original IA: same 6
merged sections (Documents, Unit/Plan Inventory, Promoter, Bank Accounts,
Land & Legal Records, Agents/Works/Agreements), same `.section-block` /
`.subsection` sub-block pattern, still no accordions within it — this is
still the "one audience checking multiple sections in one visit" case the
original NN/g research describes, it's just no longer sharing a scroll
with the buyer-facing content. Gets its own small intro block (`.legal-head`)
with the registration facts moved out of the Overview hero.

### Original v1 rationale (kept for the "why accordions are wrong" reasoning)

The site-wide accordion pattern used on the detail page (v1–v3) was rejected
after research: Nielsen Norman Group's finding is that accordions measurably
hurt discoverability and are only appropriate when a user needs just **one**
section — this still holds *within* the Legal Data tab, and is why neither
tab uses accordions internally. Source:
[nngroup.com/articles/accordions-complex-content](https://www.nngroup.com/articles/accordions-complex-content/).
The jump-nav / jump-to-section wayfinding this section originally specified
was removed when the page split into two shorter tabs (see above) — the
sticky jump-nav CSS and `JumpNav`/`SectionsSheet` components were deleted
outright, not left dead.

## 2b. Click-to-zoom images (every content photo/plan)

Every content image on the detail page — gallery, master plan, location
map, clubhouse photos, unit floor plans (2D and 3D) — opens a fullscreen
viewer on click, via one shared pair of components
(`ZoomableImage`/`ZoomStage`, `real_estate_frontend/src/components/sections/`):

- Thumbnail is a `<button class="zoomable">` wrapping the `next/image`,
  with a `.zoom-hint` (search icon) that fades in on hover / stays visible
  on touch. **`draggable={false}` on every thumbnail `<img>` is load-
  bearing, not decoration** — browsers start a native image-drag on
  mousedown+the smallest move by default, which silently swallows the
  click that should have opened the viewer. This was a real reported bug
  ("click gets cut") before the fix; any new image component must keep it.
- The viewer: +/− buttons, scroll-wheel zoom, double-click to toggle,
  drag-to-pan once zoomed, two-finger pinch, Escape/backdrop-click to
  close. No CSS transition on the zoomed `<img>` — a drag or pinch has to
  track the pointer 1:1, easing would make it lag.
- The **gallery only** additionally gets prev/next chevrons + a position
  counter ("3 / 26"), because it's the one place with more than one photo
  to page through — master plan/location/a clubhouse photo are always
  single images, so `ZoomableImage` alone (no nav) is correct for them.
  This is why the gallery is its own client component (`Gallery.tsx`)
  instead of N independent `ZoomableImage`s: prev/next needs one shared
  "which index is open" state across every thumbnail.
- The overlay renders the **raw source URL** in a plain `<img>`, not
  another `next/image` — zooming is about seeing the asset's real
  resolution, not whatever crop the inline thumbnail's `next/image`
  picked.

## 3. Review checklist

1. Every color used traces to a token above — no ad hoc hex values.
2. Radius used is `--radius-xs/sm/md` only — no pill/full-round shapes
   anywhere, including new chip/badge components.
3. Gold appears *only* on a verified/special-tier signal (the detail badge,
   `.badge.tier` for a restricted amenity/club group) — never as decoration
   or a third brand color.
4. Display face (Archivo Black) used sparingly — hero + section titles +
   big numbers only, never body copy or table data.
5. New icon uses stroke-width in the 2.25–2.5 range, not thin.
6. Any new animation wrapped in `prefers-reduced-motion: no-preference`?
7. Any new wide/long-content component checked against the grid-blowout /
   unbroken-token overflow bug above?
8. Base CSS still written mobile-first (`min-width` layering only)?
9. New clickable `<img>`/thumbnail sets `draggable={false}` (+ the
   `-webkit-user-drag:none` CSS backstop) — otherwise a real click can
   start a native image-drag and the click never fires. See 2b.
10. A new multi-instance interactive picker (tabs, a chip row, a gallery)
    checked whether it needs *one* shared piece of state across instances
    (like the gallery's prev/next) before reaching for N independent
    copies of a single-item component.
