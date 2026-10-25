import { isPagesRuntime } from '@/src/lib/runtime';
import { browserActivity, browserPersonalSpace } from './browser-store';
import type { MemoryActivity, PersonalQuery, PersonalSpace } from './personal-model';

export const ACTIVITY_CHANGED_EVENT='yurang:activity-changed';
async function data<T>(response:Response):Promise<T> {
  const body=await response.json() as {data:T;message?:string};
  if(!response.ok) throw new Error(body.message ?? '정보를 불러오지 못했어요.');
  return body.data;
}
export async function fetchPersonalSpace(query:PersonalQuery, signal:AbortSignal) {
  if(isPagesRuntime()) return browserPersonalSpace(query,signal);
  const params=new URLSearchParams({west:String(query.west),east:String(query.east),north:String(query.north),south:String(query.south),mine:query.mine?'1':'0',bookmarked:query.bookmarked?'1':'0',liked:query.liked?'1':'0',emotion:query.emotions.join(',')});
  if(query.year) params.set('year',String(query.year));
  if(query.visibility) params.set('visibility',query.visibility);
  return data<PersonalSpace>(await fetch(`/api/users/me/space?${params}`,{signal,cache:'no-store'}));
}
export async function fetchActivity(id:string, signal:AbortSignal) {
  if(isPagesRuntime()) return browserActivity(id);
  return data<MemoryActivity>(await fetch(`/api/memories/${encodeURIComponent(id)}/activity`,{signal,cache:'no-store'}));
}
function visitorId() {
  const key='yurang:view-session';
  try { const existing=sessionStorage.getItem(key); if(existing)return existing; const id=crypto.randomUUID();sessionStorage.setItem(key,id);return id; }
  catch { return crypto.randomUUID(); }
}
export async function setActivity(id:string,action:'like'|'bookmark'|'view',active=true) {
  const result=isPagesRuntime()?await browserActivity(id,action,active):await data<MemoryActivity>(await fetch(`/api/memories/${encodeURIComponent(id)}/activity`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(action==='view'?{action,visitorId:visitorId()}:{action,active})}));
  if(action!=='view') window.dispatchEvent(new Event(ACTIVITY_CHANGED_EVENT));
  return result;
}
