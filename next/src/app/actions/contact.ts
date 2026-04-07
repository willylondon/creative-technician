"use server";

interface ContactResult {
  success: boolean;
  message: string;
}

export async function sendContactMessage(
  name: string,
  email: string,
  message: string
): Promise<ContactResult> {
  if (!name || !email || !message) {
    return { success: false, message: "Please fill in all fields." };
  }
  if (!email.includes("@")) {
    return { success: false, message: "Please enter a valid email address." };
  }

  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    return { success: false, message: "Contact service is not configured." };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: "The Creative Technician", email: "willardwells@gmail.com" },
        to: [{ email: "willardwells@gmail.com", name: "Willy London" }],
        replyTo: { email: email, name: name },
        subject: `New inquiry from ${name} — The Creative Technician`,
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a0a0a; color: #ececec; border-radius: 12px;">
            <div style="margin-bottom: 24px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #00e5ff, #ffb020); border-radius: 8px; margin-bottom: 16px;"></div>
              <h2 style="margin: 0; font-size: 20px; color: #ffffff;">New Inquiry — The Creative Technician</h2>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px; width: 100px;">From</td>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 14px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-size: 13px;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 14px;"><a href="mailto:${email}" style="color: #00e5ff;">${email}</a></td>
              </tr>
            </table>
            <div style="background: rgba(255,255,255,0.04); border-radius: 8px; padding: 16px; border: 1px solid rgba(255,255,255,0.08);">
              <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8;">Message</p>
              <p style="margin: 0; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="margin-top: 24px; font-size: 12px; color: #64748b;">Sent via thecreativetechnician.online contact form</p>
          </div>
        `,
      }),
    });

    if (response.ok) {
      return { success: true, message: "Message sent! I'll get back to you within 24 hours." };
    }

    const error = await response.json();
    return {
      success: false,
      message: error.message || "Something went wrong. Please try again.",
    };
  } catch {
    return { success: false, message: "Network error. Please try again later." };
  }
}
