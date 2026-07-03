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

export function formatPace(avgPaceSPerKm: number | null): string {
  if (!avgPaceSPerKm || !Number.isFinite(avgPaceSPerKm)) return "--:-- /km";
  const minutes = Math.floor(avgPaceSPerKm / 60);
  const seconds = avgPaceSPerKm % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")} /km`;
}
