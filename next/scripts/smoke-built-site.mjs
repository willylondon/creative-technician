/** Read-only HTTP checks against a local production build; no forms are sent. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const port = process.env.SMOKE_PORT || "3199";
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", port], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NODE_ENV: "production" },
});
let output = "";
server.stdout.on("data", (chunk) => { output += chunk; });
server.stderr.on("data", (chunk) => { output += chunk; });

try {
  const deadline = Date.now() + 30_000;
  let response;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Server stopped: ${output}`);
    try {
      response = await fetch(origin);
      if (response.ok) break;
    } catch { /* Wait for the server's listening socket. */ }
    await delay(150);
  }
  assert(response?.ok, `Local production server did not start: ${output}`);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.match(response.headers.get("content-security-policy"), /object-src 'none'/);
  assert.equal(response.headers.get("x-powered-by"), null);

  const pages = ["/", "/blog/builds", "/blog/life", "/privacy", "/terms", "/work/ai-reporting-engine", "/work/jps-ai-workshop"];
  const bodies = new Map();
  for (const path of pages) {
    const res = await fetch(origin + path);
    assert.equal(res.status, 200, `${path} should load`);
    const html = await res.text();
    bodies.set(path, html);
    const scriptSources = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((match) => match[1]);
    assert(!scriptSources.some((src) => /googletagmanager|analytics\.ahrefs|\/insights\//.test(src)), `${path} must not server-render analytics scripts before consent`);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${path} should have one H1`);
  }

  for (const path of ["/blog/builds", "/blog/life", "/privacy", "/terms"]) {
    const html = bodies.get(path);
    assert(html.includes(`property="og:url" content="https://www.thecreativetechnician.online${path}"`), `${path} Open Graph URL`);
    assert(html.includes(`rel="canonical" href="https://www.thecreativetechnician.online${path}"`), `${path} canonical URL`);
  }
  const home = bodies.get("/");
  for (const name of ["budget", "timeline"]) {
    const tag = home.match(new RegExp(`<select\\b[^>]*id="contact-${name}"[^>]*>`))?.[0];
    assert(tag && !/\brequired(?:=|\s|>)/.test(tag), `${name} must be optional`);
  }
  assert(home.includes('href="/work/ai-reporting-engine"'));
  assert(home.includes('href="/work/jps-ai-workshop"'));
  assert(!home.includes('href="https://www.youtube.com/@JamrockAI"'));
  const schema = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const business = schema["@graph"].find((item) => item["@type"] === "ProfessionalService");
  assert.equal(business.telephone, "+18768617153");
  assert.deepEqual(business.hasOfferCatalog.itemListElement.map((item) => item.priceSpecification.minPrice), [75000, 60000, 175000, 25000]);
  for (const path of ["/privacy", "/terms"]) {
    assert(!bodies.get(path).includes("18767978034"));
    assert(bodies.get(path).includes("https://wa.me/18768617153"));
  }
  assert(bodies.get("/work/ai-reporting-engine").includes("Implementation evidence"));
  assert((await (await fetch(origin + "/sitemap.xml")).text()).includes("/work/ai-reporting-engine"));
  assert.equal((await fetch(origin + "/this-page-does-not-exist")).status, 404);
  console.log(`Passed local HTTP smoke checks for ${pages.length} pages, headers, metadata, pricing schema, optional fields, sitemap and 404.`);
} finally {
  server.kill("SIGTERM");
}
