import { demoJournalContent } from './demo-journals';
import type { Emotion } from './model';

/** Fictitious public fixtures. Never copy real users' stories into this catalog. */
export type DemoMemoryRow = readonly [string, string, string, string, string, string | null, Emotion, 'public', boolean, 'exact', number, number];
const id = (n: number) => `20000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
export const additionalDemoRows: DemoMemoryRow[] = [
  [id(20),'demo-user-1','강 건너로 천천히 번진 저녁',demoJournalContent(id(20)),'태화강 산책로','2026-10-10','peaceful','public',true,'exact',35.548,129.310],
  [id(21),'demo-user-2','바다 앞에서 약속한 다음 여행',demoJournalContent(id(21)),'대왕암공원','2024-06-15','excited','public',false,'exact',35.4928,129.4394],
  [id(22),'demo-user-3','도시가 잠들기 전의 산책',demoJournalContent(id(22)),'울산대공원','2020-09-24','nostalgic','public',true,'exact',35.5320,129.2939],
  [id(23),'demo-user-1','친구를 기다리던 골목',demoJournalContent(id(23)),'성남동 문화의거리','2023-12-02','love','public',false,'exact',35.5554,129.3202],
  [id(24),'demo-user-2','개강 전 마지막 오후',demoJournalContent(id(24)),'울산대학교 주변','2026-02-27','excited','public',true,'exact',35.5441,129.2597],
  [id(25),'demo-user-3','다 말하지 못한 마음',demoJournalContent(id(25)),'일산해수욕장','2022-11-19','sad','public',true,'exact',35.4978,129.4285],
  [id(26),'demo-user-1','비가 멎기를 기다린 벤치',demoJournalContent(id(26)),'삼산동 일대','2025-07-06','lonely','public',false,'exact',35.5398,129.3365],
  [id(27),'demo-user-2','늘 지나던 길의 작은 발견',demoJournalContent(id(27)),'달동 주택가 골목','2021-05-08','meaningful','public',true,'exact',35.5355,129.3242],
  [id(28),'demo-user-3','강바람과 함께 돌아온 웃음',demoJournalContent(id(28)),'태화강 동천 합류부 산책로','2024-04-20','happy','public',false,'exact',35.5570,129.3480],
  [id(29),'demo-user-1','천천히 돌아가는 길',demoJournalContent(id(29)),'선암호수공원','2019-10-12','peaceful','public',true,'exact',35.5150,129.3288],
  [id(30),'demo-user-2','여름 끝의 파란 메모',demoJournalContent(id(30)),'슬도','2025-08-31','nostalgic','public',false,'exact',35.4820,129.4272],
  [id(31),'demo-user-3','정원을 다시 찾은 이유',demoJournalContent(id(31)),'태화강 국가정원 서쪽 산책길','2026-09-18','meaningful','public',true,'exact',35.5500,129.2800],
];

export const demoPhotoAssets = {
  'taehwagang.png': { author: '유랑 시안', source: '', license: '가상 시연 이미지', licenseUrl: '' },
  'daewangam-day.jpg': { author: 'Shinfull', source: 'https://commons.wikimedia.org/wiki/File:Daewangam_Park.jpg', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  'daewangam-night.jpg': { author: 'Shinfull', source: 'https://commons.wikimedia.org/wiki/File:Daewangam_Park02.jpg', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' },
} as const;
export const demoMemoryPhotos: Record<string, readonly (keyof typeof demoPhotoAssets)[]> = {
  [id(5)]: ['taehwagang.png'],
  [id(2)]: ['daewangam-day.jpg'],
  [id(20)]: ['taehwagang.png'],
  [id(21)]: ['daewangam-day.jpg','daewangam-night.jpg'],
  [id(31)]: ['taehwagang.png'],
};
export function demoMediaId(memoryId: string, index: number) {
  return `30000000-0000-4000-8000-${memoryId.slice(-9)}${String(index+1).padStart(3,'0')}`;
}
export function demoPhotoForMediaId(mediaId: string) {
  for (const [memoryId, photos] of Object.entries(demoMemoryPhotos)) {
    const index = photos.findIndex((_, index) => demoMediaId(memoryId,index) === mediaId);
    if (index >= 0) return demoPhotoAssets[photos[index]];
  }
  return null;
}
