/* Private DB-backed reader. No lesson contents or DB credentials ship with Pages. */
(()=>{
  'use strict';
  const cfg=window.AcademyConfig,sessionConfig=window.ObservatoryConfig;
  if(!cfg||!window.SiteSession)return;
  const gate=document.getElementById('academy-gate'),shell=document.getElementById('academy-shell'),status=document.getElementById('academy-status'),notice=document.getElementById('academy-notice'),list=document.getElementById('academy-list'),article=document.getElementById('academy-article'),more=document.getElementById('academy-more'),filters=document.getElementById('academy-subject');
  const session=SiteSession.client(sessionConfig),assets=new Set(),requests=new Set();let owner=false,revision=0,itemVersion=0,cursor=null,busy=false;
  const text=(value,max)=>typeof value==='string'&&value.length<=max;
  const id=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(value);
  function reset(){revision++;itemVersion++;for(const c of requests)c.abort();requests.clear();for(const u of assets)URL.revokeObjectURL(u);assets.clear();list.replaceChildren();article.replaceChildren();cursor=null;more.hidden=true;}
  function fail(error){reset();notice.textContent='';status.textContent=SiteSession.message(error);if(error.status===401||error.status===403){owner=false;shell.hidden=true;gate.hidden=false;}}
  async function get(path,binary=false){
    if(!owner||cfg.ready!==true)throw Error('La fuente privada de Academy aún no está habilitada.');
    const allowed=path.startsWith('/academy/content?')||/^\/academy\/(?:content|assets)\/[a-zA-Z0-9_-]{1,100}$/.test(path);
    if(!allowed)throw Error('Ruta de Academy no permitida.');
    const controller=new AbortController();requests.add(controller);const timer=setTimeout(()=>controller.abort(),15000);
    try{
      const response=await fetch(SiteSession.resolve(location.hostname)+path,{credentials:'include',cache:'no-store',redirect:'error',signal:controller.signal,headers:{Accept:binary?'image/png,image/jpeg,image/webp':'application/json'}});
      if(!response.ok)throw Object.assign(Error(response.status===429?'Espera antes de pedir más contenido.':'La fuente privada no pudo completar la solicitud.'),{status:response.status});
      if(binary){const blob=await response.blob();if(!['image/png','image/jpeg','image/webp'].includes(blob.type)||blob.size>8*1024*1024)throw Error('Imagen no permitida.');return blob;}
      const payload=await response.text();if(payload.length>500000)throw Error('Contenido demasiado grande.');return JSON.parse(payload);
    }finally{clearTimeout(timer);requests.delete(controller);}
  }
  function node(tag,value,cls){const n=document.createElement(tag);if(value!==undefined)n.textContent=value;if(cls)n.className=cls;return n;}
  function svgBlock(block){
    if(!['orbit','pulse','wave'].includes(block.template)||!/^#[0-9a-fA-F]{6}$/.test(block.color)||!Number.isFinite(block.duration_s)||block.duration_s<2||block.duration_s>30||!text(block.label,200))throw Error('Animación no válida.');
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 400 180');svg.setAttribute('role','img');svg.setAttribute('aria-label',block.label);svg.classList.add('lesson-svg');svg.style.setProperty('--lesson-color',block.color);svg.style.setProperty('--lesson-duration',block.duration_s+'s');
    const element=(tag,attrs)=>{const n=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));svg.append(n);return n;};
    if(block.template==='orbit'){element('ellipse',{cx:200,cy:90,rx:120,ry:45,fill:'none',stroke:block.color});const c=element('circle',{cx:200,cy:90,r:6,fill:block.color});c.classList.add('lesson-orbit');}
    if(block.template==='pulse'){const c=element('circle',{cx:200,cy:90,r:40,fill:'none',stroke:block.color});c.classList.add('lesson-pulse');}
    if(block.template==='wave'){const path=element('path',{d:'M20 90 Q65 10 110 90 T200 90 T290 90 T380 90',fill:'none',stroke:block.color,'stroke-width':2});path.classList.add('lesson-wave');}
    return svg;
  }
  function validateItem(item){
    if(!item||!id(item.id)||!text(item.title,200)||!text(item.summary??'',1000)||!Array.isArray(item.blocks)||item.blocks.length>200)throw Error('Lección no válida.');
    let size=0,imageCount=0;
    for(const b of item.blocks){
      if(!b||!['heading','text','code','image','svg_animation','source'].includes(b.type))throw Error('Tipo de bloque no admitido.');
      if(['heading','text','code'].includes(b.type)){
        if(!text(b.text,b.type==='code'?30000:b.type==='heading'?200:30000))throw Error('Bloque de texto no válido.');size+=b.text.length;
        if(b.type==='heading'&&![2,3].includes(b.level))throw Error('Nivel de título no permitido.');
        if(b.type==='code'&&!['python','javascript','cpp','sql','text'].includes(b.language))throw Error('Lenguaje no permitido.');
      }
      if(b.type==='image'){imageCount++;if(!id(b.asset_id)||!text(b.alt,500)||!text(b.caption??'',1000)||imageCount>12)throw Error('Imagen no válida o demasiadas imágenes.');}
      if(b.type==='svg_animation')svgBlock(b);
      if(b.type==='source'){
        if(!text(b.title,300)||!text(b.url,2000))throw Error('Fuente no válida.');
        const u=new URL(b.url);if(u.protocol!=='https:'||u.username||u.password)throw Error('Fuente no permitida.');
      }
    }
    if(size>200000)throw Error('La lección supera el límite de texto.');return item;
  }
  async function openItem(key){
    const current=revision,request=++itemVersion;let imageBytes=0;const stale=()=>current!==revision||request!==itemVersion;for(const u of assets)URL.revokeObjectURL(u);assets.clear();article.replaceChildren();notice.textContent='Leyendo…';
    try{
      const data=await get('/academy/content/'+encodeURIComponent(key));if(stale())return;
      if(data.version!==1)throw Error('Versión de Academy no admitida.');const item=validateItem(data.item);
      const fragment=document.createDocumentFragment();fragment.append(node('h1',item.title));if(item.summary)fragment.append(node('p',item.summary,'lesson-summary'));
      const images=[];
      for(const b of item.blocks){
        if(b.type==='heading')fragment.append(node('h'+b.level,b.text));
        if(b.type==='text')fragment.append(node('p',b.text,'lesson-text'));
        if(b.type==='code'){const pre=node('pre'),code=node('code',b.text);code.dataset.language=b.language;pre.append(code);fragment.append(pre);}
        if(b.type==='svg_animation')fragment.append(svgBlock(b));
        if(b.type==='source'){const a=node('a',b.title);a.href=b.url;a.target='_blank';a.rel='noopener noreferrer';fragment.append(a);}
        if(b.type==='image'){
          const figure=node('figure'),img=node('img');img.alt=b.alt;figure.append(img);if(b.caption)figure.append(node('figcaption',b.caption));fragment.append(figure);images.push([b.asset_id,img]);
        }
      }
      article.replaceChildren(fragment);notice.textContent='';article.focus();
      // Fetch serially to bound request/memory usage. Never load arbitrary source URLs.
      for(const [asset,img] of images){if(stale())return;try{const blob=await get('/academy/assets/'+encodeURIComponent(asset),true);if(stale())return;imageBytes+=blob.size;if(imageBytes>24*1024*1024)throw Error('Límite de imágenes por lección.');const url=URL.createObjectURL(blob);assets.add(url);img.src=url;}catch(e){if(e.status===401||e.status===403)throw e;if(!stale())img.replaceWith(node('p','Imagen no disponible.'));}}
    }catch(error){if(stale())return;article.replaceChildren();fail(error);}
  }
  async function loadList(append=false){
    if(busy)return;busy=true;more.disabled=true;const current=revision;
    try{
      if(cfg.ready!==true){notice.textContent='La biblioteca privada se conectará cuando el backend y las tablas estén listos. No hay lecciones incrustadas en esta página.';return;}
      const q=new URLSearchParams({limit:'20'});if(filters.value)q.set('subject',filters.value);if(append&&cursor)q.set('cursor',cursor);
      const data=await get('/academy/content?'+q.toString());if(current!==revision)return;
      if(data.version!==1||!Array.isArray(data.items)||data.items.length>50||!(data.next_cursor===null||text(data.next_cursor,500)))throw Error('Índice no válido.');
      if(!append)list.replaceChildren();
      for(const item of data.items){
        if(!id(item.id)||!text(item.title,200)||!text(item.summary??'',1000))throw Error('Entrada de índice no válida.');
        const button=node('button',undefined,'lesson-entry');button.type='button';button.append(node('strong',item.title),node('span',item.summary??''));button.addEventListener('click',()=>openItem(item.id));list.append(button);
      }
      cursor=data.next_cursor;more.hidden=!cursor;notice.textContent=list.childElementCount?'':'No hay contenido publicado en esta categoría.';
    }catch(error){if(current===revision)fail(error);}finally{busy=false;more.disabled=false;}
  }
  async function check(){
    reset();owner=false;shell.hidden=true;gate.hidden=false;status.textContent='Verificando tu sesión…';const current=revision;
    try{const data=await session.request('/entitlements');if(current!==revision)return;if(!Array.isArray(data.roles)||!data.roles.includes('owner'))throw Object.assign(Error('Acceso personal del propietario.'),{status:403});owner=true;gate.hidden=true;shell.hidden=false;await loadList();}catch(error){if(current===revision)fail(error);}
  }
  const login=new URL('portal/',cfg.root);login.searchParams.set('next','academy/');document.getElementById('academy-login').href=login.href;
  const subject=new URLSearchParams(location.search).get('subject');if(['math','code','music','cyber'].includes(subject))filters.value=subject;
  document.getElementById('academy-retry').addEventListener('click',check);more.addEventListener('click',()=>loadList(true));filters.addEventListener('change',()=>{reset();loadList();});
  document.getElementById('academy-logout').addEventListener('click',async()=>{owner=false;reset();shell.hidden=true;gate.hidden=false;try{await session.request('/auth/logout',{});location.replace(new URL('portal/',cfg.root).href);}catch(e){status.textContent=SiteSession.message(e);}});
  addEventListener('pageshow',check);addEventListener('pagehide',()=>{owner=false;reset();shell.hidden=true;gate.hidden=false;});document.addEventListener('visibilitychange',()=>{if(document.hidden){owner=false;reset();shell.hidden=true;gate.hidden=false;}else check();});
})();
