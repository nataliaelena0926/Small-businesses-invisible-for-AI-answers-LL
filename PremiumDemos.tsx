import { useState } from "react";
import { ArrowRight, Check, Clock, Globe, MapPin, Minus, Navigation, Plus, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import shopPhoto from "@/assets/business-site-preview.jpg";

export type PremiumDemo = "website" | "maps" | "trends";

function WebsiteDemo({ name, industry }: { name: string; industry: string }) {
  const [section, setSection] = useState("home");
  const [reserved, setReserved] = useState(false);
  return <div>
    <nav className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-4" aria-label="Sample website navigation">
      <span className="max-w-full break-words font-display text-xl font-bold">{name}</span>
      <div className="flex flex-wrap gap-1">{["home", "services", "visit"].map((item) => <Button key={item} size="sm" variant={section === item ? "default" : "ghost"} aria-pressed={section === item} onClick={() => setSection(item)}>{item === "home" ? "Home" : item === "services" ? "Services" : "Visit us"}</Button>)}</div>
    </nav>
    {section === "home" && <>
      <div className="relative isolate min-h-80 overflow-hidden">
        <img src={shopPhoto} alt="Illustrative sunlit local shop interior" width={1280} height={720} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-ink/65" />
        <div className="px-6 py-12 text-ink-foreground sm:px-10"><p className="text-sm">YOUR LOCAL {industry.toUpperCase()}</p><h2 className="mt-4 max-w-xl break-words text-4xl font-bold">{name}</h2><p className="mt-4 max-w-md text-lg">A personal touch. A place in your neighborhood. An experience worth coming back for.</p><Button className="mt-6" onClick={() => setSection("services")}>Explore our services <ArrowRight className="size-4" /></Button></div>
      </div>
      <section className="py-8"><h3 className="text-2xl font-bold">Made for our community</h3><p className="mt-3 max-w-2xl text-muted-foreground">Thoughtful service, local expertise and a warm welcome — whether it's your first visit or your fiftieth.</p><div className="mt-6 grid gap-4 sm:grid-cols-3">{["Personal service", "Easy online booking", "Trusted by locals"].map((item) => <div key={item} className="flex items-center gap-2"><Check className="size-4 text-primary" />{item}</div>)}</div></section>
    </>}
    {section === "services" && <section className="py-8"><h2 className="text-3xl font-bold">Something just for you</h2><p className="mt-2 text-muted-foreground">Sample services and prices for this demonstration.</p><div className="mt-6 grid gap-4 sm:grid-cols-3">{["First visit", "Signature experience", "Personal consultation"].map((item, i) => <article key={item} className="rounded-lg border border-border p-5"><h3 className="font-semibold">{item}</h3><p className="mt-2 text-2xl font-bold">€{[15, 35, 55][i]}</p><p className="mt-3 text-sm text-muted-foreground">Friendly, personalized {industry.toLowerCase()} service.</p><Button className="mt-5" variant="outline" onClick={() => setReserved(true)}>Book a visit</Button></article>)}</div>{reserved && <p role="status" className="mt-5 flex items-center gap-2 text-primary"><Check className="size-4" />Sample booking confirmed — no reservation or payment was made.</p>}</section>}
    {section === "visit" && <section className="py-8"><h2 className="text-3xl font-bold">We'd love to see you</h2><div className="mt-6 grid gap-6 sm:grid-cols-2"><div><h3 className="flex items-center gap-2 font-semibold"><MapPin className="size-4" />Find us</h3><p className="mt-2 text-muted-foreground">24 Market Lane, Example Town</p><p className="mt-4 text-sm text-muted-foreground">Sample address · Not a real business location</p></div><div><h3 className="flex items-center gap-2 font-semibold"><Clock className="size-4" />Opening hours</h3><p className="mt-2 text-muted-foreground">Monday–Friday · 09:00–18:00<br />Saturday · 10:00–16:00<br />Sunday · Closed</p><p className="mt-3 text-sm text-muted-foreground">Illustrative hours</p></div></div></section>}
    <footer className="flex flex-wrap justify-between gap-3 border-t border-border py-5 text-sm text-muted-foreground"><span className="break-words">{name} · Local business</span><span>Demonstration website · Generated photo</span></footer>
  </div>;
}

function MapsDemo({ name, industry, openWebsite }: { name: string; industry: string; openWebsite: () => void }) {
  const [zoom, setZoom] = useState(1);
  const [directions, setDirections] = useState(false);
  const [selected, setSelected] = useState(false);
  return <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
    <section className="min-w-0"><h2 className="break-words text-2xl font-bold">{name}</h2><p className="mt-2 flex items-center gap-2 text-warning"><Star className="size-4 fill-current" />4.9 <span className="text-sm text-muted-foreground">128 sample reviews</span></p><p className="mt-2 text-sm text-muted-foreground">{industry} · Verified in simulation</p>
      <div className="my-5 flex flex-wrap gap-2"><Button size="sm" onClick={() => setDirections(!directions)} aria-pressed={directions}><Navigation className="size-4" />Directions</Button><Button size="sm" variant="outline" onClick={openWebsite}><Globe className="size-4" />Website</Button></div>
      <Tabs defaultValue="overview"><TabsList className="w-full"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="reviews">Reviews</TabsTrigger><TabsTrigger value="photos">Photos</TabsTrigger></TabsList>
        <TabsContent value="overview" className="space-y-4 py-4 text-sm"><p className="flex items-start gap-2"><MapPin className="size-4 shrink-0 text-primary" />24 Market Lane, Example Town</p><p className="flex items-center gap-2"><Clock className="size-4 text-primary" />Open · Closes at 18:00</p><p className="text-muted-foreground">Example address and hours; this schematic is not a real Google Maps listing.</p></TabsContent>
        <TabsContent value="reviews" className="space-y-5 py-4">{["Wonderful service and such a welcoming team.", "A great local find. I'll definitely be back."].map((review, i) => <blockquote key={review} className="border-b border-border pb-4"><p className="text-sm font-medium">Sample customer {i + 1} · ★★★★★</p><p className="mt-2 text-sm text-muted-foreground">{review}</p></blockquote>)}</TabsContent>
        <TabsContent value="photos" className="py-4"><img src={shopPhoto} width={1280} height={720} loading="lazy" alt="Generated sample shop interior, not the actual business" className="aspect-video w-full rounded-lg object-cover" /><p className="mt-2 text-xs text-muted-foreground">Generated sample photo</p></TabsContent>
      </Tabs>
      {directions && <div role="status" className="border-t border-border pt-4"><h3 className="font-semibold">Sample walking route</h3><p className="mt-2 text-sm text-muted-foreground">Town Square → Market Lane → {name}</p><p className="mt-2 text-sm text-primary">6 min · 450 m · Fictional route</p></div>}
    </section>
    <div className="relative min-h-80 overflow-hidden rounded-lg border border-border bg-muted" aria-label="Fictional neighborhood map schematic">
      <svg viewBox="0 0 500 400" className="h-full min-h-80 w-full" aria-hidden="true"><g transform={`translate(250 200) scale(${zoom}) translate(-250 -200)`}>
        <path d="M0 0H500V400H0Z" className="fill-muted" /><path d="M20 30H160V130H20ZM320 230H480V370H320Z" className="fill-accent" />
        <path d="M0 175H500M230 0V400M0 310L500 70" className="stroke-card" fill="none" strokeWidth="24" />
        <path d="M0 175H500M230 0V400M0 310L500 70" className="stroke-border" fill="none" strokeWidth="1" />
        <text x="45" y="85" className="fill-muted-foreground" fontSize="14">Town Park</text><text x="340" y="320" className="fill-muted-foreground" fontSize="14">Community gardens</text><text x="280" y="165" className="fill-muted-foreground" fontSize="12">Market Lane</text><text x="35" y="280" className="fill-muted-foreground" fontSize="12">Town Square</text>
        {directions && <path d="M95 265L230 200V175H290" fill="none" className="stroke-primary" strokeWidth="6" strokeDasharray="9 5" />}
      </g></svg>
      <Button aria-label="Select sample business location" size="icon" onClick={() => setSelected(!selected)} className="absolute left-1/2 top-1/2 -translate-y-1/2 rounded-full"><MapPin className="size-5" /></Button>
      {selected && <div className="absolute left-4 right-16 top-4 rounded-md border border-border bg-card p-3 text-sm shadow-sm"><strong className="break-words">{name}</strong><p className="mt-1 text-muted-foreground">4.9 ★ · Sample location</p></div>}
      <div className="absolute right-3 top-3 grid gap-1"><Button size="icon" variant="outline" aria-label="Zoom in" disabled={zoom >= 1.6} onClick={() => setZoom(Math.min(1.6, zoom + 0.2))}><Plus className="size-4" /></Button><Button size="icon" variant="outline" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom(Math.max(1, zoom - 0.2))}><Minus className="size-4" /></Button></div>
      <p className="absolute bottom-3 left-3 rounded bg-card px-2 py-1 text-xs text-muted-foreground">Fictional map · No live Google data</p>
    </div>
  </div>;
}

function TrendsDemo({ industry }: { industry: string }) {
  const [period, setPeriod] = useState("month");
  const [selected, setSelected] = useState(0);
  const terms = [
    { query: `Best ${industry.toLowerCase()} near me`, growth: 38, action: "Keep your business category, services and location consistent across your website and business profile." },
    { query: `Highly rated local ${industry.toLowerCase()}`, growth: 27, action: "Invite recent customers to leave honest reviews and respond to their feedback." },
    { query: `${industry} open on weekends`, growth: 22, action: "Publish your actual weekend hours on your website and keep your profile hours up to date." },
    { query: `${industry} with online booking`, growth: 19, action: "Add a clear booking page and describe how customers can reserve or pay online." },
  ];
  const current = terms[selected];
  return <section><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-bold">What customers might ask AI</h2><p className="mt-2 text-sm text-muted-foreground">{industry} · Illustrative report, not measured search data</p></div><Tabs value={period} onValueChange={setPeriod}><TabsList><TabsTrigger value="month">30 days</TabsTrigger><TabsTrigger value="quarter">90 days</TabsTrigger></TabsList></Tabs></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-3">{[{label:"Sample search growth",value:period === "month" ? "+28%" : "+46%"},{label:"Topic opportunities",value:"12"},{label:"Priority topics",value:"4"}].map((item) => <div key={item.label} className="border-l-2 border-primary pl-4"><p className="text-sm text-muted-foreground">{item.label}</p><p className="mt-2 text-3xl font-bold">{item.value}</p></div>)}</div>
    <div className="mt-8 space-y-2">{terms.map((term, i) => <Button key={term.query} variant={selected === i ? "secondary" : "ghost"} className="h-auto w-full justify-between gap-4 whitespace-normal py-4 text-left" onClick={() => setSelected(i)} aria-pressed={selected === i}><span className="min-w-0"><span className="block font-medium">{term.query}</span><span className="mt-2 block h-1.5 w-40 max-w-full overflow-hidden rounded-full bg-muted"><span className={`block h-full bg-primary ${["w-full", "w-3/4", "w-2/3", "w-1/2"][i]}`} /></span></span><span className="flex shrink-0 items-center gap-1 text-primary"><TrendingUp className="size-4" />+{term.growth + (period === "quarter" ? 18 : 0)}%</span></Button>)}</div>
    {current && <div className="mt-6 border-t border-border pt-6"><p className="text-sm font-medium text-primary">SUGGESTED ACTION</p><h3 className="mt-2 text-xl font-bold">{current.query}</h3><p className="mt-3 text-muted-foreground">{current.action}</p></div>}
  </section>;
}

export function PremiumDemos({ active, onChange, name, industry }: { active: PremiumDemo | null; onChange: (demo: PremiumDemo | null) => void; name: string; industry: string }) {
  const title = active === "website" ? "Your finished website" : active === "maps" ? "Google Maps profile simulation" : "AI search trends";
  return <Dialog open={active !== null} onOpenChange={(open) => { if (!open) onChange(null); }}><DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto p-5 sm:p-8"><DialogHeader className="pr-6"><DialogTitle>{title}</DialogTitle><DialogDescription>Premium interactive simulation · Sample content only</DialogDescription></DialogHeader>{active === "website" && <WebsiteDemo name={name} industry={industry} />}{active === "maps" && <MapsDemo name={name} industry={industry} openWebsite={() => onChange("website")} />}{active === "trends" && <TrendsDemo industry={industry} />}</DialogContent></Dialog>;
}