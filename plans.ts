export type PlanId = "basic" | "pro" | "premium";

export interface PlanFeature {
  text: string;
  included: boolean;
  /** Package that adds this feature when it is not part of this plan. */
  includedIn?: PlanId;
}

export interface Plan {
  id: PlanId;
  /** Display name on the card. */
  name: string;
  kicker: string;
  price: number;
  period: string;
  tagline: string;
  badge?: string;
  highlight?: boolean;
  note?: string;
  cta: string;
  features: PlanFeature[];
}

/**
 * The single package catalog used by the pricing page and the demo checkout.
 * Pro is the highlighted monthly subscription; Start is a one-time payment.
 * Keep every amount here — the checkout dialog and the tests read the same numbers.
 */
export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Start",
    kicker: "Digital Foundation",
    price: 29,
    period: "one-time",
    tagline: "For owners who just want the site finished, without monitoring.",
    cta: "Take just the site (€29)",
    features: [
      { text: "Readiness Score and the exact list of what is missing", included: true },
      { text: "Site generated in 10 minutes — or the code additions for the site you already have", included: true },
      { text: "**No lock-in:** download the site and it stays yours", included: true },
      { text: "QR code for collecting reviews at the location", included: false, includedIn: "pro" },
      { text: "Score re-checks over time and an alert when something breaks", included: false, includedIn: "pro" },
      { text: "Reviews grouped by theme", included: false, includedIn: "pro" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    kicker: "Maintenance & Reviews",
    price: 19,
    period: "/ month",
    badge: "The main package for active businesses",
    highlight: true,
    note: "under €1 a day",
    tagline: "Everything you need to keep your visibility over time and understand reviews without losing hours.",
    cta: "Choose the Pro subscription (€19/month)",
    features: [
      { text: "**Everything in Start** — the generated site plus the QR code included", included: true },
      { text: "Automatic score re-checks: a chart with the history over time and an instant alert when the score drops", included: true },
      { text: "Protection against outdated data: we tell you when the schedule or the prices need updating", included: true },
      { text: "Reviews grouped by theme: see what customers like without reading hundreds of comments", included: true },
      { text: "A calm action plan: at most 3 concrete things to improve, taken from the reviews", included: true },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    kicker: "Growth & Market",
    price: 35,
    period: "/ month",
    tagline: "Advanced option for businesses that want market inspiration and frequent campaigns.",
    cta: "Choose Premium (€35/month)",
    features: [
      { text: "**Everything in the Pro subscription**, plus:", included: true },
      { text: "Analysis of the large businesses in your niche: what their customers like and what they complain about", included: true },
      { text: "Seasonal promotion trends and ideas adapted to your field", included: true },
      { text: "Changes on request: improved texts whenever you change your offer", included: true },
    ],
  },
];

export const planOf = (id: PlanId) => PLANS.find((p) => p.id === id);
