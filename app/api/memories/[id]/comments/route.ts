import { getChatGPTUser } from '@/app/chatgpt-auth';
import { memoryIdSchema } from '@/src/features/memories/schemas';
import { commentCursorSchema, commentInputSchema } from '@/src/features/memories/comments-model';
import { listComments, createComment } from '@/src/server/comments';
import { assertSameOrigin, errorResponse } from '@/src/server/responses';

type Context = {params:Promise<{id:string}>};
const headers = {'cache-control':'private, no-store'};
export async function GET(request:Request, context:Context) {
  try {
    const id=memoryIdSchema.parse((await context.params).id), user=await getChatGPTUser();
    const value=new URL(request.url).searchParams.get('cursor');
    const data=await listComments(id,user?.userId,value===null?undefined:commentCursorSchema.parse(value));
    return data ? Response.json({data},{headers}) : Response.json({message:'기억을 찾지 못했습니다.'},{status:404,headers});
  } catch(error) { return errorResponse(error); }
}
export async function POST(request:Request, context:Context) {
  try {
    assertSameOrigin(request);
    const user=await getChatGPTUser();
    if(!user)return Response.json({message:'로그인이 필요합니다.'},{status:401,headers});
    const id=memoryIdSchema.parse((await context.params).id);
    const input=commentInputSchema.parse(await request.json());
    const data=await createComment(id,user.userId,input.content,input.anchor??null);
    return data ? Response.json({data},{status:201,headers}) : Response.json({message:'기억을 찾지 못했습니다.'},{status:404,headers});
  } catch(error) { return errorResponse(error); }
}
