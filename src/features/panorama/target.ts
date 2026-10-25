import type { Memory, Point } from '@/lib/types';

export type PanoramaTarget = {
  placeName: string;
  memoryId: string;
  memoryTitle: string;
  openComments?: boolean;
  point: Point;
};

/** Uses only coordinates already present in the authorized Memory DTO. */
export function memoryPanoramaTarget(
  memory: Pick<Memory, 'id' | 'title' | 'lat' | 'lng' | 'location_name'>,
  placeName = memory.location_name,
): PanoramaTarget {
  return {
    placeName,
    memoryId: memory.id,
    memoryTitle: memory.title,
    point: { lat: memory.lat, lng: memory.lng },
  };
}
