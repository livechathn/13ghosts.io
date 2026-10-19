/* 13ghosts legacy routes now verify the server cookie, never a stored JWT. */
(()=>{
  'use strict';
  const root=new URL('../../',document.currentScript.src);
  const pending=document.createElement('style');pending.textContent='body{visibility:hidden!important}';document.head.append(pending);
  function script(name){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL('assets/observatory-v03/'+name,root).href;s.onload=resolve;s.onerror=reject;document.head.append(s);});}
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
  function fail(text){ready(()=>{document.body.replaceChildren();const box=document.createElement('main');box.style.cssText='max-width:600px;margin:15vh auto;padding:25px;line-height:1.8';const p=document.createElement('p');p.textContent=text;const link=document.createElement('a');link.href=new URL('portal/',root).href;link.textContent='Volver al acceso OTP';box.append(p,link);document.body.append(box);pending.remove();});}
  Promise.all([script('session.js'),script('site-config.js')]).then(async()=>{
    const api=SiteSession.client(ObservatoryConfig);
    try{
      const data=await api.request('/entitlements');if(!SiteSession.allowed(data)){fail('Esta cuenta no tiene acceso habilitado.');return;}
      ready(()=>{
        for(const key of ['ghosts_token','ghosts_refresh','ghosts_user']){try{sessionStorage.removeItem(key);}catch{}}
        const label=document.getElementById('session-user');if(label)label.textContent='Sesión activa';
        window.endSession=async()=>{try{await api.request('/auth/logout',{});location.replace(new URL('portal/',root).href);}catch(e){fail('No se pudo confirmar el cierre de sesión. '+SiteSession.message(e));}};
        pending.remove();
      });
    }catch(e){if(e.status===401){const url=new URL('portal/',root);url.searchParams.set('next',location.pathname.slice(root.pathname.length));location.replace(url.href);}else fail(SiteSession.message(e));}
  }).catch(()=>fail('No se pudo cargar la verificación de sesión.'));
})();
