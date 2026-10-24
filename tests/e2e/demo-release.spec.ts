import { mkdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

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
  await expect(detail.getByLabel('예시 사진 출처')).toContainText('CC BY-SA 4.0');
  await page.screenshot({path:`test-results/screenshots/demo-photos-${info.project.name}.png`,animations:'disabled'});
  await detail.locator('.atlas-taped-photo img').last().scrollIntoViewIfNeeded();
  await expect(detail.locator('.atlas-taped-photo img').last()).toBeInViewport();
  await detail.getByRole('button',{name:'뒤로가기'}).click();
  await expect(board).toBeVisible();
});
test('기존 브라우저 데이터는 보존하면서 새 예시와 사진만 추가한다',async({page})=>{
  await page.route('**/yeoun_2/',route=>route.fulfill({contentType:'text/html',body:'<html><body>Migration fixture</body></html>'}));
  await page.goto('./');
  await page.evaluate(()=>new Promise<void>((resolve,reject)=>{
    const request=indexedDB.open('yeoun_2',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('memories',{keyPath:'id'});
    request.onsuccess=()=>{
      const db=request.result; const tx=db.transaction('memories','readwrite');
      tx.objectStore('memories').put({id:'migration-owner-fixture',ownerId:'github-pages-user',title:'보존할 기존 기록',media:[{id:'existing-photo',dataUrl:'existing-private-bytes',sortOrder:0}]});
      tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);
    };request.onerror=()=>reject(request.error);
  }));
  await page.unroute('**/yeoun_2/');await page.reload();
  await expect(page.locator('.atlas-stamp').first()).toBeVisible();
  const state=await page.evaluate(()=>new Promise<{version:number;records:{id:string;title:string;media:unknown[]}[]}>((resolve,reject)=>{
    const req=indexedDB.open('yeoun_2');req.onsuccess=()=>{
      const db=req.result;const get=db.transaction('memories').objectStore('memories').getAll();
      get.onsuccess=()=>{resolve({version:db.version,records:get.result});db.close();};get.onerror=()=>reject(get.error);
    };
  }));
  expect(state.version).toBe(2);
  expect(state.records.find(r=>r.id==='migration-owner-fixture')).toMatchObject({title:'보존할 기존 기록',media:[{id:'existing-photo',dataUrl:'existing-private-bytes'}]});
  expect(state.records.filter(r=>r.id.startsWith('20000000')).length).toBe(24);
  expect(state.records.filter(r=>r.id.startsWith('20000000')&&r.media.length).length).toBe(5);
});

test('GitHub 시연판에서 실서비스 링크를 열 수 있고 검색 결과를 가리지 않는다',async({page},info)=>{
  test.skip(!process.env.VITE_LIVE_SERVICE_URL,'Only the configured Pages build exposes this link.');
  await page.goto('./');
  const link=page.getByRole('link',{name:'공유·저장 실서비스 ↗',exact:true});
  await expect(link).toHaveAttribute('href',process.env.VITE_LIVE_SERVICE_URL!);
  await expect(link).toBeInViewport();
  await page.screenshot({path:`test-results/screenshots/demo-service-link-${info.project.name}.png`,animations:'disabled'});
  await page.getByRole('combobox',{name:'장소 이름'}).fill('태화강');
  await expect(page.getByRole('option',{name:/^태화강 국가정원 /})).toBeVisible();
  await expect(link).toBeHidden();
});
