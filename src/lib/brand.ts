import './brand.css';

/* Brand motion: page loader hand-off and the animated desktop favicon. Dark N on off-white. */

const MIN_PRELOAD_MS = 1000;

/** Fades out the #preload loader from index.html once the app has mounted (at least MIN_PRELOAD_MS after navigation start). */
export function hidePreload(): void {
  const el = document.getElementById('preload');
  if (!el) return;
  window.setTimeout(
    () => {
      el.classList.add('out');
      window.setTimeout(() => el.remove(), 700);
    },
    Math.max(0, MIN_PRELOAD_MS - performance.now()),
  );
}

const INK = '#141413';
const BG = '#faf9f5';
const LOOP_MS = 2000;
const FRAME_MS = 66;
const SIZE = 64;
const STEM1_LEN = 33;
const STEM2_LEN = 89.47;

type Ease = (t: number) => number;

function bezier(a: number, b: number, c: number, d: number): Ease {
  return (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let u = t;
    for (let i = 0; i < 24; i += 1) {
      const s = 1 - u;
      const x = 3 * s * s * u * a + 3 * s * u * u * c + u * u * u;
      if (Math.abs(x - t) < 1e-4) break;
      if (x < t) lo = u;
      else hi = u;
      u = (lo + hi) / 2;
    }
    const s = 1 - u;
    return 3 * s * s * u * b + 3 * s * u * u * d + u * u * u;
  };
}

const easeBrand = bezier(0.6, 0, 0.2, 1);
const easeOut = bezier(0, 0, 0.58, 1);
const easeIn = bezier(0.42, 0, 1, 1);
const easeStd = bezier(0.25, 0.1, 0.25, 1);

function seg(f: number, a: number, b: number, ease: Ease, from: number, to: number): number {
  if (f <= a) return from;
  if (f >= b) return to;
  return from + (to - from) * ease((f - a) / (b - a));
}

/* Same timeline as the loader keyframes in brand.css. f is the loop position in percent. */
function dotScale(f: number): number {
  if (f < 15) return seg(f, 0, 15, easeOut, 0, 1.25);
  if (f < 25) return seg(f, 15, 25, easeStd, 1.25, 1);
  if (f < 75) return 1;
  if (f < 90) return seg(f, 75, 90, easeIn, 1, 0);
  return 0;
}
function stem1Offset(f: number): number {
  if (f < 10) return 1;
  if (f < 35) return seg(f, 10, 35, easeBrand, 1, 0);
  if (f < 70) return 0;
  if (f < 95) return seg(f, 70, 95, easeBrand, 0, -1);
  return -1;
}
function stem2Offset(f: number): number {
  if (f < 25) return 1;
  if (f < 60) return seg(f, 25, 60, easeBrand, 1, 0);
  if (f < 75) return 0;
  return seg(f, 75, 100, easeBrand, 0, -1);
}

function roundedTile(g: CanvasRenderingContext2D, s: number, r: number): void {
  g.beginPath();
  g.moveTo(r, 0);
  g.arcTo(s, 0, s, s, r);
  g.arcTo(s, s, 0, s, r);
  g.arcTo(0, s, 0, 0, r);
  g.arcTo(0, 0, s, 0, r);
  g.closePath();
}

function newIconLink(href: string): HTMLLinkElement {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = href;
  return link;
}

/** Animates the tab favicon (the loader N) on desktop browsers. Skipped on touch devices and with reduced motion. */
export function startFaviconAnimation(): void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const g = canvas.getContext('2d');
  if (!g || typeof Path2D === 'undefined') return;

  const stem1 = new Path2D('M26 77V44');
  const stem2 = new Path2D('M74 23V77L51 50');
  const originals = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'));
  let current = newIconLink('');
  let timer = 0;

  const drawStem = (path: Path2D, length: number, offset: number): void => {
    if (offset > 0.995 || offset < -0.995) return;
    g.setLineDash([length, length]);
    g.lineDashOffset = offset * length;
    g.stroke(path);
  };

  const frame = (): void => {
    const f = ((performance.now() % LOOP_MS) / LOOP_MS) * 100;
    const scale = dotScale(f);
    g.clearRect(0, 0, SIZE, SIZE);
    g.fillStyle = BG;
    roundedTile(g, SIZE, 14);
    g.fill();
    g.save();
    g.translate(-4, -4);
    g.scale(0.72, 0.72);
    g.fillStyle = INK;
    g.strokeStyle = INK;
    g.lineWidth = 16;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    if (scale > 0.01) {
      g.beginPath();
      g.arc(26, 23, 8 * scale, 0, Math.PI * 2);
      g.fill();
    }
    drawStem(stem1, STEM1_LEN, stem1Offset(f));
    drawStem(stem2, STEM2_LEN, stem2Offset(f));
    g.restore();
    const next = newIconLink(canvas.toDataURL('image/png'));
    current.replaceWith(next);
    current = next;
  };

  const start = (): void => {
    if (timer) return;
    originals.forEach((l) => l.remove());
    document.head.appendChild(current);
    frame();
    timer = window.setInterval(frame, FRAME_MS);
  };

  const stop = (): void => {
    if (!timer) return;
    window.clearInterval(timer);
    timer = 0;
    current.remove();
    originals.forEach((l) => document.head.appendChild(l));
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });
  if (!document.hidden) start();
}
