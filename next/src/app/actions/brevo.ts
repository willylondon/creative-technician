"use server";

interface SubscribeResult {
  success: boolean;
  message: string;
}

export async function subscribeToNewsletter(email: string): Promise<SubscribeResult> {
  if (!email || !email.includes("@")) {
    return { success: false, message: "Please enter a valid email address." };
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
        email: email,
        listIds: [parseInt(process.env.BREVO_LIST_ID || "1")],
        updateEnabled: true,
      }),
    });

    if (response.ok) {
      return { success: true, message: "Thanks for subscribing! Check your inbox." };
    }

    const error = await response.json();
    
    // Handle duplicate email gracefully
    if (error.code === "duplicate_parameter") {
      return { success: true, message: "You're already subscribed!" };
    }

    return { success: false, message: error.message || "Something went wrong. Please try again." };
  } catch (error) {
    return { success: false, message: "Network error. Please try again later." };
  }
}
