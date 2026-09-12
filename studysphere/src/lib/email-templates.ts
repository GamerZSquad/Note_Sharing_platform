const SITE_URL = "https://studysphere.space";
const LOGO_URL = "https://studysphere.space/studysphere-logo.png";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function emailShell(options: {
  preheader: string;
  heading: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaUrl: string;
  expiryNote: string;
  ignoreNote: string;
}): string {
  const safeHeading = escapeHtml(options.heading);
  const safeCta = escapeHtml(options.ctaLabel);
  const safeUrl = escapeHtml(options.ctaUrl);
  const safeExpiry = escapeHtml(options.expiryNote);
  const safeIgnore = escapeHtml(options.ignoreNote);
  const safePreheader = escapeHtml(options.preheader);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${safeHeading}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3ebe0;color:#1c1915;font-family:Georgia,'Times New Roman',serif;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3ebe0;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#fffaf2;border:1px solid #e4d9c8;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 12px 28px;text-align:center;border-bottom:1px solid #e4d9c8;background-color:#fffaf2;">
              <a href="${SITE_URL}" style="text-decoration:none;">
                <img src="${LOGO_URL}" alt="StudySphere" width="160" style="display:inline-block;max-width:160px;height:auto;border:0;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 8px 28px;">
              <h1 style="margin:0 0 16px 0;font-size:26px;line-height:1.25;font-weight:400;color:#1c1915;">${safeHeading}</h1>
              ${options.bodyHtml}
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 20px 0;">
                <tr>
                  <td align="center" style="border-radius:999px;background-color:#1b5e46;">
                    <a href="${safeUrl}" style="display:inline-block;padding:14px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">
                      ${safeCta}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;line-height:1.5;color:#6b6358;">
                ${safeExpiry}
              </p>
              <p style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;line-height:1.5;color:#6b6358;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;line-height:1.5;word-break:break-all;">
                <a href="${safeUrl}" style="color:#1b5e46;">${safeUrl}</a>
              </p>
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;line-height:1.5;color:#6b6358;">
                ${safeIgnore}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px 28px;border-top:1px solid #e4d9c8;">
              <p style="margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;line-height:1.5;color:#6b6358;">
                <a href="${SITE_URL}" style="color:#1b5e46;text-decoration:none;">${SITE_URL.replace("https://", "")}</a>
              </p>
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;line-height:1.5;color:#6b6358;">
                &copy; StudySphere
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildVerificationEmail(options: {
  name: string;
  verifyUrl: string;
}): { subject: string; text: string; html: string } {
  const name = options.name.trim() || "there";
  const subject = "Verify your StudySphere email";
  const text = [
    `Hi ${name},`,
    "",
    "Welcome to StudySphere! Please verify your email address to activate your account.",
    "",
    `Verify Email: ${options.verifyUrl}`,
    "",
    "This verification link expires in 24 hours.",
    "",
    "If you didn't create a StudySphere account, you can safely ignore this email.",
    "",
    SITE_URL,
    "© StudySphere",
  ].join("\n");

  const html = emailShell({
    preheader: "Verify your email to activate your StudySphere account.",
    heading: "Verify your StudySphere email",
    bodyHtml: `
      <p style="margin:0 0 12px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#1c1915;">
        Hi ${escapeHtml(name)},
      </p>
      <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#1c1915;">
        Welcome to StudySphere! Please verify your email address to activate your account.
      </p>
    `,
    ctaLabel: "Verify Email",
    ctaUrl: options.verifyUrl,
    expiryNote: "This verification link expires in 24 hours.",
    ignoreNote: "If you didn't create a StudySphere account, you can safely ignore this email.",
  });

  return { subject, text, html };
}

export function buildPasswordResetEmail(options: {
  resetUrl: string;
}): { subject: string; text: string; html: string } {
  const subject = "Reset your StudySphere password";
  const text = [
    "We received a request to reset your StudySphere password.",
    "",
    `Reset Password: ${options.resetUrl}`,
    "",
    "This password reset link expires in 1 hour.",
    "",
    "If you didn't request a password reset, you can safely ignore this email.",
    "",
    SITE_URL,
    "© StudySphere",
  ].join("\n");

  const html = emailShell({
    preheader: "Reset your StudySphere password. This link expires in 1 hour.",
    heading: "Reset your StudySphere password",
    bodyHtml: `
      <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#1c1915;">
        We received a request to reset your StudySphere password. Use the button below to choose a new password.
      </p>
    `,
    ctaLabel: "Reset Password",
    ctaUrl: options.resetUrl,
    expiryNote: "This password reset link expires in 1 hour.",
    ignoreNote: "If you didn't request a password reset, you can safely ignore this email.",
  });

  return { subject, text, html };
}
