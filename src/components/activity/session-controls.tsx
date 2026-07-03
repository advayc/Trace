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
}

function ActionButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "primary" | "danger";
}) {
  const { colors } = useTheme();
  const backgroundColor =
    variant === "primary"
      ? colors.ember
      : variant === "danger"
        ? colors.dangerDim
        : colors.surfaceRaised;
  const borderColor = variant === "primary" ? colors.ember : colors.border;
  const textColor = variant === "danger" ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        paddingVertical: 13,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor,
        backgroundColor,
        alignItems: "center",
        opacity: pressed ? 0.86 : 1,
      })}
    >
      <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: textColor }}>{label}</Text>
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
}: SessionControlsProps) {
  const { colors } = useTheme();

  if (activeSession) {
    return (
      <View style={{ gap: 10 }}>
        <View
          style={{
            backgroundColor: colors.surfaceRaised,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 12,
          }}
        >
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted }}>
            {activeSession.type === "run" ? "Run in progress" : "Walk in progress"}
            {`  ${formatDuration(activeSession.durationMs)}`}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ActionButton label="Stop session" onPress={onStop} variant="danger" />
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <ActionButton label="Start walk" onPress={onStartWalk} variant="default" />
        <ActionButton label="Start run" onPress={onStartRun} variant="primary" />
      </View>
      {latestActivity ? (
        <ActionButton label="Share last activity" onPress={onShareLatest} />
      ) : null}
    </View>
  );
}
