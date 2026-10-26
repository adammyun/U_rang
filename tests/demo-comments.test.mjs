import test from 'node:test';
import assert from 'node:assert/strict';
import {demoComments,demoCommentsForMemory} from '../src/features/memories/demo-comments.ts';

test('each of 23 fictitious public memories has two stable anonymous comments, no private fixtures',()=>{
 assert.equal(demoComments.length,46);assert.equal(new Set(demoComments.map(row=>row.id)).size,46);
 assert.equal(new Set(demoComments.map(row=>row.memoryId)).size,23);
 assert.equal(demoCommentsForMemory('20000000-0000-4000-8000-000000000099').length,0);
 assert.equal(demoCommentsForMemory('a-real-user-memory').length,0);
 assert.ok(demoComments.every(row=>row.memoryOwnerId.startsWith('demo-user-')&&row.content.length>10));
});
