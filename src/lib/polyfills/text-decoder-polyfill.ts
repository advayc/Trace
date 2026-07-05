/**
 * h3-js (Emscripten) needs TextDecoder("utf-16le") at module init.
 * Expo SDK 57's winter TextDecoder only supports utf-8, and
 * text-encoding-polyfill both skips install AND re-exports the existing
 * global when one is present — so the partial native decoder must be
 * removed from globalThis BEFORE the polyfill is required.
 * Import this module before any h3-js import.
 */

const g = globalThis as Record<string, unknown>;

function supportsUtf16le(): boolean {
  const Decoder = g.TextDecoder as (new (label: string) => unknown) | undefined;
  if (!Decoder) return false;
  try {
    new Decoder("utf-16le");
    return true;
  } catch {
    return false;
  }
}

const preSupports = supportsUtf16le();

if (!preSupports) {
  try {
    delete g.TextDecoder;
    delete g.TextEncoder;
  } catch {
    g.TextDecoder = undefined;
    g.TextEncoder = undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const polyfill = require("text-encoding-polyfill") as {
    TextDecoder: typeof TextDecoder;
    TextEncoder: typeof TextEncoder;
  };

  // text-encoding-polyfill installs on module `this` (undefined in strict ESM),
  // not globalThis — must assign exports explicitly.
  g.TextDecoder = polyfill.TextDecoder;
  g.TextEncoder = polyfill.TextEncoder;
}

export {};
