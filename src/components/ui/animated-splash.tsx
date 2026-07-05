import { Image } from "expo-image";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { colors, fonts } from "@/constants/theme";

const HOLD_MS = 520;
const FADE_MS = 420;

interface AnimatedSplashProps {
  onFinish: () => void;
}

/** Branded splash overlay — fades/scales out after native splash hides. */
export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const progress = useSharedValue(0);
  const pulse = useSharedValue(0);
  const drift = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 920, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 920, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );

    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );

    progress.value = withSequence(
      withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }),
      withDelay(
        HOLD_MS,
        withTiming(0, { duration: FADE_MS, easing: Easing.in(Easing.cubic) }, () => {
          runOnJS(onFinish)();
        }),
      ),
    );
  }, [onFinish, progress]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: (0.82 + 0.18 * progress.value) * (1 + 0.025 * pulse.value) },
      { translateY: 10 * (1 - progress.value) - 5 * drift.value },
      { rotateZ: `${-2 + 4 * drift.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: progress.value * (0.1 + 0.18 * pulse.value),
    transform: [{ scale: 0.9 + 0.24 * pulse.value }],
  }));

  const copyStyle = useAnimatedStyle(() => ({
    opacity: progress.value * (0.7 + 0.3 * drift.value),
    transform: [{ translateY: 6 * (1 - progress.value) + 3 * drift.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          inset: 0,
          backgroundColor: colors.bg,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
        },
        overlayStyle,
      ]}
    >
      <Animated.View style={[{ alignItems: "center", gap: 20 }, logoStyle]}>
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 124,
              height: 124,
              borderRadius: 32,
              backgroundColor: colors.ember,
            },
            glowStyle,
          ]}
        />
        <Image
          source={require("@/assets/images/icon.svg")}
          style={{ width: 108, height: 108, borderRadius: 26 }}
          contentFit="contain"
        />
        <Animated.View style={[{ alignItems: "center", gap: 8 }, copyStyle]}>
          <Text
            style={{
              fontFamily: fonts.displayBold,
              fontSize: 36,
              color: colors.text,
              letterSpacing: -0.5,
            }}
          >
            Trace
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.textMuted,
              letterSpacing: 0.3,
            }}
          >
            Walk to reveal your city
          </Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
