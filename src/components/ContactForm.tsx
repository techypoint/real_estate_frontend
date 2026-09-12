"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "./IconSprite";

type Status = "idle" | "submitting" | "sent" | "error";

/**
 * Posts to the Next BFF route (/api/leads), which forwards to the Java lead
 * endpoint — same pipeline chat-sourced leads will use later (CLAUDE.md).
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("submitting");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
        }),
      });
      if (!res.ok) throw new Error("request failed");
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
          <div style={{ marginTop: "4px" }}>Our team will get back to you shortly.</div>
        </div>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="cf-name">Name</label>
        <input id="cf-name" name="name" type="text" required maxLength={200} autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="cf-email">Email</label>
        <input id="cf-email" name="email" type="email" required maxLength={200} autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="cf-phone">Phone (optional)</label>
        <input id="cf-phone" name="phone" type="tel" maxLength={30} autoComplete="tel" />
      </div>
      <div className="field">
        <label htmlFor="cf-message">Message</label>
        <textarea id="cf-message" name="message" required maxLength={4000} rows={5} />
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
