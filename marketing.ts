// @ts-nocheck -- imported unchanged from the Vizibil project, which compiled with looser index checks.
import type { Text } from "./i18n";
import type { Business, Profile } from "./types";

/**
 * Idei de marketing din reguli fixe: calendarul sezonului + nisa + ce ofera magazinul.
 * NU sunt trenduri citite in timp real de pe internet.
 */

const SEASON: Record<number, Text[]> = {
  0: [{ ro: "Început de an: o ofertă „primul client al lunii” sau un produs nou de ianuarie.", en: "New year: a “first customer of the month” offer or a new January item." }],
  1: [
    { ro: "Valentine's Day (14 feb.) și Dragobete (24 feb.): ofertă pentru doi sau pachet cadou.", en: "Valentine's Day (14 Feb) and Dragobete (24 Feb): an offer for two or a gift bundle." },
  ],
  2: [
    { ro: "1 Martie: un mărțișor mic oferit fiecărui client din ziua respectivă.", en: "1 March (Mărțișor): a small token for every customer that day." },
    { ro: "8 Martie: ofertă sau card cadou pentru Ziua Femeii.", en: "8 March: an offer or gift card for Women's Day." },
  ],
  3: [{ ro: "Paște: program special anunțat din timp și produse sau pachete de sezon.", en: "Easter: special hours announced early and seasonal items or bundles." }],
  4: [{ ro: "1 Mai și primele zile calde: promovează terasa sau produsele de vară.", en: "1 May and the first warm days: promote your terrace or summer items." }],
  5: [{ ro: "1 Iunie: ofertă pentru familii cu copii. Sfârșit de an școlar: reducere pentru elevi și studenți.", en: "1 June: a family offer. End of school year: a student discount." }],
  6: [{ ro: "Vară: produse reci, program prelungit seara, fotografii cu terasa.", en: "Summer: cold items, longer evening hours, photos of your outdoor area." }],
  7: [{ ro: "August: turiști și localnici rămași în oraș — o ofertă de „vacanță acasă”.", en: "August: tourists and locals in town — a “staycation” offer." }],
  8: [{ ro: "Început de școală: ofertă pentru elevi, studenți și părinți în primele săptămâni.", en: "Back to school: an offer for pupils, students and parents in the first weeks." }],
  9: [{ ro: "Toamnă și Halloween (31 oct.): un produs de sezon în ediție limitată.", en: "Autumn and Halloween (31 Oct): a limited-edition seasonal item." }],
  10: [
    { ro: "Black Friday: o singură ofertă clară, anunțată cu o săptămână înainte.", en: "Black Friday: one clear offer, announced a week ahead." },
    { ro: "1 Decembrie se apropie: un produs sau un decor cu temă românească.", en: "1 December is coming: a Romanian-themed item or decoration." },
  ],
  11: [
    { ro: "Moș Nicolae (6 dec.), Crăciun și Revelion: carduri cadou și programul de sărbători publicat din timp.", en: "St Nicholas (6 Dec), Christmas and New Year: gift cards and holiday hours published early." },
  ],
};

const NICHE: Record<string, Text[]> = {
  cafe: [
    { ro: "„Cafeaua săptămânii”: o origine sau o rețetă nouă în fiecare luni, cu o poză și două rânduri despre ea.", en: "“Coffee of the week”: a new origin or recipe every Monday, with a photo and two lines about it." },
    { ro: "Card de fidelitate simplu: a 10-a cafea gratuită.", en: "A simple loyalty card: the 10th coffee is free." },
  ],
  restaurant: [
    { ro: "Meniul zilei publicat zilnic la aceeași oră, cu preț.", en: "Daily menu posted at the same time every day, with the price." },
    { ro: "Fotografii reale cu trei preparate vedetă, făcute la lumină naturală.", en: "Real photos of three signature dishes, taken in daylight." },
  ],
  tailor: [
    { ro: "Poze „înainte și după” la ajustări, cu acordul clientului.", en: "“Before and after” photos of alterations, with the customer's consent." },
    { ro: "Listă de prețuri orientative pentru cele mai cerute lucrări.", en: "A guide price list for the most requested jobs." },
  ],
  secondhand: [
    { ro: "„Marfă nouă” anunțată într-o zi fixă din săptămână.", en: "“New arrivals” announced on a fixed day each week." },
    { ro: "O ținută completă compusă din magazin, cu prețul total.", en: "A full outfit put together from the shop, with the total price." },
  ],
  retail: [
    { ro: "Produsul săptămânii, cu explicația pentru cine este potrivit.", en: "Product of the week, with who it's best for." },
    { ro: "Răspunsuri scurte la întrebările pe care le primești cel mai des în magazin.", en: "Short answers to the questions you get most often in store." },
  ],
  beauty: [
    { ro: "Poze cu rezultate reale, cu acordul clientelor, și durata fiecărui serviciu.", en: "Photos of real results, with clients' consent, and the duration of each service." },
    { ro: "Locurile libere din săptămână anunțate duminică seara.", en: "Open slots for the week announced on Sunday evening." },
  ],
  services: [
    { ro: "Un caz rezolvat pe lună, povestit pe scurt: problema, soluția, durata.", en: "One solved case a month, told briefly: the problem, the fix, how long it took." },
    { ro: "Zona în care te deplasezi și timpul obișnuit de răspuns, scrise clar.", en: "Your service area and usual response time, stated clearly." },
  ],
};

const FEATURE_IDEAS: Record<string, Text> = {
  petFriendly: { ro: "Ești pet friendly: o poză pe săptămână cu un client patruped (cu acordul stăpânului) atrage exact publicul potrivit.", en: "You're pet friendly: a weekly photo of a four-legged guest (with the owner's consent) attracts exactly the right crowd." },
  delivery: { ro: "Faci livrări: scrie clar zona, costul și timpul de livrare, pe site și în profilul Google.", en: "You deliver: state the area, cost and delivery time clearly, on your site and Google profile." },
  outdoor: { ro: "Ai terasă: actualizează pozele la fiecare schimbare de sezon.", en: "You have outdoor seating: refresh the photos each season." },
  booking: { ro: "Accepți rezervări: pune butonul de rezervare primul lucru pe site.", en: "You take bookings: make the booking button the first thing on your site." },
  wifi: { ro: "Ai Wi-Fi gratuit: menționează-l pentru cei care caută un loc de lucru.", en: "You have free Wi-Fi: mention it for people looking for a place to work." },
  accessible: { ro: "Locația e accesibilă cu scaun rulant: spune-o explicit, puține locuri o fac.", en: "Your place is wheelchair accessible: say so explicitly, few places do." },
  parking: { ro: "Ai parcare: pentru mulți clienți este motivul decisiv, scrie-l lângă adresă.", en: "You have parking: for many customers it's the deciding factor, put it next to the address." },
};

export interface MarketingIdeas {
  seasonal: Text[];
  niche: Text[];
  yours: Text[];
  ads: { budget: Text; idea: Text }[];
}

export function marketingIdeas(business: Business, profile: Profile, now = new Date()): MarketingIdeas {
  const m = now.getMonth();
  const city = profile.city;
  return {
    seasonal: [...SEASON[m], ...SEASON[(m + 1) % 12]],
    niche: NICHE[business.domain] ?? NICHE.services,
    yours: Object.entries(FEATURE_IDEAS).filter(([id]) => profile.features[id]).map(([, t]) => t),
    ads: [
      {
        budget: { ro: "0 lei", en: "No budget" },
        idea: { ro: "Postează săptămânal în profilul Google Business (noutăți, oferte, poze) și răspunde la fiecare recenzie.", en: "Post weekly on your Google Business Profile (news, offers, photos) and reply to every review." },
      },
      {
        budget: { ro: "Buget mic", en: "Small budget" },
        idea: { ro: `Promovează o singură postare pe Facebook sau Instagram către oameni aflați la câțiva kilometri, în ${city}, timp de o săptămână.`, en: `Boost a single Facebook or Instagram post to people within a few kilometres, in ${city}, for one week.` },
      },
      {
        budget: { ro: "Buget mediu", en: "Medium budget" },
        idea: { ro: "Colaborare cu o afacere vecină (ofertă comună) sau cu un creator local care îți vizitează chiar locația.", en: "Team up with a neighbouring business (joint offer) or a local creator who actually visits your place." },
      },
    ],
  };
}
