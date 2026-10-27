import {getChatGPTUser,chatGPTSignOutPath} from '@/app/chatgpt-auth';
import {endGuestSession,guestCookie} from '@/src/server/guest-sessions';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')return Response.json({message:'허용되지 않은 요청입니다.'},{status:403});
 const user=await getChatGPTUser();
 await endGuestSession(request.headers.get('cookie'));
 return Response.json({redirectTo:user?.provider==='chatgpt'?chatGPTSignOutPath('/'):'/'},{headers:{'set-cookie':guestCookie('',0,request.url),'cache-control':'private, no-store'}});
}
