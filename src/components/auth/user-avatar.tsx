import { Image } from "expo-image";
import { Text, View } from "react-native";

import { fonts } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  isRemoteAvatarUrl,
  parseAvatar,
  type AvatarPreset,
} from "@/lib/auth/avatar-presets";

interface UserAvatarProps {
  displayName: string | null;
  avatarUrl?: string | null;
  avatar?: AvatarPreset;
  size?: number;
}

export function UserAvatar({
  displayName,
  avatarUrl,
  avatar: avatarProp,
  size = 64,
}: UserAvatarProps) {
  const { colors } = useTheme();
  const avatar = avatarProp ?? parseAvatar(avatarUrl);
  const radius = size / 2;
  const remotePhoto = isRemoteAvatarUrl(avatarUrl) ? avatarUrl : null;

  if (remotePhoto) {
    return (
      <Image
        source={{ uri: remotePhoto }}
        contentFit="cover"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          backgroundColor: colors.surface,
        }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: `hsl(${avatar.hue}, 42%, 22%)`,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={`sf:${avatar.icon}`}
        style={{ width: size * 0.38, height: size * 0.38 }}
        tintColor={`hsl(${avatar.hue}, 68%, 72%)`}
      />
      {initialsFor(displayName) ? (
        <Text
          style={{
            position: "absolute",
            bottom: -9999,
            fontFamily: fonts.bold,
            fontSize: size * 0.34,
            color: colors.text,
          }}
        >
          {initialsFor(displayName)}
        </Text>
      ) : null}
    </View>
  );
}

function initialsFor(displayName: string | null): string {
  const source = displayName?.trim() || "?";
  const parts = source.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}
