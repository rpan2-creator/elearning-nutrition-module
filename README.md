# What's in your bowl? — a practical nutrition learning module

Team 10's e-learning unit: a 10-minute pre-check, a 30-minute learning module, and a 10-minute post-check, with every answer, click, and time-on-screen recorded for analysis.

## Flow

| Page | What happens |
| --- | --- |
| `/` | Scroll-driven hero: a bowl opens into its ingredients, each labelled by nutritional role |
| `/start` | Consent + one background question. Assigns an anonymous ID, a condition (`predict` / `told`), and a test order (`AB` / `BA`) |
| `/pre` | Form A or B, one question per screen, no feedback |
| `/learn` | 4 parts, 14 screens: nutrients & energy · daily energy use (BMR/TDEE/BMI) · portions by hand · adjusting plates & snacks |
| `/post` | The other form |
| `/done` | Pre vs post score and explanations |
| `/admin` | Password-protected dashboard + CSV export |

**Conditions.** In `predict`, learners guess before seeing the answer (bowl roles, yogurt/milk protein, two oil plates). In `told`, they see the answer first. This is the innovative-principle comparison for Milestone 4 B5.

Content lives in `src/content/tests.ts` (test items, tagged by knowledge component) and `src/components/module/Part1–4.tsx` (module screens).

## Setup

1. **Supabase**: Vercel → Project → Storage → Connect → Supabase (or create a project at supabase.com and add the env vars yourself). Then Supabase → SQL Editor → run `supabase/schema.sql`.
2. **Vercel env vars**: `ADMIN_PASSWORD`, and optionally `NEXT_PUBLIC_POSTHOG_KEY`. See `.env.example`.
3. Redeploy.

Without Supabase the site still works; nothing is saved.

## Data

- `participants`: condition, test order, background, pre/post scores, completion times.
- `events`: one row per interaction — `phase`, `screen`, `event_type` (`page_view`, `page_leave`, `click`, `answer`, `slider`, …), `item_id`, `kc`, `response`, `correct`, `attempt`, `duration_ms`.
- PostHog (if configured): full session replays, identified by participant ID.

## Images

Food photos are AI-generated. The repo ships small placeholders; `bash scripts/fetch-images.sh` swaps in full-resolution versions (links valid until about 2026-11-17).

## Develop

```bash
npm install
npm run dev
```
