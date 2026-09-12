"use client";

import { evaluatePasswordStrength } from "@/lib/password-strength";
import { cn } from "@/lib/utils";

const BAR_TONES = [
  "bg-terracotta",
  "bg-gold",
  "bg-forest/70",
  "bg-forest",
  "bg-forest-dark",
] as const;

type PasswordStrengthProps = {
  password: string;
  id?: string;
};

export function PasswordStrength({ password, id = "password-strength" }: PasswordStrengthProps) {
  if (!password) return null;

  const { score, label, percent } = evaluatePasswordStrength(password);

  return (
    <div className="space-y-1.5" id={id}>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-line"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={score}
        aria-valuetext={`Password strength: ${label}`}
        aria-label="Password strength"
      >
        <div
          className={cn("h-full rounded-full transition-all duration-200", BAR_TONES[score])}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-muted" role="status" aria-live="polite">
        Strength: <span className="font-medium text-ink">{label}</span>
      </p>
    </div>
  );
}
