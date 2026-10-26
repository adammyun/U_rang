'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { LoaderCircle, MessageCircle, Send, Trash2 } from 'lucide-react';
import Link from '@/components/ui/app-link';
import { fetchComments, postComment, removeComment } from '@/src/features/memories/comments-api';
import type { MemoryComment, PanoramaAnchor } from '@/src/features/memories/comments-model';

/** Shared thread: our own HTML, outside the NAVER-owned canvas. */
export default function MemoryComments({memoryId,memoryTitle,authenticated=false,visible=true,selectedAnchor=null,onClearAnchor,onCommentsChange,onHoverComment,onFocusAnchor,activeCommentId=null}:{
  memoryId:string;memoryTitle:string;authenticated?:boolean;visible?:boolean;
  selectedAnchor?:PanoramaAnchor|null;onClearAnchor?:()=>void;
  onCommentsChange?:(comments:MemoryComment[])=>void;
  onHoverComment?:(comment:MemoryComment|null)=>void;
  onFocusAnchor?:(comment:MemoryComment)=>void;
  activeCommentId?:string|null;
}) {
  const [comments,setComments]=useState<MemoryComment[]>([]);
  const [cursor,setCursor]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [loaded,setLoaded]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [draft,setDraft]=useState('');
  const [retry,setRetry]=useState(0);
  const request=useRef<AbortController|null>(null);
  const inputId=useId();
  const list=useRef<HTMLDivElement>(null);
  const textarea=useRef<HTMLTextAreaElement>(null);
  useEffect(()=>{if(loaded)onCommentsChange?.(comments);},[comments,loaded,onCommentsChange]);
  useEffect(()=>{if(selectedAnchor && authenticated)textarea.current?.focus({preventScroll:true});},[selectedAnchor,authenticated]);
  useEffect(()=>{
    if(activeCommentId&&visible)list.current?.querySelector<HTMLElement>(`[data-comment-id="${CSS.escape(activeCommentId)}"]`)?.scrollIntoView({block:'nearest'});
  },[activeCommentId,visible]);
  useEffect(()=>{
    const controller=new AbortController();request.current=controller;
    fetchComments(memoryId,controller.signal).then(page=>{
      if(controller.signal.aborted)return;
      setComments(page.comments);setCursor(page.nextCursor);setLoaded(true);setError('');
    }).catch(reason=>{if(!controller.signal.aborted)setError(reason instanceof Error?reason.message:'댓글을 불러오지 못했어요.');})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>{controller.abort();request.current?.abort();};
  },[memoryId,authenticated,retry]);
  async function more() {
    if(!cursor || loading || busy)return;
    const controller=new AbortController();request.current?.abort();request.current=controller;
    setLoading(true);setError('');
    try {
      const page=await fetchComments(memoryId,controller.signal,cursor);
      if(controller.signal.aborted)return;
      setComments(current=>Array.from(new Map([...current,...page.comments].map(item=>[item.id,item])).values()).sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id)));
      setCursor(page.nextCursor);
    } catch(reason){if(!controller.signal.aborted)setError(reason instanceof Error?reason.message:'댓글을 불러오지 못했어요.');}
    finally {if(!controller.signal.aborted)setLoading(false);}
  }
  async function submit(event:FormEvent) {
    event.preventDefault();if(!draft.trim() || busy || !loaded)return;
    setBusy(true);setError('');setNotice('');
    try {
      const comment=await postComment(memoryId,draft,selectedAnchor);
      setComments(current=>[...current,comment]);setDraft('');onClearAnchor?.();setNotice('댓글을 남겼어요.');
      requestAnimationFrame(()=>list.current?.scrollTo({top:list.current.scrollHeight,behavior:'smooth'}));
    } catch(reason){setError(reason instanceof Error?reason.message:'댓글을 저장하지 못했어요.');}
    finally {setBusy(false);}
  }
  async function remove(id:string) {
    if(busy)return;
    setBusy(true);setError('');setNotice('');
    try {await removeComment(memoryId,id);setComments(current=>current.filter(item=>item.id!==id));setNotice('댓글을 삭제했어요.');}
    catch(reason){setError(reason instanceof Error?reason.message:'댓글을 삭제하지 못했어요.');}
    finally {setBusy(false);}
  }
  return <section className="memory-comments" aria-label="기억 댓글" aria-busy={busy||loading}>
    <header className="memory-comments-heading"><h3><MessageCircle size={18}/> 이 기억에 남기는 말</h3><p>{memoryTitle}</p></header>
    <div ref={list} className="memory-comments-list" role="region" aria-label="댓글 목록" tabIndex={0}>
      {comments.map(comment=><article key={comment.id} data-comment-id={comment.id} className={`memory-comment${activeCommentId===comment.id?' is-highlighted':''}`} onMouseEnter={()=>{if(window.matchMedia('(hover:hover)').matches)onHoverComment?.(comment);}} onMouseLeave={()=>onHoverComment?.(null)} onFocusCapture={()=>onHoverComment?.(comment)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))onHoverComment?.(null);}}>
        <header><strong>{comment.owned?'나':'익명의 여행자'}</strong><time dateTime={comment.createdAt}>{new Intl.DateTimeFormat('ko-KR',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(comment.createdAt))}</time>
          {comment.owned&&authenticated&&<button type="button" aria-label="내 댓글 삭제" disabled={busy} onClick={()=>void remove(comment.id)}><Trash2 size={15}/></button>}</header>
        <p>{comment.content}</p>
        {comment.anchor&&onFocusAnchor&&<button className="memory-comment-location" type="button" aria-label="거리뷰 지점 보기" onClick={()=>onFocusAnchor(comment)}>거리뷰 지점 보기 ↗</button>}
      </article>)}
      {loading&&<p className="memory-comments-empty" role="status"><LoaderCircle size={16} className="spin"/> 댓글을 불러오는 중…</p>}
      {loaded&&!loading&&!comments.length&&<p className="memory-comments-empty">이 순간에 공감한 이야기를 남겨 보세요.</p>}
      {cursor&&<button type="button" className="memory-comments-more" disabled={loading||busy} onClick={()=>void more()}>댓글 더 보기</button>}
    </div>
    {error&&<p className="memory-comments-error" role="alert">{error} {!loaded&&<button type="button" onClick={()=>{setLoading(true);setRetry(value=>value+1);}}>다시 시도</button>}</p>}
    {notice&&<p className="memory-comments-notice" role="status">{notice}</p>}
    {authenticated ? <form onSubmit={event=>void submit(event)} className="memory-comments-form">
      <label htmlFor={inputId}>댓글 남기기 <span>익명으로 표시됩니다</span></label>
      {selectedAnchor&&<div className="memory-comment-target" role="status"><span>선택한 거리뷰 지점에 남겨요</span><button type="button" onClick={onClearAnchor} aria-label="댓글 지점 선택 해제">해제</button></div>}
      <textarea ref={textarea} id={inputId} value={draft} onChange={event=>setDraft(event.target.value)} maxLength={1000} rows={2} placeholder="이곳에서 떠오른 이야기를 들려주세요" disabled={busy||!loaded}/>
      <div><span>{draft.length} / 1000</span><button type="submit" disabled={busy||!loaded||!draft.trim()}>{busy?<LoaderCircle size={15} className="spin"/>:<Send size={15}/>} 남기기</button></div>
    </form> : <p className="memory-comments-login"><Link href="/login?next=/">로그인하고 댓글 남기기</Link><span>댓글은 익명으로 표시됩니다.</span></p>}
  </section>;
}
