"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./IconSprite";

type Status = "idle" | "submitting" | "sent" | "error";

/**
 * The hero's "Enquire Now" button plus the modal it opens.
 *
 * Posts through the same /api/leads BFF route as ContactForm, so there's one
 * lead pipeline, not two. The project reference travels as a nested `project`
 * object rather than flattened fields so it reads unambiguously on the Java
 * side once that endpoint starts persisting it (see docs/detail-page.md,
 * "Known gaps" — the endpoint accepting the field is separate from Java
 * actually storing/using it).
 *
 * The button lives inside `.showcase-hero .content`, which pins `--text` to
 * its light-on-dark-photo value for everything under it (see that rule's own
 * comment in globals.css). `position: fixed` moves the modal's paint position
 * but NOT its place in the DOM, so without a portal it would still inherit
 * that override — near-white text on the modal's white card. Portalling to
 * `document.body` puts it under the real theme root instead.
 */
export function ProjectEnquiry({ registrationNo, projectName }: { registrationNo: string; projectName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>
        Enquire Now
      </button>
      {open &&
        createPortal(
          <EnquiryModal registrationNo={registrationNo} projectName={projectName} onClose={() => setOpen(false)} />,
          document.body,
        )}
    </>
  );
}

function EnquiryModal({
  registrationNo,
  projectName,
  onClose,
}: {
  registrationNo: string;
  projectName: string;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");

  // Starts closed and flips open a frame after mount, so the overlay/card's
  // CSS transitions (scrim fade, sheet slide-up on mobile) have a starting
  // frame to animate from instead of rendering already-open.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Without this, iOS Safari lets a swipe inside the (fixed-position) overlay
  // scroll-chain into the page behind it once the overlay itself runs out of
  // room to scroll — the background visibly moves under the modal.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

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
          source: "project_detail",
          project: { registration_no: registrationNo, project_name: projectName },
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      className={`enquiry-overlay${visible ? " open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Enquire about ${projectName}`}
      onClick={onClose}
    >
      <div className="enquiry-card" onClick={(e) => e.stopPropagation()}>
        <div className="enquiry-sheet-handle" aria-hidden="true" />
        <div className="enquiry-head">
          <div>
            <div className="showcase-eyebrow">Enquire about</div>
            <h2>{projectName}</h2>
          </div>
          <button type="button" className="enquiry-close" aria-label="Close" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>

        {status === "sent" ? (
          <div className="notice">
            <Icon name="shield" />
            <div>
              <strong>Thanks — we&rsquo;ve got your enquiry.</strong>
              <div style={{ marginTop: "4px" }}>Our team will get back to you shortly about {projectName}.</div>
            </div>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="eq-name">Name</label>
              <input id="eq-name" name="name" type="text" required maxLength={200} autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="eq-email">Email</label>
              <input id="eq-email" name="email" type="email" required maxLength={200} autoComplete="email" />
            </div>
            <div className="field">
              <label htmlFor="eq-phone">Phone (optional)</label>
              <input id="eq-phone" name="phone" type="tel" maxLength={30} autoComplete="tel" />
            </div>
            <div className="field">
              <label htmlFor="eq-message">Message</label>
              <textarea
                id="eq-message"
                name="message"
                required
                maxLength={4000}
                rows={4}
                defaultValue={`I'm interested in ${projectName}.`}
              />
            </div>

            {status === "error" && (
              <div className="notice">
                <Icon name="info" />
                <div>Something went wrong sending your enquiry. Please try again, or reach us directly on the Contact page.</div>
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending…" : "Send enquiry"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
