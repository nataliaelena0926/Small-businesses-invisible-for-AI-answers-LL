import type { Text } from "./i18n";

/** Verificarile automate facute pe site. Suma ponderilor = 100. */
export interface CheckMeta {
  id: string;
  weight: number;
  title: Text;
  fix: Text;
}

export const SITE_CHECKS: CheckMeta[] = [
  {
    id: "schema", weight: 15,
    title: { ro: "Date structurate (schema.org) despre afacere", en: "Structured data (schema.org) about the business" },
    fix: { ro: "Adaugă în pagină un bloc JSON-LD de tip LocalBusiness cu nume, adresă, telefon și program. Îl găsești generat mai jos.", en: "Add a LocalBusiness JSON-LD block with name, address, phone and hours. A generated one is below." },
  },
  {
    id: "https", weight: 10,
    title: { ro: "Conexiune securizată (HTTPS)", en: "Secure connection (HTTPS)" },
    fix: { ro: "Activează un certificat SSL (gratuit la majoritatea firmelor de hosting) și redirecționează tot traficul pe https.", en: "Enable an SSL certificate (free with most hosts) and redirect all traffic to https." },
  },
  {
    id: "description", weight: 10,
    title: { ro: "Descriere a paginii (meta description)", en: "Page description (meta description)" },
    fix: { ro: "Scrie o descriere de 120–160 de caractere: ce oferi, pentru cine și în ce oraș.", en: "Write a 120–160 character description: what you offer, for whom and in which city." },
  },
  {
    id: "viewport", weight: 10,
    title: { ro: "Pregătit pentru mobil", en: "Mobile ready" },
    fix: { ro: "Adaugă eticheta meta viewport și folosește o temă responsive.", en: "Add the viewport meta tag and use a responsive theme." },
  },
  {
    id: "aiBots", weight: 10,
    title: { ro: "Accesibil pentru roboții AI", en: "Open to AI crawlers" },
    fix: { ro: "Fișierul robots.txt blochează roboți AI. Scoate regulile Disallow pentru ei, altfel asistenții nu îți pot citi site-ul.", en: "Your robots.txt blocks AI crawlers. Remove their Disallow rules, otherwise assistants cannot read your site." },
  },
  {
    id: "title", weight: 8,
    title: { ro: "Titlul paginii", en: "Page title" },
    fix: { ro: "Pune un titlu de 10–70 de caractere cu numele afacerii, ce face și orașul.", en: "Set a 10–70 character title with the business name, what it does and the city." },
  },
  {
    id: "contact", weight: 8,
    title: { ro: "Telefon vizibil", en: "Visible phone number" },
    fix: { ro: "Afișează numărul de telefon ca text, ideal ca link tel:, nu doar într-o imagine.", en: "Show the phone number as text, ideally as a tel: link, not only in an image." },
  },
  {
    id: "speed", weight: 6,
    title: { ro: "Răspuns rapid al serverului", en: "Fast server response" },
    fix: { ro: "Serverul răspunde lent. Verifică hostingul, activează cache și micșorează imaginile.", en: "The server responds slowly. Check hosting, enable caching and compress images." },
  },
  {
    id: "city", weight: 6,
    title: { ro: "Orașul apare în text", en: "City mentioned in the text" },
    fix: { ro: "Menționează orașul și adresa în textul paginii, nu doar pe hartă.", en: "Mention the city and address in the page text, not only on a map." },
  },
  {
    id: "h1", weight: 4,
    title: { ro: "Titlu principal (H1)", en: "Main heading (H1)" },
    fix: { ro: "Adaugă un singur titlu H1 care spune clar ce este afacerea.", en: "Add a single H1 heading that clearly says what the business is." },
  },
  {
    id: "hours", weight: 4,
    title: { ro: "Program de funcționare", en: "Opening hours" },
    fix: { ro: "Scrie programul de funcționare în pagină.", en: "Write your opening hours on the page." },
  },
  {
    id: "lang", weight: 3,
    title: { ro: "Limba paginii declarată", en: "Page language declared" },
    fix: { ro: "Setează atributul lang pe eticheta html (ex. lang=\"ro\").", en: "Set the lang attribute on the html tag (e.g. lang=\"en\")." },
  },
  {
    id: "og", weight: 3,
    title: { ro: "Previzualizare la distribuire (Open Graph)", en: "Share preview (Open Graph)" },
    fix: { ro: "Adaugă etichetele og:title și og:image ca linkul să arate bine când e distribuit.", en: "Add og:title and og:image tags so the link looks good when shared." },
  },
  {
    id: "sitemap", weight: 3,
    title: { ro: "Hartă a site-ului (sitemap.xml)", en: "Sitemap (sitemap.xml)" },
    fix: { ro: "Publică un fișier sitemap.xml ca toate paginile să fie găsite.", en: "Publish a sitemap.xml file so every page can be found." },
  },
];
