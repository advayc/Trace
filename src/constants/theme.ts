/** Matte dark — charcoal canvas, terracotta accent, Inter typography. */
export const colors = {
  bg: "#121212",
  surface: "#181818",
  surfaceRaised: "#1E1E1E",
  fog: "#141414",
  border: "#2C2C2C",
  borderStrong: "#333333",
  /** Light buttons (Google / Apple) on dark backgrounds. */
  buttonLight: "#F4F4F5",
  buttonLightText: "#121212",
  /** Primary accent — CTAs, map reveals, active states. */
  ember: "#C8533C",
  emberLight: "#D97058",
  emberDim: "rgba(200,83,60,0.14)",
  accentBorder: "rgba(200,83,60,0.38)",
  /** Secondary — streaks, milestones. */
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

export const mapPalette = {
  fogFill: "rgba(18,18,18,0.90)",
  fogStroke: "rgba(255,255,255,0.04)",
  revealedOpacity: 0.52,
  revealedStroke: "rgba(217,112,88,0.38)",
} as const;
