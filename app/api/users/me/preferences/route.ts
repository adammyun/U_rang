import {getChatGPTUser} from '@/app/chatgpt-auth';
import {emotionPreferencesSchema} from '@/src/features/memories/emotion-preferences';
import {getEmotionPreferences,saveEmotionPreferences} from '@/src/server/emotion-preferences';
import {assertSameOrigin,errorResponse} from '@/src/server/responses';
const headers={'cache-control':'private, no-store'};
export async function GET(){
 try{const user=await getChatGPTUser();if(!user)return Response.json({message:'로그인이 필요합니다.'},{status:401,headers});return Response.json({data:await getEmotionPreferences(user.userId)},{headers});}
 catch(error){return errorResponse(error);}
}
export async function PUT(request:Request){
 try{assertSameOrigin(request);const user=await getChatGPTUser();if(!user)return Response.json({message:'로그인이 필요합니다.'},{status:401,headers});const value=emotionPreferencesSchema.parse(await request.json());return Response.json({data:await saveEmotionPreferences(user.userId,value)},{headers});}
 catch(error){return errorResponse(error);}
}
