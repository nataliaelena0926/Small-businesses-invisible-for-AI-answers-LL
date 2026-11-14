import { describe, expect, it } from "vitest";
import { isCuiFormatValid, isTestEmail, parseCui } from "./company";

describe("parseCui", () => {
  it("strips the RO prefix", () => expect(parseCui("RO 14399840")).toBe(14399840));
  it("rejects letters", () => expect(parseCui("ABC123")).toBeNull());
});

describe("isCuiFormatValid", () => {
  it("accepts 2 to 10 digits with or without the RO prefix", () => {
    expect(isCuiFormatValid("12345678")).toBe(true);
    expect(isCuiFormatValid("RO12345678")).toBe(true);
    expect(isCuiFormatValid("RO 12")).toBe(true);
  });
  it("rejects too short, too long and non-numeric values", () => {
    expect(isCuiFormatValid("1")).toBe(false);
    expect(isCuiFormatValid("12345678901")).toBe(false);
    expect(isCuiFormatValid("RO1")).toBe(false);
    expect(isCuiFormatValid("ABC123")).toBe(false);
    expect(isCuiFormatValid("")).toBe(false);
  });
});

describe("isTestEmail", () => {
  it("blocks obvious test domains", () => {
    expect(isTestEmail("a@Example.com")).toBe(true);
    expect(isTestEmail("a@test.com")).toBe(true);
    expect(isTestEmail("a@mailinator.com")).toBe(true);
  });
  it("allows real domains and refuses addresses without a domain", () => {
    expect(isTestEmail("a@gmail.com")).toBe(false);
    expect(isTestEmail("a@business.ro")).toBe(false);
    expect(isTestEmail("nobody")).toBe(false);
  });
});
