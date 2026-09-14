/* ═══════════════════════════════════════════════════════════
   BIRTHDAY WEBSITE — main.js  (v2)
   All interactions, animations, canvas effects
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── CONFIG ────────────────────────────────────────────────────
const CONFIG = {
  birthdayName:  'Nama Kamu',           // ← ganti nama
  introText:     'Selamat Ulang Tahun!',
  autoFireworks: true,
};

// ── STATE ──────────────────────────────────────────────────────
const state = {
  currentScene:   'scene-intro',
  candlesBlown:   false,
  giftOpened:     false,
};

// ── MUSIC ──────────────────────────────────────────────────────
const audio = new Audio('assets/music/song.mp3');
audio.loop = true;
audio.volume = 0.7;

function initMusic() {
  const btn = $('music-btn');
  if (!btn) return;
  
  on(btn, 'click', toggleMusic);
}

function toggleMusic() {
  const btn = $('music-btn');
  if (!btn) return;
  
  if (btn.classList.contains('muted')) {
    // Restart dari awal
    audio.currentTime = 0;
    audio.play();
    btn.classList.remove('muted');
  } else {
    // Mute / pause
    audio.pause();
    btn.classList.add('muted');
  }
}

function showMusicButton() {
  const btn = $('music-btn');
  if (!btn) return;
  
  btn.style.display = 'flex';
  // Trigger animasi muncul
  setTimeout(() => btn.classList.add('show'), 10);
  
  // Play musik
  audio.play().catch(err => {
    console.log('Autoplay blocked:', err);
  });
}

const SCENE_ORDER = [
  'scene-intro', 'scene-cake', 'scene-celebrate',
  'scene-message', 'scene-gift', 'scene-gallery', 'scene-finale',
];

// ── HELPERS ────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// ── INIT ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectNames();
  initTypewriter();
  initSceneNav();
  initButtons();
  initCake();
  initGiftBox();
  initGallery();
  initInteractiveStars();
  initCursorSparkle();
  initKeyboard();
  initMusic();
  updateProgress();
});

// ── NAMES ──────────────────────────────────────────────────────
function injectNames() {
  ['bday-name', 'msg-name'].forEach(id => {
    const el = $(id);
    if (el) el.textContent = CONFIG.birthdayName;
  });
}

// ── TYPEWRITER ─────────────────────────────────────────────────
function initTypewriter() {
  const el   = $('typewriter-text');
  const text = CONFIG.introText;
  let   i    = 0;

  const cursor = document.createElement('span');
  cursor.style.cssText = 'display:inline-block;width:3px;height:0.9em;background:currentColor;margin-left:3px;vertical-align:middle;animation:blink 1s step-end infinite';
  const style = document.createElement('style');
  style.textContent = '@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}';
  document.head.appendChild(style);

  function type() {
    if (i <= text.length) {
      if (el) el.textContent = text.slice(0, i);
      i++;
      setTimeout(type, i === 1 ? 600 : 85);
    } else {
      if (el) el.appendChild(cursor);
    }
  }
  setTimeout(type, 1200);
}

// ── SCENE NAVIGATION ───────────────────────────────────────────
function goToScene(targetId) {
  const current = document.querySelector('.scene.active');
  const target  = $(targetId);
  if (!target || state.currentScene === targetId) return;

  // Update nav dots
  document.querySelectorAll('.nav-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.scene === targetId);
  });

  // Exit current
  if (current) {
    current.classList.add('exit');
    setTimeout(() => current.classList.remove('active', 'exit'), 600);
  }

  // Enter target
  setTimeout(() => {
    target.classList.add('active');
    state.currentScene = targetId;
    updateProgress();
    onSceneEnter(targetId);
  }, 280);
}

function updateProgress() {
  const idx = SCENE_ORDER.indexOf(state.currentScene);
  const pct = ((idx + 1) / SCENE_ORDER.length) * 100;
  const bar = $('progress-fill');
  if (bar) bar.style.width = pct + '%';
}

function initSceneNav() {
  document.querySelectorAll('.nav-dot').forEach(dot => {
    on(dot, 'click', () => goToScene(dot.dataset.scene));
  });
}

function initButtons() {
  on($('btn-open-envelope'),  'click', () => {
    showMusicButton();
    goToScene('scene-cake');
  });
  on($('btn-open-envelope2'), 'click', () => goToScene('scene-cake'));
  on($('btn-to-message'),     'click', () => goToScene('scene-message'));
  on($('btn-to-gift'),        'click', () => goToScene('scene-gift'));
  on($('btn-to-gallery'),     'click', () => goToScene('scene-gallery'));
  on($('btn-to-finale'),      'click', () => goToScene('scene-finale'));
  on($('btn-restart'),        'click', () => {
    stopFireworks();
    state.candlesBlown = false;
    state.giftOpened   = false;
    // Restore candles
    document.querySelectorAll('.candle-flame').forEach(f => {
      f.style.display = '';
      f.style.opacity = '';
      f.style.transform = '';
      f.style.transition = '';
    });
    const cakeCta = $('cake-cta');
    if (cakeCta) cakeCta.style.display = '';
    // Restore gift
    const giftSvg    = $('gift-svg');
    const giftReveal = $('gift-reveal');
    const giftLid    = $('gift-lid');
    if (giftSvg)    { giftSvg.style.display = '';    giftSvg.style.transform = ''; }
    if (giftReveal) giftReveal.style.display = 'none';
    if (giftLid)    { giftLid.style.transform = ''; giftLid.style.opacity = ''; }
    goToScene('scene-intro');
  });
}

function onSceneEnter(sceneId) {
  if (sceneId === 'scene-celebrate') {
    startFireworks();
    startConfetti();
    setTimeout(stopFireworks, 7000);
    setTimeout(stopConfetti,  8000);
  }
  if (sceneId === 'scene-finale') {
    startConfetti();
    setTimeout(stopConfetti, 6000);
  }
}

// ── CAKE / CANDLES ─────────────────────────────────────────────
function initCake() {
  on($('cake-stage'), 'click', () => {
    if (!state.candlesBlown) blowCandles();
  });
  on($('btn-blow'), 'click', e => {
    e.stopPropagation();
    if (!state.candlesBlown) blowCandles();
  });
}

function blowCandles() {
  state.candlesBlown = true;
  // Tampilkan wadah asap dulu biar siap
  const smokeWrap = $('smoke-wrap');
    if (smokeWrap) smokeWrap.style.display = 'block';
  const flames = document.querySelectorAll('.candle-flame');

  // Sequential flame blow-out
  flames.forEach((f, i) => {
    setTimeout(() => {
      f.style.transition = 'all 0.35s ease';
      f.style.transform  = 'scaleX(2.5) scaleY(0) translateY(6px)';
      f.style.opacity    = '0';
      
      // Tiny shockwave
      spawnClickBurst(f.getBoundingClientRect().left + 6, f.getBoundingClientRect().top + 10, 8);
      setTimeout(() => { f.style.display = 'none'; }, 360);

      // NYALAKAN ASAP UNTUK LILIN INI SAJA
      const smokeGroup = document.getElementById(`sg${i + 1}`);
      if (smokeGroup) {
        smokeGroup.style.animationPlayState = 'running';
      }

    }, i * 180);
  });

  // After last flame
  const delay = flames.length * 180 + 400;

  setTimeout(() => {
    // Shake cake
    const cakeSvg = $('cake-svg');
    if (cakeSvg) {
      cakeSvg.animate([
        { transform: 'rotate(-4deg) scale(1.06)' },
        { transform: 'rotate(4deg)  scale(0.97)' },
        { transform: 'rotate(-2deg) scale(1.03)' },
        { transform: 'rotate(0deg)  scale(1)'    },
      ], { duration: 500, fill: 'forwards' });
    }

    // Hide CTA
    const cakeCta = $('cake-cta');
    if (cakeCta) {
      cakeCta.style.display = '';
      cakeCta.style.opacity = '';
    }

    // Burst fireworks then switch scene
    startFireworks();
    startConfetti();
    setTimeout(() => {
      goToScene('scene-celebrate');
      setTimeout(stopFireworks, 7000);
      setTimeout(stopConfetti,  8000);
    }, 1600);
  }, delay);
}

// ── GIFT BOX ───────────────────────────────────────────────────
function initGiftBox() {
  on($('gift-svg'), 'click', () => {
    if (!state.giftOpened) openGift();
  });
}

function openGift() {
  state.giftOpened = true;

  const giftSvg    = $('gift-svg');
  const giftReveal = $('gift-reveal');
  const giftLid    = $('gift-lid');

  // Lid flies off
  if (giftLid) {
    giftLid.style.transition = 'all 0.75s cubic-bezier(0.34, 1.56, 0.64, 1)';
    giftLid.style.transform  = 'rotate(-35deg) translateY(-160px) translateX(60px)';
    giftLid.style.opacity    = '0';
  }

  // Shake the box
  if (giftSvg) {
    giftSvg.animate([
      { transform: 'rotate(-6deg) scale(1.08)' },
      { transform: 'rotate(6deg)  scale(0.96)' },
      { transform: 'rotate(-3deg) scale(1.04)' },
      { transform: 'rotate(0deg)  scale(1)'    },
    ], { duration: 600, delay: 150, fill: 'forwards' });
  }

  setTimeout(() => {
    if (giftSvg)    giftSvg.style.display    = 'none';
    if (giftReveal) giftReveal.style.display  = 'flex';
    startConfetti();
    setTimeout(stopConfetti, 5000);
  }, 700);
}

// ── GALLERY ────────────────────────────────────────────────────
const PLACEHOLDER_GALLERY = [
  { src: 'assets/images/foto1.jpg', caption: 'Momen Pertama',  rotate: -4 },
  { src: 'assets/images/foto2.jpg', caption: 'Kenangan Indah', rotate:  3 },
  { src: 'assets/images/foto3.jpg', caption: 'Selalu Bahagia', rotate: -2 },
  { src: 'assets/images/foto4.jpg', caption: 'Bersama Terus',  rotate:  5 },
  { src: 'assets/images/foto5.jpg', caption: 'Sayang Banget',  rotate: -3 },
  { src: 'assets/images/foto6.jpg', caption: 'Istimewa!',      rotate:  2 },
];

function initGallery() {
  const grid = $('polaroid-grid');
  if (!grid) return;
  
  PLACEHOLDER_GALLERY.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'polaroid';
    card.style.setProperty('--rotate', item.rotate + 'deg');
    card.style.animationDelay = `${i * 0.1}s`;
    
    // Render foto asli
    const img = document.createElement('img');
    img.className = 'polaroid-img';
    img.src = item.src;
    img.alt = item.caption;
    img.loading = 'lazy';
    card.appendChild(img);
    
    // Caption
    const cap = document.createElement('div');
    cap.className = 'polaroid-caption';
    cap.textContent = item.caption;
    card.appendChild(cap);
    
    // Click to zoom
    let zoomed = false;
    on(card, 'click', () => {
      zoomed = !zoomed;
      card.style.transform = zoomed
        ? 'rotate(0deg) scale(2) translateY(-20px)'
        : `rotate(${item.rotate}deg) scale(1)`;
      card.style.zIndex = zoomed ? '100' : '';
    });
    grid.appendChild(card);
  });
}

// ── INTERACTIVE STARS (finale) ─────────────────────────────────
function initInteractiveStars() {
  const stars   = document.querySelectorAll('.i-star');
  const popup   = $('wish-popup');
  let   timer   = null;

  stars.forEach(star => {
    on(star, 'click', () => {
      star.classList.remove('clicked');
      void star.offsetWidth; // reflow
      star.classList.add('clicked');

      const msg = star.dataset.msg;
      if (popup) {
        popup.textContent = msg;
        popup.classList.add('show');
        clearTimeout(timer);
        timer = setTimeout(() => popup.classList.remove('show'), 2200);
      }

      // Spawn confetti burst from star position
      const rect = star.getBoundingClientRect();
      spawnClickBurst(rect.left + rect.width/2, rect.top + rect.height/2, 20);
    });
  });
}

// ── CURSOR SPARKLE ─────────────────────────────────────────────
function initCursorSparkle() {
  const canvas = $('cursor-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  const sparkles = [];
  const SPARKLE_COLORS = ['#FF6B9D','#A78BFA','#FFE66D','#A8E6CF','#FFB347','#74B9FF'];

  document.addEventListener('mousemove', e => {
    if (Math.random() > 0.4) return; // throttle
    for (let i = 0; i < 2; i++) {
      sparkles.push({
        x:      e.clientX + (Math.random()-0.5)*20,
        y:      e.clientY + (Math.random()-0.5)*20,
        vx:     (Math.random()-0.5)*2,
        vy:     -1 - Math.random()*2,
        alpha:  1,
        decay:  0.025 + Math.random()*0.02,
        radius: 2 + Math.random()*3,
        color:  SPARKLE_COLORS[Math.floor(Math.random()*SPARKLE_COLORS.length)],
      });
    }
  });

  function drawSparkles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.x      += s.vx;
      s.y      += s.vy;
      s.vy     += 0.05; // gravity
      s.alpha  -= s.decay;
      if (s.alpha <= 0) { sparkles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle   = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(drawSparkles);
  }
  drawSparkles();
}

// ── CLICK BURST PARTICLES ──────────────────────────────────────
function spawnClickBurst(cx, cy, count = 15) {
  const canvas = $('cursor-canvas');
  if (!canvas) return;
  // Burst is handled inline into existing sparkle array via direct push
  // Use confetti layer for click burst instead
  const layer  = $('confetti-layer');
  const COLORS = ['#FF6B9D','#A78BFA','#FFE66D','#A8E6CF','#FFB347'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.style.cssText = `
      position:absolute;
      left:${cx}px;
      top:${cy}px;
      width:${5+Math.random()*8}px;
      height:${5+Math.random()*8}px;
      border-radius:${Math.random()>0.5?'50%':'3px'};
      background:${COLORS[Math.floor(Math.random()*COLORS.length)]};
      pointer-events:none;
      animation:burst-fly 0.8s ease-out forwards;
      --dx:${(Math.random()-0.5)*150}px;
      --dy:${(Math.random()-1.2)*150}px;
    `;
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 900);
  }
  // Inject burst keyframe once
  if (!document.getElementById('burst-style')) {
    const s = document.createElement('style');
    s.id = 'burst-style';
    s.textContent = `
      @keyframes burst-fly {
        0%   { transform:translate(0,0) scale(1);   opacity:1; }
        100% { transform:translate(var(--dx),var(--dy)) scale(0); opacity:0; }
      }
    `;
    document.head.appendChild(s);
  }
}

// Click anywhere → tiny burst
document.addEventListener('click', e => {
  if (['BUTTON','INPUT','LABEL'].includes(e.target.tagName)) return;
  spawnClickBurst(e.clientX, e.clientY, 8);
});

// ── CONFETTI ───────────────────────────────────────────────────
const CONF_COLORS  = ['#FF6B9D','#A78BFA','#FFE66D','#A8E6CF','#FFB347','#74B9FF','#FF8C94','#C4B5FD'];
let   confInterval = null;

function startConfetti() {
  const layer = $('confetti-layer');
  if (!layer || confInterval) return;

  confInterval = setInterval(() => {
    for (let i = 0; i < 7; i++) {
      const piece = document.createElement('div');
      const isCircle = Math.random() > 0.5;
      piece.className = 'confetti-piece';
      piece.style.left         = `${Math.random()*100}%`;
      piece.style.width        = `${6 + Math.random()*10}px`;
      piece.style.height       = `${6 + Math.random()*10}px`;
      piece.style.borderRadius = isCircle ? '50%' : '2px';
      piece.style.background   = CONF_COLORS[Math.floor(Math.random()*CONF_COLORS.length)];
      piece.style.animationDuration = `${2.5 + Math.random()*2.5}s`;
      piece.style.animationDelay    = `${Math.random()*0.4}s`;
      layer.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove());
    }
  }, 100);
}

function stopConfetti() {
  if (confInterval) { clearInterval(confInterval); confInterval = null; }
}

// ── FIREWORKS CANVAS ───────────────────────────────────────────
const fwCanvas = $('fireworks-canvas');
const fwCtx    = fwCanvas ? fwCanvas.getContext('2d') : null;
let   fwFrame  = null;
let   fwList   = [];
let   ptList   = [];

const FW_COLORS = ['#FF6B9D','#FFE66D','#A78BFA','#A8E6CF','#FFB347','#74B9FF','#FF8C94','#fff'];

function resizeFireworks() {
  if (!fwCanvas) return;
  fwCanvas.width  = window.innerWidth;
  fwCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeFireworks);

class FWRocket {
  constructor() {
    this.x     = Math.random() * fwCanvas.width;
    this.y     = fwCanvas.height + 10;
    this.tx    = 80 + Math.random() * (fwCanvas.width  - 160);
    this.ty    = 50 + Math.random() * (fwCanvas.height * 0.55);
    this.speed = 9 + Math.random() * 7;
    const ang  = Math.atan2(this.ty - this.y, this.tx - this.x);
    this.vx    = Math.cos(ang) * this.speed;
    this.vy    = Math.sin(ang) * this.speed;
    this.color = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];
    this.trail = [];
    this.done  = false;
  }
  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 14) this.trail.shift();
    this.x += this.vx;
    this.y += this.vy;
    if (Math.abs(this.x - this.tx) < 8 && Math.abs(this.y - this.ty) < 8) {
      this.explode();
      this.done = true;
    }
  }
  explode() {
    const n = 90 + Math.floor(Math.random() * 60);
    for (let i = 0; i < n; i++) ptList.push(new FWParticle(this.tx, this.ty, this.color));
  }
  draw() {
    this.trail.forEach((p, i) => {
      fwCtx.save();
      fwCtx.globalAlpha = (i / this.trail.length) * 0.6;
      fwCtx.fillStyle   = this.color;
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, 2, 0, Math.PI*2);
      fwCtx.fill();
      fwCtx.restore();
    });
    fwCtx.save();
    fwCtx.fillStyle = '#fff';
    fwCtx.beginPath();
    fwCtx.arc(this.x, this.y, 3, 0, Math.PI*2);
    fwCtx.fill();
    fwCtx.restore();
  }
}

class FWParticle {
  constructor(x, y, color) {
    this.x      = x;
    this.y      = y;
    this.color  = color;
    const a     = Math.random() * Math.PI * 2;
    const spd   = 1.5 + Math.random() * 8;
    this.vx     = Math.cos(a) * spd;
    this.vy     = Math.sin(a) * spd;
    this.alpha  = 1;
    this.decay  = 0.013 + Math.random() * 0.018;
    this.grav   = 0.13;
    this.radius = 1.5 + Math.random() * 2.5;
  }
  update() {
    this.vy    += this.grav;
    this.x     += this.vx;
    this.y     += this.vy;
    this.vx    *= 0.97;
    this.vy    *= 0.97;
    this.alpha -= this.decay;
  }
  draw() {
    fwCtx.save();
    fwCtx.globalAlpha = Math.max(0, this.alpha);
    fwCtx.fillStyle   = this.color;
    fwCtx.shadowColor = this.color;
    fwCtx.shadowBlur  = 5;
    fwCtx.beginPath();
    fwCtx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    fwCtx.fill();
    fwCtx.restore();
  }
}

function fireworksLoop() {
  if (!fwCtx) return;
  fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);

  if (Math.random() < 0.07) fwList.push(new FWRocket());

  fwList   = fwList.filter(r  => { r.update();  r.draw();  return !r.done; });
  ptList   = ptList.filter(p  => { p.update();  p.draw();  return p.alpha > 0; });

  fwFrame = requestAnimationFrame(fireworksLoop);
}

function startFireworks() {
  if (!fwCanvas || !fwCtx) return;
  resizeFireworks();
  fwCanvas.style.display = 'block';
  // Initial salvo
  for (let i = 0; i < 10; i++) {
    setTimeout(() => fwList.push(new FWRocket()), i * 180);
  }
  if (!fwFrame) fireworksLoop();
}

function stopFireworks() {
  if (fwFrame) { cancelAnimationFrame(fwFrame); fwFrame = null; }
  if (fwCanvas) fwCanvas.style.display = 'none';
  if (fwCtx) fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
  fwList = [];
  ptList = [];
}

// ── KEYBOARD ───────────────────────────────────────────────────
function initKeyboard() {
  document.addEventListener('keydown', e => {
    const idx = SCENE_ORDER.indexOf(state.currentScene);
    if (['ArrowRight','ArrowDown'].includes(e.key) && idx < SCENE_ORDER.length-1) {
      e.preventDefault();
      goToScene(SCENE_ORDER[idx+1]);
    }
    if (['ArrowLeft','ArrowUp'].includes(e.key) && idx > 0) {
      e.preventDefault();
      goToScene(SCENE_ORDER[idx-1]);
    }
  });
}
