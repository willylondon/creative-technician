import assert from "node:assert/strict";
import test from "node:test";
import config from "./next.config.ts";

test("security headers cover pages and static files without revealing Next.js", async () => {
  assert.equal(config.poweredByHeader, false);
  const rules = await config.headers();
  const globalRule = rules.find((rule) => rule.source === "/:path*");
  assert.ok(globalRule, "Headers must apply to every route, including public/admin");
  const headers = Object.fromEntries(globalRule.headers.map(({ key, value }) => [key.toLowerCase(), value]));
  assert.equal(headers["x-content-type-options"], "nosniff");
  assert.equal(headers["referrer-policy"], "strict-origin-when-cross-origin");
  assert.equal(headers["x-frame-options"], "SAMEORIGIN");
  const directives = new Map(headers["content-security-policy"].split(";").map((directive) => {
    const [name, ...values] = directive.trim().split(/\s+/);
    return [name, values.join(" ")];
  }));
  assert.equal(directives.get("object-src"), "'none'");
  assert.equal(directives.get("base-uri"), "'self'");
  assert.equal(directives.get("frame-ancestors"), "'self'");
});

test("legacy legal URLs retain permanent redirects to their canonical pages", async () => {
  const redirects = await config.redirects();
  for (const [source, destination] of [["/privacy-policy", "/privacy"], ["/terms-of-service", "/terms"]]) {
    assert.deepEqual(redirects.find((rule) => rule.source === source), { source, destination, permanent: true });
  }
});
