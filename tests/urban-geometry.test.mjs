import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {urbanPaths,buildingPaths,mergeBuildingPaths} from '../src/features/map/urban-geometry.ts';

test('compact overview preserves all 27,534 original ordered display shapes and coordinates',()=>{
 const data=JSON.parse(readFileSync(new URL('../public/maps/ulsan-urban/overview.json',import.meta.url),'utf8'));
 const shape=JSON.stringify(data.overview.map(({kind,coordinates,use,major})=>({kind,coordinates,use,major})));
 // Captured from the published pre-optimization asset, rather than rederived
 // from the new renderer. Protects shape detail, ordering and classifications.
 assert.equal(createHash('sha256').update(shape).digest('hex'),'e26f8182354bc7f1e0bd4ba2fd957d03626fec0bda6cddb7bfd1184a79663a95');
 assert.equal(data.overview.length,27534);
 assert.equal(data.overview.filter(item=>item.kind==='building').length,6597);
 assert.equal(data.license,'ODbL-1.0');
 assert.match(data.copyright,/OpenStreetMap/);
});

test('cached cell paths preserve closure, cross-cell last-value geometry and first-ID order',()=>{
 let calls=0;
 const project=({lng,lat})=>{calls++;return {x:lng,y:lat};};
 const a={id:'a',kind:'building',coordinates:[[0,1],[2,3]]};
 const replacement={...a,coordinates:[[5,6]]};
 const road={id:'road',kind:'street',coordinates:[[9,9]]};
 const b={id:'b',kind:'building',coordinates:[[7,8]]};
 const first=buildingPaths([a,road],project),second=buildingPaths([b,replacement],project);
 assert.deepEqual(mergeBuildingPaths([...first,...second]),{count:3,path:'M5.00000000,6.00000000ZM7.00000000,8.00000000Z'});
 assert.equal(calls,4);
 mergeBuildingPaths([...second,...first]);
 assert.equal(calls,4,'reassembling cached geometry must perform no coordinate projections');
 assert.equal(urbanPaths([road],project).street,'M9.00000000,9.00000000');
});
