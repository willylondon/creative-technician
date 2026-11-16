import { Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import { CURRENCIES, emptyItem, MAX_ITEMS, PAYMENT_LIMIT, type Currency, type Invoice, type LineItem } from "@/lib/invoices";
import styles from "./workspace.module.css";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className={styles.field}><span>{label}</span>{children}</label>;
}

function SectionHeading({ index, children }: { index: string; children: ReactNode }) {
  return <h2 className={styles.sectionHeading}><span>{index}</span>{children}</h2>;
}

export function InvoiceEditor({ invoice, change, lockedNumber }: {
  invoice: Invoice;
  change: (change: Partial<Invoice>) => void;
  lockedNumber: boolean;
}) {
  function changeItem(index: number, patch: Partial<LineItem>) {
    change({ items: invoice.items.map((item, i) => i === index ? { ...item, ...patch } : item) });
  }

  return (
    <div className={styles.editor}>
      <section className={styles.editorSection}>
        <SectionHeading index="01">Invoice details</SectionHeading>
        <div className={styles.fieldGrid}>
          <Field label="Client name"><input required placeholder="Client name" maxLength={160} value={invoice.client} onChange={(e) => change({ client: e.target.value })} /></Field>
          <Field label="Client email (optional)"><input type="email" placeholder="Client email" maxLength={254} value={invoice.email} onChange={(e) => change({ email: e.target.value })} /></Field>
          <Field label="Invoice number"><input required readOnly={lockedNumber} spellCheck={false} maxLength={40} value={invoice.number} onChange={(e) => change({ number: e.target.value })} /></Field>
          <Field label="Currency">
            <select value={invoice.currency} onChange={(e) => change({ currency: e.target.value as Currency })}>
              {CURRENCIES.map((code) => <option key={code}>{code}</option>)}
            </select>
          </Field>
          <Field label="Issue date"><input type="date" required value={invoice.issued} onChange={(e) => change({ issued: e.target.value })} /></Field>
          <Field label="Due date"><input type="date" required min={invoice.issued} value={invoice.due} onChange={(e) => change({ due: e.target.value })} /></Field>
        </div>
      </section>

      <section className={styles.editorSection}>
        <SectionHeading index="02">Line items</SectionHeading>
        <div className={styles.itemList}>
          {invoice.items.map((item, index) => (
            <div key={index} className={styles.itemRow} role="group" aria-label={`Line item ${index + 1}`}>
              <Field label="Service description"><input required maxLength={300} placeholder="Service description" value={item.description} onChange={(e) => changeItem(index, { description: e.target.value })} /></Field>
              <Field label="Qty"><input required inputMode="decimal" maxLength={8} value={item.quantity} onChange={(e) => changeItem(index, { quantity: e.target.value })} /></Field>
              <Field label={`Rate (${invoice.currency})`}><input required inputMode="decimal" maxLength={9} value={item.rate} onChange={(e) => changeItem(index, { rate: e.target.value })} /></Field>
              <button className={styles.removeItem} type="button" title="Remove item" aria-label={`Remove item ${index + 1}`} disabled={invoice.items.length === 1} onClick={() => change({ items: invoice.items.filter((_, i) => i !== index) })}><X size={19} aria-hidden="true" /></button>
            </div>
          ))}
        </div>
        <button className={`${styles.button} ${styles.addItem}`} type="button" disabled={invoice.items.length >= MAX_ITEMS} onClick={() => change({ items: [...invoice.items, emptyItem()] })}><Plus size={17} aria-hidden="true" /> Add item</button>
      </section>

      <section className={styles.editorSection}>
        <SectionHeading index="03">Notes &amp; payment</SectionHeading>
        <div className={styles.fieldGrid}>
          <Field label="Notes (optional)"><textarea rows={2} maxLength={PAYMENT_LIMIT} value={invoice.notes} placeholder="Notes for the client (e.g. scope or next steps)" onChange={(e) => change({ notes: e.target.value })} /></Field>
          <Field label="Payment instructions (optional)"><textarea rows={2} maxLength={PAYMENT_LIMIT} value={invoice.payment} placeholder="Payment details (e.g. bank transfer or mobile money)" onChange={(e) => change({ payment: e.target.value })} /></Field>
        </div>
      </section>
    </div>
  );
}
