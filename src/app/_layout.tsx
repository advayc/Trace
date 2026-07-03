import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

// Side effect: registers the background location task at module scope.
import "@/lib/location/background-task";
import { AnimatedSplash } from "@/components/ui/animated-splash";
import { colors } from "@/constants/theme";
import { getDb } from "@/lib/storage/tile-db";

SplashScreen.preventAutoHideAsync();

// Open the database (and run migrations) before first render.
getDb();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [splashVisible, setSplashVisible] = useState(true);

  const onSplashFinish = useCallback(() => setSplashVisible(false), []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: "fade",
          animationDuration: 280,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="onboarding"
          options={{
            presentation: "fullScreenModal",
            gestureEnabled: false,
            animation: "fade_from_bottom",
            animationDuration: 360,
          }}
        />
        <Stack.Screen
          name="sign-in"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
      </Stack>
      {splashVisible ? <AnimatedSplash onFinish={onSplashFinish} /> : null}
    </View>
  );
}
