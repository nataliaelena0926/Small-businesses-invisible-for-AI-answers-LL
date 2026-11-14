import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { getMyBusiness } from "@/lib/business";
import { accountDestination } from "@/lib/account";
import { isSignupPasswordValid, MIN_PASSWORD_LENGTH, signupOutcome } from "@/lib/signup";
import { isTestEmail } from "@/lib/company";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Visibly" },
      { name: "description", content: "Log in or create your Visibly account." },
      { property: "og:title", content: "Sign in — Visibly" },
      { property: "og:description", content: "Log in or create your Visibly account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, ready } = useSession();
  useEffect(() => {
    if (!ready || !user) return;
    let active = true;
    getMyBusiness().then((business) => {
      if (active) navigate({ to: accountDestination(business), replace: true });
    }).catch(() => { if (active) navigate({ to: "/dashboard", replace: true }); });
    return () => { active = false; };
  }, [ready, user?.id, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && isTestEmail(email)) {
      toast.error("Please use a real email address — test domains like example.com, test.com and mailinator.com are not accepted.");
      return;
    }
    if (mode === "signup" && !isSignupPasswordValid(password)) {
      toast.error(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    setLoading(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } });
      setLoading(false);
      if (error) { toast.error(/weak|pwned|leak/i.test(error.message) ? "This password appears in known data leaks. Please choose a less common one." : error.message); return; }
      if (signupOutcome(data.session) === "signed-in") {
        toast.success("Account created. You're signed in.");
      } else {
        toast.info("Check your email to confirm your account.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) { toast.error(String(r.error.message ?? r.error)); return; }
    if (r.redirected) return;
  }

  if (!ready || user) return <div className="grid min-h-screen place-items-center text-muted-foreground">Opening your account…</div>;

  return (
    <div className="grid min-h-screen place-items-center bg-hero px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-soft">
        <Logo />
        <h1 className="mt-6 text-3xl font-bold">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-1 text-muted-foreground">Your free AI-visibility diagnostic is 3 minutes away.</p>
        <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "signup")} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Sign up</TabsTrigger>
            <TabsTrigger value="login">Log in</TabsTrigger>
          </TabsList>
        </Tabs>
        <button type="button" onClick={google} className="mt-6 flex w-full items-center justify-center gap-[10px] rounded-md border border-[#747775] bg-[#FFFFFF] px-3 py-2.5 text-sm font-medium text-[#1F1F1F]">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
          Continue with Google
        </button>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" required minLength={mode === "signup" ? MIN_PASSWORD_LENGTH : undefined} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} />{mode === "signup" && <p className="text-xs text-muted-foreground">At least 6 characters. No capitals, numbers or symbols required, but very common passwords are refused.</p>}</div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}</Button>
        </form>
      </div>
    </div>
  );
}
