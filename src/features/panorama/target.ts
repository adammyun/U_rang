import type { Memory, Point } from '@/lib/types';

export type PanoramaTarget = {
  placeName: string;
  memoryId: string;
  memoryTitle: string;
  point: Point;
};

/** Uses only coordinates already present in the authorized Memory DTO. */
export function memoryPanoramaTarget(
  memory: Pick<Memory, 'id' | 'title' | 'lat' | 'lng' | 'location_name' | 'location_precision'>,
  placeName = memory.location_name,
): PanoramaTarget {
  return {
    placeName,
    memoryId: memory.id,
    memoryTitle: memory.title,
    // Approximate memories use the same public grid even for their owner.
    // A stored scene ID must not silently encode the owner's exact DB location.
    point: memory.location_precision==='approximate'
      ? {lat:Math.round(memory.lat*100)/100,lng:Math.round(memory.lng*100)/100}
      : { lat: memory.lat, lng: memory.lng },
  };
}
