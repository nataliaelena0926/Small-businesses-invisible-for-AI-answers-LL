# GEO Audit SaaS MVP (English UI)

B2B app for small local businesses (cafés, tailors, thrift stores) that scores their digital presence and readiness for AI search (Generative Engine Optimization). All UI copy in English.

## Screens / flow
1. **Landing (/)** - value pitch, CTA to sign up.
2. **Auth (/auth)** - Login + Sign-up tabs, email/password and Google sign-in (Lovable Cloud).
3. **Business validation (/validate)** - company name, optional VAT/tax ID, industry (Cafe, Tailoring, Services, Retail). Mock check (simulated delay) that confirms the business exists and is a small business; on success continue.
4. **Diagnostic wizard (/assessment)** - step-by-step form with progress bar covering the 9 criteria: website, Google Maps presence, own domain + professional email, verified Google Business Profile, mobile-optimized site, clear UVP, integrated payments, review collection system, minimal CRM.
5. **Dashboard (/dashboard)** - score out of 100 (radial gauge), passed vs missing checklist, impact on AI visibility for each gap. Next step locked until a plan is chosen.
6. **Pricing (/pricing)** - Basic (one-time: profile fixes + AI-generated smart review QR code), Pro (one-time: deep audit + full custom implementation), Premium (monthly: all of the above + site maintenance, marketing strategies, AI search trend report, monthly AI review analysis). Mock checkout (Stripe-style confirmation), no real charges.

## Data
- Lovable Cloud: accounts, a businesses table and assessment answers/score per user, with per-user access rules.

## Design
Clean, conversion-focused SaaS look: warm off-white base, deep ink text, one bold accent (emerald), distinctive display font (Space Grotesk + DM Sans).

## Technical notes
- TanStack Start routes (not Next.js); protected pages under the authenticated layout.
- Score = weighted sum of the 9 criteria, unit-tested.
