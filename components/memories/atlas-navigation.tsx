'use client';

import Link from '@/components/ui/app-link';
import { Compass, MapPin, Plus, UserRound } from 'lucide-react';
import type { Ref } from 'react';

/** Stable navigation positions across the public map, exploration and journal. */
export default function AtlasNavigation({ mine = false, authenticated, expanded, selecting = false, onCreate, onMap, onExplore, onArchive, archiveRef, onPersonal, personal = false, personalExpanded = false }: {
  mine?: boolean;
  authenticated: boolean;
  expanded: boolean;
  selecting?: boolean;
  onCreate: () => void;
  onMap?: () => void;
  onExplore?: () => void;
  onArchive?: () => void;
  archiveRef?: Ref<HTMLButtonElement>;
  onPersonal?: () => void;
  personal?: boolean;
  personalExpanded?: boolean;
}) {
  return <nav className="spatial-nav" aria-label="지도 메뉴">
    {mine ? <Link href="/"><MapPin size={18} /> 지도</Link> : <button type="button" className={!expanded && !personal ? 'active' : ''} aria-current={!expanded && !personal ? 'page' : undefined} onClick={onMap}><MapPin size={18} /> 지도</button>}
    {mine ? <Link href="/?explore=1"><Compass size={18} /> 탐색</Link> : <button type="button" className={expanded ? 'active' : ''} aria-current={expanded ? 'page' : undefined} aria-expanded={expanded} onClick={onExplore}><Compass size={18} /> 탐색</button>}
    <button type="button" className="primary memory-cta" data-tour="create" aria-label="기억을 남길 장소 선택하기" aria-pressed={selecting} onClick={onCreate}><Plus size={19} /> {selecting ? '장소 선택 중' : '기억 남기기'}</button>
    {onPersonal ? <button type="button" className={personal?'active':''} aria-current={personal?'page':undefined} aria-expanded={personalExpanded} aria-controls="personal-space-panel" data-tour="my-memories" onClick={onPersonal}><UserRound size={18}/>내 기억</button> : mine ? <button ref={archiveRef} type="button" className="active" aria-current="page" aria-label={expanded ? '내 기억 목록 접기' : '내 기억 목록 펼치기'} aria-controls="my-memory-list" aria-expanded={expanded} data-tour="my-memories" onClick={onArchive}><UserRound size={18} /> 내 기억</button> : <Link href={authenticated ? '/my-map' : '/login?next=/my-map'} data-tour="my-memories"><UserRound size={18} /> 내 기억</Link>}
  </nav>;
}
