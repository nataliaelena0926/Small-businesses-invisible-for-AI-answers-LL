// @ts-nocheck -- imported unchanged from the Vizibil project, which compiled with looser index checks.
import { DOMAINS, FEATURES } from "./criteria";
import { FEATURE_SHORT } from "./features-short";
import type { Business, DayHours, Profile, SiteInfo } from "./types";

/**
 * Generatorul de site: functie determinista (sablon + faptele confirmate de proprietar).
 * Nu inventeaza nimic: o sectiune apare doar daca proprietarul a completat datele ei.
 * AI-ul, cand e configurat, scrie doar textele (slogan, descriere), niciodata codul.
 */

export const ACCENTS = ["#047857", "#1d4ed8", "#b45309", "#be123c", "#6d28d9"];

export const DAYS: { id: string; ro: string; en: string; schema: string }[] = [
  { id: "mon", ro: "Luni", en: "Monday", schema: "Monday" },
  { id: "tue", ro: "Marți", en: "Tuesday", schema: "Tuesday" },
  { id: "wed", ro: "Miercuri", en: "Wednesday", schema: "Wednesday" },
  { id: "thu", ro: "Joi", en: "Thursday", schema: "Thursday" },
  { id: "fri", ro: "Vineri", en: "Friday", schema: "Friday" },
  { id: "sat", ro: "Sâmbătă", en: "Saturday", schema: "Saturday" },
  { id: "sun", ro: "Duminică", en: "Sunday", schema: "Sunday" },
];

export function emptySiteInfo(): SiteInfo {
  return {
    lang: "ro",
    tagline: "",
    description: "",
    services: [],
    hours: Object.fromEntries(DAYS.map((d) => [d.id, { open: "", close: "", closed: false }])),
    email: "",
    imageUrl: "",
    publishUrl: "",
    accent: ACCENTS[0],
    style: "light",
  };
}

const SCHEMA_TYPE: Record<string, string> = {
  cafe: "CafeOrCoffeeShop",
  restaurant: "Restaurant",
  secondhand: "Store",
  retail: "Store",
  beauty: "BeautySalon",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const safeHttpUrl = (u: string): string => {
  try {
    const x = new URL(u.trim());
    return x.protocol === "https:" || x.protocol === "http:" ? x.href : "";
  } catch {
    return "";
  }
};
const safeColor = (c: string) => (/^#[0-9a-fA-F]{6}$/.test(c) ? c : ACCENTS[0]);
const isTime = (t: string) => /^\d{2}:\d{2}$/.test(t);
const dayOk = (h?: DayHours) => !!h && (h.closed || (isTime(h.open) && isTime(h.close)));
/** JSON sigur de pus intr-un <script>: fara "</script>" posibil. */
const jsonForScript = (v: unknown) => JSON.stringify(v, null, 2).replace(/</g, "\\u003c");

export function domainLabel(business: Business, lang: "ro" | "en"): string {
  const d = DOMAINS.find((x) => x.id === business.domain);
  return d && d.id !== "other" ? d.label[lang] : lang === "ro" ? "Afacere locală" : "Local business";
}

/** Descriere scrisa doar din fapte confirmate, folosita cand proprietarul nu a scris una. */
export function defaultDescription(business: Business, profile: Profile, lang: "ro" | "en"): string {
  const offers = FEATURES.filter((f) => profile.features[f.id]).map((f) => FEATURE_SHORT[f.id][lang].toLowerCase());
  const kind = domainLabel(business, lang).toLowerCase();
  if (lang === "ro") {
    const base = `${profile.storeName} — ${kind} în ${profile.city}, ${profile.address}.`;
    return offers.length ? `${base} Oferim: ${offers.join(", ")}.` : base;
  }
  const base = `${profile.storeName} — ${kind} in ${profile.city}, ${profile.address}.`;
  return offers.length ? `${base} We offer: ${offers.join(", ")}.` : base;
}

export function hoursLines(info: SiteInfo): { day: string; schema: string; text: string; h: DayHours }[] {
  return DAYS.filter((d) => dayOk(info.hours[d.id])).map((d) => {
    const h = info.hours[d.id];
    return {
      day: d[info.lang],
      schema: d.schema,
      h,
      text: h.closed ? (info.lang === "ro" ? "Închis" : "Closed") : `${h.open} – ${h.close}`,
    };
  });
}

function faq(profile: Profile, info: SiteInfo): { q: string; a: string }[] {
  const ro = info.lang === "ro";
  const items: { q: string; a: string }[] = [
    { q: ro ? "Unde vă găsim?" : "Where can we find you?", a: `${profile.address}, ${profile.city}.` },
  ];
  const hours = hoursLines(info);
  if (hours.length) {
    items.push({
      q: ro ? "Care este programul?" : "What are your opening hours?",
      a: hours.map((l) => `${l.day}: ${l.text}`).join("; ") + ".",
    });
  }
  for (const f of FEATURES) {
    const v = profile.features[f.id];
    if (v === undefined) continue;
    items.push({ q: f.label[info.lang], a: v ? (ro ? "Da." : "Yes.") : ro ? "Nu." : "No." });
  }
  return items;
}

export function buildSchema(business: Business, profile: Profile, info: SiteInfo): Record<string, unknown> {
  const url = safeHttpUrl(info.publishUrl);
  const image = safeHttpUrl(info.imageUrl);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPE[business.domain] ?? "LocalBusiness",
    name: profile.storeName,
    description: (info.description.trim() || defaultDescription(business, profile, info.lang)).slice(0, 500),
    address: {
      "@type": "PostalAddress",
      streetAddress: profile.address,
      addressLocality: profile.city,
      addressCountry: "RO",
    },
  };
  if (url) data.url = url;
  if (image) data.image = image;
  if (profile.phone) data.telephone = profile.phone;
  if (info.email.trim()) data.email = info.email.trim();
  const spec = hoursLines(info)
    .filter((l) => !l.h.closed)
    .map((l) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: l.schema, opens: l.h.open, closes: l.h.close }));
  if (spec.length) data.openingHoursSpecification = spec;
  const amenities = FEATURES.filter((f) => profile.features[f.id] !== undefined).map((f) => ({
    "@type": "LocationFeatureSpecification",
    name: FEATURE_SHORT[f.id].en,
    value: profile.features[f.id],
  }));
  if (amenities.length) data.amenityFeature = amenities;
  return data;
}

const THEMES: Record<SiteInfo["style"], string> = {
  light: "--bg:#ffffff;--fg:#1c1917;--muted:#57534e;--card:#f5f5f4;--line:#e7e5e4;--head:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",
  warm: "--bg:#fbf7f0;--fg:#292524;--muted:#6b5f55;--card:#f3ebdd;--line:#e6dccb;--head:Georgia,'Times New Roman',serif",
  dark: "--bg:#0c0a09;--fg:#fafaf9;--muted:#a8a29e;--card:#1c1917;--line:#292524;--head:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",
};

export interface GeneratedSite {
  html: string;
  robots: string;
  sitemap: string | null; // null daca nu se stie inca adresa de publicare
  title: string;
  description: string;
}

export function generateSite(business: Business, profile: Profile, info: SiteInfo): GeneratedSite {
  const ro = info.lang === "ro";
  const name = profile.storeName;
  const kind = domainLabel(business, info.lang);
  const url = safeHttpUrl(info.publishUrl);
  const image = safeHttpUrl(info.imageUrl);
  const about = info.description.trim() || defaultDescription(business, profile, info.lang);
  const tagline = info.tagline.trim() || `${kind} ${ro ? "în" : "in"} ${profile.city}`;
  const title = `${name} — ${kind} ${ro ? "în" : "in"} ${profile.city}`.slice(0, 70);
  const description = (about.length > 155 ? about.slice(0, 152).replace(/\s+\S*$/, "") + "…" : about).replace(/\s+/g, " ");
  const services = info.services.filter((s) => s.name.trim());
  const offers = FEATURES.filter((f) => profile.features[f.id]).map((f) => FEATURE_SHORT[f.id][info.lang]);
  const hours = hoursLines(info);
  const faqs = faq(profile, info);
  const phoneHref = profile.phone.replace(/[^\d+]/g, "");
  const email = info.email.trim();
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${profile.address}, ${profile.city}`)}`;
  const t = {
    about: ro ? "Despre noi" : "About us",
    services: ["cafe", "restaurant"].includes(business.domain) ? (ro ? "Meniu" : "Menu") : ro ? "Servicii și produse" : "Services and products",
    offers: ro ? "Ce găsești la noi" : "What you'll find here",
    hours: ro ? "Program" : "Opening hours",
    contact: ro ? "Contact și adresă" : "Contact and address",
    faq: ro ? "Întrebări frecvente" : "Frequently asked questions",
    call: ro ? "Sună-ne" : "Call us",
    directions: ro ? "Vezi pe hartă" : "Get directions",
    address: ro ? "Adresă" : "Address",
    phone: ro ? "Telefon" : "Phone",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const section = (id: string, heading: string, body: string) =>
    `\n    <section id="${id}">\n      <h2>${esc(heading)}</h2>\n${body}\n    </section>`;

  const parts: string[] = [];
  parts.push(section("despre", t.about, `      <p class="lead">${esc(about)}</p>`));
  if (services.length) {
    parts.push(
      section(
        "oferta",
        t.services,
        `      <ul class="list">\n${services
          .map((s) => `        <li><span>${esc(s.name.trim())}</span>${s.price.trim() ? `<span class="price">${esc(s.price.trim())}</span>` : ""}</li>`)
          .join("\n")}\n      </ul>`
      )
    );
  }
  if (offers.length) {
    parts.push(section("facilitati", t.offers, `      <ul class="chips">\n${offers.map((o) => `        <li>${esc(o)}</li>`).join("\n")}\n      </ul>`));
  }
  if (hours.length) {
    parts.push(
      section(
        "program",
        t.hours,
        `      <table>\n${hours.map((l) => `        <tr><th scope="row">${esc(l.day)}</th><td>${esc(l.text)}</td></tr>`).join("\n")}\n      </table>`
      )
    );
  }
  parts.push(
    section(
      "contact",
      t.contact,
      [
        `      <address>`,
        `        <p><strong>${esc(t.address)}:</strong> ${esc(profile.address)}, ${esc(profile.city)}</p>`,
        profile.phone ? `        <p><strong>${esc(t.phone)}:</strong> <a href="tel:${esc(phoneHref)}">${esc(profile.phone)}</a></p>` : "",
        email ? `        <p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : "",
        `      </address>`,
        `      <p><a class="btn ghost" href="${esc(mapUrl)}" rel="noopener">${esc(t.directions)}</a></p>`,
      ]
        .filter(Boolean)
        .join("\n")
    )
  );
  parts.push(
    section(
      "intrebari",
      t.faq,
      faqs.map((f) => `      <details>\n        <summary>${esc(f.q)}</summary>\n        <p>${esc(f.a)}</p>\n      </details>`).join("\n")
    )
  );

  const nav = [
    ["despre", t.about],
    services.length ? ["oferta", t.services] : null,
    hours.length ? ["program", t.hours] : null,
    ["contact", "Contact"],
  ].filter((x): x is string[] => !!x);

  const html = `<!doctype html>
<html lang="${info.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">${url ? `\n  <link rel="canonical" href="${esc(url)}">` : ""}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">${url ? `\n  <meta property="og:url" content="${esc(url)}">` : ""}${image ? `\n  <meta property="og:image" content="${esc(image)}">` : ""}
  <script type="application/ld+json">
${jsonForScript(buildSchema(business, profile, info))}
  </script>
  <script type="application/ld+json">
${jsonForScript(faqSchema)}
  </script>
  <style>
    :root{${THEMES[info.style]};--accent:${safeColor(info.accent)}}
    *{box-sizing:border-box}
    body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.65 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
    a{color:inherit}
    .wrap{max-width:860px;margin:0 auto;padding:0 20px}
    header.top{border-bottom:1px solid var(--line)}
    header.top .wrap{display:flex;flex-wrap:wrap;gap:8px 24px;align-items:center;justify-content:space-between;padding-top:16px;padding-bottom:16px}
    .brand{font:700 20px var(--head);text-decoration:none}
    nav a{margin-left:18px;font-size:15px;color:var(--muted);text-decoration:none}
    nav a:first-child{margin-left:0}
    .hero{padding:72px 0 56px}
    .kicker{color:var(--muted);font-size:15px;letter-spacing:.04em;text-transform:uppercase;margin:0 0 12px}
    h1{font:700 clamp(36px,7vw,60px)/1.05 var(--head);margin:0 0 16px;letter-spacing:-.02em}
    .tag{font-size:21px;color:var(--muted);margin:0 0 28px;max-width:38em}
    .hero img{display:block;width:100%;max-height:380px;object-fit:cover;border-radius:16px;margin-top:40px}
    .btn{display:inline-block;background:var(--accent);color:#fff;padding:13px 22px;border-radius:10px;font-weight:600;text-decoration:none;margin:0 10px 10px 0}
    .btn.ghost{background:transparent;color:var(--fg);border:1px solid var(--line)}
    section{padding:44px 0;border-top:1px solid var(--line)}
    h2{font:700 28px/1.2 var(--head);margin:0 0 18px;letter-spacing:-.01em}
    .lead{font-size:19px;max-width:40em;margin:0}
    .list{list-style:none;margin:0;padding:0}
    .list li{display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--line)}
    .price{color:var(--muted);white-space:nowrap}
    .chips{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:10px}
    .chips li{background:var(--card);border-radius:999px;padding:8px 16px;font-size:15px}
    table{border-collapse:collapse;width:100%;max-width:420px}
    th,td{text-align:left;padding:9px 0;border-bottom:1px solid var(--line);font-weight:400}
    td{text-align:right;color:var(--muted)}
    address{font-style:normal}
    address p{margin:0 0 8px}
    details{border-bottom:1px solid var(--line);padding:14px 0}
    summary{cursor:pointer;font-weight:600}
    details p{margin:10px 0 0;color:var(--muted)}
    footer{border-top:1px solid var(--line);padding:28px 0;color:var(--muted);font-size:14px}
    @media (max-width:560px){.hero{padding:44px 0 36px}nav a{margin-left:12px}}
  </style>
</head>
<body>
  <header class="top">
    <div class="wrap">
      <a class="brand" href="#top">${esc(name)}</a>
      <nav aria-label="${ro ? "Secțiuni" : "Sections"}">${nav.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join("")}</nav>
    </div>
  </header>
  <main class="wrap" id="top">
    <div class="hero">
      <p class="kicker">${esc(kind)} · ${esc(profile.city)}</p>
      <h1>${esc(name)}</h1>
      <p class="tag">${esc(tagline)}</p>
      ${profile.phone ? `<a class="btn" href="tel:${esc(phoneHref)}">${esc(t.call)}: ${esc(profile.phone)}</a>` : ""}<a class="btn${profile.phone ? " ghost" : ""}" href="${esc(mapUrl)}" rel="noopener">${esc(t.directions)}</a>${image ? `\n      <img src="${esc(image)}" alt="${esc(name)}, ${esc(profile.city)}" loading="lazy">` : ""}
    </div>${parts.join("")}
  </main>
  <footer>
    <div class="wrap">© ${new Date().getFullYear()} ${esc(name)} · ${esc(profile.address)}, ${esc(profile.city)}</div>
  </footer>
</body>
</html>
`;

  // Robotii de cautare si cei AI au voie pe tot site-ul.
  const robots = `User-agent: *\nAllow: /\n${url ? `\nSitemap: ${new URL("/sitemap.xml", url).href}\n` : ""}`;
  const sitemap = url
    ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${esc(url)}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`
    : null;
  return { html, robots, sitemap, title, description };
}

/**
 * Pentru cine ARE deja site: doar bucatile care lipsesc, de adaugat. Nu se sterge nimic.
 * Primeste id-urile verificarilor picate la analiza.
 */
export function buildAdditions(business: Business, profile: Profile, info: SiteInfo, failed: string[]) {
  const site = generateSite(business, profile, info);
  const has = (id: string) => failed.includes(id);
  const head: string[] = [];
  const body: string[] = [];
  const notes: string[] = [];
  const ro = info.lang === "ro";
  const image = safeHttpUrl(info.imageUrl);
  if (has("title")) head.push(`<title>${esc(site.title)}</title>`);
  if (has("description")) head.push(`<meta name="description" content="${esc(site.description)}">`);
  if (has("viewport")) head.push(`<meta name="viewport" content="width=device-width, initial-scale=1">`);
  if (has("og"))
    head.push(
      `<meta property="og:title" content="${esc(site.title)}">\n<meta property="og:description" content="${esc(site.description)}">${image ? `\n<meta property="og:image" content="${esc(image)}">` : ""}`
    );
  if (has("schema")) head.push(`<script type="application/ld+json">\n${jsonForScript(buildSchema(business, profile, info))}\n</script>`);
  if (has("h1")) body.push(`<h1>${esc(profile.storeName)}</h1>`);
  if (has("contact") && profile.phone)
    body.push(`<p>${ro ? "Telefon" : "Phone"}: <a href="tel:${esc(profile.phone.replace(/[^\d+]/g, ""))}">${esc(profile.phone)}</a></p>`);
  if (has("city")) body.push(`<address>${esc(profile.address)}, ${esc(profile.city)}</address>`);
  const hours = hoursLines(info);
  if (has("hours") && hours.length)
    body.push(`<h2>${ro ? "Program" : "Opening hours"}</h2>\n<ul>\n${hours.map((l) => `  <li>${esc(l.day)}: ${esc(l.text)}</li>`).join("\n")}\n</ul>`);
  if (has("lang")) notes.push(ro ? `Pe eticheta <html> adaugă atributul lang="${info.lang}".` : `Add lang="${info.lang}" to the <html> tag.`);
  if (has("https")) notes.push(ro ? "Activează certificatul SSL (HTTPS) din panoul firmei de hosting." : "Enable the SSL certificate (HTTPS) in your hosting panel.");
  return {
    head: head.join("\n"),
    body: body.join("\n\n"),
    notes,
    robots: has("aiBots") || has("sitemap") ? site.robots : null,
    sitemap: has("sitemap") ? site.sitemap : null,
  };
}
