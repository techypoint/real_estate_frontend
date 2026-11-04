import type { AuditEntry } from "@/lib/adminApi";

/** A short readable value for a before/after cell — rows show their name, lists their length. */
function summarize(v: unknown): string {
  if (v === undefined || v === null) return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `${v.length} item${v.length === 1 ? "" : "s"}`;
  const o = v as Record<string, unknown>;
  const parts = [o.name, Array.isArray(o.match) ? `match: ${(o.match as string[]).join(" | ") || "—"}` : undefined].filter(Boolean);
  return parts.join(" · ") || JSON.stringify(v).slice(0, 120);
}

/** Admin-panel changes, newest first — what replaced git history for the lists and content (see AdminAuditLog in Java). */
export function AuditList({ entries, showTarget = false }: { entries: AuditEntry[]; showTarget?: boolean }) {
  if (!entries.length) return <p className="adm-hint">No changes made from the admin panel yet.</p>;
  return (
    <ul className="adm-audit">
      {entries.map((e) => (
        <li key={e._id}>
          <span className="adm-audit-when">
            {new Date(e.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}
          </span>
          <span>
            <strong>{e.action}</strong>
            {showTarget && <> {e.targetType} {e.targetId}</>}: {summarize(e.before)} → {summarize(e.after)}
          </span>
          <span className="adm-audit-who">{e.user}</span>
        </li>
      ))}
    </ul>
  );
}
