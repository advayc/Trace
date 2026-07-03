/**
 * Browser-based Google OAuth for Supabase — avoids the native ID-token nonce
 * mismatch (@react-native-google-signin does not expose the raw nonce Supabase
 * expects when the token contains a nonce claim).
 */
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { SignInCancelledError } from "@/lib/auth/errors";
import { supabase } from "@/lib/supabase/client";

WebBrowser.maybeCompleteAuthSession();

function parseParamsFromUrl(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const query = url.includes("?") ? url.split("?")[1]!.split("#")[0]! : "";
  const hash = url.includes("#") ? url.split("#")[1]! : "";
  for (const part of [query, hash].filter(Boolean)) {
    for (const segment of part.split("&")) {
      const [rawKey, rawValue] = segment.split("=");
      if (!rawKey) continue;
      params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue ?? "");
    }
  }
  return params;
}

/** Opens the Google OAuth sheet and returns once Supabase has a session. */
export async function signInWithGoogleOAuth(): Promise<void> {
  const redirectTo = Linking.createURL("auth/callback");

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

  const params = parseParamsFromUrl(result.url);
  if (params.error_description) {
    throw new Error(params.error_description);
  }

  if (params.code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      params.code,
    );
    if (exchangeError) throw exchangeError;
    return;
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;
  if (accessToken && refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) throw sessionError;
    return;
  }

  throw new Error("Google sign-in did not return credentials. Try again.");
}
