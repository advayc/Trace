/**
 * Auth interfaces. Implemented by `@/lib/auth/auth-service` (Supabase).
 * "device" remains the identity for signed-out, offline-first use.
 */

import type { AvatarPreset } from "@/lib/auth/avatar-presets";

export interface User {
  id: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  avatar: AvatarPreset;
  provider: "device" | "apple" | "google" | "email";
}

export interface AuthProvider {
  getCurrentUser(): Promise<User | null>;
  signInWithApple(): Promise<User>;
  signInWithGoogle(): Promise<User>;
  signInWithEmail(email: string, password: string): Promise<User>;
  signUpWithEmail(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  updateProfile(patch: {
    displayName?: string;
    avatar?: AvatarPreset;
  }): Promise<User>;
}
