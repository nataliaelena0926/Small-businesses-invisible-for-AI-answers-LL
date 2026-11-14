import { describe, expect, it } from "vitest";
import { toAssessment, toWorkspacePlan } from "./mapping";
import { hasAccess } from "./lib/plans";

describe("My plan access per package", () => {
  it("Basic unlocks only the website and to-do steps", () => {
    expect(hasAccess(toWorkspacePlan("basic"), "start")).toBe(true);
    expect(hasAccess(toWorkspacePlan("basic"), "maintain")).toBe(false);
  });
  it("Pro adds re-checks and reviews but not marketing", () => {
    expect(hasAccess(toWorkspacePlan("pro"), "reviews")).toBe(true);
    expect(hasAccess(toWorkspacePlan("pro"), "complete")).toBe(false);
  });
  it("Premium unlocks marketing", () => expect(hasAccess(toWorkspacePlan("premium"), "complete")).toBe(true));
  it("no package unlocks nothing", () => expect(hasAccess(toWorkspacePlan(null), "start")).toBe(false));
  it("maps yes/no answers", () => expect(toAssessment({ domainEmail: true, crm: false } as never)).toEqual({ domain_email: "full", crm: "none" }));
});
