// ====== Realistic Fireworks ======
const particles = []; // explosion particles
const rockets = [];   // rockets

function spawnRocket(x=null) {
  const w = window.innerWidth;
  const startX = x !== null ? x : Math.random() * (w*0.8) + w*0.1;
  rockets.push({
    x: startX,
    y: window.innerHeight,
    vx: (Math.random()-0.5)*0.6,
    vy: -7 - Math.random()*3,
    hue: Math.random()*360,
    trail: []
  });
}

function updateRockets(dt){
  for(let i=rockets.length-1;i>=0;i--){
    const r = rockets[i];
    // update position
    r.vy += 0.12*dt*60; // gravity
    r.x += r.vx*dt*60;
    r.y += r.vy*dt*60;

    // add to trail
    r.trail.push({x:r.x,y:r.y});
    if(r.trail.length>6) r.trail.shift();

    // explode if velocity slows or reaches target height
    if(r.vy>=-1){
      explode(r.x,r.y,r.hue);
      rockets.splice(i,1);
    }
  }
}

function explode(x,y,hue){
  const count = 50 + Math.floor(Math.random()*70);
  for(let i=0;i<count;i++){
    const angle = Math.random()*Math.PI*2;
    const speed = 2 + Math.random()*3;
    particles.push({
      x, y,
      vx: Math.cos(angle)*speed*(0.8+Math.random()*0.5),
      vy: Math.sin(angle)*speed*(0.8+Math.random()*0.5),
      life: 1 + Math.random()*1.5,
      age: 0,
      hue,
      size: 2 + Math.random()*2
    });
  }
}

function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.age += dt;
    p.x += p.vx*dt*60;
    p.y += p.vy*dt*60;
    p.vy += 0.03*dt*60; // gravity
    p.vx *= 0.99; p.vy *= 0.99;
    if(p.age>p.life) particles.splice(i,1);
  }
}

function drawRockets(){
  rockets.forEach(r=>{
    // draw trail
    fxCtx.strokeStyle = `hsl(${r.hue},90%,70%)`;
    fxCtx.lineWidth = 2;
    fxCtx.beginPath();
    for(let i=0;i<r.trail.length-1;i++){
      fxCtx.moveTo(r.trail[i].x,r.trail[i].y);
      fxCtx.lineTo(r.trail[i+1].x,r.trail[i+1].y);
    }
    fxCtx.stroke();
    // draw rocket head
    fxCtx.fillStyle = `hsl(${r.hue},90%,80%)`;
    fxCtx.beginPath();
    fxCtx.arc(r.x,r.y,3,0,Math.PI*2);
    fxCtx.fill();
  });
}

function drawParticles(){
  particles.forEach(p=>{
    const t = p.age/p.life;
    const alpha = Math.max(0,1-t);
    fxCtx.fillStyle = `hsla(${p.hue},90%,60%,${alpha})`;
    fxCtx.beginPath();
    fxCtx.arc(p.x,p.y,p.size*(1+t),0,Math.PI*2);
    fxCtx.fill();
    // glow
    fxCtx.fillStyle = `hsla(${p.hue},90%,60%,${alpha*0.25})`;
    fxCtx.beginPath();
    fxCtx.arc(p.x,p.y,p.size*3*(1-t),0,Math.PI*2);
    fxCtx.fill();
  });
}

// ====== FX Loop replacement ======
let lastTime = performance.now();
function fxLoop(now){
  const dt = (now-lastTime)/1000;
  lastTime = now;
  fxCtx.clearRect(0,0,window.innerWidth,window.innerHeight);

  drawStars(dt);
  drawRiceLights(dt);

  // ambient rockets
  if(Math.random()<0.008) spawnRocket();

  updateRockets(dt);
  updateParticles(dt);
  drawRockets();
  drawParticles();

  requestAnimationFrame(fxLoop);
}
requestAnimationFrame(fxLoop);

// ====== Integrate with Generate & Click ======
document.getElementById('make').addEventListener('click',()=>{
  const name=document.getElementById('name').value||'';
  document.getElementById('greetingText').innerText=makeGreeting(name);
  document.getElementById('actionButtons').style.display='flex';
  // spawn multiple rockets at once
  for(let i=0;i<5;i++) spawnRocket();
});

fxCanvas.addEventListener('click',(ev)=>{
  const rect=fxCanvas.getBoundingClientRect();
  spawnRocket(ev.clientX-rect.left);
});
