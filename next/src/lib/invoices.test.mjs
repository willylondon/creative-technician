import assert from "node:assert/strict";
import test from "node:test";
import { emptyWorkspace, invoiceProblem, lineCents, newInvoice, readWorkspace, totalCents } from "./invoices.ts";

test("new invoices use the Jamaica calendar date, saved terms, and the next invoice number", () => {
  const workspace = emptyWorkspace();
  workspace.settings = { currency: "USD", terms: 14, payment: "Pay by bank transfer." };
  workspace.invoices.push({ ...newInvoice(workspace, new Date("2026-12-20T20:00:00Z")), number: "CT-2026-008" });
  const invoice = newInvoice(workspace, new Date("2027-01-01T02:00:00Z"));
  assert.equal(invoice.issued, "2026-12-31");
  assert.equal(invoice.due, "2027-01-14");
  assert.equal(invoice.number, "CT-2026-009");
  assert.equal(invoice.currency, "USD");
  assert.equal(invoice.payment, "Pay by bank transfer.");
});

test("totals sum individually rounded fractional quantities using cents", () => {
  const invoice = newInvoice(emptyWorkspace());
  invoice.items = [
    { description: "Diagnostics", quantity: "1.75", rate: "80.50" },
    { description: "Setup", quantity: "3", rate: "0.10" },
  ];
  assert.equal(lineCents(invoice.items[0]), 14088);
  assert.equal(totalCents(invoice), 14118);
});

test("official output cannot be saved with invalid dates, quantities, or rates", () => {
  const invoice = {
    ...newInvoice(emptyWorkspace()), client: "Test Client", issued: "2026-11-16", due: "2026-11-30",
    items: [{ description: "Network support", quantity: "1", rate: "2500" }],
  };
  assert.equal(invoiceProblem(invoice), null);
  assert.match(invoiceProblem({ ...invoice, due: "2026-02-30" }), /due date/);
  assert.match(invoiceProblem({ ...invoice, items: [{ ...invoice.items[0], rate: "1.001" }] }), /rate/);
  assert.match(invoiceProblem({ ...invoice, items: [{ ...invoice.items[0], quantity: "0" }] }), /quantity/);
});

test("backup restore accepts complete records and rejects duplicate numbers or invalid data", () => {
  const workspace = emptyWorkspace();
  const entry = {
    ...newInvoice(workspace), id: "local-1", paid: true, client: "Test Client",
    items: [{ description: "Network support", quantity: "1", rate: "2500" }],
  };
  const withInvoices = { ...workspace, invoices: [entry] };
  assert.deepEqual(readWorkspace(JSON.stringify(withInvoices)), withInvoices);
  assert.throws(() => readWorkspace(JSON.stringify({ ...workspace, version: 2 })), /valid/);
  assert.throws(() => readWorkspace(JSON.stringify({ ...workspace, invoices: [entry, { ...entry, id: "local-2", number: entry.number.toLowerCase() }] })), /valid/);
  assert.throws(() => readWorkspace(JSON.stringify({ ...workspace, invoices: [{ ...entry, items: [] }] })), /valid/);
});
