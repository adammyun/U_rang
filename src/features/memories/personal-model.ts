import type { Bounds, Memory } from './model';
import type { MemoryFilters } from './schemas';

export type PersonalSelection = { mine: boolean; bookmarked: boolean; liked: boolean };
export const DEFAULT_PERSONAL_SELECTION: PersonalSelection = { mine: true, bookmarked: false, liked: false };
export type PersonalQuery = Bounds & MemoryFilters & PersonalSelection & {visibility?:Memory['visibility']};
export type MemoryActivity = { likes: number; views: number; liked: boolean; bookmarked: boolean };
export type PersonalSpace = {
  displayName: string;
  totals: { mine: number; bookmarked: number; liked: number };
  mapMemories: Memory[];
  hasMore: boolean;
  lists: { mine: Memory[]; bookmarked: Memory[]; liked: Memory[] };
  recommendations: Array<{ memory: Memory; reason: string }>;
};
