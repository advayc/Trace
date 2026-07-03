/** Matte charcoal (dark) and paper (light) palettes — terracotta accent, Inter typography. */

export type ColorScheme = "dark" | "light";

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

const darkColors: ThemeColors = {
  bg: "#121212",
  surface: "#181818",
  surfaceRaised: "#1E1E1E",
  fog: "#141414",
  border: "#2C2C2C",
  borderStrong: "#333333",
  buttonLight: "#F4F4F5",
  buttonLightText: "#121212",
  ember: "#C8533C",
  emberLight: "#D97058",
  emberDim: "rgba(200,83,60,0.14)",
  accentBorder: "rgba(200,83,60,0.38)",
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
};

const lightColors: ThemeColors = {
  bg: "#F5F5F4",
  surface: "#FFFFFF",
  surfaceRaised: "#FAFAFA",
  fog: "#E7E5E4",
  border: "#D4D4D4",
  borderStrong: "#A3A3A3",
  buttonLight: "#F4F4F5",
  buttonLightText: "#121212",
  ember: "#C8533C",
  emberLight: "#B84A34",
  emberDim: "rgba(200,83,60,0.12)",
  accentBorder: "rgba(200,83,60,0.32)",
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
};

const darkMapPalette: MapPalette = {
  fogFill: "rgba(18,18,18,0.90)",
  fogStroke: "rgba(255,255,255,0.04)",
  revealedOpacity: 0.52,
  revealedStroke: "rgba(217,112,88,0.38)",
  atmosphereWash: "rgba(12,14,18,0.16)",
};

const lightMapPalette: MapPalette = {
  fogFill: "rgba(231,229,228,0.92)",
  fogStroke: "rgba(0,0,0,0.06)",
  revealedOpacity: 0.48,
  revealedStroke: "rgba(200,83,60,0.42)",
  atmosphereWash: "rgba(245,245,244,0.22)",
};

/** Default export for non-reactive contexts (share cards, splash). */
export const colors = darkColors;
export const mapPalette = darkMapPalette;

export function getTheme(scheme: ColorScheme) {
  return {
    scheme,
    colors: scheme === "light" ? lightColors : darkColors,
    mapPalette: scheme === "light" ? lightMapPalette : darkMapPalette,
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

const HEAT_STOPS = ["#C8533C", "#B84A34", "#A8422E", "#963828"] as const;

export function heatColor(visitCount: number): string {
  if (visitCount <= 1) return HEAT_STOPS[0];
  if (visitCount <= 3) return HEAT_STOPS[1];
  if (visitCount <= 7) return HEAT_STOPS[2];
  return HEAT_STOPS[3];
}

/** Native tab bar content height (liquid glass tabs sit above home indicator). */
export const TAB_BAR_HEIGHT = 49;
