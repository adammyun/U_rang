import {getChatGPTUser} from '@/app/chatgpt-auth';
import {getStoryDiscoveries,discoverStory} from '@/src/server/story-discoveries';
import {discoveryInputSchema} from '@/src/features/stories/model';
import {assertSameOrigin,errorResponse} from '@/src/server/responses';
const headers={'cache-control':'private, no-store'};
export async function GET(){
 try{const user=await getChatGPTUser();if(!user)return Response.json({message:'로그인이 필요합니다.'},{status:401,headers});return Response.json({data:await getStoryDiscoveries(user.userId)},{headers});}catch(error){return errorResponse(error);}
}
export async function POST(request:Request){
 try{assertSameOrigin(request);const user=await getChatGPTUser();if(!user)return Response.json({message:'로그인이 필요합니다.'},{status:401,headers});const {storyId}=discoveryInputSchema.parse(await request.json());return Response.json({data:await discoverStory(user.userId,storyId)},{headers});}catch(error){return errorResponse(error);}
}
