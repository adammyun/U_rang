import assert from 'node:assert/strict';
import test from 'node:test';
import {commentInputSchema,commentCursorSchema,encodeCommentCursor} from '../src/features/memories/comments-model.ts';
test('comments reject empty/oversized/identity payloads and preserve text as text',()=>{
 assert.equal(commentInputSchema.parse({content:'  <b>기억</b>\n다음 줄  '}).content,'<b>기억</b>\n다음 줄');
 for(const value of [{content:' '},{content:'x'.repeat(1001)},{content:'글',user_id:'spoof'}])assert.equal(commentInputSchema.safeParse(value).success,false);
});
test('comment cursors are bounded timestamp/id pairs, never author identifiers',()=>{
 const value={id:'20000000-0000-4000-8000-000000000001',createdAt:'2026-10-25T00:00:00.000Z'};
 assert.deepEqual(commentCursorSchema.parse(encodeCommentCursor(value)),value);
 for(const input of ['bad',encodeURIComponent(JSON.stringify({...value,user_id:'secret'})),'x'.repeat(181)])assert.equal(commentCursorSchema.safeParse(input).success,false);
});
