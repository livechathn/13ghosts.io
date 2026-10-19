/* Local visual study. No networking, service discovery, credentials or telemetry.
 * ASCII anatomy evolves Alean/ARIA presence.js and Medusa's 13ghosts capsid.js.
 * All measurements below are invented fixtures, never captured infrastructure data.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const worlds = {
    maniac: {brand:'LEMPYRΛ',name:'MANIAC',site:'lempyra.com',id:'M / 01 · INFRASTRUCTURE OBSERVATORY',chapter:'YOUR SYSTEMS, IN ORBIT.',title:'Todo tiene<br>una órbita.',copy:'Seis ciudades. Una presencia.<br>Tu mundo, al alcance de la mano.',signature:'LEMPYRΛ / RESEARCH & DEVELOPMENT',coordinate:'λ / EVENT HORIZON',colors:['#a8dfae','#e0eadb','#b395d6','#d5b77e'],nodes:[[35,20],[65,20],[27,46],[73,46],[35,75],[65,75]]},
    friday: {brand:'SERVICIOS DE OCA',name:'FRIDAY',site:'serviciosdeoca.com',id:'F / 02 · PERSONAL INTELLIGENCE',chapter:'TE ESTABA ESPERANDO.',title:'Ya me<br>encargo.',copy:'Tu casa. Tu trabajo. Tu universo.<br>Todo tiene un lugar conmigo.',signature:'FRIDAY / SERVICIOS DE OCA',coordinate:'Æ / LIVING LANGUAGE',colors:['#b7194c','#df2755','#703784','#a85c9e'],nodes:[[17,23],[51,22],[10,48],[61,42],[18,74],[49,75]]},
    ouija: {brand:'13GHOSTS',name:'OUIJA',site:'13ghosts.io',id:'O / 03 · DAEMONIC OBSERVATORY',chapter:'THE SYSTEM HAS A PRESENCE.',title:'Hay algo<br>ahí dentro.',copy:'Cada señal tiene un origen.<br>Cada silencio, un significado.',signature:'OUIJA / THE HOUSE OF 13GHOSTS',coordinate:'XIII / DAEMONIC POSSESSION',colors:['#ed4035','#b73528','#d79a59','#f4dfc0'],nodes:[[50,18],[73,38],[64,73],[36,73],[27,38],[50,84]]}
  };
  const cities = [
    {name:'TOKIO',role:'COMPUTE',cpu:28,ram:41,disk:32,ms:84,state:'OK'},
    {name:'PARÍS',role:'SECURITY',cpu:12,ram:38,disk:27,ms:96,state:'OK'},
    {name:'SÃO PAULO',role:'APPS',cpu:36,ram:62,disk:45,ms:112,state:'OK'},
    {name:'SANTIAGO',role:'STORAGE',cpu:19,ram:44,disk:72,ms:310,state:'LENTO'},
    {name:'ASHBURN',role:'GATEWAY',cpu:24,ram:51,disk:31,ms:64,state:'OK'},
    {name:'MARSELLA',role:'ORCHESTRATION',cpu:41,ram:67,disk:43,ms:78,state:'OK'}
  ];
  const services = [{name:'Biblioteca',ms:84,state:'OK'}, {name:'Orquestador',ms:120,state:'OK'}, {name:'Memoria',ms:72,state:'OK'}, {name:'Media',ms:96,state:'OK'}, {name:'Docs',ms:680,state:'LENTO'}];
  const dbs = [
    ['LITERIS','Biblioteca',12.8,88,'#55bed7'],['LOVE','Personas',3.2,64,'#b395e8'],['STAFF','Staff',.9,42,'#63bdab'],['NUMERIS','Biblioteca',5.6,71,'#55bed7'],
    ['TRANSACTIONS','Operaciones',2.4,58,'#9cabbc'],['LEYES','Legal',4.1,62,'#dc79a8'],['MEDUSA','Operaciones',1.8,47,'#9cabbc'],['SARIAHN','Personas',.8,30,'#b395e8'],
    ['DEARMAS','Biblioteca',6.4,76,'#55bed7'],['SERVERS','Operaciones',1.3,39,'#9cabbc'],['REYES','Legal',2.8,53,'#dc79a8'],['JETZABEL','Personas',1.1,36,'#b395e8'],
    ['DAETH','Operaciones',.6,28,'#9cabbc'],['LINDER','Legal',1.7,44,'#dc79a8'],['SEPHIROTH','Operaciones',.4,24,'#9cabbc'],['LUNA','Personas',null,null,'#b395e8']
  ];
  const machines = [
    {name:'MANIAC',cpu:32,ram:64,gpu:38,vram:'8.2 / 16 GB',temp:'51 °C',power:'124 W'},
    {name:'ELEVEN',cpu:18,ram:42,gpu:24,vram:'4.6 / 12 GB',temp:'46 °C',power:'68 W'},
    {name:'NAGINI',cpu:12,ram:31,gpu:null,vram:'sin dato',temp:'sin dato',power:'sin dato'}
  ];
  const privateMode=document.body.dataset.mode==='private';
  let world='maniac',view='cloud',paused=false,working=false,answerTimer=0,lastFocus=null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const portal=$('detail-portal');
  const metrics=(items)=>'<div class="portal-metrics">'+items.map(([value,label])=>`<div><strong>${value}</strong><span>${label}</span></div>`).join('')+'</div>';
  const rows=(items)=>items.map(([label,value])=>`<div class="portal-row"><span>${label}</span><span>${value}</span></div>`).join('');
  function openPortal(kicker,title,content){
    lastFocus=document.activeElement;portal.hidden=false;document.body.classList.add('portal-open');
    $('portal-kicker').textContent=kicker;$('portal-title').textContent=title;$('portal-content').innerHTML=content;
    $('entity-state').textContent='SEÑAL ABIERTA';$('close-portal').focus();draw(elapsed);
  }
  function closePortal(){
    portal.hidden=true;document.body.classList.remove('portal-open');$('entity-state').textContent='PRESENCIA ESTABLE';
    if(lastFocus?.isConnected)lastFocus.focus();draw(elapsed);
  }
  function renderCities(){
    if(privateMode){$('cloud-nodes').replaceChildren();return;}
    const mobile=innerWidth<=850;
    const smallPositions=world==='ouija'?[[50,26],[83,40],[72,66],[28,66],[17,40],[50,74]]:[[22,29],[78,29],[13,47],[87,47],[23,66],[77,66]];
    $('cloud-nodes').innerHTML=cities.map((city,i)=>{const p=mobile?smallPositions[i]:worlds[world].nodes[i];return `<button class="city-node ${city.state==='LENTO'?'slow':''}" data-city="${i}" style="--x:${p[0]}%;--y:${p[1]}%" aria-label="Explorar ${city.name}, ${city.state}, datos de muestra"><span class="node-orbit"><span class="node-core"></span></span><span><strong>${city.name}</strong><small>${city.role} / ${city.ms} ms</small></span></button>`;}).join('');
    $('cloud-nodes').querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
      const city=cities[Number(button.dataset.city)];
      openPortal('NUBE / '+city.role,city.name,metrics([[city.cpu+'%','CPU'],[city.ram+'%','RAM'],[city.disk+'%','DISCO']])+rows([['Estado',city.state],['Latencia',city.ms+' ms'],['Origen','Fixture de diseño'],['Muestra','Ilustrativa · edad no aplica']])+'<p class="portal-caption">El nodo se abrirá con el detalle autorizado de esa región. Este prototipo no consulta ninguna caja.</p>');
    }));
  }
  function renderServices(){
    $('service-list').innerHTML=services.map((s,i)=>`<button class="signal ${s.state==='LENTO'?'slow':''}" data-service="${i}"><span><b class="signal-symbol">${s.state==='LENTO'?'◌':'·'}</b>${s.name}</span><span>${s.ms} ms</span></button>`).join('');
    $('service-list').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
      const s=services[Number(b.dataset.service)];openPortal('SERVICIO / MUESTRA',s.name,metrics([[s.ms+'','LATENCIA / ms'],[s.state,'ESTADO']])+rows([['Última muestra','Demo fija'],['Permiso','Sólo lectura'],['Endpoint real','Sin conectar']]));
    }));
  }
  function renderBases(){
    $('database-orbits').innerHTML=dbs.map(([name,family,gb,load,color],i)=>`<button class="db-orbit" data-db="${i}" style="--db:${color};--dash:${load===null?0:load*2.52}" aria-label="${name}, ${gb===null?'sin dato':gb+' GB de muestra'}"><span class="db-dial"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="track" cx="50" cy="50" r="40"/><circle class="arc" cx="50" cy="50" r="40"/><circle class="inner" cx="50" cy="50" r="32"/><circle class="db-satellite" cx="50" cy="10" r="2" fill="currentColor"/></svg><strong>${gb===null?'—':gb}<small>${gb===null?'SIN DATO':'GB / DEMO'}</small></strong></span><span class="db-name">${name}</span><span class="db-health">${gb===null?'SIN ACCESO':i===5?'MUESTRA ANTIGUA':'DISPONIBLE'}</span></button>`).join('');
    $('database-orbits').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
      const [name,family,gb,load]=dbs[Number(b.dataset.db)];
      openPortal('MEMORIA / '+family.toUpperCase(),name,metrics([[gb===null?'—':gb+'','GB USADOS'],[gb===null?'—':String(20+Math.round(load*1.3)),'TABLAS / DEMO']])+rows([['Estado',gb===null?'Sin acceso':'Disponible · ejemplo'],['Espacio asignado','Sin dato'],['Última escritura','Sin dato'],['Edad de muestra',Number(b.dataset.db)===5?'Ejemplo STALE':'No aplica · ficticia']])+'<p class="portal-caption">La órbita representa tamaño relativo, no porcentaje de capacidad. El movimiento es presencia visual; no indica escrituras reales.</p>');
    }));
  }
  function glyphField(seed){return '<div class="glyph-field" aria-hidden="true">'+Array.from({length:72},(_,i)=>`<span style="--delay:${-(i%11)*.23}s;--opacity:${.18+((i*7+seed)%9)/12}">${'01λ{}<>∆/'.charAt((i*7+seed)%9)}</span>`).join('')+'</div>';}
  function renderMachines(){
    $('machine-view').innerHTML='<div class="view-heading"><div><span class="eyebrow">CASA / EL CUERPO DEL SISTEMA</span><h2>La energía tiene un hogar.</h2></div><span class="view-note">TRES NODOS · DATOS FICTICIOS<br>TOCA UN NÚCLEO PARA ENFOCAR</span></div><div class="machines">'+machines.map((m,i)=>`<article class="machine"><div class="machine-top">${m.name}<span>● DISPONIBLE · DEMO</span></div><div class="machine-orbit"><button class="machine-dial" data-machine="${i}" style="--cpu:${m.cpu*3.14};--ram:${m.ram*2.64}" aria-label="Ver ${m.name}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="track" cx="60" cy="60" r="50"/><circle class="cpu" cx="60" cy="60" r="50"/><circle class="track" cx="60" cy="60" r="42"/><circle class="ram" cx="60" cy="60" r="42"/></svg><strong>${m.gpu===null?'—':m.gpu+'%'}<small>GPU</small></strong></button><div class="machine-key">CPU <b>${m.cpu}%</b><br>RAM <b>${m.ram}%</b><br>${m.temp}</div></div><div class="machine-stats"><span>VRAM</span><span>${m.vram}</span></div><div class="machine-stats"><span>POTENCIA</span><span>${m.power}</span></div>${glyphField(i*3)}<span class="machine-foot">Campo animado / ilustrativo</span></article>`).join('')+'</div><div class="business-line"><span><strong>48,200</strong>DIRECTORIO / DEMO</span><span><strong>62,400</strong>LIBROS / DEMO</span><span><strong>05</strong>ENTIDADES / DEMO</span><span><strong>03</strong>CLIENTES / DEMO</span></div>';
    $('machine-view').querySelectorAll('[data-machine]').forEach(b=>b.addEventListener('click',()=>{
      const m=machines[Number(b.dataset.machine)];openPortal('CASA / RECURSOS',m.name,metrics([[m.cpu+'%','CPU'],[m.ram+'%','RAM'],[m.gpu===null?'—':m.gpu+'%','GPU']])+rows([['VRAM',m.vram],['Temperatura',m.temp],['Potencia',m.power],['Estado','Disponible · simulación']])+'<p class="portal-caption">En el sistema conectado, un equipo sin respuesta pasaría a mantenimiento/offline. No se conservarían cifras viejas como si fueran actuales.</p>');
    }));
  }
  function switchView(next){
    closePortal();view=next;document.body.dataset.view=next;
    document.querySelectorAll('[data-view]').forEach(b=>{if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(b.dataset.view===next));});
    $('machine-view').hidden=next!=='home';$('database-view').hidden=next!=='databases';
    $('announcement').textContent='Vista '+({cloud:'nube',home:'casa',databases:'bases'}[next]);draw(elapsed);
  }
  function switchWorld(next){
    if(window.ObservatoryConfig?.world)next=window.ObservatoryConfig.world;
    if(!worlds[next])return;cancelReply();world=next;const w=worlds[next];document.body.dataset.world=next;
    $('wordmark').textContent=w.brand;$('system-id').textContent=w.id;$('chapter').textContent=w.chapter;$('scene-title').innerHTML=w.title;$('scene-copy').innerHTML=w.copy;
    $('chamber-signature').textContent=w.signature;$('site-name').textContent=w.site;$('entity-coordinate').textContent=w.coordinate;document.title=w.name+' — The living system';
    document.querySelectorAll('button[data-world]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.world===next)));
    if(privateMode){$('scene-copy').textContent='Tu presencia está aquí. La fuente privada está por conectar.';$('entity-state').textContent='PRESENCIA LOCAL · SIN TELEMETRÍA';}
    renderCities();buildAtlas();switchView('cloud');resize();
    try{history.replaceState(null,'','#'+next);}catch{}
  }
  function cancelReply(){clearTimeout(answerTimer);working=false;$('command-form').querySelector('button').disabled=false;$('command-input').disabled=false;}
  function answer(){
    if(privateMode)return;
    const q=$('command-input').value.trim();if(working)return;
    const query=q.toLowerCase();closePortal();working=true;$('entity-state').textContent='INTERPRETANDO LA SEÑAL';$('command-form').querySelector('button').disabled=true;$('command-input').disabled=true;
    answerTimer=setTimeout(()=>{
      cancelReply();$('command-input').value='';
      if(/base|memoria|libr|dato/.test(query)){
        switchView('databases');openPortal('RESPUESTA DEMO / '+worlds[world].name,'La memoria está aquí.','<p class="portal-paragraph">Dieciséis órbitas, cada una con su identidad. <strong>Toca una base</strong> para ver su tamaño, estado y última muestra.</p><p class="portal-caption">Respuesta predefinida de demostración. Ningún LLM está conectado.</p>');
      }else if(/gpu|casa|eleven|ram|cpu/.test(query)){
        switchView('home');openPortal('RESPUESTA DEMO / '+worlds[world].name,'Esto sostiene tu mundo.','<p class="portal-paragraph">MANIAC, ELEVEN y NAGINI. Los anillos muestran sus recursos; los símbolos mantienen su presencia. <strong>Acércate a un núcleo.</strong></p><p class="portal-caption">Valores ficticios. Respuesta predefinida, no inferencia.</p>');
      }else{
        openPortal('RESPUESTA DEMO / '+worlds[world].name,world==='friday'?'Estoy pendiente.':world==='ouija'?'La señal llegó.':'Tu mundo responde.','<p class="portal-paragraph">En esta muestra, <strong>ocho servicios están disponibles</strong> y Docs necesita atención. Puedes explorar cada ciudad, revisar la casa o entrar a las dieciséis bases.</p><p class="portal-caption">Prueba «muéstrame las bases» o «cómo está Eleven». Esta respuesta es una demostración escrita, sin modelo conectado.</p>');
      }
    },reduced.matches?150:1050);
  }

  // The entity is made of glyphs rasterized once. A single canvas composes depth,
  // field lines, satellites and three distinct anatomies without external assets.
  const canvas=$('universe'),ctx=canvas.getContext('2d');
  let width=1,height=1,dpr=1,elapsed=0,previous=0,raf=0,lastPaint=0;
  let mouseX=0,mouseY=0,driftX=0,driftY=0;
  const atlas=document.createElement('canvas'),ink=atlas.getContext('2d'),alphabet='01λÆ{}<>/+=:.*∆Ξ';
  const cell=36,columns=16;atlas.width=columns*cell;atlas.height=Math.ceil(alphabet.length*4/columns)*cell;
  function buildAtlas(){
    ink.clearRect(0,0,atlas.width,atlas.height);ink.font='500 24px PresenceMono,monospace';ink.textAlign='center';ink.textBaseline='middle';
    worlds[world].colors.forEach((color,c)=>{ink.fillStyle=color;for(let g=0;g<alphabet.length;g++){const i=c*alphabet.length+g;ink.fillText(alphabet[g],(i%columns+.5)*cell,(Math.floor(i/columns)+.5)*cell);}});
  }
  let seed=7631;const rand=()=>((seed=seed*16807%2147483647)-1)/2147483646;
  const motes=Array.from({length:160},()=>({x:rand(),y:rand(),phase:rand()*6.28,depth:rand()}));
  const shell=[];for(let row=0;row<29;row++)for(let col=0;col<52;col++)shell.push({theta:(col+(row%2)*.5)/52*Math.PI*2,phi:(row+.5)/29*Math.PI,glyph:(row*7+col*3)%alphabet.length,phase:row*.38+col*.29,color:(row+col)%11<7?0:1+(row+col)%3});
  const streams=Array.from({length:600},()=>({angle:rand()*Math.PI*2,r:rand(),phase:rand()*6.28,glyph:Math.floor(rand()*alphabet.length),color:rand()<.6?0:1+Math.floor(rand()*3)}));
  const golden=(1+Math.sqrt(5))/2;
  const vertices=[[-1,golden,0],[1,golden,0],[-1,-golden,0],[1,-golden,0],[0,-1,golden],[0,1,golden],[0,-1,-golden],[0,1,-golden],[golden,0,-1],[golden,0,1],[-golden,0,-1],[-golden,0,1]];
  const faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  const normalize=v=>{const n=Math.hypot(...v);return v.map(c=>c/n);};vertices.forEach((v,i)=>vertices[i]=normalize(v));
  const capsid=[],edges=[],pointMap=new Map(),edgeMap=new Set();
  const addPoint=v=>{const p=normalize(v),k=p.map(n=>n.toFixed(4)).join(',');if(pointMap.has(k))return pointMap.get(k);const i=capsid.length;capsid.push(p);pointMap.set(k,i);return i;};
  const addEdge=(a,b)=>{const key=a<b?a+','+b:b+','+a;if(!edgeMap.has(key)){edgeMap.add(key);edges.push([a,b]);}};
  faces.forEach(f=>{const grid=[],N=6;for(let i=0;i<=N;i++){grid[i]=[];for(let j=0;j<=N-i;j++)grid[i][j]=addPoint([0,1,2].map(k=>(vertices[f[0]][k]*i+vertices[f[1]][k]*j+vertices[f[2]][k]*(N-i-j))/N));}
    for(let i=0;i<=N;i++)for(let j=0;j<=N-i;j++){if(i<N&&grid[i+1][j]!==undefined)addEdge(grid[i][j],grid[i+1][j]);if(j<N-i)addEdge(grid[i][j],grid[i][j+1]);if(i>0)addEdge(grid[i][j],grid[i-1][j+1]);}
  });
  const projected=capsid.map(()=>({x:0,y:0,z:0}));
  function glyph(g,c,x,y,size,alpha){if(alpha<.015)return;const i=c*alphabet.length+((g%alphabet.length)+alphabet.length)%alphabet.length;ctx.globalAlpha=alpha;ctx.drawImage(atlas,i%columns*cell,Math.floor(i/columns)*cell,cell,cell,x-size/2,y-size/2,size,size);}
  function line(points,color,alpha=.15,lineWidth=.65){ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}
  function ellipse(x,y,rx,ry,rotation,color,alpha=.15,dashed=false){ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=.6;ctx.setLineDash(dashed?[2,7]:[]);ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
  function drawBlackSun(t,cx,cy,r,fade){
    const colors=worlds[world].colors,breathe=1+.027*Math.sin(t*.65);r*=breathe;
    // A wrapped lattice retains Alean's skin. The quiet core is a real void.
    for(const p of shell){const a=p.theta-t*.105;const warp=.045*Math.sin(p.phi*6+a*2+t*.5);const rad=r*(.79+warp);
      const x=Math.cos(a)*Math.sin(p.phi)*rad,z=Math.sin(a)*Math.sin(p.phi),y=Math.cos(p.phi)*rad*.93;
      const depth=(z+1)/2,dist=Math.hypot(x,y)/r;if(dist<.36)continue;
      const stream=.5+.5*Math.cos(a-p.phi*2.4+t*.4);const alpha=(.05+depth*.67)*(.3+.7*Math.pow(stream,3))*fade;
      glyph(p.glyph+Math.floor(t*.2+p.phase),p.color,cx+x,cy+y,r*(.042+.022*depth),alpha);
    }
    // Accretion disc: dense orbital type, counter-rotating around the void.
    for(const p of streams){const flow=(p.r+t*.025)%1,a=p.angle-t*(.1+.08*(1-flow)),rad=r*(.4+flow*.91);
      const x=Math.cos(a)*rad,y=Math.sin(a)*rad*.3-x*.15;
      const envelope=Math.min(1,flow*7,(1-flow)*6),front=(Math.sin(a)+1)/2;
      glyph(p.glyph+Math.floor(t*.22),p.color,cx+x,cy+y,r*(.035+.02*front),envelope*(.2+.6*front)*fade);
    }
    ellipse(cx,cy,r*1.08,r*.34,-.16,colors[0],.19*fade);ellipse(cx,cy,r*1.28,r*.4,-.16,colors[2],.12*fade,true);
    const grad=ctx.createRadialGradient(cx,cy,r*.15,cx,cy,r*.47);grad.addColorStop(0,'#000');grad.addColorStop(.73,'#000');grad.addColorStop(1,'#0000');ctx.globalAlpha=fade;ctx.fillStyle=grad;ctx.beginPath();ctx.arc(cx,cy,r*.47,0,Math.PI*2);ctx.fill();
    ellipse(cx,cy,r*.355,r*.355,0,colors[0],.19*fade);
    for(let i=0;i<70;i++){const a=i/70*Math.PI*2+t*.04;glyph(i%alphabet.length,i%7===0?2:0,cx+Math.cos(a)*r*1.34,cy+Math.sin(a)*r*1.34,r*.027,.16*fade);}
  }
  function drawFriday(t,cx,cy,r,fade){
    const colors=worlds[world].colors;
    // ARIA's breathing ellipsoid unfolds into a flowing, asymmetrical organism.
    for(const p of shell){const a=p.theta+t*.13;const wave=.065*Math.sin(p.phi*4+a*2-t*.8),rad=r*(.78+wave)*(1+.025*Math.sin(t*.8));
      const x=Math.cos(a)*Math.sin(p.phi)*rad,z=Math.sin(a)*Math.sin(p.phi),y=Math.cos(p.phi)*rad*1.08;
      const depth=(z+1)/2,stripe=.5+.5*Math.cos(a-p.phi*2.4-t*.4);
      glyph(p.glyph+Math.floor(t*.23+p.phase),p.color,cx+x+Math.sin(p.phi*2+t*.4)*r*.07,cy+y,r*(.04+.025*depth),(.13+.7*depth)*(.3+.7*Math.pow(stripe,3))*fade);
    }
    for(let band=0;band<3;band++){const tilt=-.5+band*.42;for(let i=0;i<170;i++){const a=i/170*Math.PI*2-t*.17+band*1.2;const rr=r*(1.06+.08*Math.sin(a*3+t*.4+band));
      const x=Math.cos(a)*rr,y=Math.sin(a)*rr*.29,z=(Math.sin(a)+1)/2;
      glyph(i+Math.floor(t*.25),band===1?2:0,cx+x*Math.cos(tilt)-y*Math.sin(tilt),cy+x*Math.sin(tilt)+y*Math.cos(tilt),r*(.035+.017*z),(.12+.5*z)*fade);
    }}
    ellipse(cx,cy,r*1.3,r*.4,-.46,colors[2],.13*fade);
    for(let i=0;i<36;i++){const a=i/36*Math.PI*2-t*.08;glyph(i,2,cx+Math.cos(a)*r*1.36,cy+Math.sin(a)*r*1.12,r*.03,.18*fade);}
  }
  function drawOuija(t,cx,cy,r,fade){
    const color=worlds[world].colors,ry=t*.17,rx=.35+Math.sin(t*.2)*.12,sy=Math.sin(ry),co=Math.cos(ry),sx=Math.sin(rx),cxr=Math.cos(rx),breath=1+.035*Math.sin(t*.7);
    capsid.forEach((p,i)=>{const x=p[0]*co+p[2]*sy,z=-p[0]*sy+p[2]*co;const y=p[1]*cxr-z*sx,zz=p[1]*sx+z*cxr;const f=1+zz*.13;projected[i].x=cx+x*r*.81*breath*f;projected[i].y=cy+y*r*.81*breath*f;projected[i].z=zz;});
    for(const [a,b] of edges){const p=projected[a],q=projected[b];line([[p.x,p.y],[q.x,q.y]],color[0],(.025+.1*((p.z+q.z+2)/4))*fade,.6);}
    projected.forEach((p,i)=>glyph(i+Math.floor(t*.2),i%11===0?3:i%4===0?2:0,p.x,p.y,r*(.04+.022*(p.z+1)/2),(.08+.72*(p.z+1)/2)*fade));
    // The ritual plane sits below the entity rather than over its face.
    const fy=cy+r*1.1;ellipse(cx,fy,r*1.43,r*.36,0,color[0],.32*fade);ellipse(cx,fy,r*1.58,r*.4,0,color[2],.16*fade,true);
    const star=[];for(let i=0;i<=5;i++){const a=-Math.PI/2+(i*2%5)*Math.PI*2/5;star.push([cx+Math.cos(a)*r*1.4,fy+Math.sin(a)*r*.35]);}line(star,color[0],.3*fade,.8);
    for(let i=0;i<130;i++){const a=i/130*Math.PI*2+t*.07;glyph(i,i%5===0?2:0,cx+Math.cos(a)*r*1.5,fy+Math.sin(a)*r*.38,r*.032,.35*fade);}
    ellipse(cx,cy,r*1.02,r*1.02,0,color[2],.1*fade,true);
  }
  function sceneCenter(){
    const b=$('entity-zone').getBoundingClientRect(),root=canvas.getBoundingClientRect();
    if(view==='cloud')return{x:b.left-root.left+b.width/2,y:b.top-root.top+b.height/2,r:b.width*.55};
    return{x:width*.5,y:height*.5,r:Math.min(width*.25,height*.38)};
  }
  function draw(t){
    if(!ctx)return;ctx.clearRect(0,0,width,height);const c=sceneCenter(),colors=worlds[world].colors;
    driftX+=(mouseX-driftX)*.04;driftY+=(mouseY-driftY)*.04;
    const open=!portal.hidden,fade=view==='cloud'?(open?.32:1):.07;
    const x=c.x+driftX,y=c.y+driftY,r=c.r*(working?1.03+.025*Math.sin(t*7):open?1.14:1);
    // Fine perimeter landmarks provide scale without filling OLED black.
    ctx.fillStyle=colors[0];for(const m of motes){ctx.globalAlpha=(.025+.13*m.depth)*(.65+.35*Math.sin(t*.2+m.phase));ctx.fillRect(m.x*width,m.y*height,1,1);}
    if(view==='cloud'){
      document.querySelectorAll('.city-node').forEach((n,i)=>{const nx=parseFloat(n.style.getPropertyValue('--x'))/100*width,ny=parseFloat(n.style.getPropertyValue('--y'))/100*height;
        const dx=nx-c.x,dy=ny-c.y,length=Math.hypot(dx,dy),sx=c.x+dx/length*c.r*.85,sy=c.y+dy/length*c.r*.85;
        ctx.globalAlpha=.12;ctx.strokeStyle=colors[0];ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo((nx+sx)/2+dy*.1,(ny+sy)/2-dx*.1,nx,ny);ctx.stroke();
        const progress=(t*.07+i*.17)%1,u=1-progress,mx=(nx+sx)/2+dy*.1,my=(ny+sy)/2-dx*.1;
        const px=u*u*sx+2*u*progress*mx+progress*progress*nx,py=u*u*sy+2*u*progress*my+progress*progress*ny;
        glyph(i+Math.floor(t*.2),i===3?3:0,px,py,9,.55);
      });
    }
    if(world==='maniac')drawBlackSun(t,x,y,r,fade);else if(world==='friday')drawFriday(t,x,y,r,fade);else drawOuija(t,x,y,r,fade);
    ctx.globalAlpha=1;
  }
  function resize(){const b=canvas.getBoundingClientRect();width=b.width;height=b.height;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw(elapsed);}
  function tick(now){raf=0;if(document.hidden||paused||reduced.matches)return;if(previous)elapsed+=Math.min(now-previous,80)/1000;previous=now;if(now-lastPaint>15){draw(elapsed);lastPaint=now;}raf=requestAnimationFrame(tick);}
  function syncAnimation(){cancelAnimationFrame(raf);raf=0;previous=0;document.body.classList.toggle('motion-paused',paused||reduced.matches);draw(elapsed);if(!document.hidden&&!paused&&!reduced.matches)raf=requestAnimationFrame(tick);}
  document.querySelectorAll('button[data-world]').forEach(b=>b.addEventListener('click',()=>switchWorld(b.dataset.world)));
  document.querySelectorAll('button[data-view]').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
  $('close-portal').addEventListener('click',closePortal);
  document.addEventListener('keydown',e=>{if(portal.hidden)return;if(e.key==='Escape'){e.preventDefault();closePortal();}if(e.key==='Tab'){const focusable=portal.querySelectorAll('button,input,a[href]'),first=focusable[0],last=focusable[focusable.length-1];if((e.shiftKey&&document.activeElement===first)||(!e.shiftKey&&document.activeElement===last)){e.preventDefault();(e.shiftKey?last:first).focus();}}});
  $('entity-button').addEventListener('click',()=>{if(working)return;$('command-input').value='';answer();});
  $('command-form').addEventListener('submit',e=>{e.preventDefault();answer();});
  $('motion-button').addEventListener('click',()=>{paused=!paused;$('motion-button').setAttribute('aria-pressed',String(paused));$('motion-button').textContent=paused?'▷ Reanudar movimiento':'Ⅱ Pausar movimiento';syncAnimation();});
  $('about-button').addEventListener('click',()=>{
    if(privateMode){openPortal('ACCESO / ESTADO','Tu sesión está reconocida.','<p class="portal-paragraph">El gateway verifica tu acceso al sitio. <strong>La telemetría privada no está conectada.</strong> El acceso por VPN de tu laptop se configurará por separado.</p>');return;}
    openPortal('ESTUDIO 02 / TRES PRESENCIAS','Un sistema que se siente vivo.','<p class="portal-paragraph">Explora las ciudades, toca el núcleo o cambia a <strong>CASA</strong> y <strong>BASES</strong>. Cada mundo tiene una anatomía y un movimiento propios.</p>'+rows([['Conexión','Ninguna · demo local'],['Datos','Ficticios, fijos'],['Entidades','Animación procedural'],['Infraestructura privada','No consultada']])+'<p class="portal-caption">Los accesos sar1a y VPN se definirán aparte. Este archivo no solicita credenciales ni transmite información.</p>');
  });
  $('alert-button').addEventListener('click',()=>openPortal('ATENCIÓN / EJEMPLO','Docs necesita una mirada.',metrics([['680','LATENCIA / ms'],['LENTO','ESTADO']])+'<p class="portal-paragraph">Una señal ámbar acompaña al servicio. La casa sigue disponible. <strong>Esta alerta es ficticia</strong> y no corresponde al estado de tus equipos.</p>'));
  $('projection-button').addEventListener('click',()=>openPortal('PROYECCIÓN / CANAL CENTRAL','La presencia tiene voz.','<div class="projection">'+Array.from({length:48},(_,i)=>`<i style="--bar:${15+Math.sin(i*.53)**2*80}px;--delay:${-i*.09}s"></i>`).join('')+'<span class="projection-label">16:9 / CORE VISUAL · DEMO SILENCIOSA</span></div><p class="projection-title">ESPACIO PARA VIDEO / VOZ / ANIMACIÓN</p><p class="portal-caption">Movimiento ilustrativo. No hay audio, micrófono ni reproducción conectados.</p>'));
  $('fleet-button').addEventListener('click',()=>openPortal('FLOTA / DEMO','Una constelación, dieciocho nodos.',metrics([['18','DISPONIBLES'],['00','STALE'],['00','CAÍDOS']])+'<p class="portal-paragraph">La salud global se lee de un vistazo. Las ciudades abren el detalle, y cada muestra conserva su estado y su edad.</p>'));
  $('gpu-button').addEventListener('click',()=>{switchView('home');$('machine-view').querySelector('[data-machine="0"]').click();});
  $('disk-button').addEventListener('click',()=>openPortal('CAPACIDAD / DEMO','Espacio para seguir creciendo.',metrics([['72%','USADO'],['28%','LIBRE']])+glyphField(5)+'<p class="portal-caption">Volumen ficticio. Un anillo lleno significará capacidad ocupada; el campo de caracteres es sólo animación.</p>'));
  canvas.parentElement.addEventListener('pointermove',e=>{const b=canvas.getBoundingClientRect();mouseX=((e.clientX-b.left)/width-.5)*8;mouseY=((e.clientY-b.top)/height-.5)*8;});
  canvas.parentElement.addEventListener('pointerleave',()=>{mouseX=0;mouseY=0;});
  new ResizeObserver(()=>{renderCities();resize();}).observe(canvas);
  document.addEventListener('visibilitychange',syncAnimation);reduced.addEventListener('change',syncAnimation);
  function clock(){$('local-clock').textContent=new Date().toLocaleTimeString('es-HN',{hour12:false})+' / LOCAL';}clock();setInterval(clock,1000);
  const oldCurve=document.querySelector('.mini-curve');if(oldCurve){const field=document.createElement('span');field.className='bottom-glyphs';field.setAttribute('aria-hidden','true');field.innerHTML='01λ∆<br>Æ{}:';oldCurve.replaceWith(field);}
  if(!privateMode){renderServices();renderBases();renderMachines();}
  switchWorld(location.hash.slice(1)||'maniac');
  const initialView=new URLSearchParams(location.search).get('view');if(!privateMode&&['home','databases'].includes(initialView))switchView(initialView);
  syncAnimation();
  if(document.fonts)document.fonts.ready.then(()=>{buildAtlas();draw(elapsed);});
})();
