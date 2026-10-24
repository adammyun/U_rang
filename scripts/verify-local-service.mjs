import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const origin = new URL(process.argv[2] ?? 'http://127.0.0.1:5185');
if (!['localhost','127.0.0.1'].includes(origin.hostname)) throw new Error('This verifier only creates disposable records on a local development server.');
const listPath = '/api/memories?west=129.17&east=129.46&south=35.44&north=35.66&limit=200';
const request = (path,options={}) => fetch(new URL(path,origin),options);
const listed = await request(listPath); assert.equal(listed.status,200);
const baseline = (await listed.json()).data;
assert.equal(baseline.filter(m=>m.id.startsWith('20000000')).length,23);
assert.equal(baseline.filter(m=>m.media.length>0).length,5);
assert.ok(baseline.every(m=>m.visibility==='public'&&!('user_id' in m)&&!('userId' in m)));
assert.equal((await request('/api/memories/20000000-0000-4000-8000-000000000099')).status,404);
assert.equal((await request('/api/memories',{method:'POST'})).status,401);
const signIn=await request('/signin-with-chatgpt?return_to=/',{redirect:'manual'});
const cookie=signIn.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);
const headers={cookie,origin:origin.origin};
const input={title:'로컬 API 검증용 가상 기록',content:'이 기록은 자동 검사 후 정리되는 가상 데이터입니다.',location_name:'울산 테스트 지점',memory_date:'2026-10-24',emotion:'peaceful',visibility:'public',is_anonymous:true,location_precision:'approximate',lat:35.541234,lng:129.312345};
let memoryId;
try {
  const form=new FormData();form.set('memory',JSON.stringify(input));
  form.append('images',new Blob([await readFile(new URL('../tests/fixtures/memory-photo.png',import.meta.url))],{type:'image/png'}),'local-check.png');
  const created=await request('/api/memories',{method:'POST',headers,body:form});assert.equal(created.status,201,await created.clone().text());
  const memory=(await created.json()).data;memoryId=memory.id;assert.equal(memory.media.length,1);
  const publicResponse=await request(`/api/memories/${memoryId}`);assert.equal(publicResponse.status,200);
  const exposed=(await publicResponse.json()).data;assert.equal(exposed.lat,35.54);assert.equal(exposed.lng,129.31);assert.ok(!('user_id' in exposed));
  const publicPhoto=await request(exposed.media[0].url);assert.equal(publicPhoto.status,200);assert.equal(publicPhoto.headers.get('content-type'),'image/png');assert.equal(publicPhoto.headers.get('cache-control'),'private, no-store');
  const update=new FormData();update.set('memory',JSON.stringify({...input,visibility:'private'}));update.set('removeMediaIds','[]');
  const changed=await request(`/api/memories/${memoryId}`,{method:'PATCH',headers,body:update});assert.equal(changed.status,200,await changed.clone().text());
  assert.equal((await request(`/api/memories/${memoryId}`)).status,404);
  assert.equal((await request(exposed.media[0].url)).status,404);
  assert.equal((await request(exposed.media[0].url,{headers})).status,200);
  const privateList=(await (await request(listPath)).json()).data;assert.ok(!privateList.some(m=>m.id===memoryId));
  const owned=(await (await request('/api/users/me/memories?limit=300',{headers})).json()).data.find(m=>m.id===memoryId);
  assert.equal(owned.lat,input.lat);assert.equal(owned.lng,input.lng);assert.equal(owned.visibility,'private');
  const makeUnlisted=new FormData();makeUnlisted.set('memory',JSON.stringify({...input,visibility:'unlisted'}));makeUnlisted.set('removeMediaIds','[]');
  assert.equal((await request(`/api/memories/${memoryId}`,{method:'PATCH',headers,body:makeUnlisted})).status,200);
  assert.ok(!(await (await request(listPath)).json()).data.some(m=>m.id===memoryId));
  console.log('PASS: shared DB seeds, photos, auth, public/private/unlisted, anonymous response, approximate coordinates and owner-only media.');
} finally {
  if(memoryId)assert.equal((await request(`/api/memories/${memoryId}`,{method:'DELETE',headers})).status,204);
}
