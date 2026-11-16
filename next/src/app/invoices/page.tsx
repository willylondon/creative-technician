import type { Metadata } from "next";
import { cookies } from "next/headers";
import { configured, hasSession, sessionCookie } from "@/lib/invoice-cloud/session";
import styles from "./workspace.module.css";
import InvoiceWorkspace from "./workspace";

export const metadata: Metadata = {
  title: "Invoices | The Creative Technician",
  description: "The Creative Technician invoice workspace.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/invoices" },
};

export default async function InvoicesPage({ searchParams }: {
  searchParams: Promise<{ auth?: string }>;
}) {
  if (process.env.INVOICE_LOCAL_MODE === "true" && process.env.VERCEL_ENV !== "production") {
    return <InvoiceWorkspace />;
  }
  const session = hasSession((await cookies()).get(sessionCookie)?.value);
  if (session) return <InvoiceWorkspace hosted />;
  const ready = configured();
  const query = await searchParams;
  return (
    <main className={styles.loading}>
      <div className={styles.signIn}>
        <h1>The Creative Technician</h1>
        <p>{ready ? "Enter your four-digit PIN to open your invoices." : "The invoice workspace is awaiting setup."}</p>
        {query.auth === "failed" && <p role="alert">That PIN didn’t match.</p>}
        {query.auth === "limited" && <p role="alert">Too many attempts. Try again in an hour.</p>}
        {query.auth === "unavailable" && <p role="alert">Unable to unlock the workspace right now.</p>}
        {ready && <form method="post" action="/invoices/auth/unlock" className={styles.pinForm}>
          <label className={styles.field}>
            <span>Invoice PIN</span>
            <input type="password" name="pin" inputMode="numeric" autoComplete="current-password" required pattern="[0-9]{4}" minLength={4} maxLength={4} />
          </label>
          <button className={`${styles.button} ${styles.primary}`} type="submit">Unlock invoices</button>
        </form>}
      </div>
    </main>
  );
}
