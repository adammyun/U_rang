import {mkdir} from 'node:fs/promises';
import {expect,test,type Page} from '@playwright/test';
import {focusSeongnam} from './helpers/place';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('yeoun_2:onboarding:v1',JSON.stringify({version:1,completed:true}));
 });
 await mkdir('test-results/screenshots',{recursive:true});
});
async function detail(page:Page) {
 await page.goto('./');await focusSeongnam(page);
 await page.getByRole('button',{name:'골목의 작은 불빛',exact:true}).click();
 await page.getByRole('button',{name:'선택한 기억 자세히 읽기'}).click();
 return page.getByRole('dialog',{name:'기억 상세'});
}
async function fakePanorama(page:Page) {
 // Test double only: interaction/overlay QA does not claim provider imagery.
 await page.addInitScript(()=>{
  class Panorama {constructor(container:HTMLElement){container.style.background='#333b3e';container.setAttribute('data-test-sdk','simulated');} getPanoId(){return 'test-only';}setSize(){}setVisible(){}}
  Object.assign(window,{naver:{maps:{
    Panorama,LatLng:class {},Size:class {},Position:{TOP_RIGHT:'top-right'},
    Event:{
      addListener:(_target:unknown,name:string,callback:(value:string)=>void)=>{if(name==='pano_status')setTimeout(()=>callback('OK'),100);return {};},
      removeListener(){},clearInstanceListeners(){},
    },
  }}});
 });
}
async function capture(page:Page,name:string,project:string) {
 await page.screenshot({path:`test-results/screenshots/comments-${name}-${project}.png`,animations:'disabled'});
}

test('거리뷰 댓글 패널에서 익명 작성·재조회·본인 삭제, 접기와 스크롤을 유지한다',async({page},info)=>{
 await page.addInitScript(()=>localStorage.setItem('yeoun_2.pages.auth.v1','signed-in'));
 await fakePanorama(page);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const reading=await detail(page);
 await reading.getByRole('button',{name:'댓글',exact:true}).click();
 const viewer=page.locator('.panorama-dialog');
 const thread=viewer.getByRole('region',{name:'기억 댓글'});
 await expect(thread).toBeVisible();
 const draft=thread.getByRole('textbox',{name:/댓글 남기기/});
 await expect(draft).toBeEnabled();
 await draft.fill('같은 길을 걸었던 날이 떠올라요.\n<script>화면에 그대로 보이는 글</script>');
 await thread.getByRole('button',{name:'남기기',exact:true}).click();
 await expect(thread.locator('.memory-comment')).toHaveCount(1);
 await expect(thread.locator('.memory-comment p')).toContainText('<script>');
 await expect(thread.locator('.memory-comment strong')).toHaveText('나');
 await capture(page,'overlay',info.project.name);
 const panel=await page.locator('.panorama-comments-panel').boundingBox(),stage=await page.locator('.panorama-stage').boundingBox();
 expect(panel!.y).toBeGreaterThanOrEqual(stage!.y+60);
 expect(panel!.y+panel!.height).toBeLessThanOrEqual(stage!.y+stage!.height-40);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await viewer.getByRole('button',{name:'거리뷰 댓글 닫기'}).click();
 await expect(thread).toHaveCount(0);
 await viewer.getByRole('button',{name:'거리뷰 댓글 열기'}).click();
 await expect(thread.locator('.memory-comment')).toHaveCount(1);
 await thread.getByRole('button',{name:'내 댓글 삭제'}).click();
 await expect(thread.locator('.memory-comment')).toHaveCount(0);
 await viewer.getByRole('button',{name:'거리뷰 닫기'}).click();
 await expect(reading).toBeVisible();
 expect(errors).toEqual([]);
});

test('거리뷰 실패 시 같은 기억 상세로 돌아와 댓글을 읽고 로그인 안내를 보여준다',async({page},info)=>{
 // Empty client ID is also handled; block the loader host when configured.
 await page.route('https://oapi.map.naver.com/**',route=>route.abort());
 const reading=await detail(page);
 await reading.getByRole('button',{name:'댓글',exact:true}).click();
 const viewer=page.locator('.panorama-dialog');
 await viewer.getByRole('button',{name:'기억 상세에서 댓글 보기'}).click({timeout:25000});
 await expect(viewer).toHaveCount(0);
 const thread=reading.getByRole('region',{name:'기억 댓글'});
 await thread.scrollIntoViewIfNeeded();
 await expect(thread.getByRole('link',{name:'로그인하고 댓글 남기기'})).toBeVisible();
 await expect(thread.getByRole('textbox')).toHaveCount(0);
 await capture(page,'fallback',info.project.name);
 await reading.getByRole('button',{name:'뒤로가기'}).click();
 await expect(page.getByLabel('장소의 기억 미리보기')).toBeVisible();
 await expect(page.getByLabel('장소의 기억 미리보기').getByRole('region',{name:'기억 댓글'})).toHaveCount(0);
});

test('이전 v4 기록·반응을 보존하고 기억 삭제 시 연결 댓글도 함께 정리한다',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('yeoun_2.pages.auth.v1','signed-in'));
 await page.route('**/yeoun_2/',route=>route.fulfill({contentType:'text/html',body:'<html><body>Disposable v4 migration fixture</body></html>'}));
 await page.goto('./');
 const memoryId='30000000-0000-4000-8000-000000000123';
 await page.evaluate(id=>new Promise<void>((resolve,reject)=>{
  const request=indexedDB.open('yeoun_2',4);
  request.onupgradeneeded=()=>{request.result.createObjectStore('memories',{keyPath:'id'});request.result.createObjectStore('activity',{keyPath:'id'});};
  request.onsuccess=()=>{
   const db=request.result,tx=db.transaction(['memories','activity'],'readwrite');
   tx.objectStore('memories').put({id,ownerId:'github-pages-user',title:'이전 기록 보존 검사',content:'보존할 내 기록',locationName:'성남동',memoryDate:'2026-10-25',emotion:'peaceful',visibility:'private',isAnonymous:true,locationPrecision:'exact',exactLat:35.56,exactLng:129.32,publicLat:35.56,publicLng:129.32,createdAt:'2026-10-25T00:00:00.000Z',updatedAt:'2026-10-25T00:00:00.000Z',media:[{id:'photo',dataUrl:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/%3E',sortOrder:0}]});
   tx.objectStore('activity').put({id,liked:true,bookmarked:true,views:1});
   tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);
  };request.onerror=()=>reject(request.error);
 }),memoryId);
 await page.unroute('**/yeoun_2/');await page.reload();
 await page.getByRole('button',{name:'내 기억',exact:true}).click();
 const personal=page.getByRole('dialog',{name:'마이페이지'});
 await personal.getByRole('button',{name:/이전 기록 보존 검사/}).click();
 const reading=page.getByRole('dialog',{name:'기억 상세'});
 await expect(reading.getByRole('heading',{name:'이전 기록 보존 검사'})).toBeVisible();
 await expect(reading.getByRole('img',{name:'이전 기록 보존 검사의 기억 사진 1'})).toHaveAttribute('src',/^data:/);
 // Seed a disposable comment to verify the actual memory-delete cascade, not only UI removal.
 await page.evaluate(id=>new Promise<void>((resolve,reject)=>{
  const request=indexedDB.open('yeoun_2');request.onsuccess=()=>{
   const db=request.result;if(db.version!==5){reject(new Error('Expected v5 migration'));db.close();return;}
   const tx=db.transaction(['comments','activity'],'readwrite');
   const old=tx.objectStore('activity').get(id);old.onsuccess=()=>{if(!old.result?.bookmarked || !old.result?.liked)tx.abort();};
   tx.objectStore('comments').put({id:crypto.randomUUID(),memoryId:id,ownerId:'github-pages-user',content:'삭제할 기억에 속한 댓글',createdAt:new Date().toISOString()});
   tx.oncomplete=()=>{db.close();resolve();};tx.onabort=()=>{db.close();reject(new Error('Existing activity was lost'));};
  };
 }),memoryId);
 page.once('dialog',dialog=>dialog.accept());
 await reading.getByRole('button',{name:'삭제',exact:true}).click();
 await expect(reading).toHaveCount(0);
 const counts=await page.evaluate(id=>new Promise<number[]>((resolve,reject)=>{
  const request=indexedDB.open('yeoun_2');request.onsuccess=()=>{
   const db=request.result,tx=db.transaction(['memories','activity','comments']);const values:number[]=[];
   for(const name of ['memories','activity']){const q=tx.objectStore(name).count(id);q.onsuccess=()=>values.push(q.result);}
   const comments=tx.objectStore('comments').index('memoryId').count(id);comments.onsuccess=()=>values.push(comments.result);
   tx.oncomplete=()=>{db.close();resolve(values);};tx.onerror=()=>reject(tx.error);
  };
 }),memoryId);
 expect(counts).toEqual([0,0,0]);
});

test('긴 댓글 목록을 나눠 읽고 다른 작성자의 댓글은 삭제할 수 없다',async({page})=>{
 await fakePanorama(page);
 const reading=await detail(page);
 await page.evaluate(()=>new Promise<void>((resolve,reject)=>{
  const request=indexedDB.open('yeoun_2');request.onsuccess=()=>{
   const db=request.result,tx=db.transaction('comments','readwrite');
   for(let i=0;i<35;i++)tx.objectStore('comments').put({id:crypto.randomUUID(),memoryId:'20000000-0000-4000-8000-000000000010',ownerId:'another-user',content:`여러 이야기를 스크롤해 읽는 댓글 ${i} `+'긴 문장을 이어 씁니다. '.repeat(12),createdAt:`2026-10-25T00:00:${String(i).padStart(2,'0')}.000Z`});
   tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);
  };
 }));
 await reading.getByRole('button',{name:'댓글',exact:true}).click();
 const thread=page.locator('.panorama-dialog').getByRole('region',{name:'기억 댓글'});
 await expect(thread.locator('.memory-comment')).toHaveCount(30);
 await expect(thread.getByRole('button',{name:'내 댓글 삭제'})).toHaveCount(0);
 expect(await page.locator('.panorama-stage').evaluate(el=>getComputedStyle(el).touchAction)).toBe('auto');
 const list=thread.getByRole('region',{name:'댓글 목록'});
 expect(await list.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
 await list.evaluate(el=>el.scrollTo({top:el.scrollHeight}));
 expect(await list.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
 await thread.getByRole('button',{name:'댓글 더 보기',exact:true}).click();
 await expect(thread.locator('.memory-comment')).toHaveCount(35);
 await expect(thread.getByRole('button',{name:'댓글 더 보기',exact:true})).toHaveCount(0);
 await expect(thread.getByRole('link',{name:'로그인하고 댓글 남기기'})).toBeVisible();
});
