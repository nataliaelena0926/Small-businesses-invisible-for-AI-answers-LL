import { describe, expect, it } from "vitest";
import { isSignupPasswordValid, signupOutcome } from "./signup";

describe("immediate signup", () => {
  it("accepts a simple password without numbers, capitals, or symbols", () => {
    expect(isSignupPasswordValid("abcdef")).toBe(true);
  });
  it("retains the hosted minimum of six characters", () => {
    expect(isSignupPasswordValid("abcde")).toBe(false);
    expect(isSignupPasswordValid("123456")).toBe(true);
  });
  it("recognizes a returned session as immediate sign-in without confirmation", () => {
    expect(signupOutcome({ user: { id: "demo-user" } })).toBe("signed-in");
  });
  it("does not claim sign-in when signup returns no session", () => {
    expect(signupOutcome(null)).toBe("confirmation-required");
  });
});