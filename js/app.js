// ========== State & DOM ==========
const COLORS=[
  {name:'橘子橙',val:'#ff7a00', preset:true},
  {name:'深邃黑',val:'#111111'},
  {name:'猩紅紅',val:'#d0021b'},
  {name:'奶油黃',val:'#ffe08a'},
  {name:'粉紅色',val:'#ff6fa5'},
  {name:'巧克力摩卡',val:'#6b4a3a'},
  {name:'香檳米',val:'#f4e6d4'},
  {name:'苔綠色',val:'#4c6b36'},
  {name:'酒紅色',val:'#6a1b2a'},
  {name:'海藍',val:'#3a79ff'}
];
const STYLES=['月兔','Clean Fit','斜紋','賽車','運動','山形','芭蕾少女','Y2K'];

let curColor=COLORS[0].val, curStyle=STYLES[0];
let txt='Happy Mid-Autumn Festival', txtSize=22, txtWeight=700, txtRepeat=1, txtGap=24;
let weaveScale=0.35, shine=0.6;

const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const ctx = overlay.getContext('2d');
const tapmask = document.getElementById('tapmask');
const err = document.getElementById('err');
const shareRow = document.getElementById('shareRow');
const band2d = document.getElementById('band2d');
const bctx = band2d.getContext('2d');

// ========== UI Build ==========
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('show'));
  t.classList.add('active');
  document.getElementById(t.dataset.panel).classList.add('show');
});

// color swatches
const swatches = document.getElementById('swatches');
COLORS.forEach(c=>{
  const d=document.createElement('div'); d.className='swatch'; d.style.background=c.val; d.title=c.name;
  if(c.preset) d.style.outline='2px solid var(--accent)';
  d.onclick=()=>{curColor=c.val;document.querySelectorAll('.swatch').forEach(x=>x.style.outline='none');d.style.outline='2px solid var(--accent)';drawBand2D();updateThumbs();};
  swatches.appendChild(d);
});

// style grid thumbs
const styleGrid=document.getElementById('styleGrid');
STYLES.forEach((name, i)=>{
  const card=document.createElement('div'); card.className='style-card'+(i===0?' active':'');
  const thumb=document.createElement('canvas'); thumb.className='style-thumb'; thumb.width=280; thumb.height=100;
  drawStyleThumb(thumb.getContext('2d'), name, curColor, weaveScale, shine);
  const label=document.createElement('div'); label.textContent=name;
  card.appendChild(thumb); card.appendChild(label);
  card.onclick=()=>{
    document.querySelectorAll('.style-card').forEach(x=>x.classList.remove('active'));
    card.classList.add('active'); curStyle=name; drawBand2D();
  };
  styleGrid.appendChild(card);
});
function updateThumbs(){
  document.querySelectorAll('.style-thumb').forEach((c,i)=>{
    const g=c.getContext('2d'); drawStyleThumb(g, STYLES[i], curColor, weaveScale, shine);
  });
}

// controls
['txt','txtSize','txtWeight','txtRepeat','txtGap','weaveScale','shine'].forEach(id=>{
  const el = document.getElementById(id);
  if(!el) return;
  el.oninput = e=>{
    if(id==='txt') txt = e.target.value;
    if(id==='txtSize') txtSize = +e.target.value;
    if(id==='txtWeight') txtWeight = +e.target.value;
    if(id==='txtRepeat') txtRepeat = +e.target.value;
    if(id==='txtGap') txtGap = +e.target.value;
    if(id==='weaveScale') weaveScale = +e.target.value;
    if(id==='shine') shine = +e.target.value;
    drawBand2D(); updateThumbs();
  };
});

// ========== Rich 2D Band Drawing ==========
function roundedRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function drawTexture(g,w,h,color,scale){
  // subtle weave: diagonal hatch + noise dots
  g.save();
  g.globalAlpha = 0.12 + scale*0.25;
  g.fillStyle = color;
  for(let x=-w; x<w*2; x+=16){
    g.beginPath();
    g.moveTo(x,0); g.lineTo(x+28,0); g.lineTo(x,h); g.lineTo(x-28,h); g.closePath(); g.fill();
  }
  g.globalAlpha = 0.09 + scale*0.2;
  for(let i=0;i<Math.floor(w*h/1800);i++){
    const px = Math.random()*w, py = Math.random()*h;
    g.fillRect(px,py,1,1);
  }
  g.restore();
}
function drawGloss(g,w,h,intensity){
  const lg = g.createLinearGradient(0,0,0,h);
  lg.addColorStop(0,`rgba(255,255,255,${0.35*intensity})`);
  lg.addColorStop(0.45,`rgba(255,255,255,${0.06*intensity})`);
  lg.addColorStop(0.55,`rgba(0,0,0,${0.10*intensity})`);
  lg.addColorStop(1,`rgba(0,0,0,${0.25*intensity})`);
  g.fillStyle = lg;
  g.fillRect(0,0,w,h);
}
// core pattern painter
function drawPattern(g,w,h,style,color){
  g.save(); g.fillStyle=color; g.strokeStyle=color;
  switch(style){
    case '月兔':
      g.globalAlpha=.9; g.beginPath(); g.arc(h*.9,h*.5,h*.36,0,Math.PI*2); g.fill();
      g.globalAlpha=.55; g.beginPath(); g.arc(h*1.28,h*.45,h*.22,0,Math.PI*2); g.fill(); g.globalAlpha=1; break;
    case 'Clean Fit':
      g.fillRect(0,h*.38,w,h*.24); break;
    case '斜紋':
      for(let x=-w;x<w*2;x+=24){ g.globalAlpha=(x/24%2===0)?.35:.15;
        g.beginPath(); g.moveTo(x,0); g.lineTo(x+40,0); g.lineTo(x,h); g.lineTo(x-40,h); g.closePath(); g.fill(); } g.globalAlpha=1; break;
    case '賽車':
      g.lineWidth=6; g.beginPath(); g.moveTo(w*.3,h*.2); g.lineTo(w*.5,h*.8); g.lineTo(w*.7,h*.2); g.stroke(); break;
    case '運動':
      g.fillRect(0,h*.25,w,4); g.fillRect(0,h*.75-4,w,4); break;
    case '山形':
      g.beginPath(); for(let x=0;x<=w;x+=28){ g.moveTo(x,h*.75); g.lineTo(x+14,h*.3); g.lineTo(x+28,h*.75);} g.closePath(); g.fill(); break;
    case '芭蕾少女':
      g.globalAlpha=.9; for(let x=32;x<w;x+=92){ g.beginPath(); g.ellipse(x-14,h*.5,10,16,0,0,Math.PI*2); g.ellipse(x+14,h*.5,10,16,0,0,Math.PI*2); g.fill(); g.fillRect(x-6,h*.5-6,12,12);} g.globalAlpha=1; break;
    case 'Y2K':
      for(let x=20;x<w;x+=70){ g.globalAlpha=.9; g.beginPath(); g.arc(x,h*.5,10,0,Math.PI*2); g.fill(); g.globalAlpha=.25; g.beginPath(); g.arc(x,h*.5,24,0,Math.PI*2); g.fill(); } g.globalAlpha=1; break;
  }
  g.restore();
}
function drawBand2D(){
  const w=band2d.width, h=band2d.height;
  bctx.clearRect(0,0,w,h);
  // rounded base
  const r = 12;
  bctx.save();
  roundedRect(bctx,0,0,w,h,r); bctx.clip();
  // base white
  bctx.fillStyle='#fff'; bctx.fillRect(0,0,w,h);
  drawTexture(bctx,w,h,curColor,weaveScale);
  drawPattern(bctx,w,h,curStyle,curColor);
  drawGloss(bctx,w,h,shine);
  bctx.restore();
  // stitches
  bctx.save();
  bctx.strokeStyle='rgba(0,0,0,.15)'; bctx.setLineDash([5,5]); bctx.lineWidth=1.2;
  bctx.strokeRect(6.5,6.5,w-13,h-13);
  bctx.restore();
  // centered text repeated
  bctx.save();
  bctx.fillStyle='#111'; bctx.font=`${txtWeight} ${txtSize}px "Inter","Noto Sans TC",system-ui,sans-serif`;
  const tw=bctx.measureText(txt).width; const total = tw*txtRepeat + txtGap*(txtRepeat-1);
  let x=(w-total)/2; const y=h*.7;
  for(let i=0;i<txtRepeat;i++){ bctx.fillText(txt,x,y); x+=tw+txtGap; }
  bctx.restore();
}
drawBand2D();

function drawStyleThumb(g, style, color, scale, shineAmt){
  const w=g.canvas.width, h=g.canvas.height;
  g.clearRect(0,0,w,h);
  // base
  g.save(); roundedRect(g,0,0,w,h,10); g.clip(); g.fillStyle='#fff'; g.fillRect(0,0,w,h);
  drawTexture(g,w,h,color,scale);
  drawPattern(g,w,h,style,color);
  drawGloss(g,w,h,shineAmt);
  g.restore();
  // stroke
  g.strokeStyle='rgba(0,0,0,.15)'; g.strokeRect(5.5,5.5,w-11,h-11);
}

// ========== Camera + FaceMesh ==========
document.getElementById('btnStart').onclick=startCamera;
window.addEventListener('load',()=>{ setTimeout(startCamera, 250); });

let fm, animId;
async function startCamera(){
  err.textContent='';
  try{
    video.setAttribute('playsinline','true'); video.muted=true;
    const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user', width:{ideal:720}, height:{ideal:1280} }, audio:false });
    video.srcObject = stream; await video.play();
    overlay.width = video.videoWidth || overlay.clientWidth;
    overlay.height = video.videoHeight || overlay.clientHeight;
    tapmask.classList.add('hidden');
    bootFaceMesh();
  }catch(e){
    err.textContent='相機開啟失敗：'+(e.message||e);
    tapmask.classList.remove('hidden');
  }
}
function bootFaceMesh(){
  fm = new FaceMesh({locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`});
  fm.setOptions({maxNumFaces:1,refineLandmarks:true,minDetectionConfidence:0.5,minTrackingConfidence:0.5});
  fm.onResults(onResults);
  loop();
}
async function loop(){
  if(!video.srcObject) return;
  try{ await fm.send({image: video}); }catch(e){}
  animId = requestAnimationFrame(loop);
}

// bubbles + mouth open
const bubbles=[];
function spawnBunny(){ bubbles.push({x: overlay.width/2 + (Math.random()*140-70), y: overlay.height-30, a:1, vy: 0.9+Math.random()*0.7}); }
function drawBubbles(){ ctx.save(); ctx.font='28px serif'; for(let i=bubbles.length-1;i>=0;i--){const b=bubbles[i]; ctx.globalAlpha=b.a; ctx.fillText('🐰', b.x, b.y); b.y -= b.vy; b.a -= 0.004; if(b.a<=0) bubbles.splice(i,1);} ctx.restore(); ctx.globalAlpha=1; }
function mouthOpen(lm){ const top=lm[13], bottom=lm[14], left=lm[33], right=lm[263]; const mouth=Math.hypot(top.x-bottom.x, top.y-bottom.y); const faceW=Math.hypot(left.x-right.x, left.y-right.y); return (mouth/faceW) > 0.08; }

function onResults(res){
  ctx.clearRect(0,0,overlay.width,overlay.height);
  if(!res.multiFaceLandmarks || !res.multiFaceLandmarks.length){ drawBubbles(); return; }
  const lm=res.multiFaceLandmarks[0];
  const W=overlay.width, H=overlay.height;
  const p33=lm[33], p263=lm[263], p10=lm[10];
  const x33=p33.x*W, y33=p33.y*H, x263=p263.x*W, y263=p263.y*H, x10=p10.x*W, y10=p10.y*H;
  const cx=(x33+x263)/2, width=Math.hypot(x263-x33,y263-y33)*1.5, height=Math.max(28, width*0.20), angle=Math.atan2(y263-y33,x263-x33), y=y10 - height*1.15;
  // draw headband (with slight curvature by slicing)
  const slices = 18;
  for(let i=0;i<slices;i++){
    const t0=i/slices, t1=(i+1)/slices;
    const sx = t0*band2d.width, sw = (t1-t0)*band2d.width;
    const k = (i - slices/2) / (slices/2);
    const localH = height * (1 - 0.18*Math.pow(k,2)); // bulge in middle
    ctx.save();
    ctx.translate(cx, y);
    ctx.rotate(angle);
    ctx.drawImage(band2d, sx, 0, sw, band2d.height, -width/2 + t0*width, -localH/2, (t1-t0)*width, localH);
    ctx.restore();
  }
  if(mouthOpen(lm) && Math.random()<0.28){ spawnBunny(); } drawBubbles();
}

// ========== Capture & Share ==========
document.getElementById('btnShot').onclick=()=>{
  const snap=document.createElement('canvas'); const w=overlay.width,h=overlay.height; snap.width=w; snap.height=h;
  const sctx=snap.getContext('2d'); sctx.drawImage(video,0,0,w,h); sctx.drawImage(overlay,0,0,w,h);
  snap.toBlob(async (blob)=>{
    shareRow.classList.add('show');
    document.getElementById('btnSave').onclick=()=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='headband-ar.png'; a.click(); URL.revokeObjectURL(a.href); };
    document.getElementById('btnShare').onclick=async()=>{
      if(navigator.share){ const file=new File([blob],'headband-ar.png',{type:'image/png'}); try{ await navigator.share({files:[file], title:'Weave Headband AR', text:'我的運動頭帶設計'});}catch(e){} }
      else alert('此裝置不支援分享，請先保存到手機');
    };
  },'image/png');
};
