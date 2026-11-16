import { NextRequest, NextResponse } from "next/server";
import { readWorkspace } from "@/lib/invoices";
import * as store from "@/lib/invoice-cloud/store";
import { hasSession, origin, sessionCookie } from "@/lib/invoice-cloud/session";

const MAX_REQUEST_BYTES = 1_000_000;

function json(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
}

async function authenticated(request: NextRequest, action: () => Promise<unknown>) {
  if (!hasSession(request.cookies.get(sessionCookie)?.value)) return json({ error: "Unlock the invoice workspace." }, 401);
  try {
    const result = await action();
    return result instanceof NextResponse ? result : json(result);
  } catch (error) {
    if (error instanceof store.InvoiceError) return json({ error: error.message }, error.status);
    return json({ error: "The invoice service is unavailable. Try again shortly." }, 502);
  }
}

export async function GET(request: NextRequest) {
  return authenticated(request, async () => {
    const id = request.nextUrl.searchParams.get("pdf");
    if (!id) return request.nextUrl.searchParams.has("history") ? store.loadHistory() : store.load();
    const result = await store.pdf(id);
    return new NextResponse(result.stream, { headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Cache-Control": "private, no-store",
    } });
  });
}

async function readPayload(request: NextRequest) {
  if (!request.body) throw new store.InvoiceError("No invoice data was supplied.", 400);
  const reader = request.body.getReader();
  const parts: Uint8Array[] = [];
  let received = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new store.InvoiceError("This import is too large.", 413);
      }
      parts.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try { return JSON.parse(Buffer.concat(parts, received).toString("utf8")); }
  catch { throw new store.InvoiceError("Invalid invoice data.", 400); }
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== origin()
    || request.headers.get("content-type")?.split(";")[0] !== "application/json") {
    return json({ error: "Request origin or format is invalid." }, 403);
  }
  return authenticated(request, async () => {
    const body = await readPayload(request);
    if (body?.action === "save" && typeof body.revision === "string") {
      const workspace = (() => {
        try { return readWorkspace(JSON.stringify(body.workspace)); }
        catch { throw new store.InvoiceError("The invoice data is invalid.", 400); }
      })();
      return store.save(workspace, body.revision);
    }
    if (typeof body?.id === "string" && typeof body.invoice === "string") {
      if (body.action === "email") return store.email(body.id, body.invoice);
    }
    throw new store.InvoiceError("Unknown invoice action.", 400);
  });
}
