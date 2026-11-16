import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "@/lib/site";

const TTL = 14 * 24 * 60 * 60;
export const sessionCookie = "ct_invoice_session";
export const origin = () => new URL(process.env.INVOICE_APP_ORIGIN ?? SITE_URL).origin;
export const cookieOptions = (maxAge = TTL) => ({
  path: "/invoices", httpOnly: true, sameSite: "strict" as const,
  secure: origin().startsWith("https:"), maxAge,
});

export function configured() {
  return /^[a-f0-9]{32}:[a-f0-9]{64}$/.test(process.env.INVOICE_PIN_HASH ?? "")
    && (process.env.INVOICE_SESSION_KEY?.length ?? 0) >= 32
    && Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN));
}

export function isInvoicePin(pin: string) {
  return /^[0-9]{4}$/.test(pin);
}

export function matchesPin(pin: string) {
  if (!configured() || !isInvoicePin(pin)) return false;
  const [salt, expected] = process.env.INVOICE_PIN_HASH!.split(":");
  return timingSafeEqual(scryptSync(pin, Buffer.from(salt, "hex"), 32), Buffer.from(expected, "hex"));
}

function signature(value: string) {
  return createHmac("sha256", process.env.INVOICE_SESSION_KEY!)
    .update("invoices\n" + process.env.INVOICE_PIN_HASH + "\n" + value)
    .digest("hex");
}

export function issueSession() {
  const value = (Math.floor(Date.now() / 1000) + TTL) + "." + randomBytes(20).toString("hex");
  return value + "." + signature(value);
}

export function hasSession(cookie?: string) {
  if (!configured() || !cookie || !/^\d{10,12}\.[a-f0-9]{40}\.[a-f0-9]{64}$/.test(cookie)) return false;
  const [expiration, nonce, tag] = cookie.split(".");
  if (Number(expiration) <= Math.floor(Date.now() / 1000)) return false;
  return timingSafeEqual(Buffer.from(tag, "hex"), Buffer.from(signature(expiration + "." + nonce), "hex"));
}
