'use strict';
// Visual transplant from Alean's luminance-ramp renderer. No auth or API copied.
const RAMP = ' .:-=+*#%@';
function sampleAscii(image, cols = 110) {
  const width = image.naturalWidth, height = image.naturalHeight;
  if (!width || !height || width * height > 40000000) throw Error('La imagen excede 40 megapíxeles o no se puede leer.');
  const rows = Math.max(1, Math.min(150, Math.round(cols * height / width * .52)));
  const sample = document.createElement('canvas'); sample.width = cols; sample.height = rows;
  const context = sample.getContext('2d', {willReadFrequently: true});
  context.fillStyle = '#000'; context.fillRect(0, 0, cols, rows); context.drawImage(image, 0, 0, cols, rows);
  const pixels = context.getImageData(0, 0, cols, rows).data;
  const lines = [], luminance = [], colors = [];
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      // Same RGB weighting as Alean; gamma lifts shadow detail on an OLED-black surface.
      const light = Math.min(1, Math.pow((pixels[i] * .299 + pixels[i+1] * .587 + pixels[i+2] * .114) / 255, .64));
      luminance.push(light); colors.push([pixels[i], pixels[i+1], pixels[i+2]]); line += RAMP[Math.min(RAMP.length-1, Math.floor(light * RAMP.length))];
    }
    lines.push(line);
  }
  return {lines, luminance, colors, cols, rows, text: lines.join('\n')};
}
const $ = id => document.getElementById(id);
let artifact = null, loadingVersion = 0, objectURL = null, view = 'ascii';
const canvas = $('ascii'), source = $('source'), ctx = canvas.getContext('2d');
function paint() {
  if (!artifact || view !== 'ascii') return;
  const width = canvas.clientWidth, height = canvas.clientHeight;
  if (!width || !height) return;
  const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  const step = Math.min(width / (artifact.cols * .6), height / artifact.rows);
  ctx.font = `${step}px monospace`; ctx.textBaseline = 'top';
  const cell = ctx.measureText('M').width;
  const left = (width - cell * artifact.cols) / 2, top = (height - step * artifact.rows) / 2;
  for (let y=0;y<artifact.rows;y++) for (let x=0;x<artifact.cols;x++) {
    const l = artifact.luminance[y*artifact.cols+x];
    if (artifact.lines[y][x] === ' ') continue;
    const rgb = artifact.colors[y*artifact.cols+x].map(v=>Math.round(255*Math.pow(v/255,.55)));
    ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    ctx.fillText(artifact.lines[y][x], left+x*cell, top+y*step);
  }
}
new ResizeObserver(paint).observe($('manifestation'));
function setView(next) {
  view = next; canvas.hidden = next !== 'ascii'; source.hidden = next !== 'source';
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view===next)));
  $('render-mode').textContent = next === 'ascii' ? 'LUMINANCE → GLYPHS' : 'ARCHIVE / SOURCE IMAGE'; paint();
}
async function loadArtifact(url, label, isBlob = false) {
  const version = ++loadingVersion, image = new Image();
  $('image-error').hidden = true; $('art-status').textContent = 'Leyendo imagen en este navegador…';
  try {
    await new Promise((resolve,reject) => { image.onload=resolve; image.onerror=()=>reject(Error('No se pudo leer la imagen. Probá PNG, JPG o WebP.')); image.src=url; });
    if (version !== loadingVersion) { if(isBlob) URL.revokeObjectURL(url); return; }
    const result = sampleAscii(image);
    const previousURL = objectURL; objectURL = isBlob ? url : null;
    artifact = result; source.src = url;
    if (previousURL) URL.revokeObjectURL(previousURL);
    $('artifact-name').textContent = label;
    source.alt = label === 'ARCHIVE / THE LAB' ? 'Arte original del laboratorio 13Ghosts.' : 'Imagen seleccionada localmente por vos.';
    canvas.setAttribute('aria-label', `Imagen convertida a ASCII: ${result.cols} columnas y ${result.rows} filas.`);
    $('resolution').textContent = `${result.cols} COL × ${result.rows} ROW / ${result.cols*result.rows} GLYPHS`;
    $('download').disabled = false; paint();
    $('art-status').textContent = 'ASCII listo · conversión local · ninguna imagen enviada.';
  } catch(error) {
    if(isBlob) URL.revokeObjectURL(url);
    if(version!==loadingVersion) return;
    $('image-error').hidden = false; $('image-error').textContent = error.message;
    $('art-status').textContent = 'No se cambió la imagen anterior. Podés volver al lab o elegir otra.';
  }
}
$('image-file').addEventListener('change', () => {
  const file = $('image-file').files[0]; if(!file) return;
  if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 12*1024*1024) {
    $('art-status').textContent = 'Elegí PNG, JPG o WebP de hasta 12 MB. No se procesó el archivo.'; $('image-file').value=''; return;
  }
  loadArtifact(URL.createObjectURL(file), 'YOUR IMAGE / LOCAL ONLY', true); $('image-file').value='';
});
$('restore-art').addEventListener('click', () => loadArtifact('lab.jpeg','ARCHIVE / THE LAB'));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
$('download').addEventListener('click', () => {
  if(!artifact) return;
  const url = URL.createObjectURL(new Blob([artifact.text+'\n'], {type:'text/plain;charset=utf-8'}));
  const link = document.createElement('a'); link.href=url; link.download='ouija-ascii.txt'; link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
const modes = {
  occult: {title:'Estudios ocultos', label:'☾ OCULTISMO', heading:['¿Hay alguien','del otro lado?'], copy:'Símbolos, arquetipos y preguntas que sobreviven a la luz.', prompts:['¿Qué diferencia un símbolo de una superstición?','Quiero investigar el origen de un ritual.','Leamos un sueño como una historia, no una predicción.']},
  redteam: {title:'Adversarial research', label:'⌖ RED TEAM', heading:['Buscá la grieta.','Definí el alcance.'], copy:'Preguntas adversarias para sistemas que tenés autorización de investigar.', prompts:['Armemos el threat model de mi aplicación.','Diseñemos un ejercicio aislado para mi laboratorio.','¿Qué evidencia preservo antes de investigar?']},
  research: {title:'Archivo de preguntas', label:'⌘ INVESTIGACIÓN', heading:['Entre el dato','y lo desconocido.'], copy:'Fuentes, hipótesis y conexiones. La curiosidad también necesita un método.', prompts:['Ayudame a formular una hipótesis falsable.','Quiero comparar dos explicaciones.','Organicemos las preguntas de mi investigación.']}
};
let mode='occult', count=0;
function selectMode(next) {
  if(!modes[next])return; mode=next; const data=modes[next];
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===next)));
  $('channel-title').textContent=data.title; $('mode-label').textContent=data.label;
  const em=document.createElement('em'); em.textContent=data.heading[1];
  $('welcome-title').replaceChildren(document.createTextNode(data.heading[0]),document.createElement('br'),em);
  $('welcome-copy').textContent=data.copy; $('prompts').replaceChildren();
  data.prompts.forEach(text=>{const b=document.createElement('button'); b.className='prompt';const label=document.createElement('span');label.textContent=text;const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');b.append(label,arrow);b.addEventListener('click',()=>{$('message').value=text;updateInput();$('message').focus();});$('prompts').append(b);});
}
function updateInput(){$('send').disabled=!$('message').value.trim();$('char-count').textContent=`${$('message').value.length} / 4000`;}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>selectMode(b.dataset.mode)));
$('message').addEventListener('input',updateInput);
$('message').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();if($('message').value.trim())$('composer').requestSubmit();}});
$('composer').addEventListener('submit',e=>{
  e.preventDefault(); const text=$('message').value.trim(); if(!text)return;
  count++; $('welcome').hidden=true;
  const message=document.createElement('article');message.className='message';
  const meta=document.createElement('p');meta.className='message-meta';meta.textContent=`VOS / ${modes[mode].title.toUpperCase()} / ${String(count).padStart(2,'0')}`;
  const body=document.createElement('p');body.className='message-body';body.textContent=text;
  const note=document.createElement('p');note.className='message-note';note.textContent='No enviado. El canal de IA todavía no está conectado.';
  message.append(meta,body,note);$('messages').append(message);$('message').value='';updateInput();$('message').focus();$('conversation').scrollTop=$('conversation').scrollHeight;
});
$('reset').addEventListener('click',()=>{if((count||$('message').value)&&!confirm('¿Descartar los borradores de esta sesión? La imagen no cambia.'))return;$('messages').replaceChildren();count=0;$('message').value='';$('welcome').hidden=false;updateInput();$('session-status').textContent='Sesión vacía. No se borraron archivos ni imágenes.';});
document.querySelectorAll('[data-dialog]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.dialog).showModal()));
document.querySelectorAll('.close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
selectMode(mode);updateInput();loadArtifact('lab.jpeg','ARCHIVE / THE LAB');
