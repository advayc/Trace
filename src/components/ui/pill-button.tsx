import * as Haptics from "expo-haptics";
import { Pressable, StyleProp, Text, ViewStyle } from "react-native";

import { colors, fonts, radius } from "@/constants/theme";

interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger";
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
      : variant === "danger"
        ? "rgba(248,113,113,0.14)"
        : "transparent";
  const textColor =
    variant === "primary"
      ? colors.bg
      : variant === "danger"
        ? colors.danger
        : colors.text;

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
          borderWidth: variant === "ghost" ? 1 : 0,
          borderColor: colors.border,
          paddingVertical: 14,
          paddingHorizontal: 24,
          alignItems: "center",
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: textColor }}>
        {label}
      </Text>
    </Pressable>
  );
}
