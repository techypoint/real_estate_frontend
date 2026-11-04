# Task 14 — Admin panel (run the data pipeline from a UI)

**Status:** in-progress — phase 1 built, pending deploy (2026-10-25)

## Why
Publishing one project today means running scripts by hand across 2 languages and checking the result by eye:
scrape list → extension export → `import:rera` → `download_files.py` → `brochure_finder.py` → `brochure_content.py` →
edit JSON `published: true` → `import:content` → `areas:set` (+ `import:areas` / `import:builders` when lists change).
That's the founder's biggest time sink, and every project we publish is a page that can bring leads.

## Principle
- One place to see **every project's pipeline status** and the **one button** that moves it to the next step.
- Mongo becomes the source of truth for lists (areas, builders, content), not JSON files + import commands.
- The existing scripts stay as the *implementation* of long steps, but are run by a **job worker**, never by hand.
- Only one step stays manual (can't be automated): opening project detail pages on up-rera.in (anti-bot) with the extension.

## Proposed architecture
- **UI:** `/admin` inside this Next app — login-protected, `noindex`, disallowed in robots.txt.
- **Auth:** founder login (username + password, session cookie); Next talks to Java `/api/admin/**` with a server-side secret, same pattern as the revalidate secret. Browser never calls Java directly.
- **Java `/api/admin/**`:** projects pipeline query, set area, areas/builders CRUD, brochure upload (R2), content publish/unpublish (+ revalidate), job create/list.
- **Job worker (scripts repo):** `npm run worker` — polls a Mongo `jobs` collection, runs the matching existing script, streams log lines + status into the job doc. Runs wherever the tools are (laptop today — `brochure_content.py` needs the `claude` CLI; a server later). Kept running with pm2/systemd.
- **Extension:** posts captured details straight to `/api/admin/rera-details` instead of export → import.

## Screens
1. **Pipeline board** — each project and its steps: RERA detail · documents · brochure · area · content · published → live or "blocked on X". Filters: district, step, visible/hidden.
2. **Project admin page** — the step buttons (find brochure, upload brochure PDF, generate content, preview, publish), area dropdown with the suggestion pre-selected, job history.
3. **Areas** and **Builders** — add / edit / reorder, with project counts. Replaces `data/*.json` + import commands.
4. **Jobs** — running / done / failed with logs; retry.
5. **Districts** — "import district list" button (runs the list scraper + import).
6. Later: **Leads inbox** (ties into Task 10 — agency feedback loop).

## Scripts → UI mapping
| Today (by hand) | After |
|---|---|
| `import:areas`, `import:builders`, edit JSON | Areas / Builders screens |
| `areas:suggest`, `areas:set` | Area dropdown on project page (suggestion pre-selected) |
| `scrape_uprera.py` + `import:rera` (list) | Districts → "Import list" (job) |
| Extension export + `import:rera --details` | Extension uploads directly; import automatic |
| `download_files.py` | Auto job after details arrive |
| `brochure_finder.py` | "Find brochure" (job) or upload PDF by hand |
| `brochure_content.py` | "Generate content" (job) |
| Edit JSON `published: true` + `import:content` | Preview → "Publish" button (revalidates the page) |
| "Is it live?" checks | Pipeline board |

## Phases (proposed)
1. **Admin shell + pipeline board + areas/builders + set area + publish** — no worker yet; removes all Node import commands and the "is it live" checking.
2. **Job worker** — brochure finder, content generation, document download, district list import as buttons with logs.
3. **Extension → API** — no more export/import of details.
4. **Leads inbox** (with Task 10).

## Open questions
- [x] Where do scripts run? **Laptop (local)** → worker runs on the laptop and talks to the prod admin API (not to Mongo directly).
- [x] Login: **username + password** (changed from email on 2026-10-25 at the founder's request: username `varun`).
- [x] **Server database is the master copy** (lists + content); JSON files are seed/export only.
- [x] Backups: **founder takes a nightly backup** of the server Mongo.

## Phase 1 checklist
- [x] Login: username + password (`ADMIN_USERNAME`, `ADMIN_PASSWORD` — plain values in the env file, founder's choice 2026-10-25; hash script removed), signed httpOnly cookie (7 days), 10 failed tries / 15 min per IP
- [x] Middleware guards `/admin/*`; every server action re-checks the session; `/admin` noindex + disallowed in robots.txt; GA skips `/admin`
- [x] Java `/api/admin/**` behind `x-admin-secret` (`app.admin-secret`) — `AdminAuthInterceptor`; 503 if unset
- [x] Audit log (`admin_audit`): every change with user, time, before/after — History page + per-project history
- [x] Pipeline board `/admin`: filters (search, district, detail-only/all), step chips with counts, per-row steps + next step
- [x] Project page `/admin/projects/<reg>`: steps checklist, area dropdown with suggestion, publish/unpublish (revalidates the page), facts, history
- [x] Areas page: add / edit / reorder / delete (refused while in use) / import JSON
- [x] Builders page: add / edit / reorder / delete / import JSON
- [x] Pipeline search suggestions: typing 2+ chars shows up to 8 matching projects (name, RERA no., district, live) — pick one to open it; Enter still runs the normal search. Respects the district filter, searches all projects. (`/admin/suggest` route + `components/admin/ProjectSearch.tsx`; reuses `/api/admin/pipeline`, no backend change)
- [x] Retired `import:areas`, `import:builders`, `areas:suggest`, `areas:set` (they would overwrite/delete what's edited in the UI); data/*.json kept as seed
- [x] Tested on a production build: login (wrong + right), board filters, set/clear area, reorder, duplicate refused with reason, logout; mobile + desktop screenshots
- [x] Founder: login set in `.env.local` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`)
- [x] Local DB: areas (6) + builders (10) imported via the admin API from the seed JSON — matched what the old scripts had loaded (0 added, all updated)
- [ ] Deploy: backend, then frontend with `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `ADMIN_API_SECRET` (= `app.admin-secret`)
- [ ] One-time on prod: /admin/areas → Import JSON (data/areas.json), /admin/builders → Import JSON (data/builders.json), set areas of the 2 live projects

## Not in phase 1 (by design)
- Restore button for old versions (history is recorded; restore comes with content editing)
- Editing content JSON in the UI, brochure upload/find, content generation → phase 2

## Found while planning
- Import API with a body that isn't `{items:[…]}` returns a generic 500 instead of a clear 400 — the UI always sends the right shape, so low priority.
- Java write endpoints (blog create, reel claim/reset/patch, social posts) currently have **no auth** — anyone who can reach the API can call them. Callers found: `agentic_ai_workflow` (`src/lib/realEstateBackend.ts`, content-pipeline definitions) and `real_estate_scripts/crons/reel_from_blog.mjs`. Fix = require a secret header there and send it from both callers — **won't fix for now (founder decision, 2026-10-25).**

## Progress log
| Date | Update |
|---|---|
| 2026-10-25 | Founder: running many scripts to insert data is a pain → wants it run + checked from a UI. Plan proposed. |
| 2026-10-25 | Answers: scripts run on laptop; email + password login (later changed to username); Phase 1 agreed once "source of truth" is understood — explanation given. |
| 2026-10-25 | Founder: server DB is the master copy; founder does nightly backups; go with phase 1. |
| 2026-10-25 | Phase 1 built and tested locally (see checklist). Import scripts for areas/builders retired. Pending: own password, deploy, one-time prod import via UI. |
| 2026-10-25 | Founder: login simplified — username `varun` + plain password in the env file (`ADMIN_USERNAME` / `ADMIN_PASSWORD`), no hashing; `npm run admin:password` removed. Unauthenticated write endpoints: won't fix for now. |
| 2026-10-25 | Confirmed: local panel → local backend (:8888, `local` profile) → local Mongo (localhost:27017); prod panel → prod Mongo. Seed areas + builders imported into local DB via the admin API. |
| 2026-11-04 | Added search suggestions on the pipeline board (see checklist). Results come in backend order, not by match quality — rank prefix matches first in `adminPipeline` if it becomes a problem. Founder committing manually. |
