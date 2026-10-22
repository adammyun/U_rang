import type { Point } from '@/lib/types';

export const DEFAULT_MAP_CENTER: Point = {
  lng: 129.3114,
  lat: 35.5384,
};

export const DEFAULT_MAP_ZOOM = 11.4;

export const SEARCH_RESULT_ZOOM = 14.2;

// Local cartography covers this Ulsan urban extent. Apply the same camera
// constraints to every style, including programmatic flights and gestures.
export const ULSAN_MAP_BOUNDS: [[number, number], [number, number]] = [
  [129.17, 35.44],
  [129.46, 35.66],
];
export const MIN_MAP_ZOOM = 10;
export const MAX_MAP_ZOOM = 17;
export function isInUlsanMap(point: Point): boolean {
  return point.lng >= ULSAN_MAP_BOUNDS[0][0] && point.lng <= ULSAN_MAP_BOUNDS[1][0]
    && point.lat >= ULSAN_MAP_BOUNDS[0][1] && point.lat <= ULSAN_MAP_BOUNDS[1][1];
}
