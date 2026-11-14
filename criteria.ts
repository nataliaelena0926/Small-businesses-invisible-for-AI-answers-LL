export type CriterionId =
  | "website" | "maps" | "domainEmail" | "gbp" | "mobile"
  | "uvp" | "payments" | "reviews" | "crm";

export type Criterion = { id: CriterionId; title: string; question: string; hint: string; weight: number; impact: string };

export const CRITERIA: Criterion[] = [
  { id: "website", title: "Website", question: "Does your business have a website?", hint: "Any live site customers can visit.", weight: 12, impact: "AI assistants cite websites as their primary source of facts about you." },
  { id: "maps", title: "Google Maps presence", question: "Does your business appear on Google Maps?", hint: "Search your name on Google Maps.", weight: 12, impact: "Local AI answers ('coffee near me') pull directly from map listings." },
  { id: "domainEmail", title: "Own domain & professional email", question: "Do you have your own domain and an email like hello@yourbrand.com?", hint: "Not @gmail.com or @yahoo.com.", weight: 8, impact: "A custom domain signals legitimacy to search engines and AI models." },
  { id: "gbp", title: "Google Business Profile", question: "Is your Google Business Profile created and verified?", hint: "Verified profiles show a checkmark in your dashboard.", weight: 15, impact: "Verified profiles are the most trusted local data source for AI search." },
  { id: "mobile", title: "Mobile-optimized website", question: "Does your website work well on phones?", hint: "Readable without zooming, buttons easy to tap.", weight: 11, impact: "Most AI-referred visits happen on mobile; poor mobile UX hurts ranking." },
  { id: "uvp", title: "Clear unique value proposition", question: "Can a visitor tell in 5 seconds what makes you different?", hint: "e.g. 'Specialty coffee roasted in-house daily'.", weight: 11, impact: "AI models recommend businesses they can describe in one clear sentence." },
  { id: "payments", title: "Integrated payments", question: "Can customers pay online or by card/contactless?", hint: "Online checkout, payment links or card terminal.", weight: 8, impact: "Convenience signals improve conversion from AI recommendations." },
  { id: "reviews", title: "Review collection system", question: "Do you actively collect and respond to customer reviews?", hint: "QR codes, follow-up messages, replies to reviews.", weight: 15, impact: "Review volume and sentiment are top factors in AI 'best of' answers." },
  { id: "crm", title: "Customer database (CRM)", question: "Do you keep a list of your customers and their contact details?", hint: "Even a spreadsheet counts.", weight: 8, impact: "A CRM lets you drive repeat visits and fresh reviews over time." },
];

export type Answers = Partial<Record<CriterionId, boolean>>;

export function computeScore(answers: Answers): number {
  const total = CRITERIA.reduce((s, c) => s + c.weight, 0);
  const got = CRITERIA.reduce((s, c) => s + (answers[c.id] ? c.weight : 0), 0);
  return Math.round((got / total) * 100);
}

export const INDUSTRIES = ["Cafe", "Tailoring", "Services", "Retail"] as const;

/** Basic name/format screening; the tax ID itself is verified against ANAF in validate. */
export async function validateBusiness(name: string, taxId?: string): Promise<{ ok: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 1200));
  const n = name.trim();
  if (n.length < 2) return { ok: false, message: "Please enter your registered business name." };
  if (/\b(corp|group|holding|international|global)\b/i.test(n))
    return { ok: false, message: "This looks like a large enterprise. Our service is built for small local businesses." };
  if (taxId && !/^(RO)?\d{2,10}$/i.test(taxId.trim()))
    return { ok: false, message: "That tax ID format doesn't look valid." };
  return { ok: true, message: `${n} is saved for the diagnostic.` };
}
