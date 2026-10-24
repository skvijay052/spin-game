# Spin Duel

Premium responsive Next.js demo for a 1-vs-1 spin game. This prototype uses **simulated rupee amounts only** and virtual points. It has no UPI integration, deposits, cash prizes, transfers, or withdrawals.

## Stack
- Next.js App Router + TypeScript
- Responsive custom CSS + Framer Motion + Tailwind CSS
- Supabase Auth (Google OAuth), PostgreSQL, RLS and Realtime
- Netlify hosting
- GitHub Actions CI (type check + production build)

## Local development
1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Add a dedicated Spin Duel Supabase project URL and publishable/anon key.
4. Run `npm install`, then `npm run dev`.
5. Open http://localhost:3000.

Without Supabase environment variables, the UI runs in demo mode; Google sign-in and database-backed functionality are not connected.

## Supabase setup
1. Create a **separate project for Spin Duel**; do not reuse unrelated production databases.
2. Run the SQL in `supabase/migrations/202610240001_spin_duel_demo.sql` in the Supabase SQL editor.
3. In Authentication → Providers, enable Google and configure the Google OAuth client ID/secret.
4. Add the local and deployed URLs to the Supabase Auth redirect allowlist, including `/auth/callback`.
5. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Netlify environment variables.

The SQL includes a server-authoritative demo match RPC and RLS policies. It does not include payment or redeemable balance tables. Review the SQL and policies before production use.

## Netlify
Import this GitHub repository into Netlify. The included `netlify.toml` configures the Next.js adapter. Set the two public Supabase environment variables in Site configuration → Environment variables, then deploy.

## Admin access
The admin page is a safe placeholder until an owner grants an admin role through trusted database-side operations. Never allow users to grant themselves admin access from the browser.

## GitHub Actions
Every push/PR to `main` runs `npm install`, TypeScript checks, and a production build. No secrets are required for the demo CI build.

## Non-monetary demo boundary
No UPI SDK, payment gateway, cash-out, deposit, wallet transaction, or redeemable prize functionality is present. Any displayed amounts in future UI work must be clearly marked simulated and cannot be exchanged for money.
