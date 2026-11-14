import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageSquare, Sparkles, Check, Send, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GoogleBusinessConnect } from "./GoogleBusinessConnect";
import { sampleReviews, demoReply, validateReply, type ManagedReview } from "@/lib/smart-reviews";
import { listGoogleBusinessAccounts, listGoogleBusinessLocations, listGoogleBusinessReviews, postGoogleReviewReply } from "@/lib/google-business.functions";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

export function SmartReviewManager({ name, industry }: { name: string; industry: string }) {
  const accountsFn = useServerFn(listGoogleBusinessAccounts);
  const locationsFn = useServerFn(listGoogleBusinessLocations);
  const reviewsFn = useServerFn(listGoogleBusinessReviews);
  const postFn = useServerFn(postGoogleReviewReply);
  const [mode, setMode] = useState<"demo" | "official">("demo");
  const [reviews, setReviews] = useState<ManagedReview[]>(sampleReviews.map((r) => ({ ...r })));
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [accounts, setAccounts] = useState<{ name: string; title: string }[]>([]);
  const [locations, setLocations] = useState<{ name: string; title: string }[]>([]);
  const [account, setAccount] = useState("");
  const [location, setLocation] = useState("");
  const [nextAccounts, setNextAccounts] = useState<string | null>(null);
  const [nextLocations, setNextLocations] = useState<string | null>(null);
  const [nextReviews, setNextReviews] = useState<string | null>(null);
  async function run(action: () => Promise<void>) { setBusy(true); setError(""); setNotice(""); try { await action(); } catch (e) { setError(e instanceof Error ? e.message : "Could not complete this action."); } finally { setBusy(false); } }
  function reset(nextMode: "demo" | "official") { setMode(nextMode); setReviews(nextMode === "demo" ? sampleReviews.map((r) => ({ ...r })) : []); setDrafts({}); setConfirm(null); setError(""); setNotice(""); setAccount(""); setLocation(""); setAccounts([]); setLocations([]); setNextAccounts(null); setNextLocations(null); setNextReviews(null); }
  async function loadAccounts(pageToken?: string) { const result = await accountsFn({ data: { pageToken } }); setAccounts((old) => pageToken ? [...old, ...result.accounts] : result.accounts); setNextAccounts(result.nextPageToken); if (!result.accounts.length) setNotice("No authorized accounts returned by Google."); }
  async function loadLocations(pageToken?: string) { const result = await locationsFn({ data: { account, pageToken } }); setLocations((old) => pageToken ? [...old, ...result.locations] : result.locations); setNextLocations(result.nextPageToken); if (!result.locations.length) setNotice("No locations returned for this account."); }
  async function loadReviews(pageToken?: string) { const result = await reviewsFn({ data: { account, location, pageToken } }); setReviews(result.reviews); setNextReviews(result.nextPageToken); setDrafts({}); if (!result.reviews.length) setNotice("No reviews returned. Google reviews require an eligible verified profile."); }
  async function approve() {
    if (!confirm) return;
    const id = confirm;
    await run(async () => {
      const text = validateReply(drafts[id] ?? "", true);
      if (mode === "demo") { setReviews((old) => old.map((review) => review.id === id ? { ...review, reply: text } : review)); setNotice("Demo reply approved — nothing was posted to Google."); }
      else { const result = await postFn({ data: { account, location, reviewId: id, comment: text, approved: true } }); if (!result.reply) throw new Error("Google accepted the request, but the reply was not confirmed. Refresh reviews before any further action."); setReviews((old) => old.map((review) => review.id === id ? { ...review, reply: result.reply } : review)); setNotice("Official reply confirmed by Google."); }
    });
    setConfirm(null);
  }
  const selected = reviews.find((review) => review.id === confirm);
  const selectStyle = "h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm";
  return <section className="mt-10 border-t border-border pt-8" aria-label="Smart Review Manager">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="flex items-center gap-2 text-2xl font-bold"><MessageSquare className="size-5 text-primary" />Smart Review Manager</h2><p className="mt-2 text-sm text-muted-foreground">Review replies · Premium</p></div><div className="flex gap-2" role="group" aria-label="Review data source"><Button variant={mode === "demo" ? "default" : "outline"} disabled={busy} onClick={() => reset("demo")} aria-pressed={mode === "demo"}><FlaskConical className="size-4" />Demo</Button><Button variant={mode === "official" ? "default" : "outline"} disabled={busy} onClick={() => reset("official")} aria-pressed={mode === "official"}>Official Google</Button></div></div>
    <p className="mt-4 text-sm text-muted-foreground">{mode === "demo" ? "Fictional sample reviews in Google's API format. Reply generation and posting are simulated; no Google authorization or AI call is made." : "Only reviews from profiles you are authorized to manage. Draft generation is simulated; official posting requires your approval. Review content is not stored or sent to AI."}</p>
    {mode === "official" && <div className="mt-6 space-y-4"><GoogleBusinessConnect onConnected={() => reset("official")} /><Button variant="outline" disabled={busy} onClick={() => run(() => loadAccounts())}>Load authorized accounts</Button>{!!accounts.length && <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-3"><label htmlFor="review-account" className="text-sm font-medium">Google account</label><select id="review-account" className={selectStyle} value={account} disabled={busy} onChange={(e) => { setAccount(e.target.value); setLocations([]); setLocation(""); setReviews([]); setDrafts({}); setNextLocations(null); setNextReviews(null); }}><option value="">Select account</option>{accounts.map((item) => <option key={item.name} value={item.name}>{item.title}</option>)}</select><Button variant="outline" disabled={!account || busy} onClick={() => run(() => loadLocations())}>Load locations</Button>{nextAccounts && <Button variant="ghost" disabled={busy} onClick={() => run(() => loadAccounts(nextAccounts))}>More accounts</Button>}</div>{!!locations.length && <div className="space-y-3"><label htmlFor="review-location" className="text-sm font-medium">Business location</label><select id="review-location" className={selectStyle} value={location} disabled={busy} onChange={(e) => { setLocation(e.target.value); setReviews([]); setDrafts({}); setNextReviews(null); }}><option value="">Select business</option>{locations.map((item) => <option key={item.name} value={item.name}>{item.title}</option>)}</select><Button disabled={!location || busy} onClick={() => run(() => loadReviews())}>Read official reviews</Button>{nextLocations && <Button variant="ghost" disabled={busy} onClick={() => run(() => loadLocations(nextLocations))}>More locations</Button>}</div>}</div>}</div>}
    {error && <p role="alert" className="mt-4 break-words text-sm text-destructive">{error}</p>}{notice && <p role="status" className="mt-4 text-sm text-primary">{notice}</p>}
    <div className="mt-6 divide-y divide-border">{reviews.map((review) => <article key={review.id} className="py-6"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">{review.author}</h3><p className="text-sm text-warning">{review.stars ?? "—"}/5</p></div><p className="mt-2 text-xs text-muted-foreground">{review.updatedAt?.slice(0, 10)} · {mode === "demo" ? "Fictional review" : "Source: Google Business Profile"}</p><p className="mt-3 whitespace-pre-wrap break-words text-sm">{review.comment || "Rating only"}</p>{review.reply ? <div className="mt-4 border-l-2 border-primary pl-4"><p className="flex items-center gap-2 text-sm font-medium text-primary"><Check className="size-4" />{mode === "demo" ? "Demo reply" : "Official business reply"}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">{review.reply}</p></div> : <div className="mt-4"><Button variant="outline" disabled={busy} onClick={() => run(async () => { await new Promise((resolve) => setTimeout(resolve, 650)); setDrafts((old) => ({ ...old, [review.id]: demoReply(review, name, industry) })); })}><Sparkles className="size-4" />Generate GEO reply</Button>{drafts[review.id] !== undefined && <div className="mt-4 space-y-3"><label htmlFor={`reply-${review.id}`} className="text-sm font-medium">Editable reply · Simulated AI draft</label><Textarea id={`reply-${review.id}`} value={drafts[review.id]} maxLength={4096} disabled={busy} className="min-h-32" onChange={(e) => setDrafts((old) => ({ ...old, [review.id]: e.target.value }))} /><Button disabled={busy || !drafts[review.id]?.trim()} onClick={() => setConfirm(review.id)} className="h-auto min-h-10 whitespace-normal"><Send className="size-4" />{mode === "demo" ? "Approve & simulate posting" : "Approve & post officially"}</Button></div>}</div>}</article>)}</div>
    {nextReviews && <Button variant="outline" disabled={busy} onClick={() => run(() => loadReviews(nextReviews))}>Next 50 reviews</Button>}
    <AlertDialog open={confirm !== null} onOpenChange={(open) => { if (!open && !busy) setConfirm(null); }}><AlertDialogContent className="max-h-[85dvh] overflow-y-auto"><AlertDialogHeader><AlertDialogTitle>{mode === "demo" ? "Approve this demo reply?" : "Post this reply to Google?"}</AlertDialogTitle><AlertDialogDescription>{mode === "demo" ? "This changes the demonstration only. Nothing will be sent to Google." : "This will publish the exact text below as your official business reply."}</AlertDialogDescription></AlertDialogHeader><p className="text-sm font-semibold">{selected?.author}</p><p className="whitespace-pre-wrap break-words text-sm">{confirm ? drafts[confirm] : ""}</p><AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={(event) => { event.preventDefault(); void approve(); }}>{busy ? "Posting…" : mode === "demo" ? "Confirm demo reply" : "Confirm official posting"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>;
}