import * as THREE from 'three';

/** Deterministic PRNG so textures look the same on every load. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
}

function toTexture(c: HTMLCanvasElement, color = true, repeat?: [number, number], anisotropy = 1) {
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = anisotropy;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  if (repeat) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

export function setAnisotropy(tex: THREE.Texture, n: number) {
  tex.anisotropy = n;
  tex.needsUpdate = true;
}

function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, count: number, alpha: number, seed: number, dark = true) {
  const r = rng(seed);
  for (let i = 0; i < count; i += 1) {
    const v = dark ? 0 : 255;
    ctx.fillStyle = `rgba(${v},${v},${v},${r() * alpha})`;
    ctx.fillRect(r() * w, r() * h, 1 + r() * 1.5, 1 + r() * 1.5);
  }
}

/** Honey-oak planks: colour map plus a grain map used for bump and roughness. */
export function oakFloor(size = 512, anisotropy = 1) {
  const W = size;
  const [c, ctx] = canvas(W, W);
  const [g, gx] = canvas(W, W);
  const r = rng(7);
  const planks = 8;
  const pw = W / planks;
  gx.fillStyle = '#7a7a7a';
  gx.fillRect(0, 0, W, W);
  for (let i = 0; i < planks; i += 1) {
    const tone = 0.9 + r() * 0.18;
    const base = [172 * tone, 132 * tone, 98 * tone].map((v) => Math.min(255, v | 0));
    ctx.fillStyle = `rgb(${base.join(',')})`;
    ctx.fillRect(i * pw, 0, pw, W);
    for (let k = 0; k < 46; k += 1) {
      const x = i * pw + r() * pw;
      const amp = 1 + r() * 3;
      const freq = 0.01 + r() * 0.02;
      const phase = r() * 6;
      const dark = r() > 0.5;
      ctx.strokeStyle = dark ? `rgba(90,52,28,${0.08 + r() * 0.12})` : `rgba(235,190,140,${0.05 + r() * 0.08})`;
      gx.strokeStyle = dark ? 'rgba(40,40,40,0.25)' : 'rgba(200,200,200,0.15)';
      ctx.lineWidth = gx.lineWidth = 0.6 + r() * 1.4;
      ctx.beginPath();
      gx.beginPath();
      for (let y = 0; y <= W; y += 8) {
        const xx = Math.min(i * pw + pw - 1, Math.max(i * pw + 1, x + Math.sin(y * freq + phase) * amp));
        if (y === 0) {
          ctx.moveTo(xx, y);
          gx.moveTo(xx, y);
        } else {
          ctx.lineTo(xx, y);
          gx.lineTo(xx, y);
        }
      }
      ctx.stroke();
      gx.stroke();
    }
    // butt joint somewhere along the plank
    const joint = r() * W;
    for (const [cx2, col] of [[ctx, 'rgba(70,40,20,0.55)'], [gx, 'rgba(0,0,0,0.9)']] as const) {
      cx2.fillStyle = col;
      cx2.fillRect(i * pw, joint, pw, 1.5);
      cx2.fillRect(i * pw, 0, 1.5, W);
    }
  }
  speckle(ctx, W, W, Math.round(2500 * (W / 512) ** 2), 0.12, 3);
  return { map: toTexture(c, true, [1.5, 1.5], anisotropy), grain: toTexture(g, false, [1.5, 1.5], anisotropy) };
}

export function plaster(base: string, size = 256, anisotropy = 1) {
  const W = size;
  const [c, ctx] = canvas(W, W);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, W);
  speckle(ctx, W, W, 5000, 0.05, 11);
  speckle(ctx, W, W, 3000, 0.05, 12, false);
  const [g, gx] = canvas(W, W);
  gx.fillStyle = '#808080';
  gx.fillRect(0, 0, W, W);
  speckle(gx, W, W, Math.round(7000 * (W / 256) ** 2), 0.35, 13);
  speckle(gx, W, W, Math.round(4000 * (W / 256) ** 2), 0.3, 14, false);
  return { map: toTexture(c, true, [3, 3], anisotropy), grain: toTexture(g, false, [3, 3], anisotropy) };
}

/** Woven wool rug with a rust border band. */
export function rugTexture(size = 512, anisotropy = 1) {
  const W = size;
  const [c, ctx] = canvas(W, W);
  ctx.fillStyle = '#e4d7c3';
  ctx.fillRect(0, 0, W, W);
  const r = rng(21);
  for (let y = 0; y < W; y += 3) {
    ctx.fillStyle = `rgba(150,120,90,${0.05 + r() * 0.06})`;
    ctx.fillRect(0, y, W, 1);
  }
  for (let x = 0; x < W; x += 3) {
    ctx.fillStyle = `rgba(255,250,240,${0.04 + r() * 0.05})`;
    ctx.fillRect(x, 0, 1, W);
  }
  const s = W / 512;
  ctx.strokeStyle = '#b3573b';
  ctx.lineWidth = Math.max(2, 22 * s);
  ctx.strokeRect(40 * s, 40 * s, W - 80 * s, W - 80 * s);
  ctx.strokeStyle = 'rgba(179,87,59,0.55)';
  ctx.lineWidth = Math.max(1, 4 * s);
  ctx.strokeRect(78 * s, 78 * s, W - 156 * s, W - 156 * s);
  speckle(ctx, W, W, Math.round(6000 * (W / 512) ** 2), 0.08, 22);
  const [g, gx] = canvas(W, W);
  gx.drawImage(c, 0, 0);
  return { map: toTexture(c, true, undefined, anisotropy), grain: toTexture(g, false, undefined, anisotropy) };
}

export function cork(size = 256, anisotropy = 1) {
  const W = size;
  const [c, ctx] = canvas(W, W);
  ctx.fillStyle = '#b48a5e';
  ctx.fillRect(0, 0, W, W);
  const r = rng(31);
  for (let i = 0; i < Math.round(2200 * (W / 256) ** 2); i += 1) {
    const d = r();
    ctx.fillStyle = d > 0.5 ? `rgba(90,60,30,${0.2 + r() * 0.3})` : `rgba(230,190,140,${0.15 + r() * 0.25})`;
    ctx.beginPath();
    ctx.arc(r() * W, r() * W, 0.6 + r() * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  return toTexture(c, true, undefined, anisotropy);
}

export function fabric(base: string, size = 128, anisotropy = 1) {
  const W = size;
  const [c, ctx] = canvas(W, W);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, W);
  for (let y = 0; y < W; y += 2) {
    ctx.fillStyle = `rgba(0,0,0,${y % 4 ? 0.05 : 0.1})`;
    ctx.fillRect(0, y, W, 1);
  }
  speckle(ctx, W, W, Math.round(1500 * (W / 128) ** 2), 0.1, 41);
  return toTexture(c, true, [4, 4], anisotropy);
}

/** Abstract prints: no text, no project names. */
export function print(kind: 0 | 1 | 2) {
  const W = 256;
  const H = kind === 0 ? 320 : 256;
  const [c, ctx] = canvas(W, H);
  ctx.fillStyle = ['#efe6d8', '#2e3d36', '#e9dfcf'][kind];
  ctx.fillRect(0, 0, W, H);
  if (kind === 0) {
    ctx.fillStyle = '#c0583a';
    ctx.beginPath();
    ctx.arc(W / 2, H * 0.42, 62, Math.PI, 0);
    ctx.lineTo(W / 2 + 62, H * 0.78);
    ctx.lineTo(W / 2 - 62, H * 0.78);
    ctx.fill();
    ctx.fillStyle = '#2e3d36';
    ctx.fillRect(W / 2 - 62, H * 0.78, 124, 10);
    ctx.fillStyle = '#d9a35b';
    ctx.beginPath();
    ctx.arc(W / 2 + 40, H * 0.3, 18, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 1) {
    ctx.strokeStyle = '#e6d6bd';
    ctx.lineWidth = 3;
    for (let i = 0; i < 7; i += 1) {
      ctx.beginPath();
      ctx.arc(W * 0.3, H * 0.7, 26 + i * 18, -Math.PI / 2, 0);
      ctx.stroke();
    }
    ctx.fillStyle = '#d9a35b';
    ctx.beginPath();
    ctx.arc(W * 0.72, H * 0.3, 20, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const colors = ['#2e3d36', '#c0583a', '#d9a35b', '#8ea394'];
    colors.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(36 + i * 48, 70 + (i % 2) * 30, 32, 120 - (i % 2) * 30);
    });
  }
  speckle(ctx, W, H, 1800, 0.06, 51 + kind);
  return toTexture(c);
}

/** Editor-like screen: sidebar, tabs, syntax-coloured lines. Emissive, no text. */
export function screen() {
  const W = 512;
  const H = 300;
  const [c, ctx] = canvas(W, H);
  ctx.fillStyle = '#1c1f24';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#23272d';
  ctx.fillRect(0, 0, 96, H);
  ctx.fillStyle = '#2a2f36';
  ctx.fillRect(96, 0, W - 96, 26);
  ctx.fillStyle = '#1c1f24';
  ctx.fillRect(104, 4, 90, 22);
  const r = rng(61);
  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = `rgba(230,220,200,${0.18 + r() * 0.2})`;
    ctx.fillRect(16 + (i % 3 ? 10 : 0), 42 + i * 22, 40 + r() * 30, 6);
  }
  const palette = ['#e2a46a', '#9fb6a6', '#d9765a', '#e8dcc6', '#b7a3d9'];
  let y = 44;
  for (let i = 0; i < 11; i += 1) {
    let x = 120 + [0, 1, 2, 2, 1, 2, 3, 3, 2, 1, 0][i] * 18;
    ctx.fillStyle = 'rgba(230,220,200,0.18)';
    ctx.fillRect(104, y, 8, 6);
    const n = 1 + Math.floor(r() * 3);
    for (let k = 0; k < n; k += 1) {
      const w = 24 + r() * 90;
      ctx.fillStyle = palette[Math.floor(r() * palette.length)];
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, y, w, 6);
      x += w + 8;
    }
    ctx.globalAlpha = 1;
    y += 22;
  }
  return toTexture(c);
}

/** Golden-hour view through the window: sky, sun, two hill layers. */
export function windowView() {
  const W = 256;
  const H = 320;
  const [c, ctx] = canvas(W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#8fb3c9');
  g.addColorStop(0.55, '#f2cf9f');
  g.addColorStop(1, '#f6b47a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const sun = ctx.createRadialGradient(170, 205, 4, 170, 205, 90);
  sun.addColorStop(0, 'rgba(255,244,214,1)');
  sun.addColorStop(0.2, 'rgba(255,230,180,0.8)');
  sun.addColorStop(1, 'rgba(255,220,170,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#b98a6c';
  ctx.beginPath();
  ctx.moveTo(0, 250);
  ctx.quadraticCurveTo(90, 215, 160, 245);
  ctx.quadraticCurveTo(210, 232, 256, 240);
  ctx.lineTo(256, 320);
  ctx.lineTo(0, 320);
  ctx.fill();
  ctx.fillStyle = '#6f6a52';
  ctx.beginPath();
  ctx.moveTo(0, 280);
  ctx.quadraticCurveTo(120, 252, 256, 276);
  ctx.lineTo(256, 320);
  ctx.lineTo(0, 320);
  ctx.fill();
  return toTexture(c);
}

/** Soft blob for contact shadows and light patches. */
export function softBlob(inner: string, outer: string, square = false) {
  const W = 128;
  const [c, ctx] = canvas(W, W);
  if (square) {
    const pad = 18;
    ctx.filter = 'blur(10px)';
    ctx.fillStyle = inner;
    ctx.fillRect(pad, pad, W - pad * 2, W - pad * 2);
  } else {
    const g = ctx.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, W);
  }
  return toTexture(c);
}

/** Window-shaped light patch (four panes) with soft edges. */
export function windowPatch() {
  const W = 256;
  const [c, ctx] = canvas(W, W);
  ctx.filter = 'blur(7px)';
  ctx.fillStyle = 'rgba(255,255,255,1)';
  const pad = 30;
  const gap = 10;
  const cell = (W - pad * 2 - gap) / 2;
  for (const i of [0, 1]) for (const j of [0, 1]) ctx.fillRect(pad + i * (cell + gap), pad + j * (cell + gap), cell, cell);
  return toTexture(c, false);
}
