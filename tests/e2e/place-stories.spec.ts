import {mkdir} from 'node:fs/promises';
import {expect,test} from '@playwright/test';

test.beforeEach(async({page})=>{
 await mkdir('test-results/screenshots',{recursive:true});
 await page.addInitScript(()=>localStorage.setItem('yeoun_2:onboarding:v1',JSON.stringify({version:1,completed:true})));
});

test('확대해서 발견한 장소 이야기를 읽고 마이페이지에 보관한다',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('./#/login');await page.getByRole('button',{name:'게스트로 시작',exact:true}).click();
 const traces=page.locator('.map-story-mark');await expect(traces).toHaveCount(0);
 await page.getByRole('combobox',{name:'장소 이름'}).fill('대왕암');
 await page.getByRole('option',{name:/^대왕암공원 /}).click();
 await expect(page.locator('.ulsan-line-map')).toBeVisible();
 // Search flies to zoom 14.2; wait for completion before taking the next step.
 await expect.poll(()=>page.locator('.ulsan-line-map').evaluate(el=>Math.log2(el.clientWidth/Number(el.getAttribute('viewBox')!.split(' ')[2]))+12)).toBeCloseTo(14.2,3);
 await expect(traces).toHaveCount(0);
 await page.getByRole('button',{name:'지도 확대',exact:true}).click();
 const trace=page.getByRole('button',{name:'울기등대의 숨은 이야기',exact:true});await expect(trace).toBeVisible();
 await page.screenshot({path:`test-results/screenshots/place-story-trace-${info.project.name}.png`,animations:'disabled'});
 await trace.click();
 const story=page.getByRole('dialog',{name:'소나무가 자라자, 등대가 자리를 옮겼다'});await expect(story).toBeVisible();
 await expect(story.getByRole('status')).toContainText('발견한 이야기에 담았어요');
 await expect(story.getByRole('link',{name:'대왕암공원 · 울기등대 이야기'})).toHaveAttribute('href','https://daewangam.donggu.ulsan.kr/Pgparkprevew2.do');
 const scroll=story.getByLabel('장소 이야기 내용');await scroll.evaluate(el=>{el.scrollTop=el.scrollHeight;});
 await expect(story.getByRole('link',{name:'대왕암공원 · 울기등대 이야기'})).toBeInViewport();
 await page.screenshot({path:`test-results/screenshots/place-story-read-${info.project.name}.png`,animations:'disabled'});
 await story.getByRole('button',{name:'장소 이야기 닫기'}).click();
 await page.getByLabel('지도 메뉴').getByRole('button',{name:'내 기억',exact:true}).click();
 const personal=page.getByRole('dialog',{name:'마이페이지'});
 await personal.getByRole('tab',{name:'발견한 이야기',exact:true}).click();
 const card=personal.getByRole('button',{name:/울기등대 .*소나무가 자라자/});await expect(card).toBeInViewport();
 await expect(personal.locator('.story-collection-list > button')).toHaveCount(1);
 await page.screenshot({path:`test-results/screenshots/place-story-collection-${info.project.name}.png`,animations:'disabled'});
 const saved=await page.evaluate(()=>localStorage.getItem('yurang:place-stories:v1'));
 await card.click();await expect(story.getByRole('status')).toContainText('담았어요');
 expect(await page.evaluate(()=>localStorage.getItem('yurang:place-stories:v1'))).toBe(saved);
 await story.getByRole('button',{name:'장소 이야기 닫기'}).click();
 await page.reload();await page.getByLabel('지도 메뉴').getByRole('button',{name:'내 기억',exact:true}).click();
 await personal.getByRole('tab',{name:'발견한 이야기',exact:true}).click();await expect(card).toBeInViewport();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(errors).toEqual([]);
});

test('비로그인 사용자는 읽을 수 있고 로그인 후 원래 이야기로 돌아와 보관한다',async({page})=>{
 await page.goto('./#/?story=taehwaru');
 const story=page.getByRole('dialog',{name:'누각 아래, 예식장이 있던 자리'});
 await expect(story.getByRole('link',{name:'로그인하고 이 이야기 보관하기'})).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('yurang:place-stories:v1'))).toBeNull();
 await story.getByRole('link',{name:'로그인하고 이 이야기 보관하기'}).click();
 await page.getByRole('button',{name:'게스트로 시작',exact:true}).click();
 await expect(story.getByRole('status')).toContainText('담았어요');
 await story.getByRole('button',{name:'지도에서 보기',exact:true}).click();
 await expect(story).toHaveCount(0);
 await expect(page.getByRole('button',{name:'태화루의 숨은 이야기',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'기억을 남길 장소 선택하기'}).click();
 await expect(page.locator('.map-story-mark')).toHaveCount(0);
});
