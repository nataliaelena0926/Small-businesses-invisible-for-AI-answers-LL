/** Accepts "RO12345678" or "12345678" (2–10 digits); returns the numeric CUI or null. */
export function parseCui(input: string): number | null {
  const m = input.trim().replace(/\s+/g, "").match(/^(?:RO)?(\d{2,10})$/i);
  return m ? Number(m[1]) : null;
}

/** CUI format rule used by the business form: 2–10 digits, with or without the RO prefix. */
export function isCuiFormatValid(input: string): boolean {
  return parseCui(input) !== null;
}

const TEST_EMAIL_DOMAINS = ["example.com", "test.com", "mailinator.com"];

/** True for obvious throwaway or test email domains that must not create accounts. */
export function isTestEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  return TEST_EMAIL_DOMAINS.includes(domain);
}
