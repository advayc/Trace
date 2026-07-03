import * as AppleAuthentication from "expo-apple-authentication";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { PillButton } from "@/components/ui/pill-button";
import { colors, fonts, radius } from "@/constants/theme";
import { SignInCancelledError, authService } from "@/lib/auth/auth-service";

type Busy = "apple" | "google" | "email" | null;

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

export function SignInScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

  const run = async (kind: Exclude<Busy, null>, action: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(kind);
    setError(null);
    try {
      await action();
      if (process.env.EXPO_OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.back();
    } catch (err) {
      if (!(err instanceof SignInCancelledError)) {
        setError(errorMessage(err));
      }
    } finally {
      setBusy(null);
    }
  };

  const emailValid = email.includes("@") && password.length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, gap: 28, paddingTop: 36 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "flex-end" }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Image
              source="sf:xmark.circle.fill"
              style={{ width: 28, height: 28 }}
              tintColor={colors.textFaint}
            />
          </Pressable>
        </View>

        <View style={{ gap: 10, alignItems: "center" }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radius.md,
              backgroundColor: colors.emberDim,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source="sf:map.fill"
              style={{ width: 30, height: 30 }}
              tintColor={colors.ember}
            />
          </View>
          <Text
            style={{
              fontFamily: fonts.displayBold,
              fontSize: 30,
              color: colors.text,
              textAlign: "center",
            }}
          >
            Carry your map with you
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
            Sign in to sync your explored tiles and compete with friends.
            Optional — Trace works fully offline without an account.
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: colors.mintDim,
            borderRadius: radius.sm,
            padding: 12,
          }}
        >
          <Image
            source="sf:lock.shield.fill"
            style={{ width: 16, height: 16 }}
            tintColor={colors.mint}
          />
          <Text
            style={{
              flex: 1,
              fontFamily: fonts.body,
              fontSize: 12.5,
              color: colors.textMuted,
              lineHeight: 17,
            }}
          >
            Your precise location never leaves this device — only coarse
            hexagon IDs are ever synced.
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          {appleAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
              }
              buttonStyle={
                AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              }
              cornerRadius={radius.pill}
              style={{ height: 50, opacity: busy && busy !== "apple" ? 0.4 : 1 }}
              onPress={() => run("apple", () => authService.signInWithApple())}
            />
          )}

          <Pressable
            disabled={busy !== null}
            onPress={() => run("google", () => authService.signInWithGoogle())}
            style={({ pressed }) => ({
              height: 50,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: busy && busy !== "google" ? 0.4 : pressed ? 0.85 : 1,
            })}
          >
            {busy === "google" ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <Image
                  source="sf:g.circle.fill"
                  style={{ width: 20, height: 20 }}
                  tintColor={colors.text}
                />
                <Text
                  style={{
                    fontFamily: fonts.bold,
                    fontSize: 16,
                    color: colors.text,
                  }}
                >
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text
            style={{
              fontFamily: fonts.medium,
              fontSize: 12,
              color: colors.textFaint,
              letterSpacing: 1,
            }}
          >
            OR
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        {!showEmail ? (
          <PillButton
            label="Sign in with email"
            variant="ghost"
            onPress={() => setShowEmail(true)}
          />
        ) : (
          <View style={{ gap: 12 }}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.textFaint}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="username"
              editable={busy === null}
              style={{
                fontFamily: fonts.body,
                fontSize: 16,
                color: colors.text,
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.textFaint}
              secureTextEntry
              textContentType="password"
              editable={busy === null}
              style={{
                fontFamily: fonts.body,
                fontSize: 16,
                color: colors.text,
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            />
            {busy === "email" ? (
              <View style={{ paddingVertical: 14, alignItems: "center" }}>
                <ActivityIndicator color={colors.ember} />
              </View>
            ) : (
              <PillButton
                label="Sign in"
                disabled={!emailValid}
                onPress={() =>
                  run("email", () => authService.signInWithEmail(email, password))
                }
              />
            )}
          </View>
        )}

        {error && (
          <View
            style={{
              backgroundColor: "rgba(248,113,113,0.12)",
              borderRadius: radius.sm,
              padding: 12,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.medium,
                fontSize: 13.5,
                color: colors.danger,
                lineHeight: 19,
                textAlign: "center",
              }}
            >
              {error}
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
