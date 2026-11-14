import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";
import { GOOGLE_BUSINESS_SCOPE, ownsLocation } from "./google-business";

export function googleConfig() {
  const clientId = process.env["GOOGLE_BUSINESS_CLIENT_ID"];
  const clientSecret = process.env["GOOGLE_BUSINESS_CLIENT_SECRET"];
  const origin = process.env["GOOGLE_BUSINESS_APP_ORIGIN"];
  const tokenKey = process.env["GOOGLE_BUSINESS_TOKEN_KEY"];
  if (!clientId || !clientSecret || !origin || !tokenKey) return null;
  const url = new URL(origin);
  if (url.protocol !== "https:") throw new Error("Google connection requires a published HTTPS address.");
  return { clientId, clientSecret, origin: url.origin, redirectUri: `${url.origin}/api/public/google-business/callback` };
}

function key() {
  const value = process.env["GOOGLE_BUSINESS_TOKEN_KEY"];
  if (!value) throw new Error("Google connection encryption is not configured.");
  return createHash("sha256").update(value).digest();
}
export function seal(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64");
}
export function unseal(value: string) {
  const buffer = Buffer.from(value, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key(), buffer.subarray(0, 12));
  decipher.setAuthTag(buffer.subarray(12, 28));
  return Buffer.concat([decipher.update(buffer.subarray(28)), decipher.final()]).toString("utf8");
}
export const hash = (value: string) => createHash("sha256").update(value).digest("hex");
export const nonce = () => randomBytes(32).toString("base64url");
export const challenge = (value: string) => createHash("sha256").update(value).digest("base64url");

export async function tokenRequest(body: URLSearchParams) {
  const config = googleConfig();
  if (!config) throw new Error("Google Business Profile setup is incomplete.");
  body.set("client_id", config.clientId);
  body.set("client_secret", config.clientSecret);
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body });
  const result = await response.json() as { access_token?: string; refresh_token?: string; scope?: string; error?: string };
  if (!response.ok) {
    console.error("Google OAuth request failed", response.status, result.error ?? "unknown");
    if (result.error === "invalid_grant") throw new Error("Your Google authorization expired. Reconnect Google Business Profile.");
    throw new Error(`Google authorization failed (${response.status}). Check the Google OAuth configuration.`);
  }
  if (!result.access_token) throw new Error("Google did not return an access grant.");
  return result;
}

export async function accessToken(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("google_business_connections").select("refresh_token_ciphertext").eq("user_id", userId).maybeSingle();
  if (error) throw new Error("Could not read your Google connection.");
  if (!data) throw new Error("Connect Google Business Profile first.");
  const tokens = await tokenRequest(new URLSearchParams({ grant_type: "refresh_token", refresh_token: unseal(data.refresh_token_ciphertext) }));
  if (!tokens.access_token) throw new Error("Google authorization is unavailable.");
  return tokens.access_token;
}

export async function googleGet<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { error?: { status?: string; message?: string } } | null;
    console.error("Google Business Profile request failed", response.status, error?.error?.status, error?.error?.message);
    if (response.status === 403) throw new Error(`Google denied access (403): ${error?.error?.message ?? "Check Business Profile API approval and profile permissions."}`);
    if (response.status === 429) throw new Error("Google's request limit was reached. Please try again later.");
    throw new Error(`Google Business Profile request failed (${response.status}): ${error?.error?.message ?? "Please try again later."}`);
  }
  return response.json() as Promise<T>;
}
export type Account = { name: string; accountName?: string };
export type Location = { name: string; title?: string };
export async function requireAccount(token: string, account: string) {
  let next: string | undefined;
  for (let page = 0; page < 20; page++) {
    const url = new URL("https://mybusinessaccountmanagement.googleapis.com/v1/accounts");
    url.searchParams.set("pageSize", "20");
    if (next) url.searchParams.set("pageToken", next);
    const data = await googleGet<{ accounts?: Account[]; nextPageToken?: string }>(url.href, token);
    if (data.accounts?.some((item) => item.name === account)) return;
    next = data.nextPageToken;
    if (!next) break;
  }
  throw new Error("This account is not available through your Google authorization.");
}
export async function requireLocation(token: string, account: string, location: string) {
  await requireAccount(token, account);
  let next: string | undefined;
  for (let page = 0; page < 20; page++) {
    const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${account}/locations`);
    url.searchParams.set("readMask", "name,title");
    url.searchParams.set("pageSize", "100");
    if (next) url.searchParams.set("pageToken", next);
    const data = await googleGet<{ locations?: Location[]; nextPageToken?: string }>(url.href, token);
    if (ownsLocation(data.locations ?? [], location)) return;
    next = data.nextPageToken;
    if (!next) break;
  }
  throw new Error("This location is not managed by your authorized Google account.");
}
export { GOOGLE_BUSINESS_SCOPE };