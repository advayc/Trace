import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { UserAvatar } from "@/components/auth/user-avatar";
import { PillButton } from "@/components/ui/pill-button";
import {
  ACCENT_PRESET_LABELS,
  ACCENT_TOKENS,
  fonts,
  radius,
  spacing,
  type AccentPreset,
} from "@/constants/theme";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useTheme } from "@/hooks/use-theme";
import {
  AVATAR_HUES,
  AVATAR_ICONS,
  type AvatarPreset,
} from "@/lib/auth/avatar-presets";
import { authService } from "@/lib/auth/auth-service";

export function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuthUser();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [avatar, setAvatar] = useState<AvatarPreset>(
    user?.avatar ?? { icon: "figure.walk", hue: 24 },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? "");
    setAvatar(user.avatar);
  }, [user]);

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.screen,
        }}
      >
        <Text style={{ fontFamily: fonts.body, color: colors.textMuted }}>
          Sign in to edit your profile.
        </Text>
        <PillButton label="Go back" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  const save = async () => {
    const trimmed = displayName.trim();
    if (trimmed.length < 2) {
      setError("Username needs at least 2 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authService.updateProfile({ displayName: trimmed, avatar });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: spacing.screen,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          gap: spacing.section,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Image
              source="sf:chevron.left"
              style={{ width: 18, height: 18 }}
              tintColor={colors.text}
            />
          </Pressable>
          <Text style={{ fontFamily: fonts.bold, fontSize: 22, color: colors.text }}>
            Edit profile
          </Text>
        </View>

        <View style={{ alignItems: "center", gap: 12 }}>
          <UserAvatar displayName={displayName} avatar={avatar} size={88} />
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted }}>
            Pick an icon and color below
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted }}>
            Username
          </Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            autoCorrect={false}
            placeholder="Your name"
            placeholderTextColor={colors.textFaint}
            style={{
              fontFamily: fonts.body,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.surfaceRaised,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          />
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted }}>
            Icon
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {AVATAR_ICONS.map((icon) => {
              const selected = avatar.icon === icon;
              return (
                <Pressable
                  key={icon}
                  onPress={() => setAvatar((prev) => ({ ...prev, icon }))}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: selected ? colors.emberDim : colors.surfaceRaised,
                    borderWidth: 1,
                    borderColor: selected ? colors.accentBorder : colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={`sf:${icon}`}
                    style={{ width: 22, height: 22 }}
                    tintColor={selected ? colors.ember : colors.textMuted}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted }}>
            Color
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {AVATAR_HUES.map((hue) => {
              const selected = avatar.hue === hue;
              return (
                <Pressable
                  key={hue}
                  onPress={() => setAvatar((prev) => ({ ...prev, hue }))}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `hsl(${hue}, 55%, 52%)`,
                    borderWidth: selected ? 3 : 1,
                    borderColor: selected ? colors.text : colors.border,
                  }}
                />
              );
            })}
          </View>
        </View>

        {error ? (
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.danger }}>
            {error}
          </Text>
        ) : null}

        <PillButton label="Save changes" onPress={save} disabled={busy} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Accent swatches for settings — separate from profile avatar hues. */
export function AccentPresetPicker({
  value,
  onChange,
}: {
  value: AccentPreset;
  onChange: (preset: AccentPreset) => void;
}) {
  const { colors } = useTheme();
  const presets = Object.keys(ACCENT_PRESET_LABELS) as AccentPreset[];

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {presets.map((preset) => {
        const token = ACCENT_TOKENS[preset];
        const selected = value === preset;
        return (
          <Pressable
            key={preset}
            onPress={() => onChange(preset)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: radius.pill,
              backgroundColor: selected ? colors.emberDim : colors.surface,
              borderWidth: 1,
              borderColor: selected ? colors.accentBorder : colors.border,
            }}
          >
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: token.ember,
              }}
            />
            <Text
              style={{
                fontFamily: fonts.medium,
                fontSize: 13,
                color: selected ? colors.text : colors.textMuted,
              }}
            >
              {ACCENT_PRESET_LABELS[preset]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
