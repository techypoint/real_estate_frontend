import type { Metadata } from "next";
import { login } from "../actions";
import { AdminFlash } from "@/components/admin/AdminFlash";

export const metadata: Metadata = { title: "Log in" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/admin";
  return (
    <div className="container adm-login">
      <h1>Admin</h1>
      <p>Log in to manage projects, areas and builders.</p>
      <AdminFlash sp={sp} />
      <form action={login} className="adm-form">
        <input type="hidden" name="next" value={next} />
        <div className="field">
          <label htmlFor="adm-username">Username</label>
          <input id="adm-username" name="username" type="text" autoComplete="username" autoCapitalize="none" required />
        </div>
        <div className="field">
          <label htmlFor="adm-password">Password</label>
          <input id="adm-password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <button className="btn btn-primary" type="submit">Log in</button>
      </form>
    </div>
  );
}
