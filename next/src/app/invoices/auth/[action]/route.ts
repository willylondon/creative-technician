import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security";
import { configured, cookieOptions, isInvoicePin, issueSession, matchesPin, origin, sessionCookie } from "@/lib/invoice-cloud/session";
import { reservePinAttempt } from "@/lib/invoice-cloud/store";

const redirect = (path: string) => NextResponse.redirect(origin() + path, {
  status: 303, headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" },
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  if (request.headers.get("origin") !== origin()) return new NextResponse(null, { status: 403 });
  const { action } = await params;
  if (action === "logout") {
    const response = redirect("/invoices");
    response.cookies.set(sessionCookie, "", cookieOptions(0));
    return response;
  }
  if (action !== "unlock") return new NextResponse(null, { status: 404 });
  if (!configured()) return redirect("/invoices");
  if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")
    || Number(request.headers.get("content-length") ?? 0) > 128) return new NextResponse(null, { status: 400 });
  const body = await request.text();
  if (body.length > 128) return new NextResponse(null, { status: 400 });
  const pin = new URLSearchParams(body).get("pin") ?? "";
  if (!isInvoicePin(pin)) return redirect("/invoices?auth=failed");

  const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit("invoices-pin:" + ip, 5, 60 * 60_000)) return redirect("/invoices?auth=limited");
  try {
    if (!(await reservePinAttempt())) return redirect("/invoices?auth=limited");
  } catch {
    return redirect("/invoices?auth=unavailable");
  }
  if (!matchesPin(pin)) return redirect("/invoices?auth=failed");
  const response = redirect("/invoices");
  response.cookies.set(sessionCookie, issueSession(), cookieOptions());
  return response;
}
