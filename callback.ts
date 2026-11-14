import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/google-business/callback")({
  server: { handlers: { GET: ({ request }) => {
    // No credentials are redeemed here. The authenticated opener consumes the
    // owner-bound, single-use state and PKCE grant in a protected server function.
    const url = new URL(request.url);
    const state = url.searchParams.get("state") ?? "";
    const code = url.searchParams.get("code") ?? "";
    const ok = !url.searchParams.has("error") && state.length >= 32 && state.length <= 128 && code.length > 0 && code.length <= 4096;
    const message = JSON.stringify({ type: "visibly-google-business", ok, state: ok ? state : null, code: ok ? code : null }).replace(/</g, "\\u003c");
    const nonce = crypto.randomUUID();
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Google Business Profile connection — Visibly</title></head><body><p>${ok ? "Returning to Visibly to finish your connection…" : "Google authorization was not completed. Return to Visibly and try again."}</p><script nonce="${nonce}">history.replaceState(null,"",location.pathname);if(window.opener){window.opener.postMessage(${message},location.origin);window.close();}</script></body></html>`;
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'` } });
  } } },
});