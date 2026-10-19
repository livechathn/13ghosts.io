/* Protects the observer shell. Real telemetry is intentionally not available here. */
(()=>{
  'use strict';
  const config=window.ObservatoryConfig,api=SiteSession.client(config);
  const gate=document.getElementById('session-gate'),shell=document.getElementById('observer-shell'),status=document.getElementById('session-status');
  const login=new URL(config.login,config.root);login.searchParams.set('next','observatory/');document.getElementById('session-login').href=login.href;
  let busy=false;
  async function check(){
    if(busy)return;busy=true;shell.hidden=true;gate.hidden=false;status.textContent='Verificando tu sesión…';
    try{
      const session=await api.request('/entitlements');if(!SiteSession.allowed(session))throw Object.assign(Error('Sin acceso habilitado.'),{status:403});
      gate.hidden=true;shell.hidden=false;
      document.getElementById('session-label').textContent='SESIÓN VERIFICADA · FUENTE PRIVADA PENDIENTE';
    }catch(error){status.textContent=SiteSession.message(error);}
    finally{busy=false;}
  }
  document.getElementById('session-retry').addEventListener('click',check);
  document.getElementById('session-exit').addEventListener('click',async()=>{
    shell.hidden=true;gate.hidden=false;status.textContent='Cerrando sesión…';
    try{await api.request('/auth/logout',{});location.replace(new URL(config.login,config.root).href);}catch(e){status.textContent='No se confirmó el cierre de sesión. '+SiteSession.message(e);}
  });
  addEventListener('pageshow',check);addEventListener('pagehide',()=>{shell.hidden=true;gate.hidden=false;});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
})();
