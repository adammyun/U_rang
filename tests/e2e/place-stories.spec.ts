import {mkdir} from 'node:fs/promises';
import {expect,test} from '@playwright/test';
import {PLACE_STORIES,STORY_REVEAL_ZOOM,STORY_LOCATION_ZOOM} from '../../src/features/stories/catalog';
const mapZoom=(page:import('@playwright/test').Page)=>page.locator('.ulsan-line-map').evaluate(el=>Math.log2(el.clientWidth/Number(el.getAttribute('viewBox')!.split(' ')[2]))+12);

test.beforeEach(async({page})=>{
 await mkdir('test-results/screenshots',{recursive:true});
 await page.addInitScript(()=>localStorage.setItem('yeoun_2:onboarding:v1',JSON.stringify({version:1,completed:true})));
});

test('확대해서 발견한 장소 이야기를 읽고 마이페이지에 보관한다',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('./#/login');await page.getByRole('button',{name:'게스트로 시작',exact:true}).click();
 const traces=page.locator('.map-story-mark');await expect(traces).toHaveCount(0);
 await page.goto('./#/dev');
 await page.getByRole('link',{name:'울기등대 위치 확인',exact:true}).click();
 await expect.poll(()=>mapZoom(page)).toBeCloseTo(STORY_LOCATION_ZOOM,8);
 expect(await page.evaluate(()=>localStorage.getItem('yurang:place-stories:v1'))).toBeNull();
 await page.getByRole('button',{name:'지도 축소',exact:true}).click();
 await expect.poll(()=>mapZoom(page)).toBeCloseTo(STORY_LOCATION_ZOOM-1,8);
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
 await page.getByLabel('지도 메뉴').getByRole('button',{name:'마이페이지',exact:true}).click();
 const personal=page.getByRole('dialog',{name:'마이페이지'});
 await personal.getByRole('button',{name:'발견한 이야기 보기',exact:true}).click();
 const card=personal.getByRole('button',{name:/울기등대 .*소나무가 자라자/});await expect(card).toBeInViewport();
 await expect(personal.locator('.story-collection-list > button')).toHaveCount(1);
 await page.screenshot({path:`test-results/screenshots/place-story-collection-${info.project.name}.png`,animations:'disabled'});
 const saved=await page.evaluate(()=>localStorage.getItem('yurang:place-stories:v1'));
 await card.click();await expect(story.getByRole('status')).toContainText('담았어요');
 expect(await page.evaluate(()=>localStorage.getItem('yurang:place-stories:v1'))).toBe(saved);
 await story.getByRole('button',{name:'장소 이야기 닫기'}).click();
 await page.reload();await page.getByLabel('지도 메뉴').getByRole('button',{name:'마이페이지',exact:true}).click();
 await personal.getByRole('button',{name:'발견한 이야기 보기',exact:true}).click();await expect(card).toBeInViewport();
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


test('개발 도구의 전체 이야기 위치 확인은 발견 기록 없이 정확한 지도로 이동한다',async({page},info)=>{
 test.setTimeout(60000);
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('./#/dev');
 const catalog=page.getByRole('region',{name:'숨은 이야기 위치',exact:true});
 await expect(catalog.locator('li')).toHaveCount(PLACE_STORIES.length);
 await expect(catalog).toContainText(`확대 ${STORY_REVEAL_ZOOM}부터`);
 await catalog.scrollIntoViewIfNeeded();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`test-results/screenshots/story-locations-dev-${info.project.name}.png`,animations:'disabled',fullPage:true});
 for(const story of PLACE_STORIES.filter(story=>'checkedAt' in story)){
  if(!page.url().endsWith('#/dev'))await page.goto('./#/dev');
  await page.getByRole('link',{name:`${story.place} 위치 확인`,exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`storyLocation=${story.id}$`));
  await expect.poll(()=>mapZoom(page)).toBeCloseTo(STORY_LOCATION_ZOOM,8);
  const trace=page.getByRole('button',{name:`${story.place}의 숨은 이야기`,exact:true});
  await expect(trace).toBeInViewport();
  const centered=await trace.evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,width:innerWidth,height:innerHeight};});
  expect(Math.abs(centered.x-centered.width/2)).toBeLessThan(2);
  expect(Math.abs(centered.y-centered.height/2)).toBeLessThan(2);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(()=>localStorage.getItem('yurang:place-stories:v1'))).toBeNull();
  await trace.click();
  const detail=page.getByRole('dialog',{name:story.title,exact:true});await expect(detail).toBeVisible();
  await expect(detail).toContainText(story.paragraphs[0]);
  await expect(detail.getByRole('link',{name:story.sources[0].label,exact:true})).toHaveAttribute('href',story.sources[0].url);
  expect(await page.evaluate(()=>localStorage.getItem('yurang:place-stories:v1'))).toBeNull();
  await detail.getByRole('button',{name:'장소 이야기 닫기'}).click();
 }
 await page.goto('./#/dev');
 await page.getByRole('link',{name:'울산 동헌 및 내아 위치 확인',exact:true}).click();
 await expect(page.getByRole('button',{name:'울산 동헌 및 내아의 숨은 이야기',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'지도 축소',exact:true}).click();
 await expect.poll(()=>mapZoom(page)).toBeCloseTo(STORY_LOCATION_ZOOM-1,8);
 await expect(page.locator('.map-story-mark')).toHaveCount(0);
 await page.screenshot({path:`test-results/screenshots/story-locations-hidden-${info.project.name}.png`,animations:'disabled'});
 // An unknown catalog ID cannot set an arbitrary camera or bypass reveal policy.
 await page.goto('./?default-story-check#/');
 await expect(page.locator('.atlas-stamp').first()).toBeVisible();
 const defaultCamera=await page.locator('.ulsan-line-map').getAttribute('viewBox');
 await page.goto('./?invalid-story-check#/?storyLocation=unknown');
 await expect(page.locator('.atlas-stamp').first()).toBeVisible();
 await expect(page.locator('.ulsan-line-map')).toHaveAttribute('viewBox',defaultCamera!);
 await expect(page.locator('.map-story-mark')).toHaveCount(0);
 expect(errors).toEqual([]);
});
