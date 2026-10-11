# Site audit fixes — October 2026

## Verification

From `next/`, using Node 22.18+ (Node 24 was used for this change):

```sh
npm ci
npm run lint
npm test
npx tsc --noEmit
npm run build
npm run test:smoke
```

`npm test` covers consent defaults, accept/reject persistence, storage and cookie failures, cross-tab revocation, header configuration, legal redirects and optional enquiry fields. The contact-action tests substitute isolated provider/header/environment bindings: no test enquiry or email is sent to an external service.

`test:smoke` starts the built app on localhost and checks seven pages, response headers, Open Graph/canonical URLs, server-rendered analytics exclusion, optional form fields, confirmed phone, offer schema, the new case-study route, sitemap and 404 status. It is an HTTP check, not a browser interaction or delivery test.

## Browser verification on the PR preview

The local process sandbox could not launch Chromium or expose localhost to the cloud browser. After GitHub created the normal Vercel preview, cloud Chromium could test application commit `dbabd05e41d514bff40ddc193ba65f83a82575e7` on October 11, 2026.

Verified through the rendered UI and DOM:

- No Google, Ahrefs or Vercel analytics script elements on a fresh visit or after rejection. All three appear only after **Allow analytics**. Reopening, closing and changing the settings works.
- Rejecting after acceptance reloads the page with those scripts absent. Revocation in a second tab also reloads the first tab with no analytics script elements.
- At 300% zoom, the viewport is 393 × 252 CSS pixels. The menu is scrollable (`scrollHeight` 338, `clientHeight` 166); its bottom remains within the viewport, and scrolling reaches Download résumé. Escape closes it and returns focus to the disclosure. Reopening and selecting Field notes works and closes the menu.
- Workshop CTA preselects the workshop. Budget and timeline are labeled optional and neither has the native required attribute. No enquiry was submitted.
- Automation, workshop and support scope disclosures expand to the approved limits and exclusions.
- Builds metadata, one Privacy Policy H1, and the new AI Reporting Engine case study render correctly. Its evidence is explicitly architectural rather than a measured result.
- Newsletter dialog focuses the email field and Escape closes it with focus restored. No subscription was submitted.

Limits: this verifies rendered script gating, not a complete third-party network/cookie audit. Storage-denial, cookie-removal and failure-path behavior are covered by isolated automated tests; real-device/touch behavior and deferred-script loading races were not exhaustively tested. No mobile Lighthouse score, Core Web Vitals measurement or live email-delivery result is claimed.

## Hardening boundaries

The added CSP intentionally covers `object-src`, `base-uri` and `frame-ancestors`. It preserves the current static rendering, analytics, images and admin scripts; it does not claim to prevent every script-injection attack. A stricter script/style policy needs its own nonce/hash strategy and browser compatibility rollout. `nosniff`, an explicit referrer policy and same-origin framing are also configured.

The existing form rate limiter remains per-process/serverless-instance memory. No shared store is configured in this repository. A distributed limit requires selecting and authorizing an existing shared service or a new provider, configuring its access, then testing failure behavior. No paid service, account, credential or access grant was created here.

The policy edits reconcile the site with its implementation and owner-approved commercial choices. They are not a legal-compliance certification. No production merge or deployment is part of this change.
