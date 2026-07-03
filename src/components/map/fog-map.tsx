import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import MapView, { type Region } from "react-native-maps";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FogHexLayer, RevealedHexLayer } from "@/components/map/hex-layers";
import { MapSessionPill } from "@/components/map/map-session-pill";
import { NeighborhoodPill } from "@/components/map/neighborhood-pill";
import { RevealToast } from "@/components/map/reveal-toast";
import { LiveStatsBar } from "@/components/activity/live-stats-bar";
import { SessionControls } from "@/components/activity/session-controls";
import { radius, TAB_BAR_HEIGHT } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useActivitySession } from "@/hooks/use-activity-session";
import { activityRecorder } from "@/lib/activity/activity-recorder";
import { cellsInBBox, estimateCellCount, type BoundingBox } from "@/lib/h3";
import { locationService } from "@/lib/location/location-service";
import { shareActivityCard, shareActivityFromMap } from "@/lib/share/capture-share-image";
import { ActivityShareCard } from "@/lib/share/activity-share-card";
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
  const { colors, mapPalette, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const shareCardRef = useRef<View>(null);
  const regionRef = useRef<Region>(FALLBACK_REGION);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fogCells, setFogCells] = useState<string[]>([]);
  const [revealedTiles, setRevealedTiles] = useState<StompedTile[]>([]);
  const [revealCount, setRevealCount] = useState(0);
  const { activeSession, latestActivity } = useActivitySession();

  const followUser = useSessionStore((s) => s.followUser);
  const setFollowUser = useSessionStore((s) => s.setFollowUser);
  const sessionNewTiles = useSessionStore((s) => s.sessionNewTiles);
  const incrementSessionTiles = useSessionStore((s) => s.incrementSessionTiles);
  const lastFix = useSessionStore((s) => s.lastFix);
  const setLastFix = useSessionStore((s) => s.setLastFix);

  const tabBarClearance = insets.bottom + TAB_BAR_HEIGHT + 12;

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

  const startWalk = useCallback(() => {
    activityRecorder.start("walk");
  }, []);

  const startRun = useCallback(() => {
    activityRecorder.start("run");
  }, []);

  const stopSession = useCallback(() => {
    activityRecorder.stop();
  }, []);

  const shareLatest = useCallback(() => {
    const activity = activityRecorder.latestActivity();
    if (!activity) return;
    if (activity.route.length >= 2) {
      shareActivityCard(shareCardRef, activity).catch(() => {});
      return;
    }
    shareActivityFromMap(mapRef.current, activity).catch(() => {});
  }, []);

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
        userInterfaceStyle={scheme === "light" ? "light" : "dark"}
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

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: mapPalette.atmosphereWash,
        }}
      />

      {/* Top overlay: session pill (left) + neighborhood pill (center, no overlap) */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: insets.top + 12,
          left: 16,
          right: 16,
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <MapSessionPill sessionTiles={sessionNewTiles} />
        <View style={{ flex: 1, alignItems: "center", minWidth: 0 }}>
          <NeighborhoodPill position={lastFix} />
        </View>
      </View>

      {/* Bottom: session controls + live stats */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 16,
          right: 72,
          bottom: tabBarClearance,
          gap: 10,
        }}
      >
        {activeSession ? <LiveStatsBar session={activeSession} /> : null}
        <SessionControls
          activeSession={activeSession}
          latestActivity={latestActivity}
          onStartWalk={startWalk}
          onStartRun={startRun}
          onStop={stopSession}
          onShareLatest={shareLatest}
        />
      </View>

      {/* Bottom-right: recenter — above tab bar, clear of controls column */}
      <Animated.View
        entering={FadeIn.duration(360).delay(200)}
        style={{ position: "absolute", right: 16, bottom: tabBarClearance }}
      >
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
            borderRadius: radius.md,
            backgroundColor: followUser ? colors.ember : colors.surfaceRaised,
            borderWidth: 1,
            borderColor: followUser ? colors.ember : colors.borderStrong,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Image
            source="sf:location.fill"
            style={{ width: 20, height: 20 }}
            tintColor={followUser ? colors.bg : colors.text}
          />
        </Pressable>
      </Animated.View>

      {/* Reveal toast — floats above controls */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: tabBarClearance + (activeSession ? 168 : 120),
          left: 16,
          right: 16,
          alignItems: "center",
        }}
      >
        <RevealToast revealCount={revealCount} sessionTiles={sessionNewTiles} />
      </View>

      {latestActivity && latestActivity.route.length >= 2 ? (
        <View
          pointerEvents="none"
          style={{ position: "absolute", left: -9999, top: 0, opacity: 0 }}
        >
          <View ref={shareCardRef} collapsable={false}>
            <ActivityShareCard activity={latestActivity} />
          </View>
        </View>
      ) : null}
    </View>
  );
}
