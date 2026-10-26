import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
const origin=new URL(process.argv[2]??'http://localhost:5197');
if(!['localhost','127.0.0.1'].includes(origin.hostname))throw new Error('Local verification only.');
const request=(path,options={})=>fetch(new URL(path,origin),options);
const endpoint='/api/users/me/preferences',other='preference-fixture-'+crypto.randomUUID();let original,cookie;
const sql=command=>execFileSync(process.execPath,[resolve('node_modules/wrangler/bin/wrangler.js'),'d1','execute','DB','--local','--config',resolve('dist/server/wrangler.json'),'--persist-to',resolve('.wrangler/state'),'--command',command],{stdio:'pipe',env:{...process.env,WRANGLER_SEND_METRICS:'false',CLOUDFLARE_CF_FETCH_ENABLED:'false'}});
const put=(body,headers={})=>request(endpoint,{method:'PUT',headers:{origin:origin.origin,'content-type':'application/json',...headers},body:JSON.stringify(body)});
const data=async r=>{assert.equal(r.status,200,await r.clone().text());return (await r.json()).data;};
try{
 assert.equal((await request(endpoint)).status,401);assert.equal((await put({emotionMenu:['sad']})).status,401);
 const login=await request('/signin-with-chatgpt?return_to=/',{redirect:'manual'});cookie=login.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);
 original=await data(await request(endpoint,{headers:{cookie}}));
 for(const body of [{emotionMenu:[]},{emotionMenu:['unknown']},{emotionMenu:['sad','sad']},{emotionMenu:['sad'],user_id:other}])assert.equal((await put(body,{cookie})).status,400);
 assert.equal((await put({emotionMenu:['sad']},{cookie,origin:'https://example.com'})).status,403);
 const value={emotionMenu:['sad','meaningful']};assert.deepEqual(await data(await put(value,{cookie})),value);
 sql(`insert into user_preferences(user_id,emotion_menu,updated_at) values('${other}','["happy"]','2026-10-26T00:00:00.000Z')`);
 const read=await request(endpoint+'?user_id='+encodeURIComponent(other),{headers:{cookie}});
 assert.equal(read.headers.get('cache-control'),'private, no-store');assert.deepEqual(await data(read),value);
 assert.deepEqual(Object.keys(await data(await request(endpoint,{headers:{cookie}}))),['emotionMenu']);
 console.log('PASS: authenticated preferences, validation, same-origin, account isolation, persistence and private no-store DTO.');
}finally{
 if(original&&cookie)await data(await put(original,{cookie}));
 sql(`delete from user_preferences where user_id='${other}'`);
}
