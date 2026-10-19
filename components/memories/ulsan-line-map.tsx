'use client';

import { useMemo } from 'react';
import type { Point } from '@/lib/types';

export type UlsanLineData = {
  bbox: [number, number, number, number];
  features: Array<{
    id: string;
    properties: { kind: 'road' | 'river' | 'coast' | 'park'; name: string };
    geometry: { coordinates: [number, number][] };
  }>;
};

type Project = (point: Point, zoom: number) => { x: number; y: number };

/** A geographic SVG presentation; MapLibre still owns gestures and the camera. */
export default function UlsanLineMap({ data, view, project }: {
  data: UlsanLineData;
  view: { center: Point; zoom: number; width: number; height: number };
  project: Project;
}) {
  const paths = useMemo(() => {
    const result = { road: '', river: '', coast: '', park: '' };
    for (const feature of data.features) {
      const path = feature.geometry.coordinates.map(([lng, lat], index) => {
        const p = project({ lng, lat }, 0);
        return `${index ? 'L' : 'M'}${p.x.toFixed(8)},${p.y.toFixed(8)}`;
      }).join('');
      result[feature.properties.kind] += path + (feature.properties.kind === 'park' ? 'Z' : '');
    }
    return result;
  }, [data, project]);
  const scale = 2 ** view.zoom;
  const center = project(view.center, 0);
  const left = center.x - view.width / (2 * scale);
  const top = center.y - view.height / (2 * scale);
  const labels = [
    ['중구', 129.315, 35.575, 'district'], ['남구', 129.326, 35.523, 'district'],
    ['동구', 129.423, 35.519, 'district'], ['북구', 129.36, 35.602, 'district'],
    ['태화강', 129.337, 35.557, 'water'], ['동해', 129.463, 35.537, 'water'],
    ['울산대공원', 129.294, 35.526, 'park'],
  ] as const;
  return <svg className="ulsan-line-map" viewBox={`${left} ${top} ${view.width / scale} ${view.height / scale}`} preserveAspectRatio="none" role="img" aria-label="울산 주요 도로와 하천의 라인 지도">
    <path className="ulsan-line-parks" d={paths.park} vectorEffect="non-scaling-stroke" />
    <path className="ulsan-line-roads" d={paths.road} vectorEffect="non-scaling-stroke" />
    <path className="ulsan-line-rivers" d={paths.river} vectorEffect="non-scaling-stroke" style={{ strokeWidth: Math.min(12, Math.max(2, 2 ** (view.zoom - 10))) }} />
    <path className="ulsan-line-coast" d={paths.coast} vectorEffect="non-scaling-stroke" />
    {view.zoom >= 10 && labels.map(([name, lng, lat, kind]) => {
      const point = project({ lng, lat }, 0);
      return <text key={name} x={point.x} y={point.y} className={`ulsan-label-${kind}`} textAnchor="middle" style={{ fontSize: (kind === 'district' ? 17 : 12) / scale, letterSpacing: (kind === 'district' ? 5 : 2) / scale }}>{name}</text>;
    })}
  </svg>;
}
