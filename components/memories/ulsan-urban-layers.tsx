'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { isPagesRuntime } from '@/src/lib/runtime';
import type { Point } from '@/lib/types';

type Extent = [number, number, number, number];
type Feature = {
  id: string;
  kind: 'building' | 'street' | 'block';
  bounds: Extent;
  coordinates: [number, number][];
  use?: string;
  major?: boolean;
};
type UrbanData = {
  overview: Feature[];
  tiles: Array<{ file: string; bounds: Extent; count: number }>;
};
type Project = (point: Point, zoom: number) => { x: number; y: number };
type View = { center: Point; zoom: number; width: number; height: number };
const revision = 'buildings-v1';

function asset(file: string) {
  const path = `maps/ulsan-urban/${file}?v=${revision}`;
  return isPagesRuntime() ? new URL(path, document.baseURI).href : `/${path}`;
}

function paths(features: Feature[], project: Project) {
  const result = { block: '', industrial: '', building: '', street: '', artery: '' };
  for (const feature of features) {
    const kind = feature.kind === 'block' && feature.use === 'industrial' ? 'industrial'
      : feature.kind === 'street' && feature.major ? 'artery' : feature.kind;
    result[kind] += feature.coordinates.map(([lng, lat], index) => {
      const p = project({ lng, lat }, 0);
      return `${index ? 'L' : 'M'}${p.x.toFixed(8)},${p.y.toFixed(8)}`;
    }).join('') + (feature.kind === 'street' ? '' : 'Z');
  }
  return result;
}

/** Same-origin geographic data only. Never requests tiles or external APIs. */
export default function UlsanUrbanLayers({ view, project, unitsPerPixel }: { view: View; project: Project; unitsPerPixel: number }) {
  const [data, setData] = useState<UrbanData | null>(null);
  const [details, setDetails] = useState<{ key: string; features: Feature[] } | null>(null);
  const cache = useRef(new Map<string, Feature[]>());
  useEffect(() => {
    const controller = new AbortController();
    fetch(asset('overview.json'), { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Urban map unavailable');
      return response.json() as Promise<UrbanData>;
    }).then(value => { if (!controller.signal.aborted) setData(value); }).catch(() => {
      // The original line map, markers, gestures and raster fallback stay usable.
    });
    return () => controller.abort();
  }, []);

  const center = project(view.center, 0);
  const halfWidth = view.width * unitsPerPixel / 2;
  const halfHeight = view.height * unitsPerPixel / 2;
  const files = (view.zoom >= 13 ? data?.tiles ?? [] : []).filter(tile => {
    const nw = project({ lng: tile.bounds[0], lat: tile.bounds[3] }, 0);
    const se = project({ lng: tile.bounds[2], lat: tile.bounds[1] }, 0);
    return nw.x <= center.x + halfWidth && se.x >= center.x - halfWidth &&
      nw.y <= center.y + halfHeight && se.y >= center.y - halfHeight;
  }).map(tile => tile.file).filter(file => /^\d+-\d+\.json$/.test(file)).sort();
  const key = files.join(',');

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    // Wait for a brief pause in camera movement. Only intersecting static cells
    // are requested, with no neighbor prefetch or offline download.
    const timer = window.setTimeout(async () => {
      try {
        const selected = key.split(',');
        const features: Feature[] = [];
        for (let i = 0; i < selected.length; i += 4) {
          const batch = await Promise.all(selected.slice(i, i + 4).map(async file => {
            const saved = cache.current.get(file);
            if (saved) return saved;
            const response = await fetch(asset(file), { signal: controller.signal });
            if (!response.ok) throw new Error('Building cell unavailable');
            const items = await response.json() as Feature[];
            if (controller.signal.aborted) throw new Error('Aborted');
            cache.current.set(file, items);
            return items;
          }));
          features.push(...batch.flat());
        }
        if (!controller.signal.aborted) {
          // A footprint crossing a cell edge is rendered once, without clipping.
          setDetails({ key, features: [...new Map(features.map(item => [item.id, item])).values()] });
          for (const file of cache.current.keys()) {
            if (cache.current.size <= 24) break;
            if (!selected.includes(file)) cache.current.delete(file);
          }
        }
      } catch {
        // Keep overview buildings when a detailed cell is unavailable.
      }
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [key]);

  const overview = useMemo(() => data ? { ...paths(data.overview, project), buildingCount: data.overview.filter(f => f.kind === 'building').length } : null, [data, project]);
  const detailPaths = useMemo(() => details ? paths(details.features, project).building : '', [details, project]);
  const hasDetails = Boolean(key && details?.key === key);
  if (!overview) return null;
  return <g className="ulsan-urban-layers" data-building-level={hasDetails ? 'footprints' : 'overview'} data-building-count={hasDetails ? details!.features.length : overview.buildingCount}>
    <path className="ulsan-urban-blocks" d={overview.block} />
    <path className="ulsan-urban-industry" d={overview.industrial} />
    <path className="ulsan-urban-buildings" d={hasDetails ? detailPaths : overview.building} />
    <path className="ulsan-urban-street-cut" d={overview.street} />
    <path className="ulsan-urban-artery-cut" d={overview.artery} />
    <path className="ulsan-urban-streets" d={overview.street} style={{ opacity: Math.min(.6, Math.max(.16, (view.zoom - 10) * .12)) }} />
    <path className="ulsan-urban-arteries" d={overview.artery} />
  </g>;
}
