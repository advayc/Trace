import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { fonts, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useSetting } from "@/hooks/use-settings";
import { SETTINGS_KEYS } from "@/lib/storage/settings";

export default function StartScreen() {
  const { colors } = useTheme();
  const [onboarded] = useSetting(SETTINGS_KEYS.onboarded, false);
  const [logoHovered, setLogoHovered] = useState(false);

  const continueToFlow = () => {
    router.replace(onboarded ? "/(tabs)" : "/onboarding");
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ backgroundColor: colors.bg }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: spacing.screen,
          paddingTop: 44,
          paddingBottom: 32,
          justifyContent: "space-between",
        }}
      >
        <View style={{ alignItems: "center", gap: 18 }}>
          <View
            style={{
              width: 264,
              height: 264,
              borderRadius: 132,
              borderWidth: 1,
              borderColor: logoHovered ? colors.accentBorder : colors.border,
              backgroundColor: colors.emberDim,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Pressable
              onHoverIn={() => setLogoHovered(true)}
              onHoverOut={() => setLogoHovered(false)}
              style={{
                width: 236,
                height: 236,
                borderRadius: 118,
                borderWidth: 1,
                borderColor: logoHovered ? colors.ember : colors.accentBorder,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("../../assets/images/logo-glow.png")}
                contentFit="contain"
                style={{ width: 188, height: 188 }}
              />
            </Pressable>
          </View>

          <View style={{ alignItems: "center", gap: 10 }}>
            <Text
              style={{
                fontFamily: fonts.displayBold,
                fontSize: 46,
                letterSpacing: -1.2,
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
    </ScrollView>
  );
}
