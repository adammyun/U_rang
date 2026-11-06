export type UrbanShape = {
  kind: 'building' | 'street' | 'block';
  coordinates: [number, number][];
  use?: string;
  major?: boolean;
};
export type UrbanFeature = UrbanShape & {id:string};
export type UrbanProject = (point:{lng:number;lat:number},zoom:number)=>{x:number;y:number};
export type BuildingPath = {id:string;path:string};

function path(shape:UrbanShape,project:UrbanProject) {
  return shape.coordinates.map(([lng,lat],index)=>{
    const p=project({lng,lat},0);
    return `${index?'L':'M'}${p.x.toFixed(8)},${p.y.toFixed(8)}`;
  }).join('')+(shape.kind==='street'?'':'Z');
}

export function urbanPaths(features:UrbanShape[],project:UrbanProject) {
  const result={block:'',industrial:'',building:'',street:'',artery:''};
  for(const feature of features){
    const kind=feature.kind==='block'&&feature.use==='industrial'?'industrial'
      :feature.kind==='street'&&feature.major?'artery':feature.kind;
    result[kind]+=path(feature,project);
  }
  return result;
}

// Cache the exact display geometry, rather than retaining decoded coordinate
// arrays and projecting every cached cell again after each viewport change.
export function buildingPaths(features:UrbanFeature[],project:UrbanProject):BuildingPath[] {
  return features.map(feature=>({id:feature.id,path:feature.kind==='building'?path(feature,project):''}));
}

export function mergeBuildingPaths(features:BuildingPath[]) {
  // Match the existing last-value-wins deduplication and first-ID order.
  const unique=[...new Map(features.map(feature=>[feature.id,feature])).values()];
  return {path:unique.map(feature=>feature.path).join(''),count:unique.length};
}
