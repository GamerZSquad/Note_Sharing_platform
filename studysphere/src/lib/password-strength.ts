export const PASSWORD_STRENGTH_LABELS = [
  "Weak",
  "Fair",
  "Good",
  "Strong",
  "Very strong",
] as const;

export type PasswordStrengthLabel = (typeof PASSWORD_STRENGTH_LABELS)[number];

export type PasswordStrengthResult = {
  /** 0–4, corresponding to Weak → Very strong */
  score: 0 | 1 | 2 | 3 | 4;
  label: PasswordStrengthLabel;
  /** 0–100 for the progress bar width */
  percent: number;
};

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "12345678",
  "123456789",
  "qwerty123",
  "abcdefgh",
  "letmein1",
  "welcome1",
  "admin123",
  "iloveyou",
  "monkey12",
]);

function hasSequentialRun(value: string): boolean {
  const lower = value.toLowerCase();
  for (let i = 0; i < lower.length - 2; i += 1) {
    const a = lower.charCodeAt(i);
    const b = lower.charCodeAt(i + 1);
    const c = lower.charCodeAt(i + 2);
    if (b === a + 1 && c === a + 2) return true;
    if (b === a - 1 && c === a - 2) return true;
  }
  return false;
}

function hasRepeatedRun(value: string): boolean {
  return /(.)\1{2,}/.test(value);
}

/**
 * Client-side UX hint only. Server zod rules remain the source of truth.
 * Never log or transmit the password from this helper.
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { score: 0, label: "Weak", percent: 0 };
  }

  let points = 0;
  if (password.length >= 8) points += 1;
  if (password.length >= 12) points += 1;
  if (password.length >= 16) points += 1;
  if (/[a-z]/.test(password)) points += 1;
  if (/[A-Z]/.test(password)) points += 1;
  if (/[0-9]/.test(password)) points += 1;
  if (/[^A-Za-z0-9]/.test(password)) points += 1;

  const normalized = password.toLowerCase();
  if (COMMON_PASSWORDS.has(normalized) || hasSequentialRun(password) || hasRepeatedRun(password)) {
    points = Math.max(0, points - 2);
  }

  let score: 0 | 1 | 2 | 3 | 4;
  if (points <= 2) score = 0;
  else if (points === 3) score = 1;
  else if (points === 4) score = 2;
  else if (points === 5) score = 3;
  else score = 4;

  return {
    score,
    label: PASSWORD_STRENGTH_LABELS[score],
    percent: password.length === 0 ? 0 : ((score + 1) / 5) * 100,
  };
}
