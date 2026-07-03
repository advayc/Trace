export function formatCompact(n: number): string {
  if (n >= 1_000_000) {
    return `${trimZero((n / 1_000_000).toFixed(1))}M`;
  }
  if (n >= 10_000) {
    return `${trimZero((n / 1000).toFixed(1))}k`;
  }
  if (n >= 1000) {
    return n.toLocaleString("en-US");
  }
  return String(n);
}

function trimZero(s: string): string {
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

export type Units = "mi" | "km";

export function formatDistance(meters: number, units: Units): string {
  if (units === "km") {
    const km = meters / 1000;
    return km >= 100 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
  }
  const mi = meters / 1609.344;
  return mi >= 100 ? `${Math.round(mi)} mi` : `${mi.toFixed(1)} mi`;
}

export function formatArea(km2: number, units: Units): string {
  if (units === "km") {
    return `${km2 >= 100 ? Math.round(km2) : km2.toFixed(2)} km²`;
  }
  const mi2 = km2 / 2.58999;
  return `${mi2 >= 100 ? Math.round(mi2) : mi2.toFixed(2)} mi²`;
}

export function formatPercent(fraction: number): string {
  const pct = fraction * 100;
  if (pct > 0 && pct < 1) return `${pct.toFixed(1)}%`;
  return `${Math.round(pct)}%`;
}
