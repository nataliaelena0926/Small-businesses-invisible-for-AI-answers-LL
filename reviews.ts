// @ts-nocheck -- imported unchanged from the Vizibil project, which compiled with looser index checks.
import type { Text } from "./i18n";

/**
 * Gruparea recenziilor pe teme — reguli fixe, pe cuvinte-cheie (RO + EN), fara AI.
 * Recenziile sunt introduse de proprietar (lipite sau din fisier); aplicatia nu le
 * colecteaza singura de pe Google Maps, pentru ca termenii Google nu permit asta.
 */

export type CategoryId = "staff" | "product" | "place" | "wait" | "price" | "other";

export const CATEGORY_LABEL: Record<CategoryId, { food: Text; other: Text }> = {
  staff: { food: { ro: "Personal și servire", en: "Staff and service" }, other: { ro: "Personal și servire", en: "Staff and service" } },
  product: { food: { ro: "Mâncare și băuturi", en: "Food and drinks" }, other: { ro: "Produse și servicii", en: "Products and services" } },
  place: { food: { ro: "Locație și atmosferă", en: "Place and atmosphere" }, other: { ro: "Locație și atmosferă", en: "Place and atmosphere" } },
  wait: { food: { ro: "Timp de așteptare", en: "Waiting time" }, other: { ro: "Timp de așteptare", en: "Waiting time" } },
  price: { food: { ro: "Preț", en: "Price" }, other: { ro: "Preț", en: "Price" } },
  other: { food: { ro: "Alte observații", en: "Other remarks" }, other: { ro: "Alte observații", en: "Other remarks" } },
};

/** Ce poate face concret proprietarul, formulat calm. */
export const CATEGORY_ACTION: Record<CategoryId, Text> = {
  staff: { ro: "Discută exemplele cu echipa și stabiliți împreună un mod de a întâmpina și de a răspunde clienților.", en: "Go through the examples with your team and agree on how to greet and respond to customers." },
  product: { ro: "Verifică produsele menționate: rețetă, prospețime, consistență de la o zi la alta.", en: "Check the items mentioned: recipe, freshness, consistency from day to day." },
  place: { ro: "Fă un tur al locației ca un client: curățenie, zgomot, confort. Începe cu ce se repară ușor.", en: "Walk through the place as a customer would: cleanliness, noise, comfort. Start with the easy fixes." },
  wait: { ro: "Uită-te la orele aglomerate: poate ajuta un om în plus, pregătire în avans sau un timp estimat spus clientului.", en: "Look at peak hours: an extra person, prep in advance or telling customers the expected time can help." },
  price: { ro: "Nu trebuie neapărat să scazi prețul: explică mai clar ce primește clientul sau adaugă o opțiune mai accesibilă.", en: "You don't have to cut prices: explain the value more clearly or add a more affordable option." },
  other: { ro: "Citește aceste recenzii pe îndelete; pot ascunde un subiect care nu intră în temele de mai sus.", en: "Read these reviews at leisure; they may hide a topic outside the themes above." },
};

const KEYWORDS: Record<Exclude<CategoryId, "other">, string[]> = {
  staff: ["personal", "angajat", "ospatar", "chelner", "barista", "vanzato", "casier", "servire", "servit", "amabil", "politic", "nepolitic", "obraznic", "arogant", "zambi", "staff", "waiter", "waitress", "service", "rude", "friendly", "helpful", "employee"],
  product: ["mancare", "mancarea", "cafea", "cafeaua", "prajitur", "gust", "portie", "portii", "meniu", "pizza", "burger", "bautur", "desert", "ciorba", "supa", "proaspat", "produs", "calitate", "marfa", "haine", "material", "reparat", "lucrare", "tuns", "tratament", "rezultat", "food", "coffee", "taste", "dish", "meal", "drink", "cake", "product", "quality"],
  place: ["locatie", "localul", "atmosfera", "curat", "murdar", "mizerie", "galagie", "zgomot", "muzica", "parcare", "toaleta", "baie", "terasa", "decor", "spatiu", "scaune", "mese", "ambianta", "location", "atmosphere", "clean", "dirty", "noisy", "parking", "toilet", "cozy"],
  wait: ["asteptat", "astept", "durat", "intarzi", "coada", "lent", "repede", "rapid", "minute", "wait", "slow", "quick", "fast", "queue"],
  price: ["pret", "scump", "ieftin", "bani", "cost", "nota de plata", "price", "expensive", "cheap", "overpriced", "worth"],
};

const NEGATIVE = ["nu recomand", "dezamag", "prost", "proasta", "groaznic", "oribil", "urat", "rece", "murdar", "mizerie", "nepolitic", "obraznic", "arogant", "lent", "intarzi", "scump", "slab", "rau", "rea", "niciodata", "evitati", "nasol", "galagie", "zgomot", "stricat", "ars", "nesarat", "gresit", "asteptat", "coada", "nu mai vin", "cam mar", "prea mar", "prea tare", "prea scump", "greu de", "bad", "terrible", "awful", "rude", "dirty", "slow", "cold", "expensive", "overpriced", "worst", "disappoint", "never again", "noisy"];
const POSITIVE = ["recomand", "excelent", "minunat", "super", "bun", "delicios", "gustos", "amabil", "politicos", "prietenos", "curat", "rapid", "repede", "ieftin", "placut", "perfect", "grozav", "frumos", "proaspat", "great", "excellent", "amazing", "good", "delicious", "friendly", "clean", "fast", "lovely", "best", "nice", "cozy", "helpful"];
const NEGATED = /\bnu (prea |e |este |a fost |au fost |am |sunt |mai |era )?(recomand|bun|amabil|curat|rapid|gustos|placut|politicos|frumos|proaspat|grozav)/;

const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const count = (text: string, words: string[]) =>
  words.reduce((n, w) => n + (new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(text) ? 1 : 0), 0);

function sentiment(text: string): -1 | 0 | 1 {
  let neg = count(text, NEGATIVE);
  let pos = count(text, POSITIVE);
  if (NEGATED.test(text)) {
    neg += 1;
    pos = Math.max(0, pos - 1);
  }
  // "nu recomand" contine si "recomand": nu il numaram ca pozitiv.
  if (text.includes("nu recomand")) pos = Math.max(0, pos - 1);
  return neg > pos ? -1 : pos > neg ? 1 : 0;
}

export interface ParsedReview {
  text: string;
  rating: number | null;
}

/** O recenzie pe linie. Accepta optional nota la inceput sau la sfarsit: "2★ text", "5, text", "text;4". */
export function parseReviews(raw: string): ParsedReview[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/^["']|["']$/g, ""))
    .filter((l) => l.length >= 8)
    .slice(0, 500)
    .map((line) => {
      let rating: number | null = null;
      let text = line;
      const lead = line.match(/^([1-5])\s*(?:★|\*|stele|stars|\/\s*5)?\s*[-:–|,;\t]\s*(.+)$/i) ?? line.match(/^([1-5])\s*(?:★|\*|stele|stars|\/\s*5)\s+(.+)$/i);
      const trail = line.match(/^(.+?)\s*[,;\t|]\s*([1-5])\s*(?:★|\*|stele|stars|\/\s*5)?$/i);
      if (lead) {
        rating = Number(lead[1]);
        text = lead[2];
      } else if (trail) {
        rating = Number(trail[2]);
        text = trail[1];
      }
      return { text: text.trim().replace(/^["']|["']$/g, ""), rating };
    });
}

export interface CategoryStat {
  id: CategoryId;
  mentions: number; // cate recenzii ating tema
  negative: number;
  positive: number;
  examples: string[]; // fragmente negative, pentru context
}

export interface ReviewInsights {
  total: number;
  negative: number;
  positive: number;
  categories: CategoryStat[];
  priorities: CategoryStat[]; // teme cu cel putin 2 mentiuni negative, cele mai frecvente primele
  strengths: CategoryStat[];
}

export function analyzeReviews(raw: string): ReviewInsights {
  const reviews = parseReviews(raw);
  const ids: CategoryId[] = ["staff", "product", "place", "wait", "price", "other"];
  const stats = Object.fromEntries(ids.map((id) => [id, { id, mentions: 0, negative: 0, positive: 0, examples: [] as string[] }])) as Record<CategoryId, CategoryStat>;
  let negative = 0;
  let positive = 0;

  for (const r of reviews) {
    const whole = plain(r.text);
    const overall: -1 | 0 | 1 = r.rating !== null ? (r.rating <= 2 ? -1 : r.rating >= 4 ? 1 : 0) : sentiment(whole);
    if (overall < 0) negative++;
    if (overall > 0) positive++;

    // Sentiment pe tema: o recenzie poate lauda mancarea si critica asteptarea.
    const clauses = r.text.split(/[.!?;]|,| dar | insa | însă | but /i).map((c) => c.trim()).filter(Boolean);
    const seen = new Map<CategoryId, -1 | 0 | 1>();
    for (const clause of clauses) {
      const c = plain(clause);
      const own = sentiment(c);
      for (const id of Object.keys(KEYWORDS) as Exclude<CategoryId, "other">[]) {
        if (count(c, KEYWORDS[id]) === 0) continue;
        const s = own !== 0 ? own : overall;
        const prev = seen.get(id);
        seen.set(id, prev === undefined ? s : prev === -1 || s === -1 ? -1 : prev || s);
        if (s < 0 && stats[id].examples.length < 3) stats[id].examples.push(clause.slice(0, 160));
      }
    }
    if (seen.size === 0) {
      seen.set("other", overall);
      if (overall < 0 && stats.other.examples.length < 3) stats.other.examples.push(r.text.slice(0, 160));
    }
    for (const [id, s] of seen) {
      stats[id].mentions++;
      if (s < 0) stats[id].negative++;
      if (s > 0) stats[id].positive++;
    }
  }

  const categories = ids.map((id) => stats[id]).filter((c) => c.mentions > 0);
  return {
    total: reviews.length,
    negative,
    positive,
    categories,
    priorities: categories.filter((c) => c.negative >= 2).sort((a, b) => b.negative - a.negative || b.negative / b.mentions - a.negative / a.mentions),
    strengths: categories.filter((c) => c.positive >= 2 && c.positive > c.negative).sort((a, b) => b.positive - a.positive),
  };
}

/** Recenzii INVENTATE, doar pentru demonstratie. */
export const SAMPLE_REVIEWS = `5★ Cafeaua este excelentă și personalul foarte amabil. Recomand!
2★ Am așteptat 25 de minute pentru două cafele, deși nu era aglomerat.
4★ Atmosferă plăcută, prăjituri gustoase, dar prețurile sunt cam mari.
1★ Ospătarul a fost nepoliticos și comanda a venit greșit.
5★ Cel mai bun flat white din oraș, locație curată și frumoasă.
3★ Mâncarea bună, dar am așteptat mult la coadă.
2★ Toaleta era murdară și muzica prea tare, gălăgie mare.
5★ Barista foarte prietenos, ne-a recomandat o cafea minunată.
2★ Scump pentru ce oferă. Porțiile de desert sunt mici.
4★ Terasă frumoasă, pet friendly, câinele nostru a primit apă.
1★ Servire lentă, am așteptat 30 de minute și cafeaua a venit rece.
5★ Prăjitura cu morcovi este delicioasă, personal amabil.
3★ Loc drăguț, dar greu de găsit parcare.
5★ Recomand, cafea proaspătă și atmosferă liniștită.`;
