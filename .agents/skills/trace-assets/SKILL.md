---
name: trace-assets
description: Asset generation workflow for Trace - Gemini prompt templates for the app icon, splash, and achievement badges, plus export sizes and naming conventions. Use when creating or regenerating any visual asset.
---

# Trace Assets — Generation Workflow

All assets follow the cartographic-noir system: background `#0C0E12`, fog `#1A1D24`, ember `#E8A04C`, mint accent `#6EE7B7`. Generate with a Gemini-class image model (or the IDE's built-in image generation). Do NOT write code that calls image APIs — generate, review, then save files manually.

## Naming + placement

- All generated assets live in `assets/images/`, kebab-case: `trace-icon.png`, `trace-splash.png`, `badge-<achievement-id>.png`.
- Icons wired in `app.json`: `expo.icon` → `trace-icon.png`; splash plugin image → `trace-splash.png`.

## Export sizes

| Asset | Size | Notes |
|-------|------|-------|
| App icon | 1024×1024 PNG, **no alpha**, square (iOS applies masking) | `expo.icon` |
| Splash image | 1024×1024 PNG on `#0C0E12` | splash plugin, `imageWidth: 200` |
| Achievement badge | 512×512 PNG | rendered ~96 pt in-app |

If a generated image is not square, center-crop with `sips -c <h> <w> file.png`.

## Prompt templates (used for the shipped v1 assets)

### App icon

> iOS app icon, 1024x1024, flat modern design. A dark charcoal-navy background (#0C0E12) filled with a subtle honeycomb hexagon grid pattern in slightly lighter charcoal (#1A1D24). In the center, one single hexagon glows warm amber (#E8A04C) with a soft outer glow, as if a tile of a map has been revealed from fog. A minimal white walking-path dotted line curves from the bottom edge into the glowing hexagon. No text, no letters. Clean, premium, cartographic-noir aesthetic, crisp vector-style edges, suitable as an App Store icon.

### Splash

> Minimal iOS splash screen artwork, square 1024x1024, flat modern vector style. Solid very dark charcoal-navy background (#0C0E12). Centered small emblem: a single warm amber glowing hexagon (#E8A04C) with soft glow, with a thin dotted white walking path curving up into it from below. Below the emblem, generous empty space. No text, no letters, no borders. Extremely minimal, premium, cartographic-noir aesthetic.

### Achievement badge (parameterized)

> Flat vector achievement badge, 512x512, on transparent or #0C0E12 background. A hexagonal medallion with a thin amber (#E8A04C) outline and dark charcoal (#14171E) fill, containing a minimal {SUBJECT} glyph in warm amber with a subtle glow. Consistent 8px stroke weight, no text, premium cartographic-noir game aesthetic.

Replace `{SUBJECT}`: "footprint" (first tile), "cluster of 3 lit hexagons" (10 tiles), "city skyline" (1k tiles), "flame" (streaks), "crescent moon" (night owl), "mountain path" (distance), etc.

## Regeneration checklist

1. Generate with the template, verify palette matches tokens.
2. Center-crop to square, strip alpha for the app icon.
3. Overwrite the file in `assets/images/` (same name — references stay valid).
4. Rebuild (`npx expo run:ios`) to see icon/splash changes; JS-referenced images hot reload.
