'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import MemoryComments from './memory-comments';
import { exampleCommentAnchor } from '@/src/features/panorama/demo-comment-anchor';
import { anchorToScreen, screenToAnchor, type PanoramaFrame } from '@/src/features/panorama/projection';
import type { MemoryComment, PanoramaAnchor } from '@/src/features/memories/comments-model';

export default function PanoramaAnnotations({container,frame,memoryId,memoryTitle,authenticated,onLookAt}:{
  container:HTMLDivElement;frame:PanoramaFrame|null;memoryId:string;memoryTitle:string;authenticated:boolean;
  onLookAt:(anchor:PanoramaAnchor)=>void;
}) {
  const [initialFrame]=useState(frame);
  const anchorForComment=useCallback((comment:MemoryComment)=>comment.anchor??exampleCommentAnchor(memoryId,comment.id,initialFrame),[memoryId,initialFrame]);
  const [open,setOpen]=useState(true);
  const [comments,setComments]=useState<MemoryComment[]>([]);
  const [selected,setSelected]=useState<PanoramaAnchor|null>(null);
  const clearSelected=useCallback(()=>setSelected(null),[]);
  const [activeId,setActiveId]=useState<string|null>(null);
  const [peekId,setPeekId]=useState<string|null>(null);
  const [peekLocked,setPeekLocked]=useState(false);
  const latestFrame=useRef(frame);
  const panel=useRef<HTMLElement>(null);
  const hoverTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{latestFrame.current=frame;},[frame]);
  useEffect(()=>()=>{if(hoverTimer.current)clearTimeout(hoverTimer.current);},[]);

  // A short click selects a scene ray. Drag/pinch and native SDK controls keep
  // their normal handlers. Capture before the SDK's road-click navigation.
  useEffect(()=>{
    if(!open)return;
    let gesture:{x:number;y:number;at:number;moved:boolean}|null=null;
    const control=(target:EventTarget|null)=>target instanceof Element && Boolean(target.closest('a,button,input,select,textarea,[role="button"],[role="slider"],[class^="arrow_container_"],.arrow_image'));
    const down=(event:PointerEvent)=>{gesture=event.isPrimary && event.button===0 && !control(event.target) ? {x:event.clientX,y:event.clientY,at:performance.now(),moved:false}:null;};
    const move=(event:PointerEvent)=>{if(gesture&&Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>6)gesture.moved=true;};
    const cancel=()=>{gesture=null;};
    const click=(event:MouseEvent)=>{
      const current=gesture;gesture=null;
      if(!current || current.moved || performance.now()-current.at>700 || control(event.target))return;
      const currentFrame=latestFrame.current;if(!currentFrame)return;
      const rect=container.getBoundingClientRect();
      const anchor=screenToAnchor({...currentFrame,width:rect.width,height:rect.height},event.clientX-rect.left,event.clientY-rect.top);
      if(!anchor)return;
      event.preventDefault();event.stopPropagation();
      setSelected(anchor);setActiveId(null);setPeekId(null);setPeekLocked(false);
    };
    container.addEventListener('pointerdown',down,true);container.addEventListener('pointermove',move,true);container.addEventListener('pointercancel',cancel,true);container.addEventListener('click',click,true);
    return ()=>{container.removeEventListener('pointerdown',down,true);container.removeEventListener('pointermove',move,true);container.removeEventListener('pointercancel',cancel,true);container.removeEventListener('click',click,true);};
  },[container,open]);

  const focusComment=useCallback((comment:MemoryComment,explicit=false)=>{
    if(!comment.anchor)return;
    setActiveId(comment.id);
    const current=latestFrame.current;
    const position=current?anchorToScreen(current,comment.anchor):null;
    const rect=container.getBoundingClientRect(),cover=panel.current?.getBoundingClientRect();
    const covered=open && position && cover && position.x+rect.left>=cover.left && position.x+rect.left<=cover.right && position.y+rect.top>=cover.top && position.y+rect.top<=cover.bottom;
    if(explicit && window.matchMedia('(max-width:640px)').matches){setOpen(false);setPeekId(comment.id);onLookAt(comment.anchor);}
    else if(!position || covered)onLookAt(comment.anchor);
  },[container,onLookAt,open]);
  const hoverComment=useCallback((comment:MemoryComment|null)=>{
    if(hoverTimer.current)clearTimeout(hoverTimer.current);
    if(!comment?.anchor){if(window.matchMedia('(hover:hover)').matches)setActiveId(null);return;}
    setActiveId(comment.id);
    hoverTimer.current=setTimeout(()=>focusComment(comment),160);
  },[focusComment]);
  const focusedComment=useCallback((comment:MemoryComment)=>focusComment(comment,true),[focusComment]);
  const anchoredComments=useMemo(()=>comments.map(comment=>({...comment,anchor:anchorForComment(comment)})),[comments,anchorForComment]);
  const points=frame?anchoredComments.flatMap((comment,index)=>{
    const position=comment.anchor?anchorToScreen(frame,comment.anchor):null;
    return position?[{comment,index,position}]:[];
  }):[];
  const preview=points.find(point=>point.comment.id===peekId);
  const selectedPoint=frame&&selected?anchorToScreen(frame,selected):null;
  return <>
    <div className="panorama-comment-points" aria-label="거리뷰에 남긴 댓글 지점">
      {points.map(({comment,index,position})=><button key={comment.id} type="button" className={`panorama-comment-point${activeId===comment.id?' is-active':''}`} style={{left:0,top:0,transform:`translate3d(${position.x}px,${position.y}px,0) translate(-50%,-50%)`}} aria-label={`거리뷰 댓글 지점 ${index+1}`} aria-describedby={peekId===comment.id?`panorama-peek-${comment.id}`:undefined}
        onMouseEnter={()=>{setActiveId(comment.id);setPeekId(comment.id);}} onMouseLeave={()=>{if(window.matchMedia('(hover:hover)').matches&&!peekLocked){setActiveId(null);setPeekId(null);}}}
        onFocus={()=>{setActiveId(comment.id);setPeekId(comment.id);}} onBlur={()=>{if(window.matchMedia('(hover:hover)').matches&&!peekLocked){setActiveId(null);setPeekId(null);}}}
        onClick={()=>{setActiveId(comment.id);setPeekId(comment.id);setPeekLocked(true);setOpen(true);}}><MessageCircle size={15}/><span>{index+1}</span></button>)}
      {selectedPoint&&<span className="panorama-selected-point" aria-label="선택한 댓글 지점" style={{left:selectedPoint.x,top:selectedPoint.y}}><span>+</span></span>}
      {preview&&frame&&<div id={`panorama-peek-${preview.comment.id}`} className="panorama-comment-peek" role="tooltip" style={{left:Math.max(12,Math.min(frame.width-272,preview.position.x+24)),top:Math.max(112,Math.min(frame.height-180,preview.position.y-100))}}><strong>{preview.comment.owned?'나':'익명의 여행자'}</strong><p>{preview.comment.content}</p></div>}
    </div>
    <button type="button" className="panorama-comments-toggle" aria-label={open?'거리뷰 댓글 닫기':'거리뷰 댓글 열기'} aria-expanded={open} aria-controls="panorama-comment-panel" onClick={()=>setOpen(value=>!value)}><MessageCircle size={17}/><span>댓글</span>{open&&<X size={15}/>}</button>
    {open&&<p className="panorama-comment-hint">화면을 클릭해 지점에 댓글 남기기 · 드래그로 둘러보기</p>}
    <aside ref={panel} id="panorama-comment-panel" className="panorama-comments-panel" hidden={!open}>
      <MemoryComments key={`${memoryId}:${authenticated}`} memoryId={memoryId} memoryTitle={memoryTitle} authenticated={authenticated} visible={open} selectedAnchor={selected} onClearAnchor={clearSelected} anchorForComment={anchorForComment} onCommentsChange={setComments} activeCommentId={activeId} onHoverComment={hoverComment} onFocusAnchor={focusedComment}/>
    </aside>
  </>;
}
