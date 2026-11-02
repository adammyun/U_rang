import { mkdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { demoJournalContent } from '../../src/features/memories/demo-journals';

test.beforeEach(async ({page})=>{
  await page.addInitScript(()=>localStorage.setItem('yeoun_2:onboarding:v1',JSON.stringify({version:1,completed:true})));
  await mkdir('test-results/screenshots',{recursive:true});
});
test('공개 기억 문구 다섯 번 클릭·탭으로 개발 도구를 열고 지도로 돌아온다',async({page},info)=>{
  await page.goto('./');
  const caption=page.getByRole('button',{name:/울산광역시.*공개된 기억/});
  await expect(caption).toBeVisible();
  expect(await caption.locator('.live-dot').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(231, 160, 136)');
  await caption.click();
  await expect(page).not.toHaveURL(/#\/dev/);
  for(let i=0;i<4;i++) { if(info.project.name.startsWith('mobile'))await caption.tap();else await caption.click(); }
  await expect(page.getByRole('heading',{name:'유랑 개발 도구'})).toBeVisible();
  await expect(page.getByText('브라우저 저장소 (기기 안에만 저장)')).toBeVisible();
  expect(await page.locator('.dev-page').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(25, 31, 33)');
  await page.screenshot({path:`test-results/screenshots/demo-dev-${info.project.name}.png`,animations:'disabled',fullPage:true});
  await page.getByRole('link',{name:'지도로 돌아가기',exact:true}).click();
  await expect(page.getByLabel('지도 메뉴',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('사진이 여러 장인 가상 기억을 바로 읽고 출처와 테이프·사진 스크롤을 확인한다',async({page},info)=>{
  await page.goto('./');
  await page.getByRole('combobox',{name:'장소 이름'}).fill('대왕암');
  await page.getByRole('option',{name:/^대왕암공원 /}).click();
  await page.getByRole('button',{name:'탐색',exact:true}).click();
  const card=page.locator('.memory-card').filter({has:page.getByRole('heading',{name:'바다 앞에서 약속한 다음 여행',exact:true})});
  await card.click();
  const board=page.getByLabel('장소의 기억 미리보기');
  await board.getByRole('button',{name:'선택한 기억 자세히 읽기'}).click();
  const detail=page.getByRole('dialog',{name:'기억 상세'});
  await expect(detail.getByRole('heading',{level:2})).toHaveText('바다 앞에서 약속한 다음 여행');
  await expect(detail.locator('.atlas-taped-photo img')).toHaveCount(2);
  for(const img of await detail.locator('.atlas-taped-photo img').all()) expect(await img.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
  await expect(detail.getByLabel('사진 출처')).toContainText('CC BY-SA 4.0');
  await expect(detail).toContainText('다음 여행은 어디로 갈까');
  await expect(detail).not.toContainText(/시연용|가상의|실제 인물|관계없습니다/);
  await page.screenshot({path:`test-results/screenshots/demo-photos-${info.project.name}.png`,animations:'disabled'});
  await detail.locator('.atlas-taped-photo img').last().scrollIntoViewIfNeeded();
  await expect(detail.locator('.atlas-taped-photo img').last()).toBeInViewport();
  await detail.getByRole('button',{name:'뒤로가기'}).click();
  await expect(board).toBeVisible();
});
test('기존 브라우저 데이터는 보존하면서 새 예시와 사진만 추가한다',async({page})=>{
  await page.route('**/U_rang/',route=>route.fulfill({contentType:'text/html',body:'<html><body>Migration fixture</body></html>'}));
  await page.goto('./');
  await page.evaluate(()=>new Promise<void>((resolve,reject)=>{
    const request=indexedDB.open('yeoun_2',2);
    request.onupgradeneeded=()=>request.result.createObjectStore('memories',{keyPath:'id'});
    request.onsuccess=()=>{
      const db=request.result; const tx=db.transaction('memories','readwrite');
      tx.objectStore('memories').put({id:'migration-owner-fixture',ownerId:'github-pages-user',title:'보존할 기존 기록',media:[{id:'existing-photo',dataUrl:'existing-private-bytes',sortOrder:0}]});
      const base={title:'기존 예시',content:'이전 예시 본문',locationName:'태화강 국가정원',memoryDate:'2019-06-21',emotion:'peaceful',visibility:'public',isAnonymous:true,locationPrecision:'exact',exactLat:35.55,exactLng:129.29,publicLat:35.55,publicLng:129.29,createdAt:'2026-09-10T00:00:00.000Z',updatedAt:'2026-09-10T00:00:00.000Z',media:[]};
      tx.objectStore('memories').put({...base,id:'20000000-0000-4000-8000-000000000001',ownerId:'demo-user-1'});
      tx.objectStore('memories').put({...base,id:'20000000-0000-4000-8000-000000000020',ownerId:'demo-user-1',memoryDate:'2026-10-10',media:[{id:'legacy-demo-photo',dataUrl:'/yeoun_2/demo/taehwagang.png',sortOrder:0}]});
      tx.objectStore('memories').put({...base,id:'20000000-0000-4000-8000-000000000099',ownerId:'github-pages-user',content:'직접 고친 나의 이야기',visibility:'private',updatedAt:'2026-10-25T00:00:00.000Z'});
      tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);
    };request.onerror=()=>reject(request.error);
  }));
  await page.unroute('**/U_rang/');await page.reload();
  await expect(page.locator('.atlas-stamp').first()).toBeVisible();
  const state=await page.evaluate(()=>new Promise<{version:number;records:{id:string;title:string;content:string;media:unknown[]}[]}>((resolve,reject)=>{
    const req=indexedDB.open('yeoun_2');req.onsuccess=()=>{
      const db=req.result;const get=db.transaction('memories').objectStore('memories').getAll();
      get.onsuccess=()=>{resolve({version:db.version,records:get.result});db.close();};get.onerror=()=>reject(get.error);
    };
  }));
  expect(state.version).toBe(5);
  expect(state.records.find(r=>r.id.endsWith('000000000001'))?.content).toBe(demoJournalContent('20000000-0000-4000-8000-000000000001'));
  expect(state.records.find(r=>r.id.endsWith('000000000099'))?.content).toBe('직접 고친 나의 이야기');
  expect(state.records.find(r=>r.id==='migration-owner-fixture')).toMatchObject({title:'보존할 기존 기록',media:[{id:'existing-photo',dataUrl:'existing-private-bytes'}]});
  expect(state.records.filter(r=>r.id.startsWith('20000000')).length).toBe(24);
  expect(state.records.filter(r=>r.id.startsWith('20000000')&&r.media.length).length).toBe(5);
  expect(state.records.find(r=>r.id.endsWith('000000000020'))?.media).toMatchObject([{dataUrl:'/yeoun_2/demo/taehwagang.png'}]);
  const oldPhoto=page.locator('.atlas-stamp[data-memory-ids~="20000000-0000-4000-8000-000000000020"] img');
  await oldPhoto.scrollIntoViewIfNeeded();
  await expect(oldPhoto).toHaveAttribute('src','/U_rang/demo/taehwagang.png');
  await expect.poll(()=>oldPhoto.evaluate(image=>(image as HTMLImageElement).complete&&(image as HTMLImageElement).naturalWidth>0)).toBe(true);

});

test('기본 사이트는 외부 이동 없이 게스트로 로그인하고 기존 기록을 이어서 본다',async({page},info)=>{
  const errors:string[]=[];
  const authRequests:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(/\/api\/auth\/|oauth|chatgpt\.com/.test(request.url()))authRequests.push(request.url());});
  await page.goto('./');
  const siteOrigin=new URL(page.url()).origin;
  await expect(page.getByRole('link',{name:'공유·저장 실서비스 ↗',exact:true})).toHaveCount(0);
  await page.getByLabel('지도 메뉴').getByRole('button',{name:'내 기억',exact:true}).click();
  await page.getByRole('link',{name:'로그인하고 기억 모으기'}).click();
  await expect(page.getByRole('heading',{name:'가볍게 시작하는 나의 유랑'})).toBeVisible();
  await expect(page.getByText(/시연용 로그인입니다/)).toBeVisible();
  await expect(page.getByText(/다른 사람이나 기기와 공유되지/)).toBeVisible();
  await expect(page.getByRole('link',{name:/ChatGPT/})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/screenshots/pages-main-login-${info.project.name}.png`,animations:'disabled',fullPage:true});
  await page.getByRole('button',{name:'게스트로 시작'}).click();
  const profile=page.getByRole('dialog',{name:'마이페이지'});
  await expect(profile).toBeVisible();
  await expect(profile.getByRole('button',{name:'게스트 로그아웃'})).toBeVisible();
  await expect(profile.locator('.personal-memory-card').filter({hasText:'나만 간직한 골목의 저녁'})).toBeVisible();
  await page.reload();
  await expect(profile).toBeVisible();
  await expect(profile.locator('.personal-memory-card').filter({hasText:'나만 간직한 골목의 저녁'})).toBeVisible();
  await profile.getByRole('button',{name:'게스트 로그아웃'}).click();
  await expect(profile).toBeHidden();
  await page.getByLabel('지도 메뉴').getByRole('button',{name:'내 기억',exact:true}).click();
  await expect(profile.getByRole('link',{name:'로그인하고 기억 모으기'})).toBeVisible();
  await page.goto('./#/login');
  await page.getByRole('button',{name:'게스트로 시작'}).click();
  await expect(page.getByLabel('지도 메뉴')).toBeVisible();
  await page.getByLabel('지도 메뉴').getByRole('button',{name:'내 기억',exact:true}).click();
  await expect(profile.locator('.personal-memory-card').filter({hasText:'나만 간직한 골목의 저녁'})).toBeVisible();
  await profile.getByRole('button',{name:'마이페이지 닫기',exact:true}).click();
  await page.getByLabel('지도 메뉴').getByRole('button',{name:'지도',exact:true}).click();
  await expect(page.locator('.atlas-stamp').first()).toBeVisible();
  await page.screenshot({path:`test-results/screenshots/pages-main-map-${info.project.name}.png`,animations:'disabled'});
  expect(new URL(page.url()).origin).toBe(siteOrigin);
  expect(authRequests).toEqual([]);
  expect(errors).toEqual([]);
});
