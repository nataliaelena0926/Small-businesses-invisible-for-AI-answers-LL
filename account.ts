import type { Answers } from "./criteria";
import { CRITERIA, computeScore } from "./criteria";

export function accountDestination(business: { answers: unknown; plan: string | null } | null) {
  return business?.answers || business?.plan === "premium" ? "/dashboard" : "/validate";
}

export function premiumSimulation(plan: string | null | undefined, answers: Answers) {
  if (plan !== "premium") return null;
  const completed = Object.fromEntries(CRITERIA.map((c) => [c.id, true])) as Answers;
  return { answers: completed, score: computeScore(completed), currentScore: computeScore(answers) };
}