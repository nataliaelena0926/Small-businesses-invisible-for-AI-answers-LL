

import { useMemo, useState } from "react";
import { strToU8, zipSync } from "fflate";
import { Bot, Check, Download, ExternalLink, Loader2, Monitor, Plus, Save, Smartphone, Trash2, Wand2 } from "lucide-react";
import { Badge } from "@/vizibil/ui/badge";
import { Button } from "@/vizibil/ui/button";
import { Card } from "@/vizibil/ui/card";
import { Input, Label } from "@/vizibil/ui/input";
import { FEATURES } from "@/vizibil/lib/criteria";
import { FEATURE_SHORT } from "@/vizibil/lib/features-short";
import { useL } from "@/vizibil/lib/i18n";
import { hasAccess } from "@/vizibil/lib/plans";
import { buildAudit } from "@/vizibil/lib/site-analyze";
import { SITE_CHECKS } from "@/vizibil/lib/site-checks";
import { ACCENTS, DAYS, buildAdditions, defaultDescription, domainLabel, emptySiteInfo, generateSite, hoursLines } from "@/vizibil/lib/site-generator";
import { saveSiteInfo } from "@/vizibil/lib/store";
import { siteCopyFn } from "@/vizibil/site.functions";
import type { SiteInfo } from "@/vizibil/lib/types";
import { cn } from "@/lib/utils";
import { CodeBlock, type TabProps } from "./common";

const area = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600";

export function SiteTab({ state, patch }: TabProps) {
  const L = useL();
  const business = state.business!;
  const profile = state.profile!;
  const hasSite = !!state.siteAudit;
  const failed = state.siteAudit?.checks.filter((c) => !c.pass).map((c) => c.id) ?? [];

  const [info, setInfo] = useState<SiteInfo>(() => state.siteInfo ?? { ...emptySiteInfo(), publishUrl: state.websiteUrl ?? "" });
  const [showBuilder, setShowBuilder] = useState(!hasSite);
  const [mobile, setMobile] = useState(false);
  const [saved, setSaved] = useState<"idle" | "busy" | "done">("idle");
  const [ai, setAi] = useState<"idle" | "busy" | "off" | "error" | "ok">("idle");
  const [request, setRequest] = useState("");

  const set = <K extends keyof SiteInfo>(k: K, v: SiteInfo[K]) => {
    setInfo((i) => ({ ...i, [k]: v }));
    setSaved("idle");
  };

  const site = useMemo(() => generateSite(business, profile, info), [business, profile, info]);
  const additions = useMemo(() => buildAdditions(business, profile, info, failed), [business, profile, info, failed.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
  // Scorul pe care l-ar primi site-ul generat la propria noastra analiza, odata publicat pe HTTPS.
  const estimate = useMemo(
    () => buildAudit({ url: info.publishUrl.startsWith("http://") ? info.publishUrl : "https://site.ro/", html: site.html, ms: 300, robots: site.robots, hasSitemap: !!site.sitemap, city: profile.city }),
    [site, info.publishUrl, profile.city]
  );
  const missing = SITE_CHECKS.filter((m) => estimate.checks.some((c) => c.id === m.id && !c.pass));

  async function save() {
    setSaved("busy");
    await saveSiteInfo(info).catch(() => {});
    patch({ siteInfo: info });
    setSaved("done");
  }

  function download() {
    const files: Record<string, Uint8Array> = { "index.html": strToU8(site.html), "robots.txt": strToU8(site.robots) };
    if (site.sitemap) files["sitemap.xml"] = strToU8(site.sitemap);
    const blob = new Blob([zipSync(files) as BlobPart], { type: "application/zip" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "site.zip";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    save();
  }

  function openTab() {
    const url = URL.createObjectURL(new Blob([site.html], { type: "text/html" }));
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  async function askAi(instruction: string) {
    setAi("busy");
    try {
      const facts = [
        `Name: ${profile.storeName}`,
        `Type: ${domainLabel(business, "en")}`,
        `City: ${profile.city}`,
        `Address: ${profile.address}`,
        `Offers: ${FEATURES.filter((f) => profile.features[f.id]).map((f) => FEATURE_SHORT[f.id]?.en).join(", ") || "-"}`,
        `Products/services: ${info.services.filter((s) => s.name.trim()).map((s) => s.name.trim()).join(", ") || "-"}`,
        `Opening hours: ${hoursLines({ ...info, lang: "en" }).map((l) => `${l.day} ${l.text}`).join("; ") || "-"}`,
      ];
      const data: { configured: boolean; tagline?: string; description?: string } = await siteCopyFn({ data: { lang: info.lang, facts, tagline: info.tagline, description: info.description || defaultDescription(business, profile, info.lang), instruction } });
      if (data.configured === false) return setAi("off");
      if (!data.description) return setAi("error");
      setInfo((i) => ({ ...i, tagline: data.tagline || i.tagline, description: data.description ?? i.description }));
      setSaved("idle");
      setAi("ok");
    } catch {
      setAi("error");
    }
  }

  const canRework = hasAccess(state.plan, "complete");

  return (
    <>
      {hasSite && (
        <Card className="mt-6 p-6 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight">{L("Completări pentru site-ul tău existent", "Additions for your existing site")}</h2>
          <p className="mt-1 text-sm text-stone-600">
            {L(
              "Nu ștergem și nu înlocuim nimic din site-ul tău. Mai jos este doar ce îi lipsește, generat din informațiile magazinului, gata de adăugat.",
              "We don't delete or replace anything on your site. Below is only what it's missing, generated from your store details, ready to add."
            )}
          </p>
          <p className="mt-2 text-xs text-stone-500">{state.siteAudit!.url} · {failed.length} {L("lipsuri găsite", "gaps found")}</p>
          {!additions.head && !additions.body && !additions.notes.length && !additions.robots ? (
            <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{L("Site-ul are deja tot ce verificăm.", "Your site already has everything we check.")}</p>
          ) : (
            <>
              {additions.head && <CodeBlock title={L("De adăugat în <head>", "Add inside <head>")} code={additions.head} hint={L("Titlu, descriere, date schema.org — ce citesc motoarele de căutare și asistenții AI.", "Title, description, schema.org data — what search engines and AI assistants read.")} />}
              {additions.body && <CodeBlock title={L("De adăugat în pagină", "Add to the page")} code={additions.body} hint={L("Informații care trebuie să fie vizibile ca text.", "Information that should be visible as text.")} />}
              {additions.robots && <CodeBlock title="robots.txt" code={additions.robots} hint={L("Înlocuiește regulile care blochează roboții AI.", "Replace the rules that block AI crawlers.")} />}
              {additions.sitemap && <CodeBlock title="sitemap.xml" code={additions.sitemap} />}
              {additions.notes.length > 0 && (
                <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-stone-700">{additions.notes.map((n) => <li key={n}>{n}</li>)}</ul>
              )}
            </>
          )}
          <p className="mt-5 text-xs text-stone-500">
            {L("Completează programul și descrierea mai jos ca să apară și ele în cod.", "Fill in the hours and description below so they appear in the code too.")}
          </p>
          {!showBuilder && (
            <Button variant="outline" className="mt-5" onClick={() => setShowBuilder(true)}>
              {L("Completează informațiile / generează un site nou", "Fill in details / generate a new site")}
            </Button>
          )}
        </Card>
      )}

      {showBuilder && (
        <>
          <Card className="mt-6 p-6 sm:p-8">
            <h2 className="text-lg font-semibold tracking-tight">{L("Informații pentru site", "Website details")}</h2>
            <p className="mt-1 text-sm text-stone-600">
              {L(
                "Numele, adresa, telefonul și facilitățile vin din profilul magazinului. Aici adaugi restul. Pe site apare doar ce completezi tu — nu inventăm nimic.",
                "Name, address, phone and amenities come from your store profile. Add the rest here. Only what you fill in appears on the site — we invent nothing."
              )}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Label htmlFor="tagline">{L("Slogan (o propoziție)", "Tagline (one sentence)")}</Label>
                <Input id="tagline" value={info.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={120} placeholder={L("ex. Cafea de specialitate și prăjituri de casă", "e.g. Specialty coffee and homemade cakes")} />
              </div>
              <div>
                <Label htmlFor="lang">{L("Limba site-ului", "Site language")}</Label>
                <select id="lang" value={info.lang} onChange={(e) => set("lang", e.target.value as SiteInfo["lang"])} className={cn(area, "h-11")}>
                  <option value="ro">Română</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <Label htmlFor="desc" className="mb-0">{L("Descriere: ce oferi și ce te deosebește", "Description: what you offer and what sets you apart")}</Label>
                <Button size="sm" variant="outline" onClick={() => askAi("")} disabled={ai === "busy"}>
                  {ai === "busy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  {L("Scrie cu AI", "Write with AI")}
                </Button>
              </div>
              <textarea id="desc" rows={4} value={info.description} onChange={(e) => set("description", e.target.value)} maxLength={800} className={cn(area, "mt-1.5")} placeholder={defaultDescription(business, profile, info.lang)} />
              <p className="mt-1 text-xs text-stone-500">{L("Dacă o lași goală, folosim textul gri de mai sus, scris doar din datele tale.", "If left empty, we use the grey text above, written only from your data.")}</p>
              {ai === "off" && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  {L("Agentul AI nu este configurat (lipsește ANTHROPIC_API_KEY din .env.local). Site-ul se generează și fără el, din datele completate.", "The AI agent isn't configured (ANTHROPIC_API_KEY is missing from .env.local). The site is generated without it, from the data you fill in.")}
                </p>
              )}
              {ai === "error" && <p role="alert" className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{L("Agentul nu a putut răspunde. Încearcă din nou.", "The agent couldn't respond. Please try again.")}</p>}
              {ai === "ok" && <p className="mt-2 text-xs text-emerald-800">{L("Textele au fost actualizate. Verifică-le înainte să salvezi.", "The texts were updated. Review them before saving.")}</p>}
            </div>

            <div className="mt-6">
              <Label>{["cafe", "restaurant"].includes(business.domain) ? L("Meniu (produs și preț)", "Menu (item and price)") : L("Servicii sau produse (și preț, dacă e public)", "Services or products (and price, if public)")}</Label>
              <div className="space-y-2">
                {info.services.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={s.name} maxLength={80} placeholder={L("Denumire", "Name")} onChange={(e) => set("services", info.services.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                    <Input value={s.price} maxLength={30} placeholder={L("Preț, ex. 14 lei", "Price, e.g. 14 lei")} className="w-40 shrink-0" onChange={(e) => set("services", info.services.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} />
                    <Button variant="ghost" size="sm" className="h-11 shrink-0" aria-label={L("Șterge rândul", "Remove row")} onClick={() => set("services", info.services.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {info.services.length < 20 && (
                <Button variant="outline" size="sm" className="mt-2" onClick={() => set("services", [...info.services, { name: "", price: "" }])}>
                  <Plus className="h-4 w-4" />{L("Adaugă", "Add")}
                </Button>
              )}
            </div>

            <div className="mt-6">
              <Label>{L("Program", "Opening hours")}</Label>
              <div className="divide-y divide-stone-100 rounded-lg border border-stone-200">
                {DAYS.map((d) => {
                  const h = info.hours[d.id] ?? { open: "", close: "", closed: false };
                  const upd = (p: Partial<typeof h>) => set("hours", { ...info.hours, [d.id]: { ...h, ...p } });
                  return (
                    <div key={d.id} className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
                      <span className="w-24">{L(d.ro, d.en)}</span>
                      <input type="time" value={h.open} disabled={h.closed} onChange={(e) => upd({ open: e.target.value })} aria-label={`${L(d.ro, d.en)} ${L("deschidere", "opens")}`} className="rounded-md border border-stone-300 px-2 py-1 disabled:opacity-40" />
                      <span className="text-stone-400">–</span>
                      <input type="time" value={h.close} disabled={h.closed} onChange={(e) => upd({ close: e.target.value })} aria-label={`${L(d.ro, d.en)} ${L("închidere", "closes")}`} className="rounded-md border border-stone-300 px-2 py-1 disabled:opacity-40" />
                      <label className="ml-auto flex items-center gap-1.5 text-stone-600">
                        <input type="checkbox" checked={h.closed} onChange={(e) => upd({ closed: e.target.checked })} className="h-4 w-4 accent-emerald-700" />
                        {L("Închis", "Closed")}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email <span className="font-normal text-stone-500">({L("opțional", "optional")})</span></Label>
                <Input id="email" type="email" value={info.email} onChange={(e) => set("email", e.target.value)} maxLength={120} />
              </div>
              <div>
                <Label htmlFor="img">{L("Link către o fotografie a ta", "Link to a photo of yours")} <span className="font-normal text-stone-500">({L("opțional", "optional")})</span></Label>
                <Input id="img" value={info.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} maxLength={300} placeholder="https://…" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="pub">{L("Adresa la care va fi publicat site-ul", "Address where the site will be published")} <span className="font-normal text-stone-500">({L("opțional", "optional")})</span></Label>
                <Input id="pub" value={info.publishUrl} onChange={(e) => set("publishUrl", e.target.value)} maxLength={300} placeholder="https://numefirma.ro" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-6">
              <div>
                <Label>{L("Stil", "Style")}</Label>
                <div className="flex rounded-lg border border-stone-300 p-0.5 text-sm">
                  {(["light", "warm", "dark"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => set("style", s)} aria-pressed={info.style === s} className={cn("rounded-md px-3 py-1.5", info.style === s ? "bg-stone-900 text-white" : "text-stone-600")}>
                      {s === "light" ? L("Luminos", "Light") : s === "warm" ? L("Cald", "Warm") : L("Întunecat", "Dark")}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>{L("Culoare", "Colour")}</Label>
                <div className="flex gap-2">
                  {ACCENTS.map((c) => (
                    <button key={c} type="button" onClick={() => set("accent", c)} aria-label={c} aria-pressed={info.accent === c} style={{ background: c }} className={cn("h-8 w-8 rounded-full ring-offset-2", info.accent === c && "ring-2 ring-stone-900")} />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="mt-6 p-6 sm:p-8">
            <h3 className="flex items-center gap-2 font-semibold"><Bot className="h-4 w-4 text-emerald-700" />{L("Îmbunătățire cu AI, după cerința ta", "AI improvement, from your request")}</h3>
            {canRework ? (
              <>
                <p className="mt-1 text-sm text-stone-600">
                  {L("Spune ce vrei schimbat la texte. Agentul doar îmbunătățește formularea: nu scoate informații și nu inventează altele.", "Say what you'd like changed in the texts. The agent only improves the wording: it removes nothing and invents nothing.")}
                </p>
                <textarea rows={2} value={request} onChange={(e) => setRequest(e.target.value)} maxLength={600} className={cn(area, "mt-3")} placeholder={L("ex. Fă tonul mai prietenos și pune accent pe faptul că suntem pet friendly", "e.g. Make the tone friendlier and emphasise that we're pet friendly")} />
                <Button className="mt-3" variant="outline" disabled={!request.trim() || ai === "busy"} onClick={() => askAi(request.trim())}>
                  {ai === "busy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  {L("Îmbunătățește site-ul", "Improve the site")}
                </Button>
              </>
            ) : (
              <p className="mt-1 text-sm text-stone-600">{L("Disponibil în abonamentul Complet: ceri în cuvintele tale ce să se schimbe, de câte ori vrei.", "Available in the Complete subscription: ask in your own words for changes, as often as you like.")}</p>
            )}
          </Card>

          <Card className="mt-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 p-4">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold tracking-tight">{L("Previzualizare", "Preview")}</h2>
                <Badge tone={estimate.score >= 90 ? "green" : "amber"}>{L("Scor tehnic estimat: ", "Estimated technical score: ")}{estimate.score}/100</Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-stone-300 p-0.5">
                  <button type="button" onClick={() => setMobile(false)} aria-pressed={!mobile} aria-label="Desktop" className={cn("rounded-md p-1.5", !mobile && "bg-stone-900 text-white")}><Monitor className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setMobile(true)} aria-pressed={mobile} aria-label={L("Mobil", "Mobile")} className={cn("rounded-md p-1.5", mobile && "bg-stone-900 text-white")}><Smartphone className="h-4 w-4" /></button>
                </div>
                <Button size="sm" variant="outline" onClick={openTab}><ExternalLink className="h-4 w-4" />{L("Tab nou", "New tab")}</Button>
              </div>
            </div>
            <div className="bg-stone-100 p-4">
              <iframe title={L("Previzualizarea site-ului", "Site preview")} sandbox="" srcDoc={site.html} className={cn("mx-auto block h-[640px] rounded-lg border border-stone-200 bg-white", mobile ? "w-[390px] max-w-full" : "w-full")} />
            </div>
            <div className="border-t border-stone-200 p-5">
              {missing.length > 0 && (
                <p className="mb-4 text-sm text-stone-600">
                  <span className="font-medium text-stone-900">{L("Ca să ajungă la 100: ", "To reach 100: ")}</span>
                  {missing.map((m) => (m.id === "og" ? L("adaugă linkul unei fotografii", "add a photo link") : m.id === "sitemap" ? L("completează adresa de publicare", "fill in the publishing address") : m.id === "hours" ? L("completează programul", "fill in the opening hours") : m.id === "contact" ? L("adaugă telefonul în profilul magazinului", "add the phone number to your store profile") : L(m.title))).join(" · ")}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <Button onClick={download}><Download className="h-4 w-4" />{L("Descarcă site-ul (.zip)", "Download the site (.zip)")}</Button>
                <Button variant="outline" onClick={save} disabled={saved === "busy"}>
                  {saved === "busy" ? <Loader2 className="h-4 w-4 animate-spin" /> : saved === "done" ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved === "done" ? L("Salvat", "Saved") : L("Salvează modificările", "Save changes")}
                </Button>
              </div>
              <p className="mt-3 text-xs text-stone-500">
                {L(
                  "Arhiva conține index.html, robots.txt și sitemap.xml. O urci la orice firmă de hosting, apoi pui adresa în Diagnostic ca să-i verificăm scorul real.",
                  "The archive contains index.html, robots.txt and sitemap.xml. Upload it to any web host, then enter the address in Diagnostic so we can check its real score."
                )}
              </p>
            </div>
          </Card>
        </>
      )}
    </>
  );
}
