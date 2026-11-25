'use client';

import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { emotions, type Memory } from '@/lib/types';

type StampDetail = 'dot' | 'note' | 'photo';
const STAMP_MOTION_MS = 200;

function StampPaper({ memory, count, detail, leaving, onExit }: {
  memory: Memory;
  count: number;
  detail: Exclude<StampDetail, 'dot'>;
  leaving: boolean;
  onExit: () => void;
}) {
  const compact = detail === 'note';
  const photo = compact ? undefined : memory.media[0];
  return (
    <span
      className={`atlas-stamp-visual${leaving ? ' is-leaving' : ''}`}
      data-stamp-visual={detail}
      aria-hidden="true"
      onAnimationEnd={leaving ? event => {
        if (event.target === event.currentTarget && event.animationName === 'atlas-stamp-disappear') onExit();
      } : undefined}
    >
      {!compact && count > 1 && <span className="atlas-stamp-stack" />}
      <span className="atlas-stamp-face">
        {photo && <Image src={photo.url} alt="" width={120} height={76} loading="lazy" unoptimized draggable={false} />}
        <span className="atlas-stamp-note">
          <span className="atlas-stamp-title">{memory.title}</span>
          {compact ? (
            memory.media.length > 0 && <ImageIcon className="atlas-stamp-photo-icon" aria-hidden="true" />
          ) : (
            <span className="atlas-stamp-meta">
              <span>{emotions[memory.emotion].label}</span>
              <span>{memory.memory_date?.slice(5).replace('-', '.') ?? '어느 날'}</span>
            </span>
          )}
        </span>
      </span>
      {count > 1 && <span className="atlas-stamp-count">{count}</span>}
      {!compact && <span className="atlas-stamp-pin" />}
    </span>
  );
}

/** Presentation only: coordinates, grouping and access policy stay in MemoryMap. */
export default function MemoryStamp({ memory, detail, count, selected, grouped, x, y, onSelect, memberIds, dailyTrace=false, hovered=false, onHover }: {
  memory: Memory;
  detail: StampDetail;
  dailyTrace?: boolean;
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
  const [visual, setVisual] = useState<{ detail: StampDetail; leaving: StampDetail | null }>({ detail, leaving: null });
  // Keep the outgoing paper just long enough to fade over the incoming marker.
  if (visual.detail !== detail) setVisual({ detail, leaving: visual.detail === 'dot' ? null : visual.detail });
  useEffect(() => {
    if (!visual.leaving) return;
    // Remove the outgoing paper on animationend. A clock starting at render
    // can expire before the first painted frame during a busy map update.
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => {
      setVisual(current => current === visual ? { detail: current.detail, leaving: null } : current);
    }, reducedMotion ? 0 : STAMP_MOTION_MS + 1000);
    return () => window.clearTimeout(timeout);
  }, [visual]);
  const hasPaper = detail !== 'dot' || visual.leaving;
  const tilt = hasPaper ? Array.from(memory.id).reduce((sum, char) => sum + char.charCodeAt(0), 0) : 0;
  const papers = [visual.leaving, detail].filter((paper): paper is 'note' | 'photo' => paper === 'note' || paper === 'photo');
  return (
    <button
      type="button"
      className={`raster-memory-marker atlas-stamp${count>1?' is-stack':''}${hovered?' is-linked-hover':''}${selected ? ' selected' : grouped ? ' grouped' : ''}`}
      style={{ left: x, top: y, '--stamp-tilt': `${count > 1 ? (tilt % 5) - 2 : (tilt % 11) - 5}deg`, '--stamp-color': emotion.color, '--stamp-motion': `${STAMP_MOTION_MS}ms` } as CSSProperties}
      aria-label={count > 1 ? `${memory.location_name}의 기억 ${count}개` : memory.title}
      aria-description={detail !== 'dot' && memory.media.length > 0 ? '사진 있음' : undefined}
      aria-pressed={selected || grouped}
      data-daily-trace={dailyTrace && detail === 'dot' ? 'true' : undefined}
      data-marker-detail={detail}
      data-memory-count={count}
      data-memory-ids={memberIds.join(' ')}
      onMouseEnter={()=>onHover?.(memory.id)} onMouseLeave={()=>onHover?.(null)} onFocus={()=>onHover?.(memory.id)} onBlur={()=>onHover?.(null)}
      onClick={onSelect}
    >
      {dailyTrace && detail === 'dot' && <span className="atlas-daily-glow" aria-hidden="true" />}
      {papers.map(paper => (
        <StampPaper key={paper} detail={paper} leaving={paper !== detail} memory={memory} count={count} onExit={() => {
          setVisual(current => current === visual ? { detail: current.detail, leaving: null } : current);
        }} />
      ))}
    </button>
  );
}
