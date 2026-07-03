/**
 * Supabase-backed auth. Sign-in is OPTIONAL — the app is fully functional
 * offline and signed out; this only exists for future sync/friends features.
 *
 * Native flows only (no web redirects): Apple and Google produce an ID token
 * on-device which is exchanged via supabase.auth.signInWithIdToken.
 */
import * as AppleAuthentication from "expo-apple-authentication";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import {
  getGoogleSignInModule,
  isGoogleSignInAvailable,
} from "@/lib/auth/google-signin-native";
import type { AuthProvider, User } from "@/lib/auth/types";
import { supabase } from "@/lib/supabase/client";

export { isGoogleSignInAvailable };

/** Thrown when the user dismisses the native sign-in sheet — not an error state. */
export class SignInCancelledError extends Error {
  constructor() {
    super("Sign-in cancelled");
    this.name = "SignInCancelledError";
  }
}

function toUser(supabaseUser: SupabaseUser): User {
  const meta = supabaseUser.user_metadata ?? {};
  const displayName =
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    supabaseUser.email?.split("@")[0] ??
    null;

  const rawProvider = supabaseUser.app_metadata?.provider;
  const provider: User["provider"] =
    rawProvider === "apple" || rawProvider === "google" || rawProvider === "email"
      ? rawProvider
      : "device";

  return { id: supabaseUser.id, displayName, provider };
}

let googleConfigured = false;

function configureGoogle(): void {
  if (googleConfigured) return;
  const { GoogleSignin } = getGoogleSignInModule();
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!iosClientId || !webClientId) {
    throw new Error(
      "Google Sign-In isn't configured yet. Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID and EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env (see README setup steps), then rebuild.",
    );
  }
  GoogleSignin.configure({ iosClientId, webClientId });
  googleConfigured = true;
}

export const authService: AuthProvider = {
  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getSession();
    const supabaseUser = data.session?.user;
    return supabaseUser ? toUser(supabaseUser) : null;
  },

  async signInWithApple(): Promise<User> {
    let credential: AppleAuthentication.AppleAuthenticationCredential;
    try {
      credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
    } catch (error) {
      if ((error as { code?: string }).code === "ERR_REQUEST_CANCELED") {
        throw new SignInCancelledError();
      }
      throw error;
    }

    if (!credential.identityToken) {
      throw new Error("Apple did not return an identity token. Try again.");
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
    });
    if (error) throw error;

    // Apple only provides the name on the FIRST authorization — persist it.
    const fullName = credential.fullName;
    const displayName = [fullName?.givenName, fullName?.familyName]
      .filter(Boolean)
      .join(" ");
    if (displayName) {
      await supabase.auth.updateUser({ data: { full_name: displayName } });
      await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", data.user.id);
      return { ...toUser(data.user), displayName };
    }

    return toUser(data.user);
  },

  async signInWithGoogle(): Promise<User> {
    const {
      GoogleSignin,
      isErrorWithCode,
      isSuccessResponse,
      statusCodes,
    } = getGoogleSignInModule();
    configureGoogle();

    let idToken: string | null;
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) {
        throw new SignInCancelledError();
      }
      idToken = response.data.idToken;
    } catch (error) {
      if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new SignInCancelledError();
      }
      throw error;
    }

    if (!idToken) {
      throw new Error("Google did not return an ID token. Try again.");
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });
    if (error) throw error;
    return toUser(data.user);
  },

  async signInWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    return toUser(data.user);
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
