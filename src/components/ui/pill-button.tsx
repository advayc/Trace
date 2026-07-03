import * as Haptics from "expo-haptics";
import { Pressable, StyleProp, Text, ViewStyle } from "react-native";

import { colors, fonts, radius } from "@/constants/theme";

interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function PillButton({
  label,
  onPress,
  variant = "primary",
  style,
  disabled,
}: PillButtonProps) {
  const background =
    variant === "primary"
      ? colors.ember
      : variant === "secondary"
        ? colors.surfaceRaised
        : variant === "danger"
          ? colors.dangerDim
          : "transparent";
  const textColor =
    variant === "primary"
      ? colors.text
      : variant === "outline"
        ? colors.ember
        : variant === "danger"
          ? colors.danger
          : colors.text;
  const borderWidth =
    variant === "ghost" || variant === "secondary" || variant === "outline" ? 1.5 : 0;
  const borderColor = variant === "outline" ? colors.ember : colors.border;

  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
      style={({ pressed }) => [
        {
          backgroundColor: background,
          borderRadius: radius.pill,
          borderWidth,
          borderColor,
          paddingVertical: 14,
          paddingHorizontal: 22,
          alignItems: "center",
          opacity: disabled ? 0.4 : pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: textColor }}>
        {label}
      </Text>
    </Pressable>
  );
}
