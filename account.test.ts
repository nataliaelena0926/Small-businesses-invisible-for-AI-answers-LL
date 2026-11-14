import { describe, expect, it } from "vitest";
import { accountDestination, premiumSimulation } from "./account";

describe("returning accounts", () => {
  it("returns an assessed account to its dashboard", () => {
    expect(accountDestination({ answers: { website: true }, plan: null })).toBe("/dashboard");
  });
  it("returns Premium accounts to their simulation even without an assessment", () => {
    expect(accountDestination({ answers: null, plan: "premium" })).toBe("/dashboard");
  });
});
describe("Premium simulation", () => {
  it("shows all nine criteria completed at 100 without changing real answers", () => {
    const answers = { website: true, maps: false };
    const result = premiumSimulation("premium", answers);
    expect(result?.score).toBe(100);
    expect(Object.values(result?.answers ?? {})).toEqual(Array(9).fill(true));
    expect(answers).toEqual({ website: true, maps: false });
    expect(result?.currentScore).toBe(12);
  });
  it("does not unlock the preview for Basic or Pro", () => {
    expect(premiumSimulation("basic", {})).toBeNull();
    expect(premiumSimulation("pro", {})).toBeNull();
    expect(premiumSimulation(null, {})).toBeNull();
  });
});