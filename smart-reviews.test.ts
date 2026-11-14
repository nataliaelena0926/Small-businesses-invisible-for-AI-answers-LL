import { describe, expect, it } from "vitest";
import { sampleReviews, demoReply, validateReply } from "./smart-reviews";
import { GOOGLE_BUSINESS_SCOPE, ownsLocation, validOAuthRequest } from "./google-business";
describe("Smart Review Manager safeguards", () => {
  it("requests Google's official business management permission", () => {
    expect(GOOGLE_BUSINESS_SCOPE).toBe("https://www.googleapis.com/auth/business.manage");
  });
  it("rejects a location outside the authorized owner's list", () => {
    expect(ownsLocation([{ name: "locations/123" }], "locations/456")).toBe(false);
  });
  it("rejects another user's or expired authorization request", () => {
    expect(validOAuthRequest({ user_id: "a", expires_at: "2026-11-14T18:00:00Z" }, "b", Date.parse("2026-11-14T17:00:00Z"))).toBe(false);
    expect(validOAuthRequest({ user_id: "a", expires_at: "2026-11-14T17:00:00Z" }, "a", Date.parse("2026-11-14T17:00:00Z"))).toBe(false);
  });
  it("never posts a reply without explicit approval", () => {
    expect(() => validateReply("Thanks for visiting.", false)).toThrow();
    expect(validateReply(" Thanks for visiting. ", true)).toBe("Thanks for visiting.");
  });
  it("retains already replied Google-format sample reviews", () => {
    expect(sampleReviews.filter((review) => !review.reply)).toHaveLength(2);
    const first = sampleReviews[0];
    if (!first) throw new Error("Missing demo review");
    expect(demoReply(first, "Sample Shop", "Retail")).toContain("Sample Shop");
  });
});