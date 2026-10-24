'use client';

import { useRef, type ReactNode } from 'react';
import { useAppNavigation } from '@/src/lib/navigation';
import { recordDeveloperClick } from '@/src/features/onboarding/developer-gesture';

export default function DeveloperHotspot({ children, className = '' }: { children: ReactNode; className?: string }) {
  const router = useAppNavigation();
  const clicks = useRef<number[]>([]);

  return (
    <button
      type="button"
      className={`developer-status ${className}`}
      onClick={() => {
        const result = recordDeveloperClick(clicks.current, Date.now());
        clicks.current = result.clicks;
        if (result.activated) router.push('/dev');
      }}
    >{children}</button>
  );
}
