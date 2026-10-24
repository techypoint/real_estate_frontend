import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { fmtNum } from "@/lib/format";
import { withProjectViews, type ProjectView } from "@/lib/projectView";
import { ProjectCard } from "@/components/ProjectCard";
import { BottomNav } from "@/components/SiteChrome";
import { Icon } from "@/components/IconSprite";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Your Next Home — Real Estate Projects in Uttar Pradesh",
  description:
    "We help you buy the right home in Uttar Pradesh — explore new projects matched to your budget, configuration and timeline, with independent guidance from search to keys.",
  alternates: { canonical: "/" },
};

const TYPES = [
  { type: "Residential", icon: "home", blurb: "Apartments, penthouses and villas to call home." },
  { type: "Commercial", icon: "building", blurb: "Offices, retail and spaces that work for you." },
  { type: "Mixed", icon: "layers", blurb: "Live, work and shop in one address." },
  { type: "Plotting", icon: "compass", blurb: "Land to build exactly what you imagine." },
] as const;

const JOURNEY = [
  { icon: "users", title: "Tell us what matters", body: "Budget, configuration, location and when you want to move in. Five minutes, no obligation." },
  { icon: "layers", title: "Get a real shortlist", body: "Projects that genuinely fit — compared side by side on plans, pricing, amenities and timelines." },
  { icon: "map-pin", title: "Visit with confidence", body: "We plan the site visits and tell you exactly what to look for and what to ask the builder." },
  { icon: "key", title: "Close and move in", body: "Negotiation, booking and paperwork — we stay with you until the keys are in your hand." },
] as const;

const FAQS = [
  {
    q: "How do I know a project is registered?",
    a: "Every project we list carries its UP-RERA registration number on its page. You can look that number up yourself on the UP-RERA portal before you commit to anything.",
  },
  {
    q: "What's the difference between carpet, built-up and super area?",
    a: "Carpet area is the usable floor inside your walls. Built-up adds the walls and balconies. Super area also adds your share of lobbies, lifts and common spaces — which is why it's always the biggest number on a brochure. Compare projects on the same basis.",
  },
  {
    q: "What does the possession date actually mean?",
    a: "It's the date by which the builder has declared the home will be handed over. Look at the project's construction progress and the builder's past delivery record, not just the date itself.",
  },
  {
    q: "How do I get started?",
    a: "Browse the projects here, or tell us your budget, preferred location and configuration through the contact page — we'll come back with a shortlist that fits.",
  },
] as const;

export default async function HomePage() {
  // All three are cached and revalidated independently; running them in
  // parallel keeps TTFB at the slowest one rather than their sum.
  const [stats, recent, districts] = await Promise.all([
    api.stats(),
    api.listProjects({ limit: 6 }),
    api.districts().catch(() => [] as string[]),
  ]);
  const projects = await withProjectViews(recent.items);

  // The listing comes back newest-first, so its head is the latest project
  // added — it leads the hero photography and the spotlight.
  const latest = projects[0];

  return (
    <>
      <section className="home-hero">
        {latest?.cover?.url && (
          <div className="home-hero-media">
            <Image
              src={latest.cover.url}
              alt=""
              fill
              priority
              quality={70}
              sizes="100vw"
              draggable={false}
            />
          </div>
        )}
        <div className="home-hero-scrim" />

        <div className="container home-hero-inner">
          <div className="home-hero-copy">
            <span className="hero-kicker rise-in rise-in-1">
              <span className="dot" />
              New homes across Uttar Pradesh
            </span>
            <h1 className="rise-in rise-in-1">
              Find the home <em>you&rsquo;ll love</em> coming back to.
            </h1>
            <p className="rise-in rise-in-2">
              Independent guidance for buying a new home — shortlisted to your budget, compared
              honestly, and handled from the first site visit to the day you get your keys.
            </p>

            <form className="hero-search rise-in rise-in-3" action="/projects" method="GET" role="search">
              <label className="hs-field hs-q">
                <span className="hs-label">Search</span>
                <span className="hs-input">
                  <Icon name="search" className="icon icon-sm" />
                  <input type="search" name="q" placeholder="Project, developer or locality" aria-label="Search projects" />
                </span>
              </label>
              <label className="hs-field">
                <span className="hs-label">District</span>
                <select name="district" defaultValue="" aria-label="District">
                  <option value="">All districts</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>
              <label className="hs-field">
                <span className="hs-label">Property type</span>
                <select name="type" defaultValue="" aria-label="Property type">
                  <option value="">Any type</option>
                  {TYPES.map((t) => (
                    <option key={t.type} value={t.type}>{t.type}</option>
                  ))}
                </select>
              </label>
              <button className="btn btn-primary hs-submit" type="submit">
                <Icon name="search" className="icon icon-sm" />
                Find homes
              </button>
            </form>

            <ul className="hero-proof rise-in rise-in-3">
              <li><Icon name="check" className="icon icon-sm" /> Independent advice</li>
              <li><Icon name="check" className="icon icon-sm" /> UP-RERA registered projects</li>
              <li><Icon name="check" className="icon icon-sm" /> With you until handover</li>
            </ul>
          </div>

          {latest && (
            <Link className="hero-feature rise-in rise-in-3" href={latest.href}>
              <span className="hf-label">Featured project</span>
              <span className="hf-name">{latest.name}</span>
              {latest.location && <span className="hf-loc">{latest.location}</span>}
              <span className="hf-row">
                {latest.startingPrice && <span>From <strong>{latest.startingPrice}</strong></span>}
                {latest.configurations && <span>{latest.configurations}</span>}
              </span>
              <span className="hf-go" aria-hidden="true">
                <Icon name="arrow-right" />
              </span>
            </Link>
          )}
        </div>
      </section>

      <section className="metric-band" aria-label="AcreInfotech at a glance">
        <div className="container metric-grid">
          <div className="metric">
            <span className="metric-num">{fmtNum(stats.listed)}</span>
            <span className="metric-label">Curated projects</span>
          </div>
          <div className="metric">
            <span className="metric-num">{fmtNum(stats.districts)}</span>
            <span className="metric-label">{stats.districts === 1 ? "District" : "Districts"} covered</span>
          </div>
          <div className="metric">
            <span className="metric-num">100%</span>
            <span className="metric-label">On the buyer&rsquo;s side</span>
          </div>
          <div className="metric">
            <span className="metric-num">1:1</span>
            <span className="metric-label">Guidance, start to keys</span>
          </div>
        </div>
      </section>

      {latest && <Spotlight project={latest} />}

      <section className="home-section">
        <div className="container">
          <header className="home-head reveal">
            <span className="eyebrow">How we help</span>
            <h2>From first search to front door.</h2>
            <p>Buying a home shouldn&rsquo;t feel like being sold to. Here&rsquo;s how we make it simple.</p>
          </header>
          <ol className="journey">
            {JOURNEY.map((s, i) => (
              <li className="journey-step reveal" key={s.title}>
                <span className="journey-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="journey-icon"><Icon name={s.icon} /></span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-section home-section-alt" id="why-us">
        <div className="container">
          <header className="home-head reveal">
            <span className="eyebrow">Why AcreInfotech</span>
            <h2>Advice that&rsquo;s on your side of the table.</h2>
          </header>
          <div className="bento">
            <div className="bento-card bento-lead reveal">
              <Icon name="heart" />
              <h3>We work for you, not the builder.</h3>
              <p>
                Most property platforms are built to close a lead. We&rsquo;re built to help you make
                one of the biggest decisions of your life well — which sometimes means telling you
                to walk away.
              </p>
              <Link className="text-link" href="/about">
                How we work <Icon name="arrow-right" className="icon icon-sm" />
              </Link>
            </div>
            <div className="bento-card reveal">
              <Icon name="file" />
              <h3>Complete property information</h3>
              <p>Floor plans, configurations, amenities, location and registration details — all in one place.</p>
            </div>
            <div className="bento-card reveal">
              <Icon name="layers" />
              <h3>Honest comparisons</h3>
              <p>See projects side by side on the same basis — area, price and possession — not brochure claims.</p>
            </div>
            <div className="bento-card reveal">
              <Icon name="shield" />
              <h3>Registered projects only</h3>
              <p>Every project we list carries its UP-RERA registration number, so you can check it yourself.</p>
            </div>
            <div className="bento-card reveal">
              <Icon name="key" />
              <h3>Through to handover</h3>
              <p>Site visits, negotiation and paperwork — we&rsquo;re with you until you move in.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <header className="home-head home-head-row reveal">
            <div>
              <span className="eyebrow">Explore</span>
              <h2>Featured projects</h2>
            </div>
            <Link className="text-link" href="/projects">
              View all {fmtNum(stats.listed)} projects <Icon name="arrow-right" className="icon icon-sm" />
            </Link>
          </header>

          {projects.length ? (
            <div className="pgrid">
              {projects.map((p) => (
                <ProjectCard key={p.reg} project={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="inbox" />
              No projects listed yet.
            </div>
          )}

          <div className="type-tiles">
            {TYPES.map((t) => (
              <Link key={t.type} className="type-tile reveal" href={`/projects?type=${encodeURIComponent(t.type)}`}>
                <span className="type-icon"><Icon name={t.icon} /></span>
                <span className="type-name">{t.type}</span>
                <span className="type-blurb">{t.blurb}</span>
                <Icon name="arrow-right" className="icon icon-sm type-go" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section-alt">
        <div className="container faq-wrap">
          <header className="home-head reveal">
            <span className="eyebrow">Buyer questions</span>
            <h2>Good questions to ask before you buy.</h2>
            <p>Can&rsquo;t find yours? <Link className="text-link" href="/contact">Ask us directly</Link>.</p>
          </header>
          <div className="faq">
            {FAQS.map((f) => (
              <details className="faq-item" key={f.q}>
                <summary>
                  {f.q}
                  <Icon name="plus" className="icon faq-icon" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container final-cta-inner reveal">
          <span className="eyebrow">Ready when you are</span>
          <h2>Your next home is one conversation away.</h2>
          <p>Tell us what you&rsquo;re looking for and we&rsquo;ll come back with a shortlist that actually fits.</p>
          <div className="btns">
            <Link className="btn btn-primary btn-lg" href="/contact">
              Talk to an advisor <Icon name="arrow-right" className="icon icon-sm" />
            </Link>
            <Link className="btn btn-ghost btn-lg" href="/projects">Browse projects</Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <BottomNav />
    </>
  );
}

/**
 * The newest project as an editorial split: photo mosaic on one side, the
 * buyer-facing facts and next steps on the other.
 */
function Spotlight({ project: p }: { project: ProjectView }) {
  const shots = p.gallery.slice(0, 3);
  const facts = [
    { k: "Configurations", v: p.configurations },
    { k: "Starting price", v: p.startingPrice },
    { k: "Possession", v: p.possession },
    { k: "Status", v: p.status },
  ].filter((f) => f.v);

  return (
    <section className="home-section" id="latest">
      <div className="container">
        <header className="home-head reveal">
          <span className="eyebrow">Just added</span>
          <h2>The latest project on AcreInfotech.</h2>
        </header>
        <div className="spot">
          <Link className={`spot-mosaic n${shots.length || 1}`} href={p.href} tabIndex={-1} aria-hidden="true">
            {shots.length ? (
              shots.map((g, i) => (
                <div className="spot-shot" key={g.url}>
                  <Image
                    src={g.url!}
                    alt=""
                    fill
                    sizes={i === 0 ? "(min-width: 1024px) 560px, 100vw" : "(min-width: 1024px) 280px, 50vw"}
                    draggable={false}
                  />
                </div>
              ))
            ) : (
              <div className="spot-shot pcard-placeholder"><Icon name="home" /></div>
            )}
          </Link>

          <div className="spot-body reveal">
            {p.type && <span className="spot-type">{p.type}</span>}
            <h3 className="spot-name">{p.name}</h3>
            {p.location && (
              <div className="spot-loc">
                <Icon name="map-pin" className="icon icon-sm" />
                {p.location}
              </div>
            )}
            {p.tagline && <p className="spot-tagline">{p.tagline}</p>}

            {facts.length > 0 && (
              <dl className="spot-facts">
                {facts.map((f) => (
                  <div key={f.k}>
                    <dt>{f.k}</dt>
                    <dd>{f.v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {p.highlights.length > 0 && (
              <ul className="spot-highlights">
                {p.highlights.slice(0, 4).map((h) => (
                  <li key={h}>
                    <Icon name="check" className="icon icon-sm" />
                    {h}
                  </li>
                ))}
              </ul>
            )}

            <div className="btns">
              <Link className="btn btn-primary" href={p.href}>
                Explore project <Icon name="arrow-right" className="icon icon-sm" />
              </Link>
              {p.brochureUrl && (
                <a className="btn btn-outline" href={p.brochureUrl} download={p.brochureFile} target="_blank" rel="noopener">
                  <Icon name="download" className="icon icon-sm" />
                  Brochure
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
