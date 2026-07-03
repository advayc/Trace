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

function isExpoBuiltin(decoder: unknown): boolean {
  return (
    typeof decoder === "function" &&
    Symbol.for("expo.builtin") in (decoder as object)
  );
}

function probeUtf16le(label: string): { ok: boolean; error?: string } {
  const Decoder = g.TextDecoder as (new (label: string) => unknown) | undefined;
  if (!Decoder) return { ok: false, error: "missing" };
  try {
    new Decoder("utf-16le");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// #region agent log
const preSupports = supportsUtf16le();
fetch("http://127.0.0.1:7602/ingest/63dd9fb2-dc30-403c-a52a-6de43de83ec2", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Debug-Session-Id": "cc3882",
  },
  body: JSON.stringify({
    sessionId: "cc3882",
    runId: "pre-fix",
    hypothesisId: "H1",
    location: "text-decoder-polyfill.ts:pre-check",
    message: "supportsUtf16le before polyfill branch",
    data: {
      preSupports,
      hasGlobalDecoder: typeof g.TextDecoder !== "undefined",
      isExpoBuiltin: isExpoBuiltin(g.TextDecoder),
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

if (!preSupports) {
  const beforeDelete = typeof g.TextDecoder;
  let deleteOk = false;
  try {
    delete g.TextDecoder;
    delete g.TextEncoder;
    deleteOk = typeof g.TextDecoder === "undefined";
  } catch {
    g.TextDecoder = undefined;
    g.TextEncoder = undefined;
    deleteOk = typeof g.TextDecoder === "undefined";
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

  const globalAfterRequire = typeof g.TextDecoder;
  const exportHasDecoder = typeof polyfill?.TextDecoder === "function";
  let exportUtf16leOk = false;
  try {
    new polyfill.TextDecoder("utf-16le");
    exportUtf16leOk = true;
  } catch {
    exportUtf16leOk = false;
  }

  // #region agent log
  fetch("http://127.0.0.1:7602/ingest/63dd9fb2-dc30-403c-a52a-6de43de83ec2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "cc3882",
    },
    body: JSON.stringify({
      sessionId: "cc3882",
      runId: "post-fix",
      hypothesisId: "H3-fix",
      location: "text-decoder-polyfill.ts:after-assign",
      message: "polyfill assigned to globalThis",
      data: {
        beforeDelete,
        deleteOk,
        globalAfterRequire,
        exportHasDecoder,
        exportUtf16leOk,
        globalMatchesExport: g.TextDecoder === polyfill.TextDecoder,
        globalProbe: probeUtf16le("after-assign"),
        globalIsExpoBuiltin: isExpoBuiltin(g.TextDecoder),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
} else {
  // #region agent log
  fetch("http://127.0.0.1:7602/ingest/63dd9fb2-dc30-403c-a52a-6de43de83ec2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "cc3882",
    },
    body: JSON.stringify({
      sessionId: "cc3882",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "text-decoder-polyfill.ts:skipped",
      message: "polyfill branch skipped — decoder already supports utf-16le",
      data: { globalProbe: probeUtf16le("skipped-branch") },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

export {};
