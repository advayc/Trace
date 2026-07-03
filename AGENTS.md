# Trace — Agent Guide

Trace is an Expo (SDK 57) iOS fog-of-war walking app. Expo has changed significantly across versions — consult the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code against unfamiliar APIs.

## Skill routing

Read the matching skill BEFORE working in that area:

- Anything Trace (start here) → `.agents/skills/trace-app/SKILL.md`
- Map / tiles / H3 / location / SQLite / performance → `.agents/skills/trace-map-engine/SKILL.md`
- UI screens / theming / animations / components → `.agents/skills/trace-ui/SKILL.md` + `.agents/skills/building-native-ui/SKILL.md`
- Icons / splash / badges / image generation → `.agents/skills/trace-assets/SKILL.md`
- Builds / simulator / device install / TestFlight → `.agents/skills/expo-deployment/SKILL.md` (v1 uses local `npx expo run:ios`, not EAS)
- Auth / Supabase / friends backend (Phase 2, not built yet) → `.agents/skills/vibe-security/SKILL.md`

## Hard rules

- Offline-first; SQLite is the source of truth for tiles.
- Raw lat/lng never leaves the device — H3 indexes only in any network payload or sync queue.
- Tiles unlock only via validated live GPS (see stomp rules); revealed tiles are permanent.
- Background tracking is opt-in and off by default.
- No authentication or network sync in v1 — `src/lib/auth/` and `src/lib/sync/` stay as stubs.
- Kebab-case filenames; routes only in `src/app/`; import via `@/` aliases; design tokens from `src/constants/theme.ts` only.

## Commands

- Run: `npx expo run:ios` (dev build; Expo Go is NOT supported — background location and maps need native modules)
- Typecheck: `npx tsc --noEmit`
- Simulated walk: `xcrun simctl location booted set <lat>,<lng>`
