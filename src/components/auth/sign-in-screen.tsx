import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SocialAuthButton } from "@/components/ui/social-auth-button";
import { TextField } from "@/components/ui/text-field";
import { colors, fonts, radius, spacing } from "@/constants/theme";
import {
  SignInCancelledError,
  authService,
} from "@/lib/auth/auth-service";

type AuthMode = "sign-in" | "sign-up";
type Busy = "apple" | "google" | "email" | null;

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

export function SignInScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [closeHovered, setCloseHovered] = useState(false);

  const emailValid = email.includes("@") && password.length >= 6;
  const showApple = process.env.EXPO_OS === "ios";

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

  const handleEmail = () => {
    if (mode === "sign-up") {
      run("email", () => authService.signUpWithEmail(email, password));
    } else {
      run("email", () => authService.signInWithEmail(email, password));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
    >
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          right: 18,
          top: 14,
          zIndex: 20,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          onHoverIn={() => setCloseHovered(true)}
          onHoverOut={() => setCloseHovered(false)}
          hitSlop={10}
          style={({ pressed }) => ({
            width: 42,
            height: 42,
            borderRadius: 21,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: closeHovered ? colors.accentBorder : colors.border,
            transform: [{ scale: pressed ? 0.96 : closeHovered ? 1.03 : 1 }],
            shadowColor: colors.ember,
            shadowOpacity: closeHovered ? 0.26 : 0.12,
            shadowRadius: closeHovered ? 14 : 8,
            shadowOffset: { width: 0, height: 4 },
          })}
        >
          <BlurView
            tint="dark"
            intensity={closeHovered ? 52 : 36}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: closeHovered
                ? "rgba(200,83,60,0.16)"
                : "rgba(24,24,24,0.5)",
            }}
          >
            <Image
              source="sf:xmark"
              style={{ width: 14, height: 14 }}
              tintColor={closeHovered ? colors.text : colors.textMuted}
            />
          </BlurView>
        </Pressable>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: spacing.screen,
          paddingBottom: 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 24,
            gap: 14,
          }}
        >
          <View style={{ gap: 6, marginBottom: 4 }}>
            <Text
              style={{
                fontFamily: fonts.bold,
                fontSize: 22,
                color: colors.text,
                textAlign: "center",
              }}
            >
              {mode === "sign-in" ? "Sign in to Trace" : "Create your account"}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                color: colors.textMuted,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Sync tiles and compete with friends. Optional — works offline too.
            </Text>
          </View>

          {showApple ? (
            <SocialAuthButton
              label="Continue with Apple"
              variant="apple"
              onPress={() => run("apple", () => authService.signInWithApple())}
              disabled={busy !== null}
              loading={busy === "apple"}
            />
          ) : null}

          <SocialAuthButton
            label="Continue with Google"
            variant="google"
            onPress={() => run("google", () => authService.signInWithGoogle())}
            disabled={busy !== null}
            loading={busy === "google"}
          />

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 2 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text
              style={{
                fontFamily: fonts.medium,
                fontSize: 12,
                color: colors.textFaint,
                letterSpacing: 0.5,
              }}
            >
              OR
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          {!showEmail ? (
            <>
              <SocialAuthButton
                label="Continue with Email"
                variant="primary"
                onPress={() => {
                  setMode("sign-in");
                  setShowEmail(true);
                  setError(null);
                }}
                disabled={busy !== null}
              />
              <SocialAuthButton
                label="Sign Up with Email"
                variant="outline"
                onPress={() => {
                  setMode("sign-up");
                  setShowEmail(true);
                  setError(null);
                }}
                disabled={busy !== null}
              />
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 13,
                  color: colors.textFaint,
                  textAlign: "center",
                }}
              >
                Password sign-in continues on the next step.
              </Text>
            </>
          ) : (
            <View style={{ gap: 12 }}>
              <Text
                style={{
                  fontFamily: fonts.semibold,
                  fontSize: 15,
                  color: colors.text,
                  textAlign: "center",
                }}
              >
                {mode === "sign-up" ? "Create account with email" : "Sign in with email"}
              </Text>
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="username"
                editable={busy === null}
              />
              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder={mode === "sign-up" ? "At least 6 characters" : "Your password"}
                secureTextEntry
                textContentType={mode === "sign-up" ? "newPassword" : "password"}
                editable={busy === null}
              />
              {busy === "email" ? (
                <View style={{ paddingVertical: 12, alignItems: "center" }}>
                  <ActivityIndicator color={colors.ember} />
                </View>
              ) : (
                <SocialAuthButton
                  label={mode === "sign-up" ? "Create account" : "Sign in"}
                  variant="primary"
                  onPress={handleEmail}
                  disabled={!emailValid}
                />
              )}
              <Pressable onPress={() => setShowEmail(false)} hitSlop={8}>
                <Text
                  style={{
                    fontFamily: fonts.medium,
                    fontSize: 14,
                    color: colors.textMuted,
                    textAlign: "center",
                  }}
                >
                  Back to other options
                </Text>
              </Pressable>
            </View>
          )}

          {error ? (
            <View
              style={{
                backgroundColor: colors.dangerDim,
                borderRadius: radius.sm,
                padding: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.medium,
                  fontSize: 13,
                  color: colors.danger,
                  lineHeight: 18,
                  textAlign: "center",
                }}
              >
                {error}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginTop: 4 })}
          >
            <Text
              style={{
                fontFamily: fonts.medium,
                fontSize: 14,
                color: colors.textMuted,
                textAlign: "center",
                textDecorationLine: "underline",
              }}
            >
              Continue as guest
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
