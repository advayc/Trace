/** Matte charcoal (dark) and paper (light) palettes — accent color is user-configurable. */

export type ColorScheme = "dark" | "light";

export type AccentPreset =
  | "ember"
  | "lavender"
  | "green"
  | "blue"
  | "red"
  | "yellow";

export const ACCENT_PRESET_LABELS: Record<AccentPreset, string> = {
  ember: "Ember",
  lavender: "Lavender",
  green: "Green",
  blue: "Blue",
  red: "Red",
  yellow: "Yellow",
};

type AccentTokens = {
  readonly ember: string;
  readonly emberLight: string;
  readonly emberDim: string;
  readonly accentBorder: string;
  readonly heatStops: readonly string[];
  readonly mapRevealedStroke: string;
};

export const ACCENT_TOKENS: Record<AccentPreset, AccentTokens> = {
  ember: {
    ember: "#E8A04C",
    emberLight: "#F5C882",
    emberDim: "rgba(232,160,76,0.16)",
    accentBorder: "rgba(232,160,76,0.42)",
    heatStops: ["#E8A04C", "#D98C35", "#C7741B", "#B35D0E"],
    mapRevealedStroke: "rgba(232,160,76,0.4)",
  },
  lavender: {
    ember: "#9B87F5",
    emberLight: "#B4A6FF",
    emberDim: "rgba(155,135,245,0.16)",
    accentBorder: "rgba(155,135,245,0.42)",
    heatStops: ["#9B87F5", "#8B78E8", "#7B69DB", "#6B5ACE"],
    mapRevealedStroke: "rgba(180,166,255,0.42)",
  },
  green: {
    ember: "#34D399",
    emberLight: "#6EE7B7",
    emberDim: "rgba(52,211,153,0.14)",
    accentBorder: "rgba(52,211,153,0.38)",
    heatStops: ["#34D399", "#2DB88A", "#26A07B", "#1F886C"],
    mapRevealedStroke: "rgba(110,231,183,0.40)",
  },
  blue: {
    ember: "#60A5FA",
    emberLight: "#93C5FD",
    emberDim: "rgba(96,165,250,0.14)",
    accentBorder: "rgba(96,165,250,0.38)",
    heatStops: ["#60A5FA", "#5294E8", "#4483D6", "#3672C4"],
    mapRevealedStroke: "rgba(147,197,253,0.40)",
  },
  red: {
    ember: "#F87171",
    emberLight: "#FCA5A5",
    emberDim: "rgba(248,113,113,0.14)",
    accentBorder: "rgba(248,113,113,0.38)",
    heatStops: ["#F87171", "#E86565", "#D85959", "#C84D4D"],
    mapRevealedStroke: "rgba(252,165,165,0.40)",
  },
  yellow: {
    ember: "#FBBF24",
    emberLight: "#FCD34D",
    emberDim: "rgba(251,191,36,0.16)",
    accentBorder: "rgba(251,191,36,0.42)",
    heatStops: ["#FBBF24", "#E8B020", "#D5A11C", "#C29218"],
    mapRevealedStroke: "rgba(252,211,77,0.42)",
  },
};

export type ThemeColors = {
  readonly bg: string;
  readonly surface: string;
  readonly surfaceRaised: string;
  readonly fog: string;
  readonly border: string;
  readonly borderStrong: string;
  readonly buttonLight: string;
  readonly buttonLightText: string;
  readonly ember: string;
  readonly emberLight: string;
  readonly emberDim: string;
  readonly accentBorder: string;
  readonly mint: string;
  readonly mintLight: string;
  readonly mintDim: string;
  readonly successBorder: string;
  readonly text: string;
  readonly textMuted: string;
  readonly textFaint: string;
  readonly danger: string;
  readonly dangerDim: string;
  readonly overlay: string;
  readonly glassBg: string;
};

export type MapPalette = {
  readonly fogFill: string;
  readonly fogStroke: string;
  readonly revealedOpacity: number;
  readonly revealedStroke: string;
  readonly atmosphereWash: string;
};

const darkBase = {
  bg: "#121212",
  surface: "#181818",
  surfaceRaised: "#1E1E1E",
  fog: "#141414",
  border: "#2C2C2C",
  borderStrong: "#333333",
  buttonLight: "#F4F4F5",
  buttonLightText: "#121212",
  mint: "#D4D4D4",
  mintLight: "#E5E5E5",
  mintDim: "rgba(255,255,255,0.06)",
  successBorder: "rgba(255,255,255,0.12)",
  text: "#FAFAFA",
  textMuted: "#A3A3A3",
  textFaint: "#737373",
  danger: "#EF4444",
  dangerDim: "rgba(239,68,68,0.12)",
  overlay: "rgba(0,0,0,0.82)",
  glassBg: "rgba(24,24,24,0.72)",
} as const;

const lightBase = {
  bg: "#F5F5F4",
  surface: "#FFFFFF",
  surfaceRaised: "#FAFAFA",
  fog: "#E7E5E4",
  border: "#D4D4D4",
  borderStrong: "#A3A3A3",
  buttonLight: "#F4F4F5",
  buttonLightText: "#121212",
  mint: "#525252",
  mintLight: "#404040",
  mintDim: "rgba(0,0,0,0.04)",
  successBorder: "rgba(0,0,0,0.08)",
  text: "#171717",
  textMuted: "#525252",
  textFaint: "#737373",
  danger: "#DC2626",
  dangerDim: "rgba(220,38,38,0.10)",
  overlay: "rgba(255,255,255,0.88)",
  glassBg: "rgba(255,255,255,0.78)",
} as const;

const darkMapBase = {
  fogFill: "rgba(18,18,18,0.90)",
  fogStroke: "rgba(255,255,255,0.04)",
  revealedOpacity: 0.52,
  atmosphereWash: "rgba(12,14,18,0.16)",
} as const;

const lightMapBase = {
  fogFill: "rgba(231,229,228,0.92)",
  fogStroke: "rgba(0,0,0,0.06)",
  revealedOpacity: 0.48,
  atmosphereWash: "rgba(245,245,244,0.22)",
} as const;

function buildColors(
  base: typeof darkBase | typeof lightBase,
  accent: AccentTokens,
): ThemeColors {
  return {
    ...base,
    ember: accent.ember,
    emberLight: accent.emberLight,
    emberDim: accent.emberDim,
    accentBorder: accent.accentBorder,
  };
}

function buildMapPalette(
  base: typeof darkMapBase | typeof lightMapBase,
  accent: AccentTokens,
): MapPalette {
  return {
    ...base,
    revealedStroke: accent.mapRevealedStroke,
  };
}

/** Default export for non-reactive contexts (share cards, splash). */
export const colors = buildColors(darkBase, ACCENT_TOKENS.ember);
export const mapPalette = buildMapPalette(darkMapBase, ACCENT_TOKENS.ember);

export function getTheme(scheme: ColorScheme, accentPreset: AccentPreset = "ember") {
  const accent = ACCENT_TOKENS[accentPreset];
  return {
    scheme,
    accentPreset,
    colors: buildColors(scheme === "light" ? lightBase : darkBase, accent),
    mapPalette: buildMapPalette(scheme === "light" ? lightMapBase : darkMapBase, accent),
    heatStops: accent.heatStops,
  };
}

export const fonts = {
  display: "Inter_600SemiBold",
  displayBold: "Inter_700Bold",
  body: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const spacing = {
  screen: 20,
  section: 16,
  card: 14,
} as const;

const HEAT_STOPS = ACCENT_TOKENS.ember.heatStops;

export function heatColor(
  visitCount: number,
  stops: readonly string[] = HEAT_STOPS,
): string {
  if (visitCount <= 1) return stops[0]!;
  if (visitCount <= 3) return stops[1]!;
  if (visitCount <= 7) return stops[2]!;
  return stops[3]!;
}

/** Native tab bar content height (liquid glass tabs sit above home indicator). */
export const TAB_BAR_HEIGHT = 49;
