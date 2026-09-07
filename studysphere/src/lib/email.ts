type Mail = {
  to: string;
  subject: string;
  text: string;
};

export async function sendMail(mail: Mail): Promise<void> {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    console.info(`[email] SMTP configured but transport is not wired yet: ${mail.subject} -> ${mail.to}`);
    return;
  }
  console.info("\n--- StudySphere email (dev) ---");
  console.info(`To: ${mail.to}`);
  console.info(`Subject: ${mail.subject}`);
  console.info(mail.text);
  console.info("--- end email ---\n");
}

export function appUrl(path = ""): string {
  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}
