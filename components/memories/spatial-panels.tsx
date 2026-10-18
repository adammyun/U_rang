'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight, Eye, MapPin, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
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
    <aside className="spatial-context spatial-surface" aria-label="장소의 기억 미리보기">
      <span className="spatial-context-handle" aria-hidden="true" />
      <div className="spatial-context-topline">
        <span className="spatial-eyebrow">A PLACE, MANY STORIES</span>
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
}: {
  memory: Memory;
  onClose: () => void;
  onBack: () => void;
  onOtherMemories?: () => void;
  onLocate: () => void;
  onOpenPanorama: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);
  return (
    <section className="spatial-detail spatial-surface" role="dialog" aria-modal="false" aria-label="기억 상세">
      <div className="spatial-detail-scroll" tabIndex={0} aria-label="기억 상세 내용">
        <div className={`spatial-detail-hero ${memory.media.length ? '' : 'without-photo'}`}>
          {memory.media[0] ? <Image src={memory.media[0].url} alt={`${memory.title}의 기억 사진 1`} width={900} height={650} unoptimized /> : <span>사진 없이 남겨진 기억</span>}
          <button className="spatial-detail-back spatial-glass" type="button" onClick={onBack}><ArrowLeft size={16} /> 뒤로가기</button>
          <button className="spatial-detail-close spatial-glass" type="button" onClick={onClose} aria-label="기억 닫기"><X size={17} /></button>
        </div>
        <article className="spatial-detail-content">
          <div className="spatial-detail-meta"><span className="spatial-eyebrow">A STORY ON THE MAP</span><span className="spatial-emotion">{emotions[memory.emotion].label}</span></div>
          <p className="spatial-detail-place"><MapPin size={14} /> {memory.location_name}</p>
          <h2 ref={heading} tabIndex={-1}>{memory.title}</h2>
          <div className="spatial-detail-date"><span />{formatDate(memory.memory_date)}</div>
          <p className="spatial-detail-body">{memory.content}</p>
          {memory.media.length > 1 && <div className="spatial-detail-gallery" aria-label="기억 사진">{memory.media.slice(1).map((media, index) => <Image key={media.id} src={media.url} alt={`${memory.title}의 기억 사진 ${index + 2}`} width={700} height={500} unoptimized />)}</div>}
          <div className="spatial-detail-tools">
            <button type="button" onClick={onLocate}><MapPin size={16} /> 지도에서 보기</button>
            <button type="button" onClick={onOpenPanorama}><Eye size={16} /> 거리뷰</button>
          </div>
          <footer className="spatial-detail-footer"><span>{memory.owned ? '나의 기록' : memory.is_anonymous ? '익명으로 남긴 기억' : '한 사람이 남긴 기억'}</span>{onOtherMemories && <button type="button" onClick={onOtherMemories}>다른 기억 읽기 <ArrowRight size={15} /></button>}</footer>
        </article>
      </div>
    </section>
  );
}
