'use client';
import {ArrowUpRight,LoaderCircle} from 'lucide-react';
import {getPlaceStory} from '@/src/features/stories/catalog';
import type {StoryDiscovery} from '@/src/features/stories/model';
import {formatDate} from '@/lib/types';
import StoryGlyph from './story-glyph';
export default function StoryCollection({items,loading,error,onRetry,onRead,onExplore,hoveredId,onHover}:{hoveredId?:string|null;onHover?:(id:string|null)=>void;items:StoryDiscovery[];loading:boolean;error:boolean;onRetry:()=>void;onRead:(id:string)=>void;onExplore:()=>void}){
 return <div className="story-collection"><p>지도를 거닐다 만난, 장소의 또 다른 이야기</p>{error&&<p role="alert">이야기 보관함을 불러오지 못했어요. <button onClick={onRetry}>다시 시도</button></p>}{loading&&!items.length?<p role="status"><LoaderCircle className="spin" size={16}/>발견한 이야기를 펼치고 있어요.</p>:items.length?<div className="story-collection-list">{items.map(item=>{const story=getPlaceStory(item.storyId);return story?<button type="button" key={item.storyId} data-story-id={item.storyId} className={hoveredId===item.storyId?'is-map-hovered':undefined} onMouseEnter={()=>onHover?.(item.storyId)} onMouseLeave={()=>onHover?.(null)} onFocus={()=>onHover?.(item.storyId)} onBlur={()=>onHover?.(null)} onClick={()=>onRead(item.storyId)}><StoryGlyph/><div><span>{story.place} · {formatDate(item.discoveredAt.slice(0,10))} 발견</span><h3>{story.title}</h3><p>{story.paragraphs[0]}</p></div><ArrowUpRight size={16}/></button>:null;})}</div>:!error&&<div className="story-collection-empty"><StoryGlyph/><h3>아직 펼치지 않은 이야기가 있어요</h3><p>지도를 가까이 확대해 희미한 흔적을 찾아보세요. 열어본 이야기가 여기에 모여요.</p><button type="button" onClick={onExplore}>지도를 거닐어 보기 <ArrowUpRight size={15}/></button></div>}</div>;
}
