# Social Eyes — Focused product contract (2026-11-20)

## The one job
Help two consenting adults at the **same participating venue** discover each other and connect through **mutual interest**, without exposing exact locations or one-sided interest.

## The five end-to-end user capabilities
1. **Account and profile:** create/sign into an account, edit display name, short bio, and one social intention. Persist to Supabase with owner-only RLS. Provide sign-out, account recovery, and blocking/reporting before public interactions launch.
2. **Participating venues:** show a real, curated list of participating venues with reliable details. No fabricated crowd sizes or unverified live availability. An empty state must explain when no venue is onboarded.
3. **Explicit check-in:** a user voluntarily checks into exactly one venue for a limited session, can leave instantly, and automatically expires. No background GPS tracking. Invisible by default. Enforce presence server-side, not only through local switches.
4. **Opted-in discovery and Eyes:** only currently opted-in, unblocked users in the same venue can be surfaced. Sending an Eye is private; the server reveals a match only after reciprocal Eyes. Prevent duplicate sends and cross-venue disclosure.
5. **Mutual chat and safety:** matched users can message each other privately. Block, report, unmatch, and delete account/data. Server enforces permissions and revocation.

## Not in MVP
Indoor positioning/radar dots, precise GPS, speculative crowd heatmaps, events marketplace, AI matching, monetization, social feeds, background location, push notifications, and advanced avatar customization. Replace radar with an explicit check-in and opted-in people list, **not** a faux indoor map.

## Real-system dependencies
- Supabase Auth for identity and recovery.
- Supabase Postgres migrations with RLS for profiles, venues, check-ins, Eyes, matches, messages, blocks and reports.
- Database functions/transactions for reciprocal matching and session expiration.
- A curated venue onboarding/admin workflow.
- Expo iOS/Android builds, accessible error/loading/empty states, E2E tests with two distinct accounts.
- User-provided Supabase project connection and approved venue data are required for live verification; no secrets committed to GitHub.

## Non-negotiable launch gates
1. No fake interactive affordances: every CTA is backed by a real action or clearly marked unavailable.
2. Fail closed on backend, permissions, storage, and network errors.
3. Automated tests cover ownership, cross-venue access, blocked users, duplicate Eyes, reciprocal matching, messaging authorization, session expiry, and account deletion.
4. Native builds and manual device tests pass; two-user live RLS verification is recorded.
5. No Phase 2 work until the original Phase 1 gate is verified and explicitly signed off.

## Current reality
Account/profile code exists but remains under CI repair. Discover, Radar and Eyes screens are mostly static placeholders. Venue check-in, server-side presence, mutual matching, chat, and safety flows are **not yet implemented**. A backend reachability check does not prove database authorization.

## Build order
A. Stabilize repository and native builds.
B. Verify Auth/profile/RLS live.
C. Implement curated venue browsing and opt-in expiring check-ins.
D. Implement same-venue Eyes and reciprocal matches.
E. Implement authorized messaging, blocking/reporting, deletion, and end-to-end launch verification.
