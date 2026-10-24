import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { IconSprite } from "@/components/IconSprite";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ThemeScript } from "@/components/ThemeToggle";
import { SOCIAL_LINKS } from "@/lib/social";
import "./globals.css";

const SITE_NAME = "AcreInfotech";
const SITE_URL = process.env.SITE_URL ?? "https://acreinfotech.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Find Your Next Home`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "We help you find the right home — explore new real estate projects across Uttar Pradesh by budget, configuration and timeline, with independent guidance from search to keys.",
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_IN" },
  robots: { index: true, follow: true },
  // The browser tab icon can only react to the OS-level prefers-color-scheme,
  // not the in-app theme toggle (there's no way for a <link> to see data-theme),
  // so this tracks the OS setting rather than the site's own light/dark choice.
  icons: {
    icon: [
      { url: "/favicon-light.ico" },
      { url: "/favicon-light.ico", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.ico", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/acreinfotech-appicon-dark-180w.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Two user-selectable themes (Arctic Violet light / Mono + Pop dark) rather
  // than one OS-driven scheme, so both are offered rather than picked for the
  // browser chrome to guess from.
  colorScheme: "light dark",
  themeColor: "#f7f6fb",
};

/**
 * Site-wide Organization node.
 *
 * `sameAs` is the whole point: it is how Google ties these social profiles to
 * the AcreInfotech brand entity rather than treating them as unrelated pages.
 * Emitted on every page, which is conventional for Organization — the blog's
 * own BlogPosting/BreadcrumbList nodes sit alongside it without conflict.
 */
function OrganizationJsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/acreinfotech-appicon-dark-180w.png` },
    sameAs: SOCIAL_LINKS.map((s) => s.href),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
     * suppressHydrationWarning is required, not cosmetic.
     *
     * The theme script below runs before React hydrates and stamps
     * data-theme onto <html>. The server-rendered markup has no such
     * attribute, so React sees a mismatch it cannot reconcile and logs a
     * hydration error. Any pre-paint theme script has this problem; suppressing
     * it here is the sanctioned fix (it is what next-themes does).
     *
     * It applies ONE level deep — this element's own attributes and text — so
     * genuine mismatches anywhere inside the tree are still reported. It also
     * absorbs the same noise from browser extensions that mutate <html>.
     */
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <GoogleAnalytics />
        <OrganizationJsonLd />
      </head>
      <body className="page-body">
        <IconSprite />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
