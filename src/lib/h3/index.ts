import {
  cellToBoundary,
  cellToLatLng,
  getHexagonAreaAvg,
  latLngToCell,
  polygonToCells,
  UNITS,
} from "h3-js";

/** Single source of truth for tile size (~66 m edge hexagons). */
export const H3_RESOLUTION = 10;

export const AVG_CELL_AREA_KM2 = getHexagonAreaAvg(H3_RESOLUTION, UNITS.km2);

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function pointToCell(lat: number, lng: number): string {
  return latLngToCell(lat, lng, H3_RESOLUTION);
}

export function cellCenter(index: string): LatLng {
  const [lat, lng] = cellToLatLng(index);
  return { latitude: lat, longitude: lng };
}

const boundaryCache = new Map<string, LatLng[]>();
const BOUNDARY_CACHE_MAX = 6000;

/** Hex outline as react-native-maps coordinates, memoized per cell. */
export function cellPolygonCoords(index: string): LatLng[] {
  const cached = boundaryCache.get(index);
  if (cached) return cached;
  const coords = cellToBoundary(index).map(([lat, lng]) => ({
    latitude: lat,
    longitude: lng,
  }));
  if (boundaryCache.size >= BOUNDARY_CACHE_MAX) boundaryCache.clear();
  boundaryCache.set(index, coords);
  return coords;
}

export function bboxAreaKm2(box: BoundingBox): number {
  const latKm = (box.north - box.south) * 111.32;
  const midLatRad = (((box.north + box.south) / 2) * Math.PI) / 180;
  const lngKm = (box.east - box.west) * 111.32 * Math.cos(midLatRad);
  return Math.abs(latKm * lngKm);
}

export function estimateCellCount(box: BoundingBox): number {
  return Math.ceil(bboxAreaKm2(box) / AVG_CELL_AREA_KM2);
}

/**
 * All resolution-10 cells covering a bounding box.
 * Callers MUST check estimateCellCount against their budget first —
 * never call this for zoomed-out regions.
 */
export function cellsInBBox(box: BoundingBox): string[] {
  const loop: [number, number][] = [
    [box.north, box.west],
    [box.north, box.east],
    [box.south, box.east],
    [box.south, box.west],
  ];
  return polygonToCells(loop, H3_RESOLUTION);
}
