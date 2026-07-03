/**
 * Secure session storage for Supabase Auth (per Supabase's recommended
 * "LargeSecureStore" pattern for Expo).
 *
 * Session JSON can exceed expo-secure-store's 2 KB per-value limit, so the
 * session is AES-256-CTR encrypted with a random per-key data key. The data
 * key lives in the iOS Keychain (expo-secure-store); only the ciphertext is
 * written to the SQLite-backed localStorage polyfill. Tokens are never stored
 * in plaintext on disk.
 */
import "expo-sqlite/localStorage/install";

import * as aesjs from "aes-js";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

/** SecureStore keys allow only [A-Za-z0-9._-]. */
function keychainKey(key: string): string {
  return `trace.session.${key.replace(/[^A-Za-z0-9._-]/g, "_")}`;
}

async function encrypt(key: string, value: string): Promise<string> {
  const dataKey = Crypto.getRandomValues(new Uint8Array(32));
  const cipher = new aesjs.ModeOfOperation.ctr(dataKey, new aesjs.Counter(1));
  const ciphertext = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

  await SecureStore.setItemAsync(
    keychainKey(key),
    aesjs.utils.hex.fromBytes(dataKey),
  );
  return aesjs.utils.hex.fromBytes(ciphertext);
}

async function decrypt(key: string, ciphertextHex: string): Promise<string | null> {
  const dataKeyHex = await SecureStore.getItemAsync(keychainKey(key));
  if (!dataKeyHex) return null;

  const cipher = new aesjs.ModeOfOperation.ctr(
    aesjs.utils.hex.toBytes(dataKeyHex),
    new aesjs.Counter(1),
  );
  const plaintext = cipher.decrypt(aesjs.utils.hex.toBytes(ciphertextHex));
  return aesjs.utils.utf8.fromBytes(plaintext);
}

export const secureSessionStorage = {
  async getItem(key: string): Promise<string | null> {
    const ciphertext = globalThis.localStorage.getItem(key);
    if (ciphertext == null) return null;
    try {
      return await decrypt(key, ciphertext);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    const ciphertext = await encrypt(key, value);
    globalThis.localStorage.setItem(key, ciphertext);
  },

  async removeItem(key: string): Promise<void> {
    globalThis.localStorage.removeItem(key);
    await SecureStore.deleteItemAsync(keychainKey(key));
  },
};
