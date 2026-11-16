import PDFDocument from "pdfkit";
import { INVOICE_EMAIL, INVOICE_LOCATION, displayDate, lineCents, money, totalCents, type SavedInvoice } from "@/lib/invoices";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export async function renderInvoicePdf(invoice: SavedInvoice) {
  const doc = new PDFDocument({ size: "A4", margins: { top: 42, left: 42, right: 42, bottom: 44 },
    info: { Title: invoice.number, Author: SITE_NAME } });
  const output = new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const left = 42;
  const width = doc.page.width - 84;
  const right = left + width;
  const dark = "#111b18";
  const teal = "#087d80";
  const pale = "#dbefed";
  const titleWidth = width * 0.43;

  const line = (y: number) => doc.moveTo(left, y).lineTo(right, y).strokeColor(teal).lineWidth(0.8).stroke();
  const label = (value: string, x: number, y: number) => doc.font("Helvetica-Bold").fontSize(9).fillColor(teal).text(value, x, y);
  doc.rect(left, 42, width, 5).fill("#f6ca45");
  doc.lineWidth(1.7).rect(left, 63, 29, 26).stroke(teal);
  doc.font("Helvetica-Bold").fontSize(13).fillColor(dark).text("CT", left + 5, 70);
  doc.font("Helvetica-Bold").fontSize(16).fillColor(dark).text(SITE_NAME, left + 39, 63);
  doc.font("Helvetica").fontSize(9).text(INVOICE_EMAIL, left + 39, 84).text(INVOICE_LOCATION, left + 39, 98);
  const titleX = right - titleWidth;
  doc.font("Helvetica-Bold").fontSize(24).text("INVOICE", titleX, 63, { width: titleWidth, align: "right" });
  doc.font("Helvetica").fontSize(10).text(invoice.number, titleX, 93, { width: titleWidth, align: "right" });
  line(122);

  label("BILL TO", left, 140);
  label("ISSUED", left + 295, 140);
  label("DUE", left + 406, 140);
  doc.font("Helvetica").fontSize(10).fillColor(dark);
  doc.text(displayDate(invoice.issued), left + 295, 156);
  doc.text(displayDate(invoice.due), left + 406, 156);
  doc.text(invoice.client + (invoice.email ? "\n" + invoice.email : ""), left, 156, { width: 270 });

  const columns = [width - 207, 42, 79, 86];
  const positions = [left, left + columns[0], right - 165, right - 86];
  function tableHead(y: number) {
    doc.rect(left, y, width, 22).fill(pale);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(dark);
    ["DESCRIPTION", "QTY", "RATE", "AMOUNT"].forEach((text, index) => {
      doc.text(text, positions[index] + 6, y + 7, { width: columns[index] - 12, align: index ? "right" : "left" });
    });
    return y + 22;
  }
  let y = tableHead(Math.max(195, doc.y + 18));
  const bottom = () => doc.page.height - doc.page.margins.bottom;
  for (const item of invoice.items) {
    const descriptionWidth = columns[0] - 12;
    doc.font("Helvetica").fontSize(10);
    const height = Math.max(24, doc.heightOfString(item.description, { width: descriptionWidth }) + 13);
    if (y + height > bottom()) { doc.addPage(); y = tableHead(doc.page.margins.top); }
    doc.font("Helvetica").fontSize(10).fillColor(dark);
    const cells = [item.description, item.quantity, money(lineCents({ ...item, quantity: "1" })), money(lineCents(item))];
    cells.forEach((text, index) => doc.text(text, positions[index] + 6, y + 7, {
      width: columns[index] - 12, align: index ? "right" : "left",
    }));
    y += height;
    doc.moveTo(left, y).lineTo(right, y).strokeColor("#d5e2dc").lineWidth(0.5).stroke();
  }

  if (y + 67 > bottom()) { doc.addPage(); y = doc.page.margins.top; }
  const totalX = left + width * 0.39;
  doc.rect(totalX, y + 14, right - totalX, 33).fill(pale);
  doc.font("Helvetica-Bold").fontSize(14).fillColor(dark).text(
    (invoice.paid ? "Total paid" : "Total due") + "   " + invoice.currency + " " + money(totalCents(invoice)),
    totalX + 8, y + 24, { width: right - totalX - 16, align: "right" },
  );
  doc.y = y + 64;
  for (const [name, value] of [["NOTES", invoice.notes], ["PAYMENT INSTRUCTIONS", invoice.payment]]) {
    if (!value.trim()) continue;
    if (doc.y + 38 > bottom()) doc.addPage();
    label(name, left, doc.y);
    doc.moveDown(0.25).font("Helvetica").fontSize(10).fillColor(dark).text(value.trim(), left, doc.y, { width });
    doc.moveDown(1.1);
  }
  if (doc.y + 27 > bottom()) doc.addPage();
  line(doc.y + 6);
  doc.font("Helvetica").fontSize(9).fillColor(teal).text(new URL(SITE_URL).hostname, left, doc.y + 16);
  doc.end();
  return output;
}
