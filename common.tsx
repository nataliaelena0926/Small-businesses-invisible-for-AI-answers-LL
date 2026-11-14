

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy, Lock } from "lucide-react";
import { Button } from "@/vizibil/ui/button";
import { Card } from "@/vizibil/ui/card";
import { useL } from "@/vizibil/lib/i18n";
import type { AppState, AppUser, PlanId } from "@/vizibil/lib/types";

export interface TabProps {
  user: AppUser;
  state: AppState;
  /** Actualizeaza starea locala dupa o salvare, ca tab-urile sa ramana sincronizate. */
  patch: (p: Partial<AppState>) => void;
}

export function Locked({ need, text }: { need: PlanId; text: string }) {
  const L = useL();
  const planName = need === "start" ? "Basic" : need === "complete" ? "Premium" : "Pro";
  return (
    <Card className="mt-6 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
      <div className="flex gap-3">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-stone-400" />
        <p className="text-sm text-stone-600">{text}</p>
      </div>
      <Link to="/pricing" className="shrink-0">
        <Button>{L("Treci la ", "Switch to ")}{planName}</Button>
      </Link>
    </Card>
  );
}

export function CodeBlock({ title, code, hint }: { title: string; code: string; hint?: string }) {
  const L = useL();
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold">{title}</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            await navigator.clipboard.writeText(code).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? L("Copiat", "Copied") : L("Copiază", "Copy")}
        </Button>
      </div>
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
      <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-stone-900 p-4 font-mono text-xs leading-relaxed text-stone-100">{code}</pre>
    </div>
  );
}
