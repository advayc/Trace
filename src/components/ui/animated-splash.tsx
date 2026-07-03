import { Image } from "expo-image";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
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

  useEffect(() => {
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
      { scale: 0.82 + 0.18 * progress.value },
      { translateY: 10 * (1 - progress.value) },
    ],
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
        <Image
          source={require("@/assets/images/trace-icon.png")}
          style={{ width: 96, height: 96, borderRadius: 24 }}
          contentFit="contain"
        />
        <View style={{ alignItems: "center", gap: 8 }}>
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
        </View>
      </Animated.View>
    </Animated.View>
  );
}
