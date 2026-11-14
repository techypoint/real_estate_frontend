/**
 * Thin wrapper over GA4's gtag (see components/GoogleAnalytics.tsx).
 *
 * gtag only exists in production builds, so this is a silent no-op in dev and
 * when an ad blocker stops the script. Never put personal data (names, phone
 * numbers, email) in params — these go to a third party.
 */
type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: Params = {}) {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", name, params);
    }
  } catch {
    // analytics must never break the page
  }
}
