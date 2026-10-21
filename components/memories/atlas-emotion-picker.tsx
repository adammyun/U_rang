'use client';

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { ChevronRight, Layers2 } from 'lucide-react';
import { emotions, type Emotion } from '@/lib/types';

const quickEmotions = ['nostalgic', 'peaceful', 'love', 'happy'] as const;

/** Only controls presentation. Selection remains owned by the existing filters. */
export default function AtlasEmotionPicker({ selected, onChange }: {
  selected: Emotion[];
  onChange: (emotions: Emotion[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [present, setPresent] = useState(false);
  const picker = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const changeOpen = useCallback((next: boolean) => {
    if (next) setPresent(true);
    else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPresent(false);
    setOpen(next);
  }, []);

  useEffect(() => {
    if (open || !present) return;
    // Keep the inert chips mounted for the 180ms fold + reversed stagger.
    const timer = window.setTimeout(() => setPresent(false), 260);
    return () => window.clearTimeout(timer);
  }, [open, present]);

  useEffect(() => {
    if (!open) return;
    const root = picker.current?.closest('main');
    if (!root) return;
    let start: { id: number; x: number; y: number } | null = null;
    const isMap = (target: EventTarget | null) => target instanceof Element &&
      Boolean(target.closest('.map-surface')) && !target.closest('button,a,input,textarea,select');
    const wheel = (event: WheelEvent) => { if (isMap(event.target)) changeOpen(false); };
    const down = (event: PointerEvent) => {
      if (isMap(event.target)) start = { id: event.pointerId, x: event.clientX, y: event.clientY };
    };
    const move = (event: PointerEvent) => {
      if (start?.id === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) changeOpen(false);
    };
    const end = () => { start = null; };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { changeOpen(false); toggle.current?.focus(); }
    };
    // Passive capture observes real map gestures without taking them from MapLibre.
    root.addEventListener('wheel', wheel, { passive: true, capture: true });
    root.addEventListener('pointerdown', down, { passive: true, capture: true });
    root.addEventListener('pointermove', move, { passive: true, capture: true });
    root.addEventListener('pointerup', end, true);
    root.addEventListener('pointercancel', end, true);
    root.addEventListener('keydown', key);
    return () => {
      root.removeEventListener('wheel', wheel, true);
      root.removeEventListener('pointerdown', down, true);
      root.removeEventListener('pointermove', move, true);
      root.removeEventListener('pointerup', end, true);
      root.removeEventListener('pointercancel', end, true);
      root.removeEventListener('keydown', key);
    };
  }, [open, changeOpen]);

  return <section ref={picker} className="atlas-emotion-picker" aria-label="감정으로 기억 탐색" data-open={open} data-state={open ? 'open' : present ? 'closing' : 'closed'}>
    <button ref={toggle} type="button" className="atlas-emotion-toggle"
      aria-label={`감정 태그 ${open ? '접기' : '펼치기'}${selected.length ? `, ${selected.length}개 선택됨` : ''}`}
      aria-expanded={open} aria-controls={listId} onClick={() => changeOpen(!open)}>
      <Layers2 size={17} aria-hidden="true" /><span>감정</span>
      {selected.length > 0 && <span className="atlas-emotion-count" aria-hidden="true">{selected.length}</span>}
      <ChevronRight className="atlas-emotion-chevron" size={15} aria-hidden="true" />
    </button>
    <div id={listId} className="atlas-emotion-tags" hidden={!present} inert={!open} aria-hidden={!open} role="group" aria-label="감정 선택">
      {present && quickEmotions.map((emotion, index) => <button key={emotion} type="button"
        aria-pressed={selected.includes(emotion)}
        style={{ '--chip-color': emotions[emotion].color, '--tag-index': index } as CSSProperties}
        onClick={() => onChange(selected.includes(emotion) ? selected.filter(item => item !== emotion) : [...selected, emotion])}>
        <span aria-hidden="true">{selected.includes(emotion) ? '−' : '+'}</span>{emotions[emotion].label}
      </button>)}
    </div>
  </section>;
}
