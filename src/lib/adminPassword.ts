import { timingSafeEqual } from "node:crypto";

/** Constant-time string compare, so response time doesn't leak how much matched. */
function same(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Checks a login against ADMIN_USERNAME + ADMIN_PASSWORD from the env file. */
export async function checkAdminLogin(username: string, password: string): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedUser || !expectedPassword) return false;
  return same(username.trim().toLowerCase(), expectedUser) && same(password, expectedPassword);
}
