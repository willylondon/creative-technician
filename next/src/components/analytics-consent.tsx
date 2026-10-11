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
          className="bottom-[max(5rem,env(safe-area-inset-bottom))] max-h-[calc(100dvh-6rem)] rounded-2xl border border-white/20 bg-[#101713] p-5 text-sm text-white shadow-2xl md:bottom-[max(1rem,env(safe-area-inset-bottom))] md:max-h-[calc(100dvh-2rem)]"
          style={{ position: "fixed", left: "1rem", right: "1rem", maxWidth: "36rem", overflowY: "auto", zIndex: 100 }}
        >
          <h2 className="mb-2 text-lg font-semibold">Your analytics choice</h2>
          <p className="leading-relaxed text-white/80">
            With your permission, Google Analytics, Ahrefs and Vercel Analytics help us understand visits and improve this site. Optional analytics stay off until you accept. We save your choice in this browser.
          </p>
          <p className="mt-2 text-white/80">
            You can change your choice in Cookie settings at any time. <Link className="underline underline-offset-4" href="/privacy">Privacy policy</Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => choose("rejected")} className="rounded-lg border border-white/40 px-4 py-2 font-semibold hover:bg-white/10">Reject analytics</button>
            <button type="button" onClick={() => choose("accepted")} className="rounded-lg border border-white/40 px-4 py-2 font-semibold hover:bg-white/10">Allow analytics</button>
            {consent !== null && <button type="button" onClick={() => setSettingsOpen(false)} className="px-2 py-2 underline underline-offset-4">Close</button>}
          </div>
          <noscript>JavaScript is disabled, so optional analytics are off.</noscript>
        </section>
      )}
    </>
  );
}
