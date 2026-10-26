'use client';
import {useLayoutEffect,useRef,useState} from 'react';
import {placeAnnotationPeek,type OverlayRect} from '@/src/features/panorama/annotation-layout';
import type {MemoryComment} from '@/src/features/memories/comments-model';

export default function PanoramaCommentPeek({container,comment,position,panelOpen}:{container:HTMLElement;comment:MemoryComment;position:{x:number;y:number};panelOpen:boolean}){
 const element=useRef<HTMLDivElement>(null);
 const {x,y}=position;
 const [layout,setLayout]=useState<{x:number;y:number}|null>(null);
 useLayoutEffect(()=>{
  const tooltip=element.current,stage=container.parentElement;if(!tooltip||!stage)return;
  const update=()=>{
   const canvas=container.getBoundingClientRect(),bubble=tooltip.getBoundingClientRect();
   if(!canvas.width||!canvas.height)return;
   const obstacles:OverlayRect[]=[];
   const controls=[...stage.querySelectorAll<HTMLElement>('.panorama-comments-panel:not([hidden]),.panorama-comments-toggle,.panorama-comment-hint'),...container.querySelectorAll<HTMLElement>('a,button,[role="button"],[role="slider"]')];
   for(const control of controls){const rect=control.getBoundingClientRect();if(rect.width&&rect.height)obstacles.push({x:rect.left-canvas.left,y:rect.top-canvas.top,width:rect.width,height:rect.height});}
   const next=placeAnnotationPeek({x,y},canvas,bubble,obstacles);
   setLayout(old=>old?.x===next.x&&old.y===next.y?old:next);
  };
  update();const observer=new ResizeObserver(update);observer.observe(tooltip);observer.observe(container);
  const panel=stage.querySelector('.panorama-comments-panel');if(panel)observer.observe(panel);
  return ()=>observer.disconnect();
 },[container,x,y,panelOpen,comment.content]);
 return <div ref={element} id={`panorama-peek-${comment.id}`} className="panorama-comment-peek" role="tooltip" style={{left:layout?.x??12,top:layout?.y??12,...(!layout?{visibility:'hidden' as const}:{})}}><strong>{comment.owned?'나':'익명의 여행자'}</strong><p>{comment.content}</p></div>;
}
