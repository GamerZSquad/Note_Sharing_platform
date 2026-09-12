import { describe, expect, it } from "vitest";
import { evaluatePasswordStrength } from "@/lib/password-strength";

describe("evaluatePasswordStrength", () => {
  it("treats an empty password as weak with no bar fill", () => {
    expect(evaluatePasswordStrength("")).toEqual({
      score: 0,
      label: "Weak",
      percent: 0,
    });
  });

  it("scores a short simple password as weak or fair", () => {
    const result = evaluatePasswordStrength("abc");
    expect(result.score).toBeLessThanOrEqual(1);
    expect(["Weak", "Fair"]).toContain(result.label);
  });

  it("scores a strong mixed password highly", () => {
    const result = evaluatePasswordStrength("Tr0ub4dor&3_xY!");
    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(["Strong", "Very strong"]).toContain(result.label);
    expect(result.percent).toBeGreaterThan(50);
  });

  it("penalizes common passwords", () => {
    const common = evaluatePasswordStrength("password123");
    const unique = evaluatePasswordStrength("p@ssw0rd!Xk9");
    expect(common.score).toBeLessThan(unique.score);
  });

  it("never returns the password in the result object", () => {
    const sample = "SecretValue99!";
    const result = evaluatePasswordStrength(sample);
    expect(JSON.stringify(result)).not.toContain(sample);
  });
});
