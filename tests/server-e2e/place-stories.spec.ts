import {mkdir} from 'node:fs/promises';
import {expect,test} from '@playwright/test';
test('서버 게스트의 발견 기록은 재접속해도 본인 보관함에서 읽힌다',async({page},info)=>{
 await mkdir('test-results-server/screenshots',{recursive:true});
 await page.addInitScript(()=>localStorage.setItem('yeoun_2:onboarding:v1',JSON.stringify({version:1,completed:true})));
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/?story=taehwaru');
 const story=page.getByRole('dialog',{name:'누각 아래, 예식장이 있던 자리'});
 await story.getByRole('link',{name:'로그인하고 이 이야기 보관하기'}).click();
 await page.getByRole('button',{name:'게스트로 시작',exact:true}).click();
 await expect(story.getByRole('status')).toContainText('담았어요');
 await page.screenshot({path:`test-results-server/screenshots/place-story-${info.project.name}.png`,animations:'disabled'});
 const records=await page.request.get('/api/users/me/discoveries');expect(records.status()).toBe(200);expect((await records.json()).data).toHaveLength(1);
 await story.getByRole('button',{name:'장소 이야기 닫기'}).click();
 await expect(page.locator('.raster-memory-marker').first()).toBeVisible();
 // Leave the deep link so reloading doesn't reopen its reading panel.
 await page.goto('/');await expect(page.locator('.raster-memory-marker').first()).toBeVisible();await page.getByLabel('지도 메뉴').getByRole('button',{name:'내 기억',exact:true}).click();
 const personal=page.getByRole('dialog',{name:'마이페이지'});
 await expect(personal.locator('.personal-totals dd').first()).not.toHaveText('—');
 await personal.getByRole('tab',{name:'발견한 이야기',exact:true}).click();
 await expect(personal.getByRole('button',{name:/태화루 .*누각 아래/})).toBeInViewport();
 await page.screenshot({path:`test-results-server/screenshots/place-story-collection-${info.project.name}.png`,animations:'disabled'});
 await page.getByRole('button',{name:'게스트 로그아웃',exact:true}).click();
 expect((await page.request.get('/api/users/me/discoveries')).status()).toBe(401);
 expect(errors).toEqual([]);
});
