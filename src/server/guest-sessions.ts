import {database} from './memory-store';
export const GUEST_COOKIE='yurang_guest_session';
export const GUEST_SESSION_SECONDS=7*24*60*60;
let schema:Promise<unknown>|null=null;
function ensureSchema(){
 schema??=database().batch([
  database().prepare('create table if not exists guest_sessions (token_hash text primary key not null,user_id text not null,expires_at text not null,created_at text not null)'),
  database().prepare('create index if not exists guest_sessions_expiry_idx on guest_sessions(expires_at)'),
 ]).catch(error=>{schema=null;throw error;});
 return schema;
}
function readToken(cookie:string|null){
 const values=(cookie??'').split(';').map(value=>value.trim()).filter(value=>value.startsWith(GUEST_COOKIE+'=')).map(value=>value.slice(GUEST_COOKIE.length+1));
 return values.length===1&&/^[a-f0-9]{64}$/.test(values[0])?values[0]:null;
}
async function digest(token:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),byte=>byte.toString(16).padStart(2,'0')).join('');}
export async function getGuestSession(cookie:string|null){
 const token=readToken(cookie);if(!token)return null;
 await ensureSchema();
 const row=await database().prepare('select user_id,expires_at from guest_sessions where token_hash=? and expires_at>?').bind(await digest(token),new Date().toISOString()).first<{user_id:string;expires_at:string}>();
 return row?{userId:row.user_id,expiresAt:row.expires_at,token}:null;
}
export async function startGuestSession(cookie:string|null){
 const current=await getGuestSession(cookie);if(current)return current;
 await ensureSchema();
 const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),byte=>byte.toString(16).padStart(2,'0')).join('');
 const userId=`guest_${crypto.randomUUID()}`,now=new Date(),expiresAt=new Date(now.getTime()+GUEST_SESSION_SECONDS*1000).toISOString();
 await database().batch([
  database().prepare('delete from guest_sessions where expires_at<=?').bind(now.toISOString()),
  database().prepare('insert into guest_sessions(token_hash,user_id,expires_at,created_at) values(?,?,?,?)').bind(await digest(token),userId,expiresAt,now.toISOString()),
 ]);
 return {userId,expiresAt,token};
}
export async function endGuestSession(cookie:string|null){
 const token=readToken(cookie);if(!token)return;
 await ensureSchema();await database().prepare('delete from guest_sessions where token_hash=?').bind(await digest(token)).run();
}
export function guestCookie(token:string,maxAge:number,url:string){
 return `${GUEST_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.max(0,Math.floor(maxAge))}${new URL(url).protocol==='https:'?'; Secure':''}`;
}
