import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
let moduleSequence = 0;
let browser;

async function freshConsentModule() {
  return import(`./analytics-consent.ts?test=${++moduleSequence}`);
}

function createBrowser() {
  const values = new Map();
  const sessionValues = new Map();
  const cookies = new Map();
  const cookieWrites = [];
  let reloadCount = 0;
  const localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
  };
  const window = Object.assign(new EventTarget(), {
    localStorage,
    sessionStorage: {
      getItem: (key) => sessionValues.get(key) ?? null,
      setItem: (key, value) => sessionValues.set(key, String(value)),
      removeItem: (key) => sessionValues.delete(key),
    },
    location: {
      href: "https://www.thecreativetechnician.online/",
      hostname: "www.thecreativetechnician.online",
      reload: () => { reloadCount += 1; },
    },
  });
  window.history = {
    state: null,
    replaceState: (_state, _title, url) => { window.location.href = String(url); },
  };
  const document = {};
  Object.defineProperty(document, "cookie", {
    get: () => [...cookies].map(([name, value]) => `${name}=${value}`).join("; "),
    set: (value) => {
      cookieWrites.push(value);
      const [pair, ...attributes] = value.split(";");
      const [name, ...parts] = pair.split("=");
      if (attributes.some((part) => part.trim().toLowerCase() === "max-age=0")) {
        cookies.delete(name);
      } else {
        cookies.set(name, parts.join("="));
      }
    },
  });
  function dispatchStorage(key, newValue, oldValue = null) {
    if (key === null) values.clear();
    else if (newValue === null) values.delete(key);
    else values.set(key, newValue);
    const event = new Event("storage");
    Object.assign(event, { key, newValue, oldValue, storageArea: localStorage });
    window.dispatchEvent(event);
  }
  return {
    window, document, values, sessionValues, cookies, cookieWrites, dispatchStorage,
    get reloadCount() { return reloadCount; },
  };
}

beforeEach(() => {
  browser = createBrowser();
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser.window });
  Object.defineProperty(globalThis, "document", { configurable: true, value: browser.document });
});

afterEach(() => {
  for (const [name, descriptor] of [["window", originalWindow], ["document", originalDocument]]) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else delete globalThis[name];
  }
});

test("only explicit accepted or rejected values are valid consent", async () => {
  const { parseConsent } = await freshConsentModule();
  assert.equal(parseConsent("accepted"), "accepted");
  assert.equal(parseConsent("rejected"), "rejected");
  for (const value of [null, "", "true", "granted", "Accepted", " accepted ", "{}", "v0:accepted"]) {
    assert.equal(parseConsent(value), null, `Unexpected consent for ${JSON.stringify(value)}`);
  }
});

test("server-side and fresh-browser consent default to analytics off", async () => {
  const consent = await freshConsentModule();
  assert.equal(consent.getAnalyticsConsent(), null);
  assert.equal(consent.analyticsAllowed(), false);
  delete globalThis.window;
  assert.equal(consent.getAnalyticsConsent(), null);
  assert.equal(consent.analyticsAllowed(), false);
});

test("persisted consent allows analytics only for an exact accepted value", async () => {
  const consent = await freshConsentModule();
  for (const [value, expected] of [["accepted", true], ["rejected", false], ["garbage", false]]) {
    browser.values.set(consent.CONSENT_STORAGE_KEY, value);
    assert.equal(consent.analyticsAllowed(), expected);
  }
});

test("unreadable storage defaults to analytics off", async () => {
  browser.window.localStorage.getItem = () => { throw new Error("Storage is blocked"); };
  const consent = await freshConsentModule();
  assert.equal(consent.getAnalyticsConsent(), null);
  assert.equal(consent.analyticsAllowed(), false);
});

test("accepting and rejecting persist the exact choice and notify subscribers", async () => {
  const consent = await freshConsentModule();
  const snapshots = [];
  const unsubscribe = consent.subscribeToAnalyticsConsent(() => snapshots.push(consent.getAnalyticsConsent()));
  consent.saveAnalyticsConsent("accepted");
  assert.equal(browser.values.get(consent.CONSENT_STORAGE_KEY), "accepted");
  assert.equal(consent.analyticsAllowed(), true);
  consent.saveAnalyticsConsent("rejected");
  assert.equal(browser.values.get(consent.CONSENT_STORAGE_KEY), "rejected");
  assert.equal(consent.analyticsAllowed(), false);
  assert.deepEqual(snapshots, ["accepted", "rejected"]);
  unsubscribe();
  consent.saveAnalyticsConsent("accepted");
  assert.deepEqual(snapshots, ["accepted", "rejected"]);
});

test("an explicit choice applies in this page even if storage writes fail", async () => {
  browser.window.localStorage.setItem = () => { throw new Error("Storage is full"); };
  const consent = await freshConsentModule();
  let changes = 0;
  const unsubscribe = consent.subscribeToAnalyticsConsent(() => { changes += 1; });
  assert.doesNotThrow(() => consent.saveAnalyticsConsent("accepted"));
  assert.equal(consent.analyticsAllowed(), true);
  assert.doesNotThrow(() => consent.saveAnalyticsConsent("rejected"));
  assert.equal(consent.analyticsAllowed(), false);
  assert.equal(changes, 2);
  unsubscribe();
  const nextPage = await freshConsentModule();
  assert.equal(nextPage.analyticsAllowed(), false);
});

test("rejecting cannot restore stale accepted consent after a failed storage write", async () => {
  const consent = await freshConsentModule();
  browser.values.set(consent.CONSENT_STORAGE_KEY, "accepted");
  browser.window.localStorage.setItem = () => { throw new Error("Storage is full"); };
  consent.saveAnalyticsConsent("rejected");
  assert.equal(consent.analyticsAllowed(), false);
  const nextPage = await freshConsentModule();
  assert.equal(nextPage.analyticsAllowed(), false, "A reload must not resurrect the prior accepted choice");
});

test("a session rejection guard survives reload when persistent storage cannot be changed", async () => {
  const consent = await freshConsentModule();
  browser.values.set(consent.CONSENT_STORAGE_KEY, "accepted");
  browser.window.localStorage.setItem = () => { throw new Error("Blocked write"); };
  browser.window.localStorage.removeItem = () => { throw new Error("Blocked deletion"); };
  assert.equal(consent.saveAnalyticsConsent("rejected"), true);
  assert.equal(browser.sessionValues.get(consent.CONSENT_REJECTION_KEY), "rejected");
  const nextPage = await freshConsentModule();
  assert.equal(nextPage.getAnalyticsConsent(), "rejected");
  assert.equal(nextPage.analyticsAllowed(), false);
});

test("rejection reports when both storage guards fail so the caller can use the URL fallback", async () => {
  const consent = await freshConsentModule();
  browser.values.set(consent.CONSENT_STORAGE_KEY, "accepted");
  browser.window.localStorage.setItem = () => { throw new Error("Blocked write"); };
  browser.window.localStorage.removeItem = () => { throw new Error("Blocked deletion"); };
  browser.window.sessionStorage.setItem = () => { throw new Error("Blocked session write"); };
  assert.equal(consent.saveAnalyticsConsent("rejected"), false);
  assert.equal(consent.analyticsAllowed(), false);
  browser.window.location.href = "https://www.thecreativetechnician.online/?analytics=off#contact";
  const nextPage = await freshConsentModule();
  assert.equal(nextPage.getAnalyticsConsent(), "rejected");
  assert.equal(nextPage.analyticsAllowed(), false);
  browser.window.location.href = "https://www.thecreativetechnician.online/blog";
  assert.equal(nextPage.analyticsAllowed(), false, "Client-side navigation must retain the rejection");
});

test("silently ignored storage writes are verified rather than treated as persisted", async () => {
  const consent = await freshConsentModule();
  browser.values.set(consent.CONSENT_STORAGE_KEY, "accepted");
  browser.window.localStorage.setItem = () => {};
  browser.window.localStorage.removeItem = () => {};
  browser.window.sessionStorage.setItem = () => {};
  assert.equal(consent.saveAnalyticsConsent("rejected"), false);
  assert.equal(consent.analyticsAllowed(), false);
});

test("explicit acceptance clears session and URL rejection guards without losing other URL state", async () => {
  const consent = await freshConsentModule();
  browser.sessionValues.set(consent.CONSENT_REJECTION_KEY, "rejected");
  browser.window.location.href = "https://www.thecreativetechnician.online/blog?analytics=off&source=footer#contact";
  assert.equal(consent.getAnalyticsConsent(), "rejected");
  consent.saveAnalyticsConsent("accepted");
  assert.equal(consent.analyticsAllowed(), true);
  assert.equal(browser.sessionValues.has(consent.CONSENT_REJECTION_KEY), false);
  const url = new URL(browser.window.location.href);
  assert.equal(url.searchParams.has("analytics"), false);
  assert.equal(url.searchParams.get("source"), "footer");
  assert.equal(url.hash, "#contact");
  const nextPage = await freshConsentModule();
  assert.equal(nextPage.analyticsAllowed(), true);
});

test("an explicit acceptance remains usable even if the browser prevents URL cleanup", async () => {
  const consent = await freshConsentModule();
  browser.window.location.href = "https://www.thecreativetechnician.online/?analytics=off";
  browser.window.history.replaceState = () => { throw new Error("History unavailable"); };
  assert.equal(consent.getAnalyticsConsent(), "rejected");
  assert.doesNotThrow(() => consent.saveAnalyticsConsent("accepted"));
  assert.equal(consent.analyticsAllowed(), true);
});

test("cross-tab acceptance clears the in-memory choice without reloading", async () => {
  const consent = await freshConsentModule();
  consent.saveAnalyticsConsent("rejected");
  const snapshots = [];
  const unsubscribe = consent.subscribeToAnalyticsConsent(() => snapshots.push(consent.getAnalyticsConsent()));
  browser.dispatchStorage(consent.CONSENT_STORAGE_KEY, "accepted", "rejected");
  assert.equal(consent.analyticsAllowed(), true);
  assert.deepEqual(snapshots, ["accepted"]);
  assert.equal(browser.reloadCount, 0);
  unsubscribe();
});

test("unrelated storage changes do not notify or reload", async () => {
  const consent = await freshConsentModule();
  let changes = 0;
  const unsubscribe = consent.subscribeToAnalyticsConsent(() => { changes += 1; });
  browser.dispatchStorage("unrelated-preference", "rejected");
  assert.equal(changes, 0);
  assert.equal(browser.reloadCount, 0);
  unsubscribe();
  browser.dispatchStorage(consent.CONSENT_STORAGE_KEY, "rejected");
  assert.equal(changes, 0);
  assert.equal(browser.reloadCount, 0);
});

test("cross-tab rejection blocks tracking, removes analytics cookies, and reloads", async () => {
  const consent = await freshConsentModule();
  consent.saveAnalyticsConsent("accepted");
  browser.cookies.set("_ga", "legacy-id");
  browser.cookies.set("_ga_R13SZWDJ3S", "session-id");
  browser.cookies.set("necessary-preference", "keep");
  const snapshots = [];
  const unsubscribe = consent.subscribeToAnalyticsConsent(() => {
    snapshots.push(consent.getAnalyticsConsent());
    assert.equal(browser.window[`ga-disable-${consent.GOOGLE_ANALYTICS_ID}`], true, "Collection must stop before subscribers run");
  });
  browser.dispatchStorage(consent.CONSENT_STORAGE_KEY, "rejected", "accepted");
  assert.equal(consent.analyticsAllowed(), false);
  assert.deepEqual(snapshots, ["rejected"]);
  assert.equal(browser.window[`ga-disable-${consent.GOOGLE_ANALYTICS_ID}`], true);
  assert.equal(browser.cookies.has("_ga"), false);
  assert.equal(browser.cookies.has("_ga_R13SZWDJ3S"), false);
  assert.equal(browser.cookies.get("necessary-preference"), "keep");
  assert.equal(browser.reloadCount, 1);
  unsubscribe();
});

test("cross-tab storage clear or deletion revokes accepted consent", async () => {
  for (const cleared of [false, true]) {
    const consent = await freshConsentModule();
    consent.saveAnalyticsConsent("accepted");
    const unsubscribe = consent.subscribeToAnalyticsConsent(() => {});
    const before = browser.reloadCount;
    browser.dispatchStorage(cleared ? null : consent.CONSENT_STORAGE_KEY, null, "accepted");
    assert.equal(consent.getAnalyticsConsent(), null);
    assert.equal(consent.analyticsAllowed(), false);
    assert.equal(browser.reloadCount, before + 1);
    unsubscribe();
  }
});

test("analytics cookie cleanup targets known names across host and parent domains", async () => {
  const consent = await freshConsentModule();
  const analyticsNames = ["_ga", "_ga_R13SZWDJ3S", "_gid", "_gat", "_gat_gtag_G_R13SZWDJ3S"];
  const preservedNames = ["session", "ct-analytics-consent-v1", "_gallery", "_gaordinary", "_gidget"];
  for (const name of [...analyticsNames, ...preservedNames]) browser.cookies.set(name, "value");
  consent.removeAnalyticsCookies();
  for (const name of analyticsNames) {
    assert.equal(browser.cookies.has(name), false);
    const deletions = browser.cookieWrites.filter((value) => value.startsWith(`${name}=`));
    assert.equal(deletions.length, 3);
    assert.ok(deletions.includes(`${name}=; Max-Age=0; path=/; SameSite=Lax`));
    assert.ok(deletions.includes(`${name}=; Max-Age=0; path=/; domain=.www.thecreativetechnician.online; SameSite=Lax`));
    assert.ok(deletions.includes(`${name}=; Max-Age=0; path=/; domain=.thecreativetechnician.online; SameSite=Lax`));
  }
  for (const name of preservedNames) assert.equal(browser.cookies.get(name), "value");
  assert.equal(browser.cookieWrites.some((value) => value.includes("domain=.online;")), false);
});

test("cookie cleanup also works on a single-label local hostname", async () => {
  const consent = await freshConsentModule();
  browser.window.location.hostname = "localhost";
  browser.cookies.set("_ga", "value");
  consent.removeAnalyticsCookies();
  assert.deepEqual(browser.cookieWrites, ["_ga=; Max-Age=0; path=/; SameSite=Lax"]);
});

test("browser-blocked cookie access cannot interrupt a rejection", async () => {
  const consent = await freshConsentModule();
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { get cookie() { throw new Error("Cookies blocked"); } },
  });
  assert.doesNotThrow(() => consent.saveAnalyticsConsent("rejected"));
  assert.equal(consent.analyticsAllowed(), false);
  assert.equal(browser.window[`ga-disable-${consent.GOOGLE_ANALYTICS_ID}`], true);
});

test("browser-blocked cookie deletion cannot interrupt a rejection", async () => {
  const consent = await freshConsentModule();
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      get cookie() { return "_ga=old; _gid=old"; },
      set cookie(_value) { throw new Error("Cookie changes blocked"); },
    },
  });
  assert.doesNotThrow(() => consent.saveAnalyticsConsent("rejected"));
  assert.equal(consent.analyticsAllowed(), false);
  assert.equal(browser.window[`ga-disable-${consent.GOOGLE_ANALYTICS_ID}`], true);
});
