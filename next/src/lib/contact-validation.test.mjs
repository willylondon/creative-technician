import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { isLeadOption } from "./contact-validation.ts";
import * as offers from "./offers.ts";

const { budgetOptions, serviceOptions, timelineOptions } = offers;

test("budget and timeline can both be omitted or cleared", () => {
  for (const options of [budgetOptions, timelineOptions]) {
    assert.equal(isLeadOption(options, undefined, true), true);
    assert.equal(isLeadOption(options, "", true), true);
  }
});

test("provided budget and timeline still require a listed value", () => {
  for (const options of [budgetOptions, timelineOptions]) {
    for (const { id } of options) {
      assert.equal(isLeadOption(options, id, true), true);
    }
    assert.equal(isLeadOption(options, "made-up-value", true), false);
    assert.equal(isLeadOption(options, "<script>", true), false);
  }
});

test("a service is still required and must be a listed value", () => {
  assert.equal(isLeadOption(serviceOptions, undefined), false);
  assert.equal(isLeadOption(serviceOptions, ""), false);
  assert.equal(isLeadOption(serviceOptions, "made-up-value"), false);
  for (const { id } of serviceOptions) {
    assert.equal(isLeadOption(serviceOptions, id), true);
  }
});

// Execute the real server action with isolated environment, headers and fetch.
// No test enquiry can leave this process or reach a configured delivery service.
function loadServerAction() {
  const deliveries = [];
  function compile(relativePath, imports, globals = {}) {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    });
    const compiledModule = { exports: {} };
    runInNewContext(outputText, {
      module: compiledModule,
      exports: compiledModule.exports,
      require(id) {
        if (!(id in imports)) throw new Error(`Unexpected test import: ${id}`);
        return imports[id];
      },
      ...globals,
    }, { filename: relativePath });
    return compiledModule.exports;
  }
  const security = compile("./security.ts", {
    "next/headers": { headers: async () => new Map([["x-real-ip", "127.0.0.1"]]) },
  });
  const action = compile("../app/actions/contact.ts", {
    "@/lib/security": security,
    "@/lib/offers": offers,
    "@/lib/contact-validation": { isLeadOption },
  }, {
    process: { env: { RESEND_API_KEY: "local-test-only" } },
    console,
    fetch: async (url, request) => {
      assert.equal(url, "https://api.resend.com/emails");
      deliveries.push(JSON.parse(request.body));
      return { ok: true };
    },
  });
  return { ...action, deliveries };
}

const validLead = {
  name: "Test Enquiry",
  email: "lead@example.test",
  service: "website",
  message: "Local validation test",
};

test("the server action delivers enquiries with both optional fields absent or blank", async () => {
  for (const optionalFields of [{}, { budget: "", timeline: "" }, { budget: "  ", timeline: "  " }]) {
    const { sendContactMessage, deliveries } = loadServerAction();
    const result = await sendContactMessage({ ...validLead, ...optionalFields });
    assert.equal(result.success, true);
    assert.equal(deliveries.length, 2);
    assert.equal((deliveries[0].html.match(/Not provided/g) ?? []).length, 2);
  }
});

test("the server action accepts either optional field independently", async () => {
  for (const optionalFields of [{ budget: budgetOptions[0].id }, { timeline: timelineOptions[0].id }]) {
    const { sendContactMessage, deliveries } = loadServerAction();
    const result = await sendContactMessage({ ...validLead, ...optionalFields });
    assert.equal(result.success, true);
    assert.equal(deliveries.length, 2);
    assert.equal((deliveries[0].html.match(/Not provided/g) ?? []).length, 1);
  }
});

test("the server action rejects unknown budget or timeline values before delivery", async () => {
  for (const optionalFields of [{ budget: "invalid" }, { timeline: "invalid" }]) {
    const { sendContactMessage, deliveries } = loadServerAction();
    const result = await sendContactMessage({ ...validLead, ...optionalFields });
    assert.equal(result.success, false);
    assert.equal(deliveries.length, 0);
    assert.match(result.message, /listed (budget|timeline)/);
  }
});
