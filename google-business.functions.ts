import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { GOOGLE_BUSINESS_SCOPE, OAUTH_LIFETIME_MS, validOAuthRequest, validResource, starCount } from "./google-business";

async function requirePremium(context: { userId: string; supabase: import("@supabase/supabase-js").SupabaseClient<import("@/integrations/supabase/types").Database> }) {
  setResponseHeader("Cache-Control", "no-store");
  const { data, error } = await context.supabase.from("businesses").select("plan").eq("user_id", context.userId).maybeSingle();
  if (error || data?.plan !== "premium") throw new Error("Smart Review Manager requires Premium.");
}
const pageInput = z.object({ pageToken: z.string().max(2048).optional() });
const accountInput = pageInput.extend({ account: z.string().refine((value) => validResource(value, "accounts")) });
const reviewInput = accountInput.extend({ location: z.string().refine((value) => validResource(value, "locations")) });

export const googleBusinessStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  setResponseHeader("Cache-Control", "no-store");
  const { googleConfig } = await import("./google-business.server");
  const config = googleConfig();
  if (!config) return { configured: false, connected: false, origin: null };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("google_business_connections").select("connected_at").eq("user_id", context.userId).maybeSingle();
  if (error) throw new Error("Could not check your Google connection.");
  return { configured: true, connected: !!data, origin: config.origin };
});

export const startGoogleBusinessConnect = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  setResponseHeader("Cache-Control", "no-store");
  const { googleConfig, nonce, hash, seal, challenge } = await import("./google-business.server");
  const config = googleConfig();
  if (!config) throw new Error("Google Business Profile setup is incomplete.");
  if (getRequest().headers.get("origin") !== config.origin) throw new Error("Connect Google from the published Visibly website.");
  const state = nonce();
  const verifier = nonce();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("google_business_oauth_requests").delete().eq("user_id", context.userId);
  const { error } = await supabaseAdmin.from("google_business_oauth_requests").insert({ state_hash: hash(state), user_id: context.userId, verifier_ciphertext: seal(verifier), redirect_uri: config.redirectUri, expires_at: new Date(Date.now() + OAUTH_LIFETIME_MS).toISOString() });
  if (error) throw new Error("Could not start Google authorization.");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.redirectUri, response_type: "code", scope: GOOGLE_BUSINESS_SCOPE, access_type: "offline", prompt: "consent", state, code_challenge: challenge(verifier), code_challenge_method: "S256" }).toString();
  return { authorizationUrl: url.href };
});

export const completeGoogleBusinessConnect = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ state: z.string().min(32).max(128), code: z.string().min(1).max(4096) }))
  .handler(async ({ context, data }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { hash, unseal, tokenRequest, seal } = await import("./google-business.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Atomic consume binds the grant to this user and prevents replay.
    const { data: pending, error } = await supabaseAdmin.from("google_business_oauth_requests").delete().eq("state_hash", hash(data.state)).eq("user_id", context.userId).select("*").maybeSingle();
    if (error || !validOAuthRequest(pending, context.userId) || !pending) throw new Error("Authorization expired or was already used. Connect again.");
    const tokens = await tokenRequest(new URLSearchParams({ grant_type: "authorization_code", code: data.code, redirect_uri: pending.redirect_uri, code_verifier: unseal(pending.verifier_ciphertext) }));
    if (!tokens.scope?.split(" ").includes(GOOGLE_BUSINESS_SCOPE)) throw new Error("Google Business Profile permission was not granted. Connect again and allow profile access.");
    if (!tokens.refresh_token) throw new Error("Google did not grant continuing access. Connect again.");
    const { error: saveError } = await supabaseAdmin.from("google_business_connections").upsert({ user_id: context.userId, refresh_token_ciphertext: seal(tokens.refresh_token), connected_at: new Date().toISOString() });
    if (saveError) throw new Error("Could not save your Google connection. Please reconnect.");
    return { ok: true };
  });

export const listGoogleBusinessAccounts = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(pageInput).handler(async ({ context, data }) => {
  setResponseHeader("Cache-Control", "no-store");
  const { accessToken, googleGet } = await import("./google-business.server");
  const token = await accessToken(context.userId);
  const url = new URL("https://mybusinessaccountmanagement.googleapis.com/v1/accounts");
  url.searchParams.set("pageSize", "20");
  if (data.pageToken) url.searchParams.set("pageToken", data.pageToken);
  const result = await googleGet<{ accounts?: { name: string; accountName?: string }[]; nextPageToken?: string }>(url.href, token);
  return { accounts: (result.accounts ?? []).map((account) => ({ name: account.name, title: account.accountName ?? account.name })), nextPageToken: result.nextPageToken ?? null };
});

export const listGoogleBusinessLocations = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(accountInput).handler(async ({ context, data }) => {
  setResponseHeader("Cache-Control", "no-store");
  const { accessToken, googleGet, requireAccount } = await import("./google-business.server");
  const token = await accessToken(context.userId);
  await requireAccount(token, data.account);
  const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${data.account}/locations`);
  url.searchParams.set("readMask", "name,title");
  url.searchParams.set("pageSize", "100");
  if (data.pageToken) url.searchParams.set("pageToken", data.pageToken);
  const result = await googleGet<{ locations?: { name: string; title?: string }[]; nextPageToken?: string }>(url.href, token);
  return { locations: (result.locations ?? []).map((location) => ({ name: location.name, title: location.title ?? location.name })), nextPageToken: result.nextPageToken ?? null };
});

export const listGoogleBusinessReviews = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(reviewInput).handler(async ({ context, data }) => {
  await requirePremium(context);
  const { accessToken, googleGet, requireLocation } = await import("./google-business.server");
  const token = await accessToken(context.userId);
  await requireLocation(token, data.account, data.location);
  const url = new URL(`https://mybusiness.googleapis.com/v4/${data.account}/${data.location}/reviews`);
  url.searchParams.set("pageSize", "50");
  url.searchParams.set("orderBy", "updateTime desc");
  if (data.pageToken) url.searchParams.set("pageToken", data.pageToken);
  const result = await googleGet<{ reviews?: { reviewId: string; reviewer?: { displayName?: string }; starRating?: string; comment?: string; updateTime?: string; reviewReply?: { comment?: string } }[]; nextPageToken?: string; averageRating?: number; totalReviewCount?: number }>(url.href, token);
  return { reviews: (result.reviews ?? []).map((review) => ({ id: review.reviewId, author: review.reviewer?.displayName ?? "Google user", stars: starCount(review.starRating ?? ""), comment: review.comment ?? "", updatedAt: review.updateTime ?? null, reply: review.reviewReply?.comment ?? null })), nextPageToken: result.nextPageToken ?? null, averageRating: result.averageRating ?? null, totalReviewCount: result.totalReviewCount ?? null };
});

export const disconnectGoogleBusiness = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  setResponseHeader("Cache-Control", "no-store");
  // Allow disconnection even after a plan downgrade.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { unseal } = await import("./google-business.server");
  const { data, error } = await supabaseAdmin.from("google_business_connections").select("refresh_token_ciphertext").eq("user_id", context.userId).maybeSingle();
  if (error) throw new Error("Could not read your Google connection.");
  if (data) {
    const response = await fetch("https://oauth2.googleapis.com/revoke", { method: "POST", body: new URLSearchParams({ token: unseal(data.refresh_token_ciphertext) }) });
    if (!response.ok && response.status !== 400) throw new Error(`Google could not revoke access (${response.status}). Try again.`);
    const { error: deleteError } = await supabaseAdmin.from("google_business_connections").delete().eq("user_id", context.userId);
    if (deleteError) throw new Error("Could not remove your Google connection.");
  }
  const { error: pendingError } = await supabaseAdmin.from("google_business_oauth_requests").delete().eq("user_id", context.userId);
  if (pendingError) throw new Error("Could not clear pending Google authorization.");
  return { ok: true };
});

export const postGoogleReviewReply = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(reviewInput.extend({ reviewId: z.string().regex(/^[A-Za-z0-9_-]{1,256}$/), comment: z.string().trim().min(1).max(4096), approved: z.literal(true) }))
  .handler(async ({ context, data }) => {
    await requirePremium(context);
    const { accessToken, requireLocation, googleGet } = await import("./google-business.server");
    const token = await accessToken(context.userId);
    await requireLocation(token, data.account, data.location);
    const reviewUrl = `https://mybusiness.googleapis.com/v4/${data.account}/${data.location}/reviews/${data.reviewId}`;
    const current = await googleGet<{ reviewReply?: { comment?: string } }>(reviewUrl, token);
    if (current.reviewReply?.comment) throw new Error("This review already has an official reply. Refresh the reviews before continuing.");
    const response = await fetch(`${reviewUrl}/reply`, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ comment: data.comment }) });
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
      console.error("Google review reply failed", response.status, body?.error?.message);
      throw new Error(`Google reply failed (${response.status}): ${body?.error?.message ?? "Refresh reviews to check whether a reply was posted before trying again."}`);
    }
    // Read back the official reply; never retry a mutation after an uncertain result.
    const saved = await googleGet<{ reviewReply?: { comment?: string } }>(reviewUrl, token);
    return { reply: saved.reviewReply?.comment ?? null };
  });