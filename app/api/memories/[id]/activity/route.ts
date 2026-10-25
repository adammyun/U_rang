import { getChatGPTUser } from '@/app/chatgpt-auth';
import { memoryIdSchema } from '@/src/features/memories/schemas';
import { activityInputSchema } from '@/src/features/memories/personal-schemas';
import { changeActivity, getActivity } from '@/src/server/personal-space';
import { assertSameOrigin, errorResponse } from '@/src/server/responses';

type Context = {params:Promise<{id:string}>};
const reply = (data:unknown) => data ? Response.json({data},{headers:{'cache-control':'private, no-store'}}) : Response.json({message:'기억을 찾지 못했습니다.'},{status:404,headers:{'cache-control':'private, no-store'}});
export async function GET(_:Request, context:Context) {
  try { const id=memoryIdSchema.parse((await context.params).id); const user=await getChatGPTUser(); return reply(await getActivity(id,user?.userId)); }
  catch(error) { return errorResponse(error); }
}
export async function POST(request:Request, context:Context) {
  try {
    assertSameOrigin(request);
    const id=memoryIdSchema.parse((await context.params).id);
    const input=activityInputSchema.parse(await request.json());
    const user=await getChatGPTUser();
    if(input.action!=='view'&&!user) return Response.json({message:'로그인이 필요합니다.'},{status:401});
    return reply(await changeActivity(id,input.action,input.action==='view'?true:input.active,user?.userId,input.action==='view'?input.visitorId:undefined));
  } catch(error) { return errorResponse(error); }
}
