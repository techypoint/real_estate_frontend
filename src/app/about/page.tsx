import Link from "next/link";
import { api } from "@/lib/api";
import { fmtNum } from "@/lib/format";
import { Icon } from "@/components/IconSprite";
import { BottomNav } from "@/components/SiteChrome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "AcreInfotech helps you find the right home — an independent directory of real estate projects, checked against official RERA records, with you all the way from search to keys.",
  alternates: { canonical: "/about" },
};

const STEPS = [
  {
    icon: "search",
    title: "Search & explore",
    body: "Browse projects that fit your budget and needs, and see the real record behind each one — not just the sales pitch.",
  },
  {
    icon: "mail",
    title: "Tell us what you need",
    body: "Send an enquiry with your budget, configuration and timeline.",
  },
  {
    icon: "heart",
    title: "We take it from there",
    body: "We arrange site visits, help you negotiate, and guide you through the paperwork — all the way to closing.",
  },
] as const;

export default async function AboutPage() {
  const stats = await api.stats();

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1 className="rise-in rise-in-1">About AcreInfotech</h1>
          <p className="rise-in rise-in-2">
            We help you find the right home — an independent directory of real estate projects,
            checked against official RERA records so you can research with confidence before you buy.
          </p>
        </div>
      </section>

      <div className="container">
        <div className="showcase-content">
          <section className="showcase-section">
            <div className="showcase-eyebrow">Why we exist</div>
            <h2>Not the builder&rsquo;s version. The real one.</h2>
            <p className="prose">
              Most listings are copy-pasted from a brochure. We source every project from its official RERA
              filing &mdash; promoter details, bank accounts, land records, sanctioned dates &mdash; before it
              ever reaches you.
            </p>
          </section>

          <section className="showcase-section">
            <div className="showcase-eyebrow">How it works</div>
            <h2>From search to keys, we&rsquo;re with you the whole way</h2>
            <ol className="rail">
              {STEPS.map((s) => (
                <li className="rail-step" key={s.title}>
                  <span className="rail-node">
                    <Icon name={s.icon} />
                  </span>
                  <div className="rail-body">
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="showcase-section">
            <div className="stats">
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
        </div>
      </div>

      <section className="cta-banner">
        <div className="container">
          <h2>Ready to start looking?</h2>
          <p>Browse projects that fit what you&rsquo;re looking for, or reach out directly if you already know what you need.</p>
          <div className="btns">
            <Link className="btn btn-primary" href="/projects">Browse Projects</Link>
            <Link className="btn btn-outline" href="/contact">Contact Us</Link>
          </div>
        </div>
      </section>

      <BottomNav />
    </>
  );
}
