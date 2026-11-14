

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/vizibil/ui/button";
import { Card } from "@/vizibil/ui/card";
import { Input, Label } from "@/vizibil/ui/input";
import { Progress } from "@/vizibil/ui/progress";
import { CRITERIA } from "@/vizibil/lib/criteria";
import { useL } from "@/vizibil/lib/i18n";
import { SITE_CHECKS } from "@/vizibil/lib/site-checks";
import { saveReviewLink, saveTasksDone } from "@/vizibil/lib/store";
import { cn } from "@/lib/utils";
import type { TabProps } from "./common";

interface Task {
  id: string;
  title: string;
  text: string;
  detail?: string | undefined;
}

export function StepsTab({ state, patch }: TabProps) {
  const L = useL();
  const done = state.tasksDone;
  const [reviewLink, setReviewLink] = useState(state.reviewLink ?? "");
  const [qr, setQr] = useState<string | null>(null);
  const [linkError, setLinkError] = useState(false);

  useEffect(() => {
    if (state.reviewLink) QRCode.toDataURL(state.reviewLink, { width: 640, margin: 2 }).then(setQr).catch(() => {});
  }, [state.reviewLink]);

  const criteriaTasks: Task[] = CRITERIA.filter((c) => state.assessment?.[c.id] !== "full").map((c) => ({
    id: `c:${c.id}`,
    title: L(c.title),
    text: L(c.fix),
  }));
  const audit = state.siteAudit;
  const siteTasks: Task[] = audit
    ? SITE_CHECKS.filter((m) => audit.checks.some((c) => c.id === m.id && !c.pass)).map((m) => ({
        id: `s:${m.id}`,
        title: L(m.title),
        text: L(m.fix),
        detail: audit.checks.find((c) => c.id === m.id)?.detail,
      }))
    : [];
  const all = [...criteriaTasks, ...siteTasks];
  const doneCount = all.filter((t) => done.includes(t.id)).length;

  function toggle(id: string) {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    patch({ tasksDone: next });
    saveTasksDone(next).catch(() => {});
  }

  async function makeQr(e: React.FormEvent) {
    e.preventDefault();
    const link = reviewLink.trim();
    let ok = false;
    try {
      ok = new URL(link).protocol === "https:";
    } catch {}
    if (!ok) return setLinkError(true);
    setLinkError(false);
    patch({ reviewLink: link });
    saveReviewLink(link).catch(() => {});
  }

  const list = (items: Task[]) => (
    <Card className="mt-4 divide-y divide-stone-100">
      {items.map((t) => {
        const checked = done.includes(t.id);
        return (
          <label key={t.id} className="flex cursor-pointer gap-4 p-5 hover:bg-stone-50/60">
            <input type="checkbox" checked={checked} onChange={() => toggle(t.id)} className="mt-1 h-4 w-4 shrink-0 rounded border-stone-300 accent-emerald-700" />
            <span>
              <span className={cn("font-medium", checked && "text-stone-400 line-through")}>{t.title}</span>
              {t.detail && <span className="ml-2 text-xs text-stone-500">({t.detail})</span>}
              <span className={cn("mt-0.5 block text-sm", checked ? "text-stone-400" : "text-stone-600")}>{t.text}</span>
            </span>
          </label>
        );
      })}
    </Card>
  );

  return (
    <>
      <Card className="mt-6 p-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">{L("Progres", "Progress")}</span>
          <span className="text-stone-500">{doneCount} / {all.length} {L("pași", "steps")}</span>
        </div>
        <Progress value={all.length ? (doneCount / all.length) * 100 : 100} />
      </Card>

      <h2 className="mt-10 text-lg font-semibold tracking-tight">{L("Prezența digitală", "Digital presence")}</h2>
      {criteriaTasks.length ? list(criteriaTasks) : (
        <Card className="mt-4 p-5 text-sm text-stone-600">{L("Toate cele 9 criterii sunt îndeplinite.", "All 9 criteria are met.")}</Card>
      )}

      {audit && (
        <>
          <h2 className="mt-10 text-lg font-semibold tracking-tight">{L("Probleme găsite pe site", "Issues found on your site")}</h2>
          <p className="mt-1 text-sm text-stone-600">{audit.url} · {L("scor tehnic ", "technical score ")}{audit.score}/100</p>
          {siteTasks.length ? list(siteTasks) : (
            <Card className="mt-4 p-5 text-sm text-stone-600">{L("Nicio problemă tehnică pe pagina principală.", "No technical issues on the home page.")}</Card>
          )}
        </>
      )}

      <h2 className="mt-10 flex items-center gap-2 text-lg font-semibold tracking-tight">
        <QrCode className="h-5 w-5 text-emerald-700" />
        {L("Cod QR pentru recenzii", "Review QR code")}
      </h2>
      <Card className="mt-4 p-6">
        <p className="text-sm text-stone-600">
          {L(
            "Lipește linkul de recenzii din Google Business Profile („Cere recenzii”). Printezi codul și îl pui la casă sau pe mese.",
            "Paste the review link from your Google Business Profile (“Ask for reviews”). Print the code and place it at the counter or on tables."
          )}
        </p>
        <form onSubmit={makeQr} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="review">{L("Link recenzii", "Review link")}</Label>
            <Input id="review" value={reviewLink} onChange={(e) => setReviewLink(e.target.value)} placeholder="https://g.page/r/…/review" maxLength={300} />
          </div>
          <Button type="submit" disabled={!reviewLink.trim()} className="shrink-0">{L("Generează codul", "Generate code")}</Button>
        </form>
        {linkError && <p role="alert" className="mt-2 text-xs text-rose-700">{L("Linkul trebuie să înceapă cu https://", "The link must start with https://")}</p>}
        {qr && (
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt={L("Cod QR pentru recenzii", "Review QR code")} className="h-44 w-44 rounded-xl border border-stone-200" />
            <a href={qr} download="qr-recenzii.png">
              <Button variant="outline"><Download className="h-4 w-4" />{L("Descarcă PNG", "Download PNG")}</Button>
            </a>
          </div>
        )}
      </Card>
    </>
  );
}
