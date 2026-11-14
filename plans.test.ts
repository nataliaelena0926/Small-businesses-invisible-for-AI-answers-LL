import { describe, expect, it } from "vitest";
import { PLANS } from "./plans";

describe("package prices in euros", () => {
  it("prices Start at 29 euros, one-time", () => {
    const start = PLANS.find((plan) => plan.id === "basic")!;
    expect(start.price).toBe(29);
    expect(start.period).toBe("one-time");
  });
  it("prices Pro at 19 euros per month", () => {
    const pro = PLANS.find((plan) => plan.id === "pro")!;
    expect(pro.price).toBe(19);
    expect(pro.period).toBe("/ month");
  });
  it("prices Premium at 35 euros per month", () => {
    const premium = PLANS.find((plan) => plan.id === "premium")!;
    expect(premium.price).toBe(35);
    expect(premium.period).toBe("/ month");
  });
  it("shows Pro as costing under one euro a day", () => {
    expect(PLANS.find((plan) => plan.id === "pro")!.note).toBe("under €1 a day");
  });
});

describe("pricing section hierarchy", () => {
  it("marks exactly one package as the visual hero, and it is Pro", () => {
    const highlighted = PLANS.filter((plan) => plan.highlight === true);
    expect(highlighted.map((plan) => plan.id)).toEqual(["pro"]);
  });

  it("gives the badge only to the highlighted package", () => {
    const badged = PLANS.filter((plan) => !!plan.badge);
    expect(badged.map((plan) => plan.id)).toEqual(["pro"]);
  });

  it("names the badge after the main package for active businesses", () => {
    expect(PLANS.find((plan) => plan.id === "pro")!.badge).toBe(
      "The main package for active businesses",
    );
  });

  it("lists Start gaps as things Pro adds", () => {
    const start = PLANS.find((plan) => plan.id === "basic")!;
    const missing = start.features.filter((feature) => !feature.included);
    expect(missing).toHaveLength(3);
    for (const feature of missing) {
      expect(feature.includedIn).toBe("pro");
    }
  });

  it("keeps every included feature free of an owner package", () => {
    for (const plan of PLANS) {
      for (const feature of plan.features) {
        if (feature.included) expect(feature.includedIn).toBeUndefined();
      }
    }
  });
});
