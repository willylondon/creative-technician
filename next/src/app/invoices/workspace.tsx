"use client";

import { ArrowUpRight, Check, Download, FileText, Mail, Plus, Printer, Save, Settings, Share2, Upload } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import {
  CURRENCIES, displayDate, emptyWorkspace, INVOICE_EMAIL, INVOICE_STORAGE, invoiceProblem, money,
  newInvoice, PAYMENT_LIMIT, readWorkspace, totalCents,
  type Currency, type Invoice, type SavedInvoice, type Workspace,
} from "@/lib/invoices";
import { SITE_NAME } from "@/lib/site";
import { cloud, type WorkspaceSnapshot } from "./cloud-bridge";
import { InvoiceDocument, InvoiceMark } from "./invoice-document";
import { Field, InvoiceEditor } from "./invoice-editor";
import styles from "./workspace.module.css";

type Screen = "editor" | "history" | "settings";
type Feedback = { text: string; error?: boolean } | null;

const subscribe = () => () => {};
const getClient = () => true;
const getServer = () => false;
const sentDate = new Intl.DateTimeFormat("en-JM", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Jamaica" });

function loadStorage(): Workspace {
  const value = localStorage.getItem(INVOICE_STORAGE);
  return value === null ? emptyWorkspace() : readWorkspace(value);
}

function initialize() {
  try {
    return { workspace: loadStorage(), warning: "" };
  } catch {
    return { workspace: emptyWorkspace(), warning: "Unable to read invoice storage. Restore a known backup in Settings before saving again." };
  }
}

function emailLink(invoice: SavedInvoice): string {
  const subject = `Invoice ${invoice.number} from ${SITE_NAME}`;
  const body = `Hi ${invoice.client},\n\nPlease find invoice ${invoice.number} attached.\n\nThank you,\n${SITE_NAME}\n${INVOICE_EMAIL}`;
  return `mailto:${encodeURIComponent(invoice.email).replace("%40", "@")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function InvoiceWorkspace({ hosted = false }: { hosted?: boolean }) {
  const mounted = useSyncExternalStore(subscribe, getClient, getServer);
  if (!mounted) return <main className={styles.loading}><p>Loading invoices…</p></main>;
  return hosted ? <HostedWorkspace /> : <InvoiceScreen />;
}

function HostedWorkspace() {
  const [result, setResult] = useState<{ snapshot?: WorkspaceSnapshot; error?: string }>({});
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    cloud.load().then(
      (snapshot) => { if (current) setResult({ snapshot }); },
      (error: Error) => { if (current) setResult({ error: error.message }); },
    );
    return () => { current = false; };
  }, [attempt]);

  if (result.snapshot) return <InvoiceScreen synced={result.snapshot} />;
  return (
    <main className={styles.loading}>
      <p role={result.error ? "alert" : "status"}>{result.error || "Loading your invoices…"}</p>
      {result.error && <form action="/invoices"><button className={styles.button} type="submit">Unlock again</button></form>}
      {result.error && <button type="button" className={styles.button} onClick={() => {
        setResult({});
        setAttempt((previous) => previous + 1);
      }}>Try again</button>}
    </main>
  );
}

function InvoiceScreen({ synced }: { synced?: WorkspaceSnapshot }) {
  const [initial] = useState(() => synced ? { workspace: synced.workspace, warning: "" } : initialize());
  const [workspace, setWorkspace] = useState(initial.workspace);
  const [busy, setBusy] = useState(false);
  const working = useRef(false);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [preparedPdf, setPreparedPdf] = useState<{ url: string; file: File } | null>(null);
  const [screen, setScreen] = useState<Screen>("editor");
  const [invoice, setInvoice] = useState(() => newInvoice(initial.workspace));
  const [selected, setSelected] = useState<SavedInvoice | null>(null);
  const [dirty, setDirty] = useState(false);
  const [warning, setWarning] = useState(initial.warning);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [search, setSearch] = useState("");
  const [sentAtById, setSentAtById] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState(initial.workspace.settings);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function change(patch: Partial<Invoice>) {
    setInvoice((previous) => ({ ...previous, ...patch }));
    setDirty(true);
    setPreparedPdf(null);
    if (feedback) setFeedback(null);
  }

  async function perform<T>(action: () => Promise<T>) {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    try {
      return await action();
    } finally {
      working.current = false;
      setBusy(false);
    }
  }

  async function latest(): Promise<WorkspaceSnapshot> {
    if (synced) return cloud.load();
    return { workspace: loadStorage(), revision: "" };
  }

  function show(target: Screen) {
    setScreen(target);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function navigate(target: Screen) {
    void perform(async () => {
      setFeedback(null);
      if (target !== "editor") {
        try {
          if (target === "history" && synced) {
            const history = await cloud.loadHistory();
            setWorkspace(history.workspace);
            setSentAtById((previous) => ({ ...previous, ...history.sentAtById }));
          } else {
            const snapshot = await latest();
            setWorkspace(snapshot.workspace);
            if (target === "settings") setSettings(snapshot.workspace.settings);
          }
        } catch {
          setFeedback({ error: true, text: "Unable to refresh saved invoices and settings." });
        }
      }
      show(target);
    });
  }

  function start(next?: SavedInvoice) {
    if (dirty && !window.confirm("Discard the unsaved changes to this invoice?")) return;
    void perform(async () => {
      try {
        const snapshot = await latest();
        setWorkspace(snapshot.workspace);
        const fresh = next && snapshot.workspace.invoices.find((record) => record.id === next.id);
        setSelected(fresh ?? null);
        setInvoice(fresh ?? newInvoice(snapshot.workspace));
        setDirty(false);
        setPreparedPdf(null);
        setMobileView("edit");
        setFeedback(null);
        show("editor");
      } catch {
        setFeedback({ error: true, text: "Unable to refresh invoices. Try again before opening a record." });
      }
    });
  }

  async function store(next: Workspace, revision: string) {
    if (synced) {
      setWorkspace((await cloud.save(next, revision)).workspace);
    } else {
      const serialized = JSON.stringify(next);
      localStorage.setItem(INVOICE_STORAGE, serialized);
      if (localStorage.getItem(INVOICE_STORAGE) !== serialized) throw new Error("Storage write failed.");
      setWorkspace(next);
    }
    setWarning("");
  }

  function fail(error: unknown, localMessage: string) {
    setFeedback({ error: true, text: synced && error instanceof Error ? error.message : localMessage });
  }

  async function saveInvoice(paid = selected?.paid ?? false): Promise<SavedInvoice | null> {
    const problem = invoiceProblem(invoice);
    if (problem) { setFeedback({ error: true, text: problem }); return null; }

    try {
      const { workspace: current, revision } = await latest();
      const number = invoice.number.trim();
      if (current.invoices.some((entry) => entry.id !== selected?.id && entry.number.trim().toUpperCase() === number.toUpperCase())) {
        setFeedback({ error: true, text: "That invoice number already exists. Enter a different number and try again." });
        return null;
      }
      if (selected && JSON.stringify(current.invoices.find((entry) => entry.id === selected.id)) !== JSON.stringify(selected)) {
        setFeedback({ error: true, text: "This invoice changed on another device or tab. Open it again from Invoices before saving." });
        return null;
      }
      const saved: SavedInvoice = {
        ...invoice, id: selected?.id ?? crypto.randomUUID(), paid,
        number, client: invoice.client.trim(), email: invoice.email.trim(),
      };
      await store({ ...current, invoices: selected
        ? current.invoices.map((entry) => entry.id === selected.id ? saved : entry)
        : [saved, ...current.invoices] }, revision);
      setInvoice(saved);
      setSelected(saved);
      setDirty(false);
      setPreparedPdf(null);
      setFeedback({ text: synced ? `${saved.number} saved with a PDF copy.` : `${saved.number} saved on this browser.` });
      return saved;
    } catch (error) {
      fail(error, "Couldn’t save the invoice. Check browser storage and try again.");
      return null;
    }
  }

  function printInvoice() {
    void perform(async () => {
      const saved = selected && !dirty ? selected : await saveInvoice();
      if (!saved) return;
      if (synced) {
        try {
          setPreparedPdf(await cloud.pdf(saved.id, saved.number));
          setFeedback({ text: "PDF ready to download or share." });
        } catch (error) {
          fail(error, "Couldn’t open the PDF.");
        }
        return;
      }
      const title = document.title;
      document.title = `${saved.number} - ${SITE_NAME}`;
      try { window.print(); } finally { document.title = title; }
    });
  }

  async function sharePdf() {
    if (!preparedPdf) return;
    try {
      await navigator.share({ files: [preparedPdf.file], title: preparedPdf.file.name });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setFeedback({ error: true, text: "Share isn’t available on this device. Download the PDF to save it to Drive." });
    }
  }

  function sendInvoice() {
    if (!selected || dirty || !selected.email) return;
    if (!window.confirm(`Send ${selected.number} and its payment instructions to ${selected.email}?`)) return;
    void perform(async () => {
      try {
        const result = await cloud.email(selected.id, JSON.stringify(selected));
        setSentAtById((previous) => {
          if ((previous[selected.id] ?? "") >= result.sentAt) return previous;
          return { ...previous, [selected.id]: result.sentAt };
        });
        setFeedback({ text: result.alreadySent ? "This version was already emailed to " + selected.email + "." : "Invoice emailed to " + selected.email + "." });
      } catch (error) {
        fail(error, "Couldn’t email the invoice.");
      }
    });
  }

  function saveSettings(event: FormEvent) {
    event.preventDefault();
    if (!Number.isInteger(settings.terms) || settings.terms < 0 || settings.terms > 365) {
      setFeedback({ error: true, text: "Enter a whole number of days between 0 and 365." });
      return;
    }
    void perform(async () => {
      try {
        const { workspace: current, revision } = await latest();
        if (JSON.stringify(current.settings) !== JSON.stringify(workspace.settings)) {
          setFeedback({ error: true, text: "Settings changed on another device. Reopen Settings before saving." });
          return;
        }
        const next = { ...current, settings };
        await store(next, revision);
        if (!selected && !dirty) setInvoice(newInvoice(next));
        setFeedback({ text: "Defaults saved for new invoices." });
      } catch (error) {
        fail(error, "Couldn’t save settings. Check browser storage and try again.");
      }
    });
  }

  function exportBackup() {
    void perform(async () => {
      try {
        const { workspace: current } = await latest();
        const file = new Blob([JSON.stringify(current, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(file);
        const download = document.createElement("a");
        download.href = url;
        download.download = `ct-invoice-backup-${new Date().toISOString().slice(0, 10)}.json`;
        download.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setFeedback({ text: "Backup downloaded. Keep it somewhere private." });
      } catch (error) {
        fail(error, "Unable to export the current workspace.");
      }
    });
  }

  function importBackup(file: File) {
    void perform(async () => {
      try {
        const data = readWorkspace(await file.text());
        if (synced) {
          let { workspace: current, revision } = await latest();
          const ids = new Set(current.invoices.map((entry) => entry.id));
          const numbers = new Set(current.invoices.map((entry) => entry.number.trim().toUpperCase()));
          const imported = data.invoices.filter((entry) => !ids.has(entry.id) && !numbers.has(entry.number.trim().toUpperCase()));
          if (!window.confirm(`Import ${imported.length} new invoice(s)? Existing invoice numbers will be skipped.`)) return;
          let importedCount = 0;
          try {
            for (; importedCount < imported.length; importedCount += 10) {
              const batch = imported.slice(importedCount, importedCount + 10);
              const saved = await cloud.save({ ...current, invoices: [...batch, ...current.invoices] }, revision);
              ({ workspace: current, revision } = saved);
              setWorkspace(current);
            }
            setFeedback({ text: `Imported ${imported.length} invoice(s).` });
          } catch (error) {
            const detail = error instanceof Error ? error.message : "Try the import again.";
            setFeedback({ error: true, text: `Imported ${importedCount} of ${imported.length} invoices. ${detail}` });
          }
          return;
        }
        if (!window.confirm(`Restore ${data.invoices.length} invoice(s) from this backup? This replaces the saved invoices and settings on this browser and discards any unsaved invoice.`)) return;
        await store(data, "");
        setSelected(null);
        setInvoice(newInvoice(data));
        setSettings(data.settings);
        setDirty(false);
        setPreparedPdf(null);
        setFeedback({ text: `Restored ${data.invoices.length} invoice(s) and settings.` });
      } catch (error) {
        fail(error, "Couldn’t restore this backup. Choose a valid Creative Technician export and check browser storage.");
      }
    });
  }

  const filtered = workspace.invoices.filter((entry) =>
    [entry.number, entry.client, entry.email].some((value) => value.toLowerCase().includes(search.trim().toLowerCase())));
  const title = screen === "history" ? "Invoices" : screen === "settings" ? "Settings" : selected ? selected.number : "New invoice";
  const description = screen === "history" ? "Find saved invoices and track payments."
    : screen === "settings" ? "Set your invoice defaults and manage your backups."
    : selected ? `Invoice for ${selected.client}` : "Create a branded invoice for your tech work.";

  return (
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <div className={styles.topInner}>
          <button className={styles.wordmark} type="button" disabled={busy} onClick={() => navigate("editor")}>
            <InvoiceMark />
            <span><strong>{SITE_NAME}</strong><small>Invoice workspace</small></span>
          </button>
          <nav className={styles.nav} aria-label="Invoice workspace">
            <button type="button" disabled={busy} aria-current={screen === "history" ? "page" : undefined} onClick={() => navigate("history")}><FileText aria-hidden="true" />Invoices</button>
            <button type="button" disabled={busy} aria-current={screen === "settings" ? "page" : undefined} onClick={() => navigate("settings")}><Settings aria-hidden="true" />Settings</button>
            {synced && <form method="post" action="/invoices/auth/logout">
              <button type="submit" disabled={busy}>Sign out</button>
            </form>}
          </nav>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.titleBar}>
          <div><h1>{title}</h1><p>{description}</p></div>
          {screen === "editor" ? (
            <div className={styles.actions}>
              <button className={styles.button} type="button" disabled={busy} onClick={printInvoice}><Printer aria-hidden="true" />{synced ? "Get PDF" : "Print / Save PDF"}</button>
              <button className={`${styles.button} ${styles.primary}`} type="submit" disabled={busy} form="invoice-editor"><Save aria-hidden="true" />Save invoice</button>
            </div>
          ) : (
            <button className={`${styles.button} ${styles.primary}`} type="button" disabled={busy} onClick={() => start()}><Plus aria-hidden="true" />New invoice</button>
          )}
        </div>

        {busy && <p className={styles.feedback} role="status">Working…</p>}
        {warning && <p className={styles.feedback} role="alert">{warning}</p>}
        {feedback && <p className={styles.feedback} role={feedback.error ? "alert" : "status"} data-error={feedback.error || undefined}>{!feedback.error && <Check size={17} aria-hidden="true" />}{feedback.text}</p>}

        {screen === "editor" && (
          <>
            {selected && (
              <div className={styles.recordBar}>
                <span className={styles.recordStatus} data-paid={selected.paid || undefined}>{selected.paid ? "Paid" : "Unpaid"}</span>
                <button className={styles.quiet} type="button" disabled={busy} onClick={() => { void perform(() => saveInvoice(!selected.paid)); }}>{selected.paid ? "Mark unpaid" : "Mark paid"}</button>
                {synced && selected.email && !dirty && <button className={styles.quiet} type="button" disabled={busy} onClick={sendInvoice}><Mail size={16} aria-hidden="true" />Email invoice</button>}
                {preparedPdf && <a className={styles.quiet} href={preparedPdf.url} download><Download size={16} aria-hidden="true" />Download PDF</a>}
                {preparedPdf && navigator.canShare?.({ files: [preparedPdf.file] }) && <button className={styles.quiet} type="button" onClick={() => void sharePdf()}><Share2 size={16} aria-hidden="true" />Share PDF</button>}
                {!synced && selected.email && !dirty && <a className={styles.quiet} href={emailLink(selected)} title="Attach your saved PDF before sending"><Mail size={16} aria-hidden="true" />Draft email</a>}
                <button className={styles.quiet} type="button" disabled={busy} onClick={() => start()}><Plus size={16} aria-hidden="true" />New invoice</button>
              </div>
            )}
            {synced && <div className={styles.mobileTabs} role="group" aria-label="Invoice view">
              <button type="button" aria-pressed={mobileView === "edit"} onClick={() => setMobileView("edit")}>Edit invoice</button>
              <button type="button" aria-pressed={mobileView === "preview"} onClick={() => setMobileView("preview")}>Preview</button>
            </div>}
            <div className={styles.columns} data-view={synced ? mobileView : undefined}>
              <form id="invoice-editor" className={styles.editorWrap} onSubmit={(e) => { e.preventDefault(); void perform(() => saveInvoice()); }} noValidate>
                <fieldset className={styles.fields} disabled={busy}>
                  <InvoiceEditor invoice={invoice} change={change} lockedNumber={selected !== null} />
                </fieldset>
              </form>
              <section className={styles.preview} aria-label="Live preview">
                <div className={styles.previewHead}><h2>Live preview</h2><span>{invoice.currency}</span></div>
                <InvoiceDocument invoice={invoice} paid={selected?.paid ?? false} />
              </section>
            </div>
          </>
        )}

        {screen === "history" && (
          <section className={`${styles.editor} ${styles.history}`} aria-label="Saved invoices">
            <div className={styles.listHeader}>
              <Field label="Find an invoice"><input type="search" placeholder="Search by invoice number or client" value={search} onChange={(e) => setSearch(e.target.value)} /></Field>
              <span>{filtered.length} {filtered.length === 1 ? "invoice" : "invoices"}</span>
            </div>
            {filtered.length ? (
              <ul className={styles.records}>
                {filtered.map((entry) => (
                  <li key={entry.id}>
                    <button type="button" disabled={busy} onClick={() => start(entry)}>
                      <span className={styles.recordClient}>
                        <strong>{entry.client}</strong>
                        <small>{entry.number} · {displayDate(entry.issued)}</small>
                        {Object.hasOwn(sentAtById, entry.id) && (
                          <small className={styles.recordSent}>
                            Emailed <time dateTime={sentAtById[entry.id]}>{sentDate.format(new Date(sentAtById[entry.id]))}</time>
                          </small>
                        )}
                      </span>
                      <span className={styles.recordStatus} data-paid={entry.paid || undefined}>{entry.paid ? "Paid" : "Unpaid"}</span>
                      <span className={styles.recordAmount}>{entry.currency} {money(totalCents(entry))}</span>
                      <ArrowUpRight className={styles.recordArrow} size={18} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : <p className={styles.empty}>{workspace.invoices.length ? "No invoices match your search." : "Your saved invoices will appear here."}</p>}
          </section>
        )}

        {screen === "settings" && (
          <div className={styles.settingsGrid}>
            <form className={`${styles.editor} ${styles.editorSection}`} onSubmit={saveSettings}>
              <h2 className={styles.subheading}>Invoice defaults</h2>
              <p className={styles.sectionCopy}>Invoices show {INVOICE_EMAIL} as your business contact.</p>
              <div className={styles.fieldGrid}>
                <Field label="Default currency"><select value={settings.currency} disabled={busy} onChange={(e) => setSettings({ ...settings, currency: e.target.value as Currency })}>{CURRENCIES.map((code) => <option key={code}>{code}</option>)}</select></Field>
                <Field label="Payment terms (days)"><input type="number" min={0} max={365} required disabled={busy} value={Number.isNaN(settings.terms) ? "" : settings.terms} onChange={(e) => setSettings({ ...settings, terms: e.target.valueAsNumber })} /></Field>
              </div>
              <Field label={synced ? "Preferred payment account" : "Default payment instructions"}><textarea rows={5} disabled={busy} value={settings.payment} maxLength={PAYMENT_LIMIT} onChange={(e) => setSettings({ ...settings, payment: e.target.value })} placeholder="Enter the payment details you want clients to see on new invoices." /></Field>
              <button className={`${styles.button} ${styles.primary}`} type="submit" disabled={busy}><Save aria-hidden="true" />Save defaults</button>
            </form>
            <section className={`${styles.editor} ${styles.editorSection}`}>
              <h2 className={styles.subheading}>Backups</h2>
              <p className={styles.sectionCopy}>{synced ? "Invoices sync across your devices. Use Get PDF on a saved invoice to download it or share it to Google Drive. You can import a backup from the original local app here." : "Invoices and payment settings are stored in this browser. Download a backup regularly and before switching devices or clearing browser data."}</p>
              <div className={styles.actions}>
                <button type="button" disabled={busy} className={styles.button} onClick={exportBackup}><Download aria-hidden="true" />Export backup</button>
                <label className={`${styles.button} ${styles.fileButton}`}>
                  <Upload aria-hidden="true" /> {synced ? "Import backup" : "Restore backup"}
                  <input type="file" disabled={busy} accept=".json,application/json" onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void importBackup(file);
                  }} />
                </label>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
