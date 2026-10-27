import { isPagesRuntime, setPagesAuthenticated } from '@/src/lib/runtime';

export async function logout() {
  if (isPagesRuntime()) {
    setPagesAuthenticated(false);
    window.location.hash = '/';
    return null;
  }
  const response=await fetch('/api/auth/logout',{method:'POST'});
  if(!response.ok)throw new Error('로그아웃하지 못했어요.');
  const {redirectTo}=await response.json() as {redirectTo:string};
  return redirectTo;
}
