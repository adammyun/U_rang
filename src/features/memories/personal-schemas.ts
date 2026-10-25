import { z } from 'zod';
import { boundsSchema } from './schemas';

const flag = (fallback: '0'|'1') => z.enum(['0','1']).default(fallback).transform(value=>value==='1');
export const personalQuerySchema = boundsSchema.and(z.object({ mine:flag('1'), bookmarked:flag('0'), liked:flag('0'), visibility:z.enum(['private','public','unlisted']).optional() }));
export const activityInputSchema = z.discriminatedUnion('action',[
  z.object({ action:z.literal('view'), visitorId:z.uuid() }),
  z.object({ action:z.enum(['like','bookmark']), active:z.boolean() }),
]);
