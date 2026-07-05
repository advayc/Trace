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
import { parseAvatar, serializeAvatar } from "@/lib/auth/avatar-presets";
import { signInWithGoogleOAuth } from "@/lib/auth/google-oauth";
import {
  fetchProfile,
  syncOAuthAvatarFromMetadata,
  updateProfile,
  type Profile,
} from "@/lib/auth/profile-service";
import type { AuthProvider, User } from "@/lib/auth/types";
import { supabase } from "@/lib/supabase/client";

export { isGoogleSignInAvailable } from "@/lib/auth/google-signin-native";
export { SignInCancelledError } from "@/lib/auth/errors";

function toUser(supabaseUser: SupabaseUser, profile?: Profile | null): User {
  const meta = supabaseUser.user_metadata ?? {};
  const displayName =
    profile?.displayName ??
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    supabaseUser.email?.split("@")[0] ??
    null;
  const metaPicture =
    (meta.avatar_url as string | undefined) ?? (meta.picture as string | undefined);
  const avatarUrl = profile?.avatarUrl ?? metaPicture ?? null;
  const usernameFromMeta =
    (meta.user_name as string | undefined) ??
    (meta.preferred_username as string | undefined);
  const username =
    profile?.username ??
    usernameFromMeta?.trim().toLowerCase() ??
    `walker_${supabaseUser.id.replace(/-/g, "").slice(0, 6)}`;

  const rawProvider = supabaseUser.app_metadata?.provider;
  const provider: User["provider"] =
    rawProvider === "apple" || rawProvider === "google" || rawProvider === "email"
      ? rawProvider
      : "device";

  return {
    id: supabaseUser.id,
    displayName,
    username,
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
    // Browser OAuth avoids the native ID-token nonce mismatch with Supabase.
    await signInWithGoogleOAuth();
    const { data } = await supabase.auth.getSession();
    const supabaseUser = data.session?.user;
    if (!supabaseUser) throw new Error("Google sign-in failed. Try again.");
    await syncOAuthAvatarFromMetadata(supabaseUser);
    const profile = await fetchProfile(supabaseUser.id);
    return toUser(supabaseUser, profile);
  },

  async signInWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    const profile = await fetchProfile(data.user.id);
    return toUser(data.user, profile);
  },

  async signUpWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error("Sign up failed. Please try again.");
    const profile = await fetchProfile(data.user.id);
    return toUser(data.user, profile);
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async updateProfile(patch: {
    displayName?: string;
    username?: string;
    avatar?: User["avatar"];
    avatarUrl?: string | null;
  }): Promise<User> {
    const { data } = await supabase.auth.getSession();
    const supabaseUser = data.session?.user;
    if (!supabaseUser) throw new Error("Sign in to edit your profile.");

    await updateProfile(supabaseUser.id, patch);

    const meta: Record<string, string | null> = {};
    if (patch.displayName !== undefined) {
      meta.full_name = patch.displayName.trim() || null;
    }
    if (patch.username !== undefined) {
      meta.preferred_username = patch.username.trim().toLowerCase() || null;
    }
    if (patch.avatar !== undefined) {
      meta.avatar_preset = serializeAvatar(patch.avatar);
    }
    if (patch.avatarUrl !== undefined) {
      meta.avatar_url = patch.avatarUrl;
      meta.picture = patch.avatarUrl;
    }
    if (Object.keys(meta).length > 0) {
      await supabase.auth.updateUser({ data: meta });
    }

    const profile = await fetchProfile(supabaseUser.id);
    return toUser(supabaseUser, profile);
  },
};
