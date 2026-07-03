import { Image } from "expo-image";
import { Linking, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { PillButton } from "@/components/ui/pill-button";
import { fonts, radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function LocationDenied() {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(450)}
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 18,
      }}
    >
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: radius.xl,
          backgroundColor: colors.surfaceRaised,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source="sf:location.slash.fill"
          style={{ width: 36, height: 36 }}
          tintColor={colors.textMuted}
        />
      </View>
      <Text
        style={{
          fontFamily: fonts.displayBold,
          fontSize: 26,
          color: colors.text,
          textAlign: "center",
        }}
      >
        Location access needed
      </Text>
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 15,
          color: colors.textMuted,
          textAlign: "center",
          lineHeight: 23,
        }}
      >
        Trace can only reveal tiles where you actually walk. Allow location
        access in Settings — your position never leaves this device.
      </Text>
      <PillButton
        label="Open Settings"
        onPress={() => Linking.openSettings()}
        style={{ marginTop: 8, alignSelf: "stretch" }}
      />
    </Animated.View>
  );
}
