'use client';

import { useEffect, useRef, useState } from 'react';

const prompts = [
  '오늘은 무슨 일이 있었나요?',
  '그 때의 순간을 들여다보세요',
  '어떤 장면을 오래 기억하고 싶나요?',
  '익숙한 길에서 새로운 기억을 만나보세요',
  '잠시 멈춰 그날의 마음을 떠올려보세요',
  '같은 장소에 다른 이야기가 기다리고 있어요',
  '당신의 하루는 어디에 머물렀나요?',
  '천천히 걸으며 누군가의 기억을 만나보세요',
] as const;

/** Presentation-only: never captures a gesture or changes the map camera. */
export default function AtlasIntro() {
  const intro = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState<string>(prompts[0]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setPrompt(prompts[Math.floor(Math.random() * prompts.length)]));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const node = intro.current;
    const root = node?.closest('main');
    if (!node || !root) return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0;
    let restoreTimer: ReturnType<typeof setTimeout> | undefined;
    let start: { x: number; y: number } | null = null;
    const isMap = (target: EventTarget | null) => target instanceof Element &&
      Boolean(target.closest('.map-surface')) && !target.closest('button,a,input,textarea,select,[role="dialog"]');
    const resetPeek = () => { delete node.dataset.peeking; };
    const hideBriefly = () => {
      node.dataset.gestureHidden = 'true';
      clearTimeout(restoreTimer);
      restoreTimer = setTimeout(() => { delete node.dataset.gestureHidden; }, 750);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) { resetPeek(); return; }
        node.style.setProperty('--intro-peek-x', `${x}px`);
        node.style.setProperty('--intro-peek-y', `${y}px`);
        node.dataset.peeking = 'true';
      });
    };
    const touchStart = (event: TouchEvent) => {
      if (!isMap(event.target) || !event.touches[0]) return;
      start = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    };
    const touchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (start && touch && Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > 6) hideBriefly();
    };
    const touchEnd = () => { start = null; };
    const wheel = (event: WheelEvent) => {
      if (!finePointer.matches && isMap(event.target)) hideBriefly();
    };
    const leave = () => { cancelAnimationFrame(frame); resetPeek(); };
    root.addEventListener('pointermove', pointerMove, { passive: true });
    root.addEventListener('pointerleave', leave);
    root.addEventListener('keydown', leave, true);
    root.addEventListener('touchstart', touchStart, { passive: true, capture: true });
    root.addEventListener('touchmove', touchMove, { passive: true, capture: true });
    root.addEventListener('touchend', touchEnd, true);
    root.addEventListener('touchcancel', touchEnd, true);
    root.addEventListener('wheel', wheel, { passive: true, capture: true });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(restoreTimer);
      root.removeEventListener('pointermove', pointerMove);
      root.removeEventListener('pointerleave', leave);
      root.removeEventListener('keydown', leave, true);
      root.removeEventListener('touchstart', touchStart, true);
      root.removeEventListener('touchmove', touchMove, true);
      root.removeEventListener('touchend', touchEnd, true);
      root.removeEventListener('touchcancel', touchEnd, true);
      root.removeEventListener('wheel', wheel, true);
    };
  }, []);

  return <div ref={intro} className="spatial-intro atlas-intro">
    <h1><span>기억을 거닐다</span><em>유랑</em></h1>
    <p>{prompt}</p>
  </div>;
}
