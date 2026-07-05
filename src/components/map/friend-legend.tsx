import { Text, View } from "react-native";

import { fonts, radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export interface FriendLegendItem {
  userId: string;
  color: string;
  displayName: string | null;
  username?: string | null;
}

function initialsFromName(name: string | null, userId: string): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return userId.slice(0, 2).toUpperCase();
}

export function FriendLegend({ items }: { items: FriendLegendItem[] }) {
  const { colors } = useTheme();
  if (items.length === 0) return null;

  return (
    <View
      style={{
        backgroundColor: colors.surfaceRaised,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 6,
        minWidth: 120,
      }}
    >
      <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.textFaint }}>
        Active friends
      </Text>
      {items.map((item) => (
        <View
          key={item.userId}
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: item.color,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.25)",
            }}
          />
          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.text }}>
            {item.username ? `@${item.username}` : initialsFromName(item.displayName, item.userId)}
          </Text>
        </View>
      ))}
    </View>
  );
}
