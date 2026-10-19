/* Shared OTP client; the cookie belongs to sar1a. No bearer-token fallback. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.SiteSession=api;})(globalThis,()=>{
  'use strict';
  const API=Object.freeze({
    'lempyra.com':'https://sar1a.lempyra.com','www.lempyra.com':'https://sar1a.lempyra.com',
    'serviciosdeoca.com':'https://sar1a.serviciosdeoca.com','www.serviciosdeoca.com':'https://sar1a.serviciosdeoca.com',
    '13ghosts.io':'https://sar1a.13ghosts.io','www.13ghosts.io':'https://sar1a.13ghosts.io'
  });
  function resolve(host){if(!Object.hasOwn(API,host))throw Object.assign(Error('Abre este acceso desde el dominio del sitio. La vista local no inicia sesiones.'),{code:'unsupported_host'});return API[host];}
  function allowed(data){return data?.member===true||Array.isArray(data?.roles)&&data.roles.some(r=>r==='owner'||r==='admin'||typeof r==='string'&&r.startsWith('client:'));}
  function safeNext(value,root,fallback){try{const site=new URL(root),url=new URL(value||fallback,site);if(url.origin!==site.origin||!url.pathname.startsWith(site.pathname)||url.username||url.password||url.search||url.hash)return new URL(fallback,site).href;const relative=url.pathname.slice(site.pathname.length);if(/^(?:login|portal)(?:\/|$)/.test(relative)||relative.includes('\\'))return new URL(fallback,site).href;return url.href;}catch{return new URL(fallback,root).href;}}
  function message(error){
    if(error.code==='invalid_credentials')return 'Nombre o contraseña incorrectos.';
    if(error.code==='otp_expired')return 'El código expiró. Solicita uno nuevo.';
    if(error.code==='otp_locked'||error.status===429)return 'Demasiados intentos. Espera antes de volver a intentarlo.';
    if(error.code==='invalid_otp')return 'Código incorrecto.'+(Number.isInteger(error.detail?.attempts_remaining)?' Intentos restantes: '+error.detail.attempts_remaining+'.':'');
    if(error.status===401)return 'La sesión no está activa. Vuelve a entrar con un código nuevo.';
    if(error.status===403||error.status===402)return 'Esta cuenta no tiene acceso habilitado.';
    return error.message||'No se pudo verificar el acceso.';
  }
  function client(config,fetcher=globalThis.fetch,hostname=globalThis.location?.hostname){return {async request(path,body){
    if(!['/auth/login','/auth/otp/verify','/auth/otp/resend','/auth/logout','/entitlements'].includes(path))throw Error('Ruta no autorizada por este cliente.');
    const base=resolve(hostname);
    if(config.authReady!==true)throw Object.assign(Error('El acceso de este dominio está en preparación. Falta confirmar DNS, certificado y sesión con el gateway.'),{code:'not_ready'});
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),20000);let response;
    try{response=await fetcher(base+path,{method:body===undefined?'GET':'POST',credentials:'include',cache:'no-store',redirect:'error',signal:abort.signal,headers:{Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)})});}
    catch{throw Error('No se puede alcanzar el acceso seguro. Revisa la conexión o espera a que se complete la configuración del dominio.');}
    finally{clearTimeout(timer);}
    let data;try{data=await response.json();}catch{throw Error('El gateway no devolvió una respuesta válida.');}
    if(!response.ok){const auth=path.startsWith('/auth/'),p=auth&&typeof data?.error==='object'?data.error:{};throw Object.assign(Error('El gateway no pudo completar la solicitud.'),{status:response.status,code:p.code,detail:p.detail});}
    if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Respuesta de sesión no válida.');
    return data;
  }};}
  return {resolve,allowed,safeNext,message,client};
});
