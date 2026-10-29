import {isPagesRuntime,isPagesAuthenticated} from '@/src/lib/runtime';
import {discoveriesSchema,discoverySchema,storyIdSchema,type StoryDiscovery} from './model';
const key='yurang:place-stories:v1';
function readLocal(){try{return discoveriesSchema.parse(JSON.parse(localStorage.getItem(key)??'[]'));}catch{return [];}}
async function responseData(response:Response){const body=await response.json() as {data:unknown;message?:string};if(!response.ok)throw new Error(body.message??'발견한 이야기를 보관하지 못했어요.');return body.data;}
export async function fetchDiscoveries(signal:AbortSignal){
 if(isPagesRuntime()){if(!isPagesAuthenticated())throw new Error('로그인이 필요합니다.');return readLocal();}
 return discoveriesSchema.parse(await responseData(await fetch('/api/users/me/discoveries',{signal,cache:'no-store'})));
}
export async function recordDiscovery(storyId:string):Promise<StoryDiscovery>{
 storyIdSchema.parse(storyId);
 if(isPagesRuntime()){
  if(!isPagesAuthenticated())throw new Error('로그인이 필요합니다.');
  const current=readLocal(),existing=current.find(item=>item.storyId===storyId);if(existing)return existing;
  const record={storyId,discoveredAt:new Date().toISOString()};localStorage.setItem(key,JSON.stringify([record,...current]));return record;
 }
 return discoverySchema.parse(await responseData(await fetch('/api/users/me/discoveries',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({storyId})})));
}
