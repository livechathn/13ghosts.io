/* Living announcements: glyph atlas, no network, offscreen suspension. */
(()=>{'use strict';
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('[data-mvp-entity]').forEach(canvas=>{
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const kind=canvas.dataset.mvpEntity,red=kind==='ouijaboard';
  const colors=red?['#ff493b','#9b2b24','#d5af76']:['#9de1b1','#b294e6','#e3d8b3'];
  const chars='01λ{}[]/<>+=*:.Æ',cell=32,cols=16,atlas=document.createElement('canvas');
  atlas.width=cols*cell;atlas.height=Math.ceil(chars.length*colors.length/cols)*cell;
  const ink=atlas.getContext('2d');ink.font='500 23px ui-monospace,Menlo,monospace';ink.textAlign='center';ink.textBaseline='middle';
  colors.forEach((color,c)=>{ink.fillStyle=color;for(let g=0;g<chars.length;g++){const n=c*chars.length+g;ink.fillText(chars[g],(n%cols+.5)*cell,(Math.floor(n/cols)+.5)*cell);}});
  const points=Array.from({length:kind==='maniac'?740:600},(_,i)=>({a:i*2.39996323,p:Math.acos(1-2*(i+.5)/(kind==='maniac'?740:600)),q:(i*.618034)%1,g:i%chars.length,c:i%9<6?0:i%2+1}));
  let w=0,h=0,raf=0,previous=null,t=0,visible=false,paused=false;
  const glyph=(x,y,z,p,alpha=1)=>{const side=8+6*(z+1)/2,n=p.c*chars.length+(p.g+Math.floor(t*.25))%chars.length;ctx.globalAlpha=Math.max(0,Math.min(1,(.18+.7*(z+1)/2)*alpha));ctx.drawImage(atlas,n%cols*cell,Math.floor(n/cols)*cell,cell,cell,x-side/2,y-side/2,side,side);};
  function draw(){
   ctx.clearRect(0,0,w,h);const r=Math.min(w*.35,h*.41),cx=w/2,cy=h/2;
   if(kind==='alean'){
    // A staggered spherical skin with a travelling, snake-like meridian.
    for(const p of points){const a=p.a+t*.18,z=Math.sin(a)*Math.sin(p.p),wave=1+.035*Math.sin(p.p*6+a*2-t);const x=Math.cos(a)*Math.sin(p.p)*r*wave,y=Math.cos(p.p)*r*1.08;const stripe=.42+.58*Math.pow(.5+.5*Math.cos(a-p.p*2.4+t*.4),4);glyph(cx+x,cy+y,z,p,stripe);}
   }else if(kind==='maniac'){
    // An oblique accretion disk: the centre stays entirely black.
    for(const p of points){const a=p.a-t*(.12+p.q*.13),radius=r*(.4+p.q*.95),z=Math.sin(a);const x=Math.cos(a)*radius,y=Math.sin(a)*radius*.33;const tilt=.22*x;glyph(cx+x,cy+y+tilt,z,p,.4+.6*Math.sin(Math.PI*p.q));}
    ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.beginPath();ctx.arc(cx,cy,r*.28,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=colors[0];ctx.globalAlpha=.3;ctx.lineWidth=.7;ctx.beginPath();ctx.arc(cx,cy,r*.29,0,Math.PI*2);ctx.stroke();
   }else{
    // Five upright glyph planes form a room around a slowly turning seal.
    for(let panel=0;panel<5;panel++){const a=panel*Math.PI*2/5+t*.065;const depth=Math.sin(a),x=cx+Math.cos(a)*r*.87,y=cy+depth*r*.24;ctx.strokeStyle=colors[panel%3];ctx.globalAlpha=.18+.16*(depth+1)/2;ctx.lineWidth=.7;ctx.strokeRect(x-r*.21,y-r*.62,r*.42,r*.77);for(let row=0;row<10;row++)for(let col=0;col<5;col++){const p=points[panel*50+row*5+col];glyph(x-r*.16+col*r*.08,y-r*.54+row*r*.067,depth,p,.55);}}
    const corners=Array.from({length:5},(_,i)=>{const a=i*Math.PI*2/5-Math.PI/2+t*.065;return[cx+Math.cos(a)*r,cy+r*.52+Math.sin(a)*r*.24];});
    ctx.globalAlpha=.6;ctx.strokeStyle=colors[0];ctx.lineWidth=.8;ctx.beginPath();for(let i=0;i<6;i++){const p=corners[(i*2)%5];i?ctx.lineTo(...p):ctx.moveTo(...p);}ctx.stroke();
    for(let i=300;i<points.length;i++){const p=points[i],a=p.a-t*.1,rad=r*(.18+p.q*.85);glyph(cx+Math.cos(a)*rad,cy+r*.52+Math.sin(a)*rad*.24,Math.sin(a),p,.25);}
   }
   ctx.globalAlpha=1;
  }
  function tick(now){raf=0;if(!visible||paused||document.hidden||motion.matches)return;if(previous!==null)t+=Math.min(now-previous,80)/1000;previous=now;draw();raf=requestAnimationFrame(tick);}
  function sync(){cancelAnimationFrame(raf);raf=0;previous=null;if(visible&&!paused&&!document.hidden&&!motion.matches)raf=requestAnimationFrame(tick);else draw();}
  function resize(){const box=canvas.getBoundingClientRect();w=box.width;h=box.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
  const control=canvas.closest('.mvp-announcement').querySelector('.mvp-motion');control.addEventListener('click',()=>{paused=!paused;control.setAttribute('aria-pressed',String(paused));control.textContent=paused?'↻ Reanudar':'Ⅱ Pausar';sync();});
  new ResizeObserver(resize).observe(canvas);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(canvas);
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);resize();
 });
})();
