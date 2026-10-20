export type MapMode = 'calm' | 'dark' | 'detail';

export const MAP_APPEARANCES = [
  { mode: 'calm', label: '기본', description: '부드러운 회청색' },
  { mode: 'dark', label: '다크', description: '짙은 차콜' },
  { mode: 'detail', label: '자세히', description: '골목과 주변 시설' },
] as const;
