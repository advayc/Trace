import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useSetting } from "@/hooks/use-settings";
import { SETTINGS_KEYS } from "@/lib/storage/settings";

export default function StartScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [onboarded] = useSetting(SETTINGS_KEYS.onboarded, false);

  const continueToFlow = () => {
    router.replace(onboarded ? "/(tabs)" : "/onboarding");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: spacing.screen,
      }}
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 20 }}>
        <Image
          source={require("../../assets/images/trace-icon.png")}
          contentFit="contain"
          style={{ width: 128, height: 128, borderRadius: 28 }}
        />

        <View style={{ alignItems: "center", gap: 10 }}>
          <Text
            style={{
              fontFamily: fonts.displayBold,
              fontSize: 42,
              letterSpacing: -1,
              color: colors.text,
            }}
          >
            Trace
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 15,
              lineHeight: 22,
              color: colors.textMuted,
              textAlign: "center",
              maxWidth: 300,
            }}
          >
            Your city, redrawn by your footsteps. Reveal the fog one walk at a time.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={continueToFlow}
        style={({ hovered, pressed }) => ({
          borderRadius: radius.pill,
          borderWidth: 1.5,
          borderColor: hovered ? colors.emberLight : colors.ember,
          backgroundColor: hovered ? colors.emberLight : colors.ember,
          paddingVertical: 16,
          paddingHorizontal: 22,
          alignItems: "center",
          opacity: pressed ? 0.86 : 1,
          transform: [{ scale: pressed ? 0.98 : hovered ? 1.02 : 1 }],
        })}
      >
        <Text
          style={{
            fontFamily: fonts.semibold,
            fontSize: 16,
            color: colors.buttonLightText,
          }}
        >
          Get Started
        </Text>
      </Pressable>
    </View>
  );
}
