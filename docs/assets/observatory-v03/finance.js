/* Owner-only finance shell. No private numbers or workbook are bundled in Pages. */
(()=>{
  'use strict';
  const panel=document.getElementById('finance-panel'),button=document.getElementById('finance-tab'),system=document.getElementById('system-dashboard'),overview=document.getElementById('overview-tab');
  if(!panel||!button||!system||!overview||!window.SiteSession)return;
  const status=document.getElementById('finance-status'),body=document.getElementById('finance-body'),reload=document.getElementById('finance-reload'),config=window.ObservatoryConfig;
  let owner=false,controller=null,generation=0;
  const money=value=>value===null?'Sin dato':new Intl.NumberFormat('es-HN',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
  const cell=(row,value)=>{const td=document.createElement('td');td.textContent=value;row.append(td);};
  const clear=()=>{generation++;controller?.abort();controller=null;body.replaceChildren();status.textContent='Fuente financiera privada pendiente.';};
  function select(finance){panel.hidden=!finance;system.hidden=finance;button.setAttribute('aria-selected',String(finance));overview.setAttribute('aria-selected',String(!finance));}
  function valid(data){
    if(!data||data.version!==1||data.site!==location.hostname||data.currency!=='USD'||!Array.isArray(data.products)||data.products.length>20)throw Error('Formato financiero no válido.');
    for(const item of data.products){
      if(typeof item.name!=='string'||item.name.length>100)throw Error('Producto no válido.');
      for(const field of ['setup_price','monthly_price','ai_cost','infra_cost','support_cost','setup_cost']){
        if(item[field]!==null&&(!Number.isFinite(item[field])||item[field]<0))throw Error('Valor financiero no válido.');
      }
    }
    return data;
  }
  async function load(){
    clear();const revision=generation;
    if(!owner){status.textContent='Esta pestaña requiere acceso de propietario.';return;}
    try{
      const session=await SiteSession.client(config).request('/entitlements');
      if(revision!==generation)return;
      if(!Array.isArray(session.roles)||!session.roles.includes('owner'))throw Object.assign(Error('Acceso exclusivo del propietario.'),{status:403});
      // This switch stays disabled until Lilith confirms server authorization and contract.
      if(config.financeReady!==true||config.financePath!=='/dashboard/finance')return;
      controller=new AbortController();const timer=setTimeout(()=>controller?.abort(),12000);
      let response;
      try{response=await fetch(SiteSession.resolve(location.hostname)+config.financePath,{credentials:'include',cache:'no-store',redirect:'error',signal:controller.signal,headers:{Accept:'application/json'}});}finally{clearTimeout(timer);}
      if(revision!==generation)return;
      if(!response.ok)throw Object.assign(Error(response.status===401?'La sesión expiró. Vuelve a entrar.':response.status===403?'Acceso exclusivo del propietario.':response.status===429?'Demasiadas consultas. Espera antes de actualizar.':'La fuente financiera no está disponible.'),{status:response.status});
      const data=valid(await response.json());if(revision!==generation)return;
      for(const item of data.products){
        const tr=document.createElement('tr');
        const known=['ai_cost','infra_cost','support_cost'].every(k=>item[k]!==null);
        const total=known?item.ai_cost+item.infra_cost+item.support_cost:null;
        const contribution=total!==null&&item.monthly_price!==null?item.monthly_price-total:null;
        const margin=contribution!==null&&item.monthly_price>0?contribution/item.monthly_price:null;
        [item.name,money(item.setup_price),money(item.monthly_price),money(total),money(contribution),margin===null?'Sin dato':new Intl.NumberFormat('es-HN',{style:'percent',maximumFractionDigits:1}).format(margin)].forEach(v=>cell(tr,v));body.append(tr);
      }
      const date=typeof data.sample_ts==='string'?new Date(data.sample_ts):null;
      status.textContent='Presupuestos de planificación, no resultados reales.'+(date&&!Number.isNaN(date.valueOf())?' Muestra: '+date.toLocaleString('es-HN'):' Fecha de muestra sin dato.');
    }catch(error){if(revision!==generation)return;body.replaceChildren();status.textContent=error.status?SiteSession.message(error):error.message||'No se pudo cargar la fuente privada.';}
  }
  button.addEventListener('click',()=>{select(true);load();});overview.addEventListener('click',()=>{clear();select(false);});reload.addEventListener('click',load);
  document.addEventListener('observatory-session',event=>{owner=event.detail?.verified===true&&event.detail?.owner===true;button.hidden=!owner;clear();if(!owner)select(false);});
  document.getElementById('session-exit')?.addEventListener('click',()=>{owner=false;clear();select(false);});
  addEventListener('pagehide',()=>{owner=false;clear();select(false);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
  document.querySelector('.workspace-tabs')?.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)&&!button.hidden){event.preventDefault();const next=event.key==='Home'?overview:event.key==='End'?button:document.activeElement===button?overview:button;next.focus();next.click();}});
})();
