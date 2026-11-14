import type { Text } from "./i18n";
import type { PlanId } from "./types";

export interface Plan {
  id: PlanId;
  rank: number; // fiecare plan include tot ce au cele cu rang mai mic
  name: Text;
  price: number; // lei — valori orientative, de validat
  billing: "once" | "monthly";
  tagline: Text;
  includes?: Text;
  features: Text[];
  highlight?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "start",
    rank: 0,
    name: { ro: "Start", en: "Start" },
    price: 149,
    billing: "once",
    tagline: { ro: "Afli unde ești și primești site-ul.", en: "See where you stand and get your site." },
    features: [
      { ro: "Diagnostic complet, cu pașii de reparare", en: "Full diagnostic with fix steps" },
      { ro: "Site generat din informațiile magazinului, cu toate criteriile pentru căutările AI", en: "Website generated from your store details, with every criterion for AI search" },
      { ro: "Ai deja site? Primești doar completările care îi lipsesc, fără să se șteargă nimic", en: "Already have a site? Get only the additions it lacks, nothing removed" },
      { ro: "Cod QR pentru recenzii", en: "Review QR code" },
    ],
  },
  {
    id: "maintain",
    rank: 1,
    name: { ro: "Întreținere", en: "Maintenance" },
    price: 49,
    billing: "monthly",
    tagline: { ro: "Site-ul rămâne la zi și știi mereu scorul.", en: "Your site stays current and you always know the score." },
    includes: { ro: "Tot ce e în Start, plus:", en: "Everything in Start, plus:" },
    features: [
      { ro: "Reverificarea site-ului de câteva ori pe săptămână", en: "Site re-check several times a week" },
      { ro: "Istoricul scorului: vezi când și de ce s-a schimbat", en: "Score history: see when and why it changed" },
      { ro: "Actualizezi programul, prețurile sau oferta și site-ul se regenerează", en: "Update hours, prices or offer and the site regenerates" },
    ],
  },
  {
    id: "reviews",
    rank: 2,
    name: { ro: "Recenzii", en: "Reviews" },
    price: 99,
    billing: "monthly",
    tagline: { ro: "Știi ce spun clienții și ce merită schimbat.", en: "Know what customers say and what's worth changing." },
    includes: { ro: "Tot ce e în Întreținere, plus:", en: "Everything in Maintenance, plus:" },
    highlight: true,
    features: [
      { ro: "Recenziile grupate pe teme: personal, produse, locație, așteptare, preț", en: "Reviews grouped by theme: staff, products, place, waiting, price" },
      { ro: "Lista scurtă cu cele mai importante lucruri de schimbat, pe un ton calm", en: "A short, calm list of the most important things to change" },
      { ro: "Ce le place clienților, ca să păstrezi ce merge", en: "What customers like, so you keep what works" },
    ],
  },
  {
    id: "complete",
    rank: 3,
    name: { ro: "Complet", en: "Complete" },
    price: 179,
    billing: "monthly",
    tagline: { ro: "Tot, fără limite.", en: "Everything, without limits." },
    includes: { ro: "Tot ce e în Recenzii, plus:", en: "Everything in Reviews, plus:" },
    features: [
      { ro: "Îmbunătățirea site-ului de către AI, nelimitat, pe baza cerinței tale", en: "Unlimited AI site improvements from your own request" },
      { ro: "Verificarea scorului nelimitată", en: "Unlimited score checks" },
      { ro: "Idei de marketing și de reclame pentru sezon și pentru nișa ta", en: "Marketing and ad ideas for the season and your niche" },
    ],
  },
];

export const planOf = (id: PlanId | null) => PLANS.find((p) => p.id === id) ?? null;
/** Are planul curent acces la functiile planului cerut? */
export const hasAccess = (current: PlanId | null, needed: PlanId) =>
  (planOf(current)?.rank ?? -1) >= (planOf(needed)?.rank ?? 99);
