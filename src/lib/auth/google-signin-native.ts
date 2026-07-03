import Constants from "expo-constants";

type GoogleSignInModule = typeof import("@react-native-google-signin/google-signin");

let moduleCache: GoogleSignInModule | null | undefined;

function loadGoogleSignInModule(): GoogleSignInModule | null {
  if (moduleCache !== undefined) return moduleCache;

  // Expo Go does not ship RNGoogleSignin — avoid a fatal TurboModule lookup.
  if (Constants.executionEnvironment === "storeClient") {
    moduleCache = null;
    return null;
  }

  try {
    moduleCache = require("@react-native-google-signin/google-signin");
  } catch {
    moduleCache = null;
  }
  return moduleCache ?? null;
}

/** True when the native Google Sign-In module is linked (dev/production builds). */
export function isGoogleSignInAvailable(): boolean {
  return loadGoogleSignInModule() !== null;
}

export function getGoogleSignInModule(): GoogleSignInModule {
  const mod = loadGoogleSignInModule();
  if (!mod) {
    throw new Error(
      "Google Sign-In requires a development build. It isn't available in Expo Go — run npx expo run:ios instead.",
    );
  }
  return mod;
}
