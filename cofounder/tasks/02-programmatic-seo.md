# Task 2 — Programmatic SEO pages

**Status:** in-progress — phase 1 built, pending deploy (2026-10-25)

## Why
Zero traffic today. SEO is free and compounds, but takes 3–6 months — start early.
We can't beat 99acres / MagicBricks on head terms ("flats in Noida"); we target the high-intent long tail:
"[project] RERA status", "[project] possession date", "[builder] projects", "new projects in [district]".

## Data we have (checked 2026-10-25)
| | Count |
|---|---|
| UP-RERA projects in Mongo | 1,491 |
| Listed on site today | 30 (only 2 with rich content) |
| Districts | 3 — Gautam Buddha Nagar 1,126 · Agra 224 · Kanpur Nagar 141 |
| Builders (`promoter_name`) | ~809, messy names |
| Useful fields | project_name, promoter_name, district, project_type, declared_completion_date, documents, detail (land, plan, permits…) |

No clean sector/locality field — would need extracting from addresses.

## Agreed scope
1. **RERA fact page for every project (~1,500)** — RERA status, declared completion, overdue flag, builder's other projects, documents. CTA: "Get price, availability & site visit". Agency projects keep rich pages + top placement.
2. **Builder pages** — all projects by a builder, RERA status, track record. Needs builder-name cleanup.
3. **District pages** — "New projects in Noida", "Ready-to-move in Agra", filters by type / completion.
4. **Sitemap + structured data + internal linking** across project ↔ builder ↔ district.
5. Phase 2: sector / locality pages (needs address extraction).

## Finding: most projects have almost no data (2026-10-25)
- Only **30 / 1,491** projects have RERA detail captured (`has_detail`). The other **1,461** have just name, builder, district, type.
- Declared completion date, registration date, documents all come from the detail page → the "overdue" flag works for only 30 projects today.
- Detail pages on up-rera.in are anti-bot gated; `real_estate_scripts` captures them via a browser extension (manual), not an automatic crawl.
- Sitemap today lists only projects with published curated content (**2 URLs** + blogs).
- Risk: publishing ~1,460 near-empty pages for Google = thin / scaled content → can hurt the whole site.

## Visibility check (2026-10-25)
Rule from founder: **projects without details must not show on the website or Google.**
- Listing (`/projects`), district filter, homepage, sitemap — already gated: backend only returns `listed: true` **and** has a brochure → today only **2** projects visible.
- **Gap:** the project page itself (`/project/[slug]`) has no gate — `GET /api/projects/{reg}` returns any of the 1,491, so a typed/old/shared URL renders a near-empty page Google could index. Needs fixing.
- Note: of the 30 projects with details, **28 are hidden** because they have no brochure (listing requires one).

## Builder names (checked 2026-10-25)
- Source: `promoter_name` from the UP-RERA district list scrape — raw, as filed. **Not normalized.**
- 809 distinct raw values. Problems:
  - Case duplicates: "ATS REALTY PRIVATE LIMITED" vs "ATS Realty Private Limited"
  - `;`-joined co-promoters (75), sometimes the same name twice: "ARHAM ESCON PVT. LTD.; ARHAM ESCON PVT. LTD."
  - Suffix variants: "Pvt. Ltd." / "PVT LTD" / "Private Limited"
  - Truncated: "...(MAHAGUN GROU", "...PRIVATE LIMIT"; typos: "ACE INRACITY"
  - One brand, many legal entities: Gaursons ×7, Mahagun ×9, Supertech ×5
- Simple cleanup (case, suffixes, first co-promoter) → 767. Doesn't solve brands.
- Buyers search the **brand** ("Gaurs", "Mahagun"), not the legal entity → builder pages need a brand mapping.

## Decisions (2026-10-25)
- Visible = RERA details **and** brochure (option b). Everything else 404s and stays out of the sitemap.
- No pages for the ~1,460 bare projects — they appear automatically once details + brochure are captured (Task 13).
- District and builder pages built now; they fill in as data grows.
- Builders: brand table in Mongo (`builders`, from `real_estate_scripts/data/builders.json`) + automatic cleanup for everything else. Brand decided by the **lead** promoter only (co-promoters are JV partners / landowners).

## Phase 1 checklist
- [x] One visibility rule in Java (`ProjectRepository.visible()`) — listing, project page, districts, builders, sitemap
- [x] Project page 404s for hidden projects (was rendering any of the 1,491)
- [x] Sitemap: all visible projects (was only curated-content ones) + district + builder pages
- [x] `builders` table, 10 brands seeded locally (import script since retired — now managed in /admin/builders, Task 14)
- [x] Java `BuilderDirectory` (normalize, brand match, auto names) + `GET /api/builders`, `/api/builders/{slug}`, `?builder=` on listing
- [x] Pages: `/district/[slug]`, `/builder/[slug]`, `/builders`
- [x] ~~Buyer names for districts~~ → replaced by official district names + areas (see below)
- [x] Lead form on district + builder pages (source `district_page` / `builder_page`)
- [x] Internal links: project → builder + district; /projects → districts + builders; footer → Builders
- [x] Local test: routes, 404s, sitemap, mobile + desktop screenshots
- [x] Areas master list in Mongo `areas` (seed: `data/areas.json`); scripts since retired — areas and project areas now managed in /admin (Task 14)
- [x] Java: `AreaDirectory`, `GET /api/areas`, `?area=` on listing, `area {slug,name}` on project detail
- [x] Area pages `/district/<district>/<area>` (only areas with ≥1 visible project; others 404), lead source `area_page`
- [x] "Browse by area" chips on homepage, /projects, district page; area in project breadcrumb, hero and cards
- [x] `/districts` index page; footer link; sitemap has /districts + area pages
- [x] URL fixes 1, 2, 4, 5, 6 (see audit) + BreadcrumbList JSON-LD on project / district / area / builder / index pages
- [x] Local test (backend on :8889, Next on :3001): all routes, redirects, 404s, sitemap, mobile + desktop screenshots
- [ ] On prod, via the admin panel (Task 14): import builders + areas JSON, set areas of the 2 live projects (replaces the import scripts)
- [ ] After deploy: Search Console → URL Inspection → Request indexing for the 2 new lower-case project URLs
- [ ] Commit + deploy scripts, backend, frontend
- [ ] Submit sitemap in Google Search Console
- [ ] "Declared completion passed" flag on project pages (agreed; not built yet)
- [ ] Phase 2: sector / locality pages

## URL audit (2026-10-25)
Good: lowercase-hyphen slugs, keyword-bearing names, one canonical URL per project (bare reg no. / wrong name / trailing slash → 308), self-canonicals on project/builder/district pages, reg no. in URL keeps it stable across renames.

Also: `/district` → `/districts` and `/builder` → `/builders` (308) — new index page for districts.

Issues (fix before launch — nothing meaningful indexed yet, so changes are free now):
1. **Uppercase in project URLs** (`ats-allure-UPRERAPRJ918`); the lowercase version 404s. → **Fixed**: URLs are lower case; any case resolves and 308s to it.
2. **197 reg numbers contain `/`** (`UPRERAPRJ248777/03/2025`), 6 of them already have details → their pages are unreachable (backend 400 on encoded slash). → **Fixed**: URL form `upreraprj248777-03-2025`; API accepts it.
3. **District slug uses the official name** (`/district/gautam-buddha-nagar`); buyers search "Noida". `/district/noida` 404s. → **Decided**: keep the official name (a district has many towns); buyer search terms are served by area pages `/district/gautam-buddha-nagar/noida`.
4. **Duplicate district listing**: `/projects?district=Gautam Buddha Nagar` = same content as `/district/gautam-buddha-nagar`, but its canonical points to `/projects`. → **Fixed**: district-only filter 308s to the district page.
5. **Out-of-range pages** (`?page=99`) return 200 with "No projects" → soft 404. → **Fixed**: 404.
6. **Pagination** (page 2+): `noindex` + canonical to page 1; Google recommends a self-canonical. → **Fixed**: self-canonical, indexable (search results `?q=` stay noindex).
7. **Builder slugs can change**: adding a brand later moves e.g. `/builder/gaursons-realtech` → `/builder/gaursons`; the old URL 404s. → **Deferred (founder)**: fix when it first happens — trigger: adding a brand to `builders.json` that absorbs a builder whose auto page is already live/indexed. Fix = redirect old auto slug → brand slug.
8. **Long / generic project slugs**: 18 over 75 chars (Amrapali villa ranges), names like "PLOT NO.13-14". → Open, low priority: fix with a curated `display_name` when those projects go live.

## Open questions
- [x] Leads on non-agency projects? **Yes** — agency can work a lead on any project → every page carries the lead CTA.
- [x] More districts? **Yes** — founder adds them via `real_estate_scripts`; pages must pick up new districts automatically.
- [x] Show "declared completion date passed"? **Yes** — show it, factual RERA data only.

## Progress log
| Date | Update |
|---|---|
| 2026-10-25 | Data audited; scope proposed; waiting on the 3 open questions. |
| 2026-10-25 | Open questions answered (all yes) → scope agreed. |
| 2026-10-25 | Data finding: only 30 projects have detail → proposed revised phasing. |
| 2026-10-25 | Founder: no-detail projects must not show on site or Google; detail capture is founder's job → Task 13. Visibility gap + builder-name audit logged above. |
| 2026-10-25 | Founder chose (b) — brochure required too. Built phase 1 (see checklist). Today visible: 2 projects, 1 district, 2 builders. 809 raw promoter names → 767 builders after auto cleanup. |
| 2026-10-25 | URL audit done — 8 findings logged above, awaiting founder decision on fixes. |
| 2026-10-25 | Founder: Gautam Buddha Nagar also has Dadri, Jewar, Bilaspur… Data check: UP-RERA has no city/area field; `tehsil` (Sadar/Dadri/Jewar) only on 30 projects and doesn't match buyer areas (The G, Sector 129 Noida → tehsil Dadri); `project_address` on 7 only. ATS Allure is YEIDA Sector 22D → wrongly shown under "Noida & Greater Noida". Proposed: district = official name (drop alias slug), areas as a second level assigned by founder during Task 13. Awaiting decision. |
| 2026-10-25 | Founder agreed: areas as a second level; **master list = `areas` table** (from `real_estate_scripts/data/areas.json`), site reads every area list from it via API; founder sets each project's area (suggestion from address). Seed for Gautam Buddha Nagar: Noida, Greater Noida, Greater Noida West, Yamuna Expressway, Jewar, Dadri. |
| 2026-10-25 | Built: areas master list + area pages, URL fixes 1/2/4/5/6, `/districts`, breadcrumb JSON-LD. District labels are now official names everywhere (dropped "Noida & Greater Noida" alias). Locally set ATS Allure → Yamuna Expressway, Mahagun Medalleo → Noida (Sector 107). Pending: prod imports + deploy + Search Console re-index. |
| 2026-10-25 | Founder confirmed both areas (ATS Allure → Yamuna Expressway, Mahagun Medalleo → Noida). |
| 2026-10-25 | Note: robots.txt disallows `/projects?`, so `/projects?page=2+` can't be crawled despite its self-canonical — projects stay reachable via district/area/builder pages; revisit if /projects pagination matters. |
| 2026-10-25 | Areas/builders now managed in the admin panel (Task 14); local DB re-imported from seed via the panel API. |
