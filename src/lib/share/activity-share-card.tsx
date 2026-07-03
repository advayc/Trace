import type { RefObject } from "react";
import { Text, View } from "react-native";
import Svg, { Polyline } from "react-native-svg";

import { colors, fonts, radius } from "@/constants/theme";
import type { Activity } from "@/lib/activity/activity-types";
import { formatDuration, formatPace } from "@/lib/activity/activity-format";
import { formatCompact } from "@/lib/stats/format";

const CARD_WIDTH = 360;
const CARD_HEIGHT = 480;
const MAP_HEIGHT = 220;

function routeToPolyline(
  route: Activity["route"],
  width: number,
  height: number,
): string | null {
  if (route.length < 2) return null;

  const lats = route.map((p) => p.latitude);
  const lngs = route.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = Math.max(maxLat - minLat, 0.0001);
  const lngSpan = Math.max(maxLng - minLng, 0.0001);
  const pad = 16;

  return route
    .map((p) => {
      const x = pad + ((p.longitude - minLng) / lngSpan) * (width - pad * 2);
      const y =
        height - pad - ((p.latitude - minLat) / latSpan) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

interface ActivityShareCardProps {
  activity: Activity;
}

/** Strava-style share card — capture with view-shot for sharing. */
export function ActivityShareCard({ activity }: ActivityShareCardProps) {
  const polyline = routeToPolyline(activity.route, CARD_WIDTH, MAP_HEIGHT);
  const title = activity.type === "run" ? "Run" : "Walk";

  return (
    <View
      collapsable={false}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: radius.lg,
        overflow: "hidden",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.borderStrong,
      }}
    >
      <View style={{ height: MAP_HEIGHT, backgroundColor: colors.bg }}>
        {polyline ? (
          <Svg width={CARD_WIDTH} height={MAP_HEIGHT}>
            <Polyline
              points={polyline}
              fill="none"
              stroke={colors.ember}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ) : null}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: MAP_HEIGHT * 0.55,
            backgroundColor: "rgba(18,18,18,0.72)",
          }}
        />
      </View>

      <View style={{ padding: 20, gap: 16, flex: 1 }}>
        <View style={{ gap: 4 }}>
          <Text
            style={{
              fontFamily: fonts.displayBold,
              fontSize: 28,
              color: colors.text,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.textMuted,
            }}
          >
            Trace · fog of war
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 20 }}>
          <View style={{ gap: 2 }}>
            <Text
              style={{
                fontFamily: fonts.displayBold,
                fontSize: 22,
                color: colors.text,
              }}
            >
              {(activity.distanceM / 1000).toFixed(2)} km
            </Text>
            <Text
              style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textFaint }}
            >
              distance
            </Text>
          </View>
          <View style={{ gap: 2 }}>
            <Text
              style={{
                fontFamily: fonts.displayBold,
                fontSize: 22,
                color: colors.text,
              }}
            >
              {formatDuration(activity.durationMs)}
            </Text>
            <Text
              style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textFaint }}
            >
              time
            </Text>
          </View>
          <View style={{ gap: 2 }}>
            <Text
              style={{
                fontFamily: fonts.displayBold,
                fontSize: 22,
                color: colors.text,
              }}
            >
              {formatPace(activity.avgPaceSPerKm).replace(" /km", "")}
            </Text>
            <Text
              style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textFaint }}
            >
              pace /km
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: "auto",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.displayBold,
              fontSize: 20,
              color: colors.mint,
            }}
          >
            +{formatCompact(activity.newTiles)} tiles
          </Text>
          {activity.reclaimedTiles > 0 ? (
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 13,
                color: colors.textMuted,
              }}
            >
              · {activity.reclaimedTiles} reclaimed
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export const ACTIVITY_SHARE_CARD_SIZE = {
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
};
