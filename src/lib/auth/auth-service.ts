/**
 * Supabase-backed auth. Sign-in is OPTIONAL — the app is fully functional
 * offline and signed out; this only exists for future sync/friends features.
 *
 * Native flows only (no web redirects): Apple and Google produce an ID token
 * on-device which is exchanged via supabase.auth.signInWithIdToken.
 */
import * as AppleAuthentication from "expo-apple-authentication";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { SignInCancelledError } from "@/lib/auth/errors";
import { parseAvatar } from "@/lib/auth/avatar-presets";
import { signInWithGoogleOAuth } from "@/lib/auth/google-oauth";
import {
  getGoogleSignInModule,
  isGoogleSignInAvailable,
} from "@/lib/auth/google-signin-native";
import { fetchProfile, updateProfile } from "@/lib/auth/profile-service";
import type { AuthProvider, User } from "@/lib/auth/types";
import { supabase } from "@/lib/supabase/client";

export { isGoogleSignInAvailable };
export { SignInCancelledError } from "@/lib/auth/errors";

function toUser(
  supabaseUser: SupabaseUser,
  profile?: { display_name: string | null; avatar_url: string | null } | null,
): User {
  const meta = supabaseUser.user_metadata ?? {};
  const displayName =
    profile?.display_name ??
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    supabaseUser.email?.split("@")[0] ??
    null;
  const avatarUrl = profile?.avatar_url ?? null;

  const rawProvider = supabaseUser.app_metadata?.provider;
  const provider: User["provider"] =
    rawProvider === "apple" || rawProvider === "google" || rawProvider === "email"
      ? rawProvider
      : "device";

  return {
    id: supabaseUser.id,
    displayName,
    email: supabaseUser.email ?? null,
    avatarUrl,
    avatar: parseAvatar(avatarUrl),
    provider,
  };
}

async function userFromSession(): Promise<User | null> {
  const { data } = await supabase.auth.getSession();
  const supabaseUser = data.session?.user;
  if (!supabaseUser) return null;
  const profile = await fetchProfile(supabaseUser.id);
  return toUser(supabaseUser, profile);
}

function isNonceAuthError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message: unknown }).message)
        : "";
  return message.toLowerCase().includes("nonce");
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
    return userFromSession();
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
      const profile = await fetchProfile(data.user.id);
      return toUser(data.user, profile);
    }

    const profile = await fetchProfile(data.user.id);
    return toUser(data.user, profile);
  },

  async signInWithGoogle(): Promise<User> {
    if (!isGoogleSignInAvailable()) {
      await signInWithGoogleOAuth();
      const user = await userFromSession();
      if (!user) throw new Error("Google sign-in failed. Try again.");
      return user;
    }

    const {
      GoogleSignin,
      isErrorWithCode,
      isSuccessResponse,
      statusCodes,
    } = getGoogleSignInModule();
    configureGoogle();

    let idToken: string | null;
    let accessToken: string | undefined;
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) {
        throw new SignInCancelledError();
      }
      idToken = response.data.idToken;
      try {
        const tokens = await GoogleSignin.getTokens();
        accessToken = tokens.accessToken;
        idToken = tokens.idToken ?? idToken;
      } catch {
        // getTokens can fail before the session is fully established — idToken from signIn is enough.
      }
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
      access_token: accessToken,
    });

    if (error) {
      if (isNonceAuthError(error)) {
        await signInWithGoogleOAuth();
        const user = await userFromSession();
        if (!user) throw new Error("Google sign-in failed. Try again.");
        return user;
      }
      throw error;
    }

    const profile = await fetchProfile(data.user.id);
    return toUser(data.user, profile);
  },

  async signInWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    return toUser(data.user);
  },

  async signUpWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error("Sign up failed. Please try again.");
    return toUser(data.user);
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async updateProfile(patch: {
    displayName?: string;
    avatar?: User["avatar"];
  }): Promise<User> {
    const { data } = await supabase.auth.getSession();
    const supabaseUser = data.session?.user;
    if (!supabaseUser) throw new Error("Sign in to edit your profile.");

    await updateProfile(supabaseUser.id, patch);
    const profile = await fetchProfile(supabaseUser.id);
    return toUser(supabaseUser, profile);
  },
};
