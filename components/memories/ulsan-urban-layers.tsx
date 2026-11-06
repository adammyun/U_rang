'use client';

import { useEffect, useMemo, useState } from 'react';
import { isPagesRuntime } from '@/src/lib/runtime';
import type { Point } from '@/lib/types';
import {urbanPaths,buildingPaths,mergeBuildingPaths,type UrbanShape,type UrbanFeature,type BuildingPath} from '@/src/features/map/urban-geometry';

type Extent = [number, number, number, number];
type UrbanData = {
  overview: UrbanShape[];
  tiles: Array<{ file: string; bounds: Extent; count: number }>;
};
type Project = (point: Point, zoom: number) => { x: number; y: number };
type View = { center: Point; zoom: number; width: number; height: number };
const revision = 'buildings-v1';

function asset(file: string) {
  const path = `maps/ulsan-urban/${file}?v=${file==='overview.json'?'overview-v2':revision}`;
  return isPagesRuntime() ? new URL(path, document.baseURI).href : `/${path}`;
}

/** Same-origin geographic data only. Never requests tiles or external APIs. */
export default function UlsanUrbanLayers({ view, project, unitsPerPixel }: { view: View; project: Project; unitsPerPixel: number }) {
  const [data, setData] = useState<UrbanData | null>(null);
  const [details, setDetails] = useState<{ key:string;path:string;count:number;project:Project } | null>(null);
  const cache = useMemo(()=>new Map<string,BuildingPath[]>(),[project]);
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
        const features: BuildingPath[] = [];
        for (let i = 0; i < selected.length; i += 4) {
          const batch = await Promise.all(selected.slice(i, i + 4).map(async file => {
            const saved = cache.get(file);
            if (saved) return saved;
            const response = await fetch(asset(file), { signal: controller.signal });
            if (!response.ok) throw new Error('Building cell unavailable');
            const items = await response.json() as UrbanFeature[];
            if (controller.signal.aborted) throw new Error('Aborted');
            const compiled=buildingPaths(items,project);
            cache.set(file,compiled);
            return compiled;
          }));
          features.push(...batch.flat());
        }
        if (!controller.signal.aborted) {
          // A footprint crossing a cell edge is rendered once, without clipping.
          setDetails({key,...mergeBuildingPaths(features),project});
          for (const file of cache.keys()) {
            if (cache.size <= 24) break;
            if (!selected.includes(file)) cache.delete(file);
          }
        }
      } catch {
        // Keep overview buildings when a detailed cell is unavailable.
      }
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [key,project,cache]);

  const overview = useMemo(() => data ? { ...urbanPaths(data.overview, project), buildingCount: data.overview.filter(f => f.kind === 'building').length } : null, [data, project]);
  const hasDetails = Boolean(key && details?.key === key && details.project===project);
  if (!overview) return null;
  return <g className="ulsan-urban-layers" data-building-level={hasDetails ? 'footprints' : 'overview'} data-building-count={hasDetails ? details!.count : overview.buildingCount}>
    <path className="ulsan-urban-blocks" d={overview.block} />
    <path className="ulsan-urban-industry" d={overview.industrial} />
    <path className="ulsan-urban-buildings" d={hasDetails ? details!.path : overview.building} />
    <path className="ulsan-urban-street-cut" d={overview.street} />
    <path className="ulsan-urban-artery-cut" d={overview.artery} />
    <path className="ulsan-urban-streets" d={overview.street} style={{ opacity: Math.min(.6, Math.max(.16, (view.zoom - 10) * .12)) }} />
    <path className="ulsan-urban-arteries" d={overview.artery} />
  </g>;
}
