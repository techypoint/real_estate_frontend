# Task 1 — Lead capture & tracking

**Status:** done (2026-10-25)

## Why
Every lead must be captured, qualified, and attributable to us before traffic arrives.

## Agreed scope
- Leads stored in Mongo + emailed to founder@acreinfotech.com; forwarded to the agency manually for now.
- Qualifying fields: budget, timeline, self-use vs investment.
- Agency CRM API and feedback loop deferred → Task 10, Task 11.
- WhatsApp: personal number, kept off the site, manual follow-up → upgrade is Task 12.

## Checklist
- [x] Phone required, email optional (agency works leads by phone)
- [x] Qualifying fields on both forms (required selects)
- [x] Project name + RERA no. stored on project enquiries (was being dropped)
- [x] First-touch attribution on every lead: UTM params, landing page, referrer, submit page
- [x] `status: "new"` on every lead, ready for the feedback loop (Task 10)
- [x] Email alert per lead via Zoho SMTP (smtp.zoho.in:465)
- [x] Thank-you copy: "Our team will call or WhatsApp you shortly"
- [x] Commit + deploy (founder)

## What changed (for reference)
**Backend** (`real_estate_backend`)
- `dto/LeadRequest.java` — new fields: source, project, budget, timeline, purpose, attribution
- `model/Lead.java` — stores the above + `status`
- `web/LeadController.java` — saves, then calls LeadNotifier
- `web/LeadNotifier.java` — new; best-effort async email, never fails the save
- `config/AppProperties.java` — `app.lead-notify-to` / `app.lead-notify-from`
- `pom.xml` — spring-boot-starter-mail; `application*.properties` — Zoho SMTP config

**Frontend** (`real_estate_frontend`)
- `src/lib/leads.ts` — option lists, first-touch capture, `submitLead`
- `src/components/LeadFields.tsx` — shared fields + `AttributionCapture` (mounted in layout)
- `ContactForm.tsx`, `ProjectEnquiry.tsx` — use the shared pieces

## Progress log
| Date | Update |
|---|---|
| 2026-10-25 | Scope agreed. Built backend + frontend changes. Local test: lead saved with all fields; missing phone rejected (400). |
| 2026-10-25 | Zoho password set; test email received by founder. WhatsApp option (b) chosen. |
| 2026-10-25 | Marked done; founder committing + deploying. Follow-ups split into Tasks 10, 11, 12. |
