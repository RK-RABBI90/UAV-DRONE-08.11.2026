/* UAV/DRONE 3D game: chase-camera drone over real Bangladesh satellite imagery (Esri World Imagery). */
(function(){
'use strict';
const TILE='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/';
const D2R=Math.PI/180;
const LAND=[
['Shaheed Minar','শহীদ মিনার',23.7313,90.3966],['National Parliament','জাতীয় সংসদ ভবন',23.7625,90.3780],
['Lalbagh Fort','লালবাগ কেল্লা',23.7190,90.3880],['Ahsan Manzil','আহসান মঞ্জিল',23.7086,90.4060],
['Hatirjheel','হাতিরঝিল',23.7665,90.4000],['Padma Bridge','পদ্মা সেতু',23.4430,90.2640],
['Jamuna Bridge','যমুনা সেতু',24.3989,89.7727],['Sonargaon','সোনারগাঁ',23.6500,90.5970],
['Patenga Beach','পতেঙ্গা সৈকত',22.2340,91.7865],["Cox's Bazar Beach",'কক্সবাজার সৈকত',21.4320,91.9760],
["Saint Martin's Island",'সেন্ট মার্টিন দ্বীপ',20.6270,92.3220],['Shahjalal Dargah','শাহজালাল দরগাহ',24.8990,91.8687],
['Srimangal Tea Garden','শ্রীমঙ্গল চা-বাগান',24.3065,91.7296],['Sixty Dome Mosque','ষাট গম্বুজ মসজিদ',22.6741,89.7427],
['Paharpur Vihara','পাহাড়পুর বিহার',25.0310,88.9760],['Kuakata Beach','কুয়াকাটা সৈকত',21.8185,90.1190],
['Kaptai Lake','কাপ্তাই হ্রদ',22.5000,92.2000],['Sundarbans (Karamjal)','সুন্দরবন (করমজল)',22.2840,89.6240]];
const CITY=[['Dhaka','ঢাকা',23.81,90.41],['Chattogram','চট্টগ্রাম',22.36,91.83],['Sylhet','সিলেট',24.90,91.87],
['Rajshahi','রাজশাহী',24.37,88.60],['Khulna','খুলনা',22.82,89.56],['Barishal','বরিশাল',22.70,90.37],
['Rangpur','রংপুর',25.74,89.25],['Mymensingh','ময়মনসিংহ',24.75,90.40],["Cox's Bazar",'কক্সবাজার',21.43,91.98]];
const LODS=[{z:10,r:1,ro:-4},{z:13,r:1,ro:-3},{z:15,r:2,ro:-2},{z:17,r:2,ro:-1}];
const t2lon=(x,z)=>x/2**z*360-180, t2lat=(y,z)=>Math.atan(Math.sinh(Math.PI-2*Math.PI*y/2**z))/D2R;
const lon2t=(lo,z)=>Math.floor((lo+180)/360*2**z), lat2t=(la,z)=>Math.floor((1-Math.log(Math.tan(la*D2R)+1/Math.cos(la*D2R))/Math.PI)/2*2**z);
const S={lat0:23.81,lon0:90.41,mx:102000,my:110574};
const setO=(la,lo)=>{S.lat0=la;S.lon0=lo;S.mx=111320*Math.cos(la*D2R)};
const ll2m=(la,lo)=>[(lo-S.lon0)*S.mx,-(la-S.lat0)*S.my];
const m2ll=(x,z)=>[S.lat0-z/S.my,S.lon0+x/S.mx];
const D={x:0,y:0,z:0,h:0,vf:0,vr:0,vy:0,spin:0};
const G={coins:0,done:new Set(),mis:null,remote:true,sensor:true,view:'chase',bat:100};
let root,E={},R,scene,camera,loader,drone,rotors=[],world,balloons=[],birds=[],beacons=[],tiles=new Map(),running=false,last=0,tAcc=0,photoReq=false,toastT=0,warnT=0,AC;
const KEY={};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a);
const beep=(f,d)=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),v=AC.createGain();o.frequency.value=f;v.gain.value=.06;o.connect(v);v.connect(AC.destination);o.start();o.stop(AC.currentTime+(d||.1))}catch(e){}};

const CSS=`#g3{position:fixed;inset:0;z-index:200;background:linear-gradient(#3f86d6 0%,#a9cdee 45%,#d3e7f7 55%,#d3e7f7 100%);touch-action:none;user-select:none;-webkit-user-select:none;font-family:Sora,system-ui,sans-serif;color:#fff}
#g3[hidden],#g3 [hidden]{display:none!important}
#g3c{position:absolute;inset:0;width:100%;height:100%}
#g3 .hud{position:absolute;left:calc(10px + env(safe-area-inset-left,0px));top:calc(8px + env(safe-area-inset-top,0px));font:700 14px Sora,system-ui,sans-serif;text-shadow:0 1px 3px #000;background:rgba(0,0,0,.38);padding:5px 10px;border-radius:8px}
#g3 .top{position:absolute;right:calc(10px + env(safe-area-inset-right,0px));top:calc(8px + env(safe-area-inset-top,0px));display:flex;gap:6px}
#g3 .top button,#g3 .pb{border:0;border-radius:10px;background:rgba(40,40,45,.72);color:#fff;font:600 10px Sora,system-ui,sans-serif;padding:6px 8px;min-width:70px;display:flex;flex-direction:column;align-items:center;gap:2px}
#g3 .top button b{font-size:18px;font-weight:400}
#g3 .coin{position:absolute;right:calc(12px + env(safe-area-inset-right,0px));top:calc(62px + env(safe-area-inset-top,0px));background:rgba(40,40,45,.72);border-radius:10px;padding:3px 12px;font:700 14px Sora,sans-serif}
#g3 .mc{position:absolute;right:calc(10px + env(safe-area-inset-right,0px));top:calc(94px + env(safe-area-inset-top,0px));max-width:230px;background:rgba(40,40,45,.72);border-radius:10px;padding:6px 10px;font:600 12px Sora,sans-serif}
#g3 .mc i{display:inline-block;font-style:normal;margin-left:6px;color:#50e6ff;font-size:16px}
#g3 .st{position:absolute;bottom:calc(22px + env(safe-area-inset-bottom,0px));width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.18);border:3px solid rgba(255,255,255,.6);touch-action:none}
#g3 .st i{position:absolute;left:50%;top:50%;width:62px;height:62px;margin:-31px 0 0 -31px;border-radius:50%;background:rgba(255,255,255,.65)}
#g3L{left:calc(24px + env(safe-area-inset-left,0px))}#g3R{right:calc(24px + env(safe-area-inset-right,0px))}
#g3 .rb{position:absolute;bottom:calc(190px + env(safe-area-inset-bottom,0px));width:60px;height:60px;border-radius:50%;border:4px solid #fff;color:#fff;font-size:24px}
#g3View{left:calc(40px + env(safe-area-inset-left,0px));background:rgba(60,60,66,.8)}#g3Cam{right:calc(40px + env(safe-area-inset-right,0px));background:#e11}
#g3 .msg{position:absolute;left:50%;top:22%;transform:translateX(-50%);background:rgba(0,0,0,.65);padding:8px 16px;border-radius:12px;font:700 15px Sora,sans-serif;text-align:center;max-width:70%}
#g3 .warn{position:absolute;left:50%;bottom:30%;transform:translateX(-50%);color:#ff6b6b;font:700 16px Sora,sans-serif;text-shadow:0 1px 3px #000}
#g3 .vg{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 0 0 rgba(255,0,0,0)}
#g3 .cr{position:absolute;left:50%;bottom:2px;transform:translateX(-50%);font:10px Sora,sans-serif;color:rgba(255,255,255,.85);text-shadow:0 1px 2px #000;white-space:nowrap}
#g3 .ph{position:absolute;left:calc(14px + env(safe-area-inset-left,0px));top:60px;width:120px;border:3px solid #fff;border-radius:6px;overflow:hidden}
#g3 .ph img{width:100%;display:block}
#g3 .fl{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .35s}
#g3 .rot{position:absolute;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;font:700 18px Sora,sans-serif;text-align:center;padding:20px}
#g3 .panel{position:absolute;inset:calc(8px + env(safe-area-inset-top,0px)) 8px 8px;background:rgba(8,18,28,.95);border-radius:14px;padding:10px;display:flex;flex-direction:column;gap:8px;overflow:hidden;font-size:13px}
#g3 .panel .row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
#g3 .panel button{border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.1);color:#fff;border-radius:8px;padding:7px 10px;font:600 12px Sora,sans-serif}
#g3 .panel button.on{background:#1f5fff;border-color:#1f5fff}
#g3 .panel canvas{flex:1;min-height:0;width:100%;touch-action:none;border-radius:8px;background:#0b1a26}
#g3 .list{overflow:auto;display:flex;flex-direction:column;gap:6px}
#g3 .li{display:flex;gap:6px;align-items:center;justify-content:space-between;background:rgba(255,255,255,.08);padding:6px 8px;border-radius:8px}`;

const HTML=`<canvas id="g3c"></canvas><div class="vg" id="g3vg"></div>
<div class="hud" id="g3h"></div>
<div class="top"><button id="g3Map"><b>🗺</b>Maps (ম্যাপস) মানচিত্র</button><button id="g3Mis"><b>📋</b>Missions (মিশনস) লক্ষ্য</button><button id="g3Set"><b>⚙</b>Settings (সেটিংস)</button></div>
<div class="coin" id="g3co"></div><div class="mc" id="g3mc"></div>
<button class="rb" id="g3View">⟳</button><button class="rb" id="g3Cam">📷</button>
<div class="st" id="g3L"><i></i></div><div class="st" id="g3R"><i></i></div>
<div class="msg" id="g3m" hidden></div><div class="warn" id="g3w" hidden></div>
<div class="cr">Imagery © Esri, Maxar, Earthstar Geographics · Satellite (স্যাটেলাইট) ছবি</div>
<a class="ph" id="g3p" download="UAV-DRONE-photo.jpg" hidden><img alt="photo"></a><div class="fl" id="g3f"></div>
<div class="rot" id="g3r" hidden>Phone (ফোন) ghurao (ঘুরাও) – landscape (ল্যান্ডস্কেপ) আড়াআড়ি</div>
<div class="panel" id="g3map" hidden>
 <div class="row" id="g3chips"></div>
 <canvas id="g3mc2"></canvas>
 <div class="row"><button id="g3z-">−</button><button id="g3z+">+</button><span id="g3ll" style="flex:1">Map (ম্যাপ)-e tap (ট্যাপ) koro</span><button id="g3Fly" class="on">Fly here (ফ্লাই হিয়ার) এখানে ওড়ো</button><button id="g3Mx">✕ Close (ক্লোজ) বন্ধ</button></div></div>
<div class="panel" id="g3mis" hidden><div class="row"><b style="flex:1">Missions (মিশনস) লক্ষ্য · Take photo (টেক ফটো) ছবি তোলো</b><button id="g3Isx">✕ Close (ক্লোজ) বন্ধ</button></div><div class="list" id="g3ml"></div></div>
<div class="panel" id="g3set" hidden><div class="row"><b style="flex:1">Settings (সেটিংস) সেটিং</b><button id="g3Stx">✕ Close (ক্লোজ) বন্ধ</button></div>
 <div class="row"><button id="g3Rem"></button><button id="g3Sen"></button><button id="g3Vw"></button><button id="g3Ex">Exit game (এক্সিট গেম) বের হও</button></div>
 <div style="opacity:.8;line-height:1.5">Remote (রিমোট) OFF: drone hover (হোভার) kore thake. Sensor (সেন্সর) ON: pakhi (পাখি) ar balloon (বেলুন)-er kache gele alert (অ্যালার্ট) ar auto brake (অটো ব্রেক).<br>Satellite (স্যাটেলাইট) ছবি internet (ইন্টারনেট) theke ashe.</div></div>`;

function stick(el){
  const s={x:0,y:0},k=el.querySelector('i');let id=null;
  const mv=e=>{const r=el.getBoundingClientRect(),R=r.width/2-18;let dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);const d=Math.hypot(dx,dy);if(d>R){dx*=R/d;dy*=R/d}s.x=dx/R;s.y=-dy/R;k.style.transform=`translate(${dx}px,${dy}px)`};
  const end=()=>{id=null;s.x=s.y=0;k.style.transform=''};
  el.addEventListener('pointerdown',e=>{id=e.pointerId;el.setPointerCapture(id);mv(e)});
  el.addEventListener('pointermove',e=>{if(e.pointerId===id)mv(e)});
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
  return s;
}
let SL,SR;
function build(){
  if(root)return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  root=document.createElement('div');root.id='g3';root.hidden=true;root.innerHTML=HTML;document.body.appendChild(root);
  for(const el of root.querySelectorAll('[id]'))E[el.id]=el;
  SL=stick(E.g3L);SR=stick(E.g3R);
  E.g3Map.onclick=()=>{E.g3map.hidden=false;mapOpen()};E.g3Mx.onclick=()=>{E.g3map.hidden=true};
  E.g3Mis.onclick=()=>{E.g3mis.hidden=false;listMis()};E.g3Isx.onclick=()=>{E.g3mis.hidden=true};
  E.g3Set.onclick=()=>{E.g3set.hidden=false;setLabels()};E.g3Stx.onclick=()=>{E.g3set.hidden=true};
  E.g3Rem.onclick=()=>{G.remote=!G.remote;setLabels()};E.g3Sen.onclick=()=>{G.sensor=!G.sensor;setLabels()};
  E.g3Vw.onclick=E.g3View.onclick=()=>{G.view=G.view==='chase'?'fpv':'chase';setLabels();toast(G.view==='chase'?'Chase (চেজ) view (ভিউ) পিছন থেকে':'FPV (এফপিভি) view (ভিউ) ড্রোনের চোখ')};
  E.g3Ex.onclick=close3D;E.g3Cam.onclick=()=>{photoReq=true};
  E.g3Fly.onclick=()=>{if(MS.pick){teleport(MS.pick.la,MS.pick.lo);E.g3map.hidden=true}else toast('Map (ম্যাপ)-e age tap (ট্যাপ) koro')};
  E['g3z-'].onclick=()=>{MS.z=clamp(MS.z-1,4,13);mapDraw()};E['g3z+'].onclick=()=>{MS.z=clamp(MS.z+1,4,13);mapDraw()};
  CITY.forEach(c=>{const b=document.createElement('button');b.textContent=c[0]+' ('+c[1]+')';b.onclick=()=>{MS.la=c[2];MS.lo=c[3];MS.z=Math.max(MS.z,9);MS.pick={la:c[2],lo:c[3]};mapDraw()};E.g3chips.appendChild(b)});
  mapInput();
  addEventListener('keydown',e=>{KEY[e.key.toLowerCase()]=1});addEventListener('keyup',e=>{KEY[e.key.toLowerCase()]=0});
  addEventListener('resize',()=>{if(!root.hidden)resize()});
  document.addEventListener('fullscreenchange',()=>{if(!root.hidden&&!document.fullscreenElement)close3D()});
}
function setLabels(){
  E.g3Rem.textContent='Remote (রিমোট) '+(G.remote?'ON চালু':'OFF বন্ধ');E.g3Rem.className=G.remote?'on':'';
  E.g3Sen.textContent='Sensor (সেন্সর) '+(G.sensor?'ON চালু':'OFF বন্ধ');E.g3Sen.className=G.sensor?'on':'';
  E.g3Vw.textContent='View (ভিউ) '+(G.view==='chase'?'Chase (চেজ) পিছন':'FPV (এফপিভি) চোখ');
  E.g3L.style.visibility=E.g3R.style.visibility=G.remote?'visible':'hidden';
}
function toast(t,ms){E.g3m.textContent=t;E.g3m.hidden=false;toastT=ms||2.6}

/* ---------- three.js scene ---------- */
function init3D(){
  if(R)return true;
  if(!window.THREE){return false}
  R=new THREE.WebGLRenderer({canvas:E.g3c,antialias:true,alpha:true});
  R.setPixelRatio(Math.min(devicePixelRatio||1,2));
  scene=new THREE.Scene();scene.fog=new THREE.Fog(0xd3e7f7,1500,30000);
  camera=new THREE.PerspectiveCamera(65,1,.5,200000);
  scene.add(new THREE.HemisphereLight(0xffffff,0x7a8a99,1.05));
  const sun=new THREE.DirectionalLight(0xffffff,.6);sun.position.set(50,100,30);scene.add(sun);
  loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');
  world=new THREE.Group();scene.add(world);
  drone=buildDrone();scene.add(drone);
  for(let i=0;i<10;i++){const b=buildBalloon([0xe53935,0xfdd835,0x1e88e5,0x43a047,0xfb8c00][i%5]);balloons.push(b);scene.add(b)}
  for(let i=0;i<14;i++){const b=buildBird();birds.push(b);scene.add(b)}
  return true;
}
function buildDrone(){
  const g=new THREE.Group(),W=new THREE.MeshLambertMaterial({color:0xf4f6f8}),K=new THREE.MeshLambertMaterial({color:0x20262e}),B=new THREE.MeshLambertMaterial({color:0x1f5fff});
  const body=new THREE.Mesh(new THREE.BoxGeometry(1.2,.4,1.4),W);g.add(body);
  const top=new THREE.Mesh(new THREE.BoxGeometry(.7,.18,.8),B);top.position.y=.26;g.add(top);
  const gim=new THREE.Mesh(new THREE.SphereGeometry(.24,12,10),K);gim.position.set(0,-.3,-.55);g.add(gim);
  const lens=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),new THREE.MeshBasicMaterial({color:0x50e6ff}));lens.position.set(0,-.3,-.74);g.add(lens);
  [[1,1],[-1,1],[1,-1],[-1,-1]].forEach((p,i)=>{
    const arm=new THREE.Mesh(new THREE.BoxGeometry(1.7,.1,.16),W);arm.position.set(p[0]*.7,.05,p[1]*.7);arm.rotation.y=p[0]*p[1]*Math.PI/4*-1;g.add(arm);
    const mot=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.2,10),K);mot.position.set(p[0]*1.3,.15,p[1]*1.3);g.add(mot);
    const ro=new THREE.Group();ro.position.set(p[0]*1.3,.3,p[1]*1.3);
    const disc=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.015,18),new THREE.MeshBasicMaterial({color:0xdddddd,transparent:true,opacity:.28,fog:false}));ro.add(disc);
    const bl=new THREE.Mesh(new THREE.BoxGeometry(1.2,.02,.1),K);ro.add(bl);g.add(ro);rotors.push(ro);
    const led=new THREE.Mesh(new THREE.SphereGeometry(.07,6,6),new THREE.MeshBasicMaterial({color:p[1]<0?0xff3333:0x33ff77}));led.position.set(p[0]*1.3,0,p[1]*1.3);g.add(led);
  });
  [-.45,.45].forEach(x=>{const l=new THREE.Mesh(new THREE.BoxGeometry(.06,.42,.06),K);l.position.set(x,-.3,.3);g.add(l)});
  g.scale.setScalar(1.5);g.userData.body=body;return g;
}
function buildBalloon(col){
  const g=new THREE.Group();
  const s=new THREE.Mesh(new THREE.SphereGeometry(8,16,12),new THREE.MeshLambertMaterial({color:col}));s.scale.y=1.25;g.add(s);
  const st=new THREE.Mesh(new THREE.SphereGeometry(8.05,16,12,0,6.3,1.2,.5),new THREE.MeshLambertMaterial({color:0xffffff}));st.scale.y=1.25;g.add(st);
  const bk=new THREE.Mesh(new THREE.BoxGeometry(2.6,2,2.6),new THREE.MeshLambertMaterial({color:0x7b4a22}));bk.position.y=-13;g.add(bk);
  g.userData={vx:rnd(-1.5,1.5),vz:rnd(-1.5,1.5),r:10,ph:Math.random()*6};return g;
}
function buildBird(){
  const g=new THREE.Group(),m=new THREE.MeshBasicMaterial({color:Math.random()<.5?0xffffff:0x222222,side:THREE.DoubleSide,fog:false});
  const a=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.6),m),b=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.6),m);
  a.geometry.translate(-.9,0,0);b.geometry.translate(.9,0,0);a.rotation.x=b.rotation.x=-Math.PI/2;g.add(a,b);
  g.userData={a,b,ang:Math.random()*6.28,cx:0,cz:0,rad:rnd(30,120),alt:rnd(12,60),sp:rnd(5,9),ph:Math.random()*6};return g;
}
function placeEntities(){
  balloons.forEach(b=>{b.position.set(rnd(-600,600),rnd(25,95),rnd(-600,600));if(Math.hypot(b.position.x,b.position.z)<60)b.position.x+=150});
  birds.forEach(b=>{const u=b.userData;u.cx=rnd(-250,250);u.cz=rnd(-250,250)});
}
function clearTiles(){tiles.forEach(t=>{if(t.mesh){world.remove(t.mesh);t.mesh.material.map.dispose();t.mesh.material.dispose();t.mesh.geometry.dispose()}});tiles.clear()}
function addTile(L,tx,ty,k){
  const t={z:L.z,mesh:null};tiles.set(k,t);
  loader.load(TILE+L.z+'/'+ty+'/'+tx,tex=>{
    if(tiles.get(k)!==t){tex.dispose();return}
    const a=ll2m(t2lat(ty,L.z),t2lon(tx,L.z)),b=ll2m(t2lat(ty+1,L.z),t2lon(tx+1,L.z));
    tex.anisotropy=4;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(b[0]-a[0],b[1]-a[1]),new THREE.MeshBasicMaterial({map:tex,depthWrite:false,depthTest:false}));
    m.rotation.x=-Math.PI/2;m.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);m.renderOrder=L.ro;world.add(m);t.mesh=m;
  },undefined,()=>{tiles.delete(k)});
}
function updateTiles(){
  const p=m2ll(D.x,D.z);
  for(const L of LODS){
    const cx=lon2t(p[1],L.z),cy=lat2t(p[0],L.z),need=new Set();
    for(let dx=-L.r;dx<=L.r;dx++)for(let dy=-L.r;dy<=L.r;dy++){const k=L.z+'/'+(cx+dx)+'/'+(cy+dy);need.add(k);if(!tiles.has(k))addTile(L,cx+dx,cy+dy,k)}
    tiles.forEach((t,k)=>{if(t.z===L.z&&!need.has(k)){if(t.mesh){world.remove(t.mesh);t.mesh.material.map.dispose();t.mesh.material.dispose();t.mesh.geometry.dispose()}tiles.delete(k)}});
  }
}
function label(txt){
  const c=document.createElement('canvas');c.width=320;c.height=64;const g=c.getContext('2d');
  g.fillStyle='rgba(0,0,0,.65)';g.fillRect(0,0,320,64);g.fillStyle='#ffd23f';g.font='700 24px sans-serif';g.textAlign='center';g.fillText(txt,160,40);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),sizeAttenuation:false,depthTest:false,fog:false,transparent:true}));sp.scale.set(.34,.068,1);return sp;
}
function buildBeacons(){
  beacons.forEach(b=>{scene.remove(b.g)});beacons=[];
  LAND.forEach((l,i)=>{
    const p=ll2m(l[2],l[3]);if(Math.hypot(p[0],p[1])>60000)return;
    const g=new THREE.Group();
    const cyl=new THREE.Mesh(new THREE.CylinderGeometry(5,5,220,12,1,true),new THREE.MeshBasicMaterial({color:G.done.has(i)?0x44dd66:0xffd23f,transparent:true,opacity:.4,fog:false,depthWrite:false,side:THREE.DoubleSide}));cyl.position.y=110;g.add(cyl);
    const sp=label(l[0]);sp.position.y=235;g.add(sp);g.position.set(p[0],0,p[1]);scene.add(g);beacons.push({g,i,x:p[0],z:p[1]});
  });
}
function resize(){
  const w=innerWidth,h=innerHeight;R&&R.setSize(w,h,false);if(camera){camera.aspect=w/h;camera.updateProjectionMatrix()}
  E.g3r.hidden=w>=h;
}

/* ---------- missions ---------- */
function landDist(i){const p=ll2m(LAND[i][2],LAND[i][3]);return Math.hypot(p[0]-D.x,p[1]-D.z)}
function pickMission(){let b=null,bd=1e12;LAND.forEach((l,i)=>{if(G.done.has(i))return;const d=landDist(i);if(d<bd){bd=d;b=i}});G.mis=b}
function missionText(){
  if(G.mis==null)return'All (অল) missions (মিশনস) complete (কমপ্লিট)!';
  const l=LAND[G.mis],d=landDist(G.mis);
  return 'Take photo (টেক ফটো) ছবি তোলো<br>'+l[0]+' ('+l[1]+') '+(G.done.has(G.mis)?1:0)+'/1<br>'+(d>=1000?(d/1000).toFixed(1)+' km':Math.round(d)+' m');
}
function listMis(){
  E.g3ml.innerHTML='';
  LAND.forEach((l,i)=>{
    const d=landDist(i),row=document.createElement('div');row.className='li';
    row.innerHTML='<span>'+(G.done.has(i)?'✅ ':'')+l[0]+' ('+l[1]+') · '+(d>=1000?(d/1000).toFixed(1)+' km':Math.round(d)+' m')+'</span>';
    const a=document.createElement('button');a.textContent='Mission (মিশন)';a.onclick=()=>{G.mis=i;E.g3mis.hidden=true;toast('Mission (মিশন): '+l[0])};
    const b=document.createElement('button');b.className='on';b.textContent='Go (গো) যাও';b.onclick=()=>{G.mis=i;teleport(l[2]-.0036,l[3]);E.g3mis.hidden=true};
    row.append(a,b);E.g3ml.appendChild(row);
  });
}
function takePhoto(){
  E.g3f.style.opacity=1;setTimeout(()=>{E.g3f.style.opacity=0},120);beep(900,.08);
  try{const u=E.g3c.toDataURL('image/jpeg',.85);E.g3p.href=u;E.g3p.firstChild.src=u;E.g3p.hidden=false;setTimeout(()=>{E.g3p.hidden=true},6000)}catch(e){}
  if(G.mis!=null&&!G.done.has(G.mis)&&landDist(G.mis)<220){
    G.done.add(G.mis);G.coins+=50;beep(1200,.25);toast('Photo (ফটো) taken! +50 coins (কয়েন) 🪙 — '+LAND[G.mis][0]);buildBeacons();pickMission();
  }else if(G.mis!=null)toast('Photo (ফটো) taken. Target (টার্গেট) ar kache jao (যাও): '+Math.round(landDist(G.mis))+' m');
}

/* ---------- teleport / start ---------- */
function teleport(la,lo){
  setO(la,lo);clearTiles();D.x=D.y=D.z=D.h=D.vf=D.vr=D.vy=0;
  placeEntities();buildBeacons();if(G.mis==null||G.done.has(G.mis))pickMission();
  tAcc=9;toast('Location (লোকেশন): '+la.toFixed(3)+'°N '+lo.toFixed(3)+'°E',3);
}
async function open3D(la,lo){
  build();
  if(typeof real!=='undefined'&&real){alert('Real drone (রিয়াল ড্রোন) connected — age Disconnect koro.');return}
  root.hidden=false;
  try{const el=root,p=(el.requestFullscreen||el.webkitRequestFullscreen).call(el);p&&p.catch&&p.catch(()=>{})}catch(e){}
  try{screen.orientation.lock('landscape').catch(()=>{})}catch(e){}
  if(!init3D()){toast('3D (থ্রিডি) engine (ইঞ্জিন) load hoyni. Internet (ইন্টারনেট) check koro.',6);return}
  setLabels();resize();teleport(la||23.81,lo||90.41);
  if(!running){running=true;last=performance.now();requestAnimationFrame(loop)}
}
function close3D(){
  running=false;root.hidden=true;
  try{screen.orientation.unlock()}catch(e){}
  try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}
}

/* ---------- main loop ---------- */
function loop(now){
  if(!running)return;
  const dt=Math.min(.05,(now-last)/1000);last=now;
  step(dt);render(dt);requestAnimationFrame(loop);
}
function step(dt){
  let thr=0,yaw=0,pit=0,rol=0;
  if(G.remote){
    thr=SL.y+(KEY.w?1:0)-(KEY.s?1:0);yaw=SL.x+(KEY.d?1:0)-(KEY.a?1:0);
    pit=SR.y+(KEY.arrowup?1:0)-(KEY.arrowdown?1:0);rol=SR.x+(KEY.arrowright?1:0)-(KEY.arrowleft?1:0);
    thr=clamp(thr,-1,1);yaw=clamp(yaw,-1,1);pit=clamp(pit,-1,1);rol=clamp(rol,-1,1);
  }
  const k=Math.min(1,dt*2.6),air=D.y>.3;
  D.h+=yaw*1.5*dt;
  D.vf+=((air?pit*12:0)-D.vf)*k;D.vr+=((air?rol*12:0)-D.vr)*k;D.vy+=(thr*7-D.vy)*Math.min(1,dt*3);
  const sh=Math.sin(D.h),ch=Math.cos(D.h);
  D.x+=(sh*D.vf+ch*D.vr)*dt;D.z+=(-ch*D.vf+sh*D.vr)*dt;
  D.y=clamp(D.y+D.vy*dt,0,150);if(D.y<=0&&D.vy<0)D.vy=0;
  D.spin=(D.y>.1||thr>.1)?1:Math.max(0,D.spin-dt*2);
  G.bat=Math.max(0,G.bat-(D.y>.1?.02:0)*dt*3);
  // entities
  balloons.forEach(b=>{const u=b.userData;b.position.x+=u.vx*dt;b.position.z+=u.vz*dt;b.position.y+=Math.sin(u.ph+=dt*.4)*.04;
    if(Math.hypot(b.position.x-D.x,b.position.z-D.z)>900){b.position.set(D.x+rnd(-500,500),rnd(25,95),D.z+rnd(-500,500))}});
  birds.forEach(b=>{const u=b.userData;u.ang+=u.sp/u.rad*dt;b.position.set(u.cx+Math.cos(u.ang)*u.rad,u.alt,u.cz+Math.sin(u.ang)*u.rad);b.rotation.y=-u.ang;
    const f=Math.sin(u.ph+=dt*14)*.6;u.a.rotation.z=f;u.b.rotation.z=-f;
    if(Math.hypot(u.cx-D.x,u.cz-D.z)>700){u.cx=D.x+rnd(-300,300);u.cz=D.z+rnd(-300,300)}});
  // sensor
  let near=1e9,nk='',nx=0,nz=0;
  const test=(o,r,name)=>{const dx=D.x-o.x,dy=D.y-o.y,dz=D.z-o.z,d=Math.hypot(dx,dy,dz)-r;if(d<near){near=d;nk=name;nx=dx;nz=dz}};
  balloons.forEach(b=>test(b.position,11,'balloon (বেলুন)'));birds.forEach(b=>test(b.position,1.5,'bird (পাখি)'));
  if(D.y>.3){
    if(G.sensor&&near<30){warnT-=dt;if(warnT<=0){beep(1000,.05);warnT=Math.max(.1,near/40)}}
    if(G.sensor&&near<12){const d=Math.hypot(nx,nz)||1;D.x+=nx/d*14*dt;D.z+=nz/d*14*dt;D.vf*=.8;D.vr*=.8}
    else if(near<.5){D.x=D.z=D.vf=D.vr=0;D.y=0;D.vy=0;beep(120,.3);try{navigator.vibrate&&navigator.vibrate(250)}catch(e){}toast('Crash (ক্র্যাশ)! Drone (ড্রোন) home (হোম)-e fire (ফিরে) gelo');}
  }
  E.g3w.hidden=!(G.sensor&&near<30&&D.y>.3);
  if(!E.g3w.hidden){E.g3w.textContent='⚠ Sensor (সেন্সর): '+nk+' '+Math.max(0,near).toFixed(0)+' m';E.g3vg.style.boxShadow='inset 0 0 '+(80*(1-near/30))+'px rgba(255,0,0,'+(.7*(1-near/30))+')'}else E.g3vg.style.boxShadow='none';
  // hud
  const v=Math.hypot(D.vf,D.vr)*3.6;
  E.g3h.textContent='V (ভি) '+v.toFixed(0)+' km/h · H (হাইট) '+D.y.toFixed(0)+' m · D (ডিসট্যান্স) '+Math.hypot(D.x,D.z).toFixed(0)+' m · 🔋'+Math.round(G.bat)+'%';
  E.g3co.textContent=G.coins+' 🪙';
  let arrow='';if(G.mis!=null){const p=ll2m(LAND[G.mis][2],LAND[G.mis][3]),ang=Math.atan2(p[0]-D.x,-(p[1]-D.z))-D.h;arrow='<i style="transform:rotate('+ang+'rad)">↑</i>'}
  E.g3mc.innerHTML=missionText()+arrow;
  if(toastT>0){toastT-=dt;if(toastT<=0)E.g3m.hidden=true}
  tAcc+=dt;if(tAcc>.5){tAcc=0;updateTiles()}
  if(photoReq){photoReq=false;needPhoto=true}
}
let needPhoto=false;
function render(dt){
  rotors.forEach((r,i)=>{r.rotation.y+=dt*(D.spin*70)*(i%2?1:-1)});
  drone.position.set(D.x,D.y+.4,D.z);drone.rotation.y=-D.h;
  drone.rotation.x=-D.vf/12*.3;drone.rotation.z=-D.vr/12*.3;
  const sh=Math.sin(D.h),ch=Math.cos(D.h);
  if(G.view==='chase'){
    drone.visible=true;
    const tx=D.x-sh*10,tz=D.z+ch*10,ty=D.y+4.2;
    camera.position.x+=(tx-camera.position.x)*Math.min(1,dt*6);camera.position.y+=(ty-camera.position.y)*Math.min(1,dt*6);camera.position.z+=(tz-camera.position.z)*Math.min(1,dt*6);
    camera.lookAt(D.x+sh*8,D.y+1,D.z-ch*8);
  }else{
    drone.visible=false;camera.position.set(D.x+sh*1.2,D.y+.5,D.z-ch*1.2);camera.lookAt(D.x+sh*30,D.y-4,D.z-ch*30);
  }
  R.render(scene,camera);
  if(needPhoto){needPhoto=false;takePhoto()}
}

/* ---------- Bangladesh satellite map ---------- */
const MS={la:23.7,lo:90.3,z:6,pick:null,imgs:new Map()};
let mapCv,mapDirty=true,mapRun=false;
function mapOpen(){
  mapCv=E.g3mc2;mapCv.width=mapCv.clientWidth||600;mapCv.height=mapCv.clientHeight||260;
  const p=m2ll(D.x,D.z);MS.la=p[0];MS.lo=p[1];MS.z=mapCv.height>520?8:7;MS.pick=null;mapDirty=true;
  if(!mapRun){mapRun=true;requestAnimationFrame(mapTick)}
}
function mapTick(){
  if(E.g3map.hidden){mapRun=false;return}
  if(mapDirty){mapDirty=false;mapDraw()}requestAnimationFrame(mapTick);
}
const wpx=(la,lo,z)=>[(lo+180)/360*256*2**z,(1-Math.log(Math.tan(la*D2R)+1/Math.cos(la*D2R))/Math.PI)/2*256*2**z];
const px2ll=(x,y,z)=>{const s=256*2**z;return[Math.atan(Math.sinh(Math.PI*(1-2*y/s)))/D2R,x/s*360-180]};
function mapDraw(){
  if(!mapCv)return;
  const g=mapCv.getContext('2d'),W=mapCv.width,H=mapCv.height,z=MS.z,n=2**z,c=wpx(MS.la,MS.lo,z),ox=c[0]-W/2,oy=c[1]-H/2;
  g.fillStyle='#0b1a26';g.fillRect(0,0,W,H);
  if(MS.imgs.size>400)MS.imgs.clear();
  for(let ty=Math.floor(oy/256);ty<=Math.floor((oy+H)/256);ty++)for(let tx=Math.floor(ox/256);tx<=Math.floor((ox+W)/256);tx++){
    if(ty<0||ty>=n)continue;const wx=((tx%n)+n)%n,key=z+'/'+wx+'/'+ty;let im=MS.imgs.get(key);
    if(!im){im=new Image();im.onload=()=>{mapDirty=true};im.src=TILE+z+'/'+ty+'/'+wx;MS.imgs.set(key,im)}
    if(im.complete&&im.naturalWidth)g.drawImage(im,tx*256-ox,ty*256-oy);
  }
  const pt=(la,lo)=>{const p=wpx(la,lo,z);return[p[0]-ox,p[1]-oy]};
  g.font='600 11px sans-serif';
  LAND.forEach((l,i)=>{const p=pt(l[2],l[3]);g.fillStyle=G.done.has(i)?'#44dd66':'#ffd23f';g.beginPath();g.arc(p[0],p[1],5,0,7);g.fill();g.strokeStyle='#000';g.lineWidth=1;g.stroke();if(z>=8){g.fillStyle='#fff';g.strokeText(l[0],p[0]+7,p[1]+4);g.fillText(l[0],p[0]+7,p[1]+4)}});
  CITY.forEach(cc=>{const p=pt(cc[2],cc[3]);g.fillStyle='#fff';g.fillText(cc[0],p[0]+5,p[1]-5)});
  const d=m2ll(D.x,D.z),dp=pt(d[0],d[1]);g.strokeStyle='#50e6ff';g.lineWidth=3;g.beginPath();g.arc(dp[0],dp[1],9,0,7);g.stroke();
  if(MS.pick){const p=pt(MS.pick.la,MS.pick.lo);g.strokeStyle='#ff4d4d';g.lineWidth=3;g.beginPath();g.moveTo(p[0]-10,p[1]);g.lineTo(p[0]+10,p[1]);g.moveTo(p[0],p[1]-10);g.lineTo(p[0],p[1]+10);g.stroke();E.g3ll.textContent=MS.pick.la.toFixed(4)+'°N, '+MS.pick.lo.toFixed(4)+'°E'}
  g.fillStyle='rgba(0,0,0,.5)';g.fillRect(0,H-16,W,16);g.fillStyle='#fff';g.font='10px sans-serif';g.fillText('Imagery © Esri, Maxar, Earthstar Geographics',6,H-4);
}
function mapInput(){
  const c=E.g3mc2;let dr=null;
  c.addEventListener('pointerdown',e=>{c.setPointerCapture(e.pointerId);dr={x:e.clientX,y:e.clientY,mv:0}});
  c.addEventListener('pointermove',e=>{if(!dr)return;const dx=e.clientX-dr.x,dy=e.clientY-dr.y;dr.mv+=Math.abs(dx)+Math.abs(dy);dr.x=e.clientX;dr.y=e.clientY;
    const ct=wpx(MS.la,MS.lo,MS.z),p=px2ll(ct[0]-dx*(c.width/c.clientWidth),ct[1]-dy*(c.height/c.clientHeight),MS.z);MS.la=clamp(p[0],-80,80);MS.lo=p[1];mapDirty=true});
  c.addEventListener('pointerup',e=>{
    if(dr&&dr.mv<8){const r=c.getBoundingClientRect(),ct=wpx(MS.la,MS.lo,MS.z),sx=c.width/r.width,sy=c.height/r.height;
      const p=px2ll(ct[0]+(e.clientX-r.left)*sx-c.width/2,ct[1]+(e.clientY-r.top)*sy-c.height/2,MS.z);MS.pick={la:p[0],lo:p[1]};mapDirty=true}
    dr=null});
}
window.open3D=open3D;window.close3D=close3D;
})();
