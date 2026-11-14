import { describe, it, expect } from "vitest";
import { computeScore, CRITERIA } from "./criteria";

const weightOf = (id: string) => CRITERIA.find((c) => c.id === id)!.weight;

describe("computeScore", () => {
  it("weights sum to 100", () => expect(CRITERIA.reduce((s, c) => s + c.weight, 0)).toBe(100));
  it("is 0 with no criteria met", () => expect(computeScore({})).toBe(0));
  it("is 100 with all criteria met", () =>
    expect(computeScore(Object.fromEntries(CRITERIA.map((c) => [c.id, true])))).toBe(100));
  it("website + verified profile = 27", () => expect(computeScore({ website: true, gbp: true })).toBe(27));
});

describe("score weights", () => {
  it("scores website existence at 12 points", () => expect(weightOf("website")).toBe(12));
  it("scores a verified Google Business Profile at 15 points", () => expect(weightOf("gbp")).toBe(15));
  it("scores Google Maps presence at 12 points", () => expect(weightOf("maps")).toBe(12));
});
