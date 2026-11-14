

import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CheckCircle2, Globe, Loader2, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/vizibil/ui/button";
import { Card } from "@/vizibil/ui/card";
import { Input } from "@/vizibil/ui/input";
import { useL } from "@/vizibil/lib/i18n";
import { SITE_CHECKS } from "@/vizibil/lib/site-checks";
import { analyzeErrorText, analyzeSite } from "@/vizibil/lib/site-client";
import { recordAudit } from "@/vizibil/lib/store";
import type { SiteAudit } from "@/vizibil/lib/types";
import { normalizeUrl } from "@/vizibil/lib/url";
import { cn } from "@/lib/utils";

/** Modulul de site: introducerea adresei + analiza automata a paginii principale. */
export function SiteCard({
  city,
  initialUrl,
  initialAudit,
  saidMobileOk,
  detailsHref,
}: {
  city: string;
  initialUrl: string | null;
  initialAudit: SiteAudit | null;
  saidMobileOk: boolean;
  detailsHref: string;
}) {
  const L = useL();
  const [url, setUrl] = useState(initialUrl ?? "");
  const [audit, setAudit] = useState<SiteAudit | null>(initialAudit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoRan = useRef(false);

  async function run(target: string) {
    const normalized = normalizeUrl(target);
    if (!normalized) return setError(analyzeErrorText("invalid_url", L));
    setError(null);
    setBusy(true);
    const res = await analyzeSite(normalized, city);
    if (res.audit) {
      setAudit(res.audit);
      setUrl(normalized);
      await recordAudit(normalized, res.audit).catch(() => {});
    } else {
      setError(analyzeErrorText(res.error ?? "unknown", L));
    }
    setBusy(false);
  }

  // Adresa data in formular, dar inca neanalizata: pornim analiza singuri.
  useEffect(() => {
    if (initialUrl && !initialAudit && !autoRan.current) {
      autoRan.current = true;
      run(initialUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const failed = audit?.checks.filter((c) => !c.pass) ?? [];
  const viewportFailed = failed.some((c) => c.id === "viewport");
  const tone = !audit ? "" : audit.score >= 70 ? "text-emerald-700" : audit.score >= 40 ? "text-amber-600" : "text-rose-600";

  return (
    <Card className="mt-8 p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-emerald-700" />
        <h2 className="text-lg font-semibold tracking-tight">{L("Evaluarea site-ului", "Website evaluation")}</h2>
      </div>
      <p className="mt-1 text-sm text-stone-600">
        {L(
          "Introdu adresa site-ului și îi verificăm automat pagina principală, exact cum ar citi-o un asistent AI.",
          "Enter your website address and we automatically check its home page, the way an AI assistant would read it."
        )}
      </p>

      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          run(url);
        }}
      >
        <Input
          type="text"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={L("ex. cafeneamea.ro", "e.g. mycafe.com")}
          maxLength={300}
          aria-label={L("Adresa site-ului", "Website address")}
        />
        <Button type="submit" variant={audit ? "outline" : "primary"} disabled={busy || !url.trim()} className="shrink-0">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : audit ? <RefreshCw className="h-4 w-4" /> : null}
          {busy ? L("Analizăm…", "Analysing…") : audit ? L("Reanalizează", "Re-analyse") : L("Analizează site-ul", "Analyse website")}
        </Button>
      </form>

      {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}

      {!audit && !busy && !error && (
        <p className="mt-4 text-sm text-stone-500">
          {L("Nu ai site? Lasă câmpul gol — îl poți adăuga oricând.", "No website? Leave it empty — you can add it anytime.")}
        </p>
      )}

      {audit && (
        <div className="mt-6 border-t border-stone-100 pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p>
              <span className={cn("text-4xl font-semibold tracking-tight", tone)}>{audit.score}</span>
              <span className="ml-1 text-sm text-stone-500">/ 100 · {L("scor tehnic al site-ului", "website technical score")}</span>
            </p>
            <p className="text-xs text-stone-500">
              {audit.url} · {new Date(audit.fetchedAt).toLocaleDateString()}
            </p>
          </div>

          {audit.clientRendered && (
            <p className="mt-4 flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {L(
                "Conținutul nu poate fi citit printr-o descărcare simplă — site-ul pare construit în browser. Unele verificări pot apărea lipsă deși există; nu ți-am scăzut nimic pentru asta.",
                "Content isn't readable via a static fetch — the site may be built in the browser. Some checks may look missing even if they exist; this is a notice, not a penalty.",
              )}
            </p>
          )}

          {saidMobileOk && viewportFailed && (
            <p className="mt-4 flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {L(
                "Ai răspuns că site-ul e optimizat pentru mobil, dar pagina nu are setarea necesară (meta viewport).",
                "You answered that the site is mobile-friendly, but the page lacks the required setting (meta viewport)."
              )}
            </p>
          )}

          <ul className="mt-5 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {SITE_CHECKS.map((meta) => {
              const c = audit.checks.find((x) => x.id === meta.id);
              if (!c) return null;
              return (
                <li key={meta.id} className="flex items-start gap-2 text-sm">
                  {c.pass ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  )}
                  <span className={c.pass ? "text-stone-700" : "font-medium text-stone-900"}>
                    {L(meta.title)}
                    {c.detail && <span className="ml-1.5 font-normal text-stone-500">({c.detail})</span>}
                  </span>
                </li>
              );
            })}
          </ul>

          {failed.length > 0 && (
            <Link to={detailsHref} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 hover:underline">
              {L(`Vezi cum repari cele ${failed.length} probleme`, `See how to fix these ${failed.length} issues`)}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}
