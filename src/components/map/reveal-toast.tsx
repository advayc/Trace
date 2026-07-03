import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { colors, fonts, radius } from "@/constants/theme";

interface RevealToastProps {
  /** Bumps every time a new tile is revealed. */
  revealCount: number;
  sessionTiles: number;
}

/** Brief "+1 tile" flourish above the map controls on each reveal. */
export function RevealToast({ revealCount, sessionTiles }: RevealToastProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (revealCount === 0) return;
    progress.value = withSequence(
      withTiming(1, { duration: 220, easing: Easing.out(Easing.back(1.6)) }),
      withTiming(1, { duration: 1100 }),
      withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) }),
    );
  }, [progress, revealCount]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: 12 * (1 - progress.value) },
      { scale: 0.9 + 0.1 * progress.value },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          backgroundColor: colors.emberDim,
          borderColor: colors.accentBorder,
          borderWidth: 1,
          borderRadius: radius.pill,
          paddingVertical: 8,
          paddingHorizontal: 16,
        },
        style,
      ]}
    >
      <Text
        style={{ fontFamily: fonts.semibold, fontSize: 14, color: colors.emberLight }}
      >
        +1 tile · {sessionTiles} this walk
      </Text>
    </Animated.View>
  );
}
