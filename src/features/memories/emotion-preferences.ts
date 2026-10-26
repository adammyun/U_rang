import {z} from 'zod';
import {emotions,type Emotion} from './model';
export const DEFAULT_EMOTION_MENU:Emotion[]=['nostalgic','peaceful','love','happy',...(Object.keys(emotions) as Emotion[]).filter(value=>!['nostalgic','peaceful','love','happy'].includes(value))];
export const emotionPreferencesSchema=z.object({emotionMenu:z.array(z.enum(Object.keys(emotions) as [Emotion,...Emotion[]])).min(1).max(DEFAULT_EMOTION_MENU.length).refine(values=>new Set(values).size===values.length)}).strict();
export type EmotionPreferences=z.infer<typeof emotionPreferencesSchema>;
export const defaultEmotionPreferences=():EmotionPreferences=>({emotionMenu:[...DEFAULT_EMOTION_MENU]});
