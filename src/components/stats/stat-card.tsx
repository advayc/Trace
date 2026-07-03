import { Image } from "expo-image";
import { Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { colors, fonts, radius } from "@/constants/theme";
import { staggerDelay } from "@/lib/motion/stagger";

interface StatCardProps {
  label: string;
  value: string;
  sf: string;
  accent?: boolean;
  index?: number;
}

export function StatCard({ label, value, sf, accent, index = 0 }: StatCardProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(380).delay(staggerDelay(index, 70))}
      style={{
        flex: 1,
        backgroundColor: colors.surfaceRaised,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 18,
        gap: 12,
        minWidth: 140,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: accent ? colors.mintDim : colors.emberDim,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={`sf:${sf}`}
          style={{ width: 16, height: 16 }}
          tintColor={accent ? colors.mint : colors.ember}
        />
      </View>
      <Text
        selectable
        style={{
          fontFamily: fonts.displayBold,
          fontSize: 30,
          color: colors.text,
          letterSpacing: -0.3,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 13,
          color: colors.textMuted,
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}
