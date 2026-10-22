import MemoryApp from '@/components/memory-app';
import { parseMemoryFilters } from '@/src/features/memories/filters';
import { getChatGPTUser } from './chatgpt-auth';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const parameters = await searchParams;
  return (
    <MemoryApp
      initialExplore={parameters.explore === '1'}
      isAuthenticated={Boolean(await getChatGPTUser())}
      initialFilters={parseMemoryFilters(parameters)}
      naverMapsClientId={process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID ?? ''}
    />
  );
}
