import { track } from "@vercel/analytics";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Sends a conversion event to both Google Analytics and Vercel Analytics.
 * Safe to call before either script has loaded; failures are swallowed so
 * tracking can never break a form or link.
 */
export function trackEvent(name: string, params: EventParams = {}) {
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
