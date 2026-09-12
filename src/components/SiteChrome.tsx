import Link from "next/link";
import { Icon } from "./IconSprite";
import { ThemeToggle } from "./ThemeToggle";

/** Server Components — pure markup, zero client JS. */

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container bar">
        <Link className="brand" href="/">
          {/* AcreInfotech mark ("Roofline Data") — roofline over three ascending bars.
              Source: public/brand/svg/acreinfotech-icon-dark.svg, ported to currentColor
              so it follows .brand .mark { color: var(--accent) } like the rest of the
              icon system instead of a hardcoded hex. See public/brand/README.txt for
              the full package (light/black/white variants, favicon, app icons). */}
          <svg className="mark" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M5 22L24 7L43 22" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="12" y="30" width="5.5" height="12" rx="1.4" fill="currentColor" opacity=".55" />
            <rect x="21.2" y="25" width="5.5" height="17" rx="1.4" fill="currentColor" opacity=".9" />
            <rect x="30.4" y="33" width="5.5" height="9" rx="1.4" fill="currentColor" opacity=".4" />
          </svg>
          <span className="word">
            <span className="primary">ACREINFOTECH</span>
            <small>Find Your Next Home</small>
          </span>
        </Link>
        <div className="header-actions">
          <nav>
            <Link href="/">Home</Link>
            <Link href="/projects">Browse</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <nav className="footer-nav" aria-label="Footer">
          <Link href="/">Home</Link>
          <Link href="/projects">Browse</Link>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact Us</Link>
        </nav>
        AcreInfotech is an independent directory, not an official RERA service. Data sourced from up-rera.in.
      </div>
    </footer>
  );
}

/**
 * Mobile bottom tab bar (hidden at >=1024px by the design system).
 *
 * Kept as a Server Component: the two links are plain navigation. Pages that
 * need a third contextual action render their own client-side control.
 */
export function BottomNav({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      <Link className="bn-item" href="/">
        <span className="icon-wrap">
          <Icon name="home" />
        </span>
        Home
      </Link>
      <Link className="bn-item" href="/projects">
        <span className="icon-wrap">
          <Icon name="search" />
        </span>
        Browse
      </Link>
      {children}
    </nav>
  );
}
