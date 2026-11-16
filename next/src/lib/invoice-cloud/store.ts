import { BlobPreconditionFailedError, BlobError, get, put } from "@vercel/blob";
import { createHash } from "node:crypto";
import { INVOICE_EMAIL, emptyWorkspace, readWorkspace, type SavedInvoice, type Workspace } from "@/lib/invoices";
import { SITE_NAME } from "@/lib/site";
import { renderInvoicePdf } from "./pdf";

const EMAIL_TIMEOUT_MS = 8000;
const workspacePath = "ct-invoices/v1/workspace.json";
const attemptsPath = "ct-invoices/v1/pin-attempts-4digit.json";
const access = { access: "private" } as const;

export class InvoiceError extends Error {
  constructor(message: string, readonly status = 409) { super(message); }
}

async function readJson(path: string) {
  const blob = await get(path, { ...access, useCache: false });
  if (!blob) return null;
  if (blob.statusCode !== 200) throw new Error("Storage did not return a fresh copy.");
  return { content: await new Response(blob.stream).text(), revision: blob.blob.etag };
}

async function writeJson(path: string, content: object, revision?: string) {
  return put(path, JSON.stringify(content), {
    ...access, contentType: "application/json", cacheControlMaxAge: 60,
    ...(revision ? { ifMatch: revision, allowOverwrite: true } : { allowOverwrite: false }),
  });
}

function conflicted(error: unknown) {
  return error instanceof BlobPreconditionFailedError
    || (error instanceof BlobError && /already exists/i.test(error.message));
}

export async function reservePinAttempt() {
  const now = Date.now();
  for (let tryNumber = 0; tryNumber < 4; tryNumber++) {
    const stored = await readJson(attemptsPath);
    const previous = stored ? JSON.parse(stored.content) as { count: number; end: number } : null;
    const window = previous && previous.end > now ? previous : { count: 0, end: now + 60 * 60_000 };
    if (window.count >= 5) return false;
    try {
      await writeJson(attemptsPath, { ...window, count: window.count + 1 }, stored?.revision);
      return true;
    } catch (error) {
      if (!conflicted(error)) throw error;
    }
  }
  return false;
}

function pdfKey(invoice: SavedInvoice) {
  const version = createHash("sha256").update(JSON.stringify(invoice)).digest("hex");
  return "ct-invoices/v1/pdf/" + version + ".pdf";
}

async function storePdf(invoice: SavedInvoice) {
  const key = pdfKey(invoice);
  const pdf = await renderInvoicePdf(invoice);
  try {
    await put(key, pdf, { ...access, contentType: "application/pdf", cacheControlMaxAge: 60 });
  } catch (error) {
    if (!conflicted(error)) throw error;
  }
}

export async function load() {
  const stored = await readJson(workspacePath);
  return stored
    ? { workspace: readWorkspace(stored.content), revision: stored.revision }
    : { workspace: emptyWorkspace(), revision: "initial" };
}

export async function save(next: Workspace, revision: string) {
  const current = await load();
  if (current.revision !== revision) throw new InvoiceError("Invoices changed on another device. Refresh and try again.");
  const prior = new Map(current.workspace.invoices.map((invoice) => [invoice.id, invoice]));
  const updated = new Map(next.invoices.map((invoice) => [invoice.id, invoice]));
  for (const [id, invoice] of prior) {
    if (updated.get(id)?.number !== invoice.number) throw new InvoiceError("Saved invoice numbers cannot be removed or changed.");
  }

  const changed = next.invoices.filter((invoice) => JSON.stringify(invoice) !== JSON.stringify(prior.get(invoice.id)));
  if (changed.length > 20) throw new InvoiceError("Import up to 20 invoices at a time.", 413);
  for (let index = 0; index < changed.length; index += 5) {
    await Promise.all(changed.slice(index, index + 5).map(storePdf));
  }

  try {
    const saved = await writeJson(workspacePath, next, revision === "initial" ? undefined : revision);
    return { workspace: next, revision: saved.etag };
  } catch (error) {
    if (conflicted(error)) throw new InvoiceError("Invoices changed on another device. Refresh and try again.");
    throw error;
  }
}

async function invoiceById(id: string, expected?: string) {
  const { workspace } = await load();
  const invoice = workspace.invoices.find((record) => record.id === id);
  if (!invoice) throw new InvoiceError("That invoice could not be found.", 404);
  if (expected && JSON.stringify(invoice) !== expected) throw new InvoiceError("This invoice changed. Reopen it from Invoices.");
  return invoice;
}

async function archivedPdf(invoice: SavedInvoice) {
  const blob = await get(pdfKey(invoice), access);
  if (blob?.statusCode !== 200) throw new InvoiceError("The invoice PDF could not be found.", 404);
  return blob.stream;
}

export async function pdf(id: string) {
  const invoice = await invoiceById(id);
  return { filename: invoice.number + ".pdf", stream: await archivedPdf(invoice) };
}

export async function email(id: string, expected: string) {
  const invoice = await invoiceById(id, expected);
  if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(invoice.email)) {
    throw new InvoiceError("Enter one valid client email before sending.", 400);
  }
  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.CONTACT_SENDER_EMAIL ?? "hello@mail.thecreativetechnician.online";
  if (!apiKey) throw new InvoiceError("The site's email service is unavailable.", 503);

  const key = createHash("sha256").update(expected).digest("hex");
  const receiptPath = "ct-invoices/v1/email/" + key + ".json";
  if (await readJson(receiptPath)) return { alreadySent: true };

  const content = Buffer.from(await new Response(await archivedPdf(invoice)).arrayBuffer()).toString("base64");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", "Idempotency-Key": "ct-invoice/" + key },
    body: JSON.stringify({
      from: `${SITE_NAME} <${sender}>`, to: [invoice.email], reply_to: INVOICE_EMAIL,
      subject: "Invoice " + invoice.number + " from " + SITE_NAME,
      text: `Hi ${invoice.client},\n\nPlease find invoice ${invoice.number} attached.\n\nThank you,\n${SITE_NAME}`,
      attachments: [{ filename: invoice.number + ".pdf", content, content_type: "application/pdf" }],
    }),
    signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
  });
  if (!response.ok) throw new InvoiceError("The email service could not send this invoice. Try again shortly.", 502);
  try { await writeJson(receiptPath, { sentAt: new Date().toISOString() }); }
  catch (error) { if (!conflicted(error)) throw error; }
  return { alreadySent: false };
}
