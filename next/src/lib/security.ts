import { createHash } from "node:crypto";
import { headers } from "next/headers";

/**
 * Escapes the five XML/HTML metacharacters so untrusted form input can be
 * interpolated into an email body without injecting markup.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email) && email.length <= 254;
}

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Fixed-window rate limiter.
 *
 * State lives in module memory, so the window is per serverless instance rather
 * than global. That is enough to stop naive scripted floods, but it is not a
 * strict guarantee — checkSharedRateLimit below uses Upstash Redis when it is
 * configured and only falls back to this.
 */
const MAX_BUCKETS = 1000;

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) {
      if (now > b.resetAt) {
        buckets.delete(k);
      }
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

/** Upper bound for any outbound provider call, so a slow API cannot hang a form. */
export const OUTBOUND_TIMEOUT_MS = 8000;

/**
 * Stable, non-reversible key for a personal value (e.g. an email address), so
 * rate-limit buckets never store the value itself.
 */
export function hashKey(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex").slice(0, 32);
}

/**
 * Rate limiter backed by Upstash Redis when it is configured, so the window is
 * shared by every serverless instance. Without it — or if Redis is unreachable —
 * this falls back to the per-instance limiter above rather than blocking visitors.
 *
 * Accepts either the Upstash env names or the ones Vercel's integration injects.
 */
export async function checkSharedRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return checkRateLimit(key, limit, windowMs);
  }

  try {
    const redisKey = `ratelimit:${key}`;
    const response = await fetch(`${url.replace(/\/+$/, "")}/pipeline`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      // Start the window only if the key is new, then count this attempt.
      body: JSON.stringify([
        ["SET", redisKey, 0, "PX", windowMs, "NX"],
        ["INCR", redisKey],
      ]),
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) throw new Error(`Upstash responded ${response.status}`);

    const results = (await response.json()) as Array<{ result?: unknown; error?: string }>;
    const count = Number(results?.[1]?.result);
    if (!Number.isFinite(count)) throw new Error("Upstash returned no counter");

    return count <= limit;
  } catch (error) {
    console.error("Shared rate limit unavailable, using per-instance limiter", error);
    return checkRateLimit(key, limit, windowMs);
  }
}

/** Best-effort client IP from the proxy chain, for rate-limit bucketing. */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return headerList.get("x-real-ip") ?? "unknown";
}
