

import { CalendarDays, Megaphone, Sparkles, Store } from "lucide-react";
import { Badge } from "@/vizibil/ui/badge";
import { Card } from "@/vizibil/ui/card";
import { useL, type Text } from "@/vizibil/lib/i18n";
import { marketingIdeas } from "@/vizibil/lib/marketing";
import type { TabProps } from "./common";

export function MarketingTab({ state }: TabProps) {
  const L = useL();
  const ideas = marketingIdeas(state.business!, state.profile!);

  const block = (icon: React.ReactNode, title: string, items: Text[]) =>
    items.length > 0 && (
      <>
        <h2 className="mt-10 flex items-center gap-2 text-lg font-semibold tracking-tight">{icon}{title}</h2>
        <Card className="mt-4 divide-y divide-stone-100">
          {items.map((t) => <p key={t.ro} className="px-5 py-4 text-sm text-stone-700">{L(t)}</p>)}
        </Card>
      </>
    );

  return (
    <>
      <p className="mt-6 text-sm text-stone-600">
        {L(
          "Idei alese după sezon, după nișa ta și după ce oferă magazinul. Ia una pe săptămână; nu e nevoie de buget ca să începi.",
          "Ideas picked by season, by your niche and by what your store offers. Take one a week; you don't need a budget to start."
        )}
      </p>
      {block(<CalendarDays className="h-5 w-5 text-emerald-700" />, L("De sezon", "In season"), ideas.seasonal)}
      {block(<Store className="h-5 w-5 text-emerald-700" />, L("Pentru nișa ta", "For your niche"), ideas.niche)}
      {block(<Sparkles className="h-5 w-5 text-emerald-700" />, L("Pornind de la ce oferi", "Based on what you offer"), ideas.yours)}

      <h2 className="mt-10 flex items-center gap-2 text-lg font-semibold tracking-tight"><Megaphone className="h-5 w-5 text-emerald-700" />{L("Idei de reclame, după buget", "Ad ideas, by budget")}</h2>
      <Card className="mt-4 divide-y divide-stone-100">
        {ideas.ads.map((a) => (
          <div key={a.budget.ro} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:gap-4">
            <Badge className="shrink-0 self-start">{L(a.budget)}</Badge>
            <p className="text-sm text-stone-700">{L(a.idea)}</p>
          </div>
        ))}
      </Card>
    </>
  );
}
