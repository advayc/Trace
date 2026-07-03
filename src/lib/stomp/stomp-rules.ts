export interface GpsSample {
  lat: number;
  lng: number;
  /** meters, null when the fix has no accuracy estimate */
  accuracy: number | null;
  /** epoch ms */
  timestamp: number;
}

export const STOMP_CONFIG = {
  maxAccuracyM: 50,
  maxSpeedKmh: 25,
  minMovementM: 8,
} as const;

const EARTH_RADIUS_M = 6371000;

export function haversineM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

export type SampleVerdict =
  | { ok: true; distanceM: number }
  | { ok: false; reason: "inaccurate" | "too-fast" | "jitter" };

/**
 * Anti-cheat gate: a sample only stomps tiles if it comes from an accurate,
 * plausible-on-foot, genuinely-moved GPS fix. Pure function — no IO.
 */
export function validateSample(
  previous: GpsSample | null,
  next: GpsSample,
): SampleVerdict {
  if (next.accuracy == null || next.accuracy > STOMP_CONFIG.maxAccuracyM) {
    return { ok: false, reason: "inaccurate" };
  }

  if (!previous) return { ok: true, distanceM: 0 };

  const distanceM = haversineM(previous.lat, previous.lng, next.lat, next.lng);
  if (distanceM < STOMP_CONFIG.minMovementM) {
    return { ok: false, reason: "jitter" };
  }

  const elapsedS = (next.timestamp - previous.timestamp) / 1000;
  if (elapsedS > 0) {
    const speedKmh = (distanceM / elapsedS) * 3.6;
    if (speedKmh > STOMP_CONFIG.maxSpeedKmh) {
      return { ok: false, reason: "too-fast" };
    }
  }

  return { ok: true, distanceM };
}
