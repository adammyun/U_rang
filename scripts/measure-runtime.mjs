// Local, isolated browser profiles only; never reads a visitor's stored records.
import {chromium,webkit,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const [base,output]=process.argv.slice(2);
if(!base||!output||new URL(base).hostname!=='127.0.0.1')throw new Error('Use a localhost URL and an output directory.');
await mkdir(output,{recursive:true});
const results=[];
for(const [engine,launcher] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await launcher.launch();
 try{
  for(const mobile of [false,true]){
   const name=`${mobile?'mobile':'desktop'}-${engine}`;
   const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},hasTouch:mobile,isMobile:mobile,reducedMotion:'reduce'});
   await context.addInitScript(()=>{
    localStorage.setItem('yeoun_2:onboarding:v1',JSON.stringify({version:1,completed:true}));
    localStorage.setItem('yeoun_2.pages.auth.v1','signed-in');
    Math.random=()=>.42;
   });
   const page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.clock.setFixedTime(new Date('2026-11-05T03:00:00Z'));
   const started=performance.now();
   await page.goto(base);
   await page.evaluate(()=>document.fonts.ready);
   const urban=page.locator('.ulsan-urban-layers');
   await expect(urban).toHaveAttribute('data-building-level','overview');
   await expect(page.locator('.map-caption strong')).not.toHaveText('…');
   await expect.poll(()=>page.locator('.atlas-stamp img').evaluateAll(nodes=>nodes.every(node=>node.complete&&node.naturalWidth>0))).toBe(true);
   const readyMs=performance.now()-started;
   const states=[];
   async function capture(state){
    // Labels and counters can mount after the first fonts.ready promise.
    // Wait again for the text actually present in this comparison state.
    await page.evaluate(()=>document.fonts.ready);
    await page.mouse.move(page.viewportSize().width-2,2);
    await page.screenshot({path:`${output}/${name}-${state}.png`,animations:'disabled'});
    const geometry=await page.locator('.ulsan-line-map').evaluate(el=>({viewBox:el.getAttribute('viewBox'),paths:Array.from(el.querySelectorAll('path'),path=>[path.getAttribute('class'),path.getAttribute('d'),path.getAttribute('style')]),labels:Array.from(el.querySelectorAll('text'),text=>[text.textContent,text.getAttribute('x'),text.getAttribute('y'),text.getAttribute('style')])}));
    states.push({state,geometrySha256:createHash('sha256').update(JSON.stringify(geometry)).digest('hex')});
   }
   await capture('main');
   const localResources=await page.evaluate(()=>performance.getEntriesByType('resource').filter(entry=>entry.name.startsWith(location.origin)).map(entry=>({path:new URL(entry.name).pathname,bytes:entry.decodedBodySize,transfer:entry.encodedBodySize,duration:entry.duration})));
   await page.getByRole('button',{name:/^지도 조정 열기/}).click();
   await page.getByRole('dialog').getByRole('button',{name:/^다크/}).click();
   await page.getByRole('button',{name:'지도 조정 닫기',exact:true}).click();
   await capture('dark');
   await page.getByRole('combobox',{name:'장소 이름'}).fill('성남동');
   await page.getByRole('option',{name:/성남동 문화의거리/}).click();
   await expect.poll(()=>page.locator('.ulsan-line-map').evaluate(el=>Math.log2(el.clientWidth/Number(el.getAttribute('viewBox').split(' ')[2]))+12)).toBeCloseTo(14.2,10);
   await expect(urban).toHaveAttribute('data-building-level','footprints');
   await capture('buildings');
   await page.getByRole('button',{name:'골목의 작은 불빛',exact:true}).click();
   await expect(page.getByLabel('장소의 기억 미리보기')).toBeVisible();
   await page.getByRole('button',{name:'선택한 기억 자세히 읽기'}).click();
   await expect(page.getByRole('dialog',{name:'기억 상세'})).toBeVisible();
   await capture('detail');
   await page.getByRole('button',{name:'기억 닫기',exact:true}).click();
   await page.getByLabel('지도 메뉴').getByRole('button',{name:'마이페이지',exact:true}).click();
   await expect(page.locator('.personal-totals dd').first()).not.toHaveText('—');
   await capture('personal');
   expect(errors).toEqual([]);
   results.push({name,readyMs,states,localResources,errors});
   await context.close();
  }
 }finally{await browser.close();}
}
await writeFile(`${output}/metrics.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(({name,readyMs,states})=>({name,readyMs,states})),null,2));
