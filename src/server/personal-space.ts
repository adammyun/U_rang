import { database, ensureSeedData, getMemory, toMemories, type MemoryRow } from './memory-store';
import type { MemoryActivity, PersonalQuery, PersonalSpace } from '@/src/features/memories/personal-model';
import { emotions } from '@/src/features/memories/model';

// Idempotent initialization also supports already-deployed databases. The same
// additive schema lives in drizzle/0001_memory_activity.sql for local migrations.
let schemaReady: Promise<unknown> | null = null;
export function ensureActivitySchema() {
  schemaReady ??= database().batch([
    database().prepare(`create table if not exists memory_reactions (memory_id text not null references memories(id) on delete cascade, user_id text not null, kind text not null check(kind in ('like','bookmark')), created_at text not null, primary key(memory_id,user_id,kind))`),
    database().prepare(`create index if not exists memory_reactions_user_kind_idx on memory_reactions(user_id,kind,created_at)`),
    database().prepare(`create table if not exists memory_views (memory_id text not null references memories(id) on delete cascade, viewer_key text not null, created_at text not null, primary key(memory_id,viewer_key))`),
  ]).catch(error => { schemaReady = null; throw error; });
  return schemaReady;
}

export async function getActivity(id: string, userId?: string): Promise<MemoryActivity | null> {
  if (!await getMemory(id, userId)) return null;
  await ensureActivitySchema();
  const row = await database().prepare(`select
    (select count(*) from memory_reactions where memory_id = ? and kind='like') as likes,
    (select count(*) from memory_views where memory_id = ?) as views,
    exists(select 1 from memory_reactions where memory_id = ? and user_id = ? and kind='like') as liked,
    exists(select 1 from memory_reactions where memory_id = ? and user_id = ? and kind='bookmark') as bookmarked`)
    .bind(id,id,id,userId ?? '',id,userId ?? '').first<{likes:number; views:number; liked:number; bookmarked:number}>();
  return row ? { likes: row.likes, views: row.views, liked: Boolean(row.liked), bookmarked: Boolean(row.bookmarked) } : null;
}

export async function changeActivity(id: string, action: 'like'|'bookmark'|'view', active: boolean, userId?: string, visitorId?: string) {
  if (!await getMemory(id, userId)) return null;
  await ensureActivitySchema();
  if (action === 'view') {
    // No IP address, email or raw account identifier is stored in view records.
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(userId ? `account:${userId}` : `visitor:${visitorId}`));
    const key = Array.from(new Uint8Array(bytes), value=>value.toString(16).padStart(2,'0')).join('');
    await database().prepare(`insert or ignore into memory_views(memory_id,viewer_key,created_at) values(?,?,?)`).bind(id,key,new Date().toISOString()).run();
  } else {
    if (!userId) throw new Error('로그인이 필요합니다.');
    if (active) await database().prepare(`insert or ignore into memory_reactions(memory_id,user_id,kind,created_at) values(?,?,?,?)`).bind(id,userId,action,new Date().toISOString()).run();
    else await database().prepare(`delete from memory_reactions where memory_id=? and user_id=? and kind=?`).bind(id,userId,action).run();
  }
  return getActivity(id,userId);
}

const readable = `(m.visibility='public' or m.user_id=?)`;
const saved = (kind: 'like'|'bookmark') => `exists(select 1 from memory_reactions r where r.memory_id=m.id and r.user_id=? and r.kind='${kind}')`;

export async function getPersonalSpace(userId: string, displayName: string, query: PersonalQuery): Promise<PersonalSpace> {
  await ensureSeedData(); await ensureActivitySchema();
  const db = database();
  const groups = [
    { key:'mine' as const, clause:'m.user_id=?', params:[userId] },
    { key:'bookmarked' as const, clause:saved('bookmark'), params:[userId] },
    { key:'liked' as const, clause:saved('like'), params:[userId] },
  ];
  const lists = {} as PersonalSpace['lists'];
  const totals = {} as PersonalSpace['totals'];
  const filters:string[]=[];const filterParams:(string|number)[]=[];
  if(query.year){filters.push('substr(m.memory_date,1,4)=?');filterParams.push(String(query.year));}
  if(query.emotions.length){filters.push(`m.emotion in (${query.emotions.map(()=>'?').join(',')})`);filterParams.push(...query.emotions);}
  if(query.visibility){filters.push('m.visibility=?');filterParams.push(query.visibility);}
  for (const group of groups) {
    const where = `${readable} and ${group.clause}`;
    const params = [userId,...group.params];
    const [rows, count] = await Promise.all([
      db.prepare(`select m.* from memories m where ${where} ${filters.length?'and '+filters.join(' and '):''} order by coalesce(m.memory_date,m.created_at) desc,m.id limit 40`).bind(...params,...filterParams).all<MemoryRow>(),
      db.prepare(`select count(*) as count from memories m where ${where}`).bind(...params).first<{count:number}>(),
    ]);
    lists[group.key] = await toMemories(rows.results,userId,true);
    totals[group.key] = count?.count ?? 0;
  }
  const selected = groups.filter(group=>query[group.key]);
  const clauses = [readable, selected.length ? `(${selected.map(group=>group.clause).join(' or ')})` : '0'];
  const params: (string|number)[] = [userId,...selected.flatMap(group=>group.params)];
  // Owner map uses exact coordinates; every other memory uses public coordinates.
  clauses.push(`case when m.user_id=? then m.longitude else m.public_longitude end between ? and ?`, `case when m.user_id=? then m.latitude else m.public_latitude end between ? and ?`);
  params.push(userId,query.west,query.east,userId,query.south,query.north);
  if(query.year) { clauses.push(`substr(m.memory_date,1,4)=?`); params.push(String(query.year)); }
  if(query.emotions.length) { clauses.push(`m.emotion in (${query.emotions.map(()=>'?').join(',')})`); params.push(...query.emotions); }
  if(query.visibility){clauses.push('m.visibility=?');params.push(query.visibility);}
  const mapped = await db.prepare(`select m.* from memories m where ${clauses.join(' and ')} order by coalesce(m.memory_date,m.created_at) desc,m.id limit 201`).bind(...params).all<MemoryRow>();
  // Recommendations derive only from the viewer's own memories and readable
  // public candidates. No popularity ranking, author identities or private counts.
  const candidates = await db.prepare(`select m.* from memories m where m.visibility='public' and m.user_id<>?
    order by (exists(select 1 from memories own where own.user_id=? and own.location_name=m.location_name)) desc,
    (exists(select 1 from memories own where own.user_id=? and own.emotion=m.emotion)) desc,
    coalesce(m.memory_date,m.created_at) desc,m.id limit 8`).bind(userId,userId,userId).all<MemoryRow>();
  const preferences = await db.prepare(`select distinct emotion,location_name from memories where user_id=? limit 300`).bind(userId).all<{emotion:keyof typeof emotions;location_name:string}>();
  const recommendations = (await toMemories(candidates.results,userId)).map(memory=>({memory,reason:preferences.results.some(row=>row.location_name===memory.location_name) ? '내가 기록한 장소의 다른 이야기' : preferences.results.some(row=>row.emotion===memory.emotion) ? `내 기록과 닮은 ${emotions[memory.emotion].label}의 순간` : '울산에서 만나는 다른 이야기'}));
  return {displayName,totals,lists,mapMemories:await toMemories(mapped.results.slice(0,200),userId,true),hasMore:mapped.results.length>200,recommendations};
}
