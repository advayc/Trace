import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

import { colors, radius } from "@/constants/theme";

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  borderRadius?: number;
}

export function GlassCard({
  children,
  style,
  contentStyle,
  borderRadius = radius.md,
}: GlassCardProps) {
  return (
    <View
      style={[
        {
          borderRadius,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <BlurView
        tint="dark"
        intensity={40}
        style={[{ backgroundColor: colors.glassBg }, contentStyle]}
      >
        {children}
      </BlurView>
    </View>
  );
}
