import { Circle, G, Path, Polygon, Rect } from "react-native-svg";

type GlyphColors = {
  bgStart: string;
  glowStart: string;
  glowEnd: string;
  spark: string;
  scrim: string;
};

type GlyphProps = {
  colors: GlyphColors;
  unlocked: boolean;
};

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}

function ink(colors: GlyphColors, unlocked: boolean) {
  return unlocked ? colors.glowStart : colors.glowEnd;
}

function soft(colors: GlyphColors, unlocked: boolean) {
  return unlocked ? colors.spark : colors.scrim;
}

/** Revealed hex with boot tread and dotted approach path. */
export function FirstTileGlyph({ colors, unlocked }: GlyphProps) {
  const primary = ink(colors, unlocked);
  const accent = soft(colors, unlocked);

  return (
    <G>
      <Path
        d="M18 72c6-4 12-7 19-9 8-2 16-2 24 0 7 2 13 5 19 9"
        stroke={accent}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      <Path
        d="M22 74c5-8 11-14 20-17 9-3 18-2 26 2"
        stroke={primary}
        strokeWidth="2"
        strokeDasharray="3 4"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <Polygon
        points={hexPoints(50, 42, 17)}
        fill={colors.bgStart}
        stroke={primary}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <Polygon
        points={hexPoints(50, 42, 11)}
        fill={accent}
        opacity={unlocked ? 0.22 : 0.1}
      />
      <Path
        d="M44 38c2-5 5-7 9-7 4 0 7 2 9 7 1 3 1 6-1 9-2 3-5 5-8 5s-6-2-8-5c-2-3-2-6-1-9z"
        fill={colors.bgStart}
        stroke={primary}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <Path
        d="M46 41h8M47 45h6M48 49h4"
        stroke={accent}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.85"
      />
      <Circle cx="47" cy="53" r="2.2" fill={accent} />
      <Circle cx="53" cy="53" r="2.2" fill={accent} />
      <Circle cx="44" cy="50" r="1.6" fill={accent} opacity="0.8" />
      <Circle cx="56" cy="50" r="1.6" fill={accent} opacity="0.8" />
      <Path
        d="M50 30v6"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </G>
  );
}

/** Honeycomb cluster emerging from fog. */
export function Tiles10Glyph({ colors, unlocked }: GlyphProps) {
  const primary = ink(colors, unlocked);
  const accent = soft(colors, unlocked);
  const clusters: Array<{ cx: number; cy: number; lit: boolean }> = [
    { cx: 50, cy: 38, lit: true },
    { cx: 39, cy: 45, lit: true },
    { cx: 61, cy: 45, lit: true },
    { cx: 33, cy: 52, lit: false },
    { cx: 50, cy: 52, lit: true },
    { cx: 67, cy: 52, lit: false },
    { cx: 42, cy: 59, lit: false },
    { cx: 58, cy: 59, lit: false },
  ];

  return (
    <G>
      <Path
        d="M16 28c10-6 22-8 34-6M70 26c8 4 14 10 18 18"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      {clusters.map(({ cx, cy, lit }) => (
        <G key={`${cx}-${cy}`}>
          <Polygon
            points={hexPoints(cx, cy, lit ? 8.5 : 7.5)}
            fill={colors.bgStart}
            stroke={lit ? primary : accent}
            strokeWidth={lit ? 2.4 : 1.8}
            strokeLinejoin="round"
            opacity={lit ? 1 : 0.65}
          />
          {lit ? (
            <Polygon
              points={hexPoints(cx, cy, 5)}
              fill={accent}
              opacity={unlocked ? 0.28 : 0.12}
            />
          ) : null}
        </G>
      ))}
      <Circle cx="50" cy="38" r="2" fill={primary} />
    </G>
  );
}

/** 3×3 lit hex grid — neighborhood blocks. */
export function Tiles100Glyph({ colors, unlocked }: GlyphProps) {
  const primary = ink(colors, unlocked);
  const accent = soft(colors, unlocked);
  const positions = [
    [34, 30], [50, 30], [66, 30],
    [34, 46], [50, 46], [66, 46],
    [34, 62], [50, 62], [66, 62],
  ];

  return (
    <G>
      {positions.map(([cx, cy], i) => {
        const center = i === 4;
        return (
          <G key={`${cx}-${cy}`}>
            <Polygon
              points={hexPoints(cx, cy, center ? 9.5 : 8)}
              fill={colors.bgStart}
              stroke={center ? primary : accent}
              strokeWidth={center ? 2.6 : 1.8}
              strokeLinejoin="round"
              opacity={center ? 1 : 0.75}
            />
            <Polygon
              points={hexPoints(cx, cy, center ? 5.5 : 4)}
              fill={accent}
              opacity={center ? (unlocked ? 0.35 : 0.15) : unlocked ? 0.12 : 0.06}
            />
          </G>
        );
      })}
      <Path
        d="M28 22h44M50 22v5"
        stroke={accent}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.5"
      />
      <Circle cx="50" cy="46" r="2.2" fill={primary} />
    </G>
  );
}

/** City skyline with lit windows. */
export function Tiles1000Glyph({ colors, unlocked }: GlyphProps) {
  const primary = ink(colors, unlocked);
  const accent = soft(colors, unlocked);

  const buildings = [
    { x: 22, y: 48, w: 11, h: 22, windows: 2 },
    { x: 35, y: 40, w: 13, h: 30, windows: 3 },
    { x: 50, y: 32, w: 14, h: 38, windows: 3 },
    { x: 66, y: 44, w: 12, h: 26, windows: 2 },
  ];

  return (
    <G>
      <Path d="M18 70h64" stroke={primary} strokeWidth="2.4" strokeLinecap="round" />
      <Path
        d="M20 70c4-2 8-3 12-3h36c4 0 8 1 12 3"
        stroke={accent}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      {buildings.map((b) => (
        <G key={b.x}>
          <Rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="1.5"
            fill={colors.bgStart}
            stroke={b.x === 50 ? primary : accent}
            strokeWidth="2"
          />
          {Array.from({ length: b.windows }, (_, row) =>
            Array.from({ length: 2 }, (_, col) => (
              <Rect
                key={`${b.x}-${row}-${col}`}
                x={b.x + 2.5 + col * 4.5}
                y={b.y + 4 + row * 7}
                width="2.8"
                height="3.5"
                rx="0.6"
                fill={accent}
                opacity={unlocked ? 0.75 : 0.35}
              />
            )),
          )}
        </G>
      ))}
      <Path
        d="M57 28v4M57 26h3"
        stroke={accent}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <Path
        d="M14 58c3-4 6-6 10-6 3 0 5 2 7 4"
        stroke={accent}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
    </G>
  );
}

/** Folded map with compass rose and trail pin. */
export function Tiles10000Glyph({ colors, unlocked }: GlyphProps) {
  const primary = ink(colors, unlocked);
  const accent = soft(colors, unlocked);

  return (
    <G>
      <Path
        d="M24 30l22-8 22 8v38l-22 8-22-8V30z"
        fill={colors.bgStart}
        stroke={primary}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <Path d="M46 22v46" stroke={accent} strokeWidth="1.6" opacity="0.45" />
      <Path
        d="M30 38h14M30 46h14M30 54h10M58 38h12M58 46h12M58 54h8"
        stroke={accent}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <Path
        d="M34 58c6-4 12-6 20-6 8 0 14 3 20 8"
        stroke={primary}
        strokeWidth="2"
        strokeDasharray="2.5 3"
        strokeLinecap="round"
        fill="none"
      />
      <G transform="translate(62, 34)">
        <Circle r="7" fill={colors.bgStart} stroke={accent} strokeWidth="1.6" />
        <Path d="M0-5.5v11M-5.5 0h11" stroke={accent} strokeWidth="1.2" />
        <Path d="M0-3.5l1.2 3.5-1.2 1-1.2-1z" fill={primary} />
      </G>
      <Path
        d="M48 50c0-3 2-5 5-5s5 2 5 5-2 5-5 5"
        fill={colors.bgStart}
        stroke={primary}
        strokeWidth="2"
      />
      <Path d="M53 55l3 6" stroke={primary} strokeWidth="2" strokeLinecap="round" />
      <Path
        d="M66 26l2.5 4.5h5l-4 3 1.5 5-4.5-3.2-4.5 3.2 1.5-5-4-3h5z"
        fill={colors.bgStart}
        stroke={accent}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </G>
  );
}

/** Three-tongue flame with ember core. */
export function Streak3Glyph({ colors, unlocked }: GlyphProps) {
  const primary = ink(colors, unlocked);
  const accent = soft(colors, unlocked);

  return (
    <G>
      <Path
        d="M50 78c-14 0-22-10-22-22 0-8 5-15 10-20 2 6 5 10 9 12-1-8 3-14 8-18 5 5 8 11 8 18 0 3-1 6-2 8 5-3 9-9 9-16 6 7 10 15 10 24 0 12-8 22-22 22z"
        fill={colors.bgStart}
        stroke={primary}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <Path
        d="M50 72c-8 0-13-6-13-14 0-5 3-9 6-12 1 4 3 6 5 7-1-5 2-9 5-11 3 3 5 7 5 11 0 2 0 4-1 5 3-2 5-6 5-10 4 4 7 9 7 15 0 8-5 14-13 14z"
        fill={accent}
        opacity={unlocked ? 0.55 : 0.28}
      />
      <Circle cx="44" cy="58" r="2" fill={primary} opacity="0.7" />
      <Circle cx="56" cy="54" r="1.6" fill={primary} opacity="0.5" />
      <Path
        d="M38 78h-5M62 78h5"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </G>
  );
}

/** Flame with seven day marks along the base. */
export function Streak7Glyph({ colors, unlocked }: GlyphProps) {
  const primary = ink(colors, unlocked);
  const accent = soft(colors, unlocked);

  return (
    <G>
      <Path
        d="M50 76c-15 0-24-11-24-23 0-9 6-17 12-22 2 7 6 11 11 13-2-9 2-16 8-21 6 6 10 13 10 21 0 4-1 7-3 10 6-4 10-11 10-19 7 8 11 17 11 27 0 12-9 23-24 23z"
        fill={colors.bgStart}
        stroke={primary}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <Path
        d="M50 68c-9 0-15-6-15-13 0-4 2-8 5-10 1 3 3 5 5 6-1-4 2-7 4-9 2 2 4 5 4 9 0 2 0 3-1 4 2-1 4-5 4-8 3 3 6 7 6 12 0 7-6 13-15 13z"
        fill={accent}
        opacity={unlocked ? 0.5 : 0.25}
      />
      {Array.from({ length: 7 }, (_, i) => (
        <Rect
          key={i}
          x={30 + i * 6.5}
          y={78}
          width="3"
          height={i % 2 === 0 ? 5 : 3.5}
          rx="0.8"
          fill={i < 5 ? accent : primary}
          opacity={unlocked ? 0.85 : 0.45}
        />
      ))}
      <Path
        d="M42 48l6 6 10-12"
        stroke={accent}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.8"
      />
    </G>
  );
}

/** Crowned flame with radiating sparkles. */
export function Streak30Glyph({ colors, unlocked }: GlyphProps) {
  const primary = ink(colors, unlocked);
  const accent = soft(colors, unlocked);
  const sparkles = [
    { x: 28, y: 30, s: 4 },
    { x: 72, y: 32, s: 3.5 },
    { x: 24, y: 52, s: 3 },
    { x: 76, y: 50, s: 3.5 },
  ];

  return (
    <G>
      {sparkles.map(({ x, y, s }) => (
        <Path
          key={`${x}-${y}`}
          d={`M${x} ${y - s}v${s * 2}M${x - s} ${y}h${s * 2}`}
          stroke={accent}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity={unlocked ? 0.9 : 0.45}
        />
      ))}
      <Path
        d="M50 16v-4M50 84v-4M80 50h-4M24 50h-4"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
      <Path
        d="M50 74c-16 0-26-12-26-25 0-10 7-19 14-24 2 8 7 13 13 15-2-10 3-18 10-23 7 7 12 15 12 24 0 5-1 9-3 12 7-5 12-13 12-22 8 9 13 19 13 31 0 13-10 25-26 25z"
        fill={colors.bgStart}
        stroke={primary}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <Path
        d="M50 66c-10 0-17-7-17-15 0-5 3-9 6-12 1 4 4 7 7 8-1-5 2-9 5-12 3 3 6 7 6 12 0 2-1 4-2 5 3-2 6-6 6-11 4 5 8 10 8 17 0 8-7 15-17 15z"
        fill={accent}
        opacity={unlocked ? 0.55 : 0.28}
      />
      <Path
        d="M43 52l5 5 10-12"
        stroke={primary}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </G>
  );
}

/** Mile marker sign with striding walker. */
export function Day1MiGlyph({ colors, unlocked }: GlyphProps) {
  const primary = ink(colors, unlocked);
  const accent = soft(colors, unlocked);

  return (
    <G>
      <Path
        d="M18 72c10-6 20-9 32-9s22 3 32 9"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      <Path
        d="M22 74c6-6 14-10 24-10"
        stroke={primary}
        strokeWidth="1.8"
        strokeDasharray="2.5 3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <Rect x="58" y="36" width="16" height="11" rx="2" fill={colors.bgStart} stroke={primary} strokeWidth="2" />
      <Rect x="60" y="39" width="12" height="2.5" rx="0.8" fill={accent} opacity="0.8" />
      <Path d="M66 47v23" stroke={primary} strokeWidth="2.4" strokeLinecap="round" />
      <Circle cx="36" cy="30" r="4" fill={colors.bgStart} stroke={accent} strokeWidth="2" />
      <Path
        d="M36 34v12M32 40l4 4 4-4M34 46l-6 8M38 46l6 8"
        stroke={accent}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M48 58c4 0 7 2 7 6"
        fill="none"
        stroke={primary}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Circle cx="55" cy="64" r="2.2" fill={accent} />
    </G>
  );
}

/** Switchback mountain trail to summit flag. */
export function Day5MiGlyph({ colors, unlocked }: GlyphProps) {
  const primary = ink(colors, unlocked);
  const accent = soft(colors, unlocked);

  return (
    <G>
      <Path
        d="M14 68 L30 42 L46 54 L62 28 L82 68 Z"
        fill={colors.bgStart}
        stroke={accent}
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <Path
        d="M22 64 L34 52 L44 58 L56 44 L68 50 L78 64"
        fill="none"
        stroke={primary}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M34 52 L44 58 L56 44"
        fill="none"
        stroke={accent}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.65"
      />
      <Path d="M62 28v10" stroke={primary} strokeWidth="2" strokeLinecap="round" />
      <Path
        d="M62 30h9l-4.5 4z"
        fill={accent}
        stroke={primary}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <Circle cx="24" cy="34" r="5" fill={colors.bgStart} stroke={accent} strokeWidth="1.6" opacity="0.7" />
      <Path
        d="M20 34h8M24 30v8"
        stroke={accent}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </G>
  );
}

/** Wind gusts clearing fog hexes. */
export function Day100TilesGlyph({ colors, unlocked }: GlyphProps) {
  const primary = ink(colors, unlocked);
  const accent = soft(colors, unlocked);

  return (
    <G>
      <Path
        d="M18 32c12-4 24-4 36 0M22 42c10-3 20-3 30 0M26 52c8-2 16-2 24 0"
        stroke={primary}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M62 30c-6 4-10 8-10 14 0 5 3 9 8 12"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <Polygon
        points={hexPoints(38, 62, 9)}
        fill={colors.bgStart}
        stroke={accent}
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <Polygon
        points={hexPoints(54, 58, 8)}
        fill={colors.bgStart}
        stroke={primary}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <Polygon
        points={hexPoints(68, 64, 7)}
        fill={colors.bgStart}
        stroke={accent}
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity="0.45"
      />
      <Polygon points={hexPoints(54, 58, 5)} fill={accent} opacity={unlocked ? 0.3 : 0.12} />
      <Path
        d="M70 38l5 3-5 3"
        stroke={primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M76 48l4 2.5-4 2.5"
        stroke={accent}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.75"
      />
    </G>
  );
}

/** Marathon medal with laurel wreath and ribbons. */
export function Distance26Glyph({ colors, unlocked }: GlyphProps) {
  const primary = ink(colors, unlocked);
  const accent = soft(colors, unlocked);

  return (
    <G>
      <Path
        d="M30 38c-4 6-4 14 0 20M70 38c4 6 4 14 0 20"
        stroke={accent}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      {[-1, 1].map((side) => (
        <G key={side}>
          <Path
            d={`M${50 + side * 18} 36c${side * 3} 4 ${side * 3} 10 0 14c${-side * 2} 2 ${-side * 4} 2 ${-side * 6} 0`}
            fill="none"
            stroke={accent}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.6"
          />
        </G>
      ))}
      <Circle cx="50" cy="48" r="17" fill={colors.bgStart} stroke={primary} strokeWidth="2.6" />
      <Circle cx="50" cy="48" r="12" fill="none" stroke={accent} strokeWidth="1.6" opacity="0.55" />
      <Path
        d="M50 38l3 6 6.5 1-4.8 4.5 1.5 6.3-5.7-3.5-5.7 3.5 1.5-6.3-4.8-4.5 6.5-1z"
        fill={accent}
        opacity={unlocked ? 0.85 : 0.4}
      />
      <Path
        d="M50 56v4"
        stroke={primary}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <Path
        d="M42 62l8 10 8-10"
        fill={colors.bgStart}
        stroke={primary}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path d="M46 72v6M54 72v6" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
      <Path
        d="M38 28h24"
        stroke={accent}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.4"
      />
    </G>
  );
}

export function DefaultGlyph({ colors, unlocked }: GlyphProps) {
  const primary = ink(colors, unlocked);
  const accent = soft(colors, unlocked);

  return (
    <G>
      <Polygon
        points={hexPoints(50, 50, 16)}
        fill={colors.bgStart}
        stroke={primary}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <Path
        d="M50 40v20M40 50h20"
        stroke={accent}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </G>
  );
}
