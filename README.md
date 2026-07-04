# DryForge — dryforge.ai

**Robot-assisted drywall finishing as a service. Pre-launch. Recruiting founding pilot partners in the GTA.**

DryForge is an early-stage venture developing semi-autonomous taping, mudding, and sanding robots supervised by trained operators, sold per finished square foot with no capex for contractors. This repository is the marketing site and product-interface demo.

**Honesty policy for this codebase:** the site publishes design targets and disclosed model assumptions — never fabricated metrics, fake customers, or certification claims. Case studies and performance numbers ship only after pilots measure them. Keep it that way.

## Status

- No deployed robots. No customers. No certifications. The site says so plainly.
- `/dashboard` is a product-interface demo with sample data (labeled as such).
- The chatbot is scripted (labeled as such).
- The ROI calculator is a planning model with disclosed assumptions.

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- Framer Motion (client components only)
- Clerk (optional — auth UI and `/dashboard` gating activate only when keys are set)
- Supabase (optional — client is lazily created; nothing uses it yet)
- Deploys on Vercel with zero required environment variables

## Run Locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

No env vars required. To enable auth, copy `.env.example` to `.env.local` and add Clerk keys.

## Deploy to Vercel

1. Import the repo in Vercel (framework auto-detected).
2. Deploy. That's it — the build requires no environment variables.
3. Optional: add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` in Project → Settings → Environment Variables to enable login and gate `/dashboard`.

Note: `vercel.json` intentionally contains no `env` block. The legacy `@secret-name` reference syntax breaks modern Vercel deploys ("Secret does not exist"). Set env vars in the dashboard instead.

## Before Going Live — Owner TODOs

1. **Email**: CTAs point to `mailto:pilot@dryforge.ai`. Set up that mailbox (or swap all `pilot@dryforge.ai` occurrences to a Formspree form, the pattern used on igrimaldi.engineering).
2. **Domain**: confirm ownership of `dryforge.ai` before publishing; `metadataBase` assumes it.
3. **Legal**: add privacy/terms pages before collecting any lead data through forms (mailto links don't require them).
4. **Company name**: "DryForge Inc." is not a registered entity — footer says just "DryForge" until incorporation.

## Architecture Notes

- `middleware.ts` is a pass-through when Clerk keys are absent (Next 16 warns the `middleware` convention is deprecated in favor of `proxy`; migrate when Clerk documents proxy support).
- `lib/supabase.ts` exposes `getSupabase()` which returns `null` without env vars — nothing can crash at import time.
- `app/layout.tsx` wraps `ClerkProvider` conditionally so keyless builds prerender all routes.
