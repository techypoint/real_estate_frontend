import { NextResponse } from "next/server";

/**
 * Thin BFF proxy for the contact form.
 *
 * The browser never talks to the Java API directly (see lib/api.ts) — this
 * route is the one exception carved out for a client-submitted POST, per
 * CLAUDE.md's "Next server layer" boundary. All lead logic (validation,
 * persistence, future CRM/notification wiring) lives in Java; this just
 * forwards the body and relays the status back.
 */
const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:8080";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const res = await fetch(`${API_ORIGIN}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
