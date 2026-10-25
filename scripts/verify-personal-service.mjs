import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

const origin=new URL(process.argv[2]??'http://localhost:5197');
if(!['localhost','127.0.0.1'].includes(origin.hostname))throw new Error('Only disposable local test data is allowed.');
const request=(path,options={})=>fetch(new URL(path,origin),options);
const json=async response=>{assert.equal(response.status,200,await response.clone().text());return (await response.json()).data;};
const id=crypto.randomUUID();const owner='personal-space-fixture';let ownId;
function sql(command){execFileSync(process.execPath,[resolve('node_modules/wrangler/bin/wrangler.js'),'d1','execute','DB','--local','--config',resolve('dist/server/wrangler.json'),'--persist-to',resolve('.wrangler/state'),'--command',command],{stdio:'pipe',env:{...process.env,WRANGLER_SEND_METRICS:'false',CLOUDFLARE_CF_FETCH_ENABLED:'false'}});}
const query='west=129.17&east=129.46&south=35.44&north=35.66';
const post=(path,body,headers={})=>request(path,{method:'POST',headers:{origin:origin.origin,'content-type':'application/json',...headers},body:JSON.stringify(body)});
try {
 sql(`insert into memories(id,user_id,title,content,location_name,memory_date,emotion,visibility,is_anonymous,location_precision,latitude,longitude,public_latitude,public_longitude,created_at,updated_at) values('${id}','${owner}','개인 공간 API 검사','로컬에서만 생성하는 검사 기록','서버 API 검사 장소','2026-10-25','peaceful','public',1,'approximate',35.561234,129.321234,35.56,129.32,'2026-10-25T00:00:00.000Z','2026-10-25T00:00:00.000Z')`);
 assert.equal((await request('/api/users/me/space?'+query)).status,401);
 assert.equal((await post(`/api/memories/${id}/activity`,{action:'like',active:true})).status,401);
 const visitorId=crypto.randomUUID();
 const first=await json(await post(`/api/memories/${id}/activity`,{action:'view',visitorId}));
 const repeat=await json(await post(`/api/memories/${id}/activity`,{action:'view',visitorId}));assert.equal(first.views,repeat.views);
 const login=await request('/signin-with-chatgpt?return_to=/',{redirect:'manual'});const cookie=login.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);const headers={cookie};
 await json(await post(`/api/memories/${id}/activity`,{action:'like',active:true},headers));
 const likes=await json(await post(`/api/memories/${id}/activity`,{action:'like',active:true},headers));assert.equal(likes.likes,1);assert.equal(likes.liked,true);
 await json(await post(`/api/memories/${id}/activity`,{action:'bookmark',active:true},headers));
 const anonymous=await json(await request(`/api/memories/${id}/activity`));assert.equal(anonymous.bookmarked,false);assert.equal(anonymous.liked,false);assert.ok(!('user_id' in anonymous));
 const form=new FormData();form.set('memory',JSON.stringify({title:'내 비공개 검사',content:'검사 후 정리하는 로컬 기록',location_name:'서버 API 검사 장소',emotion:'peaceful',visibility:'private',is_anonymous:true,location_precision:'approximate',lat:35.541234,lng:129.312345}));
 const created=await request('/api/memories',{method:'POST',headers:{cookie,origin:origin.origin},body:form});assert.equal(created.status,201,await created.clone().text());ownId=(await created.json()).data.id;
 assert.equal((await request(`/api/memories/${ownId}/activity`)).status,404);
 assert.equal((await post(`/api/memories/${ownId}/activity`,{action:'view',visitorId})).status,404);
 let space=await json(await request('/api/users/me/space?'+query+'&mine=0&bookmarked=1',{headers}));
 const saved=space.mapMemories.find(memory=>memory.id===id);assert.ok(saved);assert.equal(saved.lat,35.56);assert.equal(saved.lng,129.32);assert.equal(saved.owned,false);assert.ok(!('user_id' in saved));
 space=await json(await request('/api/users/me/space?'+query,{headers}));assert.ok(space.mapMemories.every(memory=>memory.owned));
 const mine=space.mapMemories.find(memory=>memory.id===ownId);assert.equal(mine.lat,35.541234);assert.ok(space.recommendations.some(item=>item.memory.id===id));assert.ok(space.recommendations.every(item=>!item.memory.owned&&item.memory.visibility==='public'));
 sql(`update memories set visibility='private' where id='${id}' and user_id='${owner}'`);
 space=await json(await request('/api/users/me/space?'+query+'&mine=0&bookmarked=1&liked=1',{headers}));assert.ok(!space.mapMemories.some(memory=>memory.id===id));assert.ok(!space.lists.bookmarked.some(memory=>memory.id===id));assert.ok(!space.recommendations.some(item=>item.memory.id===id));
 assert.equal((await request(`/api/memories/${id}/activity`,{headers})).status,404);
 assert.equal((await post(`/api/memories/${id}/activity`,{action:'bookmark',active:false},headers)).status,404);
 console.log('PASS: auth, idempotent likes/views, bookmarks, owner coordinates, recommendations and revoked private memory exclusion.');
} finally {
 if(ownId){const login=await request('/signin-with-chatgpt?return_to=/',{redirect:'manual'});const cookie=login.headers.get('set-cookie')?.split(';')[0];assert.equal((await request(`/api/memories/${ownId}`,{method:'DELETE',headers:{cookie,origin:origin.origin}})).status,204);}
 sql(`delete from memories where id='${id}' and user_id='${owner}'`);
}
