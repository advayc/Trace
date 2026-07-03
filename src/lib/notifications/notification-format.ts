import { ACCENT_TOKENS, type AccentPreset } from "@/constants/theme";
import type { ActiveSession } from "@/lib/activity/activity-types";
import {
  formatDuration,
  formatPace,
} from "@/lib/activity/activity-format";
import { formatDistance, type Units } from "@/lib/stats/format";
import { SETTINGS_KEYS, settings } from "@/lib/storage/settings";

export function getAccentHex(preset: AccentPreset = "ember"): string {
  return ACCENT_TOKENS[preset].ember;
}

export function getUnits(): Units {
  return settings.get<Units>(SETTINGS_KEYS.units, "km");
}

export function getAccentPreset(): AccentPreset {
  return settings.get<AccentPreset>(SETTINGS_KEYS.accentPreset, "ember");
}

export function formatSessionTiles(count: number): string {
  return count === 1 ? "1 new" : `${count} new`;
}

export function formatSessionPace(
  paceSPerKm: number | null,
  units: Units = getUnits(),
): string {
  if (!paceSPerKm || !Number.isFinite(paceSPerKm)) {
    return units === "mi" ? "--:-- /mi" : "--:-- /km";
  }
  if (units === "mi") {
    const paceSPerMi = paceSPerKm * 1.609344;
    const totalSeconds = Math.round(paceSPerMi);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")} /mi`;
  }
  return formatPace(paceSPerKm);
}

export function formatSessionDistance(
  distanceM: number,
  units: Units = getUnits(),
): string {
  return formatDistance(distanceM, units);
}

export function buildWalkActivityProps(
  session: ActiveSession,
  isStale: boolean,
): {
  activityLabel: string;
  activityType: "walk" | "run";
  tilesLabel: string;
  timeLabel: string;
  distanceLabel: string;
  paceLabel: string;
  accentColor: string;
  isStale: boolean;
} {
  const units = getUnits();
  const accentPreset = getAccentPreset();
  return {
    activityLabel: session.type === "run" ? "Run" : "Walk",
    activityType: session.type,
    tilesLabel: formatSessionTiles(session.newTiles),
    timeLabel: formatDuration(session.durationMs),
    distanceLabel: formatSessionDistance(session.distanceM, units),
    paceLabel: formatSessionPace(session.avgPaceSPerKm, units),
    accentColor: getAccentHex(accentPreset),
    isStale,
  };
}

export function formatSessionSummaryBody(session: {
  type: ActiveSession["type"];
  newTiles: number;
  distanceM: number;
  durationMs: number;
}): string {
  const units = getUnits();
  const label = session.type === "run" ? "Run" : "Walk";
  const tiles =
    session.newTiles === 1
      ? "1 new tile"
      : `${session.newTiles} new tiles`;
  return `${label} complete — ${tiles} · ${formatSessionDistance(session.distanceM, units)} · ${formatDuration(session.durationMs)}`;
}
