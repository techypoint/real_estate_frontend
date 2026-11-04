/**
 * Shared lead-form plumbing for ContactForm and ProjectEnquiry, so both send
 * the same shape to /api/leads (see the Java LeadRequest for the contract).
 */

/** Qualifying questions — the agency uses these to decide who to call first. */
export const BUDGET_OPTIONS = ["Under ₹50L", "₹50L – ₹1Cr", "₹1Cr – ₹2Cr", "Above ₹2Cr"];
export const TIMELINE_OPTIONS = ["Immediately", "Within 3 months", "3–6 months", "6+ months", "Just exploring"];
export const PURPOSE_OPTIONS = ["Self use", "Investment"];

const ATTRIBUTION_KEY = "acre_attribution";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

type FirstTouch = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  landingPage?: string;
  referrer?: string;
};

/**
 * Records where the visitor first came from (UTM params, landing page,
 * external referrer). First touch wins: a later internal navigation or a
 * second ad click doesn't overwrite it, so a lead is credited to whatever
 * brought the visitor in. localStorage can throw (private mode, blocked
 * storage) — attribution is a nice-to-have, so failures are swallowed.
 */
export function captureFirstTouch() {
  try {
    if (localStorage.getItem(ATTRIBUTION_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const [utmSource, utmMedium, utmCampaign, utmTerm, utmContent] = UTM_KEYS.map((k) => params.get(k) ?? undefined);
    const external = document.referrer && !document.referrer.startsWith(window.location.origin);
    const touch: FirstTouch = {
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      landingPage: window.location.href,
      referrer: external ? document.referrer : undefined,
    };
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(touch));
  } catch {
    // ignore — see above
  }
}

function readFirstTouch(): FirstTouch {
  try {
    return JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Optional select values come through FormData as "" when left unchosen — send those as absent. */
function optional(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function submitLead(
  data: FormData,
  extra: { source: string; project?: { registration_no: string; project_name: string } },
) {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.get("name"),
      phone: data.get("phone"),
      email: optional(data.get("email")),
      message: optional(data.get("message")),
      budget: optional(data.get("budget")),
      timeline: optional(data.get("timeline")),
      purpose: optional(data.get("purpose")),
      source: extra.source,
      project: extra.project,
      attribution: { ...readFirstTouch(), pageUrl: window.location.href },
    }),
  });
  if (!res.ok) throw new Error("request failed");
}
