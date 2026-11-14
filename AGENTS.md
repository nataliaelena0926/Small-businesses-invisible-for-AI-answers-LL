<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Tax IDs are verified via ANAF server-side; checkout is still a demo but plan changes go only through the choose_plan DB function (trigger blocks direct writes), and paid server functions re-check the plan; why: client code must never grant itself a package.
- Keep package prices in the shared browser-safe plans module used by both pricing and demo checkout; why: a single tested catalog prevents inconsistent amounts.
- Scoring weights live in CRITERIA (src/lib/criteria.ts) and must sum to 100; why: tested invariant.
- Share session state from the root's single auth subscriber; why: returning accounts and navigation must reflect persisted sessions without competing listeners.
- Signup outcomes depend on the actual returned session, with navigation handled by the shared subscriber; why: immediate signup must work without falsely treating a confirmation-pending account as signed in.
- Compute Premium preview data separately from saved assessment answers; why: simulated completion must never overwrite actual business results.
- Keep interactive Premium demonstrations in a dedicated browser-safe view module with explicitly fictional content; why: previews must not issue live Maps requests or imply actual business services exist.
- Official Business Profile OAuth uses owner-bound expiring state, PKCE and encrypted server-only refresh tokens; why: onboarding must not share merchant credentials or expose tokens to browsers.
- Smart Review Manager separates Google-format fictional fixtures and simulated drafting/posting from authenticated official review reads and approved PUT replies; why: a functional MVP demo must never imply an actual Google action occurred.
- Vizibil "My plan" tools live in src/vizibil (ported modules, own criteria/i18n) and map Visibly packages to their tiers via src/vizibil/mapping.ts; why: keeps the imported feature set isolated from Visibly's tested scoring and prices.
- My plan workspace data (profile, site info, steps, reviews, audit history) is stored per account in browser storage; why: demo MVP without new tables — move to the database before real launch.
