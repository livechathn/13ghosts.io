(()=>{
  'use strict';
  const config=window.ObservatoryConfig,api=SiteSession.client(config),form=document.getElementById('login-form');
  const user=document.getElementById('username'),password=document.getElementById('password'),otp=document.getElementById('otp');
  const submit=document.getElementById('submit'),resend=document.getElementById('resend'),back=document.getElementById('change-account'),status=document.getElementById('status');
  let stage='password',busy=false,cooldown=0;
  const next=SiteSession.safeNext(new URLSearchParams(location.search).get('next'),config.root,'observatory/');
  function lock(value){busy=value;submit.disabled=value;user.disabled=password.disabled=otp.disabled=value;back.disabled=value;resend.disabled=value||Date.now()<cooldown;}
  function showStage(value){stage=value;const code=value==='otp';document.getElementById('credentials-fields').hidden=code;document.getElementById('otp-fields').hidden=!code;resend.hidden=back.hidden=!code;submit.textContent=code?'Verificar y entrar ↗':'Enviar mi código ↗';otp.required=code;user.required=password.required=!code;(code?otp:user).focus();}
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;if(stage==='otp'&&!/^\d{6}$/.test(otp.value)){status.textContent='Ingresa los seis dígitos.';return;}
    lock(true);status.textContent='Verificando…';
    try{
      if(stage==='password'){
        const data=await api.request('/auth/login',{username:user.value.trim(),password:password.value});
        if(data.otp_sent!==true)throw Error('El gateway no confirmó el envío del código.');
        password.value='';showStage('otp');cooldown=Date.now()+30000;status.textContent='Revisa tu canal configurado. Te enviamos un código de seis dígitos.';
      }else{
        const data=await api.request('/auth/otp/verify',{username:user.value.trim(),otp:otp.value});
        if(data.ok!==true)throw Error('La verificación no fue confirmada por el gateway.');
        otp.value='';let session;
        try{session=await api.request('/entitlements');}catch(error){if(error.status===401)throw Error('El código fue aceptado, pero la sesión no llegó al gateway. Hay que revisar la cookie del dominio; solicita otro código cuando esté corregido.');throw error;}
        if(!SiteSession.allowed(session))throw Error('Tu sesión fue verificada, pero esta cuenta no tiene acceso habilitado.');
        location.replace(next);
      }
    }catch(error){status.textContent=SiteSession.message(error);}
    finally{password.value='';lock(false);}
  });
  resend.addEventListener('click',async()=>{if(busy||Date.now()<cooldown)return;lock(true);try{await api.request('/auth/otp/resend',{username:user.value.trim()});cooldown=Date.now()+30000;status.textContent='Se solicitó un nuevo código.';}catch(e){status.textContent=SiteSession.message(e);}finally{lock(false);}});
  back.addEventListener('click',()=>{if(!busy){otp.value=password.value='';showStage('password');status.textContent='';}});
  otp.addEventListener('input',()=>otp.value=otp.value.replace(/\D/g,'').slice(0,6));
  const timer=setInterval(()=>{if(!busy)resend.disabled=Date.now()<cooldown;},1000);addEventListener('pagehide',()=>{clearInterval(timer);password.value=otp.value='';});
  showStage('password');if(!config.authReady)status.textContent='Acceso en preparación: esperando confirmación de DNS, certificado y cookie.';
})();
