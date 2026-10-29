'use client';
import {useCallback,useEffect,useState} from 'react';
import {fetchDiscoveries,recordDiscovery} from '@/src/features/stories/api';
import type {StoryDiscovery} from '@/src/features/stories/model';
export function useStoryCollection(authenticated:boolean){
 const [items,setItems]=useState<StoryDiscovery[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState(false),[revision,setRevision]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();
  Promise.resolve().then(async()=>{
   if(controller.signal.aborted)return;
   if(!authenticated){setItems([]);setError(false);setLoading(false);return;}
   setLoading(true);setError(false);
   try{
    const records=await fetchDiscoveries(controller.signal);
    if(!controller.signal.aborted)setItems(current=>[...records,...current.filter(item=>!records.some(record=>record.storyId===item.storyId))].sort((a,b)=>b.discoveredAt.localeCompare(a.discoveredAt)));
   }catch{if(!controller.signal.aborted)setError(true);}
   finally{if(!controller.signal.aborted)setLoading(false);}
  });
  return ()=>controller.abort();
 },[authenticated,revision]);
 const discover=useCallback(async(storyId:string)=>{
  if(!authenticated)throw new Error('로그인이 필요합니다.');
  const record=await recordDiscovery(storyId);setItems(current=>[record,...current.filter(item=>item.storyId!==record.storyId)].sort((a,b)=>b.discoveredAt.localeCompare(a.discoveredAt)));return record;
 },[authenticated]);
 return {items:authenticated?items:[],loading:authenticated&&loading,error:authenticated&&error,discover,refresh:()=>setRevision(value=>value+1)};
}
