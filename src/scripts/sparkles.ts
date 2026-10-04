// Fairy-dust animation for the hero logo. Draws on a canvas that sits behind
// the lettering and has the same frame as the (static) dust artwork, so
// everything lines up with the original stardust-and-streak look:
//
//   - twinkling stars: fixed positions, concentrated along the galaxy streak,
//     each pulsing on its own period;
//   - falling glitter: tiny motes emitted from the lower part of the lettering
//     that drift down and sway, flicker, and fade — the "under the logo" part.
//
// Cheap on purpose: a few dozen twinkles, a capped mote pool, DPR capped at 2,
// and the loop only runs while the canvas is on screen and the tab is visible.
// Callers must NOT start this for prefers-reduced-motion visitors.

export interface LogoBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const FRAME_SOURCE_WIDTH = 1450; // dust frame width in source px (sizes below are in these units)
const COLORS = ['255,255,255', '255,233,199', '249,105,73']; // white, warm, brand accent
const COLOR_WEIGHTS = [0.62, 0.26, 0.12];

function pickColor(): string {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < COLORS.length; i++) {
    acc += COLOR_WEIGHTS[i];
    if (r < acc) return COLORS[i];
  }
  return COLORS[0];
}

function gaussian(): number {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
}

interface Twinkle {
  u: number;
  v: number;
  r: number;
  period: number;
  phase: number;
  color: string;
}

interface Mote {
  x0: number;
  y: number;
  vx: number;
  vy: number;
  sway: number;
  swaySpeed: number;
  phase: number;
  r: number;
  age: number;
  life: number;
  cross: boolean;
  color: string;
}

export function startSparkles(canvas: HTMLCanvasElement, logo: LogoBox): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const context = ctx;

  let w = 0;
  let h = 0;
  let k = 1;
  let running = false;
  let visible = true;
  let raf = 0;
  let last = 0;
  let clock = 0;
  let emit = 0;

  function resize() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    k = w / FRAME_SOURCE_WIDTH;
  }
  resize();

  const narrow = w < 520;
  const twinkles: Twinkle[] = [];
  const twinkleCount = narrow ? 28 : 52;
  for (let i = 0; i < twinkleCount; i++) {
    let u: number;
    let v: number;
    if (Math.random() < 0.62) {
      // along the galaxy streak (bottom-left -> top-right of the frame)
      const t = Math.random();
      const spread = gaussian() * 0.07;
      u = 0.17 + t * 0.7 + spread * 0.45;
      v = 0.85 - t * 0.68 + spread * 0.9;
    } else {
      u = Math.random();
      v = Math.random();
    }
    twinkles.push({
      u: Math.min(0.98, Math.max(0.02, u)),
      v: Math.min(0.98, Math.max(0.02, v)),
      r: 2.2 + Math.random() * Math.random() * 5,
      period: 2.2 + Math.random() * 3.6,
      phase: Math.random() * 10,
      color: pickColor(),
    });
  }

  const motes: Mote[] = [];
  const maxMotes = narrow ? 50 : 110;
  const emitRate = narrow ? 9 : 16; // motes per second

  function spawnMote() {
    if (motes.length >= maxMotes) return;
    const sizeScale = Math.max(0.55, w / 777);
    motes.push({
      x0: (logo.x + Math.random() * logo.w) * w,
      y: (logo.y + logo.h * (0.5 + Math.random() * 0.25)) * h,
      vx: (Math.random() - 0.5) * 8 * sizeScale,
      vy: (16 + Math.random() * 30) * sizeScale,
      sway: (3 + Math.random() * 9) * sizeScale,
      swaySpeed: 1.2 + Math.random() * 2,
      phase: Math.random() * 6.28,
      r: (0.8 + Math.random() * 1.7) * sizeScale,
      age: 0,
      life: 2.4 + Math.random() * 2.4,
      cross: Math.random() < 0.28,
      color: pickColor(),
    });
  }

  function glow(x: number, y: number, r: number, alpha: number, color: string) {
    const g = context.createRadialGradient(x, y, 0, x, y, r * 3);
    g.addColorStop(0, `rgba(${color},${alpha})`);
    g.addColorStop(1, `rgba(${color},0)`);
    context.fillStyle = g;
    context.beginPath();
    context.arc(x, y, r * 3, 0, Math.PI * 2);
    context.fill();
  }

  function cross(x: number, y: number, r: number, alpha: number, color: string) {
    context.strokeStyle = `rgba(${color},${alpha * 0.9})`;
    context.lineWidth = Math.max(0.6, r * 0.32);
    context.beginPath();
    context.moveTo(x - r * 4, y);
    context.lineTo(x + r * 4, y);
    context.moveTo(x, y - r * 4);
    context.lineTo(x, y + r * 4);
    context.stroke();
  }

  function frame(now: number) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;

    context.clearRect(0, 0, w, h);
    context.globalCompositeOperation = 'lighter';

    for (const t of twinkles) {
      const s = 0.5 + 0.5 * Math.sin(((clock + t.phase) / t.period) * Math.PI * 2);
      const b = Math.pow(s, 4);
      if (b < 0.02) continue;
      const r = t.r * k * 1.6;
      const x = t.u * w;
      const y = t.v * h;
      glow(x, y, r, b * 0.55, t.color);
      if (t.r > 3.6) cross(x, y, r, b, t.color);
    }

    emit += dt * emitRate;
    while (emit >= 1) {
      spawnMote();
      emit -= 1;
    }
    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i];
      m.age += dt;
      if (m.age >= m.life) {
        motes.splice(i, 1);
        continue;
      }
      m.y += m.vy * dt;
      m.x0 += m.vx * dt;
      const x = m.x0 + Math.sin(m.age * m.swaySpeed + m.phase) * m.sway;
      const fade = Math.pow(Math.sin((Math.PI * m.age) / m.life), 1.3);
      const flicker = 0.55 + 0.45 * Math.sin(m.age * 13 + m.phase * 3);
      const alpha = fade * flicker;
      if (alpha < 0.02) continue;
      if (m.cross) {
        glow(x, m.y, m.r * 1.2, alpha * 0.5, m.color);
        cross(x, m.y, m.r * 0.9, alpha, m.color);
      } else {
        context.fillStyle = `rgba(${m.color},${alpha})`;
        context.beginPath();
        context.arc(x, m.y, m.r, 0, Math.PI * 2);
        context.fill();
      }
    }

    context.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || !visible || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible) start();
    else stop();
  });
  io.observe(canvas);

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);

  const onVisibility = () => {
    if (document.hidden) stop();
    else start();
  };
  document.addEventListener('visibilitychange', onVisibility);

  start();

  return () => {
    stop();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
