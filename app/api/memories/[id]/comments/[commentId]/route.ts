import { getChatGPTUser } from '@/app/chatgpt-auth';
import { memoryIdSchema } from '@/src/features/memories/schemas';
import { deleteComment } from '@/src/server/comments';
import { assertSameOrigin, errorResponse } from '@/src/server/responses';

export async function DELETE(request:Request, context:{params:Promise<{id:string;commentId:string}>}) {
  try {
    assertSameOrigin(request);
    const user=await getChatGPTUser();
    if(!user)return Response.json({message:'로그인이 필요합니다.'},{status:401});
    const params=await context.params;
    const deleted=await deleteComment(memoryIdSchema.parse(params.id),memoryIdSchema.parse(params.commentId),user.userId);
    return deleted ? new Response(null,{status:204}) : Response.json({message:'삭제할 댓글을 찾지 못했습니다.'},{status:404});
  } catch(error) { return errorResponse(error); }
}
