import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";
import { completeSessionFromCallbackUrl } from "@/lib/auth/google-oauth";

/** Handles cold-start OAuth redirects back into the app. */
export default function AuthCallbackRoute() {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const url = Linking.getLinkingURL() ?? (await Linking.getInitialURL());
        if (url) await completeSessionFromCallbackUrl(url);
      } catch {
        // openAuthSessionAsync already handled the happy path.
      } finally {
        if (!cancelled) router.replace("/(tabs)/profile");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator color={colors.ember} />
    </View>
  );
}
