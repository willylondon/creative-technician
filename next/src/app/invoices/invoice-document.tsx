import { displayDate, INVOICE_EMAIL, INVOICE_LOCATION, lineCents, money, totalCents, type Invoice } from "@/lib/invoices";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import styles from "./workspace.module.css";

export function InvoiceMark() {
  return <span className={styles.mark} aria-hidden="true"><i />CT</span>;
}

export function InvoiceDocument({ invoice, paid }: { invoice: Invoice; paid: boolean }) {
  const total = totalCents(invoice);
  return (
    <article className={styles.paper} aria-label="Invoice document">
      <div className={styles.paperHeading}>
        <div className={styles.paperBrand}>
          <InvoiceMark />
          <div>
            <strong>{SITE_NAME}</strong>
            <span>{INVOICE_EMAIL}</span>
            <span>{INVOICE_LOCATION}</span>
          </div>
        </div>
        <div className={styles.paperTitle}>
          <strong>Invoice</strong>
          <span>{invoice.number || "—"}</span>
          {paid && <small>Paid</small>}
        </div>
      </div>

      <div className={styles.billing}>
        <div className={styles.recipient}>
          <span className={styles.paperLabel}>Bill to</span>
          <strong>{invoice.client.trim() || "Client name"}</strong>
          {invoice.email.trim() && <span>{invoice.email.trim()}</span>}
        </div>
        <div className={styles.paperDates}>
          <div><span className={styles.paperLabel}>Issued</span><span>{displayDate(invoice.issued)}</span></div>
          <div><span className={styles.paperLabel}>Due</span><span>{displayDate(invoice.due)}</span></div>
        </div>
      </div>

      <table className={styles.paperItems}>
        <thead>
          <tr><th scope="col">Description</th><th scope="col">Qty</th><th scope="col">Rate</th><th scope="col">Amount</th></tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index}>
              <td>{item.description.trim() || "Service description"}</td>
              <td>{item.quantity || "—"}</td>
              <td>{money(lineCents({ quantity: "1", rate: item.rate, description: "" }))}</td>
              <td>{money(lineCents(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.paperEnd}>
        {(invoice.notes.trim() || invoice.payment.trim()) && (
          <div className={styles.paperNotes}>
            {invoice.notes.trim() && <div><h3 className={styles.paperLabel}>Notes</h3><p>{invoice.notes.trim()}</p></div>}
            {invoice.payment.trim() && <div><h3 className={styles.paperLabel}>Payment instructions</h3><p>{invoice.payment.trim()}</p></div>}
          </div>
        )}
        <div className={styles.total}>
          <span>{paid ? "Total paid" : "Total due"}</span>
          <strong>{invoice.currency} {money(total)}</strong>
        </div>
        <footer className={styles.paperFooter}>
          <span>{SITE_NAME} · {INVOICE_LOCATION}</span>
          <span>{new URL(SITE_URL).hostname.replace(/^www\./, "")}</span>
        </footer>
      </div>
    </article>
  );
}
