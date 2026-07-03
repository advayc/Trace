import { Text, View } from "react-native";

import { colors, fonts } from "@/constants/theme";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={{ gap: 4 }}>
      <Text
        style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text }}
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
