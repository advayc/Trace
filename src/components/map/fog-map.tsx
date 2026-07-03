import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import MapView, { type Region } from "react-native-maps";

import { FogHexLayer, RevealedHexLayer } from "@/components/map/hex-layers";
import { NeighborhoodPill } from "@/components/map/neighborhood-pill";
import { RevealToast } from "@/components/map/reveal-toast";
import { colors, radius } from "@/constants/theme";
import { cellsInBBox, estimateCellCount, type BoundingBox } from "@/lib/h3";
import { locationService } from "@/lib/location/location-service";
import { tileRepository, type StompedTile } from "@/lib/storage/tile-db";
import { stompEngine } from "@/lib/stomp/stomp-engine";
import { useSessionStore } from "@/store/session-store";

/** Combined fog + revealed polygon budget per frame. */
const POLYGON_BUDGET = 500;
const REGION_DEBOUNCE_MS = 150;

const FALLBACK_REGION: Region = {
  latitude: 40.7648,
  longitude: -73.9808,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

function regionToBBox(region: Region): BoundingBox {
  return {
    north: region.latitude + region.latitudeDelta / 2,
    south: region.latitude - region.latitudeDelta / 2,
    east: region.longitude + region.longitudeDelta / 2,
    west: region.longitude - region.longitudeDelta / 2,
  };
}

export function FogMap() {
  const mapRef = useRef<MapView>(null);
  const regionRef = useRef<Region>(FALLBACK_REGION);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fogCells, setFogCells] = useState<string[]>([]);
  const [revealedTiles, setRevealedTiles] = useState<StompedTile[]>([]);
  const [revealCount, setRevealCount] = useState(0);

  const followUser = useSessionStore((s) => s.followUser);
  const setFollowUser = useSessionStore((s) => s.setFollowUser);
  const sessionNewTiles = useSessionStore((s) => s.sessionNewTiles);
  const incrementSessionTiles = useSessionStore((s) => s.incrementSessionTiles);
  const lastFix = useSessionStore((s) => s.lastFix);
  const setLastFix = useSessionStore((s) => s.setLastFix);

  const recomputeLayers = useCallback(() => {
    const box = regionToBBox(regionRef.current);
    const estimate = estimateCellCount(box);

    const revealed = tileRepository.tilesInBBox(
      box.north,
      box.south,
      box.east,
      box.west,
      POLYGON_BUDGET,
    );

    if (estimate > POLYGON_BUDGET) {
      // Zoomed out past the fog budget: revealed tiles only.
      setFogCells([]);
      setRevealedTiles(revealed);
      return;
    }

    const revealedSet = new Set(revealed.map((t) => t.h3Index));
    const fog = cellsInBBox(box).filter((c) => !revealedSet.has(c));
    setFogCells(fog.slice(0, Math.max(0, POLYGON_BUDGET - revealed.length)));
    setRevealedTiles(revealed);
  }, []);

  const onRegionChangeComplete = useCallback(
    (region: Region) => {
      regionRef.current = region;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(recomputeLayers, REGION_DEBOUNCE_MS);
    },
    [recomputeLayers],
  );

  // Live tile events: haptic + relayer + toast.
  useEffect(() => {
    const offNew = stompEngine.on("tile:new", () => {
      if (process.env.EXPO_OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      incrementSessionTiles();
      setRevealCount((n) => n + 1);
      recomputeLayers();
    });
    const offRevisit = stompEngine.on("tile:revisit", recomputeLayers);
    return () => {
      offNew();
      offRevisit();
    };
  }, [incrementSessionTiles, recomputeLayers]);

  // Track position for follow mode + pill.
  useEffect(() => {
    const unsubscribe = locationService.onPosition((location) => {
      const fix = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setLastFix(fix);
      if (useSessionStore.getState().followUser) {
        mapRef.current?.animateCamera({ center: fix }, { duration: 450 });
      }
    });
    return unsubscribe;
  }, [setLastFix]);

  // Initial camera on the user, then first layer computation.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const current = await locationService.getCurrentPosition();
      if (cancelled) return;
      if (current) {
        const region: Region = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        };
        regionRef.current = region;
        mapRef.current?.animateToRegion(region, 600);
        setLastFix({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
      }
      recomputeLayers();
    })();
    return () => {
      cancelled = true;
    };
  }, [recomputeLayers, setLastFix]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={FALLBACK_REGION}
        mapType="mutedStandard"
        userInterfaceStyle="dark"
        showsUserLocation
        showsMyLocationButton={false}
        showsPointsOfInterests={false}
        pitchEnabled={false}
        onRegionChangeComplete={onRegionChangeComplete}
        onPanDrag={() => setFollowUser(false)}
      >
        <FogHexLayer cells={fogCells} />
        <RevealedHexLayer tiles={revealedTiles} />
      </MapView>

      {/* Atmosphere wash over the base map */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(12,14,18,0.16)",
        }}
      />

      {/* Top overlay: neighborhood pill */}
      <View
        style={{
          position: "absolute",
          top: 64,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <NeighborhoodPill position={lastFix} />
      </View>

      {/* Bottom-right: recenter */}
      <View style={{ position: "absolute", right: 16, bottom: 40, gap: 10 }}>
        <Pressable
          onPress={() => {
            setFollowUser(true);
            if (lastFix) {
              mapRef.current?.animateCamera({ center: lastFix }, { duration: 450 });
            }
          }}
          style={({ pressed }) => ({
            width: 48,
            height: 48,
            borderRadius: radius.pill,
            backgroundColor: followUser ? colors.ember : colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Image
            source="sf:location.fill"
            style={{ width: 20, height: 20 }}
            tintColor={followUser ? colors.bg : colors.text}
          />
        </Pressable>
      </View>

      {/* Bottom-center: reveal toast */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 48,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <RevealToast revealCount={revealCount} sessionTiles={sessionNewTiles} />
      </View>
    </View>
  );
}
