import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { fonts, radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Activity, ActiveSession } from "@/lib/activity/activity-types";
import { formatDuration } from "@/lib/activity/activity-format";

interface SessionControlsProps {
  activeSession: ActiveSession | null;
  latestActivity: Activity | null;
  onStartWalk: () => void;
  onStartRun: () => void;
  onStop: () => void;
  onShareLatest: () => void;
  showStartOptions?: boolean;
}

function ActivityTypeCard({
  label,
  subtitle,
  icon,
  onPress,
  accent = false,
}: {
  label: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  accent?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: accent ? colors.ember : colors.border,
        backgroundColor: accent ? colors.emberDim : colors.surfaceRaised,
        paddingVertical: 14,
        paddingHorizontal: 12,
        gap: 8,
        opacity: pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: accent ? colors.ember : colors.fog,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={icon}
          style={{ width: 17, height: 17 }}
          tintColor={accent ? colors.bg : colors.ember}
        />
      </View>
      <View style={{ gap: 2 }}>
        <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: colors.text }}>
          {label}
        </Text>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 12,
            color: colors.textMuted,
            lineHeight: 16,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

export function SessionControls({
  activeSession,
  latestActivity,
  onStartWalk,
  onStartRun,
  onStop,
  onShareLatest,
  showStartOptions = true,
}: SessionControlsProps) {
  const { colors } = useTheme();

  if (activeSession) {
    const label = activeSession.type === "run" ? "Run" : "Walk";
    return (
      <View style={{ gap: 10 }}>
        <View
          style={{
            backgroundColor: colors.surfaceRaised,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.accentBorder,
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.emberDim,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={activeSession.type === "run" ? "sf:figure.run" : "sf:figure.walk"}
              style={{ width: 17, height: 17 }}
              tintColor={colors.ember}
            />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: colors.text }}>
              {label} in progress
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMuted }}>
              {formatDuration(activeSession.durationMs)} · {activeSession.newTiles} new tiles
            </Text>
          </View>
        </View>
        <Pressable
          onPress={onStop}
          style={({ pressed }) => ({
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: colors.danger,
            backgroundColor: colors.dangerDim,
            paddingVertical: 14,
            alignItems: "center",
            opacity: pressed ? 0.86 : 1,
          })}
        >
          <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: colors.danger }}>
            End session
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!showStartOptions) {
    return null;
  }

  return (
    <View style={{ gap: 10 }}>
      <Text
        style={{
          fontFamily: fonts.medium,
          fontSize: 12,
          color: colors.textFaint,
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        Start activity
      </Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <ActivityTypeCard
          label="Walk"
          subtitle="Explore & reveal tiles"
          icon="sf:figure.walk"
          onPress={onStartWalk}
        />
        <ActivityTypeCard
          label="Run"
          subtitle="Track pace & distance"
          icon="sf:figure.run"
          onPress={onStartRun}
          accent
        />
      </View>
      {latestActivity ? (
        <Pressable
          onPress={onShareLatest}
          style={({ pressed }) => ({
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceRaised,
            paddingVertical: 12,
            alignItems: "center",
            opacity: pressed ? 0.86 : 1,
          })}
        >
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.ember }}>
            Share last activity
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
