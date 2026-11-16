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

/** Pixel spacing grows slower than the map scale at every zoom, so changing
 * from a dot to a note or a photo cannot make a separated pair rejoin. */
export function stampSpacing(zoom: number) {
  const far = Math.max(0, Math.min(1, (zoom - 11) / 2));
  const near = Math.max(0, Math.min(1, (zoom - 13) / 2.5));
  return {
    width: 56 * (104 / 56) ** far * (140 / 104) ** near,
    height: 54 * (60 / 54) ** far * (140 / 60) ** near,
  };
}

/** Find the first useful zoom for a pair with these pixel offsets.
 * Groups take the highest result over places outside the 100m reading radius. */
export function stampSplitZoom(zoom: number, maxZoom: number, dx: number, dy: number) {
  const fits = (at: number) => {
    const scale = 2 ** (at - zoom);
    const { width, height } = stampSpacing(at);
    return dx * scale < width && dy * scale < height;
  };
  if (fits(maxZoom)) return maxZoom;
  let lower = zoom, upper = maxZoom;
  for (let i = 0; i < 12; i++) {
    const mid = (lower + upper) / 2;
    if (fits(mid)) lower = mid;
    else upper = mid;
  }
  return Math.min(maxZoom, Math.max(zoom + .65, upper + .15));
}
