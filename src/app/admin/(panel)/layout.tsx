import Link from "next/link";
import { requireAdmin } from "@/lib/adminApi";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

/** Logged-in admin pages: section nav + who's logged in. The middleware already redirected anyone else. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <>
      <div className="adm-bar">
        <div className="container adm-bar-inner">
          <nav className="adm-nav" aria-label="Admin">
            <Link href="/admin">Projects</Link>
            <Link href="/admin/areas">Areas</Link>
            <Link href="/admin/builders">Builders</Link>
            <Link href="/admin/history">History</Link>
          </nav>
          <form action={logout} className="adm-user">
            <span>{user}</span>
            <button className="btn btn-outline btn-sm" type="submit">Log out</button>
          </form>
        </div>
      </div>
      <div className="container adm-body">{children}</div>
    </>
  );
}
