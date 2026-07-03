import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { colors } from "@/constants/theme";
import type { ActivityRoutePoint } from "@/lib/activity/activity-types";
import { routeToRegion } from "@/lib/share/route-region";

interface ShareCardMapProps {
  route: ActivityRoutePoint[];
  width: number;
  height: number;
  onMapReady?: () => void;
}

/** Static map snapshot area for activity share cards — real tiles + route polyline. */
export function ShareCardMap({ route, width, height, onMapReady }: ShareCardMapProps) {
  const region = routeToRegion(route);
  const readyRef = useRef(false);

  useEffect(() => {
    return () => {
      readyRef.current = false;
    };
  }, [route]);

  const notifyReady = () => {
    if (readyRef.current) return;
    readyRef.current = true;
    // Brief delay so Apple Maps tiles finish painting before view-shot capture.
    setTimeout(() => onMapReady?.(), 700);
  };

  if (!region || route.length < 2) {
    return <View style={{ width, height, backgroundColor: colors.bg }} />;
  }

  return (
    <View style={{ width, height, overflow: "hidden", backgroundColor: colors.bg }}>
      <MapView
        style={{ width, height }}
        initialRegion={region}
        mapType="mutedStandard"
        userInterfaceStyle="light"
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsPointsOfInterests={false}
        toolbarEnabled={false}
        onMapReady={notifyReady}
        onMapLoaded={notifyReady}
      >
        <Polyline
          coordinates={route}
          strokeColor={colors.ember}
          strokeWidth={5}
          lineCap="round"
          lineJoin="round"
        />
      </MapView>

      <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="shareMapFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.bg} stopOpacity="0" />
            <Stop offset="0.42" stopColor={colors.bg} stopOpacity="0.15" />
            <Stop offset="0.72" stopColor={colors.bg} stopOpacity="0.72" />
            <Stop offset="1" stopColor={colors.bg} stopOpacity="0.95" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#shareMapFade)" />
      </Svg>
    </View>
  );
}
