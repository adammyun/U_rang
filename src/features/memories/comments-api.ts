import { isPagesRuntime } from '@/src/lib/runtime';
import { browserComments, createBrowserComment, deleteBrowserComment } from './browser-store';
import { commentCursorSchema, commentInputSchema, type CommentPage, type MemoryComment } from './comments-model';

async function data<T>(response:Response):Promise<T> {
  const body=await response.json() as {data:T;message?:string};
  if(!response.ok)throw new Error(body.message ?? '댓글을 불러오지 못했습니다.');
  return body.data;
}
const endpoint=(id:string)=>`/api/memories/${encodeURIComponent(id)}/comments`;
export async function fetchComments(id:string,signal:AbortSignal,cursor?:string):Promise<CommentPage> {
  if(isPagesRuntime())return browserComments(id,cursor?commentCursorSchema.parse(cursor):undefined);
  return data(await fetch(endpoint(id)+(cursor?'?'+new URLSearchParams({cursor}):''),{signal,cache:'no-store'}));
}
export async function postComment(id:string,content:string):Promise<MemoryComment> {
  const input=commentInputSchema.parse({content});
  if(isPagesRuntime())return createBrowserComment(id,input.content);
  return data(await fetch(endpoint(id),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)}));
}
export async function removeComment(memoryId:string,id:string) {
  if(isPagesRuntime())return deleteBrowserComment(memoryId,id);
  const response=await fetch(`${endpoint(memoryId)}/${encodeURIComponent(id)}`,{method:'DELETE'});
  if(!response.ok)await data(response);
}
