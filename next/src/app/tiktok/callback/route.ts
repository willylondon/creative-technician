import { createHash } from "node:crypto";

// Standalone HTML deliberately bypasses the site layout and all analytics.
// The local OAuth client must validate state and exchange the code using the
// registered HTTPS redirect URI, not the loopback delivery address.
const script = `(() => {
  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');
  history.replaceState(null, '', location.pathname);
  const message = document.getElementById('message');
  const button = document.getElementById('continue');
  if (!code && !error) return;
  if (!state || state.length > 4096 || (code && code.length > 8192) || (error && error.length > 256)) {
    message.textContent = 'The authorization response is incomplete. Restart the connection from your local setup.';
    return;
  }
  const target = new URL('http://localhost:8765/callback');
  target.searchParams.set('state', state);
  if (error) {
    target.searchParams.set('error', error);
    message.textContent = 'TikTok authorization was not completed. Return to your local setup to finish or try again.';
  } else {
    target.searchParams.set('code', code);
    const scopes = params.get('scopes');
    if (scopes && scopes.length <= 2048) target.searchParams.set('scopes', scopes);
    message.textContent = 'TikTok has returned an authorization response. Keep your local setup running on this computer, then continue there to complete the connection.';
  }
  button.hidden = false;
  button.addEventListener('click', () => location.replace(target.href), {once:true});
})();`;
const scriptHash = createHash("sha256").update(script).digest("base64");

export function GET() {
  return new Response(`<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer"><meta name="robots" content="noindex,nofollow">
<title>Jamaican Proverb Daily — TikTok connection</title>
<style>body{font:18px/1.6 system-ui,sans-serif;background:#10251c;color:#f7f7ee;margin:0;padding:10vh 24px}main{max-width:620px;margin:auto;border-top:6px solid #edc338;padding-top:24px}h1{line-height:1.2}button{background:#edc338;border:0;border-radius:8px;padding:14px 20px;font:inherit;font-weight:650;cursor:pointer}small{display:block;margin-top:24px;color:#c4d5ca}</style>
</head><body><main><p>THE CREATIVE TECHNICIAN · @jamrockai</p><h1>Jamaican Proverb Daily</h1>
<p id="message">The HTTPS callback is ready. Start the TikTok connection from your local setup on this computer.</p>
<button id="continue" hidden>Continue on this computer</button>
<small>This page completes no uploads or posts. The local setup must verify the response before connecting your account.</small>
<noscript>Enable JavaScript to return the authorization response to your local setup.</noscript>
</main><script>${script}</script></body></html>`, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Content-Security-Policy": `default-src 'none'; script-src 'sha256-${scriptHash}'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
    },
  });
}
