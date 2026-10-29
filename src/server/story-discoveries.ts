import {database} from './memory-store';
import {getPlaceStory} from '@/src/features/stories/catalog';
let schema:Promise<unknown>|null=null;
function ensureSchema(){
 schema??=database().prepare('create table if not exists story_discoveries(user_id text not null,story_id text not null,discovered_at text not null,primary key(user_id,story_id))').run().catch(error=>{schema=null;throw error;});return schema;
}
export async function getStoryDiscoveries(userId:string){
 await ensureSchema();
 const rows=await database().prepare('select story_id as storyId,discovered_at as discoveredAt from story_discoveries where user_id=? order by discovered_at desc,story_id limit 100').bind(userId).all<{storyId:string;discoveredAt:string}>();
 return rows.results.filter(row=>getPlaceStory(row.storyId));
}
export async function discoverStory(userId:string,storyId:string){
 if(!getPlaceStory(storyId))throw new Error('알 수 없는 장소 이야기입니다.');
 await ensureSchema();
 await database().prepare('insert into story_discoveries(user_id,story_id,discovered_at) values(?,?,?) on conflict(user_id,story_id) do nothing').bind(userId,storyId,new Date().toISOString()).run();
 return database().prepare('select story_id as storyId,discovered_at as discoveredAt from story_discoveries where user_id=? and story_id=?').bind(userId,storyId).first<{storyId:string;discoveredAt:string}>();
}
