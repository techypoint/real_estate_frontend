import { Icon } from "@/components/IconSprite";
import { ContactForm } from "@/components/ContactForm";
import { BottomNav } from "@/components/SiteChrome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with AcreInfotech — send an enquiry, or reach us directly by email.",
  alternates: { canonical: "/contact" },
};

const EMAIL = "founder@acreinfotech.com";

export default function ContactPage() {
  return (
    <>
      <div className="split-panel">
        <div className="panel panel-info">
          <div className="panel-inner">
            <div className="showcase-eyebrow">Get in touch</div>
            <h1>Let&rsquo;s find your next home</h1>
            <p className="prose">
              Tell us what you&rsquo;re looking for and we&rsquo;ll take it from there &mdash; site visits,
              negotiation, paperwork, all handled.
            </p>
            <div className="doc-list">
              <div className="doc-item">
                <span className="doc-icon">
                  <Icon name="mail" />
                </span>
                <div className="doc-info">
                  <div className="doc-name">Email</div>
                  <div className="doc-sub">{EMAIL}</div>
                </div>
                <div className="doc-actions">
                  <a href={`mailto:${EMAIL}`}>Email</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel panel-form">
          <div className="panel-inner">
            <ContactForm />
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  );
}
