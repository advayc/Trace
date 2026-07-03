# Trace

**Walk it. Reveal it. Keep it.**

Trace is a fog-of-war exploration app for iPhone built with Expo. Your whole map starts dark — every street you walk, run, or bike clears hexagon tiles permanently, turning real-world movement into a personal map of everywhere you've actually been.

- **Fog-of-war map** — resolution-10 H3 hexagons (~66 m) reveal as you move, with a warm glow and a haptic tap
- **Anti-cheat rules** — tiles only unlock from live GPS fixes: accuracy ≤ 50 m, on-foot speeds (≤ 25 km/h), real movement (≥ 8 m)
- **Live neighborhood coverage** — a glass pill shows "Your area · X% stomped" (approximate in v1)
- **Revisit heat** — favorite routes warm from amber toward red-orange the more you walk them
- **Stats, streaks, achievements** — tiles, area, distance, day streaks, and 12 unlockable achievements with confetti
- **Friends preview** — demo leaderboard today; real friends arrive with auth in Phase 2
- **Offline-first & private** — everything lives in on-device SQLite; nothing is sent anywhere in v1
- **Background tracking (opt-in)** — keep revealing tiles with the screen locked; off by default

## Requirements

- macOS with **Xcode** (26+) and CocoaPods
- Node 20+
- **Expo Go is not supported** — the app uses native modules (Apple Maps, background location), so it runs as a development build.

## Run on the iOS Simulator

```bash
npm install
npx expo run:ios --device "iPhone 17 Pro"
```

The first build takes several minutes (prebuild + pod install + compile). Afterwards, `npx expo start` alone is enough for JS iteration; rebuild only when native config changes.

### Simulate a walk

The simulator has no GPS, so feed it locations:

```bash
xcrun simctl location booted set 40.7648,-73.9808
# then step the latitude in small increments to "walk":
xcrun simctl location booted set 40.7650,-73.9808
xcrun simctl location booted set 40.7652,-73.9808
```

Each accepted fix ≥ 8 m from the last clears a new tile.

## Install on your iPhone (sideload)

1. Plug your iPhone into the Mac with USB and tap **Trust This Computer**.
2. On the phone: **Settings → Privacy & Security → Developer Mode** → on → restart.
3. Open `ios/Trace.xcworkspace` in Xcode once: select the **Trace** target → *Signing & Capabilities* → set **Team** to your personal Apple ID (add it via Xcode → Settings → Accounts if needed). Xcode will create a free provisioning profile.
4. Build to the device:

```bash
npx expo run:ios --device
```

Pick your iPhone from the list.
5. First launch will be blocked: **Settings → General → VPN & Device Management** → trust your developer certificate.
6. Free Apple IDs expire the install after ~7 days — just re-run step 4 to refresh.

## Background tracking

Off by default. Enable it in **You → Background tracking**, which requests the iOS "Always" location permission at that moment (never earlier). The task is registered at module top level in `src/lib/location/background-task.ts` and processes fixes through the same anti-cheat engine as foreground tracking.

## Project layout

```
src/
  app/            # Expo Router routes only (tabs: Map, Progress, Friends, You + onboarding)
  components/     # map/, stats/, friends/, ui/
  lib/            # h3/, location/, stomp/, storage/, stats/, achievements/, auth/ (stub), sync/ (stub)
  hooks/  store/  constants/
.cursor/skills/   # trace-app, trace-map-engine, trace-ui, trace-assets (agent skills)
```

Agent guidance lives in `AGENTS.md` and `.cursor/skills/` — read `trace-app` first when working on this codebase.

## Roadmap (Phase 2)

- Sign-in with **Apple / Google** (Supabase Auth) — interfaces already in `src/lib/auth/types.ts`
- Cloud backup + cross-device sync via `src/lib/sync/sync-queue.ts` (H3 indexes only; raw GPS never leaves the device)
- Real friends, invite links, and neighborhood head-to-head leaderboards
- OSM neighborhood boundary polygons for exact % stomped
- Run a security review (vibe-security skill) before shipping any social feature
