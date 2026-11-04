import { Icon } from "@/components/IconSprite";

type SP = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** The ?ok= / ?error= message a server action redirects back with (see app/admin/actions.ts). */
export function AdminFlash({ sp }: { sp: SP }) {
  const ok = first(sp.ok);
  const error = first(sp.error);
  if (!ok && !error) return null;
  return (
    <div className={`adm-flash ${error ? "adm-flash-error" : "adm-flash-ok"}`} role={error ? "alert" : "status"}>
      <Icon name={error ? "info" : "check"} className="icon icon-sm" />
      <span>{error ?? ok}</span>
    </div>
  );
}

/** Hidden "back" field — the page a form's action redirects to afterwards. */
export function Back({ to }: { to: string }) {
  return <input type="hidden" name="back" value={to} />;
}

/** Current path + query (minus the flash) for <Back>, so filters and paging survive a save. */
export function currentPath(path: string, sp: SP) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const value = first(v);
    if (value && k !== "ok" && k !== "error") params.set(k, value);
  }
  const s = params.toString();
  return s ? `${path}?${s}` : path;
}
