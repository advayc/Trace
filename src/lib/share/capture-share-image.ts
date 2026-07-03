import * as Sharing from "expo-sharing";
import type { RefObject } from "react";
import { Share, View } from "react-native";
import { captureRef } from "react-native-view-shot";

import type { Activity } from "@/lib/activity/activity-types";
import {
  formatDistanceKm,
  formatDuration,
  formatPace,
} from "@/lib/activity/activity-format";
import { ACTIVITY_SHARE_CARD_SIZE } from "@/lib/share/activity-share-card";

const MAP_CAPTURE_DELAY_MS = 900;

function shareMessage(activity: Activity): string {
  const title = activity.type === "run" ? "Trace run" : "Trace walk";
  return `${title}\n${formatDistanceKm(activity.distanceM)} in ${formatDuration(activity.durationMs)}\nPace ${formatPace(activity.avgPaceSPerKm)}\n+${activity.newTiles} new tiles`;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Capture a mounted share card and open the system share sheet. */
export async function shareActivityCard(
  cardRef: RefObject<View | null>,
  activity: Activity,
  options?: { mapReady?: boolean },
): Promise<void> {
  const title = activity.type === "run" ? "Trace run" : "Trace walk";
  const message = shareMessage(activity);

  if (!cardRef.current) {
    await Share.share({ message, title });
    return;
  }

  if (activity.route.length >= 2 && !options?.mapReady) {
    await wait(MAP_CAPTURE_DELAY_MS);
  }

  try {
    const uri = await captureRef(cardRef, {
      format: "png",
      quality: 1,
      width: ACTIVITY_SHARE_CARD_SIZE.width,
      height: ACTIVITY_SHARE_CARD_SIZE.height,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: title,
        UTI: "public.png",
      });
      return;
    }
    await Share.share({ message, url: uri, title });
  } catch {
    await Share.share({ message, title });
  }
}

/** Map snapshot fallback when no share card is mounted. */
export async function shareActivityFromMap(
  mapRef: { takeSnapshot?: (options: object) => Promise<string> } | null,
  activity: Activity,
): Promise<void> {
  const title = activity.type === "run" ? "Trace run" : "Trace walk";
  const message = shareMessage(activity);

  let url: string | undefined;
  if (mapRef?.takeSnapshot) {
    try {
      url = await mapRef.takeSnapshot({
        width: 1080,
        height: 1080,
        format: "png",
        quality: 1,
        result: "file",
      });
    } catch {
      url = undefined;
    }
  }

  if (url && (await Sharing.isAvailableAsync())) {
    await Sharing.shareAsync(url, {
      mimeType: "image/png",
      dialogTitle: title,
      UTI: "public.png",
    });
    return;
  }

  await Share.share(url ? { message, url, title } : { message, title });
}
