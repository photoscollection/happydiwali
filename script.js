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
  name = name.trim() || '';
  const idx = hashString(name + String(Date.now()).slice(-4)) % greetings.length;
  return greetings[idx].replace(/\{\{name\}\}/g, name? name.charAt(0).toUpperCase()+name.slice(1): '');
}

/* =================== Canvas Setup =================== */
const fxCanvas = document.getElementById('fx-canvas');
const fxCtx = fxCanvas.getContext('2d');
function resizeCanvases(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  fxCanvas.width = Math.floor(window.innerWidth*dpr);
  fxCanvas.height = Math.floor(window.innerHeight*dpr);
  fxCanvas.style.width = window.innerWidth+'px';
  fxCanvas.style.height = window.innerHeight+'px';
  fxCtx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize',resizeCanvases);
resizeCanvases();

/* =================== Rice Lights =================== */
const riceLights = [];
for(let i=0;i<28;i++){
  riceLights.push({
    x: Math.random()*window.innerWidth,
    y: Math.random()*window.innerHeight*0.6,
    r:10+Math.random()*40,
    alpha:0.03+Math.random()*0.12,
    vx:(Math.random()-0.5)*0.15,
    vy:(Math.random()-0.5)*0.04,
    hue:30+Math.random()*50
  });
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
    fxCtx.fillStyle=g; fxCtx.beginPath(); fxCtx.arc(l.x,l.y,l.r,0,Math.PI*2); fxCtx.fill();
  });
}

/* =================== Fireworks Particles =================== */
const particles=[];
function spawnFirework(x,y){
  const hue=Math.random()*360;
  const count=50+Math.floor(Math.random()*80);
  for(let i=0;i<count;i++){
    const angle=Math.random()*Math.PI*2;
    const speed=2+Math.random()*3;
    particles.push({
      x,y,
      vx:Math.cos(angle)*speed*(0.8+Math.random()*0.7),
      vy:Math.sin(angle)*speed*(0.8+Math.random()*0.7),
      life:0.8+Math.random()*1.4,
      age:0,
      hue,
      size:2+Math.random()*3
    });
  }
}
function triggerFireworkBurst(){
  const w=window.innerWidth, h=window.innerHeight;
  spawnFirework(w*0.5+(Math.random()-0.5)*200, h*0.2+Math.random()*100);
  spawnFirework(w*0.3+Math.random()*200, h*0.15+Math.random()*80);
}
function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    p.age+=dt; p.x+=p.vx*dt*60; p.y+=p.vy*dt*60;
    p.vy+=0.03*dt*60; p.vx*=0.995; p.vy*=0.995;
    if(p.age>p.life) particles.splice(i,1);
  }
}
function drawParticles(){
  fxCtx.globalCompositeOperation='destination-out';
  fxCtx.fillStyle='rgba(0,0,0,0.2)';
  fxCtx.fillRect(0,0,fxCanvas.width,fxCanvas.height);
  fxCtx.globalCompositeOperation='lighter';
  particles.forEach(p=>{
    const t=p.age/p.life;
    const alpha=Math.max(0,1-t);
    fxCtx.fillStyle=`hsla(${p.hue},90%,60%,${alpha})`;
    fxCtx.beginPath(); fxCtx.arc(p.x,p.y,p.size*(1+(1-t)),0,Math.PI*2); fxCtx.fill();
    fxCtx.fillStyle=`hsla(${p.hue},90%,60%,${alpha*0.25})`;
    fxCtx.beginPath(); fxCtx.arc(p.x,p.y,p.size*4*(1-t),0,Math.PI*2); fxCtx.fill();
  });
}
let last=performance.now();
function fxLoop(now){
  const dt=(now-last)/1000; last=now;
  drawRiceLights(dt); updateParticles(dt); drawParticles();
  requestAnimationFrame(fxLoop);
}
requestAnimationFrame(fxLoop);

/* =================== Generate Greeting Fullscreen =================== */
document.getElementById('make').addEventListener('click', ()=>{
  const name=document.getElementById('name').value||'';
  document.getElementById('greetingText').innerText=makeGreeting(name);
  document.getElementById('actionButtons').style.display='flex';
  triggerFireworkBurst(); triggerFireworkBurst(); triggerFireworkBurst();
});

/* =================== Download & Share =================== */
document.getElementById('downloadBtn').addEventListener('click',()=>{
  html2canvas(document.getElementById('app')).then(canvas=>{
    const link=document.createElement('a');
    link.download='diwali-greeting.png';
    link.href=canvas.toDataURL();
    link.click();
  });
});
document.getElementById('shareBtn').addEventListener('click',async ()=>{
  if(navigator.canShare){
    html2canvas(document.getElementById('app')).then(canvas=>{
      canvas.toBlob(blob=>{
        const file=new File([blob],'diwali-greeting.png',{type:'image/png'});
        navigator.share({files:[file],title:'Happy Diwali',text:'Check out this greeting!'});
      });
    });
  }else{
    alert("Sharing not supported on this device");
  }
});

/* =================== FX Canvas Click =================== */
fxCanvas.addEventListener('click',(ev)=>{
  const rect=fxCanvas.getBoundingClientRect();
  const x=ev.clientX-rect.left;
  const y=ev.clientY-rect.top;
  spawnFirework(x,y); spawnFirework(x+Math.random()*50,y+Math.random()*50);
});
