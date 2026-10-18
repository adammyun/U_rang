'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { emotions, type Emotion } from '@/lib/types';

export default function AtlasAtmosphere({ emotion }: { emotion?: Emotion }) {
  const cursor = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = cursor.current;
    const root = node?.parentElement;
    if (!node || !root) return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches || event.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        node.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
        node.dataset.visible = 'true';
        node.dataset.interactive = String(event.target instanceof Element && Boolean(event.target.closest('button,a,input')));
      });
    };
    const leave = () => { node.dataset.visible = 'false'; };
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerleave', leave);
    reducedMotion.addEventListener('change', leave);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', leave);
      reducedMotion.removeEventListener('change', leave);
    };
  }, []);
  return (
    <>
      <div className="atlas-map-treatment" aria-hidden="true" />
      <div className={`atlas-scene-wash${emotion ? ' is-visible' : ''}`} style={{ '--scene-color': emotion ? emotions[emotion].color : 'transparent' } as CSSProperties} aria-hidden="true" />
      <span ref={cursor} className="atlas-pointer-ring" aria-hidden="true" />
    </>
  );
}
