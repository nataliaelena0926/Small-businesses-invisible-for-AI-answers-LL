import { Check, Globe, MapPin, Star, CreditCard, Users, Sparkles, TrendingUp, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { CRITERIA } from "@/lib/criteria";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PremiumDemos, type PremiumDemo } from "@/components/PremiumDemos";
import shopPhoto from "@/assets/business-site-preview.jpg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PremiumPreview({ name, industry, score }: { name: string; industry: string; score: number }) {
  const [activeDemo, setActiveDemo] = useState<PremiumDemo | null>(null);
  return <div className="mt-10 space-y-10">
    <section className="border-b border-border pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-primary">PREMIUM · SIMULATED RESULT</p><h2 className="mt-2 text-3xl font-bold">Your business, fully ready</h2></div>
        <p className="text-sm text-muted-foreground">Current score: {score}/100 → Preview: 100/100</p>
      </div>
      <p className="mt-3 max-w-2xl text-muted-foreground">Illustrative preview only. Your actual assessment is unchanged; no website, profile, payment service or CRM has been created.</p>
      <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {CRITERIA.map((c) => <div key={c.id} className="flex items-start gap-3"><Check className="mt-1 size-4 shrink-0 text-success" /><div><h3 className="font-medium">{c.title}</h3><p className="text-xs text-muted-foreground">Completed in preview · +{c.weight} pts</p></div></div>)}
      </div>
    </section>
    <section>
      <h2 className="text-2xl font-bold">Your digital presence</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <article className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3 text-sm text-muted-foreground"><Globe className="size-4" />Website preview</div>
          <div className="relative isolate overflow-hidden px-6 py-10 text-ink-foreground"><img src={shopPhoto} width={1280} height={720} loading="lazy" alt="Generated example of a welcoming local shop" className="absolute inset-0 -z-20 h-full w-full object-cover" /><div className="absolute inset-0 -z-10 bg-ink/65" /><p className="text-sm opacity-70">Your local {industry.toLowerCase()}</p><h3 className="mt-2 break-words text-3xl font-bold">{name}</h3><p className="mt-3 opacity-80">Local expertise. Personal service. A reason to come back.</p><span className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"><CreditCard className="size-4" />Online payments ready</span></div>
          <div className="flex flex-wrap gap-4 px-5 py-4 text-sm text-muted-foreground"><span>Mobile optimized</span><span>Secure domain</span><span>Professional email</span></div>
          <div className="px-5 pb-5"><Button variant="outline" className="w-full" onClick={() => setActiveDemo("website")}><Globe className="size-4" />Open website preview</Button></div>
        </article>
        <article className="rounded-lg border border-border bg-card p-6">
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4" />Business profile preview</p>
          <h3 className="mt-5 break-words text-2xl font-bold">{name}</h3><p className="mt-1 text-sm text-muted-foreground">{industry} · Local business</p>
          <p className="mt-4 flex items-center gap-2 text-warning"><Star className="size-4 fill-current" />4.9 <span className="text-sm text-muted-foreground">· 128 sample reviews</span></p>
          <p className="mt-4 flex items-center gap-2 text-sm text-success"><Check className="size-4" />Verified profile · Consistent business details</p>
          <blockquote className="mt-5 border-l-2 border-primary pl-4 text-sm text-muted-foreground">“Friendly service and a great local experience. I'd happily come back.”</blockquote>
          <p className="mt-3 text-xs text-muted-foreground">Sample rating and review, not actual customer feedback.</p>
          <Button variant="outline" className="mt-5 w-full" onClick={() => setActiveDemo("maps")}><MapPin className="size-4" />Open Google Maps preview</Button>
        </article>
      </div>
    </section>
    <section className="border-y border-border py-8">
      <h2 className="flex items-center gap-2 text-2xl font-bold"><Sparkles className="size-5 text-primary" />AI recommendation preview</h2>
      <p className="mt-5 text-sm text-muted-foreground">Sample question: “Which local {industry.toLowerCase()} should I try?”</p>
      <p className="mt-3 max-w-3xl text-lg">“Consider <strong>{name}</strong>: a local business with a verified profile, a mobile-friendly website, convenient payments and recent customer reviews.”</p>
      <p className="mt-3 text-xs text-muted-foreground">Illustrative answer, not a live AI search result or a guarantee of recommendations.</p>
    </section>
    <section>
      <h2 className="text-2xl font-bold">Your monthly Premium workspace</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Globe, title: "Website care", value: "Up to date", detail: "Mobile checks, content and security" },
          { icon: Users, title: "Customer CRM", value: "86 contacts", detail: "Sample customer list and follow-ups" },
          { icon: TrendingUp, title: "AI search trends", value: "12 opportunities", detail: "Sample local searches for your niche" },
          { icon: Star, title: "Review insights", value: "92% positive", detail: "Sample sentiment · service is a strength" },
        ].map((item) => <article key={item.title} className="rounded-lg border border-border bg-card p-5"><item.icon className="size-5 text-primary" /><h3 className="mt-4 text-sm text-muted-foreground">{item.title}</h3><p className="mt-1 text-xl font-bold">{item.value}</p><p className="mt-3 text-xs text-muted-foreground">{item.detail}</p>{item.title === "AI search trends" && <Button variant="outline" className="mt-4 w-full" onClick={() => setActiveDemo("trends")}><TrendingUp className="size-4" />View trends</Button>}</article>)}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">All workspace figures are sample data.</p>
    </section>
    <section className="border-t border-border pt-8" aria-label="Customer and employee feedback preview">
      <div className="flex items-center gap-2"><MessageSquare className="size-5 shrink-0 text-primary" /><h2 className="text-2xl font-bold">What people love — and what needs work</h2></div>
      <p className="mt-3 text-sm text-muted-foreground">Illustrative feedback themes for popular local businesses. These are fictional examples, not collected reviews or employee reports about {name} or any competitor.</p>
      <Tabs defaultValue="customers" className="mt-5">
        <TabsList className="flex h-auto w-fit max-w-full flex-wrap"><TabsTrigger value="customers">Customers</TabsTrigger><TabsTrigger value="employees">Employees at popular places</TabsTrigger></TabsList>
        {[
          { id: "customers", complaints: ["Long waits during busy periods", "Unclear prices or unexpected extras", "Inconsistent service when the venue is crowded"], positives: ["Friendly staff who remember regulars", "Reliable quality and good value", "A welcoming atmosphere and easy booking"], takeaway: "Make prices clear, set realistic waiting times and keep the personal welcome even when it gets busy." },
          { id: "employees", complaints: ["Too few staff during peak hours", "Last-minute shifts and missed breaks", "Pressure to serve quickly without enough support"], positives: ["Supportive teammates and approachable managers", "Predictable schedules and fair recognition", "Training, growth opportunities and positive customer feedback"], takeaway: "Plan peak-hour staffing, protect breaks and recognize the team behind a great customer experience." },
        ].map((group) => <TabsContent key={group.id} value={group.id} className="mt-5">
          <div className="grid gap-6 sm:grid-cols-2">
            <div><h3 className="flex items-center gap-2 font-semibold"><ThumbsDown className="size-4 text-destructive" />Common frustrations</h3><ul className="mt-3 space-y-3">{group.complaints.map((text) => <li key={text} className="border-l-2 border-destructive/40 pl-3 text-sm text-muted-foreground">{text}</li>)}</ul></div>
            <div><h3 className="flex items-center gap-2 font-semibold"><ThumbsUp className="size-4 text-success" />What people appreciate</h3><ul className="mt-3 space-y-3">{group.positives.map((text) => <li key={text} className="border-l-2 border-success/40 pl-3 text-sm text-muted-foreground">{text}</li>)}</ul></div>
          </div>
          <p className="mt-5 border-t border-border pt-4 text-sm"><span className="font-semibold text-primary">Opportunity for your business: </span>{group.takeaway}</p>
        </TabsContent>)}
      </Tabs>
    </section>
    <PremiumDemos active={activeDemo} onChange={setActiveDemo} name={name} industry={industry} />
  </div>;
}