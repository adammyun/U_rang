import MemoryApp from '@/components/memory-app';
import { parseMemoryFilters, parseUserMemoryFilters } from '@/src/features/memories/filters';
import { requireChatGPTUser } from '@/app/chatgpt-auth';

export const dynamic = 'force-dynamic';

export default async function MyMapPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireChatGPTUser('/my-map');
  const query=await searchParams;
  return (
    <MemoryApp
      isAuthenticated initialPersonal
      initialFilters={parseMemoryFilters(query)}
      initialVisibility={parseUserMemoryFilters(query).visibility}
      naverMapsClientId={process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID ?? ''}
    />
  );
}
