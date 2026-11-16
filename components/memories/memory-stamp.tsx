'use client';

import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import type { CSSProperties } from 'react';
import { emotions, type Memory } from '@/lib/types';

/** Presentation only: coordinates, grouping and access policy stay in MemoryMap. */
export default function MemoryStamp({ memory, detail, count, selected, grouped, x, y, onSelect, memberIds, hovered=false, onHover }: {
  memory: Memory;
  detail: 'dot' | 'note' | 'photo';
  memberIds:string[];
  hovered?:boolean;
  onHover?:(id:string|null)=>void;
  count: number;
  selected: boolean;
  grouped: boolean;
  x: number;
  y: number;
  onSelect: () => void;
}) {
  const emotion = emotions[memory.emotion];
  const isDot = detail === 'dot';
  const photo = detail === 'photo' ? memory.media[0] : undefined;
  const hasPhoto = memory.media.length > 0;
  const tilt = isDot ? undefined : Array.from(memory.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (
    <button
      type="button"
      className={`raster-memory-marker atlas-stamp ${photo ? 'has-photo' : 'is-note'}${count>1?' is-stack':''}${hovered?' is-linked-hover':''}${selected ? ' selected' : grouped ? ' grouped' : ''}`}
      style={{ left: x, top: y, '--stamp-tilt': tilt === undefined ? undefined : `${count > 1 ? (tilt % 5) - 2 : (tilt % 11) - 5}deg`, '--stamp-color': emotion.color } as CSSProperties}
      aria-label={count > 1 ? `${memory.location_name}의 기억 ${count}개` : memory.title}
      aria-description={!isDot && hasPhoto ? '사진 있음' : undefined}
      aria-pressed={selected || grouped}
      data-marker-detail={detail}
      data-memory-count={count}
      data-memory-ids={memberIds.join(' ')}
      onMouseEnter={()=>onHover?.(memory.id)} onMouseLeave={()=>onHover?.(null)} onFocus={()=>onHover?.(memory.id)} onBlur={()=>onHover?.(null)}
      onClick={onSelect}
    >
      {!isDot && <>
        {count > 1 && <span className="atlas-stamp-stack" aria-hidden="true" />}
        <span className="atlas-stamp-face">
          {photo && <Image src={photo.url} alt="" width={100} height={100} loading="lazy" unoptimized draggable={false} />}
          <span className="atlas-stamp-note">
            <span className="atlas-stamp-title">{memory.title}</span>
            {!photo && <>
              <span className="atlas-stamp-date">{memory.memory_date?.slice(5).replace('-', '.') ?? '어느 날'}</span>
              <span className="atlas-stamp-feeling">{emotion.label}</span>
              {hasPhoto && <ImageIcon className="atlas-stamp-photo-icon" aria-hidden="true" />}
            </>}
          </span>
        </span>
        {count > 1 && <span className="atlas-stamp-count" aria-hidden="true">{count}</span>}
        <span className="atlas-stamp-pin" aria-hidden="true" />
      </>}
    </button>
  );
}
