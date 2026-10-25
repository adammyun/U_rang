'use client';

import Link from '@/components/ui/app-link';
import { ArrowUpRight, Check } from 'lucide-react';
import type { MemoryFilters } from '@/src/features/memories/schemas';

/** Switch the current map when a handler exists; retain legacy route links otherwise. */
export default function MemoryScopeSwitch({ scope, filters, onChange }: {
  scope: 'all' | 'mine';
  filters: MemoryFilters;
  onChange?:(scope:'all'|'mine')=>void;
}) {
  const query = new URLSearchParams();
  if (filters.year) query.set('year', String(filters.year));
  if (filters.emotions.length) query.set('emotion', filters.emotions.join(','));
  const suffix = query.size ? `?${query}` : '';
  return <fieldset className="atlas-scope-field">
    <legend>누구의 기억을 만날까요</legend>
    <nav className="atlas-scope-options" aria-label="기억 보기 전환">
      {([['all', '/', '모두의 기억 보기'], ['mine', '/my-map', '내 기억만 보기']] as const).map(([value, route, label]) =>
        onChange ? <button type="button" key={value} onClick={()=>onChange(value)} aria-current={scope===value?'page':undefined} className={scope===value?'selected':''}><span>{label}</span>{scope===value?<Check size={16}/>:<ArrowUpRight size={16}/>}</button> : <Link key={value} href={`${route}${suffix}`} aria-current={scope === value ? 'page' : undefined} className={scope === value ? 'selected' : ''}>
          <span>{label}</span>{scope === value ? <Check size={16} aria-hidden="true" /> : <ArrowUpRight size={16} aria-hidden="true" />}
        </Link>)}
    </nav>
  </fieldset>;
}
