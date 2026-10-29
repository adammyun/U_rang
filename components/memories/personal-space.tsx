'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Bookmark, Heart, LoaderCircle, MapPin, Pencil, UserRound, X } from 'lucide-react';
import Image from 'next/image';
import { AtlasHeadingLabel } from '@/components/ui/atlas-heading-label';
import { emotions,formatDate,type Memory } from '@/lib/types';
import type { PersonalSelection,PersonalSpace } from '@/src/features/memories/personal-model';
import type { MemoryFilters } from '@/src/features/memories/schemas';
import type { MapMode } from '@/src/features/map/appearance';
import EmotionMenuSettings from './emotion-menu-settings';
import type {Emotion} from '@/lib/types';
import MapAppearanceOptions from './map-appearance-options';
import { RECENT_MEMORY_YEARS } from '@/src/features/memories/filters';

import StoryCollection from '@/components/stories/story-collection';
import type {StoryDiscovery} from '@/src/features/stories/model';

const tabs=[{key:'mine',label:'내 기록'},{key:'bookmarked',label:'북마크'},{key:'liked',label:'좋아요'},{key:'recommended',label:'추천'},{key:'discoveries',label:'발견한 이야기'}] as const;
export default function PersonalSpacePanel({data,selection,onSelection,filters,onFilters,loading,error,onRetry,onClose,onSelect,onEdit,emotionMenu,emotionMenuReady,onSaveEmotionMenu,visibility,onVisibility,mapMode,onMapMode,guestSession=false,onGuestLogout,stories,onOpenStory,onExploreStories}:{stories:{items:StoryDiscovery[];loading:boolean;error:boolean;refresh:()=>void};onOpenStory:(id:string)=>void;onExploreStories:()=>void;data:PersonalSpace|null;selection:PersonalSelection;onSelection:(value:PersonalSelection)=>void;filters:MemoryFilters;onFilters:(value:MemoryFilters)=>void;loading:boolean;error:boolean;onRetry:()=>void;onClose:()=>void;onSelect:(memory:Memory)=>void;onEdit:(memory:Memory)=>void;emotionMenu:Emotion[];emotionMenuReady:boolean;onSaveEmotionMenu:(value:Emotion[])=>Promise<void>;visibility:Memory['visibility']|'';onVisibility:(value:Memory['visibility']|'')=>void;mapMode:MapMode;onMapMode:(mode:MapMode)=>void;guestSession?:boolean;onGuestLogout?:()=>void}) {
  const [tab,setTab]=useState<typeof tabs[number]['key']>('mine');
  const heading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{if(tab==='discoveries')document.getElementById('personal-tab-discoveries')?.parentElement?.scrollIntoView({block:'start'});},[tab]);
  useLayoutEffect(()=>{const previous=document.activeElement as HTMLElement|null;heading.current?.focus({preventScroll:true});return()=>{if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
  useEffect(()=>{const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();onClose();}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[onClose]);
  const items=tab==='recommended'?data?.recommendations.map(item=>item.memory)??[]:tab==='discoveries'?[]:data?.lists[tab]??[];
  const years=Array.from(new Set([...RECENT_MEMORY_YEARS,...(data?.lists.mine.flatMap(memory=>memory.memory_date?[Number(memory.memory_date.slice(0,4))]:[])??[]),...(filters.year?[filters.year]:[])])).sort((a,b)=>b-a);
  return <section id="personal-space-panel" className="personal-panel" role="dialog" aria-modal="false" aria-label="마이페이지">
    <header className="personal-panel-header"><button type="button" onClick={onClose} aria-label="마이페이지 닫고 지도 보기"><ArrowLeft size={17}/></button><h2 ref={heading} tabIndex={-1}><AtlasHeadingLabel>나의 유랑</AtlasHeadingLabel></h2><button type="button" onClick={onClose} aria-label="마이페이지 닫기"><X size={19}/></button></header>
    <div className="personal-panel-scroll" tabIndex={0} aria-label="마이페이지 내용">
      <section className="personal-identity"><div className="personal-avatar"><UserRound size={28}/></div><div><h3>{data?.displayName??'나'}의 기억 보관함</h3><p>남긴 순간과 다시 찾고 싶은 이야기</p></div></section>
      {guestSession&&<div className="personal-guest-session"><span>게스트로 이용 중이에요</span><button type="button" onClick={onGuestLogout}>게스트 로그아웃</button></div>}
      <dl className="personal-totals"><div><dt>내 기록</dt><dd>{data?.totals.mine??'—'}</dd></div><div><dt>북마크</dt><dd>{data?.totals.bookmarked??'—'}</dd></div><div><dt>좋아요</dt><dd>{data?.totals.liked??'—'}</dd></div></dl>
      <fieldset className="personal-map-selection"><legend>지도에 표시할 기억</legend>{([{key:'mine',label:'내 기억',Icon:MapPin},{key:'bookmarked',label:'북마크한 기억',Icon:Bookmark},{key:'liked',label:'좋아요한 기억',Icon:Heart}] as const).map(({key,label,Icon})=><label key={key}><input type="checkbox" aria-label={label} checked={selection[key]} onChange={event=>onSelection({...selection,[key]:event.target.checked})}/><Icon size={15}/><span className="personal-option-full">{label}</span><span className="personal-option-short" aria-hidden="true">{key==='mine'?'내 기억':key==='bookmarked'?'북마크':'좋아요'}</span></label>)}<p>패널을 닫아도 선택한 기억은 지도에 남아요.</p></fieldset>
      {data?.hasMore&&<p className="personal-message">현재 지도에 200개까지 표시해요. 지도를 확대해 다른 기억도 만나보세요.</p>}
      <EmotionMenuSettings ready={emotionMenuReady} saved={emotionMenu} onSave={onSaveEmotionMenu}/>
      <div className="personal-secondary-options"><details className="personal-filter-details"><summary>연도·감정·공개 범위</summary><div className="personal-record-filters"><label>연도<select aria-label="내 공간 연도" value={filters.year??''} onChange={event=>onFilters({...filters,year:event.target.value?Number(event.target.value):undefined})}><option value="">모든 연도</option>{years.map(year=><option key={year} value={year}>{year}년</option>)}</select></label><label>감정<select aria-label="내 공간 감정" value={filters.emotions[0]??''} onChange={event=>onFilters({...filters,emotions:event.target.value?[event.target.value as keyof typeof emotions]:[]})}><option value="">모든 감정</option>{Object.entries(emotions).map(([key,value])=><option key={key} value={key}>{value.label}</option>)}</select></label></div>
      <label className="personal-visibility">공개 범위<select aria-label="내 공간 공개 범위" value={visibility} onChange={event=>onVisibility(event.target.value as Memory['visibility']|'')}><option value="">모든 공개 범위</option><option value="private">나만 보기</option><option value="public">공개</option><option value="unlisted">링크로 공유</option></select></label>
      </details><details className="personal-map-mode"><summary>지도 표현</summary><MapAppearanceOptions mode={mapMode} onChange={onMapMode}/></details></div>
      {error&&<p className="personal-message" role="alert">기억 보관함을 불러오지 못했어요. <button type="button" onClick={onRetry}>다시 시도</button></p>}
      <div className="personal-tabs" role="tablist" aria-label="기억 보관함 목록" onKeyDown={event=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
        event.preventDefault();const index=tabs.findIndex(item=>item.key===tab);
        const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length;
        setTab(tabs[next].key);document.getElementById(`personal-tab-${tabs[next].key}`)?.focus();
      }}>{tabs.map(item=><button type="button" role="tab" tabIndex={tab===item.key?0:-1} key={item.key} id={`personal-tab-${item.key}`} aria-controls="personal-memory-list" aria-selected={tab===item.key} onClick={()=>setTab(item.key)}>{item.label}</button>)}</div>
      <div role="tabpanel" id="personal-memory-list" aria-labelledby={`personal-tab-${tab}`} aria-busy={loading}>
        {tab==='recommended'&&<p className="personal-recommendation-note">내가 남긴 감정과 장소에서 이어지는 공개 이야기예요.</p>}
        {tab==='discoveries'?<StoryCollection items={stories.items} loading={stories.loading} error={stories.error} onRetry={stories.refresh} onRead={onOpenStory} onExplore={onExploreStories}/>:loading&&!data?<p className="personal-message" role="status"><LoaderCircle className="spin" size={18}/>기억을 펼치는 중이에요.</p>:items.length?<div className="personal-memory-cards">{items.map(memory=><article key={memory.id} className="personal-memory-entry"><button type="button" className="personal-memory-card" onClick={()=>onSelect(memory)}>
          {memory.media[0]&&<Image src={memory.media[0].url} alt="" width={150} height={130} unoptimized/>}<div><span>{emotions[memory.emotion].label} · {formatDate(memory.memory_date)}</span><h3>{memory.title}</h3><p>{memory.content}</p><small><MapPin size={12}/>{memory.location_name}</small>{tab==='recommended'&&<em>{data?.recommendations.find(item=>item.memory.id===memory.id)?.reason}</em>}</div><ArrowUpRight size={16}/>
        </button>{memory.owned&&<button type="button" className="personal-memory-edit" aria-label={`${memory.title} 감정 수정`} onClick={()=>onEdit(memory)}><Pencil size={14}/> 감정·기록 수정</button>}</article>)}</div>:<div className="personal-empty"><Bookmark size={23}/><p>{tab==='mine'?'아직 남긴 기억이 없어요. 지도에서 첫 순간을 기록해 보세요.':tab==='recommended'?'지금 만날 수 있는 공개 기억이 없어요.':'이곳에 모은 기억이 아직 없어요. 마음에 남는 기억을 열어 저장해 보세요.'}</p></div>}
        {tab!=='recommended'&&tab!=='discoveries'&&(data?.totals[tab]??0)>40&&<p className="personal-message">최근 기억 40개를 보여드려요. 지도에서는 현재 화면의 기억을 조회합니다.</p>}
      </div>
      {tab!=='recommended'&&tab!=='discoveries'&&<button type="button" className="personal-recommendation-link" onClick={()=>setTab('recommended')}>내 기억과 닮은 다른 이야기 만나기 <ArrowUpRight size={16}/></button>}
    </div>
  </section>;
}
