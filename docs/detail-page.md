# Project detail page — build log

`real_estate_frontend/src/app/project/[reg]/page.tsx` and its section
components. This is the status of that page as of 2026-08-16 — what's
built, what decisions it encodes, and what's explicitly still missing. See
`.claude/skills/minimal-mobile-design/SKILL.md` §2a/§2b for the *design
rules* this page follows; this doc is the *build record* — what was tried,
what shipped, and why.

Reference project throughout: **ACE Mahagun Medalleo** (`UPRERAPRJ125561`)
— the one project with real curated content today.

---

## Architecture: two tabs, not one scroll

The page is **Overview** (buyer-facing showcase) and **Legal Data** (UP-RERA
compliance record), not a single long scroll. This was a deliberate reversal
of the original single-scroll IA (see SKILL.md §2a for the full NN/g-based
reasoning on why splitting *these two* is different from the accordion
pattern that was rejected before).

- Zero client JS: two hidden `<input type="radio" name="dtab">` + CSS
  `:checked ~` sibling combinators toggle `.tab-panel-overview` /
  `.tab-panel-legal`. `<label for="tab-overview">` in the mobile
  `BottomNav` works via plain `for`/`id` matching regardless of DOM
  position — no shared component needed between the top tab bar and the
  bottom-nav's tab pair.
- No tab bar at all when a project has no RERA detail (`has_detail: false`)
  — Overview renders alone, same as before.
- The old jump-nav (`JumpNav.tsx`, sticky section links + mobile "Sections"
  sheet) is **deleted**, not dead code — each tab is short enough alone
  that it stopped earning its keep once the page split.

## Overview tab

**Hero** — full-bleed background using the project's own lead gallery photo
(lowest `order` value; there's no `featured` flag in the schema, this is a
convention). Gold "RERA Verified · UPRERAPRJ125561" badge, buyer-relevant
facts only (Configurations, Starting from, Possession, Land parcel).
`marketing.highlights` renders as a strip below the hero. "Download
Brochure" / "Enquire Now" buttons render but are **inert** — see Known gaps.

**Section order:** Gallery → Amenities → Clubhouses → Configurations &
Floor Plans → Master Plan → Location & Connectivity. Each carries a static,
non-data eyebrow label (`SECTION_EYEBROW` in `page.tsx`) plus its real
`<h2>`.

| Section | Component | Layout |
|---|---|---|
| Gallery | `Gallery.tsx` | Curated 3-photo teaser (order 1–3) + zero-JS `<details>` "View all N photos" for the rest. Client component — see Lightbox below for why. |
| Amenities | `ContentSections.tsx` → `AmenitiesSection` | Column-per-group (`.amenity-groups`), however many groups the project has — not a fixed taxonomy. Gold `.badge.tier` on a restricted group ("Iconic owners only"). |
| Clubhouses | `ContentSections.tsx` → `ClubsSection` | Card-per-club (`.mini-cards`), photo only if `club.media` is populated (see schema change below) — never guessed from a caption. |
| Configurations & Floor Plans | `ConfigurationsSection.tsx` | **Comparison table**, every unit visible at once (reuses `.ptable-*`, same CSS-grid-desktop/card-mobile primitive as the Legal Data tables). Each row is a native `<details>` — click to expand inline to that unit's 2D/3D plan + full facts. |
| Master Plan | `ContentSections.tsx` → `MasterPlanSection` | Single image, zoomable. No pin/callout overlay — no data for it (see Known gaps). |
| Location & Connectivity | `ContentSections.tsx` → `LocationSection` | Single image + connectivity list grouped by real category (`road`/`metro`/`airport`/`office`/`hospital`/`mall`/`school`). |

### Why Configurations became a table, not a chip-picker

Three designs were mocked and compared with real data before picking:
**A** flat chip-picker (what was live first — 8 chips, pick one, see its
plan), **B** two-level tower-family→size tabs, **C** a comparison table (all
8 units, click a row to expand), **D** a card grid (all 8 as cards, no
picker). **C won.** Rationale: the real project has 8 units across 4 tower
families with no clean "3 tabs" shape, so a flat switcher (A) buried the
family grouping in a sub-label, and a buyer comparing price/sq.ft. across
sizes needed to see all 8 at once, not one at a time.

## Legal Data tab

Unchanged in spirit from the original single-scroll IA: same 6 sections
(Documents, Unit/Plan Inventory, Promoter, Bank Accounts, Land & Legal
Records, Agents/Works/Agreements), same `.section-block`/`.subsection`
pattern, still no accordions inside it (`ReraSections.tsx` — not touched
this round). Gets a `.legal-head` intro with the registration facts
(reg. no/date, declared completion, tehsil) that moved out of the Overview
hero, since those are compliance facts, not sales facts.

## Click-to-zoom (every content image)

`ZoomableImage.tsx` exports two pieces:

- **`ZoomableImage`** — the thumbnail trigger (a `<button class="zoomable">`
  wrapping `next/image`) + its own single-image `ZoomStage`. Used by Master
  Plan, Location map, clubhouse photos, unit floor plans (via
  `PlanViewer.tsx`), and the `cards`/`gallery` custom-section primitives.
- **`ZoomStage`** — the fullscreen viewer itself: +/− buttons, scroll-wheel
  zoom, double-click toggle, drag-to-pan once zoomed, two-finger pinch,
  Escape/backdrop close. Optionally takes `onPrev`/`onNext`/`counter` props.
- **`Gallery.tsx`** — the gallery is its *own* client component (not 26
  independent `ZoomableImage`s), because prev/next needs one shared "which
  index is open" state across every thumbnail. It renders the same
  teaser/grid markup as before but drives a single shared `ZoomStage` with
  navigation wired in — chevrons + a "3 / 26" counter, arrow-key support,
  wraps at both ends, resets zoom/pan on every photo change.

**Bug fixed along the way:** clicking a thumbnail didn't always open the
viewer ("click gets cut"). Cause: browsers start a native image-drag on
mousedown+the smallest pointer movement by default, which swallows the
click. Fix: `draggable={false}` on every thumbnail `<img>` plus a
`-webkit-user-drag: none` CSS backstop — now a checklist item in
SKILL.md §3.

## Schema change: `clubs[].media`

`schema/project-schema.json` bumped to **1.2.0** — `clubs[]` items gained
an optional `media` array (reuses the existing `media_ref` `$defs` type, same
shape as `gallery`/`master_plan`/`unit_types[].media.plan_2d`). Added so a
clubhouse card can show a real photo instead of text-only.

**Not populated for ACE Mahagun Medalleo.** While wiring this up, the
gallery's own captions turned out to be internally inconsistent about which
club a photo belongs to — several images (`grand-arrival-club-lobby.webp`,
`sports-arena.webp`, `state-of-the-art-gymnasium.webp`,
`squash-court.webp`) are `alt`-tagged "Iconic Club" even though those exact
items (Grand Arrival Lobby, Spa, Gym, Sports Arena, Squash Court) are listed
in **Grand Clubhouse's own `note` field**, not Iconic Club's. Rather than
guess, `clubs[].media` was left empty for this project and `ClubsSection`
degrades to text-only when it's absent. This is a real content-curation
issue in `data/content/UPRERAPRJ125561.json` worth fixing by hand — not a
code bug.

## Superseded: the "Editorial Feature" hero

An earlier pass rebuilt the hero as a type-led magazine masthead (no photo,
alternating image/copy rows, a refined spec table instead of a unit
picker) — the "Editorial Feature" of three layout variants that were
mocked and compared. It was implemented, then **explicitly reverted** in
favor of the photo-led "Project Showcase" hero described above, per
direct instruction. Nothing from that pass remains in the codebase (the
`editorial-*` CSS classes and masthead markup were removed outright, not
left dead) — mentioned here only so the reasoning isn't lost if it comes
up again.

## Known gaps (deliberately deferred, not oversights)

1. **No brochure PDF field.** "Download Brochure" has nothing to link to —
   would need a `content.marketing.brochure_url`-shaped field.
2. **No lead-capture endpoint.** "Enquire Now" has nowhere to submit to.
   CLAUDE.md's phase-1 chatbot is the planned lead-qual surface; until
   then this needs a plain lead form + a new Java endpoint.
3. **Clubhouse photos** — schema field exists (`clubs[].media`), data
   doesn't (see above).
4. **Clubhouse `size_sqft`/`count`** — schema supports it, this project's
   content doesn't have it filled in.
5. **No master-plan pin/callout data** — a numbered-pin overlay ("Tower A
   here," "clubhouse there") needs per-project coordinates that don't
   exist in the schema (would be a new field, e.g.
   `master_plan[].callouts: [{x_pct, y_pct, label}]`, plus real annotation
   work per project — not a rendering change).
6. **No `featured`/`is_hero` flag on gallery images** — `order: 1` is used
   as the hero/teaser-lead image by convention; works today because
   whoever curated this project's content put the best shot first, but
   it's not enforced.

## Files touched this round

```
real_estate_frontend/src/app/project/[reg]/page.tsx        hero, tab shell, section wiring
real_estate_frontend/src/app/globals.css                   showcase hero/tabs/table/zoom CSS
real_estate_frontend/src/components/sections/ContentSections.tsx   Gallery/Amenities/Clubs/MasterPlan/Location
real_estate_frontend/src/components/sections/Gallery.tsx           new — gallery + prev/next lightbox
real_estate_frontend/src/components/sections/ZoomableImage.tsx     new — ZoomableImage + ZoomStage
real_estate_frontend/src/components/sections/ConfigurationsSection.tsx  rewritten — comparison table
real_estate_frontend/src/components/sections/PlanViewer.tsx        2D/3D toggle, now zoomable
real_estate_frontend/src/components/sections/Primitives.tsx        custom_section cards/gallery, now zoomable
real_estate_frontend/src/components/sections/UnitExplorer.tsx      deleted — superseded by the table
real_estate_frontend/src/components/JumpNav.tsx                    deleted — superseded by the tab shell
real_estate_frontend/src/components/IconSprite.tsx                 + shield, chevron-left, chevron-right
real_estate_frontend/src/lib/types.ts                              clubs[].media
schema/project-schema.json                                         1.1.0 -> 1.2.0, clubs[].media
```
