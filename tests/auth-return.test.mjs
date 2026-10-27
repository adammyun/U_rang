import assert from 'node:assert/strict';
import {test} from 'node:test';
import {safeReturnPath} from '../src/features/auth/return-path.ts';
test('guest and account return paths preserve only safe app destinations',()=>{
 for(const bad of [undefined,'https://example.com','//example.com','/\\example.com','/\nexample.com','/api/auth/guest','/login','/signin-with-chatgpt','/callback'])assert.equal(safeReturnPath(bad),'/');
 assert.equal(safeReturnPath('/?personal=1&year=2025#place'),'/?personal=1&year=2025#place');
 assert.equal(safeReturnPath('/my-map?emotion=sad'),'/my-map?emotion=sad');
});
