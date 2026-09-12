export function fmtNum(n?: number | null, digits = 0): string {
  if (n === undefined || n === null) return "";
  return n.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Area values are printed to 2dp only when the source had decimals. */
export function fmtArea(n?: number | null): string {
  if (n === undefined || n === null) return "";
  return fmtNum(n, n % 1 ? 2 : 0);
}

export function fmtBytes(n?: number | null): string {
  if (n === undefined || n === null) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** "2029-09" -> "September 2029" */
export function fmtMonth(value?: string): string {
  if (!value) return "";
  const [y, m] = value.split("-").map(Number);
  if (!y || !m) return value;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const STATUS_LABELS: Record<string, string> = {
  pre_launch: "Pre-launch",
  new_launch: "New launch",
  under_construction: "Under construction",
  ready_to_move: "Ready to move",
  completed: "Completed",
};

export const fmtStatus = (s?: string) => (s ? STATUS_LABELS[s] ?? s : "");

export function fmtMeasure(m?: { value?: number; unit?: string }): string {
  if (!m?.value) return "";
  const unit = { sqft: "sq.ft.", sqm: "sq.m.", acre: "acres", hectare: "ha" }[m.unit ?? ""] ?? m.unit ?? "";
  return `${fmtNum(m.value, m.value % 1 ? 2 : 0)} ${unit}`.trim();
}

export function unitFullName(u: { tower_family?: string; variant?: string }): string {
  return [u.tower_family, u.variant].filter(Boolean).join(" — ");
}
