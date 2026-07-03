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
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        gap: 10,
        minWidth: 140,
      }}
    >
      <Image
        source={`sf:${sf}`}
        style={{ width: 18, height: 18 }}
        tintColor={accent ? colors.mint : colors.ember}
      />
      <Text
        selectable
        style={{
          fontFamily: fonts.displayBold,
          fontSize: 28,
          color: colors.text,
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
