"use client";

import { useState, type FormEvent } from "react";
import { submitLead } from "@/lib/leads";
import { Icon } from "./IconSprite";
import { LeadFields } from "./LeadFields";

type Status = "idle" | "submitting" | "sent" | "error";

/**
 * Posts to the Next BFF route (/api/leads) via submitLead, which forwards to
 * the Java lead endpoint — same pipeline chat-sourced leads will use later
 * (CLAUDE.md).
 */
/** `source` records which page the lead came from (contact page, a district page, a builder page). */
export function ContactForm({ source = "contact_page" }: { source?: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("submitting");

    try {
      await submitLead(data, { source });
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="notice">
        <Icon name="shield" />
        <div>
          <strong>Thanks — we&rsquo;ve got your message.</strong>
          <div style={{ marginTop: "4px" }}>Our team will call or WhatsApp you shortly.</div>
        </div>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <LeadFields idPrefix="cf" />
      <div className="field">
        <label htmlFor="cf-message">Message (optional)</label>
        <textarea id="cf-message" name="message" maxLength={4000} rows={5} />
      </div>

      {status === "error" && (
        <div className="notice">
          <Icon name="info" />
          <div>Something went wrong sending your message. Please try again, or reach us directly below.</div>
        </div>
      )}

      <button className="btn btn-primary" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
