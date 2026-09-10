type Mail = {
  to: string;
  subject: string;
  text: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 10_000;

/**
 * Email delivery via Resend.
 *
 * Requires RESEND_API_KEY and EMAIL_FROM. When they are absent (local dev),
 * nothing is sent and the register / forgot-password routes keep returning the
 * link in the response for non-production instead.
 *
 * Message bodies contain verification and reset tokens, so nothing here logs
 * the body, the link, or the recipient.
 */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/** Resolves to false when the message could not be handed to the provider. */
export async function sendMail(mail: Mail): Promise<boolean> {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        `[email] RESEND_API_KEY / EMAIL_FROM are not set; cannot deliver "${mail.subject}"`,
      );
    } else {
      console.info(`[email] provider not configured, skipped "${mail.subject}"`);
    }
    return false;
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
      }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(
        `[email] provider rejected "${mail.subject}" with status ${response.status}`,
      );
      return false;
    }

    return true;
  } catch {
    console.error(`[email] delivery failed for "${mail.subject}"`);
    return false;
  }
}

export function appUrl(path = ""): string {
  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}
