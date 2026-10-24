import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { fmtMonth, fmtNum } from "@/lib/format";
import { projectSlug } from "@/lib/slug";
import { ProjectCard } from "@/components/ProjectCard";
import { SearchForm } from "@/components/SearchForm";
import { BottomNav } from "@/components/SiteChrome";
import { Icon } from "@/components/IconSprite";
import type { Project } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Your Next Home — Real Estate Projects in Uttar Pradesh",
  description:
    "We help you buy the right home in Uttar Pradesh — explore new projects matched to your budget, configuration and timeline, with independent guidance from search to keys.",
  alternates: { canonical: "/" },
};

const QUICK_TYPES = ["Residential", "Commercial", "Mixed", "Plotting"];

const TRUST_POINTS = [
  "Independent advice — we work for you, not the builder",
  "Handpicked projects across Uttar Pradesh",
  "Floor plans, pricing and amenities in one place",
  "Support from first site visit to final paperwork",
];

const WHY_US = [
  {
    icon: "heart",
    title: "Homes that fit your life",
    body: "Budget, configuration, possession timeline, locality — we narrow the market down to projects that genuinely match what you need, not just what's paying to be seen first.",
  },
  {
    icon: "file",
    title: "Complete property information",
    body: "Every project comes with floor plans, configurations, amenities, location and its registration record — so you can compare homes side by side before you visit.",
  },
  {
    icon: "tag",
    title: "Guidance through the purchase",
    body: "Site visits, comparing options, negotiating and the paperwork — we stay with you through every step so you walk into each conversation informed.",
  },
] as const;

export default async function HomePage() {
  // Both fetches are cached and revalidated independently; running them in
  // parallel keeps TTFB at the slower of the two rather than their sum.
  const [stats, recent] = await Promise.all([
    api.stats(),
    api.listProjects({ limit: 6 }),
  ]);

  // The listing comes back newest-first, so its head is the latest project
  // added to the catalogue. The spotlight needs brochure content (photo,
  // configurations) that the summary doesn't carry; a failed fetch just
  // drops the spotlight rather than the whole homepage.
  const latestRef = recent.items[0];
  const latest = latestRef
    ? await api.getProject(latestRef.registration_no).catch(() => undefined)
    : undefined;

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="showcase-eyebrow rise-in rise-in-1">Homes across Uttar Pradesh</div>
          <h1 className="rise-in rise-in-1">Buying a home? We&rsquo;ll help you get it right.</h1>
          <p className="rise-in rise-in-2">
            Tell us your budget, configuration and timeline. We&rsquo;ll shortlist new projects
            across Uttar Pradesh that genuinely fit, and guide you from the first site visit to
            the day you get your keys.
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
          {latest && (
            <section className="showcase-section" id="latest">
              <div className="showcase-eyebrow">Just added</div>
              <h2>Latest project</h2>
              <LatestSpotlight project={latest} />
            </section>
          )}

          <section className="showcase-section" id="why-us">
            <div className="showcase-eyebrow">Why AcreInfotech</div>
            <h2>A smarter, calmer way to buy your home.</h2>
            <p className="prose" style={{ marginBottom: "var(--sp-6)" }}>
              Buying a home is one of the biggest decisions you&rsquo;ll make — and most platforms
              are built to close a lead, not earn your trust. We do it differently: honest,
              independent guidance and complete property information for every project, so you
              can choose with confidence.
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
                <div className="num">Free</div>
                <div className="label">Buyer Guidance</div>
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
                No projects listed yet.
              </div>
            )}
          </section>
        </div>
      </div>

      <section className="cta-banner">
        <div className="container">
          <h2>Your next home is one conversation away.</h2>
          <p>
            Tell us what you&rsquo;re looking for and we&rsquo;ll shortlist the right projects for
            you — or browse the catalogue yourself.
          </p>
          <div className="btns">
            <Link className="btn btn-primary" href="/contact">Talk to Us</Link>
            <Link className="btn btn-outline" href="/projects">Browse Projects</Link>
          </div>
        </div>
      </section>

      <BottomNav />
    </>
  );
}

/**
 * The newest project, shown as a photo-led card. Reuses the detail page's
 * showcase-hero markup so the homepage preview and the page it links to read
 * as the same thing.
 */
function LatestSpotlight({ project }: { project: Project }) {
  const c = project.content;
  const displayName = c?.marketing?.display_name || project.project_name || project.registration_no;
  const href = `/project/${encodeURIComponent(projectSlug(displayName, project.registration_no))}`;
  const heroImage = [...(c?.gallery ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];

  const bhkList = [...new Set((c?.unit_types ?? []).map((u) => u.bhk))].sort((a, b) => a - b);
  const facts = [
    { k: "Configurations", v: bhkList.length ? `${bhkList.join(", ")} BHK` : undefined },
    { k: "Starting price", v: c?.pricing?.starting_price?.display },
    { k: "Possession", v: fmtMonth(c?.marketing?.possession_on) },
  ].filter((f) => f.v);

  return (
    <Link className="showcase-shell spotlight" href={href}>
      <div className="showcase-hero">
        {heroImage?.url && (
          <div className="hero-img">
            <Image src={heroImage.url} alt={heroImage.alt || displayName} fill sizes="(min-width: 1280px) 1180px, 100vw" />
          </div>
        )}
        <div className="scrim" />
        <div className="content">
          <h3 className="spotlight-name">{displayName}</h3>
          <div className="loc">
            {[project.promoter_name?.split(";")[0], c?.marketing?.locality, c?.marketing?.city ?? project.district]
              .filter(Boolean)
              .join(" — ")}
          </div>
          {c?.marketing?.tagline && <div className="tagline">{c.marketing.tagline}</div>}

          <div className="showcase-facts">
            {facts.map((f) => (
              <div className="fact" key={f.k}>
                <span className="k">{f.k}</span>
                <span className="v">{f.v}</span>
              </div>
            ))}
            <div className="showcase-cta">
              <span className="btn btn-primary">
                View project
                <Icon name="chevron-right" className="icon icon-sm" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
