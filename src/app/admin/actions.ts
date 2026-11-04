"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminFetch, AdminApiError, type AdminArea, type AdminBuilder } from "@/lib/adminApi";
import { checkAdminLogin } from "@/lib/adminPassword";
import { SESSION_COOKIE, SESSION_TTL_MS, signSession } from "@/lib/adminSession";

/**
 * Every admin-panel button is a plain <form> posting to one of these — no
 * client JS. Each one does its change through the Java admin API, then
 * redirects back to the page it came from with ?ok=… or ?error=… for the
 * page to show (see AdminFlash).
 */

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

/** One pattern per line → list. */
const lines = (fd: FormData, key: string) =>
  text(fd, key)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/** Only ever redirect back into the admin panel — never to a URL taken from the form. */
function backTo(fd: FormData) {
  const back = text(fd, "back");
  return back.startsWith("/admin") && !back.startsWith("//") ? back : "/admin";
}

function withFlash(path: string, kind: "ok" | "error", message: string) {
  const url = new URL(path, "http://x");
  url.searchParams.delete("ok");
  url.searchParams.delete("error");
  url.searchParams.set(kind, message);
  return url.pathname + url.search;
}

/** Runs the change; a refusal from the API (bad area, area still in use…) comes back as ?error=. */
async function run(fd: FormData, change: () => Promise<string>) {
  const back = backTo(fd);
  let target: string;
  try {
    target = withFlash(back, "ok", await change());
  } catch (err) {
    if (!(err instanceof AdminApiError)) throw err;
    target = withFlash(back, "error", err.message);
  }
  redirect(target);
}

// ---- login -------------------------------------------------------------------

/**
 * 10 failed attempts per IP per 15 minutes. In-memory, so it resets on
 * restart — enough to stop a password-guessing loop against one admin
 * account; the scrypt hash makes each guess slow on top of that.
 */
const failures = new Map<string, { count: number; since: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;

export async function login(fd: FormData) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
  const next = text(fd, "next");
  const dest = next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
  const retry = (msg: string) => redirect(`/admin/login?error=${encodeURIComponent(msg)}&next=${encodeURIComponent(dest)}`);

  const f = failures.get(ip);
  if (f && Date.now() - f.since < WINDOW_MS && f.count >= MAX_FAILURES) retry("Too many attempts — try again in 15 minutes.");

  if (!(await checkAdminLogin(text(fd, "username"), String(fd.get("password") ?? "")))) {
    const cur = f && Date.now() - f.since < WINDOW_MS ? f : { count: 0, since: Date.now() };
    failures.set(ip, { count: cur.count + 1, since: cur.since });
    retry("Wrong username or password.");
  }
  failures.delete(ip);

  (await cookies()).set(SESSION_COOKIE, await signSession(text(fd, "username").toLowerCase()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_TTL_MS / 1000,
  });
  redirect(dest);
}

export async function logout() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
  redirect("/admin/login");
}

// ---- projects ------------------------------------------------------------------

const regPath = (reg: string) => encodeURIComponent(reg.toLowerCase().replace(/\//g, "-"));

export async function setProjectArea(fd: FormData) {
  await run(fd, async () => {
    const area = text(fd, "area") || null;
    await adminFetch(`/projects/${regPath(text(fd, "reg"))}/area`, { method: "PUT", body: { area } });
    return area ? "Area saved." : "Area cleared.";
  });
}

export async function setProjectPublished(fd: FormData) {
  await run(fd, async () => {
    const published = text(fd, "published") === "true";
    await adminFetch(`/projects/${regPath(text(fd, "reg"))}/published`, { method: "POST", body: { published } });
    return published ? "Published — the page is updating on the site." : "Unpublished.";
  });
}

// ---- areas ---------------------------------------------------------------------

export async function saveArea(fd: FormData) {
  await run(fd, async () => {
    const id = text(fd, "id");
    const body = { district: text(fd, "district"), slug: text(fd, "slug"), name: text(fd, "name"), match: lines(fd, "match") };
    await adminFetch(id ? `/areas/${id}` : "/areas", { method: id ? "PUT" : "POST", body });
    return id ? `Saved ${body.name}.` : `Added ${body.name}.`;
  });
}

export async function deleteArea(fd: FormData) {
  await run(fd, async () => {
    await adminFetch(`/areas/${text(fd, "id")}`, { method: "DELETE" });
    return "Area deleted.";
  });
}

/** Swap with the neighbouring area of the same district — list order decides which suggestion wins. */
export async function moveArea(fd: FormData) {
  await run(fd, async () => {
    const { items } = await adminFetch<{ items: AdminArea[] }>("/areas");
    await adminFetch("/areas/order", { method: "POST", body: { ids: moved(items, text(fd, "id"), text(fd, "dir"), (a) => a.district) } });
    return "Order saved.";
  });
}

export async function importAreas(fd: FormData) {
  await run(fd, async () => {
    const r = await adminFetch<{ added: number; updated: number }>("/areas/import", {
      method: "POST",
      body: { items: parseList(text(fd, "json"), "areas") },
    });
    return `Imported: ${r.added} added, ${r.updated} updated.`;
  });
}

// ---- builder brands ------------------------------------------------------------

export async function saveBuilder(fd: FormData) {
  await run(fd, async () => {
    const id = text(fd, "id");
    const body = { slug: text(fd, "slug"), name: text(fd, "name"), match: lines(fd, "match") };
    await adminFetch(id ? `/builders/${id}` : "/builders", { method: id ? "PUT" : "POST", body });
    return id ? `Saved ${body.name}.` : `Added ${body.name}.`;
  });
}

export async function deleteBuilder(fd: FormData) {
  await run(fd, async () => {
    await adminFetch(`/builders/${text(fd, "id")}`, { method: "DELETE" });
    return "Brand deleted — its projects fall back to their own company name.";
  });
}

export async function moveBuilder(fd: FormData) {
  await run(fd, async () => {
    const { items } = await adminFetch<{ items: AdminBuilder[] }>("/builders");
    await adminFetch("/builders/order", { method: "POST", body: { ids: moved(items, text(fd, "id"), text(fd, "dir"), () => "") } });
    return "Order saved.";
  });
}

export async function importBuilders(fd: FormData) {
  await run(fd, async () => {
    const r = await adminFetch<{ added: number; updated: number }>("/builders/import", {
      method: "POST",
      body: { items: parseList(text(fd, "json"), "builders") },
    });
    return `Imported: ${r.added} added, ${r.updated} updated.`;
  });
}

// ---- helpers -------------------------------------------------------------------

/** All ids in order, with `id` swapped with its previous/next row in the same group. */
function moved<T extends { id: string }>(items: T[], id: string, dir: string, group: (t: T) => string): string[] {
  const ids = items.map((i) => i.id);
  const at = items.findIndex((i) => i.id === id);
  if (at === -1) return ids;
  const step = dir === "up" ? -1 : 1;
  for (let j = at + step; j >= 0 && j < items.length; j += step) {
    if (group(items[j]) === group(items[at])) {
      [ids[at], ids[j]] = [ids[j], ids[at]];
      break;
    }
  }
  return ids;
}

/** Accepts the old data/*.json file as-is ({ "areas": [...] }) or a bare array. */
function parseList(json: string, key: string): unknown[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new AdminApiError("That isn't valid JSON.", 400);
  }
  const list = Array.isArray(parsed) ? parsed : (parsed as Record<string, unknown>)?.[key];
  if (!Array.isArray(list)) throw new AdminApiError(`Expected a list, or an object with "${key}": [...]`, 400);
  return list;
}
