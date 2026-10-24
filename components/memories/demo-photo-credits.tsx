import { demoPhotoForMediaId } from '@/src/features/memories/demo-catalog';
import type { MemoryMedia } from '@/lib/types';

export function DemoPhotoCredits({ media }: { media: MemoryMedia[] }) {
  const credits = [...new Set(media.map(item => demoPhotoForMediaId(item.id)).filter((item): item is NonNullable<typeof item> => item !== null && Boolean(item.source)))];
  if (!credits.length) return null;
  return <aside className="dev-photo-credits" aria-label="사진 출처">
    {credits.map(credit => <p key={credit.source || credit.author}>
      {credit.source ? <a href={credit.source} target="_blank" rel="noreferrer">사진: {credit.author} · Wikimedia Commons</a> : credit.author}
      {' · '}{credit.licenseUrl ? <a href={credit.licenseUrl} target="_blank" rel="noreferrer">{credit.license}</a> : credit.license}
      {credit.source && ' · 원본 사용, 화면에서 크기·잘림 조정'}
    </p>)}
  </aside>;
}
