import type { Answer, Assessment } from "./types";
import type { Text } from "./i18n";

export interface Criterion {
  id: string;
  weight: number; // suma ponderilor = 100
  title: Text;
  question: Text;
  why: Text; // de ce conteaza pentru recomandarile AI
  fix: Text; // ce e de facut daca lipseste
  options: Record<Answer, Text>;
}

export const CRITERIA: Criterion[] = [
  {
    id: "website",
    weight: 12,
    title: { ro: "Site web", en: "Website" },
    question: { ro: "Afacerea ta are un site web?", en: "Does your business have a website?" },
    why: {
      ro: "Asistenții AI citează surse pe care le pot citi. Fără site, nu au de unde să afle ce oferi.",
      en: "AI assistants cite sources they can read. Without a site, they have nowhere to learn what you offer.",
    },
    fix: {
      ro: "Lansează un site simplu, de o pagină: ce oferi, unde ești, program, contact.",
      en: "Launch a simple one-page site: what you offer, where you are, hours, contact.",
    },
    options: {
      full: { ro: "Da, avem un site funcțional", en: "Yes, we have a working site" },
      partial: { ro: "Doar o pagină de social media", en: "Only a social media page" },
      none: { ro: "Nu", en: "No" },
    },
  },
  {
    id: "maps",
    weight: 12,
    title: { ro: "Prezență pe Google Maps", en: "Google Maps presence" },
    question: { ro: "Locația ta apare pe Google Maps?", en: "Does your location show up on Google Maps?" },
    why: {
      ro: "Pentru întrebări de tip „lângă mine”, AI-ul pornește de la datele de pe hartă.",
      en: "For “near me” questions, AI starts from map data.",
    },
    fix: {
      ro: "Adaugă locația pe Google Maps cu adresă exactă, program și fotografii.",
      en: "Add your location to Google Maps with exact address, hours and photos.",
    },
    options: {
      full: { ro: "Da, cu date corecte și la zi", en: "Yes, accurate and up to date" },
      partial: { ro: "Apare, dar incomplet sau învechit", en: "Listed, but incomplete or outdated" },
      none: { ro: "Nu apare", en: "Not listed" },
    },
  },
  {
    id: "domain_email",
    weight: 8,
    title: { ro: "Domeniu propriu și email profesional", en: "Own domain and professional email" },
    question: {
      ro: "Ai domeniu web propriu și adresă de email pe acel domeniu?",
      en: "Do you have your own web domain and an email address on it?",
    },
    why: {
      ro: "Un domeniu propriu este un semnal de încredere și leagă între ele toate profilurile firmei.",
      en: "An owned domain is a trust signal and ties all your business profiles together.",
    },
    fix: {
      ro: "Cumpără un domeniu (ex. numefirma.ro) și creează o adresă contact@numefirma.ro.",
      en: "Buy a domain (e.g. yourbusiness.com) and create contact@yourbusiness.com.",
    },
    options: {
      full: { ro: "Da, ambele", en: "Yes, both" },
      partial: { ro: "Doar una dintre ele", en: "Only one of them" },
      none: { ro: "Niciuna", en: "Neither" },
    },
  },
  {
    id: "gbp",
    weight: 15,
    title: { ro: "Google Business Profile", en: "Google Business Profile" },
    question: {
      ro: "Ai un profil Google Business Profile creat și verificat?",
      en: "Do you have a created and verified Google Business Profile?",
    },
    why: {
      ro: "Este cea mai folosită sursă structurată despre afacerile locale: categorie, program, servicii.",
      en: "It is the most used structured source about local businesses: category, hours, services.",
    },
    fix: {
      ro: "Creează profilul, verifică-l și completează toate câmpurile, inclusiv atributele.",
      en: "Create the profile, verify it and fill in every field, including attributes.",
    },
    options: {
      full: { ro: "Creat și verificat", en: "Created and verified" },
      partial: { ro: "Creat, dar neverificat", en: "Created, not verified" },
      none: { ro: "Nu avem", en: "We don't have one" },
    },
  },
  {
    id: "mobile",
    weight: 10,
    title: { ro: "Site optimizat pentru mobil", en: "Mobile-friendly website" },
    question: {
      ro: "Site-ul se vede și se încarcă bine pe telefon?",
      en: "Does your site look good and load fast on a phone?",
    },
    why: {
      ro: "Paginile lente sau greu de citit sunt ocolite atât de motoare, cât și de clienți.",
      en: "Slow or hard-to-read pages are skipped by both engines and customers.",
    },
    fix: {
      ro: "Treci pe o temă responsive și verifică viteza de încărcare pe mobil.",
      en: "Switch to a responsive theme and check mobile loading speed.",
    },
    options: {
      full: { ro: "Da", en: "Yes" },
      partial: { ro: "Parțial / nu sunt sigur", en: "Partly / not sure" },
      none: { ro: "Nu sau nu avem site", en: "No, or we have no site" },
    },
  },
  {
    id: "uvp",
    weight: 10,
    title: { ro: "Propunere unică de valoare", en: "Unique value proposition" },
    question: {
      ro: "Ai o propunere unică de valoare clară, scrisă public?",
      en: "Do you have a clear unique value proposition, written publicly?",
    },
    why: {
      ro: "AI-ul recomandă afaceri pentru un motiv anume. Dacă nu îl spui tu, nu are ce să repete.",
      en: "AI recommends businesses for a specific reason. If you don't state it, it has nothing to repeat.",
    },
    fix: {
      ro: "Scrie o frază despre ce te deosebește și pune-o pe site și în profilul Google.",
      en: "Write one sentence on what sets you apart and put it on your site and Google profile.",
    },
    options: {
      full: { ro: "Da, clară și publicată", en: "Yes, clear and published" },
      partial: { ro: "O știm, dar nu e scrisă nicăieri", en: "We know it, but it isn't written anywhere" },
      none: { ro: "Nu", en: "No" },
    },
  },
  {
    id: "payments",
    weight: 10,
    title: { ro: "Procesare plăți", en: "Payment processing" },
    question: {
      ro: "Ai un sistem de procesare a plăților integrat?",
      en: "Do you have an integrated payment processing system?",
    },
    why: {
      ro: "„Acceptă card” și „comandă online” sunt filtre frecvente în cererile făcute către AI.",
      en: "“Accepts cards” and “order online” are common filters in AI requests.",
    },
    fix: {
      ro: "Activează plata cu cardul și, dacă se potrivește, un link de plată online.",
      en: "Enable card payments and, where it fits, an online payment link.",
    },
    options: {
      full: { ro: "Da, card și online", en: "Yes, card and online" },
      partial: { ro: "Doar card, în locație", en: "Card only, on site" },
      none: { ro: "Doar numerar", en: "Cash only" },
    },
  },
  {
    id: "reviews",
    weight: 13,
    title: { ro: "Recenzii", en: "Reviews" },
    question: {
      ro: "Ai un mecanism de colectare și gestionare a recenziilor?",
      en: "Do you have a way to collect and manage reviews?",
    },
    why: {
      ro: "Recenziile recente sunt principalul material din care AI-ul descrie o afacere locală.",
      en: "Recent reviews are the main material AI uses to describe a local business.",
    },
    fix: {
      ro: "Cere recenzii activ (ex. cod QR în locație) și răspunde la fiecare.",
      en: "Ask for reviews actively (e.g. a QR code on site) and reply to each one.",
    },
    options: {
      full: { ro: "Cerem activ și răspundem", en: "We ask actively and reply" },
      partial: { ro: "Avem recenzii, dar nu le gestionăm", en: "We have reviews but don't manage them" },
      none: { ro: "Nu", en: "No" },
    },
  },
  {
    id: "crm",
    weight: 10,
    title: { ro: "Bază de date clienți", en: "Customer database" },
    question: {
      ro: "Ții o evidență a clienților (CRM minimal)?",
      en: "Do you keep a customer record (minimal CRM)?",
    },
    why: {
      ro: "Clienții care revin lasă recenzii. Fără evidență, nu ai pe cine să inviți.",
      en: "Returning customers leave reviews. Without records, you have no one to invite.",
    },
    fix: {
      ro: "Pornește cu o listă simplă de clienți, cu acordul lor, și un instrument CRM de bază.",
      en: "Start with a simple, consent-based customer list and a basic CRM tool.",
    },
    options: {
      full: { ro: "Da, într-un instrument dedicat", en: "Yes, in a dedicated tool" },
      partial: { ro: "Într-un tabel sau caiet", en: "In a spreadsheet or notebook" },
      none: { ro: "Nu", en: "No" },
    },
  },
];

const VALUE: Record<Answer, number> = { full: 1, partial: 0.5, none: 0 };

export function computeScore(a: Assessment): number {
  const total = CRITERIA.reduce((s, c) => s + c.weight * VALUE[a[c.id] ?? "none"], 0);
  return Math.round(total);
}

export function pointsLost(c: Criterion, answer: Answer): number {
  return c.weight * (1 - VALUE[answer]);
}

export const DOMAINS: { id: string; label: Text; food: boolean }[] = [
  { id: "cafe", label: { ro: "Cafenea", en: "Café" }, food: true },
  { id: "restaurant", label: { ro: "Restaurant / Fast-food", en: "Restaurant / Fast food" }, food: true },
  { id: "tailor", label: { ro: "Croitorie", en: "Tailoring" }, food: false },
  { id: "secondhand", label: { ro: "Second-hand", en: "Second-hand shop" }, food: false },
  { id: "retail", label: { ro: "Retail", en: "Retail" }, food: false },
  { id: "beauty", label: { ro: "Frumusețe", en: "Beauty" }, food: false },
  { id: "services", label: { ro: "Servicii", en: "Services" }, food: false },
  { id: "other", label: { ro: "Altul", en: "Other" }, food: false },
];

export const FEATURES: { id: string; label: Text; foodOnly?: boolean }[] = [
  { id: "dineIn", label: { ro: "Se poate servi în local (dine-in)?", en: "Is dine-in available?" }, foodOnly: true },
  { id: "takeaway", label: { ro: "Oferiți la pachet (takeaway)?", en: "Do you offer takeaway?" }, foodOnly: true },
  { id: "driveThrough", label: { ro: "Aveți drive-through?", en: "Do you have a drive-through?" }, foodOnly: true },
  { id: "delivery", label: { ro: "Faceți livrări?", en: "Do you deliver?" } },
  { id: "petFriendly", label: { ro: "Sunteți pet friendly?", en: "Are you pet friendly?" } },
  { id: "outdoor", label: { ro: "Aveți terasă / spațiu exterior?", en: "Do you have outdoor space?" } },
  { id: "booking", label: { ro: "Acceptați rezervări sau programări?", en: "Do you take reservations or appointments?" } },
  { id: "accessible", label: { ro: "Locația este accesibilă cu scaun rulant?", en: "Is the location wheelchair accessible?" } },
  { id: "parking", label: { ro: "Aveți parcare pentru clienți?", en: "Do you have customer parking?" } },
  { id: "wifi", label: { ro: "Oferiți Wi-Fi gratuit?", en: "Do you offer free Wi-Fi?" } },
];
