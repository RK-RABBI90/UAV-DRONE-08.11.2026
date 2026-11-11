/* English <-> Bangla dictionary tab: built-in word list (works offline) + online lookup fallback. */
(function(){
'use strict';
const RAW=`drone|ড্রোন|চালকবিহীন উড়ন্ত যন্ত্র|n
UAV|ইউএভি|চালকবিহীন আকাশযান (Unmanned Aerial Vehicle)|n
aircraft|এয়ারক্রাফট|আকাশযান|n
airplane|এয়ারপ্লেন|বিমান|n
helicopter|হেলিকপ্টার|ঘূর্ণি-ডানার আকাশযান|n
pilot|পাইলট|চালক|n
airport|এয়ারপোর্ট|বিমানবন্দর|n
propeller|প্রোপেলার|পাখা, যা ঘুরে বাতাস ঠেলে|n
rotor|রোটর|ঘূর্ণায়মান পাখা|n
wing|উইং|ডানা|n
motor|মোটর|বিদ্যুৎচালিত ইঞ্জিন|n
engine|ইঞ্জিন|যন্ত্র, ইঞ্জিন|n
battery|ব্যাটারি|বিদ্যুৎ জমিয়ে রাখার যন্ত্র|n
charge|চার্জ|বিদ্যুৎ ভরা; দায়িত্ব|v
voltage|ভোল্টেজ|বিদ্যুৎচাপ|n
current|কারেন্ট|বিদ্যুৎ প্রবাহ; বর্তমান|n
circuit|সার্কিট|বর্তনী|n
wire|ওয়্যার|তার|n
connector|কানেক্টর|সংযোগ-যন্ত্র|n
fuel|ফুয়েল|জ্বালানি|n
frame|ফ্রেম|কাঠামো|n
payload|পেলোড|বহন করা মালামাল|n
camera|ক্যামেরা|ছবি তোলার যন্ত্র|n
gimbal|গিম্বাল|ক্যামেরা স্থির রাখার ঘূর্ণি-যন্ত্র|n
photo|ফটো|ছবি|n
video|ভিডিও|চলমান ছবি|n
record|রেকর্ড|ধারণ করা|v
live|লাইভ|সরাসরি|adj
remote|রিমোট|দূর থেকে নিয়ন্ত্রণ; দূরবর্তী|n
controller|কন্ট্রোলার|নিয়ন্ত্রক|n
joystick|জয়স্টিক|চালানোর দণ্ড|n
throttle|থ্রটল|গতি বা শক্তি নিয়ন্ত্রণ|n
yaw|ইয়ো|ডানে-বামে ঘোরা|n
pitch|পিচ|সামনে-পিছনে ঝোঁক|n
roll|রোল|পাশে কাত হওয়া|n
sensor|সেন্সর|অনুভূতি-যন্ত্র|n
GPS|জিপিএস|উপগ্রহ দিয়ে অবস্থান নির্ণয়|n
signal|সিগন্যাল|সংকেত|n
telemetry|টেলিমেট্রি|দূর থেকে তথ্য পাঠানো|n
firmware|ফার্মওয়্যার|যন্ত্রের ভেতরের সফটওয়্যার|n
calibration|ক্যালিব্রেশন|মাপ ঠিক করা|n
autopilot|অটোপাইলট|স্বয়ংক্রিয় চালনা|n
failsafe|ফেইলসেফ|বিপদে নিরাপদ থাকার ব্যবস্থা|n
safety|সেফটি|নিরাপত্তা|n
takeoff|টেকঅফ|ওপরে ওঠা, উড্ডয়ন শুরু|n
landing|ল্যান্ডিং|নামা, অবতরণ|n
land|ল্যান্ড|নামা; জমি|v
fly|ফ্লাই|ওড়া; মাছি|v
flight|ফ্লাইট|উড়ান, উড্ডয়ন|n
hover|হোভার|শূন্যে ভেসে থাকা|v
return home|রিটার্ন হোম|বাড়ি ফিরে আসা|phr
no-fly zone|নো-ফ্লাই জোন|উড়া নিষিদ্ধ এলাকা|n
mission|মিশন|অভিযান, লক্ষ্য|n
target|টার্গেট|লক্ষ্যবস্তু|n
surveillance|সার্ভেইল্যান্স|নজরদারি|n
altitude|অল্টিটিউড|উচ্চতা|n
height|হাইট|উচ্চতা|n
speed|স্পিড|গতি|n
distance|ডিসট্যান্স|দূরত্ব|n
range|রেঞ্জ|পাল্লা|n
direction|ডিরেকশন|দিক|n
lift|লিফট|ওপরে তোলার বল; তোলা|n
thrust|থ্রাস্ট|ঠেলা-বল|n
drag|ড্র্যাগ|বাতাসের বাধা; টানা|n
weight|ওয়েট|ওজন|n
gravity|গ্র্যাভিটি|মাধ্যাকর্ষণ|n
crash|ক্র্যাশ|ধাক্কা খেয়ে ভেঙে পড়া|v
collision|কলিশন|সংঘর্ষ|n
obstacle|অবস্টাকল|বাধা|n
avoid|অ্যাভয়েড|এড়িয়ে চলা|v
balloon|বেলুন|গ্যাস-ভরা ফানুস|n
bird|বার্ড|পাখি|n
wind|উইন্ড|বাতাস|n
weather|ওয়েদার|আবহাওয়া|n
cloud|ক্লাউড|মেঘ|n
rain|রেইন|বৃষ্টি|n
storm|স্টর্ম|ঝড়|n
map|ম্যাপ|মানচিত্র|n
satellite|স্যাটেলাইট|কৃত্রিম উপগ্রহ|n
north|নর্থ|উত্তর|n
south|সাউথ|দক্ষিণ|n
east|ইস্ট|পূর্ব|n
west|ওয়েস্ট|পশ্চিম|n
left|লেফট|বাম|adj
right|রাইট|ডান; সঠিক|adj
forward|ফরোয়ার্ড|সামনে|adv
backward|ব্যাকওয়ার্ড|পিছনে|adv
up|আপ|উপরে|adv
down|ডাউন|নিচে|adv
start|স্টার্ট|শুরু করা|v
stop|স্টপ|থামা|v
fast|ফাস্ট|দ্রুত|adj
slow|স্লো|ধীর|adj
high|হাই|উঁচু|adj
low|লো|নিচু|adj
near|নিয়ার|কাছে|adv
far|ফার|দূরে|adv
software|সফটওয়্যার|কম্পিউটার-প্রোগ্রাম|n
hardware|হার্ডওয়্যার|যন্ত্রাংশ|n
computer|কম্পিউটার|গণকযন্ত্র|n
phone|ফোন|দূরভাষ|n
internet|ইন্টারনেট|আন্তর্জাল|n
app|অ্যাপ|অ্যাপ্লিকেশন, মোবাইল-প্রোগ্রাম|n
game|গেম|খেলা|n
screen|স্ক্রিন|পর্দা|n
button|বাটন|বোতাম|n
settings|সেটিংস|ব্যবস্থা ঠিক করার অংশ|n
download|ডাউনলোড|নামানো|v
upload|আপলোড|ওঠানো|v
connect|কানেক্ট|সংযুক্ত করা|v
disconnect|ডিসকানেক্ট|বিচ্ছিন্ন করা|v
password|পাসওয়ার্ড|গোপন সংকেত|n
message|মেসেজ|বার্তা|n
email|ইমেইল|ইলেকট্রনিক চিঠি|n
search|সার্চ|খোঁজা|v
dictionary|ডিকশনারি|অভিধান|n
word|ওয়ার্ড|শব্দ|n
meaning|মিনিং|অর্থ|n
language|ল্যাঙ্গুয়েজ|ভাষা|n
English|ইংলিশ|ইংরেজি|n
Bangla|বাংলা|বাংলা ভাষা|n
Bangladesh|বাংলাদেশ|বাংলাদেশ|n
hello|হ্যালো|নমস্কার, আসসালামু আলাইকুম, ওহে|int
thank you|থ্যাঙ্ক ইউ|ধন্যবাদ|phr
please|প্লিজ|অনুগ্রহ করে|adv
yes|ইয়েস|হ্যাঁ|adv
no|নো|না|adv
sorry|সরি|দুঃখিত, মাফ করবেন|adj
welcome|ওয়েলকাম|স্বাগতম|int
good|গুড|ভালো|adj
bad|ব্যাড|খারাপ|adj
big|বিগ|বড়|adj
small|স্মল|ছোট|adj
new|নিউ|নতুন|adj
old|ওল্ড|পুরোনো, বয়স্ক|adj
happy|হ্যাপি|খুশি|adj
sad|স্যাড|দুঃখী, বিষণ্ণ|adj
water|ওয়াটার|পানি|n
food|ফুড|খাবার|n
house|হাউস|বাড়ি|n
school|স্কুল|বিদ্যালয়|n
book|বুক|বই|n
teacher|টিচার|শিক্ষক|n
student|স্টুডেন্ট|শিক্ষার্থী, ছাত্র|n
friend|ফ্রেন্ড|বন্ধু|n
family|ফ্যামিলি|পরিবার|n
mother|মাদার|মা|n
father|ফাদার|বাবা|n
brother|ব্রাদার|ভাই|n
sister|সিস্টার|বোন|n
man|ম্যান|পুরুষ, মানুষ|n
woman|উইম্যান|নারী|n
child|চাইল্ড|শিশু|n
people|পিপল|মানুষজন|n
day|ডে|দিন|n
night|নাইট|রাত|n
morning|মর্নিং|সকাল|n
evening|ইভনিং|সন্ধ্যা|n
today|টুডে|আজ|adv
tomorrow|টুমরো|আগামীকাল|adv
yesterday|ইয়েস্টারডে|গতকাল|adv
time|টাইম|সময়|n
year|ইয়ার|বছর|n
month|মান্থ|মাস|n
week|উইক|সপ্তাহ|n
hour|আওয়ার|ঘণ্টা|n
minute|মিনিট|মিনিট|n
second|সেকেন্ড|সেকেন্ড; দ্বিতীয়|n
sun|সান|সূর্য|n
moon|মুন|চাঁদ|n
star|স্টার|তারা|n
sky|স্কাই|আকাশ|n
earth|আর্থ|পৃথিবী|n
world|ওয়ার্ল্ড|বিশ্ব|n
river|রিভার|নদী|n
sea|সি|সমুদ্র|n
mountain|মাউন্টেন|পাহাড়|n
forest|ফরেস্ট|বন|n
tree|ট্রি|গাছ|n
flower|ফ্লাওয়ার|ফুল|n
fire|ফায়ার|আগুন|n
road|রোড|রাস্তা|n
city|সিটি|শহর|n
village|ভিলেজ|গ্রাম|n
country|কান্ট্রি|দেশ|n
flag|ফ্ল্যাগ|পতাকা|n
money|মানি|টাকা, অর্থ|n
price|প্রাইস|দাম|n
love|লাভ|ভালোবাসা|n
help|হেল্প|সাহায্য|n
work|ওয়ার্ক|কাজ|n
learn|লার্ন|শেখা|v
teach|টিচ|শেখানো|v
read|রিড|পড়া|v
write|রাইট|লেখা|v
speak|স্পিক|বলা|v
listen|লিসেন|শোনা|v
see|সি|দেখা|v
go|গো|যাওয়া|v
come|কাম|আসা|v
eat|ইট|খাওয়া|v
drink|ড্রিংক|পান করা|v
sleep|স্লিপ|ঘুমানো|v
run|রান|দৌড়ানো|v
walk|ওয়াক|হাঁটা|v
play|প্লে|খেলা|v
open|ওপেন|খোলা|v
close|ক্লোজ|বন্ধ করা|v
give|গিভ|দেওয়া|v
take|টেক|নেওয়া|v
make|মেক|বানানো|v
know|নো|জানা|v
think|থিংক|ভাবা|v
want|ওয়ান্ট|চাওয়া|v
need|নিড|দরকার হওয়া|v
like|লাইক|পছন্দ করা|v
buy|বাই|কেনা|v
sell|সেল|বিক্রি করা|v
red|রেড|লাল|adj
green|গ্রিন|সবুজ|adj
blue|ব্লু|নীল|adj
yellow|ইয়েলো|হলুদ|adj
white|হোয়াইট|সাদা|adj
black|ব্ল্যাক|কালো|adj
one|ওয়ান|এক|num
two|টু|দুই|num
three|থ্রি|তিন|num
four|ফোর|চার|num
five|ফাইভ|পাঁচ|num
six|সিক্স|ছয়|num
seven|সেভেন|সাত|num
eight|এইট|আট|num
nine|নাইন|নয়|num
ten|টেন|দশ|num`;
const W=RAW.split('\n').map(l=>{const a=l.split('|');return{w:a[0],p:a[1],m:a[2],t:a[3]}});
const isBn=s=>/[\u0980-\u09FF]/.test(s);
const norm=s=>s.trim().toLowerCase();
function search(q,letter,onlySaved){
  q=norm(q);let r=W;
  if(onlySaved)r=r.filter(e=>saved.has(e.w));
  if(letter)r=r.filter(e=>e.w[0].toLowerCase()===letter);
  if(!q)return r.slice().sort((a,b)=>a.w.localeCompare(b.w,'en',{sensitivity:'base'}));
  const sc=e=>{const w=e.w.toLowerCase();
    if(w===q||e.m.split(/[,;]\s*/).some(x=>x.replace(/\s*\(.*\)/,'')===q)||e.p===q)return 0;
    if(w.startsWith(q)||e.p.startsWith(q))return 1;
    if(w.includes(q))return 2;
    if(e.m.includes(q)||e.p.includes(q))return 3;
    return 9};
  return r.map(e=>[sc(e),e]).filter(x=>x[0]<9).sort((a,b)=>a[0]-b[0]||a[1].w.localeCompare(b[1].w)).map(x=>x[1]);
}
let saved=new Set();
try{saved=new Set(JSON.parse(localStorage.getItem('uavDictSaved')||'[]'))}catch(e){}
const persist=()=>{try{localStorage.setItem('uavDictSaved',JSON.stringify([...saved]))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function speak(w){try{const u=new SpeechSynthesisUtterance(w);u.lang='en-US';u.rate=.85;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}

let sec,q,list,letters,savedBtn,letter='',onlySaved=false,timer=0;
function card(e){
  return '<div class="dc"><div class="dh"><b>'+esc(e.w)+'</b> <span>('+esc(e.p)+')</span> <em>'+esc(e.t)+'</em></div><div class="dm">'+esc(e.m)+'</div>'
   +'<div class="da"><button data-s="'+esc(e.w)+'" aria-label="Listen">🔊 Listen (লিসেন) শোনো</button><button data-v="'+esc(e.w)+'" aria-pressed="'+saved.has(e.w)+'">'+(saved.has(e.w)?'⭐ Saved':'☆ Save (সেভ)')+'</button></div></div>';
}
function render(){
  const val=q.value,r=search(val,letter,onlySaved);
  let h=r.slice(0,60).map(card).join('');
  if(!r.length)h='<div class="dc"><div class="dm">'+(onlySaved?'Kono saved (সেভড) shobdo nei.':'Built-in (বিল্ট-ইন) list-e pawa jay ni.')+'</div></div>';
  if(val.trim()&&!onlySaved)h+='<div class="dc"><button class="dbtn" id="dOn">🌐 Online (অনলাইন) e khujo (খুঁজো): '+esc(val.trim())+'</button><div id="dOut"></div></div>';
  list.innerHTML=h;
  $c('dCount').textContent=r.length+' words (ওয়ার্ডস) শব্দ';
  savedBtn.textContent='⭐ Saved (সেভড) ('+saved.size+')';savedBtn.setAttribute('aria-pressed',onlySaved);
}
const $c=id=>document.getElementById(id);
async function online(text){
  const out=$c('dOut');out.innerHTML='<p class="dm">Loading (লোডিং)…</p>';
  const bn=isBn(text);let h='';
  try{const r=await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair='+(bn?'bn|en':'en|bn'));const j=await r.json();const t=j.responseData&&j.responseData.translatedText;
    if(t)h+='<div class="dm"><b>Translate (ট্রান্সলেট) অনুবাদ:</b> '+esc(t)+'</div>'}catch(e){}
  if(!bn&&/^[a-z' -]+$/i.test(text.trim())){
    try{const r=await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(text.trim().toLowerCase()));
      if(r.ok){const j=await r.json(),e=j[0],ph=e.phonetic||((e.phonetics||[]).find(p=>p.text)||{}).text||'';
        h+='<div class="dm"><b>Meaning (মিনিং) English-e:</b> '+(ph?esc(ph)+'<br>':'');
        (e.meanings||[]).slice(0,3).forEach(m=>{const d=(m.definitions||[])[0];if(d)h+='• <em>'+esc(m.partOfSpeech)+'</em>: '+esc(d.definition)+(d.example?'<br><small>e.g. '+esc(d.example)+'</small>':'')+'<br>'});
        h+='</div>'}}catch(e){}}
  out.innerHTML=h||'<p class="dm">Online (অনলাইন) result (রেজাল্ট) pawa jay ni. Internet (ইন্টারনেট) check koro.</p>';
}
function build(){
  const st=document.createElement('style');
  st.textContent='.tabs button{font-size:12px;padding:9px 4px}#dict .dc{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-bottom:8px}#dict .dh b{font-size:17px}#dict .dh span{color:var(--accent);font-weight:600}#dict .dh em{color:var(--muted);font-size:12px}#dict .dm{margin-top:4px;line-height:1.55}#dict .da{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}#dict .da button,#dict .dbtn,#dict .lt button{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:8px;padding:6px 10px;font:600 12px Sora,system-ui,sans-serif;cursor:pointer}#dict .da button[aria-pressed="true"],#dict .lt button[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}#dict .lt{display:flex;gap:4px;overflow-x:auto;padding:4px 0 8px}#dict .lt button{min-width:32px}#dict #dq{width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:15px Sora,system-ui,sans-serif}#dict .dtop{display:flex;justify-content:space-between;align-items:center;margin:8px 0;color:var(--muted);font-size:12px}';
  document.head.appendChild(st);
  const tabs=document.querySelector('.tabs'),t3=document.createElement('button');
  t3.setAttribute('role','tab');t3.id='t3';t3.setAttribute('aria-selected','false');t3.textContent='Dictionary (ডিকশনারি) অভিধান';tabs.appendChild(t3);
  sec=document.createElement('section');sec.id='dict';sec.hidden=true;
  sec.innerHTML='<input id="dq" type="search" placeholder="Search (সার্চ) খোঁজো: drone, পানি, battery…" aria-label="Dictionary search" autocomplete="off" autocapitalize="off"><div class="lt" id="dLet"></div><div class="dtop"><span id="dCount"></span><button id="dSaved" class="dbtn" style="border:1px solid var(--line);border-radius:8px;padding:6px 10px;background:var(--surface);color:var(--ink);font:600 12px Sora,sans-serif"></button></div><div id="dList"></div>';
  document.getElementById('learn').after(sec);
  q=$c('dq');list=$c('dList');letters=$c('dLet');savedBtn=$c('dSaved');
  letters.innerHTML=['All'].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')).map(c=>'<button data-l="'+(c==='All'?'':c.toLowerCase())+'" aria-pressed="'+(c==='All')+'">'+c+'</button>').join('');
  letters.onclick=e=>{const b=e.target.closest('button');if(!b)return;letter=b.dataset.l;[...letters.children].forEach(x=>x.setAttribute('aria-pressed',x===b));render()};
  q.oninput=()=>{clearTimeout(timer);timer=setTimeout(render,120)};
  savedBtn.onclick=()=>{onlySaved=!onlySaved;render()};
  list.onclick=e=>{
    const s=e.target.closest('[data-s]');if(s){speak(s.dataset.s);return}
    const v=e.target.closest('[data-v]');if(v){const w=v.dataset.v;saved.has(w)?saved.delete(w):saved.add(w);persist();render();return}
    if(e.target.id==='dOn')online(q.value.trim());
  };
  const oldTab=window.tab;
  window.tab=function(n){sec.hidden=true;t3.setAttribute('aria-selected','false');oldTab(n)};
  t3.onclick=()=>{$c('fly').hidden=true;$c('learn').hidden=true;$c('t1').setAttribute('aria-selected','false');$c('t2').setAttribute('aria-selected','false');t3.setAttribute('aria-selected','true');sec.hidden=false;render()};
}
window.__dict={search,W};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
