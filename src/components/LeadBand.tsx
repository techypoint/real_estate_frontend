import Link from "next/link";
import { ContactForm } from "./ContactForm";

/**
 * "Tell us what you want" lead form for browse pages (district, builder).
 * Every page on the site should give a visitor a way to become a lead — the
 * partner agency can work an enquiry on any project, so this isn't tied to
 * one listing.
 */
export function LeadBand({ title, blurb, source }: { title: string; blurb: string; source: string }) {
  return (
    <section className="lead-band">
      <div className="lead-band-copy">
        <span className="eyebrow">Talk to an advisor</span>
        <h2>{title}</h2>
        <p>{blurb}</p>
      </div>
      <div className="lead-band-form">
        <ContactForm source={source} />
      </div>
    </section>
  );
}

/** Wrapping row of plain links (districts, builders) — crawlable internal links styled as chips. */
export function LinkCloud({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  if (!links.length) return null;
  return (
    <nav className="link-cloud" aria-label={title}>
      <h2>{title}</h2>
      <div className="link-cloud-items">
        {links.map((l) => (
          <Link key={l.href} className="filter-chip" href={l.href}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
