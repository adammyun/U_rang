import { AtlasHeadingLabel } from '@/components/ui/atlas-heading-label';
import { YurangMark } from '@/components/ui/yurang-mark';
import Link from '@/components/ui/app-link';
import { chatGPTSignInPath } from '@/app/chatgpt-auth';
import {safeReturnPath} from '@/src/features/auth/return-path';

export const dynamic='force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeReturnPath((await searchParams).next);
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand auth-brand" href="/"><YurangMark /><b>유랑</b></Link>

        <h1><AtlasHeadingLabel>내 기억을 이어서 기록하세요</AtlasHeadingLabel></h1>
        <p>계정 없이 먼저 둘러보고 나만의 기억을 남겨 보세요.</p>
        <form action="/api/auth/guest" method="post"><input type="hidden" name="next" value={next}/><button className="auth-submit auth-guest" type="submit">게스트로 시작</button></form>
        <p className="auth-session-note">게스트 로그인은 이 브라우저에서 7일간 유지돼요. 로그아웃·기간 만료·쿠키 삭제 후에는 게스트 기록을 다시 관리할 수 없어요. 계정으로 자동 이전되지 않습니다.</p>
        <div className="auth-divider"><span>또는 계정으로</span></div>
        <a className="auth-submit auth-account" href={chatGPTSignInPath(next)} target="_top">ChatGPT로 계속</a>
        <Link className="auth-back" href="/">지도로 돌아가기</Link>
      </section>
    </main>
  );
}
