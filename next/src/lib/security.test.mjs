import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

/** Loads security.ts in isolation with a controllable environment and fetch. */
function loadSecurity({ env = {}, fetch } = {}) {
  const source = readFileSync(new URL("./security.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const compiledModule = { exports: {} };
  const imports = { "next/headers": { headers: async () => new Map() }, "node:crypto": crypto };
  runInNewContext(outputText, {
    module: compiledModule,
    exports: compiledModule.exports,
    require: (id) => imports[id],
    process: { env },
    console: { error() {} },
    AbortSignal,
    fetch,
  });
  return compiledModule.exports;
}

const upstashEnv = {
  UPSTASH_REDIS_REST_URL: "https://redis.example.test/",
  UPSTASH_REDIS_REST_TOKEN: "local-test-only",
};

test("without Upstash the shared limiter uses the per-instance window", async () => {
  const { checkSharedRateLimit } = loadSecurity({
    fetch: async () => assert.fail("no network call expected"),
  });
  assert.equal(await checkSharedRateLimit("k", 2, 60_000), true);
  assert.equal(await checkSharedRateLimit("k", 2, 60_000), true);
  assert.equal(await checkSharedRateLimit("k", 2, 60_000), false);
  assert.equal(await checkSharedRateLimit("other", 2, 60_000), true);
});

test("with Upstash the shared counter decides, in one authenticated pipeline call", async () => {
  const calls = [];
  let counter = 0;
  const { checkSharedRateLimit } = loadSecurity({
    env: upstashEnv,
    fetch: async (url, request) => {
      calls.push({ url, request });
      counter += 1;
      return { ok: true, json: async () => [{ result: counter === 1 ? "OK" : null }, { result: counter }] };
    },
  });
  assert.equal(await checkSharedRateLimit("contact:1.2.3.4", 2, 60_000), true);
  assert.equal(await checkSharedRateLimit("contact:1.2.3.4", 2, 60_000), true);
  assert.equal(await checkSharedRateLimit("contact:1.2.3.4", 2, 60_000), false);
  assert.equal(calls[0].url, "https://redis.example.test/pipeline");
  assert.equal(calls[0].request.headers.authorization, "Bearer local-test-only");
  assert.deepEqual(JSON.parse(calls[0].request.body), [
    ["SET", "ratelimit:contact:1.2.3.4", 0, "PX", 60_000, "NX"],
    ["INCR", "ratelimit:contact:1.2.3.4"],
  ]);
});

test("an Upstash outage falls back to the per-instance limiter instead of blocking visitors", async () => {
  for (const fetch of [
    async () => { throw new Error("unreachable"); },
    async () => ({ ok: false, status: 500 }),
    async () => ({ ok: true, json: async () => [{ error: "ERR" }, { error: "ERR" }] }),
  ]) {
    const { checkSharedRateLimit } = loadSecurity({ env: upstashEnv, fetch });
    assert.equal(await checkSharedRateLimit("k", 1, 60_000), true);
    assert.equal(await checkSharedRateLimit("k", 1, 60_000), false);
  }
});

test("hashKey is stable across case and whitespace and never contains the address", () => {
  const { hashKey } = loadSecurity();
  assert.equal(hashKey(" Lead@Example.test "), hashKey("lead@example.test"));
  assert.notEqual(hashKey("lead@example.test"), hashKey("other@example.test"));
  assert.match(hashKey("lead@example.test"), /^[0-9a-f]{32}$/);
});
