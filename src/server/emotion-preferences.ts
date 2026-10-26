import {database} from './memory-store';
import {defaultEmotionPreferences,emotionPreferencesSchema,type EmotionPreferences} from '@/src/features/memories/emotion-preferences';
let schema:Promise<unknown>|null=null;
function ensureSchema(){
 schema??=database().prepare(`create table if not exists user_preferences (user_id text primary key not null,emotion_menu text not null,updated_at text not null)`).run().catch(error=>{schema=null;throw error;});
 return schema;
}
export async function getEmotionPreferences(userId:string):Promise<EmotionPreferences>{
 await ensureSchema();
 const row=await database().prepare('select emotion_menu from user_preferences where user_id=?').bind(userId).first<{emotion_menu:string}>();
 if(!row)return defaultEmotionPreferences();
 try{return emotionPreferencesSchema.parse({emotionMenu:JSON.parse(row.emotion_menu)});}catch{return defaultEmotionPreferences();}
}
export async function saveEmotionPreferences(userId:string,value:EmotionPreferences){
 await ensureSchema();
 await database().prepare(`insert into user_preferences(user_id,emotion_menu,updated_at) values(?,?,?) on conflict(user_id) do update set emotion_menu=excluded.emotion_menu,updated_at=excluded.updated_at`).bind(userId,JSON.stringify(value.emotionMenu),new Date().toISOString()).run();
 return value;
}
