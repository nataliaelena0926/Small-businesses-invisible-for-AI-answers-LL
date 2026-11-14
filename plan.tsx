import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Lock } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { getMyBusiness } from "@/lib/business";
import type { Answers } from "@/lib/criteria";
import { I18nProvider, useL, useLang } from "@/vizibil/lib/i18n";
import { hasAccess } from "@/vizibil/lib/plans";
import type { AppState, Assessment, PlanId, Profile } from "@/vizibil/lib/types";
import { DOMAINS, FEATURES } from "@/vizibil/lib/criteria";
import { loadWorkspace, saveProfile, setWorkspaceUser } from "@/vizibil/lib/store";
import { Locked, type TabProps } from "@/vizibil/plan/common";
import { SiteTab } from "@/vizibil/plan/site-tab";
import { StepsTab } from "@/vizibil/plan/steps-tab";
import { MonitorTab } from "@/vizibil/plan/monitor-tab";
import { ReviewsTab } from "@/vizibil/plan/reviews-tab";
import { MarketingTab } from "@/vizibil/plan/marketing-tab";
import { Card } from "@/vizibil/ui/card";
import { Input, Label } from "@/vizibil/ui/input";
import { SiteCard } from "@/vizibil/site-card";
import { cn } from "@/lib/utils";
import { toWorkspacePlan, toAssessment, toDomain } from "@/vizibil/mapping";

export const Route = createFileRoute("/_authenticated/plan")({
  head: () => ({ meta: [{ title: "My plan — Visibly" }, { name: "description", content: "Your website builder, to-do steps, site re-checks, review themes and marketing ideas." }, { property: "og:title", content: "My plan — Visibly" }, { property: "og:description", content: "Your website builder, to-do steps, site re-checks, review themes and marketing ideas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <I18nProvider><PlanPage /></I18nProvider>,
});

type TabId = "site" | "steps" | "monitor" | "reviews" | "marketing";

function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex rounded-lg border border-border bg-card p-0.5 text-xs font-medium">
      {(["ro", "en"] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
          className={cn("rounded-md px-2.5 py-1 uppercase", lang === l ? "bg-ink text-ink-foreground" : "text-muted-foreground")}>{l}</button>
      ))}
    </div>
  );
}

function PlanPage() {
  const L = useL();
  const { user } = Route.useRouteContext();
  const { data: biz, isLoading } = useQuery({ queryKey: ["business"], queryFn: getMyBusiness });
  const [state, setState] = useState<AppState | null>(null);
  const [tab, setTab] = useState<TabId>("site");

  useEffect(() => {
    if (!biz) return;
    setWorkspaceUser(user.id);
    const ws = loadWorkspace(user.id);
    setState({
      business: { name: biz.name, cui: biz.tax_id ?? null, domain: toDomain(biz.industry) },
      assessment: toAssessment((biz.answers ?? {}) as Answers),
      plan: toWorkspacePlan(biz.plan),
      ...ws,
    });
  }, [biz, user.id]);

  if (isLoading || (biz && !state)) return <div className="min-h-screen"><AppHeader /></div>;
  if (!biz || !biz.plan) return (
    <div className="min-h-screen"><AppHeader />
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold">My plan unlocks after you choose a package</h1>
        <Button asChild className="mt-6"><Link to={biz ? "/pricing" : "/validate"}>{biz ? "See packages" : "Start assessment"}</Link></Button>
      </main></div>
  );
  const s = state!;
  const props: TabProps = { user: { id: user.id, email: user.email ?? "", aiOptIn: false }, state: s, patch: (p) => setState((x) => (x ? { ...x, ...p } : x)) };
  const tabs: { id: TabId; label: string; need: PlanId; locked: string }[] = [
    { id: "site", label: L("Site", "Website"), need: "start", locked: "" },
    { id: "steps", label: L("Pași de făcut", "To-do steps"), need: "start", locked: "" },
    { id: "monitor", label: L("Reverificare", "Re-checks"), need: "maintain", locked: L("Reverificarea site-ului și istoricul scorului sunt incluse în Pro.", "Site re-checks and score history are included in Pro.") },
    { id: "reviews", label: L("Recenzii", "Reviews"), need: "reviews", locked: L("Gruparea recenziilor pe teme este inclusă în Pro.", "Grouping reviews by theme is included in Pro.") },
    { id: "marketing", label: "Marketing", need: "complete", locked: L("Ideile de marketing și reclame sunt incluse în Premium.", "Marketing and ad ideas are included in Premium.") },
  ];
  const current = tabs.find((t) => t.id === tab)!;
  const open = hasAccess(s.plan, current.need);
  const planName = biz.plan.charAt(0).toUpperCase() + biz.plan.slice(1);

  return (
    <div className="min-h-screen">
      <AppHeader step={3} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">{L("Pachet ", "Plan: ")}{planName}</span>
            <h1 className="mt-3 text-3xl font-bold">{s.profile?.storeName || biz.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button asChild variant="outline"><Link to="/pricing">{L("Schimbă planul", "Change plan")} <ArrowUpRight className="h-4 w-4" /></Link></Button>
          </div>
        </div>

        {!s.profile ? <ProfileForm defaultName={biz.name} domain={s.business!.domain} onSaved={(profile) => setState((x) => (x ? { ...x, profile } : x))} /> : <>
          <div className="mt-6">
            <SiteCard city={s.profile.city} initialUrl={s.websiteUrl} initialAudit={s.siteAudit} saidMobileOk={s.assessment?.["mobile"] === "full"} detailsHref="/plan" />
          </div>
          <div className="mt-8 flex gap-1 overflow-x-auto border-b border-border" role="tablist">
            {tabs.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => { setState({ ...s, ...loadWorkspace(user.id) }); setTab(t.id); }}
                className={cn("-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-sm", tab === t.id ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
                {!hasAccess(s.plan, t.need) && <Lock className="h-3.5 w-3.5" />}{t.label}
              </button>
            ))}
          </div>
          {!open ? <Locked need={current.need} text={current.locked} />
            : tab === "site" ? <SiteTab {...props} />
            : tab === "steps" ? <StepsTab {...props} />
            : tab === "monitor" ? <MonitorTab {...props} />
            : tab === "reviews" ? <ReviewsTab {...props} />
            : <MarketingTab {...props} />}
        </>}
      </main>
    </div>
  );
}

function ProfileForm({ defaultName, domain, onSaved }: { defaultName: string; domain: string; onSaved: (p: Profile) => void }) {
  const L = useL();
  const food = DOMAINS.find((d) => d.id === domain)?.food ?? false;
  const list = useMemo(() => FEATURES.filter((f) => food || !f.foodOnly), [food]);
  const [p, setP] = useState<Profile>({ storeName: defaultName, address: "", city: "", phone: "", features: {} });
  const valid = p.storeName.trim() && p.address.trim() && p.city.trim() && p.phone.trim();
  return (
    <Card className="mt-6 p-6 sm:p-8">
      <h2 className="text-lg font-semibold">{L("Profilul magazinului", "Store profile")}</h2>
      <p className="mt-1 text-sm text-stone-600">{L("Din aceste date generăm site-ul, pașii și ideile de marketing.", "We build your website, steps and marketing ideas from these details.")}</p>
      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={async (e) => { e.preventDefault(); if (!valid) return; await saveProfile(p); onSaved(p); }}>
        <div><Label htmlFor="sn">{L("Numele magazinului", "Store name")}</Label><Input id="sn" value={p.storeName} maxLength={120} onChange={(e) => setP({ ...p, storeName: e.target.value })} /></div>
        <div><Label htmlFor="ph">{L("Telefon", "Phone")}</Label><Input id="ph" value={p.phone} maxLength={30} onChange={(e) => setP({ ...p, phone: e.target.value })} /></div>
        <div><Label htmlFor="ad">{L("Adresa", "Address")}</Label><Input id="ad" value={p.address} maxLength={160} onChange={(e) => setP({ ...p, address: e.target.value })} /></div>
        <div><Label htmlFor="ci">{L("Oraș", "City")}</Label><Input id="ci" value={p.city} maxLength={80} onChange={(e) => setP({ ...p, city: e.target.value })} /></div>
        <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm font-medium">{L("Ce oferiți", "What you offer")}</legend>
          <div className="grid gap-2 sm:grid-cols-2">{list.map((f) => (
            <label key={f.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!p.features[f.id]} onChange={(e) => setP({ ...p, features: { ...p.features, [f.id]: e.target.checked } })} />{L(f.label)}</label>
          ))}</div>
        </fieldset>
        <Button type="submit" className="sm:col-span-2" disabled={!valid}>{L("Salvează și continuă", "Save and continue")}</Button>
      </form>
    </Card>
  );
}
