import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { parseCui } from "@/lib/company";

/** Looks up a Romanian CUI in ANAF's public VAT registry service. */
export const lookupCompanyFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { taxId: string }) => ({ taxId: String(d?.taxId ?? "").slice(0, 20) }))
  .handler(async ({ data }) => {
    const cui = parseCui(data.taxId);
    if (cui === null) return { status: "invalid" as const };
    try {
      const res = await fetch("https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{ cui, data: new Date().toISOString().slice(0, 10) }]),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return { status: "unavailable" as const };
      const json: any = await res.json();
      const found = json?.found?.[0];
      if (!found) return { status: "not_found" as const };
      const g = found.date_generale ?? {};
      const inactive = found.stare_inactiv?.statusInactivi === true;
      return { status: "found" as const, name: String(g.denumire ?? ""), address: String(g.adresa ?? ""), inactive };
    } catch {
      return { status: "unavailable" as const };
    }
  });
