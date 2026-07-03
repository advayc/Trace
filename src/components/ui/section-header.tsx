import { Text, View } from "react-native";

import { fonts } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 4 }}>
      <Text
        style={{
          fontFamily: fonts.semibold,
          fontSize: 13,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: colors.textFaint,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.textMuted,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
