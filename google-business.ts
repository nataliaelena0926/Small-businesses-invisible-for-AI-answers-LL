export const GOOGLE_BUSINESS_SCOPE = "https://www.googleapis.com/auth/business.manage";
export const OAUTH_LIFETIME_MS = 10 * 60 * 1000;

export function validResource(value: string, kind: "accounts" | "locations") {
  return new RegExp(`^${kind}/[0-9]+$`).test(value);
}

export function ownsLocation(locations: { name: string }[], location: string) {
  return validResource(location, "locations") && locations.some((item) => item.name === location);
}

export function validOAuthRequest(request: { user_id: string; expires_at: string } | null, userId: string, now = Date.now()) {
  return !!request && request.user_id === userId && Date.parse(request.expires_at) > now;
}

export function starCount(rating: string) {
  return ({ ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 } as Record<string, number>)[rating] ?? null;
}