import { displayDate, INVOICE_EMAIL, money, totalCents, type SavedInvoice } from "@/lib/invoices";
import { escapeHtml } from "@/lib/security";
import { SITE_NAME } from "@/lib/site";

export function invoiceEmailMessage(invoice: SavedInvoice) {
  const heading = "Invoice " + invoice.number;
  const amount = invoice.currency + " " + money(totalCents(invoice));
  const amountLabel = invoice.paid ? "Total paid" : "Amount due";
  const dueDate = invoice.paid ? "" : displayDate(invoice.due);
  const greeting = "Hi " + invoice.client + ",";
  const introduction = invoice.paid
    ? "Thank you for your payment. Your paid invoice is attached for your records."
    : "Your invoice is attached as a PDF. You’ll find the service and payment details inside.";

  const text = [
    greeting,
    introduction,
    heading + "\n" + amountLabel + ": " + amount + (dueDate ? "\nDue date: " + dueDate : ""),
    "If you have any questions, please reply to this email.",
    SITE_NAME,
  ].join("\n\n");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f3;color:#111b18;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f1f5f3;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <!--[if mso]><table role="presentation" width="560" align="center" cellspacing="0" cellpadding="0"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border:1px solid #d6e1dc;border-top:5px solid #f6ca45;">
          <tr>
            <td style="background-color:#0a0f0e;padding:24px;color:#72e8ef;font-size:17px;line-height:24px;font-weight:bold;">
              ${escapeHtml(SITE_NAME)}
            </td>
          </tr>
          <tr>
            <td style="padding:26px 24px;">
              <h1 style="margin:0 0 18px;color:#111b18;font-size:26px;line-height:32px;">${escapeHtml(heading)}</h1>
              <p style="margin:0 0 10px;color:#111b18;font-size:16px;line-height:24px;">${escapeHtml(greeting)}</p>
              <p style="margin:0 0 22px;color:#111b18;font-size:16px;line-height:24px;">${escapeHtml(introduction)}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#e6f4f1;border-left:4px solid #087d80;">
                <tr>
                  <td style="padding:14px 17px;color:#111b18;font-size:15px;line-height:24px;">
                    ${amountLabel}<br>
                    <strong style="font-size:22px;line-height:30px;">${escapeHtml(amount)}</strong>
                    ${dueDate ? `<br>Due date: ${escapeHtml(dueDate)}` : ""}
                  </td>
                </tr>
              </table>
              <p style="margin:22px 0 0;color:#111b18;font-size:15px;line-height:23px;">If you have any questions, please reply to this email.</p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #d6e1dc;padding:17px 24px;color:#324740;font-size:13px;line-height:19px;overflow-wrap:anywhere;">
              <a href="mailto:${INVOICE_EMAIL}" style="color:#075c5f;text-decoration:underline;">${INVOICE_EMAIL}</a>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: heading + " from " + SITE_NAME, text, html };
}
