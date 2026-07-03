/** Serialized into profiles.avatar_url — icon SF name + background hue. */
export type AvatarPreset = {
  icon: string;
  hue: number;
};

const DEFAULT: AvatarPreset = { icon: "figure.walk", hue: 24 };

export const AVATAR_ICONS = [
  "figure.walk",
  "figure.run",
  "figure.hiking",
  "leaf.fill",
  "mountain.2.fill",
  "star.fill",
  "bolt.fill",
  "hare.fill",
  "pawprint.fill",
  "heart.fill",
  "sun.max.fill",
  "moon.stars.fill",
] as const;

export const AVATAR_HUES = [12, 24, 45, 142, 195, 210, 260, 330] as const;

export function serializeAvatar(preset: AvatarPreset): string {
  return `icon:${preset.icon}|hue:${preset.hue}`;
}

export function parseAvatar(raw: string | null | undefined): AvatarPreset {
  if (!raw?.startsWith("icon:")) return DEFAULT;
  const iconMatch = raw.match(/icon:([^|]+)/);
  const hueMatch = raw.match(/hue:(\d+)/);
  const icon = iconMatch?.[1] ?? DEFAULT.icon;
  const hue = hueMatch ? Number(hueMatch[1]) : DEFAULT.hue;
  if (!Number.isFinite(hue)) return { icon, hue: DEFAULT.hue };
  return { icon, hue };
}
