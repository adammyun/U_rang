import { database, getMemory } from './memory-store';
import { COMMENT_PAGE_SIZE, encodeCommentCursor, type CommentCursor, type CommentPage, type MemoryComment } from '@/src/features/memories/comments-model';

let schemaReady: Promise<unknown> | null = null;
// Same additive schema as drizzle/0002_memory_comments.sql; supports existing live DBs.
export function ensureCommentSchema() {
  schemaReady ??= database().batch([
    database().prepare(`create table if not exists memory_comments (id text primary key not null, memory_id text not null references memories(id) on delete cascade, user_id text not null, content text not null check(length(trim(content)) between 1 and 1000), created_at text not null)`),
    database().prepare(`create index if not exists memory_comments_memory_created_idx on memory_comments(memory_id,created_at,id)`),
  ]).catch(error => { schemaReady = null; throw error; });
  return schemaReady;
}
const readable = `(m.visibility='public' or m.user_id=?)`;
// Author identity never enters the DTO, including for non-anonymous memories.
export async function listComments(memoryId: string, userId?: string, cursor?: CommentCursor): Promise<CommentPage | null> {
  if (!await getMemory(memoryId,userId)) return null;
  await ensureCommentSchema();
  const rows = await database().prepare(`select c.id,c.content,c.created_at as createdAt,(c.user_id=?) as owned
    from memory_comments c join memories m on m.id=c.memory_id
    where c.memory_id=? and ${readable} ${cursor ? 'and (c.created_at,c.id)>(?,?)' : ''}
    order by c.created_at,c.id limit ?`)
    .bind(userId??'',memoryId,userId??'',...(cursor ? [cursor.createdAt,cursor.id] : []),COMMENT_PAGE_SIZE+1)
    .all<{id:string;content:string;createdAt:string;owned:number}>();
  const comments = rows.results.slice(0,COMMENT_PAGE_SIZE).map(row=>({...row,owned:Boolean(row.owned)}));
  const last = comments.at(-1);
  return {comments,nextCursor:rows.results.length>COMMENT_PAGE_SIZE && last ? encodeCommentCursor({createdAt:last.createdAt,id:last.id}) : null};
}
export async function createComment(memoryId: string, userId: string, content: string): Promise<MemoryComment | null> {
  if (!await getMemory(memoryId,userId)) return null;
  await ensureCommentSchema();
  const id=crypto.randomUUID(), createdAt=new Date().toISOString();
  // Recheck access in the mutation itself if visibility changed after lookup.
  const result = await database().prepare(`insert into memory_comments(id,memory_id,user_id,content,created_at)
    select ?,m.id,?,?,? from memories m where m.id=? and ${readable}`)
    .bind(id,userId,content,createdAt,memoryId,userId).run();
  return result.meta.changes ? {id,content,createdAt,owned:true} : null;
}
export async function deleteComment(memoryId:string, id:string, userId:string) {
  if (!await getMemory(memoryId,userId)) return false;
  await ensureCommentSchema();
  const result=await database().prepare(`delete from memory_comments where id=? and memory_id=? and user_id=?
    and exists(select 1 from memories m where m.id=memory_comments.memory_id and ${readable})`)
    .bind(id,memoryId,userId,userId).run();
  return Boolean(result.meta.changes);
}
