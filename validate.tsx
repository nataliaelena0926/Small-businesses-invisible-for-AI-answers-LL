import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/AppHeader";
import { INDUSTRIES, validateBusiness } from "@/lib/criteria";
import { lookupCompanyFn } from "@/lib/company.functions";
import { isCuiFormatValid } from "@/lib/company";
import { supabase } from "@/integrations/supabase/client";
import { GoogleBusinessConnect } from "@/components/GoogleBusinessConnect";

export const Route = createFileRoute("/_authenticated/validate")({
  head: () => ({ meta: [{ title: "Verify your business — Visibly" }, { name: "description", content: "Confirm your business details." }, { property: "og:title", content: "Verify your business — Visibly" }, { property: "og:description", content: "Confirm your business details." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ValidatePage,
});

function ValidatePage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [industry, setIndustry] = useState<string>("Cafe");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (taxId.trim() && !isCuiFormatValid(taxId)) {
      toast.error("Tax ID must be 2–10 digits, with or without the RO prefix.");
      return;
    }
    setLoading(true);
    const res = await validateBusiness(name, taxId || undefined);
    if (!res.ok) { setLoading(false); { toast.error(res.message); return; } }
    let message = res.message;
    if (taxId.trim()) {
      const anaf = await lookupCompanyFn({ data: { taxId } });
      if (anaf.status === "not_found") { setLoading(false); toast.error("This tax ID was not found in the ANAF public registry."); return; }
      if (anaf.status === "invalid") { setLoading(false); toast.error("That tax ID format doesn't look valid."); return; }
      if (anaf.status === "found") {
        if (anaf.inactive) { setLoading(false); toast.error(`${anaf.name} is listed as inactive in the ANAF registry.`); return; }
        message = `Verified in the ANAF public registry: ${anaf.name}.`;
      } else {
        message = "The ANAF registry is unreachable right now — business saved, tax ID not verified yet.";
      }
    }
    const { error } = await supabase.from("businesses").upsert(
      { user_id: user.id, name: name.trim(), tax_id: taxId || null, industry, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(message);
    navigate({ to: "/assessment" });
  }

  return (
    <div className="min-h-screen">
      <AppHeader step={0} />
      <main className="mx-auto max-w-xl px-6 py-14">
        <h1 className="text-4xl font-bold">Tell us about your business</h1>
        <p className="mt-2 text-muted-foreground">Register your business profile for the diagnostic. Official CUI verification in the ANAF registry is enabled when the site is published.</p>
        <form onSubmit={submit} className="mt-8 space-y-6 rounded-3xl border border-border bg-card p-8 shadow-soft">
          <GoogleBusinessConnect />
          <div className="space-y-2"><Label htmlFor="name">Business name</Label><Input id="name" required placeholder="e.g. Bean & Leaf Café" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="tax">Tax ID / VAT number <span className="text-muted-foreground">(optional)</span></Label><Input id="tax" placeholder="e.g. RO12345678" value={taxId} onChange={(e) => setTaxId(e.target.value)} />{taxId.trim() && !isCuiFormatValid(taxId) && <p className="text-xs text-destructive">Enter 2–10 digits, with or without the RO prefix.</p>}</div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <div className="grid grid-cols-2 gap-3">
              {INDUSTRIES.map((i) => (
                <Button variant="outline" type="button" key={i} onClick={() => setIndustry(i)}
                  className={`rounded-xl border p-4 text-left font-medium transition ${industry === i ? "border-primary bg-accent text-accent-foreground" : "border-border hover:border-primary/50"}`}>
                  {i}
                </Button>
              ))}
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? "Verifying business…" : "Verify & continue"}</Button>
        </form>
      </main>
    </div>
  );
}
