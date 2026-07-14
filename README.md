# YanivCRM

A Hebrew-first, RTL, multi-tenant CRM: lead and meeting management, AI website analysis, and Cal.com booking automation.

## Stack

React + TypeScript + Vite, Tailwind CSS, Supabase (Postgres + Auth + Row-Level Security + Edge Functions), Anthropic Claude.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | Lint with oxlint |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) — registers real users against your Supabase project |

## Architecture

- **Multi-tenant**: every user belongs to an `organization` via `memberships` (role: owner/admin/member). All data is scoped by `org_id` and enforced through Postgres Row-Level Security — the frontend never filters by user manually.
- **Edge Functions** (`supabase/functions/`):
  - `cal-webhook` — public, HMAC-signature-verified receiver for Cal.com booking events (create/cancel/reschedule). Idempotent via a `webhook_events` log; auto-manages lead status.
  - `ai-analyze` — authenticated endpoint that fetches a lead's website and asks Claude for a structured Hebrew analysis (summary, issues, opportunities, recommended services, next steps).
- **SQL migrations** live in `supabase/sql/` and were applied via the Supabase MCP server / Management API, in the order they're numbered.

## Environment variables

See `.env.example` for client-side variables. Server-side secrets (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `CAL_COM_WEBHOOK_SECRET`) are configured as Supabase Edge Function secrets and are never present in the frontend bundle.
