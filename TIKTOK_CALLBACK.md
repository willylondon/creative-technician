# Jamaican Proverb Daily callback

Register `https://www.thecreativetechnician.online/tiktok/callback` as the Web redirect URI.

This is an HTTPS-to-loopback OAuth response receiver for the owner's local workflow. It is not a token store or an uploader. A direct visit shows a readiness page. After TikTok returns `code` and `state` (or an authorization error), the page removes the query string and offers a button that delivers only allowlisted parameters to `http://localhost:8765/callback`.

The local OAuth client must be running before authorization begins, generate a fresh unpredictable state, compare the returned state against that original value, and exchange the code with TikTok using the registered **HTTPS** redirect URI. It must keep the client secret and access/refresh tokens private. This callback does not validate state on behalf of the local client and does not mean an account has been connected.

Use only `user.info.basic,video.upload`. Keep Direct Post disabled. No media upload or posting is performed by this route.

The route is standalone HTML with no site layout, analytics, external assets or third-party scripts. It sends no-store, no-referrer, noindex and a restrictive Content Security Policy. Hosting infrastructure may still retain request URLs under its normal logging policy; do not deliberately log callback query strings.

Tests: `cd next && npm test`; callback-only: `node --test next/src/lib/tiktok-callback.test.mjs` from the repository root.
