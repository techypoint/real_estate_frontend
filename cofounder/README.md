# Cofounder Notes — AcreInfotech

Working notes for growing https://acreinfotech.com/ as a lead-generation business.
Tasks live in [TASKS.md](TASKS.md). We discuss each task, agree on it, then execute — one at a time.

## Business model (closed)

- We generate buyer leads; a partner real estate agency (sells builder inventory) works and closes them.
- **Revenue share: 50%** of the agency's earning on every deal closed from our leads.
- Agency coverage: **all of Uttar Pradesh**. Projects to feature will be shared one by one.

### Rough unit economics (for reference, not a commitment)

| Item | Estimate |
|---|---|
| Avg ticket | ~₹80L |
| Builder brokerage | 2–4% → ~₹2.4L |
| Our 50% share | ~₹1.2L per closing |
| Lead → booking | 1–2% |
| **Value of one lead to us** | **~₹1,200–2,400** |

This is the ceiling on what we can pay per lead when we run ads.

## Current state (2026-10-25)

- Site is live, just started — **no traffic yet**.
- Have: UP-RERA project data, project pages with brochures, enquiry form, blog, Reco reel pipeline for Instagram.
- Ads budget: to be decided when we start ads.

## Decisions log

| Date | Decision |
|---|---|
| 2026-10-25 | Agency deal closed at 50% share — no further work needed on deal terms. |
| 2026-10-25 | Agency covers all of UP; projects will be added one by one as shared. |
| 2026-10-25 | Ads budget deferred until the ads task. |
| 2026-10-25 | Leads → Mongo + email to founder@; forwarded to agency manually, CRM API later. Feedback loop after first few leads. |
| 2026-10-25 | Lead forms: phone required, email optional; budget / timeline / purpose added as required selects. |
| 2026-10-25 | WhatsApp: no number on site for now; manual follow-up from personal number. Separate Business SIM later. |
| 2026-10-25 | Agency can work leads on any project, not just theirs → lead CTA on every project page. |
| 2026-10-25 | Show "declared completion date passed" on project pages (RERA facts only). |
| 2026-10-25 | More UP districts to be added by founder via real_estate_scripts. |
| 2026-10-25 | Site visibility rule: project shown only with RERA details AND brochure; others 404 and stay out of Google. |
| 2026-10-25 | Builder pages grouped by brand (curated `builders` table) using the lead promoter only. |
| 2026-10-25 | Locations: district = official UP-RERA name everywhere; buyer places (Noida, Yamuna Expressway, Jewar…) are **areas** from a master list (Mongo `areas`, edited in /admin/areas; seed `data/areas.json`); founder sets each project's area. |
| 2026-10-25 | Project URLs lower case; "/" in reg numbers becomes "-". |
| 2026-10-25 | Server database is the master copy for lists and content, edited via the admin panel; founder takes nightly backups. |
| 2026-10-25 | Admin panel login: username + plain password in env (`ADMIN_USERNAME` / `ADMIN_PASSWORD`), no hashing — founder's choice. |
| 2026-10-25 | Unauthenticated blog/reel/social write endpoints: leave as-is for now. |
