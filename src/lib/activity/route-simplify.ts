import { haversineM } from "@/lib/stomp/stomp-rules";

import type { ActivityRoutePoint } from "@/lib/activity/activity-types";

const EARTH_RADIUS_M = 6371000;

/** Perpendicular distance from point P to segment AB in meters (equirectangular approx). */
function perpendicularDistanceM(
  p: ActivityRoutePoint,
  a: ActivityRoutePoint,
  b: ActivityRoutePoint,
): number {
  const latMid = ((a.latitude + b.latitude) / 2) * (Math.PI / 180);
  const x = (p.longitude - a.longitude) * Math.cos(latMid) * EARTH_RADIUS_M;
  const y = (p.latitude - a.latitude) * (Math.PI / 180) * EARTH_RADIUS_M;
  const x1 = (b.longitude - a.longitude) * Math.cos(latMid) * EARTH_RADIUS_M;
  const y1 = (b.latitude - a.latitude) * (Math.PI / 180) * EARTH_RADIUS_M;

  const lenSq = x1 * x1 + y1 * y1;
  if (lenSq === 0) return Math.hypot(x, y);

  const t = Math.max(0, Math.min(1, (x * x1 + y * y1) / lenSq));
  const projX = x1 * t;
  const projY = y1 * t;
  return Math.hypot(x - projX, y - projY);
}

function douglasPeucker(
  points: ActivityRoutePoint[],
  toleranceM: number,
): ActivityRoutePoint[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIdx = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const dist = perpendicularDistanceM(points[i], points[0], points[end]);
    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }

  if (maxDist > toleranceM) {
    const left = douglasPeucker(points.slice(0, maxIdx + 1), toleranceM);
    const right = douglasPeucker(points.slice(maxIdx), toleranceM);
    return [...left.slice(0, -1), ...right];
  }

  return [points[0], points[end]];
}

function decimateToMax(
  points: ActivityRoutePoint[],
  maxPoints: number,
): ActivityRoutePoint[] {
  if (points.length <= maxPoints) return points;
  const step = (points.length - 1) / (maxPoints - 1);
  const result: ActivityRoutePoint[] = [];
  for (let i = 0; i < maxPoints - 1; i++) {
    result.push(points[Math.round(i * step)]);
  }
  result.push(points[points.length - 1]);
  return result;
}

/** Simplify a session polyline for local storage only. */
export function simplifyRoute(
  points: ActivityRoutePoint[],
  toleranceM = 5,
  maxPoints = 500,
): ActivityRoutePoint[] {
  if (points.length <= 2) return points;
  const simplified = douglasPeucker(points, toleranceM);
  return decimateToMax(simplified, maxPoints);
}

/** Total path length in meters. */
export function routeDistanceM(points: ActivityRoutePoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineM(
      points[i - 1].latitude,
      points[i - 1].longitude,
      points[i].latitude,
      points[i].longitude,
    );
  }
  return total;
}
