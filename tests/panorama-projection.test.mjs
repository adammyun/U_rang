import assert from 'node:assert/strict';
import test from 'node:test';
import {screenToAnchor,anchorToScreen} from '../src/features/panorama/projection.ts';
import {panoramaAnchorSchema} from '../src/features/memories/comments-model.ts';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('scene directions survive yaw seam, tilt, zoom and portrait/landscape viewport changes',()=>{
 for(const [width,height] of [[1100,650],[390,710],[650,650]])for(const pan of [-179,0,179])for(const tilt of [-70,0,65])for(const fov of [20,90,100]){
  const frame={panoId:'test-scene',width,height,pov:{pan,tilt,fov}};
  for(const [x,y] of [[width/2,height/2],[width*.15,height*.2],[width*.8,height*.85]]){
   const anchor=panoramaAnchorSchema.parse(screenToAnchor(frame,x,y)),screen=anchorToScreen(frame,anchor);
   assert.ok(screen);near(screen.x,x);near(screen.y,y);
  }
 }
});
test('different scenes, backwards directions and offscreen points do not create floating false pins',()=>{
 const frame={panoId:'test-scene',width:1000,height:600,pov:{pan:0,tilt:0,fov:90}};
 assert.equal(anchorToScreen(frame,{panoId:'another-scene',pan:0,tilt:0}),null);
 assert.equal(anchorToScreen(frame,{panoId:'test-scene',pan:180,tilt:0}),null);
 assert.equal(anchorToScreen(frame,{panoId:'test-scene',pan:80,tilt:0}),null);
 assert.equal(screenToAnchor({...frame,width:0},0,0),null);
 assert.equal(screenToAnchor(frame,-1,100),null);
 const anchor=screenToAnchor(frame,500,300);const moved={...frame,pov:{pan:20,tilt:10,fov:60}};
 const screen=anchorToScreen(moved,anchor);assert.ok(screen);assert.notEqual(screen.x,500);assert.notEqual(screen.y,300);
});
