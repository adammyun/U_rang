import {z} from 'zod';
import {getPlaceStory} from './catalog';
export const storyIdSchema=z.string().max(60).refine(id=>Boolean(getPlaceStory(id)),'알 수 없는 장소 이야기입니다.');
export const discoveryInputSchema=z.object({storyId:storyIdSchema}).strict();
export const discoverySchema=z.object({storyId:storyIdSchema,discoveredAt:z.iso.datetime()}).strict();
export const discoveriesSchema=z.array(discoverySchema).max(100);
export type StoryDiscovery=z.infer<typeof discoverySchema>;
