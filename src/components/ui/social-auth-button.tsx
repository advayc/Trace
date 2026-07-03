import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { GoogleIcon } from "@/components/ui/google-icon";
import { colors, fonts, radius } from "@/constants/theme";

type SocialVariant = "google" | "apple" | "primary" | "outline";

interface SocialAuthButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: SocialVariant;
  subtitle?: string;
}

const VARIANTS: Record<
  SocialVariant,
  {
    bg: string;
    border: string;
    borderWidth: number;
    text: string;
    iconTint?: string;
  }
> = {
  google: {
    bg: colors.buttonLight,
    border: colors.buttonLightText,
    borderWidth: 1.5,
    text: colors.buttonLightText,
  },
  apple: {
    bg: colors.buttonLight,
    border: colors.buttonLightText,
    borderWidth: 1.5,
    text: colors.buttonLightText,
  },
  primary: {
    bg: colors.ember,
    border: colors.ember,
    borderWidth: 0,
    text: colors.text,
  },
  outline: {
    bg: "transparent",
    border: colors.ember,
    borderWidth: 1.5,
    text: colors.ember,
  },
};

const SOCIAL_RADIUS = radius.md;

function SocialButtonContent({
  variant,
  label,
  style,
}: {
  variant: SocialVariant;
  label: string;
  style: (typeof VARIANTS)[SocialVariant];
}) {
  return (
    <View
      style={{
        width: "100%",
        minHeight: 24,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {variant === "google" || variant === "apple" ? (
        <View style={{ position: "absolute", left: 0 }}>
          {variant === "google" ? (
            <GoogleIcon size={20} />
          ) : (
            <Image
              source="sf:apple.logo"
              style={{ width: 20, height: 20 }}
              tintColor={style.iconTint ?? colors.buttonLightText}
            />
          )}
        </View>
      ) : null}
      <Text
        style={{
          fontFamily: fonts.semibold,
          fontSize: 15,
          color: style.text,
          textAlign: "center",
          paddingHorizontal: variant === "google" || variant === "apple" ? 36 : 8,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function SocialAuthButton({
  label,
  onPress,
  disabled,
  loading,
  variant = "google",
  subtitle,
}: SocialAuthButtonProps) {
  const style = VARIANTS[variant];

  return (
    <View style={{ gap: 6 }}>
      <Pressable
        disabled={disabled || loading}
        onPress={() => {
          if (process.env.EXPO_OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onPress();
        }}
        style={({ pressed }) => ({
          minHeight: 52,
          borderRadius: SOCIAL_RADIUS,
          borderWidth: style.borderWidth,
          borderColor: style.border,
          backgroundColor: style.bg,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 14,
          paddingHorizontal: 20,
          opacity: disabled ? 0.45 : pressed ? 0.9 : 1,
        })}
      >
        {loading ? (
          <ActivityIndicator color={style.text} />
        ) : (
          <SocialButtonContent variant={variant} label={label} style={style} />
        )}
      </Pressable>
      {subtitle ? (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 12,
            color: colors.textFaint,
            textAlign: "center",
            lineHeight: 17,
            paddingHorizontal: 4,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
