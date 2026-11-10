"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import {
  analyticsAllowed,
  CONSENT_OPEN_EVENT,
  getAnalyticsConsent,
  GOOGLE_ANALYTICS_ID,
  saveAnalyticsConsent,
  subscribeToAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics-consent";

const serverConsent = () => null;

export function CookieSettingsButton() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}>
      Cookie settings
    </button>
  );
}

export function AnalyticsConsentControls() {
  const consent = useSyncExternalStore(subscribeToAnalyticsConsent, getAnalyticsConsent, serverConsent);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const openSettings = () => setSettingsOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, openSettings);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, openSettings);
  }, []);

  function choose(choice: Exclude<AnalyticsConsent, null>) {
    const wasAccepted = consent === "accepted";
    const reloadSafe = saveAnalyticsConsent(choice);
    setSettingsOpen(false);
    if (choice === "rejected" && wasAccepted) {
      // Unmounting does not remove listeners already installed by providers.
      if (reloadSafe) {
        window.location.reload();
      } else {
        const url = new URL(window.location.href);
        url.searchParams.set("analytics", "off");
        window.location.replace(url);
      }
    }
  }

  return (
    <>
      {consent === "accepted" && (
        <>
          <Analytics beforeSend={(event) => analyticsAllowed() ? event : null} />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window['ga-disable-${GOOGLE_ANALYTICS_ID}'] = false;
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'granted', ad_storage: 'denied',
                ad_user_data: 'denied', ad_personalization: 'denied'
              });
              gtag('js', new Date());
              gtag('config', '${GOOGLE_ANALYTICS_ID}', {
                allow_google_signals: false, allow_ad_personalization_signals: false
              });
            `}
          </Script>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`} strategy="lazyOnload" />
          <Script src="https://analytics.ahrefs.com/analytics.js" data-key="zCLC+rjJQ9XshNm2L5qAkQ" strategy="lazyOnload" />
        </>
      )}
      {(consent === null || settingsOpen) && (
        <section
          aria-label="Cookie settings"
          // Compact so it never covers the hero copy and calls to action on first
          // load: pinned to the very bottom on phones (the sticky mobile CTA bar
          // is hidden while the hero is on screen), bottom-right on wider screens.
          // It sits above that CTA bar so a pending choice stays reachable.
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-xl border border-white/20 bg-[#101713] p-3 text-[13px] text-white shadow-2xl md:left-auto md:right-4 md:bottom-[max(1rem,env(safe-area-inset-bottom))] md:w-[24rem] md:max-h-[calc(100dvh-2rem)] md:rounded-2xl md:p-4 md:text-sm"
          style={{ zIndex: 120 }}
        >
          <h2 className="mb-1.5 hidden text-base font-semibold md:block">Your analytics choice</h2>
          <p className="leading-relaxed text-white/80">
            Google Analytics, Ahrefs and Vercel Analytics stay off unless you allow them. Your choice is saved in this browser and can be changed in Cookie settings. <Link className="underline underline-offset-4" href="/privacy">Privacy policy</Link>
          </p>
          <div className="mt-2.5 flex gap-2 md:mt-3 md:flex-wrap md:gap-3">
            <button type="button" onClick={() => choose("rejected")} className="min-h-10 flex-1 rounded-lg border border-white/40 px-3 py-2 font-semibold hover:bg-white/10 md:flex-none md:px-4">Reject analytics</button>
            <button type="button" onClick={() => choose("accepted")} className="min-h-10 flex-1 rounded-lg border border-white/40 px-3 py-2 font-semibold hover:bg-white/10 md:flex-none md:px-4">Allow analytics</button>
            {consent !== null && <button type="button" onClick={() => setSettingsOpen(false)} className="px-2 py-2 underline underline-offset-4">Close</button>}
          </div>
          <noscript>JavaScript is disabled, so optional analytics are off.</noscript>
        </section>
      )}
    </>
  );
}
