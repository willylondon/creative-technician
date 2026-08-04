"use server";

import {
  checkRateLimit,
  escapeHtml,
  getClientIp,
  isValidEmail,
} from "@/lib/security";

interface ContactResult {
  success: boolean;
  message: string;
}

const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 5000;
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;

const RECIPIENT_EMAIL = process.env.CONTACT_RECIPIENT_EMAIL || "willardwells@gmail.com";

export async function sendContactMessage(
  name: string,
  email: string,
  message: string
): Promise<ContactResult> {
  const trimmedName = name?.trim() ?? "";
  const trimmedEmail = email?.trim() ?? "";
  const trimmedMessage = message?.trim() ?? "";

  if (!trimmedName || !trimmedEmail || !trimmedMessage) {
    return { success: false, message: "Please fill in all fields." };
  }
  if (!isValidEmail(trimmedEmail)) {
    return { success: false, message: "Please enter a valid email address." };
  }
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return { success: false, message: "That name is too long." };
  }
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return { success: false, message: "That message is too long." };
  }

  const ip = await getClientIp();
  if (!checkRateLimit(`contact:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return {
      success: false,
      message: "Too many messages sent. Please try again later.",
    };
  }

  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    return { success: false, message: "Contact service is not configured." };
  }

  const safeName = escapeHtml(trimmedName);
  const safeEmail = escapeHtml(trimmedEmail);
  const safeMessage = escapeHtml(trimmedMessage);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: "The Creative Technician", email: RECIPIENT_EMAIL },
        to: [{ email: RECIPIENT_EMAIL, name: "Willy London" }],
        replyTo: { email: trimmedEmail, name: trimmedName },
        subject: `New inquiry from ${trimmedName} — The Creative Technician`,
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a0a0a; color: #ececec; border-radius: 12px;">
            <div style="margin-bottom: 24px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #00e5ff, #ffb020); border-radius: 8px; margin-bottom: 16px;"></div>
              <h2 style="margin: 0; font-size: 20px; color: #ffffff;">New Inquiry — The Creative Technician</h2>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px; width: 100px;">From</td>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 14px;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 14px;"><a href="mailto:${safeEmail}" style="color: #00e5ff;">${safeEmail}</a></td>
              </tr>
            </table>
            <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 16px; border: 1px solid rgba(255,255,255,0.08);">
              <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8;">Message</p>
              <p style="margin: 0; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${safeMessage}</p>
            </div>
            <p style="margin-top: 24px; font-size: 12px; color: #64748b;">Sent via thecreativetechnician.online contact form</p>
          </div>
        `,
      }),
    });

    if (response.ok) {
      return { success: true, message: "Message sent! I'll get back to you within 24 hours." };
    }

    console.error("Brevo transactional email failed", response.status);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  } catch (error) {
    console.error("Brevo transactional email threw", error);
    return { success: false, message: "Network error. Please try again later." };
  }
}
