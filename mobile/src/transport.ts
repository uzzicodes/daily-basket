export class AppError extends Error{constructor(message:string,public status=0,public code?:string){super(message);}}
export async function requestJSON<T>(origin:string,path:string,options:RequestInit={},timeoutMs=20000):Promise<T>{
 // React Native's abort-controller polyfill does not implement AbortSignal.timeout.
 const controller=new AbortController(),abort=()=>controller.abort();
 if(options.signal?.aborted)abort();else options.signal?.addEventListener('abort',abort);
 const timeout=setTimeout(abort,timeoutMs);
 try{
  const response=await fetch(origin+path,{...options,headers:{'Content-Type':'application/json','X-Askari-Client':'mobile-v1',...options.headers},signal:controller.signal});
  let data;try{data=await response.json();}catch{throw new AppError('The store response was interrupted. Retry the same order safely.',response.status);}
  if(!response.ok){const problem=data&&typeof data==='object'?data as Record<string,unknown>:{};throw new AppError(typeof problem.error==='string'?problem.error:'Something went wrong. Please try again.',response.status,typeof problem.code==='string'?problem.code:undefined);}
  return data as T;
 }catch(error){if(error instanceof AppError)throw error;throw new AppError('Connection interrupted. Check your internet connection and try again.');}
 finally{clearTimeout(timeout);options.signal?.removeEventListener('abort',abort);}
}
