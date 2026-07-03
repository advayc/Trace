/**
 * Auth interfaces. Implemented by `@/lib/auth/auth-service` (Supabase).
 * "device" remains the identity for signed-out, offline-first use.
 */

export interface User {
  id: string;
  displayName: string | null;
  provider: "device" | "apple" | "google" | "email";
}

export interface AuthProvider {
  getCurrentUser(): Promise<User | null>;
  signInWithApple(): Promise<User>;
  signInWithGoogle(): Promise<User>;
  signInWithEmail(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
}
