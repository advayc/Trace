/**
 * Phase 2 stubs — no auth in v1. These interfaces let today's services accept
 * a user identity that can be swapped from device id to a real account
 * (Google / Apple via Supabase Auth) without rewriting the engine.
 */

export interface User {
  id: string;
  displayName: string | null;
  provider: "device" | "apple" | "google";
}

export interface AuthProvider {
  getCurrentUser(): Promise<User | null>;
  signInWithApple(): Promise<User>;
  signInWithGoogle(): Promise<User>;
  signOut(): Promise<void>;
}
