import { getChatGPTUser } from '@/app/chatgpt-auth';
import { personalQuerySchema } from '@/src/features/memories/personal-schemas';
import { getPersonalSpace } from '@/src/server/personal-space';
import { errorResponse, queryObject } from '@/src/server/responses';

export async function GET(request:Request) {
  const user=await getChatGPTUser();
  if(!user) return Response.json({message:'로그인이 필요합니다.'},{status:401});
  try {
    const query=personalQuerySchema.parse(queryObject(request));
    const displayName=user.fullName ?? (user.displayName.includes('@')?'나':user.displayName);
    return Response.json({data:await getPersonalSpace(user.userId,displayName,query)},{headers:{'cache-control':'private, no-store'}});
  } catch(error) { return errorResponse(error); }
}
