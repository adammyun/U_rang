'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { emotions, type Memory } from '@/lib/types';

/** Presentation only: coordinates, grouping and access policy stay in MemoryMap. */
export default function MemoryStamp({ memory, count, selected, grouped, x, y, onSelect }: {
  memory: Memory;
  count: number;
  selected: boolean;
  grouped: boolean;
  x: number;
  y: number;
  onSelect: () => void;
}) {
  const hash = Array.from(memory.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const photo = memory.media[0];
  return (
    <button
      type="button"
      className={`raster-memory-marker atlas-stamp ${photo ? 'has-photo' : 'is-note'}${selected ? ' selected' : grouped ? ' grouped' : ''}`}
      style={{ left: x, top: y, '--stamp-tilt': `${(hash % 11) - 5}deg`, '--stamp-color': emotions[memory.emotion].color } as CSSProperties}
      aria-label={count > 1 ? `${memory.location_name}의 기억 ${count}개` : memory.title}
      aria-pressed={selected || grouped}
      data-memory-count={count}
      onClick={onSelect}
    >
      {count > 1 && <span className="atlas-stamp-stack" aria-hidden="true" />}
      <span className="atlas-stamp-face">
        {photo ? <Image src={photo.url} alt="" width={100} height={100} unoptimized draggable={false} /> : (
          <span className="atlas-stamp-note">
            <span className="atlas-stamp-date">{memory.memory_date?.slice(5).replace('-', '.') ?? '어느 날'}</span>
            <span className="atlas-stamp-title">{memory.title}</span>
            <span className="atlas-stamp-feeling">{emotions[memory.emotion].label}</span>
          </span>
        )}
        {photo && <span className="atlas-stamp-caption">{memory.location_name}</span>}
      </span>
      {count > 1 && <span className="atlas-stamp-count" aria-hidden="true">{count}</span>}
      <span className="atlas-stamp-pin" aria-hidden="true" />
    </button>
  );
}
