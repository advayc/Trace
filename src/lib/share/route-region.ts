import type { Region } from "react-native-maps";

import type { ActivityRoutePoint } from "@/lib/activity/activity-types";

/** Fit a MapView region to a walked route with padding. */
export function routeToRegion(
  route: ActivityRoutePoint[],
  paddingFactor = 1.45,
): Region | null {
  if (route.length === 0) return null;

  const lats = route.map((p) => p.latitude);
  const lngs = route.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = Math.max(maxLat - minLat, 0.0004);
  const lngSpan = Math.max(maxLng - minLng, 0.0004);
  const latMid = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const lngSpanCorrected = lngSpan * Math.cos(latMid);

  const latDelta = Math.max(latSpan * paddingFactor, 0.004);
  const lngDelta = Math.max(
    (lngSpanCorrected > 0 ? lngSpan / lngSpanCorrected : 1) * lngSpan * paddingFactor,
    0.004,
  );

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}
