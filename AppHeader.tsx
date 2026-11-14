import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">V</span>
      Visibly
    </Link>
  );
}

export function SignOutButton() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  return <Button variant="ghost" size="sm" onClick={async () => {
    await qc.cancelQueries(); qc.clear();
    const { error } = await supabase.auth.signOut();
    if (error) return;
    navigate({ to: "/auth", replace: true });
  }}>Sign out</Button>;
}

export function AppHeader({ step }: { step?: number }) {
  const steps = ["Business", "Assessment", "Diagnostic", "Plan"];
  return (
    <header className="border-b border-border bg-card/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Logo />
        {step !== undefined && (
          <ol className="hidden items-center gap-2 text-sm md:flex">
            {steps.map((s, i) => (
              <li key={s} className={`flex items-center gap-2 ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{i + 1}</span>
                {s}
                {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
              </li>
            ))}
          </ol>
        )}
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm"><Link to="/plan">My plan</Link></Button>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
