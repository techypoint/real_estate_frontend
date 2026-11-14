# SEO Audit: acreinfotech.com

Date: 2026-11-14. Tool: claude-seo v2.6.0, run inline (no subagents).

**Scope and limits.** I audited all 20 URLs in the sitemap. That is the whole site.
No Core Web Vitals field data, Search Console, or backlink data was available.
Scores are my own judgment, not tool output.

**Business type:** real-estate lead generation, programmatic directory plus blog.

## Health score: about 70 / 100

| Category | Score | Note |
|---|---|---|
| Technical SEO | 80 | Clean and fast. `www` host not redirected. |
| Content quality | 55 | Only 3 projects. Hub, area and builder pages are 175 to 350 words. |
| On-page | 65 | Titles too long on most templates. No og:image outside the blog. |
| Schema | 70 | Present everywhere. Missing `WebSite`, `RealEstateAgent`, `Offer`. |
| Performance | 85 (lab only) | 100 ms TTFB, 111 KB HTML, Cloudflare. CWV not measured. |
| AI search readiness | 70 | Training bots blocked, search bots allowed. No llms.txt. |
| Images | 90 | 0 of 70 images checked lack alt text. |

## What works

- All 20 pages return 200, have a self-referencing canonical, exactly one H1, and robots `index, follow`.
- `robots.txt` declares the sitemap and disallows `/api/`, `/admin` and `/projects?` (filter URLs).
- The sitemap matches the live site exactly, with 20 URLs.
- http redirects to https with a 301. A missing page returns a real 404.
- Project pages carry 3,000 to 8,800 words, `ApartmentComplex` and `Apartment` schema, and breadcrumbs.
- Blog posts are 1,400 to 1,700 words, with og:image and 6 JSON-LD blocks.

## Findings

### High

1. **Site is tiny: 3 projects, 3 builders, 1 district, 2 areas, 6 posts.**
   Programmatic SEO can't help much until there are more pages. This is task #3 (populating UP-RERA projects), not a code problem.
2. **Hub, area and builder pages are thin.** `/districts` and `/builders` are about 175 words. Area and builder pages are 280 to 350 words, mostly a project list plus boilerplate. Google can treat templated pages like this as thin or duplicate.
   Fix: give each page unique content, such as area facts, price ranges computed from the data, connectivity, and a short FAQ.
3. **`www.acreinfotech.com` returns 200 and doesn't redirect to the apex.**
   Canonical tags soften it, but the redirect should exist. Fix it in Cloudflare with a redirect rule from `www` to the apex.

### Medium

4. **No `og:image` on the home, projects, districts, builders, area or project pages.** Only the blog has one. Shared links, WhatsApp previews included, show no image. Add a default and a per-project image from the hero or brochure.
5. **Titles are too long.** Project titles run about 78 characters, area pages 75 to 95, builder pages 83 to 87, and blog posts 102 to 116. Google truncates at about 60 characters, so the key part gets cut. Drop the ` — AcreInfotech` suffix on long titles, or shorten the template.
6. **Project meta descriptions run about 190 characters.** Trim to 155 or fewer. Project slugs like `estate-105-upreraprj529777-03-2026` carry a date suffix. This is cosmetic, and changing slugs now would need redirects.
7. **Schema gaps.** The homepage has only `Organization` and `FAQPage`. Add `WebSite` and a `RealEstateAgent` entity with the agency name and area served. Project pages have no `Offer`, which is reasonable while price is hidden. FAQPage no longer gets rich results for most sites, so it's low value.
8. **No Search Console.** Verify the domain, submit the sitemap, and check indexing. Without it we can't tell what is indexed.

### Low

9. No security headers (HSTS, `X-Content-Type-Options`, `Referrer-Policy`). Add them in Cloudflare or `next.config`.
10. No `llms.txt` (404). Optional, and Google ignores it.
11. The homepage canonical has no trailing slash, which is consistent and fine.

## AI search

Cloudflare's managed robots.txt blocks training crawlers (GPTBot, ClaudeBot, Google-Extended, CCBot, Applebot-Extended and others) with `ai-train=no`. It allows normal search and doesn't list OAI-SearchBot or PerplexityBot, so those can still fetch pages. This is a reasonable default. If you want citations in ChatGPT and Claude, consider allowing the retrieval-style agents.

## Not measured

Core Web Vitals field data, indexation status, backlinks, rankings, and a full mobile screenshot pass. All need Google or third-party access.
