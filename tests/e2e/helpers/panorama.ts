import type {Page} from '@playwright/test';

export async function fakePanorama(page:Page) {
 // Test double only: interaction/overlay QA does not claim provider imagery.
 await page.addInitScript(()=>{
  class Panorama {
    pov={pan:0,tilt:0,fov:90};panoId='test-scene';
    events=new Map<string,Set<(value?:string)=>void>>();
    constructor(container:HTMLElement){container.style.background='#333b3e';container.setAttribute('data-test-sdk','simulated');const road=document.createElement('div');road.className='arrow_container_#0';road.textContent='→';road.style.cssText='position:absolute;left:12px;top:130px;width:44px;height:44px;';road.onclick=()=>road.setAttribute('data-clicked','true');container.appendChild(road);Object.assign(window,{__testPanorama:this});}
    getPanoId(){return this.panoId;} getPov(){return this.pov;}
    setSize(){}setVisible(){}
    emit(name:string,value?:string){this.events.get(name)?.forEach(callback=>callback(value));}
    setPov(pov:{pan:number;tilt:number;fov:number}){this.pov=pov;this.emit('pov_changed');}
    setPanoIdWithPov(id:string,pov:{pan:number;tilt:number;fov:number}){this.panoId=id;this.pov=pov;this.emit('pano_changed');this.emit('pano_status','OK');this.emit('pov_changed');}
  }
  Object.assign(window,{naver:{maps:{
    Panorama,LatLng:class {},Size:class {},Position:{TOP_RIGHT:'top-right'},
    Event:{
      addListener:(target:Panorama,name:string,callback:(value?:string)=>void)=>{
        const callbacks=target.events.get(name)??new Set();callbacks.add(callback);target.events.set(name,callbacks);
        if(name==='pano_status')setTimeout(()=>callback('OK'),100);
        return {target,name,callback};
      },
      removeListener(listener:{target:Panorama;name:string;callback:(value?:string)=>void}){listener.target.events.get(listener.name)?.delete(listener.callback);},
      clearInstanceListeners(target:Panorama){target.events.clear();},
    },
  }}});
 });
}
