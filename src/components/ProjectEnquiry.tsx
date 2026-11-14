"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { trackEvent } from "@/lib/analytics";
import { RERA_BADGE_LABEL } from "@/lib/copy";
import { BUDGET_OPTIONS, PURPOSE_OPTIONS, TIMELINE_OPTIONS, submitLead } from "@/lib/leads";
import { Icon } from "./IconSprite";

/** What the sheet shows about the project it is enquiring on. All optional: a project with no photo or facts still works. */
export type EnquiryContext = {
  cover?: { url: string; alt?: string };
  developer?: string;
  /** True when the project has its full UP-RERA record. */
  verified?: boolean;
  facts?: { label: string; value: string }[];
  brochureUrl?: string;
  brochureFile?: string;
};

type Status = "idle" | "submitting" | "sent" | "error";

/** Chip label for the longer option texts; the submitted value is always the full option. */
const TIMELINE_LABEL: Record<string, string> = {
  Immediately: "Now",
  "Within 3 months": "3 months",
  "Just exploring": "Exploring",
};

/** What the buyer wants from the call. Becomes part of the free-text `message` the lead API already has. */
const INTENTS = [
  { label: "Book a site visit", phrase: "book a site visit" },
  { label: "Price & payment plan", phrase: "get the price and payment plan" },
  { label: "Brochure & plans", phrase: "get the brochure and floor plans" },
];

type Contact = "Call" | "WhatsApp";

/**
 * Phone input shape. Default is an Indian mobile (+91 is shown as a fixed
 * prefix, the buyer types 10 digits, grouped 5 + 5). Typing or pasting a
 * leading "+" switches to an international number (NRI buyers), which is only
 * length-checked. The Java API accepts either: ^[+0-9 ()-]{7,30}$.
 */
function formatPhone(raw: string): string {
  if (raw.trimStart().startsWith("+")) return "+" + raw.replace(/\D/g, "").slice(0, 15);
  let d = raw.replace(/\D/g, "");
  if (d.length > 10 && d.startsWith("91")) d = d.slice(2); // pasted with country code
  if (d.startsWith("0")) d = d.slice(1); // pasted with trunk 0
  d = d.slice(0, 10);
  return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
}

/** The number to send, or null when it isn't valid. */
function phoneValue(display: string): string | null {
  if (display.startsWith("+")) {
    const d = display.slice(1);
    return /^\d{7,15}$/.test(d) ? `+${d}` : null;
  }
  const d = display.replace(/\s/g, "");
  return /^[6-9]\d{9}$/.test(d) ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : null;
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * The text sent as the lead's `message`.
 *
 * "Reach me by" has no field on the lead API yet, so a WhatsApp preference
 * travels as a sentence here. A proper field belongs with the agency CRM work
 * (cofounder Task 11); until then the agency reads it in the notification.
 */
function composeMessage(projectName: string, intents: string[], contact: Contact): string {
  let text = `I'm interested in ${projectName}.`;
  if (intents.length) {
    const list = [...intents];
    const last = list.pop() as string;
    text += ` I'd like to ${list.length ? `${list.join(", ")} and ${last}` : last}.`;
  }
  if (contact === "WhatsApp") text += " Please reach me on WhatsApp.";
  return text;
}

/**
 * The hero's "Enquire Now" button plus the sheet it opens.
 *
 * Posts through the same submitLead / /api/leads route as ContactForm, so
 * there's one lead pipeline, not two. The project reference travels as a
 * nested `project` object, which Java stores on the lead and puts in the
 * founder notification email.
 *
 * The button lives inside `.showcase-hero .content`, which pins `--text` to
 * its light-on-dark-photo value for everything under it (see that rule's own
 * comment in globals.css). `position: fixed` moves the modal's paint position
 * but NOT its place in the DOM, so without a portal it would still inherit
 * that override — near-white text on the modal's white card. Portalling to
 * `document.body` puts it under the real theme root instead.
 */
export function ProjectEnquiry({
  registrationNo,
  projectName,
  context = {},
}: {
  registrationNo: string;
  projectName: string;
  context?: EnquiryContext;
}) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Hand focus back to the button when the sheet closes.
  useEffect(() => {
    if (wasOpen.current && !open) opener.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <>
      <button ref={opener} className="btn btn-primary" type="button" onClick={() => setOpen(true)}>
        Enquire Now
      </button>
      {open &&
        createPortal(
          <EnquirySheet
            registrationNo={registrationNo}
            projectName={projectName}
            context={context}
            onClose={() => setOpen(false)}
          />,
          document.body,
        )}
    </>
  );
}

function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" className="eq-chip" aria-pressed={on} onClick={onClick}>
      <Icon name="check" />
      {label}
    </button>
  );
}

function EnquirySheet({
  registrationNo,
  projectName,
  context,
  onClose,
}: {
  registrationNo: string;
  projectName: string;
  context: EnquiryContext;
  onClose: () => void;
}) {
  const uid = useId();
  const id = (s: string) => `${uid}-${s}`;

  const [status, setStatus] = useState<Status>("idle");
  const [attempted, setAttempted] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [purpose, setPurpose] = useState("");
  const [intents, setIntents] = useState<string[]>([]);
  const [contact, setContact] = useState<Contact>("Call");
  const [sentTo, setSentTo] = useState({ first: "", phone: "", contact: "Call" as Contact });

  const cardRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Funnel for GA4: enquiry_open -> enquiry_start -> generate_lead, with
  // enquiry_abandon for the ones who leave. No personal data in any of them.
  const progress = useRef({ started: false, sent: false });
  const started = () => {
    if (progress.current.started) return;
    progress.current.started = true;
    trackEvent("enquiry_start", { project: registrationNo });
  };
  useEffect(() => {
    trackEvent("enquiry_open", { project: registrationNo });
  }, [registrationNo]);

  const close = useCallback(() => {
    if (!progress.current.sent) {
      trackEvent("enquiry_abandon", { project: registrationNo, started: progress.current.started });
    }
    onClose();
  }, [onClose, registrationNo]);

  // Starts closed and flips open a frame after mount, so the overlay/card's
  // CSS transitions (scrim fade, sheet slide-up on mobile) have a starting
  // frame to animate from instead of rendering already-open.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Keyboard users land inside the dialog rather than on the page behind it.
  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

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

  const nameOk = name.trim().length >= 2;
  const phoneOut = phoneValue(phone);
  const emailOk = !email.trim() || EMAIL_RE.test(email.trim());
  const nameBad = attempted && !nameOk;
  const phoneBad = attempted && !phoneOut;
  const emailBad = attempted && !emailOk;
  const left = (nameOk ? 0 : 1) + (phoneOut ? 0 : 1);
  const message = composeMessage(projectName, intents, contact);

  function pick(current: string, value: string, set: (v: string) => void) {
    started();
    set(current === value ? "" : value);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAttempted(true);
    if (!nameOk || !phoneOut || !emailOk) {
      trackEvent("enquiry_invalid", { project: registrationNo });
      (!nameOk ? nameRef : !phoneOut ? phoneRef : emailRef).current?.focus();
      return;
    }

    setStatus("submitting");
    const data = new FormData();
    data.set("name", name.trim());
    data.set("phone", phoneOut);
    if (email.trim()) data.set("email", email.trim());
    data.set("message", message);
    if (budget) data.set("budget", budget);
    if (timeline) data.set("timeline", timeline);
    if (purpose) data.set("purpose", purpose);

    try {
      await submitLead(data, {
        source: "project_detail",
        project: { registration_no: registrationNo, project_name: projectName },
      });
      progress.current.sent = true;
      setSentTo({ first: name.trim().split(/\s+/)[0], phone: phoneOut, contact });
      setStatus("sent");
      trackEvent("generate_lead", {
        project: registrationNo,
        source: "project_detail",
        optional_answers: [budget, timeline, purpose].filter(Boolean).length + (intents.length ? 1 : 0),
        contact_pref: contact,
      });
    } catch {
      setStatus("error");
      trackEvent("enquiry_error", { project: registrationNo });
    }
  }

  const { cover, developer, verified, facts = [], brochureUrl, brochureFile } = context;

  return (
    <div className={`eq-overlay${visible ? " open" : ""}`} onClick={close}>
      <div
        ref={cardRef}
        className="eq-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={id("title")}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="eq-grab" aria-hidden="true" />

        <aside className={`eq-proj${cover ? " has-photo" : ""}`}>
          {cover && (
            <div className="eq-photo">
              <Image src={cover.url} alt="" fill sizes="(min-width: 720px) 320px, 64px" />
            </div>
          )}
          <div className="eq-meta">
            <div className="eq-kick">Enquire about</div>
            <h2 id={id("title")}>{projectName}</h2>
            {developer && <div className="eq-by">{developer}</div>}
            {verified && (
              <div className="eq-verified">
                <Icon name="shield" />
                {RERA_BADGE_LABEL}
              </div>
            )}
            {facts.length > 0 && (
              <ul className="eq-facts">
                {facts.map((f) => (
                  <li key={f.label}>
                    <span>{f.label}</span>
                    <b>{f.value}</b>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <button type="button" className="eq-close" aria-label="Close" onClick={close}>
          <Icon name="x" />
        </button>

        {status === "sent" ? (
          <div className="eq-success" role="status">
            <div className="eq-tick">
              <Icon name="check" />
            </div>
            <div className="eq-ok-head">
              <h3>We&rsquo;ve got it, {sentTo.first}.</h3>
              <p>
                Our team will reach you on <b>{sentTo.phone}</b> about <b>{projectName}</b>.
              </p>
            </div>
            <ul className="eq-next">
              <li>
                <Icon name="phone" />
                <div>
                  <strong>{sentTo.contact === "WhatsApp" ? "A message from our team" : "A call from our team"}</strong>
                  <span>
                    {sentTo.contact === "WhatsApp"
                      ? "We'll reach you on WhatsApp first."
                      : "We'll call you on the number you gave."}
                  </span>
                </div>
              </li>
              {brochureUrl && (
                <li>
                  <Icon name="file" />
                  <div>
                    <strong>While you wait</strong>
                    <span>The brochure and floor plans are one tap away.</span>
                  </div>
                </li>
              )}
            </ul>
            <div className="eq-acts">
              {brochureUrl && (
                <a className="eq-act" href={brochureUrl} download={brochureFile} target="_blank" rel="noopener">
                  <Icon name="download" />
                  Download brochure
                </a>
              )}
              <button type="button" className="eq-act" onClick={close}>
                Back to the project
              </button>
            </div>
          </div>
        ) : (
          <form className="eq-main" noValidate onSubmit={handleSubmit}>
            <div className="eq-body">
              <div className="eq-field">
                <label htmlFor={id("name")}>Your name</label>
                <div className={`eq-input${nameBad ? " bad" : ""}`}>
                  <input
                    ref={nameRef}
                    id={id("name")}
                    type="text"
                    value={name}
                    maxLength={200}
                    autoComplete="name"
                    placeholder="e.g. Rohit Sharma"
                    aria-invalid={nameBad}
                    aria-describedby={nameBad ? id("name-err") : undefined}
                    onChange={(e) => {
                      started();
                      setName(e.target.value);
                    }}
                  />
                </div>
                {nameBad && (
                  <div className="eq-err" id={id("name-err")}>
                    Please tell us your name.
                  </div>
                )}
              </div>

              <div className="eq-field">
                <label htmlFor={id("phone")}>Mobile number</label>
                <div className={`eq-input${phoneBad ? " bad" : ""}`}>
                  {!phone.startsWith("+") && <span className="eq-pre">+91</span>}
                  <input
                    ref={phoneRef}
                    id={id("phone")}
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    autoComplete="tel"
                    placeholder={phone.startsWith("+") ? "+971 50 123 4567" : "98765 43210"}
                    aria-invalid={phoneBad}
                    aria-describedby={phoneBad ? id("phone-err") : undefined}
                    onChange={(e) => {
                      started();
                      setPhone(formatPhone(e.target.value));
                    }}
                  />
                </div>
                {phoneBad && (
                  <div className="eq-err" id={id("phone-err")}>
                    Enter a 10-digit mobile number, or start with + for an international number.
                  </div>
                )}
              </div>

              <div className="eq-divider">
                Optional <small>A few taps help the right person call you</small>
              </div>

              <div className="eq-group" role="group" aria-label="Budget">
                <div className="eq-lab">Budget</div>
                <div className="eq-chips">
                  {BUDGET_OPTIONS.map((o) => (
                    <Chip key={o} label={o} on={budget === o} onClick={() => pick(budget, o, setBudget)} />
                  ))}
                </div>
              </div>

              <div className="eq-group" role="group" aria-label="Planning to buy">
                <div className="eq-lab">Planning to buy</div>
                <div className="eq-chips">
                  {TIMELINE_OPTIONS.map((o) => (
                    <Chip
                      key={o}
                      label={TIMELINE_LABEL[o] ?? o}
                      on={timeline === o}
                      onClick={() => pick(timeline, o, setTimeline)}
                    />
                  ))}
                </div>
              </div>

              <div className="eq-group" role="group" aria-label="Buying for">
                <div className="eq-lab">Buying for</div>
                <div className="eq-chips two">
                  {PURPOSE_OPTIONS.map((o) => (
                    <Chip key={o} label={o} on={purpose === o} onClick={() => pick(purpose, o, setPurpose)} />
                  ))}
                </div>
              </div>

              <div className="eq-group" role="group" aria-label="I would like to">
                <div className="eq-lab">
                  I&rsquo;d like to <span className="eq-opt">pick any</span>
                </div>
                <div className="eq-chips">
                  {INTENTS.map((i) => (
                    <Chip
                      key={i.phrase}
                      label={i.label}
                      on={intents.includes(i.phrase)}
                      onClick={() => {
                        started();
                        setIntents((cur) => (cur.includes(i.phrase) ? cur.filter((p) => p !== i.phrase) : [...cur, i.phrase]));
                      }}
                    />
                  ))}
                </div>
                <div className="eq-sends">
                  Sends as: <b>{message}</b>
                </div>
              </div>

              <div className="eq-group" role="group" aria-label="Reach me by">
                <div className="eq-lab">Reach me by</div>
                <div className="eq-chips two">
                  {(["Call", "WhatsApp"] as const).map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      on={contact === c}
                      onClick={() => {
                        started();
                        setContact(c);
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="eq-field">
                {showEmail ? (
                  <>
                    <label htmlFor={id("email")}>
                      Email <span className="eq-opt">optional</span>
                    </label>
                    <div className={`eq-input${emailBad ? " bad" : ""}`}>
                      <input
                        ref={emailRef}
                        id={id("email")}
                        type="email"
                        value={email}
                        maxLength={200}
                        autoComplete="email"
                        placeholder="you@example.com"
                        aria-invalid={emailBad}
                        aria-describedby={emailBad ? id("email-err") : undefined}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {emailBad && (
                      <div className="eq-err" id={id("email-err")}>
                        Check the email address, or leave it blank.
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    className="eq-link"
                    onClick={() => {
                      started();
                      setShowEmail(true);
                    }}
                  >
                    <Icon name="plus" />
                    Add an email for the brochure
                  </button>
                )}
              </div>
            </div>

            <div className="eq-foot">
              {status === "error" && (
                <div className="notice">
                  <Icon name="info" />
                  <div>Something went wrong sending your enquiry. Please try again, or reach us directly on the Contact page.</div>
                </div>
              )}
              <div className="eq-meter" aria-live="polite">
                <span className="eq-bars" aria-hidden="true">
                  <i className={nameOk ? "on" : ""} />
                  <i className={phoneOut ? "on" : ""} />
                </span>
                {left === 0 ? "Ready to send" : `${left} required left · the rest is optional`}
              </div>
              <button className="eq-cta" type="submit" disabled={status === "submitting"}>
                <Icon name="phone" />
                {status === "submitting" ? "Sending…" : "Request a callback"}
              </button>
              <div className="eq-assure">
                <Icon name="shield" />
                <span>Free to enquire. We only use your number to call you about this project.</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
