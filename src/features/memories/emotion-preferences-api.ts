import {isPagesRuntime,isPagesAuthenticated} from '@/src/lib/runtime';
import {defaultEmotionPreferences,emotionPreferencesSchema,type EmotionPreferences} from './emotion-preferences';
const key='yurang:emotion-menu:v1';
async function data(response:Response):Promise<EmotionPreferences>{const body=await response.json() as {data:EmotionPreferences;message?:string};if(!response.ok)throw new Error(body.message??'감정 메뉴를 저장하지 못했어요.');return emotionPreferencesSchema.parse(body.data);}
export async function fetchEmotionPreferences(signal:AbortSignal):Promise<EmotionPreferences>{
 if(isPagesRuntime()){
  if(!isPagesAuthenticated())throw new Error('로그인이 필요합니다.');
  try{const stored=localStorage.getItem(key);return stored?emotionPreferencesSchema.parse(JSON.parse(stored)):defaultEmotionPreferences();}catch{return defaultEmotionPreferences();}
 }
 return data(await fetch('/api/users/me/preferences',{signal,cache:'no-store'}));
}
export async function updateEmotionPreferences(preferences:EmotionPreferences){
 const value=emotionPreferencesSchema.parse(preferences);
 if(isPagesRuntime()){if(!isPagesAuthenticated())throw new Error('로그인이 필요합니다.');localStorage.setItem(key,JSON.stringify(value));return value;}
 return data(await fetch('/api/users/me/preferences',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(value)}));
}
