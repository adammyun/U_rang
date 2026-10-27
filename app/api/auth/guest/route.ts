import {z} from 'zod';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {safeReturnPath} from '@/src/features/auth/return-path';
import {startGuestSession,guestCookie} from '@/src/server/guest-sessions';
export async function POST(request:Request){
 const origin=new URL(request.url).origin;
 if(request.headers.get('origin')!==origin||request.headers.get('sec-fetch-site')==='cross-site')return Response.json({message:'이 사이트에서 다시 시작해 주세요.'},{status:403});
 try{
  const form=Object.fromEntries(await request.formData());
  const {next}=z.object({next:z.string().max(2048).optional()}).strict().parse(form);
  const destination=safeReturnPath(next),user=await getChatGPTUser();
  if(user?.provider==='chatgpt')return new Response(null,{status:303,headers:{location:destination,'cache-control':'private, no-store'}});
  const session=await startGuestSession(request.headers.get('cookie'));
  return new Response(null,{status:303,headers:{location:destination,'set-cookie':guestCookie(session.token,(Date.parse(session.expiresAt)-Date.now())/1000,request.url),'cache-control':'private, no-store'}});
 }catch{return Response.json({message:'게스트로 시작하지 못했어요. 다시 시도해 주세요.'},{status:400,headers:{'cache-control':'private, no-store'}});}
}
