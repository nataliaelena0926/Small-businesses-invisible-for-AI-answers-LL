

import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/vizibil/ui/button";
import { Card } from "@/vizibil/ui/card";
import { useL } from "@/vizibil/lib/i18n";
import { SITE_CHECKS } from "@/vizibil/lib/site-checks";
import { analyzeErrorText, analyzeSite } from "@/vizibil/lib/site-client";
import { recordAudit } from "@/vizibil/lib/store";
import { cn } from "@/lib/utils";
import type { TabProps } from "./common";

const STALE_MS = 2 * 24 * 60 * 60 * 1000; // reverificam singuri daca ultima analiza e mai veche de 2 zile

/** Illustrative 4-check history: shows what monitoring looks like before real checks pile up. */
const SAMPLE_POINTS = [
  { label: { ro: "Săpt. 1", en: "Week 1" }, score: 34 },
  { label: { ro: "Săpt. 2", en: "Week 2" }, score: 76 },
  { label: { ro: "Săpt. 3", en: "Week 3" }, score: 64 },
  { label: { ro: "Azi", en: "Today" }, score: 88 },
];

const SAMPLE_CHANGES = [
  {
    when: { ro: "Azi", en: "Today" },
    delta: 24,
    alert: false,
    text: { ro: "S-au adăugat programul structurat și lista de prețuri în format text pe site.", en: "Structured opening hours and a price list in text format were added to the site." },
  },
  {
    when: { ro: "Acum 7 zile", en: "7 days ago" },
    delta: -12,
    alert: true,
    text: { ro: "Pagina de contact nu răspundea și programul de weekend lipsea.", en: "The contact page was not responding and weekend hours were missing." },
  },
  {
    when: { ro: "Acum 14 zile", en: "14 days ago" },
    delta: 42,
    alert: false,
    text: { ro: "Generare site inițial prin pachetul Start.", en: "Initial site generated through the Start package." },
  },
];

function SampleTrend() {
  const L = useL();
  const W = 600;
  const H = 150;
  const x = (i: number) => (i / (SAMPLE_POINTS.length - 1)) * (W - 60) + 30;
  const y = (s: number) => H - 34 - (s / 100) * (H - 60);
  return (
    <Card className="mt-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold tracking-tight">{L("Evoluția scorului pe 4 verificări", "Score over 4 checks")}</h3>
        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600 ring-1 ring-inset ring-stone-200">{L("Date demonstrative", "Sample data")}</span>
      </div>
      <p className="mt-1 text-xs text-stone-500">{L("Istoric ilustrativ, ca să vezi cum arată monitorizarea. Nu sunt verificările tale reale.", "Illustrative history so you can see how monitoring works. These are not your real checks.")}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label={L("Grafic demonstrativ al evoluției scorului", "Sample chart of the score over time")}>
        <line x1={x(0)} x2={x(SAMPLE_POINTS.length - 1)} y1={y(0)} y2={y(0)} className="stroke-stone-200" />
        <polyline
          fill="none"
          strokeWidth="2.5"
          className="stroke-emerald-600"
          strokeLinejoin="round"
          points={SAMPLE_POINTS.map((p, i) => `${x(i)},${y(p.score)}`).join(" ")}
        />
        {SAMPLE_POINTS.map((p, i) => (
          <g key={p.label.en}>
            <circle cx={x(i)} cy={y(p.score)} r="4" className="fill-emerald-700" />
            <text x={x(i)} y={y(p.score) - 10} textAnchor="middle" className="fill-stone-700 text-[12px] font-medium">{p.score}/100</text>
            <text x={x(i)} y={H - 10} textAnchor="middle" className="fill-stone-500 text-[12px]">{L(p.label.ro, p.label.en)}</text>
          </g>
        ))}
      </svg>
      <h4 className="mt-6 text-sm font-semibold tracking-tight">{L("Ce s-a schimbat între verificări", "What changed between checks")}</h4>
      <ul className="mt-3 space-y-3">
        {SAMPLE_CHANGES.map((c) => (
          <li key={c.text.en} className="flex items-start gap-3 text-sm">
            <span className={cn("mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", c.delta > 0 ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700")}>
              {c.delta > 0 ? "+" : ""}{c.delta}
            </span>
            <span className="text-stone-700">
              <span className="font-medium">[{L(c.when.ro, c.when.en)}]</span> {L(c.text.ro, c.text.en)}
              {c.alert && <span className="ml-1 font-medium text-rose-700">{L("(alertă trimisă)", "(alert sent)")}</span>}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function MonitorTab({ state, patch }: TabProps) {
  const L = useL();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changed, setChanged] = useState<{ fixed: string[]; broken: string[] } | null>(null);
  const auto = useRef(false);
  const history = state.siteHistory;
  const audit = state.siteAudit;
  const url = state.websiteUrl;

  async function recheck() {
    if (!url) return;
    setBusy(true);
    setError(null);
    const res = await analyzeSite(url, state.profile?.city ?? "");
    if (res.audit) {
      const before = audit?.checks ?? [];
      const title = (id: string) => L(SITE_CHECKS.find((m) => m.id === id)?.title ?? { ro: id, en: id });
      setChanged({
        fixed: res.audit.checks.filter((c) => c.pass && before.some((b) => b.id === c.id && !b.pass)).map((c) => title(c.id)),
        broken: res.audit.checks.filter((c) => !c.pass && before.some((b) => b.id === c.id && b.pass)).map((c) => title(c.id)),
      });
      const next = await recordAudit(url, res.audit).catch(() => history);
      patch({ siteAudit: res.audit, siteHistory: next });
    } else {
      setError(analyzeErrorText(res.error ?? "unknown", L));
    }
    setBusy(false);
  }

  useEffect(() => {
    if (auto.current || !url || !audit) return;
    auto.current = true;
    if (Date.now() - new Date(audit.fetchedAt).getTime() > STALE_MS) recheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!url || !audit) {
    return (
      <>
        <Card className="mt-6 p-6 text-sm text-stone-600">
          {L("Ca să-ți urmărim scorul avem nevoie de adresa site-ului publicat. ", "To track your score we need the address of your published site. ")}
          <Link to="/dashboard" className="font-medium text-emerald-800 underline underline-offset-2">{L("Adaug-o în Diagnostic", "Add it in Diagnostic")}</Link>.
        </Card>
        <SampleTrend />
      </>
    );
  }

  const points = history.length ? history : [{ at: audit.fetchedAt, score: audit.score }];
  const prev = points.length > 1 ? points[points.length - 2]!.score : null;
  const delta = prev === null ? 0 : audit.score - prev;
  const W = 600;
  const H = 120;
  const x = (i: number) => (points.length === 1 ? W / 2 : (i / (points.length - 1)) * (W - 20) + 10);
  const y = (s: number) => H - 10 - (s / 100) * (H - 20);

  return (
    <>
      <Card className="mt-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">{url}</p>
            <p className="mt-1 flex items-baseline gap-3">
              <span className="text-5xl font-semibold tracking-tight">{audit.score}</span>
              <span className="text-sm text-stone-500">/ 100</span>
              {delta !== 0 && (
                <span className={cn("flex items-center gap-1 text-sm font-medium", delta > 0 ? "text-emerald-700" : "text-rose-600")}>
                  {delta > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {delta > 0 ? "+" : ""}{delta} {L("față de verificarea anterioară", "since the previous check")}
                </span>
              )}
            </p>
            <p className="mt-1 text-xs text-stone-500">{L("Ultima verificare: ", "Last checked: ")}{new Date(audit.fetchedAt).toLocaleString()}</p>
          </div>
          <Button variant="outline" onClick={recheck} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {L("Reverifică acum", "Re-check now")}
          </Button>
        </div>

        {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
        {changed && (
          <div className="mt-4 rounded-lg bg-stone-50 px-4 py-3 text-sm">
            {!changed.fixed.length && !changed.broken.length && <p className="text-stone-600">{L("Nicio schimbare față de verificarea anterioară.", "No change since the previous check.")}</p>}
            {changed.fixed.length > 0 && <p className="text-emerald-800">{L("Rezolvat: ", "Fixed: ")}{changed.fixed.join(", ")}</p>}
            {changed.broken.length > 0 && <p className="text-rose-700">{L("De verificat: ", "Needs a look: ")}{changed.broken.join(", ")}</p>}
          </div>
        )}

        <svg viewBox={`0 0 ${W} ${H}`} className="mt-6 w-full" role="img" aria-label={L("Evoluția scorului", "Score over time")}>
          <line x1="10" x2={W - 10} y1={y(100)} y2={y(100)} className="stroke-stone-200" strokeDasharray="3 4" />
          <line x1="10" x2={W - 10} y1={y(0)} y2={y(0)} className="stroke-stone-200" />
          {points.length > 1 && <polyline fill="none" strokeWidth="2.5" className="stroke-emerald-600" strokeLinejoin="round" points={points.map((p, i) => `${x(i)},${y(p.score)}`).join(" ")} />}
          {points.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.score)} r="4" className="fill-emerald-700" />)}
        </svg>
      </Card>

      <h2 className="mt-10 text-lg font-semibold tracking-tight">{L("Istoricul verificărilor", "Check history")}</h2>
      <Card className="mt-4 divide-y divide-stone-100 text-sm">
        {[...points].reverse().map((p, i, arr) => {
          const older = arr[i + 1];
          const d = older ? p.score - older.score : 0;
          return (
            <div key={p.at + i} className="flex items-center justify-between px-5 py-3">
              <span className="text-stone-600">{new Date(p.at).toLocaleString()}</span>
              <span className="flex items-center gap-3">
                {d !== 0 && <span className={d > 0 ? "text-emerald-700" : "text-rose-600"}>{d > 0 ? "+" : ""}{d}</span>}
                <span className="font-mono font-medium">{p.score}/100</span>
              </span>
            </div>
          );
        })}
      </Card>

      <SampleTrend />
    </>
  );
}
