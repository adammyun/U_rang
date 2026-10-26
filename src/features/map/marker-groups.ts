export type ProjectedItem<T> = {x:number;y:number;value:T};
export type MarkerGroup<T> = {x:number;y:number;items:T[]};

/** Fixed world-space hash: at most nine representative checks per item.
 * Panning only translates groups, so their membership does not flicker.
 * Representatives stay fixed; each cell can hold at most one representative.
 */
export function groupMapMarkers<T>(points:ProjectedItem<T>[],width:number,height:number):MarkerGroup<T>[] {
  if(width<=0 || height<=0)throw new Error('Marker footprint must be positive.');
  const cells=new Map<string,MarkerGroup<T>>(),groups:MarkerGroup<T>[]=[];
  for(const point of points){
    if(!Number.isFinite(point.x)||!Number.isFinite(point.y))continue;
    const cx=Math.floor(point.x/width),cy=Math.floor(point.y/height);
    let nearest:MarkerGroup<T>|undefined,score=Infinity;
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){
      const group=cells.get(`${cx+dx}:${cy+dy}`);
      if(!group || Math.abs(group.x-point.x)>=width || Math.abs(group.y-point.y)>=height)continue;
      const distance=((group.x-point.x)/width)**2+((group.y-point.y)/height)**2;
      if(distance<score){nearest=group;score=distance;}
    }
    if(nearest)nearest.items.push(point.value);
    else {const group={x:point.x,y:point.y,items:[point.value]};cells.set(`${cx}:${cy}`,group);groups.push(group);}
  }
  return groups;
}
