import assert from 'node:assert/strict';
const origin=new URL(process.argv[2]??'http://localhost:5197');
if(!['localhost','127.0.0.1'].includes(origin.hostname))throw new Error('Local verification only.');
const call=(path,options={})=>fetch(new URL(path,origin),options);
const path='/api/users/me/discoveries',cookies=[];
const post=(cookie,body,extra={})=>call(path,{method:'POST',headers:{cookie,origin:origin.origin,'content-type':'application/json',...extra},body:JSON.stringify(body)});
const data=async response=>{assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');return (await response.json()).data;};
const login=async()=>{
 const response=await call('/api/auth/guest',{method:'POST',headers:{origin:origin.origin},body:new URLSearchParams({next:'/'}),redirect:'manual'});
 assert.equal(response.status,303);const cookie=response.headers.get('set-cookie').split(';')[0];cookies.push(cookie);return cookie;
};
try{
 assert.equal((await call(path)).status,401);
 assert.equal((await post('',{storyId:'taehwaru'})).status,401);
 const a=await login(),b=await login();assert.notEqual(a,b);
 assert.deepEqual(await data(await call(path,{headers:{cookie:b}})),[]);
 for(const body of [{storyId:'unknown'},{storyId:'taehwaru',user_id:'someone'},{storyId:'taehwaru',discoveredAt:'2000-01-01T00:00:00.000Z'}])assert.equal((await post(a,body)).status,400);
 const first=await data(await post(a,{storyId:'taehwaru'}));assert.deepEqual(Object.keys(first).sort(),['discoveredAt','storyId']);
 assert.deepEqual(await data(await post(a,{storyId:'taehwaru'})),first);
 assert.deepEqual(await data(await call(path,{headers:{cookie:a}})),[first]);
 assert.deepEqual(await data(await call(path+'?user_id=someone',{headers:{cookie:b}})),[]);
 const foreign=await post(a,{storyId:'samho-birds'},{origin:'https://example.com'});assert.ok([400,403].includes(foreign.status));
 assert.deepEqual(await data(await call(path,{headers:{cookie:a}})),[first]);
 await call('/api/auth/logout',{method:'POST',headers:{cookie:a,origin:origin.origin}});
 assert.equal((await call(path,{headers:{cookie:a}})).status,401);
 console.log('PASS: anonymous reads/writes blocked, per-user isolation, strict input, first-date idempotence, no identity in DTO, private/no-store, foreign-origin rejection and logout revocation.');
}finally{
 for(const cookie of cookies)await call('/api/auth/logout',{method:'POST',headers:{cookie,origin:origin.origin}});
}
