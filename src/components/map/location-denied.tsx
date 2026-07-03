import { Image } from "expo-image";
import { Linking, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { PillButton } from "@/components/ui/pill-button";
import { colors, fonts } from "@/constants/theme";

export function LocationDenied() {
  return (
    <Animated.View
      entering={FadeInDown.duration(450)}
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 16,
      }}
    >
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: colors.surface,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source="sf:location.slash.fill"
          style={{ width: 38, height: 38 }}
          tintColor={colors.textMuted}
        />
      </View>
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize: 24,
          color: colors.text,
          textAlign: "center",
        }}
      >
        The fog needs your location
      </Text>
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 15,
          color: colors.textMuted,
          textAlign: "center",
          lineHeight: 22,
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
