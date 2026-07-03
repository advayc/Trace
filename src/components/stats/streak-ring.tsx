import { Image } from "expo-image";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors, fonts, radius } from "@/constants/theme";

interface StreakRingProps {
  current: number;
  best: number;
  todayActive: boolean;
}

export function StreakRing({ current, best, todayActive }: StreakRingProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(420).delay(60)}
      style={{
        backgroundColor: colors.surfaceRaised,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: current > 0 ? colors.successBorder : colors.border,
        padding: 22,
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
      }}
    >
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          borderWidth: 3,
          borderColor: current > 0 ? colors.mint : colors.fog,
          backgroundColor: colors.mintDim,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontFamily: fonts.displayBold,
            fontSize: 32,
            color: current > 0 ? colors.mint : colors.textMuted,
          }}
        >
          {current}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Image
            source="sf:flame.fill"
            style={{ width: 16, height: 16 }}
            tintColor={colors.mint}
          />
          <Text
            style={{ fontFamily: fonts.semibold, fontSize: 17, color: colors.text }}
          >
            {current === 1 ? "1 day streak" : `${current} day streak`}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.textMuted,
            lineHeight: 20,
          }}
        >
          {todayActive
            ? "New ground stomped today — streak safe."
            : current > 0
              ? "Reveal one new tile today to keep it alive."
              : "Reveal a new tile to start a streak."}
        </Text>
        <Text
          style={{
            fontFamily: fonts.medium,
            fontSize: 13,
            color: colors.textFaint,
          }}
        >
          Best: {best} {best === 1 ? "day" : "days"}
        </Text>
      </View>
    </Animated.View>
  );
}
