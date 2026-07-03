import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";

import { UserAvatar } from "@/components/auth/user-avatar";
import { GoogleIcon } from "@/components/ui/google-icon";
import { PillButton } from "@/components/ui/pill-button";
import { fonts, radius } from "@/constants/theme";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useTheme } from "@/hooks/use-theme";
import { authService } from "@/lib/auth/auth-service";
import type { User } from "@/lib/auth/types";

const PROVIDER_META = {
  apple: { label: "Apple", kind: "sf" as const, sf: "apple.logo" },
  google: { label: "Google", kind: "google" as const },
  email: { label: "Email", kind: "sf" as const, sf: "envelope.fill" },
  device: { label: "This device", kind: "sf" as const, sf: "iphone" },
} as const;

function ProviderBadge({ provider }: { provider: User["provider"] }) {
  const { colors } = useTheme();
  const meta = PROVIDER_META[provider];
  return (
    <View
      style={{
        position: "absolute",
        right: -2,
        bottom: -2,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: colors.buttonLight,
        borderWidth: 2,
        borderColor: colors.surfaceRaised,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {meta.kind === "google" ? (
        <GoogleIcon size={14} />
      ) : (
        <Image
          source={`sf:${meta.sf}`}
          style={{ width: 13, height: 13 }}
          tintColor={colors.buttonLightText}
        />
      )}
    </View>
  );
}

function AccountDetail({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 3 }}>
      <Text
        style={{
          fontFamily: fonts.medium,
          fontSize: 11,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: colors.textFaint,
        }}
      >
        {label}
      </Text>
      <Text
        selectable
        style={{
          fontFamily: fonts.body,
          fontSize: 15,
          color: colors.text,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

/** Profile-tab account card — full details when signed in, CTA when signed out. */
export function AccountRow() {
  const { colors } = useTheme();
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
    const meta = PROVIDER_META[user.provider];
    const displayName = user.displayName ?? user.email?.split("@")[0] ?? "Explorer";

    return (
      <View
        style={{
          backgroundColor: colors.surfaceRaised,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 20,
          gap: 18,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View>
            <UserAvatar
              displayName={displayName}
              avatar={user.avatar}
              size={64}
            />
            <ProviderBadge provider={user.provider} />
          </View>

          <View style={{ flex: 1, gap: 4 }}>
            <Text
              style={{
                fontFamily: fonts.bold,
                fontSize: 20,
                color: colors.text,
              }}
            >
              {displayName}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: radius.pill,
                  backgroundColor: colors.mintDim,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.medium,
                    fontSize: 11,
                    color: colors.textMuted,
                  }}
                >
                  {meta.label}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
          }}
        />

        <View style={{ gap: 14 }}>
          <AccountDetail label="Name" value={displayName} />
          {user.email ? (
            <AccountDetail label="Email" value={user.email} />
          ) : (
            <AccountDetail label="Email" value="Not shared by provider" />
          )}
          <AccountDetail label="Provider" value={meta.label} />
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <PillButton
            label="Edit profile"
            onPress={() => router.push("/edit-profile" as never)}
            style={{ flex: 1 }}
          />
          <PillButton
            label="Sign out"
            variant="outline"
            onPress={confirmSignOut}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => router.push("/sign-in")}
      style={({ pressed }) => ({
        backgroundColor: colors.surfaceRaised,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 20,
        gap: 14,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source="sf:person.crop.circle"
            style={{ width: 26, height: 26 }}
            tintColor={colors.textMuted}
          />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{ fontFamily: fonts.semibold, fontSize: 16, color: colors.text }}
          >
            Sign in or create account
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.textMuted,
              lineHeight: 18,
            }}
          >
            Apple, Google, or email
          </Text>
        </View>
        <Image
          source="sf:chevron.right"
          style={{ width: 14, height: 14 }}
          tintColor={colors.textFaint}
        />
      </View>
    </Pressable>
  );
}
