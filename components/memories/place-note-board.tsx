'use client';

import Image from 'next/image';
import { Eye, MapPin } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { emotions, formatDate, type Memory, type PlaceMemoryGroup, type PlaceMemoryItem } from '@/lib/types';

function anchorItem(memory: Memory): PlaceMemoryItem {
  return { id: memory.id, title: memory.title, contentPreview: memory.content, memoryDate: memory.memory_date, emotion: memory.emotion, latitude: memory.lat, longitude: memory.lng, isAnonymous: memory.is_anonymous, distanceMeters: 0, firstImageUrl: memory.media[0]?.url ?? null };
}

// Stable throughout loading/rerenders, varied on each new opening. Only paper
// backing rotates; note content and geographic memory coordinates stay level.
function noteLayout(id: string, seed: number): CSSProperties {
  let hash = seed;
  for (const letter of id) hash = Math.imul(hash ^ letter.charCodeAt(0), 16777619);
  const fraction = (salt: number) => ((Math.imul(hash ^ salt, 2246822519) >>> 0) % 1000) / 999;
  return {
    '--note-tilt': `${((fraction(11) - .5) * 4.4).toFixed(2)}deg`,
    '--note-x': `${((fraction(37) - .5) * 16).toFixed(1)}px`,
    '--note-y': `${((fraction(73) - .5) * 16).toFixed(1)}px`,
  } as CSSProperties;
}

export default function PlaceNoteBoard({ anchor, group, loading, error, openingMemoryId, onClose, onOpenMemory, onRetry, onLocate, onOpenPanorama }: {
  anchor: Memory;
  group: PlaceMemoryGroup | null;
  loading: boolean;
  error: boolean;
  openingMemoryId: string | null;
  onClose: () => void;
  onOpenMemory: (id: string) => void;
  onRetry: () => void;
  onLocate: () => void;
  onOpenPanorama: () => void;
}) {
  const [seed] = useState(() => Math.floor(Math.random() * 0x7fffffff));
  const board = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    board.current?.focus({ preventScroll: true });
    return () => { if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest('[role=dialog]')) return;
      if (event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [onClose]);
  const nearby = group?.memories ?? [];
  const notes = nearby.some(item => item.id === anchor.id) ? nearby : [anchorItem(anchor), ...nearby];
  const count = group?.memoryCount ?? notes.length;
  return <section ref={board} className="atlas-place-board" aria-label="장소의 기억 미리보기" tabIndex={-1}>
    <header className="atlas-place-board-header">
      <div><h2>{group?.placeName || anchor.location_name}</h2><p>기억 {count}개 <span>빈 지도를 누르면 돌아가요 · Esc</span></p></div>
      <nav aria-label="선택한 장소 메뉴">
        <button type="button" onClick={onLocate} aria-label="지도에서 이 장소 보기"><MapPin size={16} /><span>지도에서 보기</span></button>
        <button type="button" onClick={onOpenPanorama} aria-label="거리뷰"><Eye size={16} /><span>거리뷰</span></button>
      </nav>
    </header>
    <div className="atlas-place-board-scroll" role="region" aria-label="장소의 기억 목록" tabIndex={0}>
      <div className="atlas-place-notes" aria-busy={loading}>
        {notes.map((memory, index) => <article key={memory.id} className="atlas-place-note" style={noteLayout(memory.id, seed)}>
          <button type="button" className="atlas-place-note-open" onClick={() => onOpenMemory(memory.id)} disabled={Boolean(openingMemoryId)} aria-label={memory.id === anchor.id ? '선택한 기억 자세히 읽기' : `${memory.title} 자세히 읽기`} style={{ '--note-order': Math.min(index, 8) } as CSSProperties}>
            {memory.firstImageUrl && <Image src={memory.firstImageUrl} alt={`${memory.title}의 기억 사진`} width={450} height={280} unoptimized />}
            <div className="atlas-place-note-meta"><span style={{ color: emotions[memory.emotion].color }}>{emotions[memory.emotion].label}</span><time dateTime={memory.memoryDate ?? undefined}>{formatDate(memory.memoryDate)}</time></div>
            <h3>{memory.title}</h3>
            <p>{memory.contentPreview}</p>
            <footer><span>{memory.isAnonymous ? '익명의 기억' : '한 사람이 남긴 기억'}</span><span>{openingMemoryId === memory.id ? '여는 중…' : '읽어보기 ↗'}</span></footer>
          </button>
        </article>)}
      </div>
      {loading && <p className="atlas-place-board-status" role="status">주변의 기억을 펼치고 있어요…</p>}
      {error && <p className="atlas-place-board-status" role="alert">주변 기억을 불러오지 못했어요. 선택한 기억은 계속 읽을 수 있어요. <button type="button" onClick={onRetry}>다시 시도</button></p>}
      {group?.hasMore && <p className="atlas-place-board-status">전체 {count}개 중 이번 조회의 {group.memories.length}개를 펼쳤어요.</p>}
      {group && group.emotionSummary.length > 1 && <div className="atlas-place-board-status" aria-label="이 장소의 감정 요약">{group.emotionSummary.map(item => <span key={item.emotion}>{emotions[item.emotion].label} {item.count} </span>)}</div>}
    </div>
  </section>;
}
