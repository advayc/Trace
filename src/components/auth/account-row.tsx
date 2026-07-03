import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";

import { colors, fonts, radius } from "@/constants/theme";
import { useAuthUser } from "@/hooks/use-auth-user";
import { authService } from "@/lib/auth/auth-service";

const PROVIDER_LABEL = {
  apple: "Apple",
  google: "Google",
  email: "Email",
  device: "This device",
} as const;

/** Profile-tab entry point for optional sign-in; shows account state when signed in. */
export function AccountRow() {
  const router = useRouter();
  const { user, loading } = useAuthUser();

  const confirmSignOut = () => {
    Alert.alert(
      "Sign out?",
      "Your explored tiles stay on this device. You can sign back in anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: () => {
            authService.signOut().catch(() => {});
          },
        },
      ],
    );
  };

  if (loading) return null;

  if (user) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
        }}
      >
        <Image
          source="sf:person.crop.circle.fill"
          style={{ width: 22, height: 22 }}
          tintColor={colors.mint}
        />
        <View style={{ flex: 1, gap: 3 }}>
          <Text
            style={{ fontFamily: fonts.medium, fontSize: 16, color: colors.text }}
          >
            {user.displayName ?? "Signed in"}
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.textMuted,
            }}
          >
            Signed in with {PROVIDER_LABEL[user.provider]}
          </Text>
        </View>
        <Pressable
          onPress={confirmSignOut}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Text
            style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.danger }}
          >
            Sign out
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => router.push("/sign-in")}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Image
        source="sf:person.crop.circle.badge.plus"
        style={{ width: 22, height: 22 }}
        tintColor={colors.ember}
      />
      <View style={{ flex: 1, gap: 3 }}>
        <Text
          style={{ fontFamily: fonts.medium, fontSize: 16, color: colors.text }}
        >
          Sign in to sync & compete
        </Text>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.textMuted,
            lineHeight: 18,
          }}
        >
          Optional. Trace works fully offline — sign in only if you want
          friends and cross-device sync later.
        </Text>
      </View>
      <Image
        source="sf:chevron.right"
        style={{ width: 14, height: 14 }}
        tintColor={colors.textFaint}
      />
    </Pressable>
  );
}
