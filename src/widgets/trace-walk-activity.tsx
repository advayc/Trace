import { HStack, Image, Text, VStack } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  opacity,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import {
  createLiveActivity,
  type LiveActivityEnvironment,
} from "expo-widgets";

export type TraceWalkActivityProps = {
  activityLabel: string;
  activityType: "walk" | "run";
  tilesLabel: string;
  timeLabel: string;
  distanceLabel: string;
  paceLabel: string;
  accentColor: string;
  isStale: boolean;
};

const WIDGET_TEXT = "#F4F4F5";
const WIDGET_MUTED = "#9CA3AF";

function TraceWalkActivity(
  props: TraceWalkActivityProps,
  environment: LiveActivityEnvironment,
) {
  "widget";

  const accent = props.isStale ? WIDGET_MUTED : props.accentColor;
  const textColor = environment.colorScheme === "dark" ? WIDGET_TEXT : "#0C0E12";
  const mutedColor = environment.colorScheme === "dark" ? WIDGET_MUTED : "#6B7280";
  const staleModifier = props.isStale ? [opacity(0.72)] : [];
  const activityIcon =
    props.activityType === "run" ? "figure.run" : "figure.walk";

  return {
    banner: (
      <VStack modifiers={[padding({ all: 14 }), ...staleModifier]}>
        <HStack>
          <Image systemName={activityIcon} color={accent} />
          <Text
            modifiers={[
              font({ weight: "semibold", size: 14 }),
              foregroundStyle(accent),
              padding({ leading: 8 }),
            ]}
          >
            {props.activityLabel}
          </Text>
        </HStack>
        <Text
          modifiers={[
            font({ weight: "bold", size: 28 }),
            foregroundStyle(textColor),
            padding({ top: 6 }),
          ]}
        >
          {props.tilesLabel}
        </Text>
        <Text
          modifiers={[
            font({ size: 13 }),
            foregroundStyle(mutedColor),
            padding({ top: 4 }),
          ]}
        >
          {props.timeLabel} · {props.distanceLabel} · {props.paceLabel}
        </Text>
      </VStack>
    ),
    compactLeading: (
      <Image
        systemName={activityIcon}
        color={accent}
        modifiers={staleModifier}
      />
    ),
    compactTrailing: (
      <Text
        modifiers={[
          font({ weight: "semibold", size: 13 }),
          foregroundStyle(textColor),
          ...staleModifier,
        ]}
      >
        {props.timeLabel}
      </Text>
    ),
    minimal: (
      <Text
        modifiers={[
          font({ weight: "bold", size: 12 }),
          foregroundStyle(accent),
          ...staleModifier,
        ]}
      >
        {props.tilesLabel}
      </Text>
    ),
    expandedLeading: (
      <VStack modifiers={[padding({ all: 10 }), ...staleModifier]}>
        <Text
          modifiers={[
            font({ weight: "bold", size: 32 }),
            foregroundStyle(accent),
          ]}
        >
          {props.tilesLabel}
        </Text>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(mutedColor)]}>
          new tiles
        </Text>
      </VStack>
    ),
    expandedTrailing: (
      <VStack modifiers={[padding({ all: 10 }), ...staleModifier]}>
        <Text
          modifiers={[
            font({ weight: "semibold", size: 16 }),
            foregroundStyle(textColor),
          ]}
        >
          {props.distanceLabel}
        </Text>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(mutedColor)]}>
          {props.paceLabel}
        </Text>
      </VStack>
    ),
    expandedBottom: (
      <VStack modifiers={[padding({ horizontal: 12, vertical: 8 }), ...staleModifier]}>
        <Text
          modifiers={[
            font({ weight: "medium", size: 13 }),
            foregroundStyle(textColor),
          ]}
        >
          {props.activityLabel} · {props.timeLabel}
        </Text>
      </VStack>
    ),
  };
}

export default createLiveActivity("TraceWalkActivity", TraceWalkActivity);
