import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { CRITERIA, type Answers } from "@/lib/criteria";
import { getMyBusiness } from "@/lib/business";
import { useState } from "react";
import { premiumSimulation } from "@/lib/account";
import { PremiumPreview } from "@/components/PremiumPreview";
import { SmartReviewManager } from "@/components/SmartReviewManager";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Your diagnostic — Visibly" }, { name: "description", content: "Your Readiness Score and the Premium completed-business preview." }, { property: "og:title", content: "Your diagnostic — Visibly" }, { property: "og:description", content: "Your Readiness Score and the Premium completed-business preview." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Dashboard,
});

function Gauge({ score }: { score: number }) {
  const r = 70, c = 2 * Math.PI * r;
  const tone = score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-destructive";
  return (
    <div className="relative h-48 w-48">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={r} strokeWidth="14" className="fill-none stroke-muted" />
        <circle cx="80" cy="80" r={r} strokeWidth="14" strokeLinecap="round" className={`fill-none stroke-current ${tone} transition-all duration-1000`}
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><div className="font-display text-5xl font-bold">{score}</div><div className="text-sm text-muted-foreground">out of 100</div></div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [view, setView] = useState<"preview" | "actual">("preview");
  const { data: biz, isLoading } = useQuery({ queryKey: ["business"], queryFn: getMyBusiness });
  if (isLoading) return <div className="min-h-screen"><AppHeader step={2} /></div>;
  if (!biz || (!biz.answers && biz.plan !== "premium")) return (
    <div className="min-h-screen"><AppHeader step={2} />
      <main className="mx-auto max-w-xl px-6 py-20 text-center"><h1 className="text-3xl font-bold">No diagnostic yet</h1>
        <Button asChild className="mt-6"><Link to="/validate">Start assessment</Link></Button></main></div>
  );
  const actualAnswers = (biz.answers ?? {}) as Answers;
  const preview = premiumSimulation(biz.plan, actualAnswers);
  const showPreview = !!preview && view === "preview";
  const answers = showPreview ? preview.answers : actualAnswers;
  const score = showPreview ? preview.score : biz.score ?? 0;
  const passed = CRITERIA.filter((c) => answers[c.id]);
  const missing = CRITERIA.filter((c) => !answers[c.id]);
  const verdict = score === 100 ? "Foundation complete — now let's verify with real checks." : score >= 70 ? "AI assistants can find you, with room to grow." : score >= 40 ? "You're partly visible — AI often recommends competitors instead." : "You're nearly invisible to AI search right now.";

  return (
    <div className="min-h-screen">
      <AppHeader step={2} />
      <main className="mx-auto max-w-6xl px-6 py-12 pb-32">
        {preview && <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="font-semibold text-primary">Premium active · Demo</p>
          <div className="flex gap-2" role="group" aria-label="Dashboard view">
            <Button variant={view === "preview" ? "default" : "outline"} aria-pressed={view === "preview"} onClick={() => setView("preview")}>Completed preview</Button>
            <Button variant={view === "actual" ? "default" : "outline"} aria-pressed={view === "actual"} onClick={() => setView("actual")}>Actual assessment</Button>
          </div>
        </div>}
        <div className="grid items-center gap-8 rounded-3xl bg-ink p-10 text-ink-foreground md:grid-cols-[auto_1fr]">
          <div className="rounded-full bg-card p-2 text-card-foreground"><Gauge score={score} /></div>
          <div>
            <p className="text-sm uppercase tracking-widest opacity-70">{biz.industry} · {biz.name}</p>
            <h1 className="mt-2 text-4xl font-bold">{showPreview ? "Your completed-business preview" : "Readiness Score"}</h1>
            <p className="mt-3 max-w-lg text-lg opacity-80">{showPreview ? "All nine criteria met in this Premium simulation." : verdict}</p>
            <p className="mt-2 opacity-70">{passed.length} of {CRITERIA.length} criteria met · {missing.length} gaps found</p>
            {!showPreview && <p className="mt-2 text-xs opacity-60">Based on self-assessment — automatic technical verification follows in the next step.</p>}
          </div>
        </div>

        {showPreview ? <PremiumPreview name={biz.name} industry={biz.industry} score={preview.currentScore} /> : <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="text-2xl font-bold">Missing <span className="text-destructive">({missing.length})</span></h2>
            <div className="mt-4 space-y-3">
              {missing.map((c) => (
                <div key={c.id} className="rounded-2xl border border-destructive/30 bg-card p-5">
                  <div className="flex items-center justify-between"><h3 className="font-semibold">✕ {c.title}</h3><span className="text-sm text-muted-foreground">−{c.weight} pts</span></div>
                  <p className="mt-2 text-sm text-muted-foreground">{c.impact}</p>
                </div>
              ))}
              {missing.length === 0 && <p className="text-muted-foreground">Nothing missing — impressive!</p>}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold">Passed <span className="text-success">({passed.length})</span></h2>
            <div className="mt-4 space-y-3">
              {passed.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-5">
                  <h3 className="font-semibold">✓ {c.title}</h3><span className="text-sm text-success">+{c.weight} pts</span>
                </div>
              ))}
            </div>
          </section>
        </div>}

        {biz.plan === "premium" && <SmartReviewManager name={biz.name} industry={biz.industry} />}

        {biz.plan && <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-ink p-6 text-ink-foreground md:flex-row">
          <div><h3 className="text-xl font-bold">Your action plan is active</h3><p className="text-sm opacity-80">Website builder, to-do steps, re-checks, review themes and marketing ideas.</p></div>
          <Button asChild size="lg"><Link to="/plan">Open My plan →</Link></Button>
        </div>}

        {!preview && !biz.plan && <div className="sticky bottom-4 mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary bg-accent p-6 shadow-soft md:flex-row">
          <div><h3 className="text-xl font-bold text-accent-foreground">Complete what AI engines check</h3>
            <p className="text-sm text-accent-foreground/80">Choose an action plan to continue.</p></div>
          <Button asChild size="lg"><Link to="/pricing">Choose a plan →</Link></Button>
        </div>}
      </main>
    </div>
  );
}
