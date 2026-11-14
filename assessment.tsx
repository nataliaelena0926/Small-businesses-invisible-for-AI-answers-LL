import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/AppHeader";
import { CRITERIA, computeScore, type Answers } from "@/lib/criteria";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/assessment")({
  head: () => ({ meta: [{ title: "Assessment — Visibly" }, { name: "description", content: "Answer 9 quick questions about your digital presence." }, { property: "og:title", content: "Assessment — Visibly" }, { property: "og:description", content: "Answer 9 quick questions about your digital presence." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const c = CRITERIA[i]!;

  async function answer(v: boolean) {
    const next = { ...answers, [c.id]: v };
    setAnswers(next);
    if (i < CRITERIA.length - 1) { setI(i + 1); return; }
    const { error } = await supabase.from("businesses")
      .update({ answers: next, score: computeScore(next), updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (error) { toast.error(error.message); return; }
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen">
      <AppHeader step={1} />
      <main className="mx-auto max-w-2xl px-6 py-14">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {i + 1} of {CRITERIA.length}</span><span>{c.title}</span>
        </div>
        <Progress value={((i + 1) / CRITERIA.length) * 100} className="mt-3" />
        <div key={c.id} className="mt-10 animate-in fade-in slide-in-from-bottom-2 rounded-3xl border border-border bg-card p-10 shadow-soft">
          <h1 className="text-3xl font-bold">{c.question}</h1>
          <p className="mt-3 text-muted-foreground">{c.hint}</p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <Button size="lg" variant={answers[c.id] === true ? "default" : "outline"} onClick={() => answer(true)}>Yes</Button>
            <Button size="lg" variant={answers[c.id] === false ? "default" : "outline"} onClick={() => answer(false)}>Not yet</Button>
          </div>
        </div>
        <Button variant="ghost" className="mt-6" disabled={i === 0} onClick={() => setI(i - 1)}>← Back</Button>
      </main>
    </div>
  );
}
