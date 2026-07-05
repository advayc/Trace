import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  RefreshControl,
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
  isRemoteAvatarUrl,
  type AvatarPreset,
} from "@/lib/auth/avatar-presets";
import { authService } from "@/lib/auth/auth-service";

export function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuthUser();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [avatar, setAvatar] = useState<AvatarPreset>(
    user?.avatar ?? { icon: "figure.walk", hue: 24 },
  );
  const [useProviderPhoto, setUseProviderPhoto] = useState(
    isRemoteAvatarUrl(user?.avatarUrl),
  );
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? "");
    setUsername(user.username);
    setAvatar(user.avatar);
    setUseProviderPhoto(isRemoteAvatarUrl(user.avatarUrl));
  }, [user]);

  const providerPhotoUrl = user && isRemoteAvatarUrl(user.avatarUrl) ? user.avatarUrl : null;
  const providerLabel = user?.provider === "google" ? "Google" : user?.provider === "apple" ? "Apple" : "Account";

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
    const normalizedUsername = username.trim().toLowerCase().replace(/^@+/, "");
    if (trimmed.length < 2) {
      setError("Display name needs at least 2 characters.");
      return;
    }
    if (!/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
      setError("Username must be 3-24 chars with only letters, numbers, or _.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authService.updateProfile({
        displayName: trimmed,
        username: normalizedUsername,
        avatar,
        avatarUrl: useProviderPhoto ? providerPhotoUrl : undefined,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  };

  const refreshScreen = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 520);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshScreen}
            tintColor={colors.ember}
          />
        }
        contentContainerStyle={{
          padding: spacing.screen,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          gap: spacing.section,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 22, color: colors.text }}>
            Edit profile
          </Text>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.borderStrong,
              backgroundColor: colors.surfaceRaised,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.82 : 1,
            })}
          >
            <Image
              source="sf:xmark"
              style={{ width: 13, height: 13 }}
              tintColor={colors.textMuted}
            />
          </Pressable>
        </View>

        <View style={{ alignItems: "center", gap: 12 }}>
          <UserAvatar
            displayName={displayName}
            avatar={avatar}
            avatarUrl={useProviderPhoto ? providerPhotoUrl : null}
            size={88}
          />
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted }}>
            Use your provider photo or pick an icon and color.
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

        <View style={{ gap: 8 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted }}>
            Username
          </Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="your_name"
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

        {providerPhotoUrl ? (
          <View style={{ gap: 10 }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted }}>
              Profile picture
            </Text>
            <Pressable
              onPress={() => setUseProviderPhoto(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: radius.md,
                backgroundColor: colors.surfaceRaised,
                borderWidth: 1,
                borderColor: useProviderPhoto ? colors.accentBorder : colors.border,
              }}
            >
              <UserAvatar displayName={displayName} avatarUrl={providerPhotoUrl} avatar={avatar} size={44} />
              <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.text }}>
                Use {providerLabel} photo
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={{ gap: 10 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted }}>
            Icon
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {AVATAR_ICONS.map((icon) => {
              const selected = !useProviderPhoto && avatar.icon === icon;
              return (
                <Pressable
                  key={icon}
                  onPress={() => {
                    setUseProviderPhoto(false);
                    setAvatar((prev) => ({ ...prev, icon }));
                  }}
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
              const selected = !useProviderPhoto && avatar.hue === hue;
              return (
                <Pressable
                  key={hue}
                  onPress={() => {
                    setUseProviderPhoto(false);
                    setAvatar((prev) => ({ ...prev, hue }));
                  }}
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
