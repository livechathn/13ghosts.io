/* Owner-only server data. No financial fixtures are shipped to Pages. */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id),panel=$('finance-panel'),button=$('finance-tab'),system=$('system-dashboard'),overview=$('overview-tab');
  if(!panel||!button||!system||!overview||!window.SiteSession)return;
  const status=$('finance-status'),body=$('finance-body'),reload=$('finance-reload'),config=window.ObservatoryConfig;
  let owner=false,controller=null,generation=0;
  const money=v=>v===null?'Sin dato':new Intl.NumberFormat('es-HN',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(v);
  const node=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
  const clear=()=>{generation++;controller?.abort();controller=null;body.replaceChildren();reload.disabled=false;status.textContent='Datos privados disponibles al consultar la fuente.';};
  function select(finance){panel.hidden=!finance;system.hidden=finance;button.setAttribute('aria-selected',String(finance));overview.setAttribute('aria-selected',String(!finance));}
  function valid(data){
    const expected=config.world==='maniac'?['maniac','friday','ouija']:[config.world];
    const number=(v,signed=false)=>v===null||typeof v==='number'&&Number.isFinite(v)&&(signed||v>=0);
    const text=v=>typeof v==='string'&&v.length<=2000;
    if(data?.version!==1||data.currency!=='USD'||!text(data.as_of)||!text(data.basis_note)||!Array.isArray(data.businesses)||data.businesses.length!==expected.length)throw Error('Formato financiero no válido.');
    const seen=new Set();
    for(const b of data.businesses){
      if(!expected.includes(b.site)||seen.has(b.site)||!text(b.label)||!Array.isArray(b.budget?.items)||b.budget.items.length>20||!b.actual)throw Error('Ámbito financiero no válido.');
      seen.add(b.site);const keys=new Set();
      for(const i of b.budget.items){
        if(!text(i.key)||keys.has(i.key)||!text(i.label)||!text(i.basis)||!i.cost_monthly)throw Error('Producto financiero no válido.');keys.add(i.key);
        if(![i.setup_from,i.monthly_from,...['ia','infra','support','total'].map(k=>i.cost_monthly[k])].every(v=>number(v))||![i.contribution_monthly,i.contribution_pct].every(v=>number(v,true)))throw Error('Valor financiero no válido.');
      }
      if(!number(b.actual.revenue,true)||!number(b.actual.costs)||!(b.actual.period===null||text(b.actual.period)))throw Error('Resultados reales no válidos.');
    }
    return data;
  }
  function render(data){
    const fragment=document.createDocumentFragment();
    for(const b of data.businesses){
      const section=document.createElement('section');section.className='finance-business';section.append(node('h2',b.label),node('h3','Presupuesto · no resultados reales'));
      const scroll=document.createElement('div');scroll.className='finance-table-scroll';const table=document.createElement('table'),head=document.createElement('thead'),tr=document.createElement('tr');
      ['Producto','Inicial desde','Mensual desde','IA / mes','Infra / mes','Soporte / mes','Coste total / mes','Contribución / mes','Contribución %'].forEach(x=>{const th=node('th',x);th.scope='col';tr.append(th);});head.append(tr);table.append(head);const rows=document.createElement('tbody');
      for(const i of b.budget.items){const row=document.createElement('tr');[i.label,money(i.setup_from),money(i.monthly_from),...['ia','infra','support','total'].map(k=>money(i.cost_monthly[k])),money(i.contribution_monthly),i.contribution_pct===null?'Sin dato':i.contribution_pct.toLocaleString('es-HN',{maximumFractionDigits:1})+'%'].forEach(v=>row.append(node('td',v)));row.title=i.basis;rows.append(row);}
      table.append(rows);scroll.append(table);section.append(scroll,node('h3','Resultados reales'),node('p','Período: '+(b.actual.period??'Sin dato')+' · Ingresos: '+money(b.actual.revenue)+' · Costes: '+money(b.actual.costs)));fragment.append(section);
    }
    body.replaceChildren(fragment);status.textContent='Muestra: '+data.as_of+' · '+data.basis_note;
  }
  async function load(){
    clear();const revision=generation;if(!owner)return;reload.disabled=true;
    try{
      const session=await SiteSession.client(config).request('/entitlements');if(revision!==generation)return;
      if(!Array.isArray(session.roles)||!session.roles.includes('owner'))throw Object.assign(Error('Acceso exclusivo del propietario.'),{status:403});
      if(config.financeReady!==true||config.financePath!=='/dashboard/finance')throw Error('Fuente financiera pendiente.');
      status.textContent='Consultando fuente privada…';controller=new AbortController();const active=controller,timer=setTimeout(()=>active.abort(),12000);
      try{
        const response=await fetch(SiteSession.resolve(location.hostname)+config.financePath,{credentials:'include',cache:'no-store',redirect:'error',signal:active.signal,headers:{Accept:'application/json'}});
        if(revision!==generation)return;
        if(!response.ok)throw Object.assign(Error(response.status===429?'Demasiadas consultas. Espera antes de actualizar.':'Fuente financiera no disponible.'),{status:response.status});
        const data=valid(await response.json());if(revision!==generation)return;render(data);
      }finally{clearTimeout(timer);}
    }catch(error){if(revision!==generation)return;body.replaceChildren();status.textContent=error.status===401||error.status===403?SiteSession.message(error):error.name==='AbortError'?'La consulta agotó el tiempo. Reintenta manualmente.':error.message||'No se pudo cargar la fuente privada.';}
    finally{if(revision===generation)reload.disabled=false;}
  }
  button.addEventListener('click',()=>{select(true);load();});overview.addEventListener('click',()=>{clear();select(false);});reload.addEventListener('click',load);
  document.addEventListener('observatory-session',event=>{owner=event.detail?.verified===true&&event.detail?.owner===true;button.hidden=!owner;clear();if(!owner)select(false);});
  $('session-exit')?.addEventListener('click',()=>{owner=false;clear();select(false);});
  addEventListener('pagehide',()=>{owner=false;clear();select(false);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
  document.querySelector('.workspace-tabs')?.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)&&!button.hidden){event.preventDefault();const next=event.key==='Home'?overview:event.key==='End'?button:document.activeElement===button?overview:button;next.focus();next.click();}});
})();
