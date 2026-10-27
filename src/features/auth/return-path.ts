export function safeReturnPath(value:unknown):string {
 if(typeof value!=='string'||value.length>2048||!value.startsWith('/')||value.startsWith('//')||/[\\\u0000-\u001f]/.test(value))return '/';
 try{
  const url=new URL(value,'https://app.local');
  if(url.origin!=='https://app.local'||['/signin-with-chatgpt','/signout-with-chatgpt','/callback','/login','/signup'].includes(url.pathname)||url.pathname.startsWith('/api/auth/'))return '/';
  return `${url.pathname}${url.search}${url.hash}`;
 }catch{return '/';}
}
