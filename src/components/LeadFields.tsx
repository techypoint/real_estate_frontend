"use client";

import { useEffect } from "react";
import { BUDGET_OPTIONS, PURPOSE_OPTIONS, TIMELINE_OPTIONS, captureFirstTouch } from "@/lib/leads";

/**
 * Mounted once in the root layout: records the visitor's first-touch source
 * (UTM params / referrer / landing page) so whichever lead form they submit
 * later can credit it. Renders nothing.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureFirstTouch();
  }, []);
  return null;
}

/**
 * Name / phone / email plus the three qualifying selects, shared by
 * ContactForm and the project enquiry modal. `idPrefix` keeps label/input
 * ids unique when both forms could be on one page.
 */
export function LeadFields({ idPrefix }: { idPrefix: string }) {
  return (
    <>
      <div className="field">
        <label htmlFor={`${idPrefix}-name`}>Name</label>
        <input id={`${idPrefix}-name`} name="name" type="text" required maxLength={200} autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-phone`}>Phone</label>
        <input
          id={`${idPrefix}-phone`}
          name="phone"
          type="tel"
          required
          maxLength={30}
          pattern="[+0-9 ()\-]{7,30}"
          title="Please enter a valid phone number"
          autoComplete="tel"
        />
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-email`}>Email (optional)</label>
        <input id={`${idPrefix}-email`} name="email" type="email" maxLength={200} autoComplete="email" />
      </div>
      <SelectField id={`${idPrefix}-budget`} name="budget" label="Budget" options={BUDGET_OPTIONS} />
      <SelectField id={`${idPrefix}-timeline`} name="timeline" label="When are you planning to buy?" options={TIMELINE_OPTIONS} />
      <SelectField id={`${idPrefix}-purpose`} name="purpose" label="Buying for" options={PURPOSE_OPTIONS} />
    </>
  );
}

function SelectField({ id, name, label, options }: { id: string; name: string; label: string; options: string[] }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} name={name} required defaultValue="">
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
