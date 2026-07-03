---
name: trace-app
description: Master orchestration skill for the Trace fog-of-war exploration app. Use at the start of any Trace work session to understand product invariants, phase order, file ownership, and which specialized skill to route to.
---

# Trace — Master Orchestration

Trace is an iOS-first Expo fog-of-war walking app: the map starts dark and physically moving through the world permanently reveals H3 hexagon tiles, with stats, streaks, achievements, and a (demo-only) friends leaderboard. No authentication in v1.

## Product invariants (never violate)

1. **Offline-first.** SQLite (`trace.db`) is the source of truth for tiles. The app must be fully functional with no network.
2. **Privacy: H3 IDs only.** Raw latitude/longitude must NEVER be placed in any network payload, sync queue entry, or export. Only H3 cell indexes (resolution 10) leave the device. Local storage of lat/lng for map rendering is fine.
3. **Tiles are earned, never granted.** A tile is stomped only by a validated live GPS sample passing the stomp rules (accuracy ≤ 50 m, implied speed ≤ 25 km/h, ≥ 8 m movement). No tap-to-reveal, no route import, no debug backdoors shipped in release code.
4. **Revealed tiles are permanent.** There is no code path that deletes individual tiles except the explicit "Clear all data" setting.
5. **Background tracking is opt-in and off by default.** "Always" location permission is requested only when the user flips the toggle in Settings.
6. **No auth/backend in v1.** `src/lib/auth/` and `src/lib/sync/` contain interfaces and stubs only. Do not wire Supabase or any network sync until explicitly requested.

## Phase order

Engine before UI, UI before social: storage/H3/stomp engine → map screen → stats/achievements → onboarding/settings/friends-demo → background tracking → (later) auth + real friends. Never build friends/sync features ahead of the local engine.

## File ownership map

| Area | Path | Skill to read |
|------|------|---------------|
| Routes only (no components) | `src/app/` | trace-ui + building-native-ui |
| Map components | `src/components/map/` | trace-map-engine + trace-ui |
| Stats/achievement components | `src/components/stats/` | trace-ui |
| Friends demo components | `src/components/friends/` | trace-ui |
| Shared UI primitives | `src/components/ui/` | trace-ui |
| H3 helpers | `src/lib/h3/` | trace-map-engine |
| Location services + background task | `src/lib/location/` | trace-map-engine |
| Stomp engine + rules | `src/lib/stomp/` | trace-map-engine |
| SQLite + settings storage | `src/lib/storage/` | trace-map-engine |
| Stats, streaks, formatting | `src/lib/stats/` | trace-map-engine |
| Achievements | `src/lib/achievements/` | trace-ui (definitions) |
| Auth/sync stubs | `src/lib/auth/`, `src/lib/sync/` | vibe-security (Phase 2 only) |
| Session state (zustand) | `src/store/` | trace-map-engine |
| Design tokens | `src/constants/theme.ts` | trace-ui |
| Generated assets | `assets/images/` | trace-assets |

## Routing table

- User asks about **map, fog, tiles, GPS, SQLite, performance** → `.cursor/skills/trace-map-engine/SKILL.md`
- User asks about **screens, styling, animation, haptics, components** → `.cursor/skills/trace-ui/SKILL.md` and `~/.agents/skills/building-native-ui/SKILL.md`
- User asks about **icons, splash, badges, image generation** → `.cursor/skills/trace-assets/SKILL.md`
- User asks about **building, simulator, device install, TestFlight** → `~/.agents/skills/expo-deployment/SKILL.md` (note: v1 uses local `npx expo run:ios`, not EAS)
- User asks about **auth, Supabase, friends backend** → `~/.agents/skills/vibe-security/SKILL.md` first; this is Phase 2 work
