export const INVOICE_EMAIL = "thecreativetechshop@gmail.com";
export const INVOICE_LOCATION = "Kingston, Jamaica";
export const INVOICE_STORAGE = "creative-technician.invoices.v1";
export const CURRENCIES = ["JMD", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export type LineItem = { description: string; quantity: string; rate: string };
export type Invoice = {
  number: string;
  client: string;
  email: string;
  currency: Currency;
  issued: string;
  due: string;
  items: LineItem[];
  notes: string;
  payment: string;
};
export type SavedInvoice = Invoice & { id: string; paid: boolean };
export type InvoiceSettings = { payment: string; currency: Currency; terms: number };
export type Workspace = { version: 1; settings: InvoiceSettings; invoices: SavedInvoice[] };

export const MAX_ITEMS = 50;
export const PAYMENT_LIMIT = 1500;
export const emptyItem = (): LineItem => ({ description: "", quantity: "1", rate: "0.00" });
export const emptyWorkspace = (): Workspace => ({
  version: 1, settings: { payment: "", currency: "JMD", terms: 14 }, invoices: [],
});

function dateAtKingston(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "America/Jamaica", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (name: string) => parts.find(({ type }) => type === name)?.value;
  return [part("year"), part("month"), part("day")].join("-");
}

export function addDays(date: string, days: number): string {
  const result = new Date(date + "T12:00:00Z");
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

export function nextInvoiceNumber(invoices: SavedInvoice[], year: string) {
  const prefix = "CT-" + year + "-";
  const last = invoices.reduce((max, { number }) => {
    const suffix = number.slice(prefix.length);
    return number.toUpperCase().startsWith(prefix) && /^\d{1,9}$/.test(suffix)
      ? Math.max(max, Number(suffix)) : max;
  }, 0);
  return prefix + String(last + 1).padStart(3, "0");
}

export function newInvoice(workspace: Workspace, now?: Date): Invoice {
  const issued = dateAtKingston(now);
  return {
    number: nextInvoiceNumber(workspace.invoices, issued.slice(0, 4)),
    client: "", email: "", currency: workspace.settings.currency,
    issued, due: addDays(issued, workspace.settings.terms),
    items: [emptyItem()], notes: "", payment: workspace.settings.payment,
  };
}

function scaled(value: string, places: number, digits: number): number | null {
  const match = new RegExp("^(\\d{1," + digits + "})(?:\\.(\\d{0," + places + "}))?$").exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 10 ** places + Number((match[2] ?? "").padEnd(places, "0"));
}

export function lineCents(item: LineItem): number {
  const thousandths = scaled(item.quantity, 3, 4) ?? 0;
  const rateCents = scaled(item.rate, 2, 6) ?? 0;
  return Math.floor((thousandths * rateCents + 500) / 1000);
}

export function totalCents(invoice: Invoice): number {
  return invoice.items.reduce((total, item) => total + lineCents(item), 0);
}

export function money(cents: number): string {
  return new Intl.NumberFormat("en-JM", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}

export function displayDate(date: string): string {
  return isDate(date) ? new Intl.DateTimeFormat("en-JM", {
    timeZone: "UTC", day: "numeric", month: "short", year: "numeric",
  }).format(new Date(date + "T12:00:00Z")) : "—";
}

function isDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(date + "T12:00:00Z");
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

export function invoiceProblem(invoice: Invoice): string | null {
  if (!invoice.client.trim()) return "Enter the client’s name.";
  if (invoice.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.email.trim())) {
    return "Enter a valid client email address, or leave it blank.";
  }
  if (!/^[A-Z0-9][A-Z0-9-]{0,39}$/i.test(invoice.number.trim())) {
    return "Use letters, numbers and hyphens for the invoice number.";
  }
  if (!isDate(invoice.issued) || !isDate(invoice.due) || invoice.due < invoice.issued) {
    return "Choose an issue date and a due date on or after it.";
  }
  if (invoice.items.length < 1 || invoice.items.length > MAX_ITEMS) return "Add between 1 and 50 line items.";
  for (const [index, item] of invoice.items.entries()) {
    if (!item.description.trim()) return "Enter a description for item " + (index + 1) + ".";
    if ((scaled(item.quantity, 3, 4) ?? 0) <= 0) {
      return "Item " + (index + 1) + " needs a positive quantity (up to 9,999.999).";
    }
    if (scaled(item.rate, 2, 6) === null) {
      return "Item " + (index + 1) + " needs a rate between 0.00 and 999,999.99 with up to two decimal places.";
    }
  }
  return null;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function bounded(value: unknown, limit: number): value is string {
  return typeof value === "string" && value.length <= limit;
}

function currency(value: unknown): value is Currency {
  return value === "JMD" || value === "USD";
}

function validSettings(value: unknown): value is InvoiceSettings {
  return record(value) && bounded(value.payment, PAYMENT_LIMIT) && currency(value.currency)
    && typeof value.terms === "number" && Number.isInteger(value.terms) && value.terms >= 0 && value.terms <= 365;
}

function validInvoice(value: unknown): value is SavedInvoice {
  return record(value)
    && bounded(value.id, 100) && value.id.length > 0 && typeof value.paid === "boolean"
    && bounded(value.number, 40) && bounded(value.client, 160) && bounded(value.email, 254)
    && currency(value.currency) && bounded(value.issued, 10) && bounded(value.due, 10)
    && bounded(value.notes, PAYMENT_LIMIT) && bounded(value.payment, PAYMENT_LIMIT)
    && Array.isArray(value.items) && value.items.length > 0 && value.items.length <= MAX_ITEMS
    && value.items.every((line) => record(line) && bounded(line.description, 300)
      && bounded(line.quantity, 8) && bounded(line.rate, 9))
    && invoiceProblem(value as SavedInvoice) === null;
}

export function readWorkspace(json: string): Workspace {
  const data: unknown = JSON.parse(json);
  if (!record(data) || data.version !== 1 || !validSettings(data.settings)
    || !Array.isArray(data.invoices) || !data.invoices.every(validInvoice)
    || new Set(data.invoices.map(({ id }) => id)).size !== data.invoices.length
    || new Set(data.invoices.map(({ number }) => number.trim().toUpperCase())).size !== data.invoices.length) {
    throw new Error("This file is not a valid Creative Technician invoice backup.");
  }
  return { version: 1, settings: data.settings, invoices: data.invoices };
}
