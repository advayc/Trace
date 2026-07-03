/**
 * Supabase client — the ONLY values baked into the app bundle are the project
 * URL and the publishable (anon) key, which are safe client-side because every
 * table is protected by RLS. Never put service_role or the DB password in an
 * EXPO_PUBLIC_ variable.
 *
 * Privacy invariant: nothing in this module (or anything that uses it) may
 * send raw lat/lng to Supabase — H3 cell indexes only.
 */
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

import type { Database } from "@/lib/supabase/database.types";
import { secureSessionStorage } from "@/lib/supabase/secure-session-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in.",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureSessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Native app: sessions come from signInWithIdToken/password, not URLs.
    detectSessionInUrl: false,
  },
});

// Refresh tokens only while the app is foregrounded (Supabase RN guidance).
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
