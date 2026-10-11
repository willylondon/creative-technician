import { track } from "@vercel/analytics";
import { analyticsAllowed } from "@/lib/analytics-consent";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Sends a conversion event to both Google Analytics and Vercel Analytics.
 * Only sends after explicit analytics consent; pre-consent events are discarded.
 * Failures are swallowed so tracking can never break a form or link.
 */
export function trackEvent(name: string, params: EventParams = {}) {
  if (!analyticsAllowed()) return;
  try {
    window.gtag?.("event", name, params);
  } catch {
    // analytics unavailable
  }
  try {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined),
    ) as Record<string, string | number | boolean>;
    track(name, clean);
  } catch {
    // analytics unavailable
  }
}
