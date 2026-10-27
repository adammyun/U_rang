import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
const origin=new URL(process.argv[2]??'http://localhost:5197');
if(!['localhost','127.0.0.1'].includes(origin.hostname))throw new Error('Local guest verification only.');
const call=(path,options={})=>fetch(new URL(path,origin),options);
const headers=cookie=>({cookie,origin:origin.origin});
const data=async response=>{assert.ok(response.ok,`${response.status}: ${await response.clone().text()}`);return (await response.json()).data;};
const start=async(cookie='',next='/?personal=1')=>{
 const response=await call('/api/auth/guest',{method:'POST',headers:headers(cookie),body:new URLSearchParams({next}),redirect:'manual'});
 assert.equal(response.status,303);assert.match(response.headers.get('set-cookie'),/HttpOnly/);assert.match(response.headers.get('set-cookie'),/SameSite=Lax/);
 assert.equal(response.headers.get('cache-control'),'private, no-store');
 return response.headers.get('set-cookie').split(';')[0];
};
const post=(path,body,cookie)=>call(path,{method:'POST',headers:{...headers(cookie),'content-type':'application/json'},body:JSON.stringify(body)});
const sessions=[],memories=[];
const sql=query=>execFileSync(process.execPath,[resolve('node_modules/wrangler/bin/wrangler.js'),'d1','execute','DB','--local','--config',resolve('dist/server/wrangler.json'),'--persist-to',resolve('.wrangler/state'),'--command',query],{stdio:'pipe',env:{...process.env,WRANGLER_SEND_METRICS:'false',CLOUDFLARE_CF_FETCH_ENABLED:'false'}}).toString();
let a,b;
try{
 for(const h of [{},{origin:'https://example.com'},{origin:origin.origin,'sec-fetch-site':'cross-site'}])assert.equal((await call('/api/auth/guest',{method:'POST',headers:h,body:new URLSearchParams({next:'/'}),redirect:'manual'})).status,403);
 assert.equal((await call('/api/auth/guest',{method:'POST',headers:headers(''),body:new URLSearchParams({next:'/',user_id:'local_seedy'}),redirect:'manual'})).status,400);
 a=await start();b=await start();sessions.push(a,b);assert.notEqual(a,b);assert.equal(await start(a),a);
 const c=await start();sessions.push(c);const token=c.split('=')[1];
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),byte=>byte.toString(16).padStart(2,'0')).join('');
 assert.match(sql(`select count(*) as n from guest_sessions where token_hash='${hash}'`),/"n": 1/);
 assert.match(sql(`select count(*) as n from guest_sessions where token_hash='${token}'`),/"n": 0/);
 sql(`update guest_sessions set expires_at='2000-01-01T00:00:00.000Z' where token_hash='${hash}'`);
 assert.equal((await call('/api/users/me/preferences',{headers:{cookie:c}})).status,401);
 assert.equal((await call('/api/users/me/preferences',{headers:{cookie:'yurang_guest_session='+'a'.repeat(64)}})).status,401);
 const badNext=await call('/api/auth/guest',{method:'POST',headers:headers(a),body:new URLSearchParams({next:'//example.com'}),redirect:'manual'});assert.equal(badNext.headers.get('location'),'/');
 const bounds='west=129.17&east=129.46&south=35.44&north=35.66';
 for(const cookie of [a,b]){const space=await data(await call('/api/users/me/space?'+bounds,{headers:{cookie}}));assert.equal(space.displayName,'게스트 여행자');assert.equal(space.totals.mine,0);}
 const input={title:'게스트 로컬 검증',content:'이 검사는 끝난 뒤 정리합니다.',location_name:'울산 검사 장소',emotion:'peaceful',visibility:'private',is_anonymous:true,location_precision:'approximate',lat:35.541234,lng:129.312345};
 const create=async visibility=>{
  const form=new FormData();form.set('memory',JSON.stringify({...input,visibility}));
  form.append('images',new Blob([await readFile(new URL('../tests/fixtures/memory-photo.png',import.meta.url))],{type:'image/png'}),'guest-check.png');
  const memory=await data(await call('/api/memories',{method:'POST',headers:headers(a),body:form}));memories.push(memory);return memory;
 };
 const privateMemory=await create('private'),pub=await create('public');
 assert.equal((await data(await call('/api/memories/'+privateMemory.id,{headers:{cookie:a}}))).lat,input.lat);
 for(const cookie of ['',b]){assert.equal((await call('/api/memories/'+privateMemory.id,{headers:{cookie}})).status,404);assert.equal((await call(privateMemory.media[0].url,{headers:{cookie}})).status,404);}
 assert.equal((await call(privateMemory.media[0].url,{headers:{cookie:a}})).status,200);
 const exposed=await data(await call('/api/memories/'+pub.id,{headers:{cookie:b}}));assert.equal(exposed.lat,35.54);assert.ok(!('user_id' in exposed)&&!('userId' in exposed));
 assert.equal((await call('/api/memories/'+pub.id,{method:'DELETE',headers:headers(b)})).status,404);
 const comment=await data(await post('/api/memories/'+pub.id+'/comments',{content:'게스트도 이야기를 나눌 수 있어요.'},b));assert.equal(comment.owned,true);
 assert.equal((await call(`/api/memories/${pub.id}/comments/${comment.id}`,{method:'DELETE',headers:headers(a)})).status,404);
 assert.equal((await call(`/api/memories/${pub.id}/comments/${comment.id}`,{method:'DELETE',headers:headers(b)})).status,204);
 const activity=await data(await post('/api/memories/'+pub.id+'/activity',{action:'bookmark',active:true},b));assert.equal(activity.bookmarked,true);
 const pref={emotionMenu:['sad','love']};assert.deepEqual(await data(await call('/api/users/me/preferences',{method:'PUT',headers:{...headers(a),'content-type':'application/json'},body:JSON.stringify(pref)})),pref);
 assert.equal((await data(await call('/api/users/me/preferences',{headers:{cookie:b}}))).emotionMenu.length,8);
 const legacy=await call('/signin-with-chatgpt?return_to=/',{redirect:'manual'}),real=legacy.headers.get('set-cookie').split(';')[0];
 const keepAccount=await call('/api/auth/guest',{method:'POST',headers:headers(real),body:new URLSearchParams({next:'/'}),redirect:'manual'});assert.equal(keepAccount.status,303);assert.equal(keepAccount.headers.get('set-cookie'),null);
 assert.equal((await call('/api/memories/'+privateMemory.id,{headers:{cookie:a+'; '+real}})).status,404); // real account takes precedence
 const beforeLogout=(await data(await call('/api/users/me/space?'+bounds,{headers:{cookie:b}})));assert.equal(beforeLogout.totals.mine,0);assert.equal(beforeLogout.totals.bookmarked,1);
 for(const memory of memories)assert.equal((await call('/api/memories/'+memory.id,{method:'DELETE',headers:headers(a)})).status,204);memories.length=0;
 assert.equal((await post('/api/auth/logout',{},a)).status,200);assert.equal((await call('/api/users/me/preferences',{headers:{cookie:a}})).status,401);
 const logout=await post('/api/auth/logout',{},b+'; '+real);assert.equal((await logout.json()).redirectTo,'/signout-with-chatgpt?return_to=%2F');
 assert.equal((await call('/api/users/me/preferences',{headers:{cookie:b}})).status,401);
 assert.equal((await call('/api/auth/logout',{method:'POST',headers:{cookie:a,origin:'https://example.com'}})).status,403);
 console.log('PASS: distinct guest accounts, hashed/expired sessions, CSRF and redirect checks, account precedence, private photo isolation, public coordinate protection, comments, bookmarks, preferences and logout revocation.');
}finally{
 for(const memory of memories)await call('/api/memories/'+memory.id,{method:'DELETE',headers:headers(a)});
 for(const cookie of sessions)await post('/api/auth/logout',{},cookie);
}
