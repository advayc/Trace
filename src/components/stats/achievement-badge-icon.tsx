import { View } from "react-native";
import Svg, {
    Circle,
    Defs,
    Ellipse,
    G,
    LinearGradient,
    Path,
    Polygon,
    Rect,
    Stop,
} from "react-native-svg";

import { radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { AchievementDef } from "@/lib/achievements/definitions";

interface AchievementBadgeIconProps {
  achievement: AchievementDef;
  unlocked: boolean;
  size?: number;
}

export function AchievementBadgeIcon({
  achievement,
  unlocked,
  size = 64,
}: AchievementBadgeIconProps) {
  const { colors } = useTheme();
  const palette = getBadgePalette(achievement.id, colors, unlocked);
  const tilt = getBadgeTilt(achievement.id);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.lg,
        backgroundColor: palette.outer,
        borderWidth: 1,
        borderColor: palette.border,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transform: [{ rotate: `${tilt}deg` }],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id={`badge-${achievement.id}-bg`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.bgStart} />
            <Stop offset="1" stopColor={palette.bgEnd} />
          </LinearGradient>
          <LinearGradient id={`badge-${achievement.id}-glow`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.glowStart} />
            <Stop offset="1" stopColor={palette.glowEnd} />
          </LinearGradient>
        </Defs>

        <Rect x="5" y="5" width="90" height="90" rx="28" fill={`url(#badge-${achievement.id}-bg)`} />

        <Path
          d="M22 26c16-8 40-8 56 1"
          stroke={palette.scrim}
          strokeOpacity="0.32"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M16 68c8-10 14-15 20-18"
          stroke={palette.scrim}
          strokeOpacity="0.24"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx="78" cy="24" r="4" fill={palette.spark} opacity="0.72" />
        <Circle cx="23" cy="74" r="2.5" fill={palette.spark} opacity="0.58" />

        <BadgeGlyph achievementId={achievement.id} unlocked={unlocked} colors={palette} />

        <Path
          d="M31 30c7 2 18 3 31 1"
          stroke="#FFFFFF"
          strokeOpacity="0.12"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        <Rect x="5" y="5" width="90" height="90" rx="28" fill="none" stroke={palette.border} strokeWidth="2" />
        <Rect x="10" y="10" width="80" height="80" rx="24" fill="none" stroke="#FFFFFF" strokeOpacity="0.05" strokeWidth="1" />
      </Svg>
    </View>
  );
}

type BadgePalette = {
  outer: string;
  border: string;
  bgStart: string;
  bgEnd: string;
  glowStart: string;
  glowEnd: string;
  spark: string;
  scrim: string;
};

function getBadgePalette(
  achievementId: string,
  colors: ReturnType<typeof useTheme>["colors"],
  unlocked: boolean,
): BadgePalette {
  const ember = {
    outer: unlocked ? colors.emberDim : colors.fog,
    border: unlocked ? colors.accentBorder : colors.border,
    bgStart: unlocked ? colors.surfaceRaised : colors.surface,
    bgEnd: unlocked ? colors.fog : colors.surfaceRaised,
    glowStart: unlocked ? colors.emberLight : colors.textFaint,
    glowEnd: unlocked ? colors.ember : colors.borderStrong,
    spark: colors.emberLight,
    scrim: colors.ember,
  } satisfies BadgePalette;

  const mint = {
    outer: unlocked ? colors.mintDim : colors.fog,
    border: unlocked ? colors.successBorder : colors.border,
    bgStart: unlocked ? colors.surfaceRaised : colors.surface,
    bgEnd: unlocked ? colors.fog : colors.surfaceRaised,
    glowStart: unlocked ? colors.mintLight : colors.textFaint,
    glowEnd: unlocked ? colors.mint : colors.borderStrong,
    spark: colors.mintLight,
    scrim: colors.mint,
  } satisfies BadgePalette;

  const warm = {
    outer: unlocked ? colors.emberDim : colors.fog,
    border: unlocked ? colors.accentBorder : colors.border,
    bgStart: unlocked ? colors.surfaceRaised : colors.surface,
    bgEnd: unlocked ? colors.fog : colors.surfaceRaised,
    glowStart: unlocked ? colors.emberLight : colors.textFaint,
    glowEnd: unlocked ? colors.ember : colors.borderStrong,
    spark: colors.emberLight,
    scrim: colors.emberLight,
  } satisfies BadgePalette;

  if (achievementId.startsWith("streak-")) return mint;
  if (achievementId === "day-1mi" || achievementId === "day-5mi" || achievementId === "distance-26") {
    return warm;
  }
  return ember;
}

function getBadgeTilt(achievementId: string): number {
  switch (achievementId) {
    case "first-tile":
      return -6;
    case "tiles-10":
      return 4;
    case "tiles-100":
      return -3;
    case "tiles-1000":
      return 5;
    case "tiles-10000":
      return -4;
    case "streak-3":
      return 3;
    case "streak-7":
      return -5;
    case "streak-30":
      return 2;
    case "day-1mi":
      return -4;
    case "day-5mi":
      return 5;
    case "day-100-tiles":
      return -2;
    case "distance-26":
      return 4;
    default:
      return 0;
  }
}

function BadgeGlyph({
  achievementId,
  unlocked,
  colors,
}: {
  achievementId: string;
  unlocked: boolean;
  colors: BadgePalette;
}) {
  const ink = unlocked ? colors.glowStart : colors.glowEnd;
  const softInk = unlocked ? colors.spark : colors.scrim;

  switch (achievementId) {
    case "first-tile":
      return (
        <G>
          <Polygon
            points="50,22 68,33 68,54 50,65 32,54 32,33"
            fill={colors.bgStart}
            stroke={ink}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <Ellipse cx="41" cy="59" rx="4.2" ry="2.8" fill={ink} opacity="0.82" />
          <Ellipse cx="36" cy="52" rx="3.2" ry="2.1" fill={ink} opacity="0.76" />
          <Ellipse cx="57" cy="57" rx="4.2" ry="2.8" fill={ink} opacity="0.82" />
          <Ellipse cx="63" cy="49" rx="3.2" ry="2.1" fill={ink} opacity="0.76" />
        </G>
      );
    case "tiles-10":
      return (
        <G>
          <Polygon points="38,26 50,19 62,26 62,40 50,47 38,40" fill={colors.bgStart} stroke={ink} strokeWidth="3" />
          <Polygon points="24,44 36,37 48,44 48,58 36,65 24,58" fill={colors.bgStart} stroke={softInk} strokeWidth="3" />
          <Polygon points="52,44 64,37 76,44 76,58 64,65 52,58" fill={colors.bgStart} stroke={ink} strokeWidth="3" />
          <Path d="M36 58h28" stroke={softInk} strokeWidth="3" strokeLinecap="round" />
        </G>
      );
    case "tiles-100":
      return (
        <G>
          {[22, 40, 58].map((x) =>
            [24, 42, 60].map((y) => (
              <Rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width="12"
                height="12"
                rx="3"
                fill={colors.bgStart}
                stroke={x === 40 && y === 42 ? ink : softInk}
                strokeWidth="2.8"
              />
            )),
          )}
        </G>
      );
    case "tiles-1000":
      return (
        <G>
          <Rect x="24" y="48" width="10" height="18" rx="2" fill={colors.bgStart} stroke={softInk} strokeWidth="2.8" />
          <Rect x="38" y="38" width="12" height="28" rx="2" fill={colors.bgStart} stroke={ink} strokeWidth="2.8" />
          <Rect x="54" y="30" width="14" height="36" rx="2" fill={colors.bgStart} stroke={softInk} strokeWidth="2.8" />
          <Path d="M22 66h56" stroke={ink} strokeWidth="3" strokeLinecap="round" />
          <Path d="M32 44h6M58 38h6" stroke={softInk} strokeWidth="2.4" strokeLinecap="round" />
        </G>
      );
    case "tiles-10000":
      return (
        <G>
          <Path
            d="M24 44l16-10 16 10v20H24z"
            fill={colors.bgStart}
            stroke={ink}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <Path d="M40 34v30" stroke={softInk} strokeWidth="2.8" strokeLinecap="round" />
          <Path d="M28 54c10-4 26-4 36 0" stroke={softInk} strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <Path d="M64 30l10 6-10 6" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </G>
      );
    case "streak-3":
      return (
        <G>
          <Path
            d="M50 24c-6 8-13 15-13 24 0 10 8 18 13 18s13-8 13-18c0-9-7-16-13-24z"
            fill={colors.bgStart}
            stroke={ink}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <Path d="M44 54c0-4 2-7 6-12 1 6 4 8 4 13 0 5-3 8-7 8-2 0-3-2-3-5z" fill={softInk} opacity="0.9" />
        </G>
      );
    case "streak-7":
      return (
        <G>
          <Path
            d="M50 22c-7 9-15 17-15 27 0 11 9 20 15 20s15-9 15-20c0-10-8-18-15-27z"
            fill={colors.bgStart}
            stroke={ink}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <Path d="M36 34c3-3 6-5 9-5M64 34c-3-3-6-5-9-5" stroke={softInk} strokeWidth="2.5" strokeLinecap="round" />
          <Circle cx="28" cy="26" r="2.6" fill={softInk} />
          <Circle cx="72" cy="28" r="2.6" fill={softInk} />
        </G>
      );
    case "streak-30":
      return (
        <G>
          <Path
            d="M50 21c-7 9-14 17-14 28 0 11 8 19 14 19s14-8 14-19c0-11-7-19-14-28z"
            fill={colors.bgStart}
            stroke={ink}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <Path d="M50 18v-6M50 79v-6M76 50h-6M30 50h-6" stroke={softInk} strokeWidth="2.6" strokeLinecap="round" />
          <Path d="M33 33l4 4M67 33l-4 4M33 67l4-4M67 67l-4-4" stroke={softInk} strokeWidth="2.3" strokeLinecap="round" />
        </G>
      );
    case "day-1mi":
      return (
        <G>
          <Path d="M24 64c10-8 20-12 52-12" stroke={ink} strokeWidth="3" strokeLinecap="round" fill="none" />
          <Circle cx="42" cy="31" r="5" fill={colors.bgStart} stroke={softInk} strokeWidth="2.8" />
          <Path d="M42 36l-2 12 7 8M40 44l-8 6M46 44l8 5" stroke={softInk} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M55 54l8 10M49 60l-2 9" stroke={ink} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </G>
      );
    case "day-5mi":
      return (
        <G>
          <Path d="M24 63l18-21 12 14 11-16 11 23" fill={colors.bgStart} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
          <Path d="M24 63h52" stroke={softInk} strokeWidth="2.8" strokeLinecap="round" />
          <Path d="M43 42l11 14" stroke={softInk} strokeWidth="2.5" strokeLinecap="round" />
          <Circle cx="49" cy="40" r="3.5" fill={softInk} />
        </G>
      );
    case "day-100-tiles":
      return (
        <G>
          <Path d="M22 58c10-8 14-12 20-11 7 0 8 9 16 9s12-7 20-14" stroke={ink} strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <Path d="M26 42c8-4 14-4 20 0M54 34c7 2 12 5 18 10" stroke={softInk} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <Polygon points="40,64 46,60 52,64 52,72 46,76 40,72" fill={colors.bgStart} stroke={softInk} strokeWidth="2.6" />
        </G>
      );
    case "distance-26":
      return (
        <G>
          <Path d="M30 29l20 11 20-11" fill={colors.bgStart} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
          <Circle cx="50" cy="56" r="15" fill={colors.bgStart} stroke={ink} strokeWidth="3.2" />
          <Path d="M50 45v11l8 6" stroke={softInk} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M39 33v10M61 33v10" stroke={softInk} strokeWidth="2.4" strokeLinecap="round" />
          <Path d="M37 68h26" stroke={softInk} strokeWidth="2.5" strokeLinecap="round" />
        </G>
      );
    default:
      return (
        <G>
          <Circle cx="50" cy="50" r="16" fill={colors.bgStart} stroke={ink} strokeWidth="3.2" />
          <Path d="M50 37v26M37 50h26" stroke={softInk} strokeWidth="3" strokeLinecap="round" />
        </G>
      );
  }
}