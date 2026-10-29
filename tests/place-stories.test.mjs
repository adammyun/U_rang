import assert from 'node:assert/strict';
import {test} from 'node:test';
import {PLACE_STORIES,getPlaceStory,isStoryZoom,STORY_REVEAL_ZOOM} from '../src/features/stories/catalog.ts';
test('이야기는 울산 범위의 고유한 장소와 HTTPS 출처를 가진다',()=>{
 assert.equal(new Set(PLACE_STORIES.map(s=>s.id)).size,PLACE_STORIES.length);
 for(const story of PLACE_STORIES){
  assert.ok(story.lat>=35.44&&story.lat<=35.66&&story.lng>=129.17&&story.lng<=129.46);
  assert.ok(story.sources.length&&story.paragraphs.length);
  for(const source of story.sources)assert.equal(new URL(source.url).protocol,'https:');
  assert.equal(getPlaceStory(story.id),story);
 }
 assert.equal(getPlaceStory('unknown'),undefined);
});
test('가까이 확대해야 흔적이 드러나며 잘못된 확대값은 숨긴다',()=>{
 for(const zoom of [11.4,STORY_REVEAL_ZOOM-.01,NaN,Infinity])assert.equal(isStoryZoom(zoom),false);
 for(const zoom of [STORY_REVEAL_ZOOM,17])assert.equal(isStoryZoom(zoom),true);
});
