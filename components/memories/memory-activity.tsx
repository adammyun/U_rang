'use client';

import { Bookmark, Eye, Heart, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from '@/components/ui/app-link';
import { setActivity } from '@/src/features/memories/personal-api';
import type { MemoryActivity } from '@/src/features/memories/personal-model';

export default function MemoryActivityBar({memoryId,authenticated=false}:{memoryId:string;authenticated?:boolean}) {
  const [activity,setValue]=useState<MemoryActivity|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [retry,setRetry]=useState(0);
  useEffect(()=>{
    let disposed=false;
    setActivity(memoryId,'view').then(value=>{if(!disposed){setValue(value);setError('');}}).catch(()=>{if(!disposed)setError('반응 정보를 불러오지 못했어요.');});
    return ()=>{disposed=true;};
  },[memoryId,retry]);
  async function toggle(kind:'like'|'bookmark') {
    if(!authenticated){setError('로그인 후 마음에 남는 기억을 모아 보세요.');return;}
    if(!activity||busy)return;
    setBusy(true);setError('');
    try {setValue(await setActivity(memoryId,kind,kind==='like'?!activity.liked:!activity.bookmarked));}
    catch(reason){setError(reason instanceof Error?reason.message:'저장하지 못했어요.');}
    finally {setBusy(false);}
  }
  return <div className="memory-activity" aria-label="기억 반응" aria-busy={busy||!activity}>
    <button type="button" aria-label="좋아요" aria-pressed={activity?.liked??false} disabled={busy||!activity} onClick={()=>void toggle('like')}><Heart size={16}/><span>좋아요 {activity?.likes??'…'}</span></button>
    <button type="button" aria-label="북마크" aria-pressed={activity?.bookmarked??false} disabled={busy||!activity} onClick={()=>void toggle('bookmark')}><Bookmark size={16}/><span>{activity?.bookmarked?'저장됨':'북마크'}</span></button>
    <span className="memory-view-count" aria-label={`조회수 ${activity?.views??'불러오는 중'}`}><Eye size={15}/>조회 {activity?.views??'…'}</span>
    {busy&&<LoaderCircle className="spin" size={14}/>}
    {error&&<p role="status">{error} {!authenticated&&activity?<Link href="/login?next=/">로그인</Link>:<button type="button" onClick={()=>setRetry(value=>value+1)}>다시 시도</button>}</p>}
  </div>;
}
