import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { api, ApiError } from "@/lib/api";
import { fmtMeasure, fmtMonth } from "@/lib/format";
import { buildContentSections } from "@/components/sections/registry";
import { buildReraSections } from "@/components/sections/ReraSections";
import { BottomNav } from "@/components/SiteChrome";
import { Icon } from "@/components/IconSprite";
import type { Project } from "@/lib/types";
import { projectSlug, regFromSlug } from "@/lib/slug";

/**
 * Short, non-data UI copy only — never a project fact. One line per content
 * section id, shown above its heading in the Overview tab. Same six lines
 * for every project; the section's own h2 title still carries the real,
 * data-driven name.
 */
const SECTION_EYEBROW: Record<string, string> = {
  "sec-gallery": "A closer look",
  "sec-configurations": "Find your fit",
  "sec-amenities": "Everyday life here",
  "sec-clubs": "Shared spaces",
  "sec-master-plan": "The bigger picture",
  "sec-location": "Getting around",
};

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

/**
 * Pre-render a bounded slice of published projects at build time; every other
 * published (or unpublished) project still resolves correctly on its first
 * visit — dynamicParams defaults to true — and is cached from that point on.
 *
 * Deliberately NOT "every published project": at today's ~1,119 that would be
 * fine, but this list is what a lakh-scale catalogue would try to fully
 * pre-render on every deploy, turning the build itself into the bottleneck.
 * Capping it keeps the build fast regardless of catalogue size; the cap is a
 * placeholder for a real "hot pages" query (recent / high-traffic) once that
 * signal exists. When a curator publishes, the Java side calls /api/revalidate
 * to regenerate that one page on demand — see CLAUDE.md.
 */
const MAX_PREBUILT_PROJECTS = 200;

export async function generateStaticParams() {
  try {
    const refs = await api.publishedProjectRefs();
    return refs
      .slice(0, MAX_PREBUILT_PROJECTS)
      .map((ref) => ({ slug: projectSlug(ref.name, ref.registration_no) }));
  } catch {
    // A backend that is down at build time should not fail the build; pages
    // fall back to on-demand rendering.
    return [];
  }
}

async function fetchProject(reg: string): Promise<Project> {
  try {
    return await api.getProject(reg);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const reg = regFromSlug(slug);
  let project: Project;
  try {
    project = await api.getProject(reg);
  } catch {
    return { title: "Project not found" };
  }

  const c = project.content;
  const name = c?.marketing?.display_name || project.project_name || reg;
  const where = [c?.marketing?.locality, c?.marketing?.city ?? project.district].filter(Boolean).join(", ");
  const bhks = [...new Set((c?.unit_types ?? []).map((u) => u.bhk))].sort();

  const description = [
    `${name}${where ? ` in ${where}` : ""}.`,
    bhks.length ? `${bhks.join(" & ")} BHK.` : "",
    `RERA ${project.registration_no}.`,
    "Floor plans, configurations and approved documents.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title: `${name}${where ? ` — ${where}` : ""}`,
    description,
    alternates: { canonical: `/project/${projectSlug(name, project.registration_no)}` },
    openGraph: { title: name, description, type: "article" },
  };
}

/**
 * schema.org markup so search and AI crawlers get the facts structurally, not
 * only as prose. Same grounding data the chatbot will retrieve over later.
 */
function JsonLd({ project }: { project: Project }) {
  const c = project.content;
  const name = c?.marketing?.display_name || project.project_name || project.registration_no;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name,
    identifier: project.registration_no,
    address: {
      "@type": "PostalAddress",
      streetAddress: project.project_address || undefined,
      addressLocality: c?.marketing?.locality || project.district,
      addressRegion: project.state || "Uttar Pradesh",
      addressCountry: "IN",
    },
  };

  if (project.promoter_name) {
    data.provider = { "@type": "Organization", name: project.promoter_name };
  }
  if (c?.scale?.total_units) data.numberOfAccommodationUnits = c.scale.total_units;

  const units = c?.unit_types ?? [];
  if (units.length) {
    data.containsPlace = units.map((u) => ({
      "@type": "Apartment",
      name: [u.tower_family, u.variant].filter(Boolean).join(" — ") || `${u.bhk} BHK`,
      numberOfRooms: u.bhk,
      floorSize: u.areas?.super?.sqft
        ? { "@type": "QuantitativeValue", value: u.areas.super.sqft, unitCode: "FTK" }
        : undefined,
    }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function Fact({ k, v }: { k: string; v?: string | number | null }) {
  if (v === undefined || v === null || v === "") return null;
  return (
    <div className="fact">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const reg = regFromSlug(slug);
  const project = await fetchProject(reg);
  const c = project.content;

  const displayName = c?.marketing?.display_name || project.project_name || project.registration_no;

  // Old bare-registration-number links, a stale project name in the slug
  // (renamed since), or a hand-typed URL all still resolve here (the
  // registration number is authoritative) — but redirect to the current
  // canonical slug so search engines consolidate onto one URL per project.
  const canonicalSlug = projectSlug(displayName, project.registration_no);
  if (slug !== canonicalSlug) permanentRedirect(`/project/${canonicalSlug}`);

  // Two intents, two tabs (see the design brief): Overview sells the project
  // — brochure content only. Legal Data is the UP-RERA compliance record —
  // documents, promoter, bank accounts, land records, agents. They no longer
  // share one scroll, so each keeps its own section list.
  const contentSections = buildContentSections(c);
  const reraSections = project.has_detail ? buildReraSections(project) : [];
  const hasLegalTab = reraSections.length > 0;

  const bhkList = [...new Set((c?.unit_types ?? []).map((u) => u.bhk))].sort((a, b) => a - b);
  const configurations = bhkList.length ? `${bhkList.join(", ")} BHK` : undefined;

  // The hero photo is the gallery's own lead image (lowest `order`) — the
  // schema has no separate "hero" flag, so this is a convention, not an
  // enforced one. See the section registry note on GallerySection.
  const heroImage = [...(c?.gallery ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
  const highlights = c?.marketing?.highlights ?? [];

  const hero = (
    <div className="showcase-shell">
      <div className="showcase-hero" id="sec-overview">
        {heroImage?.url && (
          <div className="hero-img">
            <Image src={heroImage.url} alt={heroImage.alt || displayName} fill sizes="100vw" priority />
          </div>
        )}
        <div className="scrim" />
        <div className="content">
          {project.has_detail && <span className="showcase-badge">RERA Verified · {project.registration_no}</span>}
          <h1>{displayName}</h1>
          <div className="loc">
            {[project.promoter_name, c?.marketing?.locality, c?.marketing?.city ?? project.district]
              .filter(Boolean)
              .join(" — ")}
          </div>
          {c?.marketing?.tagline && <div className="tagline">{c.marketing.tagline}</div>}

          <div className="showcase-facts">
            <Fact k="Configurations" v={configurations} />
            <Fact k="Possession" v={fmtMonth(c?.marketing?.possession_on)} />
            <Fact k="Land parcel" v={fmtMeasure(c?.scale?.land_area)} />
            <div className="showcase-cta">
              <div className="btns">
                <button className="btn btn-outline" type="button">Download Brochure</button>
                <button className="btn btn-primary" type="button">Enquire Now</button>
              </div>
              <span className="note">Not wired yet — no brochure file or lead endpoint exists</span>
            </div>
          </div>
        </div>
      </div>

      {highlights.length > 0 && (
        <div className="showcase-highlights">
          {highlights.map((h) => (
            <div className="h" key={h}>{h}</div>
          ))}
        </div>
      )}

      {!project.has_detail && !contentSections.length && (
        <div className="notice" style={{ margin: "var(--sp-5)" }}>
          <Icon name="info" className="icon icon-sm" />
          <span>
            Full project detail (bank accounts, unit inventory, documents, agents) has not been
            captured for this project yet. Only the basic registry listing is available.
          </span>
        </div>
      )}
    </div>
  );

  const overviewSections = (
    <div className="showcase-content">
      {contentSections.map((s) => (
        <section className="showcase-section" id={s.id} key={s.id}>
          {SECTION_EYEBROW[s.id] && <div className="showcase-eyebrow">{SECTION_EYEBROW[s.id]}</div>}
          <h2>
            {s.title}
            {s.count !== undefined && <span className="n">({s.count})</span>}
          </h2>
          {s.node}
        </section>
      ))}
    </div>
  );

  const legalPanel = hasLegalTab && (
    <div className="tab-panel tab-panel-legal">
      <div className="legal-head">
        <div className="showcase-eyebrow">UP-RERA Registry Record</div>
        <h2>Legal Data</h2>
        <p>Every fact UP-RERA holds on file for this project — documents, the full unit/plan
          inventory, promoter, bank accounts, land records and agents, exactly as filed.</p>
        <div className="legal-regfacts">
          <div className="row"><span className="k">Registration No.</span><span className="v">{project.registration_no}</span></div>
          <div className="row"><span className="k">Registration Date</span><span className="v">{project.registration_date ?? "—"}</span></div>
          <div className="row"><span className="k">Declared Completion</span><span className="v">{project.declared_completion_date ?? "—"}</span></div>
          <div className="row"><span className="k">Tehsil</span><span className="v">{project.tehsil ?? "—"}</span></div>
        </div>
      </div>
      {reraSections.map((s) => (
        <section className="section-block" id={s.id} key={s.id}>
          <h2>
            {s.title}
            {s.count !== undefined && <span className="n">({s.count})</span>}
          </h2>
          {s.node}
        </section>
      ))}
    </div>
  );

  return (
    <>
      <JsonLd project={project} />

      {hasLegalTab && (
        <>
          <input type="radio" name="dtab" id="tab-overview" className="tab-radio" defaultChecked />
          <input type="radio" name="dtab" id="tab-legal" className="tab-radio" />
        </>
      )}

      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <Link href="/projects">Projects</Link> /{" "}
          <span>{displayName}</span>
        </div>

        {hero}

        {hasLegalTab ? (
          <>
            <div className="detail-tabs">
              <label htmlFor="tab-overview">Overview</label>
              <label htmlFor="tab-legal">Legal Data</label>
            </div>
            <div className="tab-panel tab-panel-overview">{overviewSections}</div>
            {legalPanel}
          </>
        ) : (
          overviewSections
        )}
      </div>

      {hasLegalTab ? (
        <BottomNav>
          <label className="bn-item" htmlFor="tab-overview">
            <span className="icon-wrap">
              <Icon name="cube" />
            </span>
            Overview
          </label>
          <label className="bn-item" htmlFor="tab-legal">
            <span className="icon-wrap">
              <Icon name="shield" />
            </span>
            Legal Data
          </label>
        </BottomNav>
      ) : (
        <BottomNav />
      )}
    </>
  );
}
