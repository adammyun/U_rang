import test from 'node:test';
import assert from 'node:assert/strict';
import {groupMapMarkers,stampSpacing,stampSplitZoom} from '../src/features/map/marker-groups.ts';

test('dense memories share one marker without losing items',()=>{
 const points=Array.from({length:20000},(_,id)=>({x:100+id%30,y:100+(id%20),value:id}));
 const groups=groupMapMarkers(points,120,140);
 assert.equal(groups.length,1);assert.equal(groups[0].items.length,20000);assert.equal(new Set(groups[0].items).size,20000);
});
test('neighboring cells cluster across cell edges while distant places stay separate',()=>{
 const points=[{x:119,y:139,value:'a'},{x:121,y:141,value:'b'},{x:550,y:550,value:'c'},{x:-121,y:-141,value:'d'},{x:-119,y:-139,value:'e'}];
 const groups=groupMapMarkers(points,120,140);
 assert.deepEqual(groups.map(group=>group.items),[['a','b'],['c'],['d','e']]);
 assert.deepEqual(groups.map(group=>[group.x,group.y]),[[119,139],[550,550],[-121,-141]]);
});
test('group representative footprints do not overlap and every input appears once',()=>{
 const points=Array.from({length:1000},(_,id)=>({x:(id*31)%1900,y:(id*53)%1100,value:id}));
 const groups=groupMapMarkers(points,120,140);
 assert.equal(groups.flatMap(group=>group.items).length,1000);
 for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++)assert.ok(Math.abs(groups[i].x-groups[j].x)>=120 || Math.abs(groups[i].y-groups[j].y)>=140);
});

test('a pair separates at most once when zooming across marker styles',()=>{
  const points=[{x:0,y:0,value:'a'},{x:45,y:14,value:'b'}];
  let wasSeparate=false;
  for(let step=0;step<=140;step++){
    const zoom=10+step*.05,scale=2**(zoom-11);
    const {width,height}=stampSpacing(zoom);
    const groups=groupMapMarkers(points.map(p=>({...p,x:p.x*scale,y:p.y*scale})),width,height);
    if(wasSeparate)assert.equal(groups.length,2);
    wasSeparate=groups.length===2;
  }
  assert.ok(wasSeparate);
});

test('a group click targets its first useful split, without exceeding the zoom limit',()=>{
  const zoom=12,max=17,dx=61,dy=25;
  const target=stampSplitZoom(zoom,max,dx,dy);
  const {width,height}=stampSpacing(target);
  const scale=2**(target-zoom);
  assert.ok(target>zoom && target<zoom+1.8);
  assert.equal(groupMapMarkers([{x:0,y:0,value:'a'},{x:dx*scale,y:dy*scale,value:'b'}],width,height).length,2);
  assert.equal(stampSplitZoom(zoom,max,0,0),max);
});
