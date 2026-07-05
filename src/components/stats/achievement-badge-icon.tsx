import { View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Stop,
} from "react-native-svg";

import {
  Day100TilesGlyph,
  Day1MiGlyph,
  Day5MiGlyph,
  DefaultGlyph,
  Distance26Glyph,
  FirstTileGlyph,
  Streak30Glyph,
  Streak3Glyph,
  Streak7Glyph,
  Tiles1000Glyph,
  Tiles10000Glyph,
  Tiles100Glyph,
  Tiles10Glyph,
} from "@/components/stats/achievement-badge-glyphs";
import { radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { AchievementDef } from "@/lib/achievements/definitions";

interface AchievementBadgeIconProps {
  achievement: AchievementDef;
  unlocked: boolean;
  size?: number;
}

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}

export function AchievementBadgeIcon({
  achievement,
  unlocked,
  size = 64,
}: AchievementBadgeIconProps) {
  const { colors } = useTheme();
  const palette = getBadgePalette(achievement.id, colors, unlocked);
  const gradId = `badge-${achievement.id}`;

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
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id={`${gradId}-bg`} x1="0.15" y1="0" x2="0.85" y2="1">
            <Stop offset="0" stopColor={palette.bgStart} />
            <Stop offset="1" stopColor={palette.bgEnd} />
          </LinearGradient>
          <RadialGradient id={`${gradId}-glow`} cx="50%" cy="42%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={palette.glowStart} stopOpacity={unlocked ? 0.28 : 0.1} />
            <Stop offset="1" stopColor={palette.glowEnd} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Polygon
          points={hexPoints(50, 50, 46)}
          fill={`url(#${gradId}-bg)`}
        />

        <Polygon
          points={hexPoints(50, 50, 46)}
          fill={`url(#${gradId}-glow)`}
        />

        <G opacity="0.18">
          <Polygon
            points={hexPoints(18, 18, 5)}
            fill="none"
            stroke={palette.scrim}
            strokeWidth="1.2"
          />
          <Polygon
            points={hexPoints(82, 18, 5)}
            fill="none"
            stroke={palette.scrim}
            strokeWidth="1.2"
          />
          <Polygon
            points={hexPoints(18, 82, 5)}
            fill="none"
            stroke={palette.scrim}
            strokeWidth="1.2"
          />
          <Polygon
            points={hexPoints(82, 82, 5)}
            fill="none"
            stroke={palette.scrim}
            strokeWidth="1.2"
          />
        </G>

        <Polygon
          points={hexPoints(50, 50, 38)}
          fill="none"
          stroke={palette.border}
          strokeWidth="1.6"
          strokeOpacity="0.55"
        />

        <Circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke={palette.scrim}
          strokeWidth="1"
          strokeOpacity="0.2"
          strokeDasharray="2 5"
        />

        <BadgeGlyph achievementId={achievement.id} unlocked={unlocked} colors={palette} />

        <Path
          d="M28 28c10 4 22 5 34 2"
          stroke="#FFFFFF"
          strokeOpacity="0.1"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        <Polygon
          points={hexPoints(50, 50, 46)}
          fill="none"
          stroke={palette.border}
          strokeWidth="2.2"
        />
        <Polygon
          points={hexPoints(50, 50, 42)}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.06"
          strokeWidth="1"
        />
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

function BadgeGlyph({
  achievementId,
  unlocked,
  colors,
}: {
  achievementId: string;
  unlocked: boolean;
  colors: BadgePalette;
}) {
  const props = { colors, unlocked };

  switch (achievementId) {
    case "first-tile":
      return <FirstTileGlyph {...props} />;
    case "tiles-10":
      return <Tiles10Glyph {...props} />;
    case "tiles-100":
      return <Tiles100Glyph {...props} />;
    case "tiles-1000":
      return <Tiles1000Glyph {...props} />;
    case "tiles-10000":
      return <Tiles10000Glyph {...props} />;
    case "streak-3":
      return <Streak3Glyph {...props} />;
    case "streak-7":
      return <Streak7Glyph {...props} />;
    case "streak-30":
      return <Streak30Glyph {...props} />;
    case "day-1mi":
      return <Day1MiGlyph {...props} />;
    case "day-5mi":
      return <Day5MiGlyph {...props} />;
    case "day-100-tiles":
      return <Day100TilesGlyph {...props} />;
    case "distance-26":
      return <Distance26Glyph {...props} />;
    default:
      return <DefaultGlyph {...props} />;
  }
}
