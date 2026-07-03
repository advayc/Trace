import { memo } from "react";
import { Polygon } from "react-native-maps";

import { heatColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { FriendTile } from "@/lib/friends/friends-service";
import { cellPolygonCoords } from "@/lib/h3";
import type { StompedTile } from "@/lib/storage/tile-db";

interface FogHexLayerProps {
  cells: string[];
}

/** Charcoal fog hexes over unexplored viewport cells. */
export const FogHexLayer = memo(function FogHexLayer({
  cells,
}: FogHexLayerProps) {
  const { mapPalette } = useTheme();

  return (
    <>
      {cells.map((index) => (
        <Polygon
          key={index}
          coordinates={cellPolygonCoords(index)}
          fillColor={mapPalette.fogFill}
          strokeColor={mapPalette.fogStroke}
          strokeWidth={0.5}
        />
      ))}
    </>
  );
});

interface RevealedHexLayerProps {
  tiles: StompedTile[];
}

function withOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${alpha}`;
}

/** Warm ember hexes for stomped tiles; repeat visits deepen toward red-orange. */
export const RevealedHexLayer = memo(function RevealedHexLayer({
  tiles,
}: RevealedHexLayerProps) {
  const { mapPalette, heatStops } = useTheme();

  return (
    <>
      {tiles.map((tile) => (
        <Polygon
          key={tile.h3Index}
          coordinates={cellPolygonCoords(tile.h3Index)}
          fillColor={withOpacity(
            heatColor(tile.visitCount, heatStops),
            mapPalette.revealedOpacity,
          )}
          strokeColor={mapPalette.revealedStroke}
          strokeWidth={0.5}
        />
      ))}
    </>
  );
});

interface FriendHexLayerProps {
  tiles: FriendTile[];
  colorByUserId: Record<string, string>;
}

export const FriendHexLayer = memo(function FriendHexLayer({
  tiles,
  colorByUserId,
}: FriendHexLayerProps) {
  return (
    <>
      {tiles.map((tile) => (
        <Polygon
          key={`${tile.userId}:${tile.h3Index}`}
          coordinates={cellPolygonCoords(tile.h3Index)}
          fillColor={colorByUserId[tile.userId] ?? "rgba(110,231,183,0.24)"}
          strokeColor="rgba(255,255,255,0.05)"
          strokeWidth={0.45}
        />
      ))}
    </>
  );
});
