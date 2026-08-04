"use server";

import { checkRateLimit, getClientIp, isValidEmail } from "@/lib/security";

interface SubscribeResult {
  success: boolean;
  message: string;
}

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_LIST_ID = 1;

function resolveListId(): number {
  const parsed = Number.parseInt(process.env.BREVO_LIST_ID ?? "", 10);
  return Number.isNaN(parsed) ? DEFAULT_LIST_ID : parsed;
}

export async function subscribeToNewsletter(email: string): Promise<SubscribeResult> {
  const trimmedEmail = email?.trim() ?? "";

  if (!isValidEmail(trimmedEmail)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  const ip = await getClientIp();
  if (!checkRateLimit(`newsletter:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return {
      success: false,
      message: "Too many attempts. Please try again later.",
    };
  }

  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    return { success: false, message: "Newsletter service is not configured." };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email: trimmedEmail,
        listIds: [resolveListId()],
        updateEnabled: true,
      }),
    });

    if (response.ok) {
      return { success: true, message: "Thanks for subscribing! Check your inbox." };
    }

    const error = await response.json().catch(() => null);

    // Brevo reports an existing contact as a duplicate; treat that as success.
    if (error?.code === "duplicate_parameter") {
      return { success: true, message: "You're already subscribed!" };
    }

    console.error("Brevo contact creation failed", response.status, error?.code);
    return { success: false, message: "Something went wrong. Please try again." };
  } catch (error) {
    console.error("Brevo contact creation threw", error);
    return { success: false, message: "Network error. Please try again later." };
  }
}
