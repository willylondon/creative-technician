import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const source = readFileSync(new URL('../app/tiktok/callback/route.ts', import.meta.url), 'utf8');
const { GET } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
function run(html, query) {
  const message = { textContent: 'ready' };
  let click;
  const button = { hidden: true, addEventListener: (_name, fn) => { click = fn; } };
  let destination, cleaned;
  vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], {
    URL, URLSearchParams,
    location: { search: query, pathname: '/tiktok/callback', replace: value => { destination = value; } },
    history: { replaceState: (_state, _title, path) => { cleaned = path; } },
    document: { getElementById: id => id === 'message' ? message : button },
  });
  return { message, button, cleaned, continue: () => { click?.(); return destination; } };
}
test('callback is standalone, uncacheable and protects authorization response', async () => {
  const response = GET();
  const html = await response.text();
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Referrer-Policy'), 'no-referrer');
  assert.match(response.headers.get('Cache-Control'), /no-store/);
  assert.ok(response.headers.get('Content-Security-Policy').includes(createHash('sha256').update(script).digest('base64')));
  assert.doesNotMatch(html, /<script[^>]+src=|<iframe|fetch\(/);
});
test('callback requires state, preserves encoded values and uses only fixed loopback target', async () => {
  const html = await GET().text();
  const result = run(html, '?code=a%26b%3Dc&state=expected&redirect_uri=https://evil.invalid');
  assert.equal(result.cleaned, '/tiktok/callback');
  assert.equal(result.button.hidden, false);
  const url = new URL(result.continue());
  assert.equal(url.origin, 'http://localhost:8765');
  assert.equal(url.pathname, '/callback');
  assert.equal(url.searchParams.get('code'), 'a&b=c');
  assert.equal(url.searchParams.get('state'), 'expected');
  assert.equal(url.searchParams.has('redirect_uri'), false);
  assert.equal(run(html, '?code=code').button.hidden, true);
  assert.equal(run(html, '').button.hidden, true);
});
test('denial returns only the error and state without reflecting untrusted descriptions', async () => {
  const result = run(await GET().text(), '?error=access_denied&state=expected&error_description=%3Cscript%3E&code=ignored');
  const url = new URL(result.continue());
  assert.equal(url.searchParams.get('error'), 'access_denied');
  assert.equal(url.searchParams.has('code'), false);
  assert.equal(url.searchParams.has('error_description'), false);
});
