import { useEffect } from "react";
import { View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Polyline,
  Rect,
  Stop,
} from "react-native-svg";

import { colors } from "@/constants/theme";
import type { ActivityRoutePoint } from "@/lib/activity/activity-types";

interface ShareCardMapProps {
  route: ActivityRoutePoint[];
  width: number;
  height: number;
  onMapReady?: () => void;
}

/** Deterministic route canvas for share cards to avoid native map snapshot flakiness. */
export function ShareCardMap({ route, width, height, onMapReady }: ShareCardMapProps) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => onMapReady?.());
    return () => cancelAnimationFrame(frame);
  }, [onMapReady, route]);

  const mapPadding = 22;
  const routePoints = projectRoute(route, width, height, mapPadding);
  const routePolyline = routePoints.map((p) => `${p.x},${p.y}`).join(" ");
  const start = routePoints[0] ?? null;
  const finish = routePoints[routePoints.length - 1] ?? null;

  return (
    <View style={{ width, height, overflow: "hidden", backgroundColor: colors.bg }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="shareMapBg" x1="0" y1="0" x2="0.92" y2="1">
            <Stop offset="0" stopColor={colors.surface} stopOpacity="1" />
            <Stop offset="0.7" stopColor={colors.fog} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.bg} stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="routeGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.emberLight} />
            <Stop offset="1" stopColor={colors.ember} />
          </LinearGradient>
        </Defs>

        <Rect width={width} height={height} fill="url(#shareMapBg)" />

        <Path
          d={gridPath(width, height, 38)}
          stroke={colors.border}
          strokeOpacity={0.25}
          strokeWidth={1}
          fill="none"
        />

        {routePoints.length >= 2 ? (
          <>
            <Polyline
              points={routePolyline}
              stroke={colors.emberLight}
              strokeOpacity={0.24}
              strokeWidth={13}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Polyline
              points={routePolyline}
              stroke="url(#routeGlow)"
              strokeWidth={5.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : null}

        {start ? <Circle cx={start.x} cy={start.y} r={4.5} fill={colors.mint} /> : null}
        {finish ? (
          <Circle
            cx={finish.x}
            cy={finish.y}
            r={5}
            fill={colors.ember}
            stroke={colors.bg}
            strokeWidth={2}
          />
        ) : null}
      </Svg>
    </View>
  );
}

function projectRoute(
  route: ActivityRoutePoint[],
  width: number,
  height: number,
  padding: number,
): { x: number; y: number }[] {
  if (route.length === 0) return [];
  if (route.length === 1) {
    return [{ x: width / 2, y: height / 2 }];
  }

  const lats = route.map((point) => point.latitude);
  const lngs = route.map((point) => point.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = Math.max(maxLat - minLat, 0.0001);
  const lngSpan = Math.max(maxLng - minLng, 0.0001);

  const drawWidth = Math.max(1, width - padding * 2);
  const drawHeight = Math.max(1, height - padding * 2);

  return route.map((point) => {
    const normalizedX = (point.longitude - minLng) / lngSpan;
    const normalizedY = (point.latitude - minLat) / latSpan;
    return {
      x: padding + normalizedX * drawWidth,
      y: height - (padding + normalizedY * drawHeight),
    };
  });
}

function gridPath(width: number, height: number, step: number): string {
  const commands: string[] = [];

  for (let x = step; x < width; x += step) {
    commands.push(`M ${x} 0 L ${x} ${height}`);
  }

  for (let y = step; y < height; y += step) {
    commands.push(`M 0 ${y} L ${width} ${y}`);
  }

  return commands.join(" ");
}
