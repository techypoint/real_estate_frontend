/**
 * Admin panel session — a signed cookie, no session store.
 *
 * Value: base64url("username|expiresAtMs") + "." + base64url(HMAC-SHA256).
 * Signed with ADMIN_SESSION_SECRET. Web Crypto only (no node:crypto), so the
 * same code verifies in middleware (edge runtime) and in server actions.
 * One admin today (the founder), so there are no roles — a valid cookie is
 * full access, which is why the cookie is httpOnly and expires in 7 days.
 */
export const SESSION_COOKIE = "acre_admin";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const enc = new TextEncoder();

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const fromB64url = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function hmacKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(user: string, now = Date.now()): Promise<string> {
  const payload = enc.encode(`${user}|${now + SESSION_TTL_MS}`);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(), payload));
  return `${b64url(payload)}.${b64url(sig)}`;
}

/** The admin username if the cookie is genuine and unexpired, else null. */
export async function verifySession(value: string | undefined): Promise<string | null> {
  if (!value || !process.env.ADMIN_SESSION_SECRET) return null;
  const [p, s] = value.split(".");
  if (!p || !s) return null;
  try {
    const payload = fromB64url(p);
    // crypto.subtle.verify compares in constant time.
    if (!(await crypto.subtle.verify("HMAC", await hmacKey(), fromB64url(s), payload))) return null;
    const [user, exp] = new TextDecoder().decode(payload).split("|");
    return Number(exp) > Date.now() ? user : null;
  } catch {
    return null;
  }
}
