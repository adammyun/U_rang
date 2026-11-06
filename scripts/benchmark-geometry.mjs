import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {fileURLToPath} from 'node:url';
import {buildingPaths,mergeBuildingPaths} from '../src/features/map/urban-geometry.ts';

const [baselineDirectory,output]=process.argv.slice(2);
if(!baselineDirectory||!output)throw new Error('Provide a baseline dist directory and output JSON path.');
const city={lng:129.3114,lat:35.5384};
function project({lng,lat}){
 const size=512,sin=Math.sin(Math.max(-85,Math.min(85,lat))*Math.PI/180);
 return {x:(lng+180)/360*size,y:(.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*size};
}
const origin=project(city);
let beforeCalls=0,afterCalls=0;
function beforeProject(point){beforeCalls+=2;const p=project(point),o=project(city);return {x:(p.x-o.x)*4096,y:(p.y-o.y)*4096};}
function afterProject(point){afterCalls++;const p=project(point);return {x:(p.x-origin.x)*4096,y:(p.y-origin.y)*4096};}
const directory=new URL('../public/maps/ulsan-urban/',import.meta.url);
const cells=new Map(['5-5.json','5-6.json','6-5.json','6-6.json','7-5.json','7-6.json'].map(file=>[file,JSON.parse(readFileSync(new URL(file,directory),'utf8'))]));
const views=[['5-5.json','5-6.json','6-5.json','6-6.json'],['6-5.json','6-6.json','7-5.json','7-6.json'],['5-5.json','5-6.json','6-5.json','6-6.json']];
function legacy(features){
 const unique=[...new Map(features.map(item=>[item.id,item])).values()];
 return {count:unique.length,path:unique.filter(item=>item.kind==='building').map(item=>item.coordinates.map(([lng,lat],i)=>{const p=beforeProject({lng,lat});return `${i?'L':'M'}${p.x.toFixed(8)},${p.y.toFixed(8)}`;}).join('')+'Z').join('')};
}
const before=[],after=[];
for(let round=0;round<5;round++){
 const cached=new Map();
 let start=performance.now();
 const expected=views.map(files=>legacy(files.flatMap(file=>cells.get(file))));
 before.push(performance.now()-start);
 start=performance.now();
 const actual=views.map(files=>mergeBuildingPaths(files.flatMap(file=>{
  if(!cached.has(file))cached.set(file,buildingPaths(cells.get(file),afterProject));
  return cached.get(file);
 })));
 after.push(performance.now()-start);
 assert.deepEqual(actual,expected);
}
const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
function sizes(directory){
 const overview=readFileSync(`${directory}/maps/ulsan-urban/overview.json`);
 const assets=readdirSync(`${directory}/assets`).filter(file=>file.endsWith('.js')&&!file.startsWith('maplibre-gl-worker'));
 return {overviewBytes:overview.length,overviewGzipBytes:gzipSync(overview).length,appJsBytes:assets.reduce((sum,file)=>sum+readFileSync(`${directory}/assets/${file}`).length,0)};
}
const report={before:sizes(baselineDirectory),after:sizes(fileURLToPath(new URL('../dist-pages',import.meta.url))),geometry:{identical:true,rounds:5,viewsPerRound:views.length,beforeMedianMs:median(before),afterMedianMs:median(after),beforeProjectionCalls:beforeCalls,afterProjectionCalls:afterCalls}};
writeFileSync(output,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
