/* Book tab: full-text search over book.json + page viewer (pdf.js renders UAV_BOOK.pdf). */
(function(){
'use strict';
const PDF='UAV_BOOK.pdf',JSON_='book.json';
const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',WORKER='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
let PAGES=[],SRC='',doc=null,total=0,sec,t4,cur=1,hl=[],zoom=false,showTxt=true,jsonP=null,docP=null,task=null,tok=0;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rx=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const norm=s=>s.normalize('NFC').toLowerCase().replace(/[\u200c\u200d]/g,'').replace(/\s+/g,' ').trim();
const skel=s=>norm(s).replace(/[\u0981-\u0983\u09BC\u09BE-\u09CD\u09D7\s.,;:()'"\u2018\u2019\u201C\u201D\u0964\-\u2013\u2014]/g,'');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function prep(j){return j.pages.map(p=>({n:p.n,t:p.t,s:norm(p.t),k:skel(p.t),w:[...new Set(p.t.split(/\s+/).map(skel).filter(w=>w.length>=3))]}))}
const isSub=(w,q)=>{let i=0;for(const c of q){if(c===w[i])i++;if(i===w.length)return true}return false};
function count(h,n){let c=0,i=0;while((i=h.indexOf(n,i))>=0){c++;i+=n.length}return c}
function searchIn(pages,q){
  const phrase=norm(q),T=phrase.split(' ').filter(Boolean);
  if(!T.length)return[];
  const score=(p,all)=>{
    let sc=0,hit=0;
    for(const t of T){const c=count(p.s,t);if(c){hit++;sc+=2*Math.min(c,5)}}
    if(all&&hit<T.length)return 0;if(!hit)return 0;
    if(T.length>1&&p.s.includes(phrase))sc+=8+count(p.s,phrase);
    return sc};
  let r=pages.map(p=>[score(p,true),p]).filter(x=>x[0]);
  if(!r.length)r=pages.map(p=>[score(p,false),p]).filter(x=>x[0]);
  if(!r.length){const k=skel(q);if(k.length>=2)r=pages.filter(p=>p.k.includes(k)).map(p=>[1,p]);
    if(!r.length&&k.length>=4)r=pages.filter(p=>p.w.some(w=>w.length>=.6*k.length&&isSub(w,k))).map(p=>[.5,p])}
  return r.sort((a,b)=>b[0]-a[0]||a[1].n-b[1].n).map(x=>x[1]);
}
function marker(terms){const t=terms.filter(Boolean).map(rx);return t.length?new RegExp('('+t.join('|')+')','gi'):null}
function markup(text,terms){
  const re=marker(terms);if(!re)return esc(text);
  return text.split(re).map((s,i)=>i%2?'<mark>'+esc(s)+'</mark>':esc(s)).join('');
}
function snippet(p,terms){
  const re=marker(terms);let i=-1;
  if(re){const m=re.exec(p.t);if(m)i=m.index}
  const a=Math.max(0,i<0?0:i-70),b=Math.min(p.t.length,a+190);
  return(a>0?'… ':'')+markup(p.t.slice(a,b).replace(/\n/g,' '),terms)+(b<p.t.length?' …':'');
}

function loadJson(){
  return jsonP||(jsonP=fetch(JSON_,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('no json');return r.json()}).then(j=>{SRC=j.source;PAGES=prep(j);total=Math.max(total,PAGES.length);return PAGES}).catch(e=>{jsonP=null;throw e}));
}
function loadPdf(){
  return docP||(docP=new Promise((ok,no)=>{
    const done=()=>{pdfjsLib.GlobalWorkerOptions.workerSrc=WORKER;pdfjsLib.getDocument(PDF).promise.then(d=>{doc=d;total=d.numPages;ok(d)},no)};
    if(window.pdfjsLib)return done();
    const s=document.createElement('script');s.src=PDFJS;s.onload=done;s.onerror=no;document.head.appendChild(s);
  }).catch(e=>{docP=null;throw e}));
}

/* ---------- viewer ---------- */
async function showPage(n,terms){
  if(terms)hl=terms;
  const my=++tok;cur=n=clamp(n,1,total||n);
  $('bvv').hidden=false;$('bvn').value=cur;$('bvt').textContent='/ '+(total||'?');$('bvE').hidden=true;
  updText();
  try{
    const d=await loadPdf();if(my!==tok)return;
    $('bvt').textContent='/ '+total;cur=clamp(cur,1,total);
    const p=await d.getPage(cur);if(my!==tok)return;
    const cv=$('bvc'),W=Math.max(300,$('bvs').clientWidth-8)*(zoom?2.3:1),v0=p.getViewport({scale:1}),r=devicePixelRatio||1,vp=p.getViewport({scale:W/v0.width*r});
    if(task){try{task.cancel()}catch(e){}}
    cv.width=vp.width;cv.height=vp.height;cv.style.width=W+'px';
    task=p.render({canvasContext:cv.getContext('2d'),viewport:vp});await task.promise;
  }catch(e){if(!(e&&e.name==='RenderingCancelledException')&&my===tok)$('bvE').hidden=false}
}
function updText(){
  const box=$('bvx');box.hidden=!showTxt;
  if(!showTxt)return;
  const p=PAGES[cur-1];
  box.innerHTML=p?'<b>Text (টেক্সট) লেখা – page (পেজ) '+cur+'</b><br>'+markup(p.t,hl).replace(/\n/g,'<br>'):'Text (টেক্সট) index (ইনডেক্স) load hoyni.';
}

/* ---------- thumbnails ---------- */
const Q=[];let busy=false,io=null;
async function pump(){
  if(busy)return;busy=true;
  while(Q.length){const b=Q.shift(),c=b.querySelector('canvas');
    try{const d=await loadPdf(),p=await d.getPage(+b.dataset.n),v0=p.getViewport({scale:1}),vp=p.getViewport({scale:130/v0.width*(devicePixelRatio||1)});
      c.width=vp.width;c.height=vp.height;await p.render({canvasContext:c.getContext('2d'),viewport:vp}).promise}catch(e){}}
  busy=false;
}
function buildGrid(){
  const g=$('bGrid');if(g.dataset.done)return;g.dataset.done=1;
  const n=total||PAGES.length;if(!n)return;
  g.innerHTML=Array.from({length:n},(_,i)=>'<button data-n="'+(i+1)+'"><canvas></canvas><span>'+(i+1)+'</span></button>').join('');
  io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);Q.push(e.target);pump()}}),{rootMargin:'300px'});
  g.querySelectorAll('button').forEach(b=>io.observe(b));
}

/* ---------- UI ---------- */
function runSearch(){
  const val=$('bq').value.trim(),res=$('bRes'),info=$('bInfo');
  if(!val){res.innerHTML='';$('bGrid').hidden=false;info.textContent=statusText();return}
  $('bGrid').hidden=true;
  const r=searchIn(PAGES,val),terms=norm(val).split(' ');
  info.textContent=r.length+' page (পেজ) pawa gelo · '+statusText();
  res.innerHTML=r.length?r.slice(0,60).map(p=>'<div class="br" data-n="'+p.n+'"><b>Page (পেজ) '+p.n+'</b><div>'+snippet(p,terms)+'</div></div>').join(''):'<div class="br">Kichu pawa jay ni. Onno shobdo diye khujo, ba English term (টার্ম) likho.</div>';
  res.dataset.terms=JSON.stringify(terms);
}
function statusText(){
  if(!PAGES.length)return 'Index (ইনডেক্স) load hocche…';
  return SRC==='ocr'?'OCR (ওসিআর) index ✓ puro Bangla (বাংলা) search':'Text-layer (টেক্সট-লেয়ার) index: Bangla (বাংলা) ektu bhanga, English (ইংলিশ) shobdo ar page-er chhobi thik. GitHub Actions chalale OCR hoye jabe.';
}
function build(){
  const st=document.createElement('style');
  st.textContent='.tabs{overflow-x:auto}.tabs button{flex:1 0 auto;white-space:nowrap}#book #bq{width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:15px Sora,system-ui,sans-serif}#book .bi{color:var(--muted);font-size:12px;margin:8px 0;line-height:1.5}#book .br{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-bottom:8px;cursor:pointer;line-height:1.55}#book .br b{color:var(--accent)}#book mark,#bvv mark{background:#ffe066;color:#000;border-radius:3px}#bGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}#bGrid button{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:4px;color:var(--ink);font:600 12px Sora,sans-serif}#bGrid canvas{width:100%;display:block;background:#fff;min-height:90px}#bvv{position:fixed;inset:0;z-index:150;background:var(--bg);display:flex;flex-direction:column;padding-top:env(safe-area-inset-top,0px)}#bvv .bar{display:flex;gap:6px;align-items:center;padding:8px;background:var(--surface);border-bottom:1px solid var(--line);flex-wrap:wrap}#bvv .bar button{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:8px;padding:7px 11px;font:600 13px Sora,sans-serif}#bvv .bar button.on{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}#bvn{width:60px;padding:7px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:600 13px Sora,sans-serif}#bvs{flex:1;overflow:auto;padding:4px;-webkit-overflow-scrolling:touch}#bvc{display:block;margin:0 auto;background:#fff}#bvx{padding:10px 12px;margin:8px;background:var(--surface);border:1px solid var(--line);border-radius:10px;line-height:1.6;font-size:14px}#bvE{padding:14px;color:var(--bad)}';
  document.head.appendChild(st);
  const tabs=document.querySelector('.tabs');t4=document.createElement('button');
  t4.setAttribute('role','tab');t4.id='t4';t4.setAttribute('aria-selected','false');t4.textContent='Book (বুক) বই';tabs.appendChild(t4);
  sec=document.createElement('section');sec.id='book';sec.hidden=true;
  sec.innerHTML='<input id="bq" type="search" placeholder="Book (বুক) search (সার্চ) খোঁজো: UAV, ড্রোন, Payload…" autocomplete="off" autocapitalize="off"><div class="bi" id="bInfo"></div><div id="bRes"></div><div id="bGrid"></div>';
  (document.getElementById('dict')||document.getElementById('learn')).after(sec);
  const v=document.createElement('div');v.id='bvv';v.hidden=true;
  v.innerHTML='<div class="bar"><button id="bvX">✕ Close (ক্লোজ)</button><button id="bvP">◀</button><input id="bvn" type="number" min="1" inputmode="numeric"><span id="bvt"></span><button id="bvN">▶</button><button id="bvZ">🔍 Zoom (জুম)</button><button id="bvT" class="on">Text (টেক্সট)</button></div><div id="bvs"><div id="bvE" hidden>PDF (পিডিএফ) khulche na. <b>UAV_BOOK.pdf</b> GitHub-e upload hoyeche ki? Internet (ইন্টারনেট) check koro. <a href="UAV_BOOK.pdf" target="_blank">PDF (পিডিএফ) shorashori khulo</a></div><canvas id="bvc"></canvas><div id="bvx"></div></div>';
  document.body.appendChild(v);
  $('bvX').onclick=()=>{v.hidden=true};
  $('bvP').onclick=()=>showPage(cur-1);$('bvN').onclick=()=>showPage(cur+1);
  $('bvn').onchange=()=>showPage(+$('bvn').value||1);
  $('bvZ').onclick=()=>{zoom=!zoom;$('bvZ').className=zoom?'on':'';showPage(cur)};
  $('bvT').onclick=()=>{showTxt=!showTxt;$('bvT').className=showTxt?'on':'';updText()};
  let timer=0;$('bq').oninput=()=>{clearTimeout(timer);timer=setTimeout(runSearch,150)};
  $('bRes').onclick=e=>{const r=e.target.closest('.br');if(r&&r.dataset.n)showPage(+r.dataset.n,JSON.parse($('bRes').dataset.terms||'[]'))};
  $('bGrid').onclick=e=>{const b=e.target.closest('button');if(b)showPage(+b.dataset.n,[])};
  addEventListener('resize',()=>{if(!v.hidden)showPage(cur)});
  ['t1','t2','t3'].forEach(id=>{const b=$(id);if(b)b.addEventListener('click',()=>{sec.hidden=true;t4.setAttribute('aria-selected','false')})});
  t4.onclick=()=>{
    ['fly','learn','dict'].forEach(id=>{const e=$(id);if(e)e.hidden=true});
    ['t1','t2','t3'].forEach(id=>{const b=$(id);if(b)b.setAttribute('aria-selected','false')});
    t4.setAttribute('aria-selected','true');sec.hidden=false;
    $('bInfo').textContent=statusText();
    loadJson().then(()=>{total=Math.max(total,PAGES.length);$('bInfo').textContent=statusText();buildGrid();if($('bq').value)runSearch()})
      .catch(()=>{$('bInfo').textContent='book.json pawa jay ni. GitHub-e upload koro (build_index.py chalao).';loadPdf().then(buildGrid).catch(()=>{})});
  };
}
window.__book={norm,skel,searchIn,prep};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
