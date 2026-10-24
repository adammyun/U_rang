import type { Emotion } from './model';

/** Fictitious public fixtures. Never copy real users' stories into this catalog. */
export type DemoMemoryRow = readonly [string, string, string, string, string, string | null, Emotion, 'public', boolean, 'exact', number, number];
const id = (n: number) => `20000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const note = '시연을 위해 만든 가상의 기억입니다. 실제 인물이나 사건과 관계없습니다.';
export const additionalDemoRows: DemoMemoryRow[] = [
  [id(20),'demo-user-1','강 건너로 천천히 번진 저녁','해가 낮아질 때 강변을 따라 걸었다. 다리 아래 잠깐 앉아 오늘 좋았던 일을 세 가지 적었다.\n\n'+note,'태화강 산책로','2026-10-10','peaceful','public',true,'exact',35.548,129.310],
  [id(21),'demo-user-2','바다 앞에서 약속한 다음 여행','낮의 바다와 불이 켜진 바위 길을 차례로 떠올리며 다음 여행을 상상했다.\n\n사진은 장소 참고 자료이며 기억의 날짜나 사건을 촬영한 자료가 아니다. '+note,'대왕암공원','2024-06-15','excited','public',false,'exact',35.4928,129.4394],
  [id(22),'demo-user-3','도시가 잠들기 전의 산책','걷는 속도를 늦추니 평소 지나쳤던 작은 소리들이 들렸다.\n\n'+note,'울산대공원','2020-09-24','nostalgic','public',true,'exact',35.5320,129.2939],
  [id(23),'demo-user-1','친구를 기다리던 골목','조금 일찍 도착해 골목의 간판들을 구경했다. 기다리는 시간까지 약속의 일부처럼 느껴졌다. '+note,'성남동 문화의거리','2023-12-02','love','public',false,'exact',35.5554,129.3202],
  [id(24),'demo-user-2','개강 전 마지막 오후','빈 노트 첫 장에 새 학기의 작은 목표를 적었다. 조금 두렵지만 기대되는 기분이었다. '+note,'울산대학교 주변','2026-02-27','excited','public',true,'exact',35.5441,129.2597],
  [id(25),'demo-user-3','다 말하지 못한 마음','혼자 바다를 바라보며 보내지 않을 편지를 썼다. 돌아갈 때는 마음이 조금 가벼워졌다. '+note,'일산해수욕장','2022-11-19','sad','public',true,'exact',35.4978,129.4285],
  [id(26),'demo-user-1','비가 멎기를 기다린 벤치','정류장 옆에서 비가 잦아들기를 기다렸다. 서두르지 않아도 되는 하루를 상상했다. '+note,'삼산동 일대','2025-07-06','lonely','public',false,'exact',35.5398,129.3365],
  [id(27),'demo-user-2','늘 지나던 길의 작은 발견','처음 보는 화분 하나 때문에 익숙한 골목이 다른 곳처럼 느껴졌다. '+note,'달동 주택가 골목','2021-05-08','meaningful','public',true,'exact',35.5355,129.3242],
  [id(28),'demo-user-3','강바람과 함께 돌아온 웃음','계획 없이 걷다가 친구와 오래 웃었다. 특별한 목적지가 없어도 좋은 오후였다. '+note,'태화강 동천 합류부 산책로','2024-04-20','happy','public',false,'exact',35.5570,129.3480],
  [id(29),'demo-user-1','천천히 돌아가는 길','이어폰을 빼고 걷자 바람과 발걸음 소리가 선명해졌다. '+note,'선암호수공원','2019-10-12','peaceful','public',true,'exact',35.5150,129.3288],
  [id(30),'demo-user-2','여름 끝의 파란 메모','바닷가에서 읽던 책 사이에 짧은 메모를 끼워 두었다. 다음 여름의 나에게 보내는 문장이었다. '+note,'슬도','2025-08-31','nostalgic','public',false,'exact',35.4820,129.4272],
  [id(31),'demo-user-3','정원을 다시 찾은 이유','지난번에는 서둘러 지나갔던 길을 오늘은 천천히 걸었다.\n\n'+('마음에 남는 풍경 앞에서는 잠시 멈추기로 했다. '+note+'\n\n').repeat(6),'태화강 국가정원 서쪽 산책길','2026-09-18','meaningful','public',true,'exact',35.5500,129.2800],
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
