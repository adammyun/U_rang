'use client';
import {useEffect,useState} from 'react';
import {ArrowUpRight,Check,LoaderCircle,MapPin,X} from 'lucide-react';
import {Dialog,DialogClose,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {AtlasHeadingLabel} from '@/components/ui/atlas-heading-label';
import Link from '@/components/ui/app-link';
import {STORY_CHECKED_AT,type PlaceStory} from '@/src/features/stories/catalog';
import StoryGlyph from './story-glyph';
export default function PlaceStoryDialog({story,authenticated,onDiscover,onClose,onLocate}:{story:PlaceStory;authenticated:boolean;onDiscover:(id:string)=>Promise<unknown>;onClose:()=>void;onLocate:()=>void}){
 const [status,setStatus]=useState<'saving'|'saved'|'error'|'guest'>(authenticated?'saving':'guest'),[retry,setRetry]=useState(0);
 useEffect(()=>{
  if(!authenticated)return;
  let alive=true;
  onDiscover(story.id).then(()=>{if(alive)setStatus('saved');}).catch(()=>{if(alive)setStatus('error');});
  return ()=>{alive=false;};
 },[authenticated,onDiscover,story.id,retry]);
 return <Dialog open onOpenChange={open=>!open&&onClose()}><DialogContent className="place-story-dialog atlas-paper-panel" showCloseButton={false}>
  <header><div><DialogTitle><AtlasHeadingLabel>{story.title}</AtlasHeadingLabel></DialogTitle><DialogDescription>{story.place} · {story.kind}</DialogDescription></div><DialogClose className="close-button" aria-label="장소 이야기 닫기"><X size={20}/></DialogClose></header>
  <div className="place-story-scroll" tabIndex={0} aria-label="장소 이야기 내용"><div className="place-story-art"><StoryGlyph/><span>익숙한 장소의 다른 얼굴</span></div>{story.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}<blockquote>{story.invitation}</blockquote>
   <div className="place-story-sources"><span>이야기의 출처 · {STORY_CHECKED_AT.replaceAll('-','.')} 확인</span>{story.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ArrowUpRight size={13}/></a>)}</div>
  </div>
  <footer><div role="status">{status==='saving'?<><LoaderCircle className="spin" size={15}/>보관하는 중…</>:status==='saved'?<><Check size={15}/>마이페이지 · 발견한 이야기에 담았어요</>:status==='error'?<button onClick={()=>{setStatus('saving');setRetry(value=>value+1);}}>보관하지 못했어요 · 다시 시도</button>:<Link href={`/login?next=${encodeURIComponent('/?story='+story.id)}`}>로그인하고 이 이야기 보관하기 <ArrowUpRight size={14}/></Link>}</div><button type="button" onClick={onLocate}><MapPin size={15}/> 지도에서 보기</button></footer>
 </DialogContent></Dialog>;
}
