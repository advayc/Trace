import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { ActivityIndicator, Pressable, Text } from "react-native";

import { colors, fonts, radius } from "@/constants/theme";

interface AuthButtonProps {
  label: string;
  sf?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "filled" | "outline";
}

export function AuthButton({
  label,
  sf,
  onPress,
  disabled,
  loading,
  variant = "outline",
}: AuthButtonProps) {
  const isFilled = variant === "filled";

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={() => {
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
      style={({ pressed }) => ({
        height: 52,
        borderRadius: radius.sm,
        borderWidth: isFilled ? 0 : 1,
        borderColor: colors.borderStrong,
        backgroundColor: isFilled ? colors.text : colors.surfaceRaised,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={isFilled ? colors.bg : colors.text} />
      ) : (
        <>
          {sf ? (
            <Image
              source={`sf:${sf}`}
              style={{ width: 20, height: 20 }}
              tintColor={isFilled ? colors.bg : colors.text}
            />
          ) : null}
          <Text
            style={{
              fontFamily: fonts.semibold,
              fontSize: 15,
              color: isFilled ? colors.bg : colors.text,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
