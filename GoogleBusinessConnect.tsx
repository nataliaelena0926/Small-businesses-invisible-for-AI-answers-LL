import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Unplug, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { googleBusinessStatus, startGoogleBusinessConnect, completeGoogleBusinessConnect, disconnectGoogleBusiness } from "@/lib/google-business.functions";
import { waitForGoogleBusiness } from "@/lib/google-business-client";

function GoogleMark() {
  return <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-[18px]"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>;
}

export function GoogleBusinessConnect({ onConnected }: { onConnected?: () => void }) {
  const statusFn = useServerFn(googleBusinessStatus);
  const startFn = useServerFn(startGoogleBusinessConnect);
  const completeFn = useServerFn(completeGoogleBusinessConnect);
  const disconnectFn = useServerFn(disconnectGoogleBusiness);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof googleBusinessStatus>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { let active = true; statusFn().then((result) => { if (active) setStatus(result); }).catch((e) => { if (active) setError(e.message); }); return () => { active = false; }; }, [statusFn]);
  async function connect() {
    if (!status?.configured) { setMessage("Google setup is pending. The app owner must configure an approved Google OAuth client. No Google account was connected."); return; }
    const popup = window.open("", "visibly-business-connect", "width=600,height=720");
    if (!popup) { setError("Allow popups to connect Google Business Profile."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const { authorizationUrl } = await startFn();
      const completion = waitForGoogleBusiness(popup);
      popup.location.href = authorizationUrl;
      await completeFn({ data: await completion });
      setStatus(await statusFn()); setMessage("Google Business Profile connected successfully."); onConnected?.();
    } catch (e) { setError(e instanceof Error ? e.message : "Google authorization failed."); }
    finally { popup.close(); setBusy(false); }
  }
  const needsPublished = status?.configured && status.origin !== window.location.origin;
  return <div className="space-y-3">
    <p className="text-sm font-semibold">Google Business Profile</p>
    {needsPublished ? <Button asChild variant="outline" className="h-auto min-h-11 w-full whitespace-normal"><a href={`${status.origin}/validate`} target="_blank" rel="noopener noreferrer">Connect on published Visibly <ExternalLink className="size-4" /></a></Button> : <Button type="button" variant="outline" className="google-business-button h-auto min-h-11 w-full whitespace-normal" disabled={busy || !status} onClick={connect}><GoogleMark />{busy ? "Connecting…" : status?.connected ? "Reconnect Google Business account" : "Connect Google Business account"}</Button>}
    <p className="text-xs text-muted-foreground">{status?.connected ? "Authorized Google account connected." : "Official owner authorization · No Maps link or scraping."} {status && !status.configured && "Google configuration pending."}</p>
    {status && !status.configured && <Button type="button" variant="secondary" size="sm" className="h-auto min-h-9 whitespace-normal" onClick={() => setMessage("Demo business selected — no Google account was authorized. Premium Smart Review Manager uses fictional sample reviews.")}><FlaskConical className="size-4" />Try demo business connection</Button>}
    {status?.connected && <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={async () => { setBusy(true); setError(""); try { await disconnectFn(); setStatus(await statusFn()); setMessage("Google connection removed."); onConnected?.(); } catch (e) { setError(e instanceof Error ? e.message : "Could not disconnect."); } finally { setBusy(false); } }}><Unplug className="size-4" />Disconnect Google</Button>}
    {message && <p role="status" className="text-sm text-primary">{message}</p>}{error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
  </div>;
}