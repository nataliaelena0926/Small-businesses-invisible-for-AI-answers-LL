import { buildSchema, emptySiteInfo } from "./site-generator";
import type { Business, Profile, SiteInfo } from "./types";

/** Bloc JSON-LD (schema.org) gata de lipit in <head>, generat din profilul magazinului. */
export function buildJsonLd(business: Business, profile: Profile, websiteUrl: string | null, info?: SiteInfo | null): string {
  const base = info ?? emptySiteInfo();
  const data = buildSchema(business, profile, { ...base, publishUrl: base.publishUrl || websiteUrl || "" });
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2).replace(/</g, "\\u003c")}\n</script>`;
}
