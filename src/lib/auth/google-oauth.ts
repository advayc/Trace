/**
 * Browser-based Google OAuth for Supabase.
 *
 * Native @react-native-google-signin cannot supply the raw nonce Supabase
 * requires when Google's ID token includes a nonce claim — so we always use
 * the OAuth browser flow instead of signInWithIdToken for Google.
 */
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { SignInCancelledError } from "@/lib/auth/errors";
import { supabase } from "@/lib/supabase/client";

WebBrowser.maybeCompleteAuthSession();

/** Deep-link URI registered in Supabase → Authentication → URL Configuration. */
export function getGoogleOAuthRedirectUri(): string {
  return Linking.createURL("auth/callback");
}

function queryParamsFromUrl(url: string): Record<string, string> {
  const parsed = Linking.parse(url);
  const out: Record<string, string> = {};

  const raw = parsed.queryParams ?? {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") out[key] = value;
    else if (Array.isArray(value) && typeof value[0] === "string") out[key] = value[0];
  }

  // Implicit-flow tokens land in the hash fragment.
  const hashIndex = url.indexOf("#");
  if (hashIndex !== -1) {
    for (const segment of url.slice(hashIndex + 1).split("&")) {
      const [rawKey, rawValue] = segment.split("=");
      if (!rawKey) continue;
      out[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue ?? "");
    }
  }

  return out;
}

/** Finish Supabase auth from the OAuth redirect URL (PKCE code or implicit tokens). */
export async function completeSessionFromCallbackUrl(url: string): Promise<void> {
  const params = queryParamsFromUrl(url);

  if (params.error_description) {
    throw new Error(params.error_description);
  }
  if (params.error) {
    throw new Error(params.error);
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return;
  }

  if (params.access_token && params.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) throw error;
    return;
  }

  throw new Error(
    "Google sign-in did not return credentials. Add this redirect URL in Supabase → Authentication → URL Configuration: " +
      getGoogleOAuthRedirectUri(),
  );
}

/** Opens Google OAuth in an in-app browser and establishes a Supabase session. */
export async function signInWithGoogleOAuth(): Promise<void> {
  const redirectTo = getGoogleOAuthRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error("Google sign-in could not start. Try again.");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === "cancel" || result.type === "dismiss") {
    throw new SignInCancelledError();
  }
  if (result.type !== "success") {
    throw new Error("Google sign-in did not complete. Try again.");
  }

  await completeSessionFromCallbackUrl(result.url);
}
