import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { PLANS, planOf, type Plan, type PlanFeature } from "@/lib/plans";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pricing")({
  head: () => ({ meta: [{ title: "Choose your plan — Visibly" }, { name: "description", content: "Pick the package that fits your business: the site, monitoring over time and reviews grouped by theme." }, { property: "og:title", content: "Choose your plan — Visibly" }, { property: "og:description", content: "Pick the package that fits your business: the site, monitoring over time and reviews grouped by theme." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Pricing,
});

/** Renders **bold** segments as strong text. */
function Rich({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : <span key={i}>{part}</span>))}
    </>
  );
}

function FeatureRow({ feature }: { feature: PlanFeature }) {
  if (feature.included) {
    return (
      <li className="flex items-start gap-2.5 text-sm">
        <span aria-hidden className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/12 text-[11px] font-bold text-primary">✓</span>
        <span><Rich text={feature.text} /></span>
      </li>
    );
  }
  return (
    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
      <span aria-hidden className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold">✕</span>
      <span>
        <span className="line-through decoration-muted-foreground/50"><Rich text={feature.text} /></span>
        {feature.includedIn && <span className="ml-2 whitespace-nowrap text-xs font-medium text-primary">Included in {planOf(feature.includedIn)?.name}</span>}
      </span>
    </li>
  );
}

function PlanCard({ plan, onChoose }: { plan: Plan; onChoose: (p: Plan) => void }) {
  const hero = !!plan.highlight;
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl p-8",
        hero ? "z-10 border-2 border-primary bg-accent/40 shadow-xl md:scale-105" : "border border-border bg-card"
      )}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
          {plan.badge}
        </span>
      )}
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{plan.kicker}</p>
      <h2 className="mt-2 text-2xl font-bold">{plan.name}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
      <div className="mt-6">
        <span className="font-display text-5xl font-bold">€{plan.price}</span>{" "}
        <span className="text-sm text-muted-foreground">{plan.period}</span>
        {plan.note && <p className="mt-1 text-xs text-muted-foreground">{plan.note}</p>}
      </div>
      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((f) => <FeatureRow key={f.text} feature={f} />)}
      </ul>
      <Button
        size="lg"
        className="mt-8 w-full"
        variant={hero ? "default" : "outline"}
        onClick={() => onChoose(plan)}
      >
        {plan.cta}
      </Button>
    </div>
  );
}

function Pricing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  function choose(p: Plan) {
    setDone(false);
    setPlan(p);
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!plan) return;
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1500));
    const { data, error } = await supabase.rpc("choose_plan", { _plan: plan.id });
    setPaying(false);
    if (error) { toast.error(error.message); return; }
    if (!data) { toast.error("Add your business before choosing a plan."); return; }
    await queryClient.invalidateQueries({ queryKey: ["business"] });
    if (plan.id === "premium") { navigate({ to: "/dashboard" }); return; }
    setDone(true);
  }

  return (
    <div className="min-h-screen">
      <AppHeader step={3} />
      <main className="mx-auto max-w-6xl px-6 py-14">
        <div className="text-center">
          <h1 className="text-5xl font-bold">Choose your action plan</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Pick how you want to close the gaps and start appearing in AI recommendations.</p>
        </div>

        <section className="mt-14 isolate grid gap-6 md:grid-cols-3 md:items-center md:gap-8">
          {PLANS.map((p) => <PlanCard key={p.id} plan={p} onChoose={choose} />)}
        </section>

        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-muted-foreground">
          The initial check is free and takes 3 minutes. Billing is in lei at the BNR exchange rate. Subscriptions are optional and can be cancelled at any time, and the generated site stays yours.
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground">Demo checkout — no real payment is taken.</p>
      </main>

      <Dialog open={!!plan} onOpenChange={(o) => !o && setPlan(null)}>
        <DialogContent>
          {done ? (
            <div className="py-6 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-2xl text-accent-foreground">✓</div>
              <h2 className="mt-4 text-2xl font-bold">You're on {plan?.name}!</h2>
              <p className="mt-2 text-muted-foreground">Demo plan saved. No payment was taken.</p>
              <div className="mt-4 flex justify-center gap-2"><Button asChild><Link to="/plan">Open My plan</Link></Button><Button asChild variant="outline"><Link to="/dashboard">Back to dashboard</Link></Button></div>
            </div>
          ) : (
            <form onSubmit={pay} className="space-y-4">
              <DialogHeader><DialogTitle>Checkout — {plan?.name}</DialogTitle><DialogDescription>€{plan?.price} {plan?.period}</DialogDescription></DialogHeader>
              <div className="space-y-2"><Label>Card number</Label><Input defaultValue="4242 4242 4242 4242" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Expiry</Label><Input defaultValue="12 / 28" /></div>
                <div className="space-y-2"><Label>CVC</Label><Input defaultValue="123" /></div>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={paying}>{paying ? "Processing…" : `Pay €${plan?.price}`}</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
