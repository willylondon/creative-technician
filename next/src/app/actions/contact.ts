"use server";

import {
  checkRateLimit,
  escapeHtml,
  getClientIp,
  isValidEmail,
} from "@/lib/security";
import {
  BOOKING_URL,
  CONTACT_EMAIL,
  WHATSAPP_URL,
  budgetOptions,
  labelFor,
  serviceOptions,
  timelineOptions,
} from "@/lib/offers";

export interface LeadInput {
  name: string;
  organization?: string;
  email: string;
  phone?: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
  /** Honeypot: real visitors never see or fill this field. */
  website?: string;
  /** Where the lead came from (UTM params / referrer), captured client-side. */
  source?: string;
}

interface ContactResult {
  success: boolean;
  message: string;
  /** True when no delivery channel is configured, so the visitor should email directly. */
  fallback?: boolean;
}

const MAX_NAME_LENGTH = 100;
const MAX_FIELD_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;

const RECIPIENT_EMAIL = process.env.CONTACT_RECIPIENT_EMAIL || CONTACT_EMAIL;

/**
 * Email provider: Resend when RESEND_API_KEY is set (sends from the verified
 * thecreativetechnician.online domain), otherwise Brevo (which can only send
 * from the Gmail address verified on that account).
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL =
  process.env.CONTACT_SENDER_EMAIL ||
  (RESEND_API_KEY ? "hello@thecreativetechnician.online" : "thecreativetechshop@gmail.com");

const PHONE_PATTERN = /^[+()\-.\s\d]{7,25}$/;

function clip(value: string | undefined, max: number): string {
  return (value ?? "").trim().slice(0, max);
}

function isOption(options: { id: string }[], id: string): boolean {
  return options.some((option) => option.id === id);
}

interface OutgoingEmail {
  fromName: string;
  to: { email: string; name: string };
  replyTo: { email: string; name: string };
  subject: string;
  html: string;
  /** Tag for Resend analytics (letters, numbers, - and _ only). */
  tag: string;
}

async function sendEmail(email: OutgoingEmail): Promise<boolean> {
  if (RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: `${email.fromName} <${SENDER_EMAIL}>`,
        to: [email.to.email],
        reply_to: email.replyTo.email,
        subject: email.subject,
        html: email.html,
        tags: [{ name: "type", value: email.tag }],
      }),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      console.error("Resend email failed", response.status, JSON.stringify(detail));
    }
    return response.ok;
  }

  if (BREVO_API_KEY) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: email.fromName, email: SENDER_EMAIL },
        to: [email.to],
        replyTo: email.replyTo,
        subject: email.subject,
        htmlContent: email.html,
      }),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      console.error("Brevo email failed", response.status, JSON.stringify(detail));
    }
    return response.ok;
  }

  return false;
}

/**
 * Saves the lead as a contact: in the Resend "Website leads" segment when
 * configured, otherwise on a Brevo leads list. Best-effort — the notification
 * email and webhook are what count as delivery.
 */
async function saveLeadContact(email: string, name: string): Promise<boolean> {
  const [firstName, ...rest] = name.split(/\s+/);
  const segmentId = process.env.RESEND_LEADS_SEGMENT_ID;

  if (RESEND_API_KEY && segmentId) {
    const response = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        authorization: `Bearer ${RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: rest.join(" ") || undefined,
        // Leads did not opt in to marketing, so keep them out of broadcasts.
        unsubscribed: true,
        segments: [{ id: segmentId }],
      }),
    });
    if (!response.ok) {
      console.error("Resend lead contact failed", response.status);
    }
    return response.ok;
  }

  const listId = Number.parseInt(process.env.BREVO_LEADS_LIST_ID ?? "", 10);
  if (BREVO_API_KEY && !Number.isNaN(listId)) {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        attributes: { FIRSTNAME: firstName },
        listIds: [listId],
        updateEnabled: true,
      }),
    });
    if (!response.ok) {
      console.error("Brevo lead contact failed", response.status);
    }
    return response.ok;
  }

  return false;
}

/** Forwards the full lead to an n8n / Zapier webhook (e.g. to append a Google Sheet row). */
async function postLeadWebhook(lead: Record<string, string>): Promise<boolean> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return false;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env.LEAD_WEBHOOK_SECRET
        ? { "x-webhook-secret": process.env.LEAD_WEBHOOK_SECRET }
        : {}),
    },
    body: JSON.stringify(lead),
  });
  if (!response.ok) {
    console.error("Lead webhook failed", response.status);
  }
  return response.ok;
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px; width: 120px; vertical-align: top;">${label}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 14px;">${value}</td>
    </tr>`;
}

export async function sendContactMessage(input: LeadInput): Promise<ContactResult> {
  // Bots fill every field they find. Pretend it worked so they move on.
  if (input?.website?.trim()) {
    return { success: true, message: "Message sent! I'll get back to you within one business day." };
  }

  const name = clip(input?.name, MAX_NAME_LENGTH + 1);
  const organization = clip(input?.organization, MAX_FIELD_LENGTH);
  const email = clip(input?.email, 255);
  const phone = clip(input?.phone, 30);
  const service = clip(input?.service, 40);
  const budget = clip(input?.budget, 40);
  const timeline = clip(input?.timeline, 40);
  const message = clip(input?.message, MAX_MESSAGE_LENGTH + 1);
  const source = clip(input?.source, MAX_FIELD_LENGTH);

  if (!name || !email || !message) {
    return { success: false, message: "Please add your name, email and a few words about the project." };
  }
  if (!isValidEmail(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { success: false, message: "That name is too long." };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { success: false, message: "That message is too long." };
  }
  if (phone && !PHONE_PATTERN.test(phone)) {
    return { success: false, message: "Please check the phone / WhatsApp number." };
  }
  if (!isOption(serviceOptions, service)) {
    return { success: false, message: "Please choose what you need help with." };
  }
  if (!isOption(budgetOptions, budget) || !isOption(timelineOptions, timeline)) {
    return { success: false, message: "Please choose a budget and timeline." };
  }

  const ip = await getClientIp();
  if (!checkRateLimit(`contact:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return {
      success: false,
      message: "Too many messages sent. Please try again later.",
    };
  }

  const canEmail = Boolean(RESEND_API_KEY || BREVO_API_KEY);
  if (!canEmail && !process.env.LEAD_WEBHOOK_URL) {
    console.error("Contact form has no delivery channel: set RESEND_API_KEY, BREVO_API_KEY or LEAD_WEBHOOK_URL");
    return {
      success: false,
      fallback: true,
      message: "The form is temporarily unavailable — please email or WhatsApp me directly.",
    };
  }

  const serviceLabel = labelFor(serviceOptions, service);
  const budgetLabel = labelFor(budgetOptions, budget);
  const timelineLabel = labelFor(timelineOptions, timeline);

  const lead = {
    receivedAt: new Date().toISOString(),
    name,
    organization,
    email,
    phone,
    service: serviceLabel,
    budget: budgetLabel,
    timeline: timelineLabel,
    message,
    source,
  };

  const notifyHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a0a0a; color: #ececec; border-radius: 12px;">
      <h2 style="margin: 0 0 20px; font-size: 20px; color: #ffffff;">New lead — ${escapeHtml(serviceLabel)}</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        ${row("From", escapeHtml(name))}
        ${organization ? row("Organisation", escapeHtml(organization)) : ""}
        ${row("Email", `<a href="mailto:${escapeHtml(email)}" style="color: #00e5ff;">${escapeHtml(email)}</a>`)}
        ${phone ? row("Phone / WhatsApp", escapeHtml(phone)) : ""}
        ${row("Service", escapeHtml(serviceLabel))}
        ${row("Budget", escapeHtml(budgetLabel))}
        ${row("Timeline", escapeHtml(timelineLabel))}
        ${source ? row("Source", escapeHtml(source)) : ""}
      </table>
      <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 16px; border: 1px solid rgba(255,255,255,0.08);">
        <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8;">Message</p>
        <p style="margin: 0; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>
      <p style="margin-top: 24px; font-size: 12px; color: #64748b;">Sent via thecreativetechnician.online contact form</p>
    </div>`;

  const firstName = escapeHtml(name.split(/\s+/)[0]);
  const autoReplyHtml = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a; line-height: 1.6;">
      <p>Hi ${firstName},</p>
      <p>Thanks for getting in touch about <strong>${escapeHtml(serviceLabel.toLowerCase())}</strong>. I’ve got your message and will reply personally within one business day.</p>
      <p><strong>What happens next</strong></p>
      <ol>
        <li>I review what you’ve sent and note any questions.</li>
        <li>We have a short call to understand the goal, constraints and timeline.</li>
        <li>You get a clear written proposal with scope, price and dates — no obligation.</li>
      </ol>
      <p>If it’s urgent, you can reach me on <a href="${WHATSAPP_URL}">WhatsApp</a>${
        BOOKING_URL ? ` or <a href="${BOOKING_URL}">book a call directly</a>` : ""
      }.</p>
      <p>— Willard Wells<br/>The Creative Technician · Kingston, Jamaica</p>
    </div>`;

  const [webhookResult, notifyResult] = await Promise.allSettled([
    postLeadWebhook(lead),
    sendEmail({
      fromName: "The Creative Technician",
      to: { email: RECIPIENT_EMAIL, name: "Willard Wells" },
      replyTo: { email, name },
      subject: `New lead: ${serviceLabel} — ${name}${organization ? ` (${organization})` : ""}`,
      html: notifyHtml,
      tag: "lead_notification",
    }),
    saveLeadContact(email, name),
  ]);
  const delivered =
    (webhookResult.status === "fulfilled" && webhookResult.value) ||
    (notifyResult.status === "fulfilled" && notifyResult.value);

  if (!delivered) {
    return {
      success: false,
      fallback: true,
      message: "Something went wrong sending your message — please email or WhatsApp me directly.",
    };
  }

  // Only confirm to the visitor once the lead is safely captured.
  let confirmed = false;
  if (canEmail) {
    confirmed = await sendEmail({
      fromName: "Willard Wells — The Creative Technician",
      to: { email, name },
      replyTo: { email: RECIPIENT_EMAIL, name: "Willard Wells" },
      subject: "Thanks — I’ve got your message",
      html: autoReplyHtml,
      tag: "lead_auto_reply",
    }).catch((error) => {
      console.error("Auto-reply threw", error);
      return false;
    });
  }

  return {
    success: true,
    message: confirmed
      ? "Message sent! Check your inbox for a confirmation — I’ll reply within one business day."
      : "Message sent! I’ll reply within one business day.",
  };
}
