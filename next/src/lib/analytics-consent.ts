/** A versioned, necessary preference; no analytics code runs before opt-in. */
export const CONSENT_STORAGE_KEY = "ct-analytics-consent-v1";
export const CONSENT_REJECTION_KEY = "ct-analytics-rejected-v1";
export const CONSENT_CHANGE_EVENT = "ct:analytics-consent-change";
export const CONSENT_OPEN_EVENT = "ct:open-cookie-settings";
export const GOOGLE_ANALYTICS_ID = "G-R13SZWDJ3S";
export type AnalyticsConsent = "accepted" | "rejected" | null;

// Retain an explicit choice for this page if browser storage is unavailable.
let sessionConsent: AnalyticsConsent = null;

export function parseConsent(value: string | null): AnalyticsConsent {
  return value === "accepted" || value === "rejected" ? value : null;
}

export function getAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return null;
  if (sessionConsent) return sessionConsent;
  // A failed storage write must never resurrect an earlier opt-in on reload.
  // Remember the URL guard in memory so client-side navigation remains off.
  if (new URL(window.location.href).searchParams.get("analytics") === "off") {
    sessionConsent = "rejected";
    return sessionConsent;
  }
  try {
    if (window.sessionStorage.getItem(CONSENT_REJECTION_KEY) === "rejected") {
      return "rejected";
    }
  } catch {
    // Check the persistent preference if session storage is unavailable.
  }
  try {
    return parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function analyticsAllowed(): boolean {
  return getAnalyticsConsent() === "accepted";
}

/** Returns whether the choice is stored, or rejection can safely default off. */
export function saveAnalyticsConsent(choice: Exclude<AnalyticsConsent, null>): boolean {
  sessionConsent = choice;
  let persisted = false;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    persisted = window.localStorage.getItem(CONSENT_STORAGE_KEY) === choice;
  } catch {
    // The in-memory choice still applies in the current page.
  }

  let reloadSafe = persisted;
  if (choice === "rejected") {
    if (!persisted) {
      // Remove a stale opt-in where possible, including quota-exceeded storage.
      try {
        window.localStorage.removeItem(CONSENT_STORAGE_KEY);
        reloadSafe = window.localStorage.getItem(CONSENT_STORAGE_KEY) === null;
      } catch {
        // A session guard or the caller's URL fallback can still preserve off.
      }
      try {
        window.sessionStorage.setItem(CONSENT_REJECTION_KEY, "rejected");
        reloadSafe = window.sessionStorage.getItem(CONSENT_REJECTION_KEY) === "rejected" || reloadSafe;
      } catch {
        // If both stores fail, the caller reloads with ?analytics=off.
      }
    }
    stopAnalytics();
  } else {
    try {
      window.sessionStorage.removeItem(CONSENT_REJECTION_KEY);
    } catch {
      // The explicit in-memory opt-in still applies to the current page.
    }
    const url = new URL(window.location.href);
    if (url.searchParams.get("analytics") === "off") {
      url.searchParams.delete("analytics");
      try {
        window.history.replaceState(window.history.state, "", url);
      } catch {
        // An uncleared fallback may safely default to off on a later reload.
      }
    }
  }
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  return reloadSafe;
}

export function subscribeToAnalyticsConsent(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== CONSENT_STORAGE_KEY && event.key !== null) return;
    sessionConsent = null;
    if (event.newValue === "accepted") {
      try {
        window.sessionStorage.removeItem(CONSENT_REJECTION_KEY);
      } catch {
        // A rejection guard takes precedence if it cannot be cleared.
      }
    }
    const allowed = analyticsAllowed();
    if (!allowed) stopAnalytics();
    onChange();
    // Reload also stops third-party listeners already installed in this tab.
    if (!allowed) window.location.reload();
  };
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function stopAnalytics() {
  Object.assign(window, { [`ga-disable-${GOOGLE_ANALYTICS_ID}`]: true });
  removeAnalyticsCookies();
}

export function removeAnalyticsCookies() {
  const domains = window.location.hostname.split(".");
  const suffixes = ["", ...domains.slice(0, -1).map((_, index) => `; domain=.${domains.slice(index).join(".")}`)];
  let cookies: string;
  try {
    cookies = document.cookie;
  } catch {
    // A browser that blocks cookie access must not prevent consent revocation.
    return;
  }
  for (const cookie of cookies.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (!/^(_ga(?:_|$)|_gid$|_gat(?:_|$))/.test(name)) continue;
    for (const domain of suffixes) {
      try {
        document.cookie = `${name}=; Max-Age=0; path=/${domain}; SameSite=Lax`;
      } catch {
        // Continue disabling collection even when cookies cannot be edited.
      }
    }
  }
}
