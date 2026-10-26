import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
const origin=new URL(process.argv[2]??'http://localhost:5197');
if(!['localhost','127.0.0.1'].includes(origin.hostname))throw new Error('Local disposable fixtures only.');
const request=(path,options={})=>fetch(new URL(path,origin),options);
const id=crypto.randomUUID(),otherCommentId=crypto.randomUUID(),owner='comment-access-fixture';let ownId;
function sql(command){return execFileSync(process.execPath,[resolve('node_modules/wrangler/bin/wrangler.js'),'d1','execute','DB','--local','--config',resolve('dist/server/wrangler.json'),'--persist-to',resolve('.wrangler/state'),'--command',command,'--json'],{encoding:'utf8',env:{...process.env,WRANGLER_SEND_METRICS:'false',CLOUDFLARE_CF_FETCH_ENABLED:'false'}});}
const json=async response=>{assert.ok(response.ok,await response.clone().text());return (await response.json()).data;};
const post=(path,body,headers={})=>request(path,{method:'POST',headers:{origin:origin.origin,'content-type':'application/json',...headers},body:JSON.stringify(body)});
const path=`/api/memories/${id}/comments`;
try {
 sql(`insert into memories(id,user_id,title,content,location_name,emotion,visibility,is_anonymous,location_precision,latitude,longitude,public_latitude,public_longitude,created_at,updated_at) values('${id}','${owner}','댓글 접근 검사','로컬 검사','검사 장소','peaceful','public',1,'approximate',35.561234,129.321234,35.56,129.32,'2026-10-25T00:00:00.000Z','2026-10-25T00:00:00.000Z')`);
 assert.equal((await post(path,{content:'허용 안 됨'})).status,401);
 const login=await request('/signin-with-chatgpt?return_to=/',{redirect:'manual'}),cookie=login.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);const headers={cookie};
 assert.equal((await post(path,{content:'   '},headers)).status,400);
 assert.equal((await post(path,{content:'x'.repeat(1001)},headers)).status,400);
 assert.equal((await post(path,{content:'식별자 위조',user_id:owner},headers)).status,400);
 assert.equal((await post(path,{content:'cross-origin'}, {...headers,origin:'https://example.com'})).status,403);
 const anchor={panoId:'test-scene==',pan:32.5,tilt:-12.25};
 assert.equal((await post(path,{content:'잘못된 방향',anchor:{...anchor,pan:181}},headers)).status,400);
 const comment=await json(await post(path,{anchor,content:'  같은 길을 떠올렸어요.\n<script>plain text</script>  '},headers));
 assert.equal(comment.content,'같은 길을 떠올렸어요.\n<script>plain text</script>');assert.equal(comment.owned,true);assert.deepEqual(comment.anchor,anchor);
 const publicList=await json(await request(path));assert.equal(publicList.comments.length,1);assert.equal(publicList.comments[0].owned,false);assert.deepEqual(publicList.comments[0].anchor,anchor);
 assert.deepEqual(Object.keys(publicList.comments[0]).sort(),['anchor','content','createdAt','id','owned']);
 assert.equal((await request(path)).headers.get('cache-control'),'private, no-store');
 sql(`insert into memory_comments(id,memory_id,user_id,content,created_at) values('${otherCommentId}','${id}','another-account','다른 사용자의 댓글','2026-10-24T00:00:00.000Z')`);
 assert.equal((await request(`${path}/${otherCommentId}`,{method:'DELETE',headers:{...headers,origin:origin.origin}})).status,404);
 assert.equal((await request(`${path}/${comment.id}`,{method:'DELETE'})).status,401);
 sql('insert into memory_comments(id,memory_id,user_id,content,created_at) values '+Array.from({length:33},(_,i)=>`('${crypto.randomUUID()}','${id}','another-account','페이지 검사 ${i}','2026-10-23T00:00:00.000Z')`).join(','));
 const first=await json(await request(path)), second=await json(await request(path+'?'+new URLSearchParams({cursor:first.nextCursor})));
 assert.equal(first.comments.length,30);assert.equal(second.comments.length,5);assert.equal(second.nextCursor,null);
 assert.equal(new Set([...first.comments,...second.comments].map(row=>row.id)).size,35);
 assert.equal((await request(path+'?cursor=bad')).status,400);
 for(const visibility of ['private','unlisted']){
  sql(`update memories set visibility='${visibility}' where id='${id}'`);
  for(const h of [{},headers])assert.equal((await request(path,{headers:h})).status,404);
  assert.equal((await post(path,{content:'차단'},headers)).status,404);
  assert.equal((await request(`${path}/${comment.id}`,{method:'DELETE',headers:{...headers,origin:origin.origin}})).status,404);
 }
 sql(`update memories set visibility='public' where id='${id}'`);
 assert.equal((await request(`${path}/${comment.id}`,{method:'DELETE',headers:{...headers,origin:origin.origin}})).status,204);
 assert.match(sql(`select count(*) as remaining from memory_comment_anchors where comment_id='${comment.id}'`),/"remaining": 0/);
 const form=new FormData();form.set('memory',JSON.stringify({title:'비공개 댓글 검사',content:'검사 후 정리',location_name:'울산 검사 장소',emotion:'peaceful',visibility:'private',is_anonymous:true,location_precision:'approximate',lat:35.541234,lng:129.312345}));
 ownId=(await json(await request('/api/memories',{method:'POST',headers:{cookie,origin:origin.origin},body:form}))).id;
 await json(await post(`/api/memories/${ownId}/comments`,{content:'소유자의 비공개 댓글',anchor},headers));
 assert.equal((await request(`/api/memories/${ownId}/comments`)).status,404);
 assert.equal((await json(await request(`/api/memories/${ownId}/comments`,{headers}))).comments.length,1);
 assert.equal((await request(`/api/memories/${ownId}`,{method:'DELETE',headers:{cookie,origin:origin.origin}})).status,204);
 const deletedId=ownId;ownId=undefined;
 assert.match(sql(`select count(*) as remaining from memory_comments where memory_id='${deletedId}'`),/"remaining": 0/);
 assert.match(sql(`select count(*) as remaining from memory_comment_anchors a left join memory_comments c on c.id=a.comment_id where c.id is null`),/"remaining": 0/);
 console.log('PASS: panorama anchor persistence/cascade, comment auth, validation, same-origin, anonymous DTO, pagination, private/unlisted exclusion, own-delete and cascading deletion.');
} finally {
 if(ownId)sql(`delete from memories where id='${ownId}'`);
 sql(`delete from memories where id='${id}' and user_id='${owner}'`);
}
