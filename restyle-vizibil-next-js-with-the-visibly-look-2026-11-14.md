# Restyle "Vizibil" (Next.js) with the Visibly look

## What I need first
The upload has only setup files (package.json, Tailwind config, README). The pages and components (the `src` folder) are missing. Please upload the whole project as a ZIP, without `node_modules`, `.next` and `.env.local`.

## What I will do
1. Unpack your project in a separate work area. Your current Visibly app stays the same.
2. Apply the Visibly look: warm off-white background, dark ink text, one emerald accent color, Space Grotesk headings and DM Sans text, rounded cards and soft shadows.
3. Restyle every screen in your flow so it looks like Visibly: login/signup, the business, profile and assessment steps, dashboard (score gauge, missing and passed lists), pricing, and the "My plan" page.
4. Keep all your features and Romanian text as they are. I only change how things look, not what they do.
5. Check that it builds and take screenshots of the main pages.
6. Send it back to you as a downloadable ZIP.

## Technical details
- Update tailwind.config.ts with the Visibly color tokens (HSL variables in globals.css, since your project uses Tailwind 3) and font families. Load the fonts with next/font/google instead of Geist.
- Keep the class names in your components but point them to those tokens, and restyle the shadcn-style UI pieces (button, card, input).
- No changes to the Supabase logic, the mock Stripe checkout or the site generator.
- Leave out node_modules, .next and any env/secret files when packaging the ZIP.
