import type { PanoramaAnchor } from '../memories/comments-model';

export type PanoramaPov = {pan:number;tilt:number;fov:number};
export type PanoramaFrame = {panoId:string;pov:PanoramaPov;width:number;height:number};
const rad=(value:number)=>value*Math.PI/180;
const deg=(value:number)=>value*180/Math.PI;
const dot=(a:number[],b:number[])=>a.reduce((sum,value,index)=>sum+value*b[index],0);
export const normalizePan=(pan:number)=>((pan+180)%360+360)%360-180;
function basis(pov:PanoramaPov) {
  const pan=rad(pov.pan),tilt=rad(pov.tilt);
  return {
    forward:[Math.sin(pan)*Math.cos(tilt),Math.sin(tilt),Math.cos(pan)*Math.cos(tilt)],
    right:[Math.cos(pan),0,-Math.sin(pan)],
    up:[-Math.sin(pan)*Math.sin(tilt),Math.cos(tilt),-Math.cos(pan)*Math.sin(tilt)],
  };
}
function focal(frame:PanoramaFrame) {
  if(!frame.panoId || ![frame.width,frame.height,frame.pov.pan,frame.pov.tilt,frame.pov.fov].every(Number.isFinite) || frame.width<=0 || frame.height<=0 || frame.pov.fov<=0 || frame.pov.fov>=180)return null;
  // NAVER's rectilinear renderer defines fov along the longer viewport edge.
  // Only public getPov()/getPanoId() values are used at runtime; no SDK internals.
  return Math.max(frame.width,frame.height)/(2*Math.tan(rad(frame.pov.fov)/2));
}
export function screenToAnchor(frame:PanoramaFrame,x:number,y:number):PanoramaAnchor|null {
  const f=focal(frame);if(!f || !Number.isFinite(x) || !Number.isFinite(y) || x<0 || x>frame.width || y<0 || y>frame.height)return null;
  const {forward,right,up}=basis(frame.pov),dx=(x-frame.width/2)/f,dy=(frame.height/2-y)/f;
  const vector=forward.map((value,index)=>value+right[index]*dx+up[index]*dy);
  return {panoId:frame.panoId,pan:normalizePan(deg(Math.atan2(vector[0],vector[2]))),tilt:deg(Math.atan2(vector[1],Math.hypot(vector[0],vector[2])))};
}
export function anchorToScreen(frame:PanoramaFrame,anchor:PanoramaAnchor):{x:number;y:number}|null {
  const f=focal(frame);if(!f || anchor.panoId!==frame.panoId)return null;
  const vector=basis({...anchor,fov:frame.pov.fov}).forward,axes=basis(frame.pov),depth=dot(vector,axes.forward);
  if(depth<=0.001)return null;
  const x=frame.width/2+f*dot(vector,axes.right)/depth,y=frame.height/2-f*dot(vector,axes.up)/depth;
  if(x<0 || y<0 || x>frame.width || y>frame.height)return null;
  return {x,y};
}
