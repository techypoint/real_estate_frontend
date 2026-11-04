import type { Metadata } from "next";
import { api } from "@/lib/api";
import { fmtNum } from "@/lib/format";
import { LinkCloud } from "@/components/LeadBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BottomNav } from "@/components/SiteChrome";
import { Icon } from "@/components/IconSprite";
import { SourceNote } from "@/components/SourceNote";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Builders in Uttar Pradesh — Projects by Developer",
  description:
    "Browse real estate developers in Uttar Pradesh and their RERA-registered projects — brochures, floor plans and possession dates on AcreInfotech.",
  alternates: { canonical: "/builders" },
};

export default async function BuildersPage() {
  const builders = await api.builders();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs path="/builders" items={[{ name: "Home", href: "/" }, { name: "Builders" }]} />
          <span className="eyebrow">Developers across Uttar Pradesh</span>
          <h1>Browse by builder.</h1>
          <p>
            {fmtNum(builders.length)} builder{builders.length === 1 ? "" : "s"} with projects on AcreInfotech — more
            are added as we publish new projects.
          </p>
        </div>
      </section>

      <div className="container listing-body">
        {builders.length ? (
          <LinkCloud
            title="All builders"
            links={builders.map((b) => ({
              href: `/builder/${b.slug}`,
              label: `${b.name} (${b.projectCount})`,
            }))}
          />
        ) : (
          <div className="empty-state">
            <Icon name="inbox" />
            No builders to show yet.
          </div>
        )}
        <SourceNote />
      </div>

      <BottomNav />
    </>
  );
}
