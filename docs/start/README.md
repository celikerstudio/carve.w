# Carve — Start Here

This folder is the current onboarding set for product work in `carve-wiki`.
Use it to understand what Carve is, what the web app already does, and what should be built next.

## Read Order

1. `product-overview.md` — product thesis and ecosystem
2. `working-approach.md` — build discipline and decision rules
3. `web-app-status.md` — what exists right now in this repo
4. `shared-backend.md` — shared Supabase + AI contract
5. `ios-app-reference.md` — benchmark from `../carve-ai`
6. `roadmap.md` — next priorities

## Source of Truth

- Current implementation beats aspirational copy.
- If docs conflict with code, update the doc or mark the item as planned.
- `../carve-ai` is the reference for the shared `coach-chat` edge function, quota behavior, and latest iOS `CoachContext`.
- `docs/start` should stay internally consistent. Older docs elsewhere in `/docs` may be historical or feature-specific.

## Scope

- iOS remains the benchmark for shared data behavior and coaching quality.
- The web app should reuse existing Supabase data and backend primitives where possible.
- Existing money/life placeholders may remain until their domain phase starts, but new work in an active domain should land on real data.
