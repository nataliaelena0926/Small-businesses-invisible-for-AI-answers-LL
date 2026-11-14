

import { useMemo, useRef, useState } from "react";
import { FileUp, ThumbsUp } from "lucide-react";
import { Button } from "@/vizibil/ui/button";
import { Card } from "@/vizibil/ui/card";
import { DOMAINS } from "@/vizibil/lib/criteria";
import { useL } from "@/vizibil/lib/i18n";
import { CATEGORY_ACTION, CATEGORY_LABEL, SAMPLE_REVIEWS, analyzeReviews } from "@/vizibil/lib/reviews";
import { saveReviews } from "@/vizibil/lib/store";
import type { TabProps } from "./common";

export function ReviewsTab({ state, patch }: TabProps) {
  const L = useL();
  const [text, setText] = useState(state.reviewsText);
  const file = useRef<HTMLInputElement>(null);
  const food = DOMAINS.find((d) => d.id === state.business?.domain)?.food ?? false;
  const label = (id: keyof typeof CATEGORY_LABEL) => L(CATEGORY_LABEL[id][food ? "food" : "other"]);
  const insights = useMemo(() => (state.reviewsText.trim() ? analyzeReviews(state.reviewsText) : null), [state.reviewsText]);

  function analyze(value = text) {
    const v = value.slice(0, 60000);
    patch({ reviewsText: v });
    saveReviews(v).catch(() => {});
  }

  return (
    <>
      <Card className="mt-6 p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight">{L("Recenziile tale", "Your reviews")}</h2>
        <p className="mt-1 text-sm text-stone-600">
          {L(
            "Lipește recenziile primite (Google Maps, site, Facebook), câte una pe linie. Poți pune nota în față: „2★ text”. Le grupăm pe teme și îți arătăm ce merită atenție.",
            "Paste the reviews you've received (Google Maps, your site, Facebook), one per line. You can put the rating first: “2★ text”. We group them by theme and show what deserves attention."
          )}
        </p>
        <textarea
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={60000}
          aria-label={L("Recenzii", "Reviews")}
          className="mt-4 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          placeholder={L("5★ Cafea excelentă, personal amabil\n2★ Am așteptat prea mult…", "5★ Great coffee, friendly staff\n2★ Waited too long…")}
        />
        <div className="mt-3 flex flex-wrap gap-3">
          <Button onClick={() => analyze()} disabled={!text.trim()}>{L("Analizează recenziile", "Analyse reviews")}</Button>
          <Button variant="outline" onClick={() => file.current?.click()}><FileUp className="h-4 w-4" />{L("Încarcă fișier .txt / .csv", "Upload .txt / .csv file")}</Button>
          <input
            ref={file}
            type="file"
            accept=".txt,.csv,text/plain,text/csv"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f || f.size > 500_000) return;
              const t = await f.text();
              setText(t);
              analyze(t);
              e.target.value = "";
            }}
          />
          <Button variant="ghost" onClick={() => { setText(SAMPLE_REVIEWS); analyze(SAMPLE_REVIEWS); }}>{L("Încarcă exemple fictive", "Load fictional examples")}</Button>
        </div>
      </Card>

      {insights && insights.total > 0 && (
        <>
          <Card className="mt-6 p-6">
            <p className="text-sm text-stone-700">
              {L(
                `Am citit ${insights.total} recenzii: ${insights.positive} pozitive, ${insights.negative} negative, restul neutre sau amestecate.`,
                `We read ${insights.total} reviews: ${insights.positive} positive, ${insights.negative} negative, the rest neutral or mixed.`
              )}
            </p>
            {insights.total < 10 && (
              <p className="mt-2 text-sm text-stone-500">
                {L("Sunt puține recenzii, așa că ia concluziile ca pe niște semnale, nu ca pe certitudini.", "That's a small number of reviews, so treat the conclusions as signals, not certainties.")}
              </p>
            )}
          </Card>

          <h2 className="mt-10 text-lg font-semibold tracking-tight">{L("Ce merită atenție mai întâi", "What deserves attention first")}</h2>
          <p className="mt-1 text-sm text-stone-600">
            {L("Nu trebuie rezolvat totul deodată. Ia-le pe rând, începând cu prima.", "You don't need to fix everything at once. Take them one at a time, starting from the top.")}
          </p>
          {insights.priorities.length === 0 ? (
            <Card className="mt-4 p-5 text-sm text-stone-600">{L("Nicio temă nu apare repetat în recenziile negative. Continuă ce faci.", "No theme comes up repeatedly in negative reviews. Keep doing what you're doing.")}</Card>
          ) : (
            <ol className="mt-4 space-y-3">
              {insights.priorities.slice(0, 3).map((c, i) => (
                <li key={c.id}>
                  <Card className="p-5">
                    <div className="flex items-start gap-4">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-semibold text-amber-900">{i + 1}</span>
                      <div className="min-w-0">
                        <h3 className="font-medium">{label(c.id)}</h3>
                        <p className="mt-0.5 text-sm text-stone-500">
                          {L(`${c.negative} din ${c.mentions} recenzii care ating tema sunt negative.`, `${c.negative} of the ${c.mentions} reviews touching this theme are negative.`)}
                        </p>
                        {c.examples.length > 0 && (
                          <ul className="mt-3 space-y-1 border-l-2 border-stone-200 pl-3 text-sm text-stone-600">
                            {c.examples.slice(0, 2).map((e) => <li key={e}>„{e}”</li>)}
                          </ul>
                        )}
                        <p className="mt-3 text-sm text-stone-800"><span className="font-medium">{L("Ce poți încerca: ", "What you can try: ")}</span>{L(CATEGORY_ACTION[c.id])}</p>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
          )}

          {insights.strengths.length > 0 && (
            <>
              <h2 className="mt-10 flex items-center gap-2 text-lg font-semibold tracking-tight"><ThumbsUp className="h-5 w-5 text-emerald-700" />{L("Ce le place clienților", "What customers like")}</h2>
              <Card className="mt-4 divide-y divide-stone-100 text-sm">
                {insights.strengths.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-5 py-3">
                    <span>{label(c.id)}</span>
                    <span className="text-emerald-800">{c.positive} {L("mențiuni pozitive", "positive mentions")}</span>
                  </div>
                ))}
              </Card>
            </>
          )}

          <h2 className="mt-10 text-lg font-semibold tracking-tight">{L("Toate temele", "All themes")}</h2>
          <Card className="mt-4 divide-y divide-stone-100 text-sm">
            {insights.categories.map((c) => (
              <div key={c.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{label(c.id)}</span>
                  <span className="text-stone-500">{c.mentions} {L("recenzii", "reviews")} · {c.positive} + · {c.negative} −</span>
                </div>
                <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-stone-200">
                  <div className="bg-emerald-600" style={{ width: `${(c.positive / c.mentions) * 100}%` }} />
                  <div className="ml-auto bg-amber-500" style={{ width: `${(c.negative / c.mentions) * 100}%` }} />
                </div>
              </div>
            ))}
          </Card>
        </>
      )}
    </>
  );
}
