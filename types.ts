export type Answer = "full" | "partial" | "none";
export type PlanId = "start" | "maintain" | "reviews" | "complete";

export interface AppUser {
  id: string;
  email: string;
  aiOptIn: boolean;
}

export interface Business {
  name: string;
  cui: string | null;
  domain: string;
}

export interface Profile {
  storeName: string;
  address: string;
  city: string;
  phone: string;
  features: Record<string, boolean>;
}

export type Assessment = Record<string, Answer>;

export interface SiteCheck {
  id: string;
  pass: boolean;
  detail?: string;
}

export interface SiteAudit {
  url: string; // adresa finala, dupa redirecturi
  fetchedAt: string;
  ms: number;
  title: string;
  score: number; // 0-100
  checks: SiteCheck[];
  clientRendered?: boolean; // static fetch saw little text; shown as a notice, never a penalty
}

export interface DayHours {
  open: string; // "09:00" sau "" daca nu e completat
  close: string;
  closed: boolean;
}

/** Informatiile suplimentare din care se genereaza site-ul. */
export interface SiteInfo {
  lang: "ro" | "en";
  tagline: string;
  description: string;
  services: { name: string; price: string }[];
  hours: Record<string, DayHours>;
  email: string;
  imageUrl: string;
  publishUrl: string;
  accent: string;
  style: "light" | "warm" | "dark";
}

export interface ScorePoint {
  at: string;
  score: number;
}

export interface AppState {
  business: Business | null;
  profile: Profile | null;
  assessment: Assessment | null;
  plan: PlanId | null;
  websiteUrl: string | null;
  siteAudit: SiteAudit | null;
  tasksDone: string[];
  reviewLink: string | null;
  siteInfo: SiteInfo | null;
  siteHistory: ScorePoint[]; // scorul tehnic la fiecare reverificare
  reviewsText: string; // recenziile introduse de proprietar, una pe linie
}

export const EMPTY_STATE: AppState = {
  business: null,
  profile: null,
  assessment: null,
  plan: null,
  websiteUrl: null,
  siteAudit: null,
  tasksDone: [],
  reviewLink: null,
  siteInfo: null,
  siteHistory: [],
  reviewsText: "",
};
