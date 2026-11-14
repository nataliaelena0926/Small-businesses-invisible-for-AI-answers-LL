import type { Answers } from "@/lib/criteria";
import type { Assessment, PlanId } from "@/vizibil/lib/types";

/** Visibly packages unlock the My plan tools in tiers: Basic → starter tools, Pro → re-checks + reviews, Premium → everything. */
export function toWorkspacePlan(plan: string | null | undefined): PlanId | null {
  return plan === "basic" ? "start" : plan === "pro" ? "reviews" : plan === "premium" ? "complete" : null;
}
const ID_MAP: Record<string, string> = { domainEmail: "domain_email" };
export function toAssessment(answers: Answers): Assessment {
  return Object.fromEntries(Object.entries(answers).map(([k, v]) => [ID_MAP[k] ?? k, v ? "full" : "none"]));
}
export function toDomain(industry: string | null | undefined) {
  return ({ Cafe: "cafe", Tailoring: "tailor", Services: "services", Retail: "retail" } as Record<string, string>)[industry ?? ""] ?? "other";
}
