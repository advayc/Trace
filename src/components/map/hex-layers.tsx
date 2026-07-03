import { memo } from "react";
import { Polygon } from "react-native-maps";

import { heatColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
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
  const { mapPalette } = useTheme();

  return (
    <>
      {tiles.map((tile) => (
        <Polygon
          key={tile.h3Index}
          coordinates={cellPolygonCoords(tile.h3Index)}
          fillColor={withOpacity(
            heatColor(tile.visitCount),
            mapPalette.revealedOpacity,
          )}
          strokeColor={mapPalette.revealedStroke}
          strokeWidth={0.5}
        />
      ))}
    </>
  );
});
