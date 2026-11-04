import type { Metadata } from "next";
import { adminFetch, type AuditEntry } from "@/lib/adminApi";
import { AuditList } from "@/components/admin/AuditList";

export const metadata: Metadata = { title: "History" };

/** Every change made from the admin panel, newest first. */
export default async function AdminHistoryPage() {
  const entries = await adminFetch<AuditEntry[]>("/audit");
  return (
    <>
      <header className="adm-head">
        <h1>History</h1>
        <p>Every change made from the admin panel — who, when, and the value before and after. Latest 50.</p>
      </header>
      <AuditList entries={entries} showTarget />
    </>
  );
}
