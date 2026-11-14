import { describe, expect, it } from "vitest";
import { isLikelyClientRendered } from "./site-analyze";
describe("isLikelyClientRendered", () => {
  it("flags an empty app shell", () => expect(isLikelyClientRendered('<div id="root"></div><script></script>', "")).toBe(true));
  it("does not flag a page with real text", () => expect(isLikelyClientRendered('<div id="root"></div>', "word ".repeat(200))).toBe(false));
});
