import Link from "next/link";
import { api } from "@/lib/api";
import { fmtNum } from "@/lib/format";
import { ProjectCard } from "@/components/ProjectCard";
import { SearchForm } from "@/components/SearchForm";
import { BottomNav } from "@/components/SiteChrome";
import { Icon } from "@/components/IconSprite";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Your Next Home — Real Estate Projects Across India",
  description:
    "We help you find the right home — search real estate projects across India, matched to your budget, configuration and timeline, with the official RERA record behind every listing so you can research with confidence.",
  alternates: { canonical: "/" },
};

const QUICK_TYPES = ["Residential", "Commercial", "Mixed", "Plotting"];

const TRUST_POINTS = [
  "We help you find a home that fits, not close a sale",
  "Independent — we work for you, not the builder",
  "Every project checked against its official RERA filing",
  "Every legal document, in one place",
];

const WHY_US = [
  {
    icon: "heart",
    title: "Built around what fits you",
    body: "Budget, configuration, possession timeline, locality — we help you narrow in on projects that genuinely match what you need, not just what's paying to be seen first.",
  },
  {
    icon: "shield",
    title: "Nothing hidden, nothing assumed",
    body: "Promoter details, bank accounts, land records, sanctioned dates — pulled straight from each project's official RERA filing, not the marketing brochure.",
  },
  {
    icon: "tag",
    title: "Guidance that's on your side",
    body: "We help you understand configurations, comparable projects and what to ask before you commit, so you walk into every conversation informed.",
  },
] as const;

export default async function HomePage() {
  // Both fetches are cached and revalidated independently; running them in
  // parallel keeps TTFB at the slower of the two rather than their sum.
  const [stats, recent] = await Promise.all([
    api.stats(),
    api.listProjects({ limit: 6 }),
  ]);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1 className="rise-in rise-in-1">We&rsquo;ll help you find a home you&rsquo;ll love.</h1>
          <p className="rise-in rise-in-2">
            Tell us your budget, configuration and timeline, and we&rsquo;ll guide you to real
            estate projects across India that genuinely fit — every one checked against its
            official RERA record, not just a builder&rsquo;s brochure.
          </p>

          <div className="rise-in rise-in-3">
            <SearchForm />
          </div>

          <div className="chip-scroll rise-in rise-in-3" role="group" aria-label="Quick filter by project type">
            {QUICK_TYPES.map((type) => (
              <Link key={type} className="chip-toggle" href={`/projects?type=${encodeURIComponent(type)}`}>
                {type}
              </Link>
            ))}
          </div>

          <div className="filter-toggle-row">
            <Link className="btn btn-outline" href="/projects">
              <Icon name="filter" className="icon icon-sm" />
              Browse with filters
            </Link>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="showcase-highlights trust-bar">
          {TRUST_POINTS.map((t) => (
            <div className="h" key={t}>{t}</div>
          ))}
        </div>

        <div className="showcase-content">
          <section className="showcase-section" id="why-us">
            <div className="showcase-eyebrow">Why we exist</div>
            <h2>We&rsquo;re not here to sell you a property. We&rsquo;re here to help you find yours.</h2>
            <p className="prose" style={{ marginBottom: "var(--sp-6)" }}>
              Buying a home is one of the biggest decisions you&rsquo;ll make — and most platforms
              are built to close a lead, not earn your trust. We think you deserve better: guidance
              that&rsquo;s on your side, and the real regulatory record behind every project, laid
              out honestly rather than buried in brochure copy.
            </p>
            <div className="mini-cards">
              {WHY_US.map((f) => (
                <div className="mini-card" key={f.title}>
                  <div className="mini-card-body">
                    <div className="feature-icon">
                      <Icon name={f.icon} />
                    </div>
                    <div className="mini-card-title">{f.title}</div>
                    <p className="feature-body">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="showcase-section">
            <div className="showcase-eyebrow">By the numbers</div>
            <h2>A growing catalogue</h2>
            <div className="stats" style={{ margin: "0 0 0" }}>
              <div className="stat-card">
                <div className="num">{fmtNum(stats.listed)}</div>
                <div className="label">Projects Available</div>
              </div>
              <div className="stat-card">
                <div className="num">{fmtNum(stats.districts)}</div>
                <div className="label">Districts Covered</div>
              </div>
              <div className="stat-card">
                <div className="num">{fmtNum(stats.total)}</div>
                <div className="label">Tracked on UP-RERA</div>
              </div>
            </div>
          </section>

          <section className="showcase-section">
            <div className="section-title" style={{ margin: "0 0 var(--sp-5)" }}>
              <div>
                <div className="showcase-eyebrow">Explore</div>
                <h2 style={{ margin: 0 }}>Featured Projects</h2>
              </div>
              <Link className="count" href="/projects">
                View all {fmtNum(stats.listed)} →
              </Link>
            </div>

            {recent.items.length ? (
              <div className="grid">
                {recent.items.map((p) => (
                  <ProjectCard key={p.registration_no} project={p} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Icon name="inbox" />
                No projects captured yet.
              </div>
            )}
          </section>
        </div>
      </div>

      <section className="cta-banner">
        <div className="container">
          <h2>Your next home is one search away.</h2>
          <p>
            Tell us what you&rsquo;re looking for, or browse the catalogue yourself — every project
            checked against its official RERA record.
          </p>
          <div className="btns">
            <Link className="btn btn-primary" href="/projects">Browse Projects</Link>
            <Link className="btn btn-outline" href="/#why-us">Why trust us</Link>
          </div>
        </div>
      </section>

      <BottomNav />
    </>
  );
}
