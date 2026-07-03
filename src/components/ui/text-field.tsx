import { Text, TextInput, View, type TextInputProps } from "react-native";

import { colors, fonts, radius } from "@/constants/theme";

interface TextFieldProps extends TextInputProps {
  label?: string;
}

export function TextField({ label, style, ...props }: TextFieldProps) {
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text
          style={{
            fontFamily: fonts.medium,
            fontSize: 13,
            color: colors.textMuted,
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textFaint}
        {...props}
        style={[
          {
            fontFamily: fonts.body,
            fontSize: 15,
            color: colors.text,
            backgroundColor: colors.surfaceRaised,
            borderRadius: radius.sm,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 14,
            paddingVertical: 12,
          },
          style,
        ]}
      />
    </View>
  );
}
