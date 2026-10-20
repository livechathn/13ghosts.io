/* Public enquiries: no session, persistence or automatic retries. */
(()=>{
  'use strict';
  const API={'lempyra.com':'https://sar1a.lempyra.com','www.lempyra.com':'https://sar1a.lempyra.com','serviciosdeoca.com':'https://sar1a.serviciosdeoca.com','www.serviciosdeoca.com':'https://sar1a.serviciosdeoca.com','13ghosts.io':'https://sar1a.13ghosts.io','www.13ghosts.io':'https://sar1a.13ghosts.io'};
  const form=document.querySelector('[data-contact-form]');if(!form)return;
  const es=form.lang==='es',status=form.querySelector('[role=status]'),button=form.querySelector('button[type=submit]');let busy=false;
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!form.reportValidity())return;
    const base=Object.hasOwn(API,location.hostname)?API[location.hostname]:null;
    if(!base){status.textContent=es?'Abra el formulario desde el dominio del sitio.':'Open this form from the website domain.';return;}
    const fields=new FormData(form),payload={name:String(fields.get('name')).trim(),email:String(fields.get('email')).trim(),product:String(fields.get('product')),message:String(fields.get('message')).trim(),consent:fields.get('consent')==='on'};
    const budget=String(fields.get('budget')||'').trim();if(budget)payload.budget=budget;
    if(!payload.name||!payload.message||!payload.consent)return;
    busy=true;button.disabled=true;status.textContent=es?'Enviando…':'Sending…';
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
    try{
      const response=await fetch(base+'/contact',{method:'POST',credentials:'omit',cache:'no-store',redirect:'error',signal:controller.signal,headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)});
      if(response.status===202){status.textContent=es?'Consulta recibida. Gracias por escribirnos.':'Enquiry accepted. Thank you for reaching out.';form.reset();}
      else if(response.status===429)status.textContent=es?'Límite de envíos alcanzado. Espere antes de reintentar.':'Submission limit reached. Please wait before trying again.';
      else if(response.status===400||response.status===422)status.textContent=es?'Revise los campos; el servidor no aceptó la consulta.':'Please check the fields; the server did not accept the enquiry.';
      else status.textContent=es?'El servicio no pudo confirmar la recepción. Reintente más tarde.':'The service could not confirm receipt. Please try later.';
    }catch{status.textContent=es?'No se confirmó la recepción. Revise la conexión antes de reintentar; el envío pudo haber llegado.':'Receipt could not be confirmed. Check your connection before retrying; the submission may have arrived.';}
    finally{clearTimeout(timer);busy=false;button.disabled=false;}
  });
})();
