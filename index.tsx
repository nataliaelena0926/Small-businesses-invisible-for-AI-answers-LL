import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo, SignOutButton } from "@/components/AppHeader";
import { useSession } from "@/lib/session";
import { CRITERIA } from "@/lib/criteria";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visibly — Get recommended by AI search" },
      { name: "description", content: "Free Readiness Score diagnostic that shows how findable your local business is to ChatGPT, Gemini and Google AI." },
      { property: "og:title", content: "Visibly — Get recommended by AI search" },
      { property: "og:description", content: "Free diagnostic for cafés, tailors and local shops." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, ready } = useSession();
  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" disabled={!ready}><Link to={user ? "/dashboard" : "/auth"}>{user ? "My dashboard" : "Sign in"}</Link></Button>
          {user && <SignOutButton />}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12">
        <div className="max-w-3xl">
          <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">Generative Engine Optimization for small businesses</span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] md:text-7xl">When customers ask AI where to go, <span className="text-primary">be the answer.</span></h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">Cafés, tailors and local shops are losing customers to AI assistants that can't find them. Get your free Readiness Score in 3 minutes.</p>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg"><Link to={user ? "/dashboard" : "/auth"}>{user ? "Open my dashboard" : "Get my free score"}</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to={user ? "/pricing" : "/auth"}>See pricing</Link></Button>
          </div>
        </div>
        <div className="mt-20 grid gap-4 sm:grid-cols-3">
          {CRITERIA.slice(0, 6).map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.impact}</p>
            </div>
          ))}
        </div>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <p className="max-w-3xl text-xs text-muted-foreground">
            <span className="font-semibold">MVP status — next in production:</span> mandatory email confirmation against impersonation, live CUI verification through the ANAF API, Stripe payment processing, and automatic re-checks scheduled on the server.
          </p>
        </div>
      </footer>
    </div>
  );
}
