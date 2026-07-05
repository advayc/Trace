import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import MapView, { Polyline, type Region } from "react-native-maps";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FogHexLayer, FriendHexLayer, RevealedHexLayer } from "@/components/map/hex-layers";
import { FriendLegend } from "@/components/map/friend-legend";
import { MapSessionPill } from "@/components/map/map-session-pill";
import { NeighborhoodPill } from "@/components/map/neighborhood-pill";
import { RevealToast } from "@/components/map/reveal-toast";
import { LiveStatsBar } from "@/components/activity/live-stats-bar";
import { SessionControls } from "@/components/activity/session-controls";
import { radius, TAB_BAR_HEIGHT } from "@/constants/theme";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useTheme } from "@/hooks/use-theme";
import { useActivitySession } from "@/hooks/use-activity-session";
import { useActivityShareCard } from "@/hooks/use-activity-share-card";
import { activityRecorder } from "@/lib/activity/activity-recorder";
import {
  fetchFriendTilesInCells,
  friendHueForUserId,
  type FriendTile,
} from "@/lib/friends/friends-service";
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
  const { colors, mapPalette, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { share: shareActivity, hiddenCard } = useActivityShareCard();
  const regionRef = useRef<Region>(FALLBACK_REGION);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fogCells, setFogCells] = useState<string[]>([]);
  const [revealedTiles, setRevealedTiles] = useState<StompedTile[]>([]);
  const [friendTiles, setFriendTiles] = useState<FriendTile[]>([]);
  const [friendTileColors, setFriendTileColors] = useState<Record<string, string>>({});
  const [revealCount, setRevealCount] = useState(0);
  const { activeSession, latestActivity } = useActivitySession();
  const { user } = useAuthUser();
  const friendFetchIdRef = useRef(0);

  const followUser = useSessionStore((s) => s.followUser);
  const setFollowUser = useSessionStore((s) => s.setFollowUser);
  const sessionNewTiles = useSessionStore((s) => s.sessionNewTiles);
  const incrementSessionTiles = useSessionStore((s) => s.incrementSessionTiles);
  const lastFix = useSessionStore((s) => s.lastFix);
  const setLastFix = useSessionStore((s) => s.setLastFix);

  const tabBarClearance = insets.bottom + TAB_BAR_HEIGHT + 12;

  const activeFriendLegendItems = Object.keys(friendTileColors)
    .map((userId) => {
      const tile = friendTiles.find((t) => t.userId === userId);
      return {
        userId,
        color: friendTileColors[userId],
        displayName: tile?.displayName ?? null,
      };
    })
    .slice(0, 5);

  const activeRunRoute = activeSession?.type === "run" ? activeSession.route : [];

  const friendFillColor = useCallback(
    (userId: string) => `hsla(${friendHueForUserId(userId)}, 82%, 60%, 0.24)`,
    [],
  );

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
      setFriendTiles([]);
      return;
    }

    const revealedSet = new Set(revealed.map((t) => t.h3Index));
    const viewportCells = cellsInBBox(box);
    const fog = viewportCells.filter((c) => !revealedSet.has(c));
    setFogCells(fog.slice(0, Math.max(0, POLYGON_BUDGET - revealed.length)));
    setRevealedTiles(revealed);

    if (!user) {
      setFriendTiles([]);
      setFriendTileColors({});
      return;
    }

    const fetchId = ++friendFetchIdRef.current;
    fetchFriendTilesInCells(user.id, viewportCells)
      .then((tiles) => {
        if (fetchId !== friendFetchIdRef.current) return;
        setFriendTiles(tiles);
        const colorMap: Record<string, string> = {};
        tiles.forEach((tile) => {
          if (!colorMap[tile.userId]) {
            colorMap[tile.userId] = friendFillColor(tile.userId);
          }
        });
        setFriendTileColors(colorMap);
      })
      .catch(() => {
        if (fetchId !== friendFetchIdRef.current) return;
        setFriendTiles([]);
      });
  }, [friendFillColor, user]);

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
    shareActivity(activity, mapRef.current);
  }, [shareActivity]);

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
        <FriendHexLayer tiles={friendTiles} colorByUserId={friendTileColors} />
        <RevealedHexLayer tiles={revealedTiles} />
        {activeRunRoute.length >= 2 ? (
          <>
            <Polyline
              coordinates={activeRunRoute}
              strokeColor={colors.emberDim}
              strokeWidth={9}
              lineCap="round"
              lineJoin="round"
            />
            <Polyline
              coordinates={activeRunRoute}
              strokeColor={colors.ember}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          </>
        ) : null}
      </MapView>

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: mapPalette.atmosphereWash,
        }}
      />

      {/* Top overlay: region coverage centered, session counter on its own row */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: insets.top + 12,
          left: 16,
          right: 16,
          gap: 8,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <NeighborhoodPill position={lastFix} />
        </View>
        <View style={{ alignItems: "flex-start" }}>
          <MapSessionPill sessionTiles={sessionNewTiles} />
        </View>
        {activeFriendLegendItems.length > 0 ? (
          <View style={{ alignItems: "flex-end" }}>
            <FriendLegend items={activeFriendLegendItems} />
          </View>
        ) : null}
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
          showStartOptions={false}
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

      {hiddenCard}
    </View>
  );
}
