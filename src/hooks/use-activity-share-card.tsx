import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";

import type { Activity } from "@/lib/activity/activity-types";
import { ActivityShareCard } from "@/lib/share/activity-share-card";
import { shareActivityCard, shareActivityFromMap } from "@/lib/share/capture-share-image";

/** Mounts an off-screen share card and captures it when the map is ready. */
export function useActivityShareCard() {
  const cardRef = useRef<View>(null);
  const [pending, setPending] = useState<Activity | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const share = useCallback(
    (
      activity: Activity,
      mapRef?: { takeSnapshot?: (o: object) => Promise<string> } | null,
    ) => {
      if (activity.route.length < 2) {
        shareActivityFromMap(mapRef ?? null, activity).catch(() => {});
        return;
      }
      setMapReady(false);
      setPending(activity);
    },
    [],
  );

  useEffect(() => {
    if (!pending || !mapReady) return;
    shareActivityCard(cardRef, pending, { mapReady: true })
      .catch(() => {})
      .finally(() => {
        setPending(null);
        setMapReady(false);
      });
  }, [pending, mapReady]);

  const hiddenCard =
    pending && pending.route.length >= 2 ? (
      <View
        pointerEvents="none"
        style={{ position: "absolute", left: -9999, top: 0, opacity: 0 }}
      >
        <View ref={cardRef} collapsable={false}>
          <ActivityShareCard activity={pending} onMapReady={() => setMapReady(true)} />
        </View>
      </View>
    ) : null;

  return { share, hiddenCard };
}
