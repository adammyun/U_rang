import test from 'node:test';
import assert from 'node:assert/strict';
import { memoryDay, memoryDayBounds, dailyMemoryTrace } from '../src/features/memories/daily-interest.ts';
const day='2026-11-25';
test('interest uses Korean midnight, including the UTC day before',()=>{
  const before=Date.parse('2026-11-24T14:59:59Z'),after=before+1000;
  assert.equal(memoryDay(before),'2026-11-24');
  assert.equal(memoryDay(after),day);
  assert.deepEqual(memoryDayBounds(after),{day,start:'2026-11-24T15:00:00.000Z',end:'2026-11-25T15:00:00.000Z'});
});
test('only current public activity can win; ranking is stable across input order',()=>{
  const rows=[
    {id:'private',visibility:'private',dailyInterest:{day,score:100}},
    {id:'unlisted',visibility:'unlisted',dailyInterest:{day,score:200}},
    {id:'yesterday',visibility:'public',dailyInterest:{day:'2026-11-24',score:300}},
    {id:'view',visibility:'public',dailyInterest:{day,score:1}},
    {id:'like',visibility:'public',dailyInterest:{day,score:4}},
  ];
  assert.equal(dailyMemoryTrace(rows,day),'like');
  assert.equal(dailyMemoryTrace([...rows].reverse(),day),'like');
});
test('discovery is stable, bounded to supplied public records and can be disabled',()=>{
  const rows=['one','two','three'].map(id=>({id,visibility:'public'}));
  const id=dailyMemoryTrace(rows,day);
  assert.ok(rows.some(row=>row.id===id));
  assert.equal(dailyMemoryTrace(rows.reverse(),day),id);
  assert.equal(dailyMemoryTrace(rows,day,false),null);
  assert.equal(dailyMemoryTrace([{id:'secret',visibility:'private'}],day),null);
  assert.equal(dailyMemoryTrace([],day),null);
});
