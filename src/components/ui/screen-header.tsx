import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors, fonts } from "@/constants/theme";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Large editorial title (default) or compact section title. */
  size?: "large" | "compact";
}

export function ScreenHeader({
  title,
  subtitle,
  size = "large",
}: ScreenHeaderProps) {
  return (
    <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 6 }}>
      <Text
        style={{
          fontFamily: size === "large" ? fonts.displayBold : fonts.display,
          fontSize: size === "large" ? 38 : 24,
          lineHeight: size === "large" ? 44 : 30,
          color: colors.text,
          letterSpacing: size === "large" ? -0.5 : 0,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 15,
            lineHeight: 22,
            color: colors.textMuted,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </Animated.View>
  );
}
