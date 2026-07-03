/** Seconds per km from distance (m) and duration (ms). */
export function paceSecondsPerKm(distanceM: number, durationMs: number): number | null {
  if (distanceM <= 0 || durationMs <= 0) return null;
  const distanceKm = distanceM / 1000;
  const durationS = durationMs / 1000;
  return durationS / distanceKm;
}

export function formatDistanceKm(distanceM: number): string {
  return `${(distanceM / 1000).toFixed(2)} km`;
}

export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Human-readable duration for share cards — e.g. "38m 22s". */
export function formatDurationShort(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0 && seconds > 0) {
    return `${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

export function formatPace(avgPaceSPerKm: number | null): string {
  if (!avgPaceSPerKm || !Number.isFinite(avgPaceSPerKm)) return "--:-- /km";
  const totalSeconds = Math.round(avgPaceSPerKm);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")} /km`;
}

export function formatCalories(kcal: number | null): string {
  if (kcal == null || kcal <= 0) return "—";
  return `${Math.round(kcal)} kcal`;
}

export function formatHeartRate(bpm: number | null): string {
  if (bpm == null || bpm <= 0) return "—";
  return `${Math.round(bpm)} bpm`;
}
