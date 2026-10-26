export type OverlayRect={x:number;y:number;width:number;height:number};
const overlap=(a:OverlayRect,b:OverlayRect)=>Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));

/** Prefer the nearest free rectangle; edges of panels/controls are candidates.
 * A raised tooltip remains readable even in a viewport with no free rectangle.
 */
export function placeAnnotationPeek(point:{x:number;y:number},viewport:{width:number;height:number},bubble:{width:number;height:number},obstacles:OverlayRect[]){
 const pad=12,gap=10,w=bubble.width,h=bubble.height;
 const clampX=(x:number)=>Math.max(pad,Math.min(viewport.width-w-pad,x));
 const clampY=(y:number)=>Math.max(pad,Math.min(viewport.height-h-pad,y));
 const blockers=[...obstacles,{x:point.x-25,y:point.y-25,width:50,height:50}];
 const xs=[point.x+32,point.x-w-32,point.x-w/2,pad,viewport.width-w-pad,...obstacles.flatMap(r=>[r.x-w-gap,r.x+r.width+gap])];
 const ys=[point.y-h/2,point.y-h-32,point.y+32,pad,viewport.height-h-pad,...obstacles.flatMap(r=>[r.y-h-gap,r.y+r.height+gap])];
 let best={x:pad,y:pad},score=Infinity;
 for(const rawX of xs)for(const rawY of ys){
  const x=clampX(rawX),y=clampY(rawY),rect={x,y,width:w,height:h};
  const covered=blockers.reduce((sum,r)=>sum+overlap(rect,{x:r.x-gap,y:r.y-gap,width:r.width+2*gap,height:r.height+2*gap}),0);
  const distance=Math.hypot(x+w/2-point.x,y+h/2-point.y);
  const next=covered*100000+distance;
  if(next<score){score=next;best={x,y};}
 }
 return best;
}
