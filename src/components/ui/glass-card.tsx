import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

import { radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

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
  const { colors, scheme } = useTheme();

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
        tint={scheme === "light" ? "light" : "dark"}
        intensity={40}
        style={[{ backgroundColor: colors.glassBg }, contentStyle]}
      >
        {children}
      </BlurView>
    </View>
  );
}
