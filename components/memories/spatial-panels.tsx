'use client';

import { AtlasHeadingLabel } from '@/components/ui/atlas-heading-label';
import { DemoPhotoCredits } from './demo-photo-credits';
import MemoryComments from './memory-comments';
import MemoryActivityBar from './memory-activity';

import Image from 'next/image';
import { ArrowLeft, ArrowRight, LoaderCircle, MapPin, Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type CSSProperties } from 'react';
import { emotions, formatDate, type Memory } from '@/lib/types';

export { default as SpatialPlacePreview } from './place-note-board';

export function SpatialMemoryDetail({
  memory, onClose, onBack, onOtherMemories, onLocate, onOpenPanorama, showComments = false,
  onPrevious, onNext, positionLabel, changing = false,
  onEdit, onDelete, deleting = false, authenticated = false,
}: {
  memory: Memory;
  onClose: () => void;
  onBack: () => void;
  onOtherMemories?: () => void;
  onLocate: () => void;
  onOpenPanorama: () => void;
  showComments?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  positionLabel?: string;
  changing?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
  authenticated?: boolean;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLElement>(null);
  const comments = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!showComments)return;
    const frame=requestAnimationFrame(()=>comments.current?.scrollIntoView({block:'start'}));
    return ()=>cancelAnimationFrame(frame);
  },[showComments]);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => () => { if (exitTimer.current) clearTimeout(exitTimer.current); }, []);
  useLayoutEffect(() => {
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
    const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),textarea:not(:disabled),input:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]') ?? []).filter((item) => item.getClientRects().length > 0);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (!items.length) return;
    if (event.shiftKey && index <= 0) { event.preventDefault(); items[items.length - 1].focus(); }
    else if (!event.shiftKey && (index < 0 || index === items.length - 1)) { event.preventDefault(); items[0].focus(); }
  }
  return (
    <section ref={dialog} className={`spatial-detail atlas-reading-scene${onPrevious || onNext ? ' has-pagination' : ''}${leaving ? ' is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label="기억 상세" onKeyDown={handleKeys} style={{ '--scene-color': emotions[memory.emotion].color } as CSSProperties}>
      <header className="atlas-reading-toolbar">
        <button className="spatial-detail-back" type="button" onClick={() => leave(onBack)} disabled={leaving}><ArrowLeft size={17} /> 뒤로가기</button>

        <button className="spatial-detail-close" type="button" onClick={() => leave(onClose)} disabled={leaving} aria-label="기억 닫기"><X size={21} /><span>닫기</span></button>
      </header>
      <div className="spatial-detail-scroll" tabIndex={0} aria-label="기억 상세 내용">
        <div className="atlas-scene-photo-stack">
        <div className={`spatial-detail-hero ${memory.media.length ? 'atlas-taped-photo' : 'without-photo'}`}>
          {memory.media[0] ? <><Image src={memory.media[0].url} alt={`${memory.title}의 기억 사진 1`} width={900} height={650} unoptimized /><span className="atlas-photo-caption">{memory.location_name} · {formatDate(memory.memory_date)}</span></> : <span className="atlas-no-photo"><strong>{emotions[memory.emotion].label}</strong><span>{memory.location_name}</span></span>}
        </div>
        {memory.media.length > 1 && <div className="spatial-detail-gallery" aria-label="기억 사진">{memory.media.slice(1).map((media, index) => <figure key={media.id} className="atlas-taped-photo"><Image src={media.url} alt={`${memory.title}의 기억 사진 ${index + 2}`} width={700} height={500} unoptimized /></figure>)}</div>}
        </div>
        <article className="spatial-detail-content">


          <h2 ref={heading} tabIndex={-1}><AtlasHeadingLabel>{memory.title}</AtlasHeadingLabel></h2>
          <div className="atlas-reading-paper">
          <div className="spatial-detail-meta"><span className="spatial-emotion">{emotions[memory.emotion].label}</span></div>
          <p className="spatial-detail-place"><MapPin size={14} /> {memory.location_name}</p>
          <div className="spatial-detail-date"><span />{formatDate(memory.memory_date)}</div>
          <p className="spatial-detail-body">{memory.content}</p>
          <MemoryActivityBar key={memory.id} memoryId={memory.id} authenticated={authenticated||memory.owned} onOpenPanorama={onOpenPanorama}/>

          <div className="spatial-detail-tools">
            <button type="button" onClick={() => leave(onLocate)}><MapPin size={16} /> 지도에서 보기</button>
          </div>
          {showComments&&<div ref={comments}><MemoryComments key={`${memory.id}:${authenticated}`} memoryId={memory.id} memoryTitle={memory.title} authenticated={authenticated||memory.owned}/></div>}
          {memory.owned && (onEdit || onDelete) && <div className="atlas-owner-actions">
            {onEdit && <button type="button" onClick={onEdit} disabled={deleting}><Pencil size={16} /> 수정</button>}
            {onDelete && <button type="button" className="danger-action" onClick={onDelete} disabled={deleting}>{deleting ? <LoaderCircle size={16} className="spin" /> : <Trash2 size={16} />}{deleting ? '삭제 중…' : '삭제'}</button>}
          </div>}
          {memory.owned && <p className="atlas-owner-visibility">{memory.visibility === 'private' ? '나만 보기' : memory.visibility === 'unlisted' ? '링크로 공유' : '공개된 기억'}</p>}
          <DemoPhotoCredits media={memory.media} />
          <footer className="spatial-detail-footer"><span>{memory.owned ? '나의 기록' : memory.is_anonymous ? '익명으로 남긴 기억' : '한 사람이 남긴 기억'}</span>{onOtherMemories && <button type="button" onClick={onOtherMemories}>다른 기억 읽기 <ArrowRight size={15} /></button>}</footer>
          </div>
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
