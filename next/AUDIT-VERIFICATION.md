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

## Browser checks before promotion

The editing environment could not launch a browser process or expose its localhost server to the available cloud browser. Therefore these interaction checks remain unverified:

- Fresh visitor: no Google, Ahrefs or Vercel analytics requests before acceptance; rejection persists through navigation.
- Cookie settings: accept, reopen, close, reject after acceptance, reload, and cross-tab revocation. Known first-party Google analytics cookies should be removed on rejection.
- Storage-disabled browser: consent remains fail-closed. A temporary session-storage guard or `analytics=off` URL fallback prevents an old acceptance from reviving after a failed rejection save.
- Short-height viewport (393 × 252 CSS pixels): open menu, scroll to the final item, select a link, reopen, dismiss with Escape and verify focus returns to the disclosure control.
- Enquiry: required fields remain required, budget/timeline can stay empty, workshop CTA preselects the service, and existing success/error/retry behavior is preserved. Use isolated/mock delivery for browser tests.
- New package details: expand/collapse each scope disclosure, compare mobile cards, and check keyboard focus and text wrapping.

No mobile Lighthouse score, Core Web Vitals measurement, real-device result, live form submission or newsletter-delivery result is claimed.

## Hardening boundaries

The added CSP intentionally covers `object-src`, `base-uri` and `frame-ancestors`. It preserves the current static rendering, analytics, images and admin scripts; it does not claim to prevent every script-injection attack. A stricter script/style policy needs its own nonce/hash strategy and browser compatibility rollout. `nosniff`, an explicit referrer policy and same-origin framing are also configured.

The existing form rate limiter remains per-process/serverless-instance memory. No shared store is configured in this repository. A distributed limit requires selecting and authorizing an existing shared service or a new provider, configuring its access, then testing failure behavior. No paid service, account, credential or access grant was created here.

The policy edits reconcile the site with its implementation and owner-approved commercial choices. They are not a legal-compliance certification. No production merge or deployment is part of this change.
