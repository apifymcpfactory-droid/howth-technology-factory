'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const aad = new TextEncoder().encode('HTF-private-checklist-v1');
  const encode = a => btoa(String.fromCharCode(...new Uint8Array(a)));
  const decode = s => Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0));
  const el = (tag, text, cls) => { const n=document.createElement(tag); if(text!==undefined)n.textContent=text; if(cls)n.className=cls; return n; };
  let secret, data, ticks={}, active='live', saveChain=Promise.resolve();
  const collapsedPlatforms=new Set(['Apify','MCPize']);
  const openedPlatforms=new Set();
  const storageKey='htf-private-worklist-ticks-v1';
  const groups=[
    ['live','Available for Purchase',e=>e.status==='Available for Purchase'],
    ['review','Developed and in Review',e=>e.status==='Developed and in Review'],
    ['built','Developed but not submitted',e=>e.status==='Developed but not submitted'],
    ['development','Coming Soon - in development',e=>e.status==='Coming Soon - in development']
  ];
  async function decrypt(envelope){
    if(envelope.v!==1)throw Error('version');
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(envelope.iv),additionalData:aad},secret,decode(envelope.data));
    return JSON.parse(new TextDecoder().decode(plain));
  }
  async function saveTicks(){
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad},secret,new TextEncoder().encode(JSON.stringify(ticks)));
    localStorage.setItem(storageKey,JSON.stringify({v:1,iv:encode(iv),data:encode(cipher)}));
    $('#save-status').textContent='Your extra ticks are saved on this device.';
  }
  function filter(){
    const term=$('#search').value.trim().toLowerCase(), platform=$('#platform').value;
    const predicate=groups.find(g=>g[0]===active)[2];let shown=0;
    for(const row of $('#rows').children){const e=data.entries[Number(row.dataset.index)];const matches=predicate(e)&&(platform==='all'||e.platform===platform)&&row.textContent.toLowerCase().includes(term);const collapsed=collapsedPlatforms.has(e.platform)&&!openedPlatforms.has(e.platform);row.hidden=!(matches&&!collapsed);if(matches)shown++;}
    for(const summary of $('#rows').querySelectorAll('.platform-summary')){const name=summary.dataset.platform;const entries=data.entries.filter(predicate).filter(e=>e.platform===name&&(platform==='all'||platform===name)&&(!term||e.platform.toLowerCase().includes(term)||e.product.toLowerCase().includes(term)));summary.hidden=entries.length===0;summary.querySelector('.platform-summary-count').textContent=`${entries.length} products in this status`;}
    $('#count').textContent=`${shown} of ${data.entries.length} entries shown`;
    $('#empty').hidden=shown>0;
  }
  function render(){
    const blueprints=$('#blueprints');blueprints.replaceChildren();
    for(const b of data.blueprints||[]){if(b.route!=='/private/production-platform/')continue;const card=el('article'),link=el('a','Open blueprint and feature checklist');link.href=b.route+location.hash;card.append(el('h2',b.title),el('p',b.description),el('p',b.status),link);blueprints.append(card);}blueprints.hidden=!blueprints.children.length;
    $('#updated').textContent='Shared progress updated '+data.as_of+' · '+(data.focus||'Work one eligible release at a time.');
    const verified=data.entries.reduce((n,e)=>n+e.completed.length,0);
    const metrics=[[data.platform_count,'retained platforms'],[data.product_entry_count,'product entries'],[verified,'verified completed steps'],[data.entries.reduce((n,e)=>n+e.tasks.length,0),'remaining steps']];
    $('#summary').replaceChildren(...metrics.map(([v,label])=>{const n=el('div');n.append(el('strong',v),el('span',label));return n;}));
    $('#tabs').replaceChildren(...groups.map(([id,label,predicate])=>{const b=el('button',label);b.type='button';b.setAttribute('aria-current',String(active===id));b.append(el('span',data.entries.filter(predicate).length,'tab-count'));b.addEventListener('click',()=>{active=id;for(const x of $('#tabs').children)x.setAttribute('aria-current',String(x===b));filter();});return b;}));
    const previous=$('#platform').value;$('#platform').replaceChildren(new Option('All platforms','all'),...[...new Set(data.entries.map(e=>e.platform))].sort().map(p=>new Option(p,p)));$('#platform').value=previous;if(!$('#platform').value)$('#platform').value='all';
    const rows=data.entries.map((e,i)=>{
      const row=el('tr');row.dataset.index=i;const info=el('td'),done=el('td'),todo=el('td');
      const compact=true;
      row.classList.add('compact-row');
      info.append(el('div',`${i+1} · ${e.platform}`,'platform'),el('div',e.product,'product'));
      const cls=e.status==='Available for Purchase'?'live':e.status==='Developed and in Review'?'review':e.status==='Developed but not submitted'?'built':'development';
      info.append(el('span',e.status,'badge '+cls),el('p',e.setup,'detail'+(['Waiting','Blocked','Owner action'].includes(e.lane)?' blocker':'')));
      if(compact){const toggle=el('button','View checklist','row-toggle');toggle.type='button';toggle.setAttribute('aria-expanded','false');toggle.addEventListener('click',()=>{const open=row.classList.toggle('expanded');toggle.textContent=open?'Hide checklist':'View checklist';toggle.setAttribute('aria-expanded',String(open));});info.append(toggle);}
      if(e.note)info.append(el('p',e.note,'detail row-detail'));
      if(e.completed.length)for(const text of e.completed){const item=el('div',undefined,'task');item.append(el('span','✓','done-icon'),el('span',text));done.append(item);}else done.append(el('p','No completed step recorded.','detail'));
      for(const task of e.tasks){const label=el('label',undefined,'task'),box=el('input'),text=el('span'),mark=el('span','Marked done on this device','local-mark');box.type='checkbox';box.dataset.task=task.id;box.checked=ticks[task.id]===true;mark.hidden=!box.checked;text.append(el('span',task.text,'task-text'),el('span',task.owner+(task.dependency?' · After: '+task.dependency:''),'meta'),mark);box.addEventListener('change',()=>{ticks[task.id]=box.checked;mark.hidden=!box.checked;saveChain=saveChain.then(saveTicks).catch(()=>{$('#save-status').textContent='This browser could not save your latest tick. Shared progress is unchanged.';});});label.append(box,text);todo.append(label);}
      if(!e.tasks.length)todo.append(el('p','Historical release. No maintenance task authorised.','detail'));
      row.append(info,done,todo);return row;
    });
    const output=[];
    for(const name of ['Apify','MCPize']){const summary=el('tr',undefined,'platform-summary');summary.dataset.platform=name;summary.dataset.index=data.entries.findIndex(e=>e.platform===name);const cell=el('td');cell.colSpan=3;const button=el('button',undefined,'platform-toggle');button.type='button';button.append(el('strong',name),el('span','Products collapsed to keep the active list short','platform-summary-note'),el('span','','platform-summary-count'));button.addEventListener('click',()=>{if(openedPlatforms.has(name))openedPlatforms.delete(name);else openedPlatforms.add(name);button.setAttribute('aria-expanded',String(openedPlatforms.has(name)));filter();});button.setAttribute('aria-expanded','false');cell.append(button);summary.append(cell);output.push(summary);}
    output.push(...rows);$('#rows').replaceChildren(...output);$('#standards').replaceChildren(...data.shared_release_checklist.map(t=>el('li',t)));
    $('#locked').hidden=true;$('#board').hidden=false;filter();
  }
  async function load(){
    $('#reload').disabled=true;
    try{const response=await fetch('snapshot.enc.json?v='+Date.now(),{cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw Error('fetch');const next=await decrypt(await response.json());if(!Array.isArray(next.entries)||next.entries.length<1)throw Error('data');data=next;render();}
    catch{if(data){$('#save-status').textContent='The shared update could not be loaded. The previous snapshot remains visible.';}else{$('#board').hidden=true;$('#locked').replaceChildren(el('h2','Private access link required'),el('p','Use the complete private link supplied by HTF, including the part after #. An invalid key or damaged snapshot will not display private data.'));}}
    finally{$('#reload').disabled=false;}
  }
  async function start(){
    try{const raw=new URLSearchParams(location.hash.slice(1)).get('k');if(!raw||!/^[A-Za-z0-9_-]{43}$/.test(raw))throw Error('key');secret=await crypto.subtle.importKey('raw',decode(raw),{name:'AES-GCM'},false,['encrypt','decrypt']);try{const stored=localStorage.getItem(storageKey);if(stored){const parsed=await decrypt(JSON.parse(stored));if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))ticks=parsed;}}catch{}await load();}
    catch{$('#locked').replaceChildren(el('h2','Private access link required'),el('p','Open the complete private link supplied by HTF. The public page contains no readable checklist data.'));}
  }
  $('#search').addEventListener('input',filter);$('#platform').addEventListener('change',filter);$('#reload').addEventListener('click',load);start();
})();
