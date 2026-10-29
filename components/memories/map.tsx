'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Map as LibreMap,
  setWorkerUrl,
  type Map as MapType,
} from 'maplibre-gl';
import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Bounds, Memory, Point } from '@/lib/types';
import { emotions } from '@/lib/types';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  ULSAN_MAP_BOUNDS,
  MIN_MAP_ZOOM,
  MAX_MAP_ZOOM,
} from '@/src/features/map/constants';
import { isPagesRuntime } from '@/src/lib/runtime';
import MemoryStamp from './memory-stamp';
import { groupMapMarkers } from '@/src/features/map/marker-groups';
import {PLACE_STORIES,isStoryZoom} from '@/src/features/stories/catalog';
import StoryGlyph from '@/components/stories/story-glyph';
import type { MapMode } from '@/src/features/map/appearance';
import UlsanLineMap, { type UlsanLineData } from './ulsan-line-map';

setWorkerUrl(mapLibreWorkerUrl);
const MAP_TILE_SOURCE_REVISION = 'osm-standard-v1';
const MAPLIBRE_WORLD_TILE_SIZE = 512;
const RASTER_TILE_SIZE = 256;

export type MapHandle = {
  flyTo: (point: Point, zoom?: number) => void;
  center: () => Point;
  zoom: (delta: number) => void;
};

const VIEWPORT_QUERY_PADDING = 0.3;

type ViewState = {
  center: Point;
  zoom: number;
  width: number;
  height: number;
};

function project(
  point: Point,
  zoom: number,
  tileSize = MAPLIBRE_WORLD_TILE_SIZE,
) {
  const size = tileSize * 2 ** zoom;
  const sin = Math.sin((Math.max(-85, Math.min(85, point.lat)) * Math.PI) / 180);
  return {
    x: ((point.lng + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size,
  };
}

function expandBounds(bounds: Bounds, padding = VIEWPORT_QUERY_PADDING): Bounds {
  const longitudePadding = (bounds.east - bounds.west) * padding;
  const latitudePadding = (bounds.north - bounds.south) * padding;
  return {
    west: Math.max(-180, bounds.west - longitudePadding),
    south: Math.max(-85, bounds.south - latitudePadding),
    east: Math.min(180, bounds.east + longitudePadding),
    north: Math.min(85, bounds.north + latitudePadding),
  };
}
export default function MemoryMap({
  memories,
  mode,
  onBounds,
  onSelect,
  onCreate,
  draftPoint,
  currentLocation,
  highlightedIds,
  selectedMemoryId,
  mapRef,
  presentation = 'trace',
  reserveIntroSpace = false,
  hideMemories = false,
  hideStories = false,
  discoveredStoryIds = [],
  onStory,
}: {
  memories: Memory[];
  mode: MapMode;
  onBounds: (bounds: Bounds) => void;
  onSelect: (memory: Memory) => void;
  onCreate: (point: Point) => void;
  draftPoint: Point | null;
  currentLocation?: Point | null;
  highlightedIds: string[];
  selectedMemoryId: string | null;
  mapRef: React.RefObject<MapHandle | null>;
  presentation?: 'trace' | 'stamp';
  reserveIntroSpace?: boolean;
  hideMemories?: boolean;
  hideStories?:boolean;
  discoveredStoryIds?:string[];
  onStory?:(id:string)=>void;
}) {
  const container = useRef<HTMLElement>(null);
  const rasterContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapType | null>(null);
  const callbacks = useRef({ onBounds, onCreate });
  useEffect(() => {
    callbacks.current = { onBounds, onCreate };
  }, [onBounds, onCreate]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [tilesReady, setTilesReady] = useState(false);
  const [rasterCompatibilityActive, setRasterCompatibilityActive] = useState(false);
  const [lineData, setLineData] = useState<UlsanLineData | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const url = isPagesRuntime() ? new URL('maps/ulsan-lines.geojson?v=admin-v2', document.baseURI).href : '/maps/ulsan-lines.geojson?v=admin-v2';
    fetch(url, { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error('Line map unavailable');
      return response.json() as Promise<UlsanLineData>;
    }).then((data) => { if (!controller.signal.aborted) setLineData(data); }).catch(() => {
      // The existing OSM raster compatibility path remains the fallback.
    });
    return () => controller.abort();
  }, []);
  const [view, setView] = useState<ViewState>({
    center: DEFAULT_MAP_CENTER,
    zoom: DEFAULT_MAP_ZOOM,
    width: 0,
    height: 0,
  });
  // Keep this size sync independent from MapLibre's load lifecycle. Some
  // embedded browsers cannot finish WebGL initialization; the raster layer
  // still needs a real viewport so the map never collapses to a blank panel.
  useEffect(() => {
    const node = rasterContainer.current;
    if (!node) return;
    const syncSize = () => {
      const rect = node.getBoundingClientRect();
      setView((current) => ({
        ...current,
        width: rect.width,
        height: rect.height,
      }));
    };
    syncSize();
    const ownerWindow = node.ownerDocument.defaultView;
    const ResizeObserverClass = ownerWindow?.ResizeObserver;
    const resizeObserver = ResizeObserverClass
      ? new ResizeObserverClass(syncSize)
      : null;
    resizeObserver?.observe(node);
    ownerWindow?.addEventListener('resize', syncSize);
    ownerWindow?.addEventListener('load', syncSize);
    const layoutTimers = ownerWindow
      ? [
          ownerWindow.setTimeout(syncSize, 0),
          ownerWindow.setTimeout(syncSize, 250),
        ]
      : [];
    return () => {
      resizeObserver?.disconnect();
      ownerWindow?.removeEventListener('resize', syncSize);
      ownerWindow?.removeEventListener('load', syncSize);
      layoutTimers.forEach((timer) => ownerWindow?.clearTimeout(timer));
    };
  }, []);
  useEffect(() => {
    if (!container.current) return;
    let instance: MapType;
    try {
      instance = new LibreMap({
        container: container.current,
        // The local OSM line drawing below shares this camera/projection and
        // works without WebGL painting. Detailed OSM raster remains intact.
        style: { version: 8, sources: {}, layers: [{ id: 'canvas', type: 'background', paint: { 'background-color': '#171c1b' } }] },
        center: [DEFAULT_MAP_CENTER.lng, DEFAULT_MAP_CENTER.lat],
        zoom: DEFAULT_MAP_ZOOM,
        minZoom: MIN_MAP_ZOOM,
        maxZoom: MAX_MAP_ZOOM,
        maxBounds: ULSAN_MAP_BOUNDS,
        renderWorldCopies: false,
        // The compatibility layer owns the single visible attribution link so
        // it stays readable above the mobile memory panel.
        attributionControl: false,
      });
    } catch {
      queueMicrotask(() => setError(true));
      return;
    }
    map.current = instance;
    mapRef.current = {
      flyTo: (p, zoom = 15) =>
        instance.flyTo({ center: [p.lng, p.lat], zoom: Math.max(instance.getMinZoom(), Math.min(MAX_MAP_ZOOM, zoom)), duration: 1000 }),
      center: () => ({
        lng: instance.getCenter().lng,
        lat: instance.getCenter().lat,
      }),
      zoom: (d) => instance.zoomTo(Math.max(instance.getMinZoom(), Math.min(MAX_MAP_ZOOM, instance.getZoom() + d))),
    };
    const report = () => {
      const b = instance.getBounds();
      callbacks.current.onBounds(expandBounds({
        west: Math.max(-180, b.getWest()),
        south: Math.max(-85, b.getSouth()),
        east: Math.min(180, b.getEast()),
        north: Math.min(85, b.getNorth()),
      }));
    };
    const syncView = () => {
      const center = instance.getCenter();
      const rect = instance.getContainer().getBoundingClientRect();
      setView({
        center: { lng: center.lng, lat: center.lat },
        zoom: instance.getZoom(),
        width: rect.width,
        height: rect.height,
      });
    };
    const mapContainer = instance.getContainer();
    const ownerWindow = mapContainer.ownerDocument.defaultView;
    let viewFrame: number | null = null;
    const scheduleViewSync = () => {
      if (!ownerWindow || viewFrame !== null) return;
      viewFrame = ownerWindow.requestAnimationFrame(() => {
        viewFrame = null;
        syncView();
      });
    };
    syncView();
    const ResizeObserverClass = mapContainer.ownerDocument.defaultView?.ResizeObserver;
    const resizeObserver = ResizeObserverClass
      ? new ResizeObserverClass(() => {
          instance.resize();
          scheduleViewSync();
        })
      : null;
    resizeObserver?.observe(mapContainer);
    instance.on('load', () => {
      // Memory, selection and current-location markers are rendered once by
      // the shared HTML overlay below. Keeping them out of the base style
      // guarantees identical markers in calm and detailed map modes.
      setReady(true);
      setTilesReady(instance.areTilesLoaded());
      syncView();
      report();
    });
    instance.on('move', scheduleViewSync);
    instance.on('movestart', () => {
      setTilesReady(false);
      // Some embedded/automated WebGL contexts stop painting base tiles after
      // a camera change while markers keep moving. The viewport raster layer
      // is the existing compatibility path; keep it active after navigation.
      setRasterCompatibilityActive(true);
    });
    instance.on('moveend', report);
    instance.on('error', () => setError(true));
    instance.on('idle', () => {
      setTilesReady(instance.areTilesLoaded());
      setError(false);
    });
    let suppressUntil = 0;
    let press: ReturnType<typeof setTimeout> | undefined;
    let start: { x: number; y: number } | null = null;
    const stop = () => {
      if (press) clearTimeout(press);
      press = undefined;
    };
    instance.on('touchstart', (e) => {
      if (e.points.length !== 1) return;
      start = e.points[0];
      press = setTimeout(() => {
        suppressUntil = Date.now() + 800;
        callbacks.current.onCreate({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      }, 650);
    });
    instance.on('touchmove', (e) => {
      if (
        !start ||
        !e.points[0] ||
        Math.hypot(e.points[0].x - start.x, e.points[0].y - start.y) > 8
      )
        stop();
    });
    instance.on('touchend', stop);
    instance.on('dragstart', stop);
    instance.on('contextmenu', (event) => {
      callbacks.current.onCreate({
        lng: event.lngLat.lng,
        lat: event.lngLat.lat,
      });
    });
    instance.on('click', (e) => {
      if (Date.now() < suppressUntil) return;
      callbacks.current.onCreate({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });
    return () => {
      stop();
      if (viewFrame !== null && ownerWindow) {
        ownerWindow.cancelAnimationFrame(viewFrame);
      }
      resizeObserver?.disconnect();
      mapRef.current = null;
      map.current = null;
      instance.remove();
    };
  }, [mapRef]);
  const rasterTiles = useMemo(() => {
    if (!view.width || !view.height) return [];
    // MapLibre measures the world using 512px tiles, while OSM Standard uses
    // 256px raster tiles. Advancing the raster source by one zoom level keeps
    // both modes at the exact same geographic scale and viewport.
    const rasterZoom = view.zoom + Math.log2(MAPLIBRE_WORLD_TILE_SIZE / RASTER_TILE_SIZE);
    const z = Math.max(3, Math.min(19, Math.floor(rasterZoom)));
    const scale = 2 ** (rasterZoom - z);
    const tileSize = RASTER_TILE_SIZE * scale;
    const center = project(view.center, z, RASTER_TILE_SIZE);
    const minX = Math.floor(center.x / RASTER_TILE_SIZE - view.width / (2 * tileSize)) - 1;
    const maxX = Math.ceil(center.x / RASTER_TILE_SIZE + view.width / (2 * tileSize)) + 1;
    const minY = Math.max(0, Math.floor(center.y / RASTER_TILE_SIZE - view.height / (2 * tileSize)) - 1);
    const edge = 2 ** z;
    const maxY = Math.min(edge - 1, Math.ceil(center.y / RASTER_TILE_SIZE + view.height / (2 * tileSize)) + 1);
    const tiles: Array<{ key: string; src: string; left: number; top: number; size: number }> = [];
    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        const wrappedX = ((x % edge) + edge) % edge;
        tiles.push({
          key: `${z}:${x}:${y}`,
          // Include the source revision so browsers and the edge cache cannot
          // reuse tiles left by the previous provider at the same route.
          src: isPagesRuntime()
            ? `https://tile.openstreetmap.org/${z}/${wrappedX}/${y}.png`
            : `/api/map-tiles/${z}/${wrappedX}/${y}?source=${MAP_TILE_SOURCE_REVISION}`,
          left: view.width / 2 + (x * RASTER_TILE_SIZE - center.x) * scale,
          top: view.height / 2 + (y * RASTER_TILE_SIZE - center.y) * scale,
          size: tileSize,
        });
      }
    }
    return tiles;
  }, [view]);
  const showLineArt = mode !== 'detail' && lineData && view.width > 0 && view.height > 0 &&
    view.center.lng >= lineData.bbox[0] && view.center.lng <= lineData.bbox[2] &&
    view.center.lat >= lineData.bbox[1] && view.center.lat <= lineData.bbox[3];
  const showRasterTiles = !showLineArt && (mode === 'detail' || mode === 'calm' || mode === 'dark' || error || !ready || !tilesReady || rasterCompatibilityActive);

  const worldMarkerGroups = useMemo(() => {
    const width=presentation==='stamp'?120:40,height=presentation==='stamp'?140:40;
    return groupMapMarkers(memories.map(memory=>({...project(memory,view.zoom),value:memory})),width,height)
      .map(group=>({x:group.x,y:group.y,memories:group.items,key:group.items.map(memory=>memory.id).join(':')}));
  },[memories,view.zoom,presentation]);
  const markerGroups = useMemo(() => {
    const center=project(view.center,view.zoom),edgePadding=presentation==='stamp'?160:50;
    return worldMarkerGroups.map(group=>({...group,x:view.width/2+group.x-center.x,y:view.height/2+group.y-center.y}))
      .filter(group=>group.x>=-edgePadding&&group.y>=-edgePadding&&group.x<=view.width+edgePadding&&group.y<=view.height+edgePadding);
  },[worldMarkerGroups,view,presentation]);

  const currentLocationPosition = useMemo(() => {
    if (!currentLocation || !view.width || !view.height) return null;
    const center = project(view.center, view.zoom);
    const point = project(currentLocation, view.zoom);
    const x = view.width / 2 + point.x - center.x;
    const y = view.height / 2 + point.y - center.y;
    if (x < -60 || y < -60 || x > view.width + 60 || y > view.height + 60) {
      return null;
    }
    return { x, y };
  }, [currentLocation, view]);

  const draftLocationPosition = useMemo(() => {
    if (!draftPoint || !view.width || !view.height) return null;
    const center = project(view.center, view.zoom);
    const point = project(draftPoint, view.zoom);
    const x = view.width / 2 + point.x - center.x;
    const y = view.height / 2 + point.y - center.y;
    if (x < -60 || y < -60 || x > view.width + 60 || y > view.height + 60) {
      return null;
    }
    return { x, y };
  }, [draftPoint, view]);

  const visibleMarkerGroups = hideMemories ? [] : markerGroups;
  const storyMarkers=useMemo(()=>{
    if(hideStories||hideMemories||!onStory||!isStoryZoom(view.zoom)||!view.width||!view.height)return [];
    const center=project(view.center,view.zoom);
    return PLACE_STORIES.map(story=>{const point=project(story,view.zoom);return {story,x:view.width/2+point.x-center.x,y:view.height/2+point.y-center.y};}).filter(point=>point.x>=24&&point.y>=24&&point.x<=view.width-24&&point.y<=view.height-24);
  },[hideStories,hideMemories,onStory,view]);

  return (
    <>
      <section
        ref={container}
        className="map-surface"
        aria-label="울산 기억 지도. 기억 남기기 버튼으로 장소 선택을 시작하세요."
      />
      <div
        ref={rasterContainer}
        className={`map-surface raster-map ${!showRasterTiles ? 'vector-visible' : ''} ${mode}-mode`}
        aria-label="지도 위 기억 마커"
      >
        {showLineArt && <UlsanLineMap data={lineData} view={view} project={project} obstacles={memories} reserveIntroSpace={reserveIntroSpace} />}
        {showRasterTiles && rasterTiles.map((tile) => (
          // Raster tiles are decorative; map attribution is provided by MapLibre.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            draggable={false}
            style={{
              transform: `translate3d(${tile.left}px, ${tile.top}px, 0)`,
              width: tile.size + 1,
              height: tile.size + 1,
            }}
          />
        ))}
        {visibleMarkerGroups.map((group) => {
          const memory = group.memories[0];
          const color = emotions[memory.emotion].color;
          const selected = group.memories.some((item) => item.id === selectedMemoryId);
          const grouped = group.memories.some((item) => highlightedIds.includes(item.id));
          const selectStamp = () => {
            // A visual cluster can span distinct places at low zoom. Reveal
            // those anchors before asking the existing 100m place repository.
            const spread = group.memories.some((item) => Math.hypot(
              (item.lng - memory.lng) * 111_320 * Math.cos(memory.lat * Math.PI / 180),
              (item.lat - memory.lat) * 111_320,
            ) > 100);
            if (spread && !draftPoint && mapRef.current && view.zoom < MAX_MAP_ZOOM) {
              mapRef.current.flyTo({
                lng: group.memories.reduce((sum, item) => sum + item.lng, 0) / group.memories.length,
                lat: group.memories.reduce((sum, item) => sum + item.lat, 0) / group.memories.length,
              }, Math.min(MAX_MAP_ZOOM, view.zoom + 1.8));
            } else onSelect(memory);
          };
          if (presentation === 'stamp') return (
            <MemoryStamp
              key={group.key}
              memory={memory}
              count={group.memories.length}
              selected={selected}
              grouped={grouped}
              x={group.x}
              y={group.y}
              onSelect={selectStamp}
            />
          );
          return (
            <button
              key={group.key}
              className={`raster-memory-marker${selected ? ' selected' : grouped ? ' grouped' : ''}`}
              style={{ left: group.x, top: group.y, '--marker-color': color } as React.CSSProperties}
              aria-label={group.memories.length > 1 ? `${memory.location_name}의 기억 ${group.memories.length}개` : memory.title}
              onClick={() => onSelect(memory)}
            >
              {group.memories.length > 1 ? group.memories.length : ''}
            </button>
          );
        })}
        {storyMarkers.map(({story,x,y})=><button type="button" key={'story:'+story.id} className={`map-story-mark${discoveredStoryIds.includes(story.id)?' is-discovered':''}`} style={{left:x,top:y,'--story-opacity':Math.min(.65,.4+(view.zoom-14.6)*.1)} as React.CSSProperties} aria-label={`${story.place}의 숨은 이야기`} title={`${story.place} · 숨은 이야기`} onClick={event=>{event.stopPropagation();onStory?.(story.id);}}><StoryGlyph/></button>)}
        {draftLocationPosition && (
          <span
            className="raster-draft-location"
            role="img"
            aria-label="선택한 기억 위치"
            style={{
              left: draftLocationPosition.x,
              top: draftLocationPosition.y,
            }}
          >
            <svg viewBox="0 0 32 40" aria-hidden="true" focusable="false">
              <path d="M16 38S2 24 2 16a14 14 0 1 1 28 0c0 8-14 22-14 22Z" />
              <circle cx="16" cy="16" r="5" />
            </svg>
          </span>
        )}
        {currentLocationPosition && (
          <span
            className="raster-current-location"
            role="img"
            aria-label="현재 위치"
            style={{
              left: currentLocationPosition.x,
              top: currentLocationPosition.y,
            }}
          />
        )}
      </div>
      <span className="raster-attribution">
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
          >
            © OpenStreetMap contributors
          </a>
      </span>
      {error && (
        <output className="map-error">
          지도를 불러오지 못했어요. 연결을 확인해 주세요.
        </output>
      )}
    </>
  );
}
