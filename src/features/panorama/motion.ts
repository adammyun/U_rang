/** The SDK may publish POV only after a gesture. Never show stale scene pins.
 * Hide synchronously on input, then sample the final POV before revealing.
 * Only the native canvas is observed; scrolling the comment list is untouched.
 */
export function trackPanoramaMotion(container:HTMLElement,onSettled:()=>void){
 const stage=container.parentElement,pointers=new Set<number>();
 let disposed=false,revision=0,timer:ReturnType<typeof setTimeout>|undefined,reveal=0;
 const changed=()=>{
  if(disposed)return;
  const current=++revision;
  stage?.setAttribute('data-panorama-moving','true');
  clearTimeout(timer);cancelAnimationFrame(reveal);
  timer=setTimeout(()=>{
   if(disposed||pointers.size)return;
   onSettled();
   // The sample and React commit must precede visibility, including Safari.
   reveal=requestAnimationFrame(()=>{reveal=requestAnimationFrame(()=>{
    if(!disposed&&revision===current&&!pointers.size)stage?.removeAttribute('data-panorama-moving');
   });});
  },240);
 };
 const down=(event:PointerEvent)=>{pointers.add(event.pointerId);changed();};
 const move=(event:PointerEvent)=>{if(pointers.has(event.pointerId))changed();};
 const up=(event:PointerEvent)=>{if(pointers.delete(event.pointerId))changed();};
 const blur=()=>{if(pointers.size){pointers.clear();changed();}};
 const key=(event:KeyboardEvent)=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','PageUp','PageDown'].includes(event.key))changed();};
 const options={capture:true,passive:true};
 container.addEventListener('pointerdown',down,options);container.addEventListener('pointermove',move,options);
 container.addEventListener('wheel',changed,options);container.addEventListener('keydown',key,true);
 window.addEventListener('pointerup',up,true);window.addEventListener('pointercancel',up,true);window.addEventListener('blur',blur);
 return {changed,dispose(){
  disposed=true;clearTimeout(timer);cancelAnimationFrame(reveal);pointers.clear();
  container.removeEventListener('pointerdown',down,true);container.removeEventListener('pointermove',move,true);
  container.removeEventListener('wheel',changed,true);container.removeEventListener('keydown',key,true);
  window.removeEventListener('pointerup',up,true);window.removeEventListener('pointercancel',up,true);window.removeEventListener('blur',blur);
  stage?.removeAttribute('data-panorama-moving');
 }};
}
