import { BlobPreconditionFailedError, BlobError, get, list, put } from "@vercel/blob";
import { createHash } from "node:crypto";
import { INVOICE_EMAIL, emptyWorkspace, readWorkspace, type SavedInvoice, type Workspace } from "@/lib/invoices";
import { SITE_NAME } from "@/lib/site";
import { invoiceEmailMessage } from "./email-template";
import { renderInvoicePdf } from "./pdf";

const EMAIL_TIMEOUT_MS = 8000;
const workspacePath = "ct-invoices/v1/workspace.json";
const emailPrefix = "ct-invoices/v1/email/";
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

function fingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function pdfKey(invoice: SavedInvoice) {
  return "ct-invoices/v1/pdf/" + fingerprint(JSON.stringify(invoice)) + ".pdf";
}

async function readReceipt(path: string) {
  const receipt = await readJson(path);
  if (!receipt) return null;
  const { sentAt } = JSON.parse(receipt.content) as { sentAt: string };
  return sentAt;
}

async function writeReceipt(path: string, sentAt: string) {
  try { await writeJson(path, { sentAt }); }
  catch (error) { if (!conflicted(error)) throw error; }
}

async function preserveLegacyReceipt(invoice: SavedInvoice) {
  const version = fingerprint(JSON.stringify(invoice));
  const sentAt = await readReceipt(emailPrefix + version + ".json");
  if (!sentAt) return;
  // Carry the original time in the path because the copy has a new upload time.
  const original = Date.parse(sentAt);
  if (Number.isFinite(original)) {
    await writeReceipt(emailPrefix + fingerprint(invoice.id) + "/" + version + "-" + original + ".json", sentAt);
  }
}

export async function loadHistory() {
  const snapshot = await load();
  const ids = new Map(snapshot.workspace.invoices.map((invoice) => [fingerprint(invoice.id), invoice.id]));
  const legacyIds = new Map(snapshot.workspace.invoices.map((invoice) => [fingerprint(JSON.stringify(invoice)), invoice.id]));
  const sentAtById = new Map<string, string>();
  if (!ids.size) return { ...snapshot, sentAtById: {} };

  let cursor: string | undefined;
  do {
    const page = await list({ prefix: emailPrefix, cursor });
    for (const { pathname, uploadedAt } of page.blobs) {
      const relativePath = pathname.slice(emailPrefix.length);
      const receipt = /^([a-f0-9]{64})(?:\/([a-f0-9]{64})(?:-(\d{13}))?)?\.json$/.exec(relativePath);
      if (!receipt) continue;
      const [, first, version, original] = receipt;
      const id = version ? ids.get(first) : legacyIds.get(first);
      if (id === undefined) continue;

      const sentAt = (original ? new Date(Number(original)) : uploadedAt).toISOString();
      if (sentAt > (sentAtById.get(id) ?? "")) sentAtById.set(id, sentAt);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return { ...snapshot, sentAtById: Object.fromEntries(sentAtById) };
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
    await Promise.all(changed.slice(index, index + 5).map(async (invoice) => {
      const previous = prior.get(invoice.id);
      if (previous) await preserveLegacyReceipt(previous);
      await storePdf(invoice);
    }));
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

  const key = fingerprint(expected);
  const receiptPath = emailPrefix + fingerprint(invoice.id) + "/" + key + ".json";
  const existing = await readReceipt(receiptPath) ?? await readReceipt(emailPrefix + key + ".json");
  if (existing) return { alreadySent: true, sentAt: existing };

  const content = Buffer.from(await new Response(await archivedPdf(invoice)).arrayBuffer()).toString("base64");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", "Idempotency-Key": "ct-invoice/" + key },
    body: JSON.stringify({
      from: `${SITE_NAME} <${sender}>`, to: [invoice.email], reply_to: INVOICE_EMAIL,
      ...invoiceEmailMessage(invoice),
      attachments: [{ filename: invoice.number + ".pdf", content, content_type: "application/pdf" }],
    }),
    signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
  });
  if (!response.ok) throw new InvoiceError("The email service could not send this invoice. Try again shortly.", 502);
  const sentAt = new Date().toISOString();
  await writeReceipt(receiptPath, sentAt);
  return { alreadySent: false, sentAt };
}
