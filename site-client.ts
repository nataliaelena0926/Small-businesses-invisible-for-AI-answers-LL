import { analyzeSiteFn } from "@/vizibil/site.functions";
import type { SiteAudit } from "./types";

export type AnalyzeError = "invalid_url" | "blocked" | "unreachable" | "not_html" | "unauthorized" | "no_plan" | "unknown";

export async function analyzeSite(url: string, city: string): Promise<{ audit?: SiteAudit; error?: AnalyzeError }> {
  try {
    const data = await analyzeSiteFn({ data: { url, city } });
    if (data.audit) return { audit: data.audit as SiteAudit };
    return { error: (data.error as AnalyzeError) ?? "unknown" };
  } catch {
    return { error: "unknown" };
  }
}

export function analyzeErrorText(e: AnalyzeError, L: (ro: string, en: string) => string): string {
  switch (e) {
    case "invalid_url": return L("Adresa nu pare validă. Exemplu: cafeneamea.ro", "The address doesn't look valid. Example: mycafe.com");
    case "blocked": return L("Această adresă nu poate fi analizată.", "This address cannot be analysed.");
    case "unreachable": return L("Nu am putut deschide site-ul. Verifică adresa și că site-ul este online.", "We couldn't open the site. Check the address and that the site is online.");
    case "not_html": return L("Adresa nu duce la o pagină web.", "The address doesn't lead to a web page.");
    case "unauthorized": return L("Sesiunea a expirat. Intră din nou în cont.", "Your session expired. Please log in again.");
    case "no_plan": return L("Verificarea site-ului este inclusă în pachetele plătite.", "Website checks are included in paid packages.");
    default: return L("Analiza nu a reușit. Încearcă din nou.", "The analysis failed. Please try again.");
  }
}
