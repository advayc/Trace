export const colors = {
  bg: "#0C0E12",
  surface: "#14171E",
  surfaceRaised: "#1B1F28",
  fog: "#1A1D24",
  border: "rgba(255,255,255,0.08)",
  ember: "#E8A04C",
  emberLight: "#F5C882",
  emberDim: "rgba(232,160,76,0.16)",
  mint: "#6EE7B7",
  mintDim: "rgba(110,231,183,0.14)",
  text: "#F4F4F5",
  textMuted: "#9CA3AF",
  textFaint: "#6B7280",
  danger: "#F87171",
} as const;

export const fonts = {
  display: "Fraunces_600SemiBold",
  displayBold: "Fraunces_700Bold",
  body: "DMSans_400Regular",
  medium: "DMSans_500Medium",
  bold: "DMSans_700Bold",
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

/** Revisit heat ramp: visit 1 stays ember, repeats warm toward red-orange. */
const HEAT_STOPS = ["#E8A04C", "#E08A38", "#DF7526", "#E85D04"] as const;

export function heatColor(visitCount: number): string {
  if (visitCount <= 1) return HEAT_STOPS[0];
  if (visitCount <= 3) return HEAT_STOPS[1];
  if (visitCount <= 7) return HEAT_STOPS[2];
  return HEAT_STOPS[3];
}

export const mapPalette = {
  fogFill: "rgba(16,18,24,0.86)",
  fogStroke: "rgba(255,255,255,0.045)",
  revealedOpacity: 0.5,
  revealedStroke: "rgba(245,200,130,0.35)",
} as const;
