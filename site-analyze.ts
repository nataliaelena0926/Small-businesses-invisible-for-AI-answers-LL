// @ts-nocheck -- imported unchanged from the Vizibil project, which compiled with looser index checks.
import { SITE_CHECKS } from "./site-checks";
import type { SiteAudit, SiteCheck } from "./types";

/** Analiza propriu-zisa: functie pura, primeste HTML-ul deja descarcat. */

const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"];
const GENERIC_TYPES = new Set(["website", "webpage", "breadcrumblist", "searchaction", "imageobject", "listitem", "sitenavigationelement"]);

const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function meta(html: string, key: string): string {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (new RegExp(`(?:name|property)\\s*=\\s*["']${key}["']`, "i").test(tag)) {
      return tag.match(/content\s*=\s*"([^"]*)"/i)?.[1] ?? tag.match(/content\s*=\s*'([^']*)'/i)?.[1] ?? "";
    }
  }
  return "";
}

function schemaInfo(html: string): { types: string[]; hasAddress: boolean; hasHours: boolean } {
  const types = new Set<string>();
  let hasAddress = false;
  let hasHours = false;
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (k === "@type") (Array.isArray(v) ? v : [v]).forEach((t) => typeof t === "string" && types.add(t));
      if (k === "address") hasAddress = true;
      if (k === "openingHours" || k === "openingHoursSpecification") hasHours = true;
      walk(v);
    }
  };
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      walk(JSON.parse(m[1]));
    } catch {
      /* bloc JSON-LD invalid: il ignoram */
    }
  }
  return { types: [...types], hasAddress, hasHours };
}

/** Robotii AI carora robots.txt le interzice tot site-ul. */
export function blockedAiBots(robots: string): string[] {
  const groups: { agents: string[]; disallow: string[] }[] = [];
  let cur: { agents: string[]; disallow: string[] } | null = null;
  let lastWasAgent = false;
  for (const raw of robots.split(/\r?\n/)) {
    const m = raw.split("#")[0].trim().match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === "user-agent") {
      if (!cur || !lastWasAgent) {
        cur = { agents: [], disallow: [] };
        groups.push(cur);
      }
      cur.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (key === "disallow" && cur) cur.disallow.push(value);
    }
  }
  return AI_BOTS.filter((bot) => {
    const g = groups.find((x) => x.agents.includes(bot.toLowerCase())) ?? groups.find((x) => x.agents.includes("*"));
    return g ? g.disallow.includes("/") : false;
  });
}

export function buildAudit(input: {
  url: string;
  html: string;
  ms: number;
  robots: string | null; // null = nu exista robots.txt
  hasSitemap: boolean;
  city: string;
}): SiteAudit {
  const { html, url } = input;
  const text = htmlToText(html);
  const title = htmlToText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const description = meta(html, "description");
  const schema = schemaInfo(html);
  const localTypes = schema.types.filter((t) => !GENERIC_TYPES.has(t.toLowerCase()));
  const blocked = input.robots ? blockedAiBots(input.robots) : [];
  const h1 = (html.match(/<h1\b/gi) ?? []).length;
  const city = plain(input.city.trim());

  const results: Record<string, { pass: boolean; detail?: string }> = {
    https: { pass: url.startsWith("https://") },
    speed: { pass: input.ms < 2000, detail: `${input.ms} ms` },
    title: { pass: title.length >= 10 && title.length <= 70, detail: title ? `„${title.slice(0, 90)}”` : undefined },
    description: { pass: description.length >= 50, detail: description ? `${description.length} car.` : undefined },
    viewport: { pass: meta(html, "viewport").includes("width") },
    h1: { pass: h1 >= 1, detail: h1 > 1 ? `${h1} × H1` : undefined },
    lang: { pass: /<html\b[^>]*\blang\s*=\s*["'][a-zA-Z-]{2,}/i.test(html) },
    schema: {
      pass: localTypes.length > 0 && (schema.hasAddress || localTypes.some((t) => /business|restaurant|cafe|store|shop|salon|bakery|bar/i.test(t))),
      detail: schema.types.length ? schema.types.slice(0, 5).join(", ") : undefined,
    },
    contact: { pass: /href\s*=\s*["']tel:/i.test(html) || /(?:\+?40|\b0)\s?[237]\d(?:[\s.-]?\d){7}\b/.test(text) },
    city: { pass: city.length >= 2 && plain(text + " " + title).includes(city), detail: input.city.trim() || undefined },
    hours: { pass: schema.hasHours || /\b(program|orar|opening hours|opening times|luni|monday|l\s?-\s?v|mon\s?-\s?fri)\b/i.test(text) },
    og: { pass: !!meta(html, "og:title") && !!meta(html, "og:image") },
    aiBots: { pass: blocked.length === 0, detail: blocked.length ? blocked.join(", ") : undefined },
    sitemap: { pass: input.hasSitemap },
  };

  const checks: SiteCheck[] = SITE_CHECKS.map((c) => ({ id: c.id, ...results[c.id] }));
  const score = SITE_CHECKS.reduce((s, c) => s + (results[c.id].pass ? c.weight : 0), 0);
  const clientRendered = isLikelyClientRendered(html, text);
  return { url, fetchedAt: new Date().toISOString(), ms: input.ms, title, score, checks, clientRendered };
}

/** Little readable text plus an app mount point or many scripts = probably built in the browser. */
export function isLikelyClientRendered(html: string, text: string): boolean {
  const words = text.split(/\s+/).filter(Boolean).length;
  const mount = /<div[^>]+id\s*=\s*["'](root|app|__next|__nuxt|svelte)["'][^>]*>\s*<\/div>/i.test(html);
  const scripts = (html.match(/<script\b/gi) ?? []).length;
  return words < 80 && (mount || scripts >= 3);
}
