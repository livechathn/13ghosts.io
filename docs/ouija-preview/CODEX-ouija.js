'use strict';
// Visual prototype only. No network, auth, storage or generated model replies.
const modes = {
  occult: {name:'Ocultismo',channel:'OCCULT STUDIES',copy:'Abrí una conversación con el otro lado.\nOcultismo, símbolos y preguntas incómodas.',placeholder:'¿Qué querés invocar?',prompts:['¿Qué diferencia un símbolo de una superstición?','Leamos un arquetipo sin convertirlo en destino.','Quiero investigar el origen de un ritual.']},
  redteam: {name:'Red team',channel:'ADVERSARIAL RESEARCH',copy:'Pensá como adversario. Trabajá con evidencia.\nUn alcance definido antes de cada investigación.',placeholder:'Describí tu entorno y el alcance autorizado…',prompts:['Armemos el threat model de mi aplicación.','¿Qué evidencia debería preservar en un incidente?','Diseñemos un ejercicio para mi laboratorio.']},
  research: {name:'Investigación',channel:'RESEARCH CHANNEL',copy:'Entre el archivo, el código y la imaginación.\nSepará lo que sabemos de lo que suponemos.',placeholder:'Traé una pregunta, una fuente o una hipótesis…',prompts:['Ayudame a formular una hipótesis falsable.','Compará dos explicaciones de este fenómeno.','Organicemos las preguntas de mi investigación.']}
};
let currentMode = 'occult';
let messageCount = 0;
const input = document.getElementById('message');
const send = document.querySelector('.send');
const messages = document.getElementById('messages');
function updateInput(){send.disabled = !input.value.trim();document.getElementById('character-count').textContent = `${input.value.length} / 4000`;}
function selectMode(mode){
  if(!modes[mode]) return;
  currentMode = mode;
  const data = modes[mode];
  document.querySelectorAll('[data-mode]').forEach(button=>{const active=button.dataset.mode===mode;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));});
  document.getElementById('channel-name').textContent=data.channel;
  document.getElementById('composer-mode').textContent=data.name;
  const copy=document.getElementById('welcome-copy');copy.replaceChildren();
  data.copy.split('\n').forEach((line,index)=>{if(index)copy.append(document.createElement('br'));copy.append(document.createTextNode(line));});
  input.placeholder=data.placeholder;
  const list=document.getElementById('prompt-list');list.replaceChildren();
  data.prompts.forEach(prompt=>{const button=document.createElement('button');button.className='prompt';button.type='button';const label=document.createElement('span');label.textContent=prompt;const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');button.append(label,arrow);button.addEventListener('click',()=>{input.value=prompt;updateInput();input.focus();});list.append(button);});
}
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>selectMode(button.dataset.mode)));
input.addEventListener('input',updateInput);
input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();if(input.value.trim())document.getElementById('composer').requestSubmit();}});
document.getElementById('composer').addEventListener('submit',event=>{
  event.preventDefault();const text=input.value.trim();if(!text)return;
  messageCount++;
  document.querySelector('.chamber').classList.add('conversation-started');
  const article=document.createElement('article');article.className='message';
  const meta=document.createElement('div');meta.className='message-meta';meta.textContent=`VOS / ${modes[currentMode].name.toUpperCase()} / BORRADOR ${String(messageCount).padStart(2,'0')}`;
  const body=document.createElement('p');body.className='message-body';body.textContent=text;
  const note=document.createElement('p');note.className='message-note';note.textContent='No enviado. El modelo y el OTP aún no están conectados en esta prueba.';
  article.append(meta,body,note);messages.append(article);input.value='';updateInput();input.focus();
  const scroll=document.getElementById('conversation-scroll');scroll.scrollTop=scroll.scrollHeight;
});
document.getElementById('new-session').addEventListener('click',()=>{
  if((messageCount||input.value)&&!window.confirm('¿Descartar el borrador de esta prueba y abrir una sesión vacía?'))return;
  messages.replaceChildren();messageCount=0;input.value='';updateInput();document.querySelector('.chamber').classList.remove('conversation-started');document.getElementById('session-status').textContent='Borrador descartado. Sesión vacía.';input.focus();
});
document.querySelectorAll('[data-dialog]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.dialog).showModal()));
document.querySelectorAll('.close-dialog').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
selectMode(currentMode);updateInput();
