import { Image } from "expo-image";
import { Text, View } from "react-native";

import { colors, fonts, radius } from "@/constants/theme";
import type { Activity } from "@/lib/activity/activity-types";
import {
  formatDistanceKm,
  formatDurationShort,
  formatPace,
} from "@/lib/activity/activity-format";
import { formatCompact } from "@/lib/stats/format";
import { ShareCardMap } from "@/lib/share/share-card-map";

const CARD_WIDTH = 360;
const CARD_HEIGHT = 520;
const MAP_HEIGHT = 260;

interface ActivityShareCardProps {
  activity: Activity;
  onMapReady?: () => void;
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 12,
          color: colors.textMuted,
          textTransform: "capitalize",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: fonts.displayBold,
          fontSize: 24,
          color: colors.text,
          letterSpacing: -0.3,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

/** Strava-style share card — capture with view-shot for sharing. */
export function ActivityShareCard({ activity, onMapReady }: ActivityShareCardProps) {
  const title = activity.type === "run" ? "Run" : "Walk";
  const icon = activity.type === "run" ? "sf:figure.run" : "sf:figure.walk";

  return (
    <View
      collapsable={false}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: radius.lg,
        overflow: "hidden",
        backgroundColor: colors.bg,
      }}
    >
      <ShareCardMap
        route={activity.route}
        width={CARD_WIDTH}
        height={MAP_HEIGHT}
        onMapReady={onMapReady}
      />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 22,
          paddingTop: 18,
          paddingBottom: 22,
          gap: 18,
          marginTop: -36,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image source={icon} style={{ width: 22, height: 22 }} tintColor={colors.text} />
          <Text
            style={{
              fontFamily: fonts.displayBold,
              fontSize: 30,
              color: colors.text,
              letterSpacing: -0.5,
            }}
          >
            {title}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 16 }}>
          <StatBlock label="pace" value={formatPace(activity.avgPaceSPerKm)} />
          <StatBlock label="time" value={formatDurationShort(activity.durationMs)} />
          <StatBlock label="distance" value={formatDistanceKm(activity.distanceM)} />
        </View>

        <View
          style={{
            marginTop: "auto",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ gap: 2 }}>
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
                  fontSize: 12,
                  color: colors.textMuted,
                }}
              >
                {activity.reclaimedTiles} reclaimed
              </Text>
            ) : null}
          </View>
          <Text
            style={{
              fontFamily: fonts.displayBold,
              fontSize: 22,
              color: colors.ember,
              letterSpacing: 1.2,
            }}
          >
            TRACE
          </Text>
        </View>
      </View>
    </View>
  );
}

export const ACTIVITY_SHARE_CARD_SIZE = {
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
};
