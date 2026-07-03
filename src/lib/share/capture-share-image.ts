import * as Sharing from "expo-sharing";
import type { RefObject } from "react";
import { Share, View } from "react-native";
import { captureRef } from "react-native-view-shot";

import type { Activity } from "@/lib/activity/activity-types";
import { formatDuration, formatPace } from "@/lib/activity/activity-format";
import { ACTIVITY_SHARE_CARD_SIZE } from "@/lib/share/activity-share-card";

function formatDistanceKm(distanceM: number): string {
  return `${(distanceM / 1000).toFixed(2)} km`;
}

function shareMessage(activity: Activity): string {
  const title = activity.type === "run" ? "Trace run" : "Trace walk";
  return `${title}\n${formatDistanceKm(activity.distanceM)} in ${formatDuration(activity.durationMs)}\nPace ${formatPace(activity.avgPaceSPerKm)}\n+${activity.newTiles} new tiles`;
}

/** Capture a mounted share card and open the system share sheet. */
export async function shareActivityCard(
  cardRef: RefObject<View | null>,
  activity: Activity,
): Promise<void> {
  const title = activity.type === "run" ? "Trace run" : "Trace walk";
  const message = shareMessage(activity);

  if (!cardRef.current) {
    await Share.share({ message, title });
    return;
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
