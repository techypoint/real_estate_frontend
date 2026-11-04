# Task 13 — Capture RERA details for more projects

**Status:** ongoing — owner: founder

## Why
Only projects with captured RERA details are shown on the site / Google (Task 2 rule).
Today 30 / 1,491 have details. Every batch captured = more indexable pages, no code change needed.

## How
`real_estate_scripts` — browser extension capture (up-rera.in detail pages are anti-bot gated), then `npm run import:rera`.
New districts: `scrape_uprera.py --district "<name>"` then import.

## Suggested priority
1. Projects the agency sells
2. New launches / under construction
3. Big builders (Gaurs, Mahagun, ACE, Supertech, ATS…)
4. New districts: Ghaziabad, Lucknow

## Progress log
| Date | Update |
|---|---|
| 2026-10-25 | Created as follow-up from Task 2. 30 projects with details; 3 districts. |
