import { demoCommentsForMemory } from '@/src/features/memories/demo-comments';
import { database, getMemory } from './memory-store';
import { COMMENT_PAGE_SIZE, encodeCommentCursor, type CommentCursor, type CommentPage, type MemoryComment, type PanoramaAnchor } from '@/src/features/memories/comments-model';

let schemaReady: Promise<unknown> | null = null;
// Same additive schema as drizzle/0002 and 0003; supports existing live DBs.
export function ensureCommentSchema() {
  schemaReady ??= database().batch([
    database().prepare(`create table if not exists memory_comments (id text primary key not null, memory_id text not null references memories(id) on delete cascade, user_id text not null, content text not null check(length(trim(content)) between 1 and 1000), created_at text not null)`),
    database().prepare(`create index if not exists memory_comments_memory_created_idx on memory_comments(memory_id,created_at,id)`),
    database().prepare(`create table if not exists memory_comment_anchors (comment_id text primary key not null references memory_comments(id) on delete cascade, pano_id text not null check(length(pano_id) between 1 and 256), pan real not null check(pan between -180 and 180), tilt real not null check(tilt between -90 and 90))`),
  ]).catch(error => { schemaReady = null; throw error; });
  return schemaReady;
}
const exampleSeeds=new Map<string,Promise<unknown>>();
async function ensureExampleComments(memoryId:string){
  const examples=demoCommentsForMemory(memoryId);if(!examples.length)return;
  let pending=exampleSeeds.get(memoryId);
  if(!pending){
    pending=database().batch(examples.map(comment=>database().prepare(`insert or ignore into memory_comments(id,memory_id,user_id,content,created_at)
      select ?,m.id,?,?,? from memories m where m.id=? and m.user_id=? and m.visibility='public'`)
      .bind(comment.id,comment.ownerId,comment.content,comment.createdAt,comment.memoryId,comment.memoryOwnerId)))
      .catch(error=>{exampleSeeds.delete(memoryId);throw error;});
    exampleSeeds.set(memoryId,pending);
  }
  await pending;
}
const readable = `(m.visibility='public' or m.user_id=?)`;
// Author identity never enters the DTO, including for non-anonymous memories.
export async function listComments(memoryId: string, userId?: string, cursor?: CommentCursor): Promise<CommentPage | null> {
  if (!await getMemory(memoryId,userId)) return null;
  await ensureCommentSchema();
  await ensureExampleComments(memoryId);
  const rows = await database().prepare(`select c.id,c.content,c.created_at as createdAt,(c.user_id=?) as owned,a.pano_id as panoId,a.pan,a.tilt
    from memory_comments c join memories m on m.id=c.memory_id left join memory_comment_anchors a on a.comment_id=c.id
    where c.memory_id=? and ${readable} ${cursor ? 'and (c.created_at,c.id)>(?,?)' : ''}
    order by c.created_at,c.id limit ?`)
    .bind(userId??'',memoryId,userId??'',...(cursor ? [cursor.createdAt,cursor.id] : []),COMMENT_PAGE_SIZE+1)
    .all<{id:string;content:string;createdAt:string;owned:number;panoId:string|null;pan:number|null;tilt:number|null}>();
  const comments = rows.results.slice(0,COMMENT_PAGE_SIZE).map(row=>({id:row.id,content:row.content,createdAt:row.createdAt,owned:Boolean(row.owned),anchor:row.panoId!==null && row.pan!==null && row.tilt!==null ? {panoId:row.panoId,pan:row.pan,tilt:row.tilt}:null}));
  const last = comments.at(-1);
  return {comments,nextCursor:rows.results.length>COMMENT_PAGE_SIZE && last ? encodeCommentCursor({createdAt:last.createdAt,id:last.id}) : null};
}
export async function createComment(memoryId: string, userId: string, content: string, anchor: PanoramaAnchor | null = null): Promise<MemoryComment | null> {
  if (!await getMemory(memoryId,userId)) return null;
  await ensureCommentSchema();
  const id=crypto.randomUUID(), createdAt=new Date().toISOString();
  // Recheck access in the mutation itself if visibility changed after lookup.
  const insert = database().prepare(`insert into memory_comments(id,memory_id,user_id,content,created_at)
    select ?,m.id,?,?,? from memories m where m.id=? and ${readable}`)
    .bind(id,userId,content,createdAt,memoryId,userId);
  const statements=[insert];
  if(anchor)statements.push(database().prepare(`insert into memory_comment_anchors(comment_id,pano_id,pan,tilt)
    select c.id,?,?,? from memory_comments c join memories m on m.id=c.memory_id
    where c.id=? and c.user_id=? and ${readable}`).bind(anchor.panoId,anchor.pan,anchor.tilt,id,userId,userId));
  const [result]=await database().batch(statements);
  return result.meta.changes ? {id,content,createdAt,owned:true,anchor} : null;
}
export async function deleteComment(memoryId:string, id:string, userId:string) {
  if (!await getMemory(memoryId,userId)) return false;
  await ensureCommentSchema();
  const result=await database().prepare(`delete from memory_comments where id=? and memory_id=? and user_id=?
    and exists(select 1 from memories m where m.id=memory_comments.memory_id and ${readable})`)
    .bind(id,memoryId,userId,userId).run();
  return Boolean(result.meta.changes);
}
