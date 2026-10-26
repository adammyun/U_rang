import assert from 'node:assert/strict';
import {test} from 'node:test';
import {placeAnnotationPeek} from '../src/features/panorama/annotation-layout.ts';
const intersects=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
for(const [name,viewport,point,bubble,blockers] of [
 ['desktop panel and controls',{width:1120,height:660},{x:850,y:180},{width:300,height:125},[{x:764,y:72,width:340,height:540},{x:70,y:16,width:108,height:44},{x:70,y:66,width:300,height:30}]],
 ['mobile bottom panel',{width:390,height:712},{x:60,y:150},{width:260,height:88},[{x:16,y:224,width:358,height:440},{x:70,y:16,width:108,height:44},{x:70,y:65,width:220,height:34}]],
 ['viewport edge',{width:390,height:712},{x:388,y:710},{width:300,height:88},[]],
])test(`peek avoids ${name} without leaving viewport`,()=>{
 const rect={...placeAnnotationPeek(point,viewport,bubble,blockers),...bubble};
 assert.ok(rect.x>=12&&rect.y>=12&&rect.x+rect.width<=viewport.width-12&&rect.y+rect.height<=viewport.height-12);
 for(const blocker of blockers)assert.equal(intersects(rect,blocker),false);
 assert.equal(intersects(rect,{x:point.x-22,y:point.y-22,width:44,height:44}),false);
});
