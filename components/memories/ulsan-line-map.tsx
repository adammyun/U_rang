'use client';

import { useCallback, useMemo, type CSSProperties } from 'react';
import type { Point } from '@/lib/types';
import UlsanUrbanLayers from './ulsan-urban-layers';
import { DEFAULT_MAP_CENTER } from '@/src/features/map/constants';

const DRAWING_SCALE = 2 ** 12;

export type UlsanLineData = {
  bbox: [number, number, number, number];
  features: Array<{
    id: string;
    properties: { kind: 'road' | 'river' | 'coast' | 'park' | 'boundary' | 'cityBoundary'; name: string };
    geometry: { coordinates: [number, number][] };
  }>;
  areas?: Array<{ name: string; coordinates: [number, number][][] }>;
  labels?: Array<{ name: string; lng: number; lat: number; kind: 'district' | 'neighborhood' | 'city' | 'road'; minZoom: number }>;
};

type Project = (point: Point, zoom: number) => { x: number; y: number };

/** A geographic SVG presentation; MapLibre still owns gestures and the camera. */
export default function UlsanLineMap({ data, view, project, obstacles = [], reserveIntroSpace = false }: {
  data: UlsanLineData;
  view: { center: Point; zoom: number; width: number; height: number };
  project: Project;
  obstacles?: Point[];
  reserveIntroSpace?: boolean;
}) {
  // Use city-local coordinates with a sensible viewBox size. WebKit stops
  // painting paths when a global zoom-0 viewBox becomes a tiny fraction of 1.
  // Only drawing units change: MapLibre and memory geographic anchors do not.
  const drawingProject = useCallback((point: Point, zoom: number) => {
    const absolute = project(point, zoom);
    const origin = project(DEFAULT_MAP_CENTER, zoom);
    return { x: (absolute.x - origin.x) * DRAWING_SCALE, y: (absolute.y - origin.y) * DRAWING_SCALE };
  }, [project]);
  const paths = useMemo(() => {
    const result = { road: '', river: '', coast: '', park: '', boundary: '', cityBoundary: '' };
    for (const feature of data.features) {
      const path = feature.geometry.coordinates.map(([lng, lat], index) => {
        const p = drawingProject({ lng, lat }, 0);
        return `${index ? 'L' : 'M'}${p.x.toFixed(8)},${p.y.toFixed(8)}`;
      }).join('');
      result[feature.properties.kind] += path + (feature.properties.kind === 'park' ? 'Z' : '');
    }
    return result;
  }, [data, drawingProject]);
  const areas = useMemo(() => (data.areas ?? []).map((area) => ({
    name: area.name,
    path: area.coordinates.map((ring) => ring.map(([lng, lat], i) => {
      const p = drawingProject({ lng, lat }, 0);
      return `${i ? 'L' : 'M'}${p.x.toFixed(8)},${p.y.toFixed(8)}`;
    }).join('') + 'Z').join(''),
  })), [data, drawingProject]);
  // Keep the existing Safari-safe screen-pixel stroke correction in local units.
  const scale = 2 ** view.zoom / DRAWING_SCALE;
  const center = drawingProject(view.center, 0);
  const left = center.x - view.width / (2 * scale);
  const top = center.y - view.height / (2 * scale);
  const labels = [
    ...(data.labels ?? []),
    { name: '태화강', lng: 129.337, lat: 35.557, kind: 'water', minZoom: 10 },
    { name: '동해', lng: 129.463, lat: 35.537, kind: 'water', minZoom: 10 },
    { name: '울산대공원', lng: 129.294, lat: 35.526, kind: 'park', minZoom: 11.5 },
  ];
  const occupied: Array<{ x: number; y: number; width: number }> = [];
  const memoryPoints = obstacles.map((p) => drawingProject(p, 0));
  const placed = labels.flatMap((label) => {
    if (view.zoom < label.minZoom) return [];
    const point = drawingProject(label, 0);
    const fontSize = label.kind === 'district' ? 16 : label.kind === 'city' ? 14 : 11;
    const width = label.name.length * fontSize + 12;
    const x = (point.x - left) * scale;
    const y = (point.y - top) * scale;
    // Cartographic label placement never changes memory coordinates.
    const dy = [0, -30, 30, -55].find((offset) => {
      const yy = y + offset;
      if (x < width / 2 || x > view.width - width / 2 || yy < 90 || yy > view.height - 100) return false;
      const behindIntro = view.width <= 700 ? yy > 70 && yy < 250 : yy > view.height - 520 && yy < view.height - 170;
      if (reserveIntroSpace && x < Math.min(300, view.width * .6) && behindIntro) return false;
      if (occupied.some((other) => Math.abs(x - other.x) < (width + other.width) / 2 + 10 && Math.abs(yy - other.y) < 24)) return false;
      return !memoryPoints.some((p) => Math.abs(x - (p.x - left) * scale) < width / 2 + 48 && Math.abs(yy - (p.y - top) * scale) < 63);
    });
    if (dy === undefined) return [];
    occupied.push({ x, y: y + dy, width });
    return [{ ...label, x: point.x, y: point.y + dy / scale, fontSize }];
  });
  return <svg className="ulsan-line-map" style={{ '--ulsan-stroke-unit': 1 / scale } as CSSProperties} viewBox={`${left} ${top} ${view.width / scale} ${view.height / scale}`} preserveAspectRatio="none" role="img" aria-label="울산 주요 도로와 하천의 라인 지도">
    {areas.map((area, index) => <path key={area.name} className={`ulsan-district-area district-tone-${index % 3}`} d={area.path} data-district={area.name} fillRule="evenodd" />)}
    <UlsanUrbanLayers view={view} project={drawingProject} unitsPerPixel={1 / scale} />
    <path className="ulsan-line-parks" d={paths.park} />
    <path className="ulsan-line-roads" d={paths.road} />
    <path className="ulsan-line-rivers" d={paths.river} style={{ strokeWidth: Math.min(12, Math.max(2, 2 ** (view.zoom - 10))) / scale }} />
    <path className="ulsan-line-coast" d={paths.coast} />
    <path className="ulsan-line-boundary" d={paths.boundary} />
    <path className="ulsan-line-city-boundary" d={paths.cityBoundary} />
    {placed.map((label) => <text key={`${label.kind}:${label.name}`} x={label.x} y={label.y} className={`ulsan-label-${label.kind}`} textAnchor="middle" style={{ fontSize: label.fontSize / scale, letterSpacing: .5 / scale }}>{label.name}</text>)}
  </svg>;
}
