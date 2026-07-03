---
name: trace-ui
description: Design system and component conventions for Trace. Use when building or editing any screen, component, animation, or visual element so the cartographic-noir aesthetic stays cohesive.
---

# Trace UI — Cartographic Noir

Dark map canvas, warm ember reveals, crisp typographic stats. Premium and intentional — never template-generic.

## Design tokens (single source: src/constants/theme.ts)

| Token | Value | Use |
|-------|-------|-----|
| `colors.bg` | `#0C0E12` | App/screen background |
| `colors.surface` | `#14171E` | Cards, sheets |
| `colors.fog` | `#1A1D24` (0.85 fill on map) | Fog hexes, borders |
| `colors.ember` | `#E8A04C` | Revealed tiles, primary accent, CTAs |
| `colors.emberLight` | `#F5C882` | Gradients, highlights |
| `heat ramp` | `#7A4E20` → `#E85D04` | Revisit heat by visit_count (1 → 8+) |
| `colors.mint` | `#6EE7B7` | Streaks, milestones, success |
| `colors.text` | `#F4F4F5` | Primary text |
| `colors.textMuted` | `#9CA3AF` | Secondary text |
| `colors.danger` | `#F87171` | Destructive actions |

Never introduce ad-hoc hex values in components — import from theme.

## Typography

- Display: **Fraunces** (`Fraunces_600SemiBold`, `Fraunces_700Bold`) — screen titles, big stat numbers, milestone modals.
- UI: **DM Sans** (`DMSans_400Regular`, `DMSans_500Medium`, `DMSans_700Bold`) — everything else.
- Loaded once in `src/app/_layout.tsx` via `@expo-google-fonts/*` + `useFonts`.

## Component conventions

- Shared primitives live in `src/components/ui/` (`GlassCard`, `PillButton`, `SectionHeader`, `ConfettiCelebration`). Reuse before creating new ones.
- Glass surfaces: `expo-blur` `BlurView` (`tint="dark"`) with 1 px `rgba(255,255,255,0.08)` border and 16–24 radius.
- Numbers: format with `formatCompact` from `src/lib/stats/format.ts` (`38.2k`, `1.4M`), distances honor the units setting (mi default).
- Big stat = Fraunces number + DM Sans muted label underneath.
- Every screen: root `ScrollView`/`FlatList` with `contentInsetAdjustmentBehavior="automatic"`; respect both safe areas.
- SF Symbols via `expo-image` `source="sf:name"` — never `@expo/vector-icons`.

## Motion + haptics

- New tile reveal: `Haptics.impactAsync(Light)` (iOS only, check `process.env.EXPO_OS`) + hex scale-in (Reanimated, ~250 ms, ease-out).
- Achievement unlock: `Haptics.notificationAsync(Success)` + `ConfettiCelebration` modal (staggered ember/mint pieces, ~1.8 s).
- Prefer `entering`/`layout` Reanimated transitions on list items; keep motion purposeful — one hero moment per screen.

## Also read

`~/.agents/skills/building-native-ui/SKILL.md` (and its references) is authoritative for Expo Router structure, NativeTabs, storage, and platform conventions. Follow it strictly: kebab-case files, no components inside `src/app/`, `@/` imports.
