/* =================== Greeting logic =================== */
const greetings = [
  "Happy Diwali, {{name}}! May this festival fill your life with light and success.",
  "Wishing you endless joy, {{name}}. Shine bright like a thousand diyas this Diwali!",
  "{{name}}, may your heart and home sparkle with happiness this Diwali!",
  "Light up your life with love and laughter, {{name}}. Happy Diwali!",
  "May this Diwali bring you closer to your dreams, {{name}}!",
  "{{name}}, let the light of diyas guide you toward prosperity and peace.",
  "Celebrate Diwali with smiles, sweets, and sparkles, {{name}}!",
  "{{name}}, may the firecrackers of happiness light up your sky forever!",
  "Let the glow of diyas remind you that hope always shines, {{name}}!",
  "{{name}}, wishing you a festival full of colors, sweets, and cheer!",
  "This Diwali, let love be your spark and kindness your light, {{name}}!",
  "{{name}}, celebrate the festival of lights with joy and togetherness!",
  "Happy Diwali, {{name}} — may your life bloom with endless radiance!",
  "Let the lights of Diwali illuminate your soul, {{name}}!",
  "{{name}}, may each diya you light bring blessings your way!"
];
function hashString(s){ let h=5381; for(let i=0;i<s.length;i++) h=((h<<5)+h)+s.charCodeAt(i); return Math.abs(h); }
function makeGreeting(name){
  name = (name||'Friend').trim();
  const idx = hashString(name + String(Date.now()).slice(-4)) % greetings.length;
  return greetings[idx].replace(/\{\{name\}\}/g, name.charAt(0).toUpperCase()+name.slice(1));
}

document.getElementById('make').addEventListener('click', ()=> {
  const name = document.getElementById('name').value || 'Friend';
  document.getElementById('greetingText').innerText = makeGreeting(name);
  triggerFireworkBurst();
});
window.onload = ()=>{document.getElementById('name').focus();};

/* =================== Canvas Setup =================== */
const fxCanvas = document.getElementById('fx-canvas');
const fxCtx = fxCanvas.getContext('2d');
function resizeCanvases(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  fxCanvas.width = Math.floor(window.innerWidth * dpr);
  fxCanvas.height = Math.floor(window.innerHeight * dpr);
  fxCanvas.style.width = window.innerWidth + 'px';
  fxCanvas.style.height = window.innerHeight + 'px';
  fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

/* =================== Rice Lights =================== */
const riceLights = [];
for(let i=0;i<28;i++){
  riceLights.push({x: Math.random()*window.innerWidth,y: Math.random()*window.innerHeight*0.6,r:10+Math.random()*40,alpha:0.03+Math.random()*0.12,vx:(Math.random()-0.5)*0.15,vy:(Math.random()-0.5)*0.04,hue:30+Math.random()*50});
}
function drawRiceLights(dt){
  fxCtx.clearRect(0,0,window.innerWidth,window.innerHeight);
  riceLights.forEach(l=>{
    l.x+=l.vx*dt; l.y+=l.vy*dt;
    if(l.x<-l.r) l.x=window.innerWidth+l.r;
    if(l.x>window.innerWidth+l.r) l.x=-l.r;
    if(l.y<-l.r) l.y=window.innerHeight+l.r;
    if(l.y>window.innerHeight+l.r) l.y=-l.r;
    const g = fxCtx.createRadialGradient(l.x,l.y,0,l.x,l.y,l.r);
    g.addColorStop(0,`hsla(${l.hue},90%,60%,${l.alpha})`);
    g.addColorStop(0.6,`hsla(${l.hue},90%,55%,${l.alpha*0.35})`);
    g.addColorStop(1,`hsla(${l.hue},90%,45%,0)`);
    fxCtx.fillStyle=g;
    fxCtx.beginPath();
    fxCtx.arc(l.x,l.y,l.r,0,Math.PI*2); fxCtx.fill();
  });
}

/* =================== Fireworks =================== */
const particles=[];
function spawnFirework(x,y){
  const hue=20+Math.random()*320;
  const count=30+Math.floor(Math.random()*60);
  for(let i=0;i<count;i++){
    const angle=Math.random()*Math.PI*2;
    const speed=1.2+Math.random()*4;
    particles.push({x,y,vx:Math.cos(angle)*speed*(0.6+Math.random()*1.4),vy:Math.sin(angle)*speed*(0.6+Math.random()*1.4),life:1+Math.random()*1.2,age:0,hue,size:1+Math.random()*3});
  }
}
function triggerFireworkBurst(){
  const w=window.innerWidth,h=window.innerHeight;
  spawnFirework(w*(0.25+Math.random()*0.5),h*(0.12+Math.random()*0.35));
  spawnFirework(w*0.5+(Math.random()-0.5)*200,h*0.18+Math.random()*80);
}
function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i]; p.age+=dt; p.x+=p.vx*dt*60; p.y+=p.vy*dt*60; p.vy+=0.03*dt*60; p.vx*=0.995; p.vy*=0.995;
    if(p.age>p.life) particles.splice(i,1);
  }
}
function drawParticles(){
  particles.forEach(p=>{
    const t=p.age/p.life;
    const alpha=Math.max(0,1-t);
    fxCtx.globalCompositeOperation='lighter';
    fxCtx.fillStyle=`hsla(${p.hue},90%,60%,${alpha})`;
    fxCtx.beginPath(); fxCtx.arc(p.x,p.y,p.size*(1+(1-t)),0,Math.PI*2); fxCtx.fill();
    fxCtx.fillStyle=`hsla(${p.hue},90%,60%,${alpha*0.25})`;
    fxCtx.beginPath(); fxCtx.arc(p.x,p.y,p.size*3*(1-t),0,Math.PI*2); fxCtx.fill();
    fxCtx.globalCompositeOperation='source-over';
  });
}
let last = performance.now();
let ambientTimer = 0;
function fxLoop(now){
  const dt=(now-last)/1000; last=now;
  drawRiceLights(dt); updateParticles(dt); drawParticles();
  ambientTimer-=dt;
  if(ambientTimer<=0){ ambientTimer=3+Math.random()*4; if(Math.random()>0.6) triggerFireworkBurst(); }
  requestAnimationFrame(fxLoop);
}
requestAnimationFrame(fxLoop);
fxCanvas.addEventListener('click',(ev)=>{
  const rect=fxCanvas.getBoundingClientRect();
  spawnFirework(ev.clientX-rect.left,ev.clientY-rect.top);
});

/* =================== Candles =================== */
const candleRow=document.getElementById('candleRow');
const candleCount=Math.min(12,Math.floor(window.innerWidth/120)+2);
function createCandleImg(className){
  const img=document.createElement('img'); img.src='./candle.png'; img.alt='candle'; if(className) img.classList.add(className); return img;
}
for(let i=0;i<candleCount;i++){
  const img=createCandleImg(); img.style.animationDelay=(Math.random()*700)+'ms'; candleRow.appendChild(img);
}
for(let i=0;i<6;i++){
  const f=createCandleImg('floating-candle'); f.style.left=(10+Math.random()*80)+'vw'; f.style.bottom=(10+Math.random()*35)+'vh'; f.style.opacity=0;
  const dur=5+Math.random()*6; f.style.animationDuration=dur+'s,'+(0.9+Math.random()*0.5)+'s';
  document.getElementById('app').appendChild(f);
}

/* =================== Three.js Scene =================== */
(function(){
  const canvas=document.getElementById('three-canvas');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(window.devicePixelRatio);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(50,window.innerWidth/window.innerHeight,0.1,100);
  camera.position.set(0,1.9,5.4);
  const amb=new THREE.AmbientLight(0xffc9b3,0.45);
  const pt=new THREE.PointLight(0xffd07a,0.8,100); pt.position.set(1.4,2,2);
  scene.add(amb,pt);
  const floorMat=new THREE.MeshStandardMaterial({color:0x06010b,roughness:0.9,metalness:0});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),floorMat); floor.rotation.x=-Math.PI/2; floor.position.y=-0.9; scene.add(floor);
  const diyaGroup=new THREE.Group();
  function makeDiyaSimple(){
    const g=new THREE.Group();
    const bowl=new THREE.Mesh(new THREE.TorusGeometry(0.28,0.08,12,32),new THREE.MeshStandardMaterial({color:0x6a2e1b,metalness:0.2,roughness:0.7}));
    bowl.rotation.x=Math.PI/2; bowl.position.y=0.02; g.add(bowl);
    const flame=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.16,8),new THREE.MeshBasicMaterial({color:0xffdd9b}));
    flame.position.y=0.18; g.add(flame);
    const pl=new THREE.PointLight(0xffb86b,0.9,3); pl.position.set(0,0.2,0); g.add(pl);
    return g;
  }
  for(let i=0;i<6;i++){
    const d=makeDiyaSimple(); const a=(i/6)*Math.PI*2; const r=1.6+Math.sin(i)*0.08;
    d.position.set(Math.cos(a)*r,-0.15,Math.sin(a)*r); d.rotation.y=-a; diyaGroup.add(d);
  }
  scene.add(diyaGroup);
  function onResize(){ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight,false);}
  window.addEventListener('resize',onResize); onResize();
  const clock=new THREE.Clock();
  (function render(){requestAnimationFrame(render); const t=clock.getElapsedTime();
    diyaGroup.children.forEach((d,i)=>{d.position.y=-0.15+Math.sin(t*2.2+i)*0.02; d.children[1].scale.y=1+Math.sin(t*6+i)*0.18;});
    renderer.render(scene,camera);
  })();
})();

/* =================== Download & Share =================== */
const downloadBtn=document.getElementById('downloadCard');
const shareBtn=document.getElementById('shareCard');

downloadBtn.addEventListener('click',async ()=>{
  const container=document.getElementById('app');
  html2canvas(container,{backgroundColor:null,scale:2}).then(canvas=>{
    const link=document.createElement('a'); link.download='Diwali-Greeting.png'; link.href=canvas.toDataURL('image/png'); link.click();
  });
});

shareBtn.addEventListener('click',async ()=>{
  try{
    const container=document.getElementById('app');
    const canvas=await html2canvas(container,{backgroundColor:null,scale:2});
    canvas.toBlob(async (
