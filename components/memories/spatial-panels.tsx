'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight, Eye, LoaderCircle, MapPin, X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent, type CSSProperties } from 'react';
import { emotions, formatDate, type Memory, type PlaceMemoryGroup } from '@/lib/types';

export function SpatialPlacePreview({
  anchor, group, loading, error, openingMemoryId, onClose, onOpenMemory,
  onOpenPlace, onRetry,
}: {
  anchor: Memory;
  group: PlaceMemoryGroup | null;
  loading: boolean;
  error: boolean;
  openingMemoryId: string | null;
  onClose: () => void;
  onOpenMemory: (id: string) => void;
  onOpenPlace: () => void;
  onRetry: () => void;
}) {
  const first = group?.memories.find((item) => item.id === anchor.id) ?? group?.memories[0];
  const title = first?.title ?? anchor.title;
  const preview = first?.contentPreview ?? anchor.content;
  const photo = first?.firstImageUrl ?? anchor.media[0]?.url;
  const date = first?.memoryDate ?? anchor.memory_date;
  const emotion = first?.emotion ?? anchor.emotion;
  const count = group?.memoryCount ?? 1;
  return (
    <aside className="spatial-context spatial-surface atlas-contact-sheet" aria-label="장소의 기억 미리보기" style={{ '--scene-color': emotions[emotion].color } as CSSProperties}>
      <span className="spatial-context-handle" aria-hidden="true" />
      <div className="spatial-context-topline">
        <span className="spatial-eyebrow">이곳에 겹쳐진 시간</span>
        <button className="spatial-round-close" type="button" onClick={onClose} aria-label="미리보기 닫기"><X size={16} /></button>
      </div>
      <div className="spatial-context-location"><MapPin size={17} /><strong>{group?.placeName || anchor.location_name}</strong><small>기억 {count}개</small></div>
      <button className={`spatial-context-story ${photo ? '' : 'without-photo'}`} type="button" onClick={() => onOpenMemory(first?.id ?? anchor.id)} disabled={Boolean(openingMemoryId)} aria-label="선택한 기억 자세히 읽기">
        {photo && <Image src={photo} alt={`${title}의 기억 사진`} width={120} height={112} unoptimized />}
        <span className="spatial-context-copy"><small>{formatDate(date)} · {emotions[emotion].label}</small><strong>{title}</strong><span>{preview}</span></span>
        <ArrowRight size={16} aria-hidden="true" />
      </button>
      {error && <p className="spatial-context-status">주변 기억을 불러오지 못했어요. <button type="button" onClick={onRetry}>다시 시도</button></p>}
      {loading && <p className="spatial-context-status">주변의 기억을 찾고 있어요…</p>}
      <button className="spatial-context-all" type="button" onClick={onOpenPlace}>이 장소의 다른 기억 보기 <ArrowRight size={14} /></button>
    </aside>
  );
}

export function SpatialMemoryDetail({
  memory, onClose, onBack, onOtherMemories, onLocate, onOpenPanorama,
  onPrevious, onNext, positionLabel, changing = false,
}: {
  memory: Memory;
  onClose: () => void;
  onBack: () => void;
  onOtherMemories?: () => void;
  onLocate: () => void;
  onOpenPanorama: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  positionLabel?: string;
  changing?: boolean;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLElement>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => () => { if (exitTimer.current) clearTimeout(exitTimer.current); }, []);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    heading.current?.focus({ preventScroll: true });
    return () => { if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [memory.id]);
  function leave(action: () => void) {
    if (leaving) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { action(); return; }
    setLeaving(true);
    exitTimer.current = setTimeout(action, 170);
  }
  function handleKeys(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') { event.stopPropagation(); leave(onClose); }
    if (event.key !== 'Tab') return;
    const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],[tabindex="0"]') ?? []).filter((item) => item.getClientRects().length > 0);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (!items.length) return;
    if (event.shiftKey && index <= 0) { event.preventDefault(); items[items.length - 1].focus(); }
    else if (!event.shiftKey && (index < 0 || index === items.length - 1)) { event.preventDefault(); items[0].focus(); }
  }
  return (
    <section ref={dialog} className={`spatial-detail atlas-reading-scene${onPrevious || onNext ? ' has-pagination' : ''}${leaving ? ' is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label="기억 상세" onKeyDown={handleKeys} style={{ '--scene-color': emotions[memory.emotion].color } as CSSProperties}>
      <header className="atlas-reading-toolbar">
        <button className="spatial-detail-back" type="button" onClick={() => leave(onBack)} disabled={leaving}><ArrowLeft size={17} /> 뒤로가기</button>
        <span className="spatial-eyebrow">A MEMORY, REVISITED {positionLabel && <b>{positionLabel}</b>}</span>
        <button className="spatial-detail-close" type="button" onClick={() => leave(onClose)} disabled={leaving} aria-label="기억 닫기"><X size={21} /><span>닫기</span></button>
      </header>
      <div className="spatial-detail-scroll" tabIndex={0} aria-label="기억 상세 내용">
        <div className="atlas-scene-photo-stack">
        <div className={`spatial-detail-hero ${memory.media.length ? '' : 'without-photo'}`}>
          {memory.media[0] ? <><Image src={memory.media[0].url} alt={`${memory.title}의 기억 사진 1`} width={900} height={650} unoptimized /><span className="atlas-photo-caption">{memory.location_name} · {formatDate(memory.memory_date)}</span></> : <span className="atlas-no-photo"><small>WORDS IN PLACE OF A PHOTOGRAPH</small><strong>그날의 마음은<br />글로 남아.</strong><span>사진 없이 남겨진 기억</span></span>}
        </div>
        {memory.media.length > 1 && <div className="atlas-scene-scraps" aria-hidden="true">{memory.media.slice(1,3).map((media) => <Image key={media.id} src={media.url} alt="" width={300} height={250} unoptimized />)}</div>}
        </div>
        <article className="spatial-detail-content">
          <div className="spatial-detail-meta"><span className="spatial-eyebrow">A STORY ON THE MAP</span><span className="spatial-emotion">{emotions[memory.emotion].label}</span></div>
          <p className="spatial-detail-place"><MapPin size={14} /> {memory.location_name}</p>
          <h2 ref={heading} tabIndex={-1}>{memory.title}</h2>
          <div className="spatial-detail-date"><span />{formatDate(memory.memory_date)}</div>
          <p className="spatial-detail-body">{memory.content}</p>
          {memory.media.length > 1 && <div className="spatial-detail-gallery" aria-label="기억 사진">{memory.media.slice(1).map((media, index) => <Image key={media.id} src={media.url} alt={`${memory.title}의 기억 사진 ${index + 2}`} width={700} height={500} unoptimized />)}</div>}
          <div className="spatial-detail-tools">
            <button type="button" onClick={() => leave(onLocate)}><MapPin size={16} /> 지도에서 보기</button>
            <button type="button" onClick={onOpenPanorama}><Eye size={16} /> 거리뷰</button>
          </div>
          <footer className="spatial-detail-footer"><span>{memory.owned ? '나의 기록' : memory.is_anonymous ? '익명으로 남긴 기억' : '한 사람이 남긴 기억'}</span>{onOtherMemories && <button type="button" onClick={onOtherMemories}>다른 기억 읽기 <ArrowRight size={15} /></button>}</footer>
        </article>
      </div>
      {(onPrevious || onNext) && <nav className="atlas-reading-pagination" aria-label="같은 장소의 기억 이동">
        <button type="button" onClick={onPrevious} disabled={!onPrevious || changing} aria-label="이 장소의 이전 기억"><ArrowLeft size={20} /><span>이전 기억</span></button>
        {changing ? <LoaderCircle size={18} className="spin" aria-label="기억 불러오는 중" /> : <span>{positionLabel}</span>}
        <button type="button" onClick={onNext} disabled={!onNext || changing} aria-label="이 장소의 다음 기억"><span>다음 기억</span><ArrowRight size={20} /></button>
      </nav>}
    </section>
  );
}
