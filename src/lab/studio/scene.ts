import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createStudioStage } from './stage';
import { Batch, bendY, chamfer, lathe, leafGeometry, tube } from './model';
import * as T from './textures';
import { createFpsWatch, detectTier } from './quality';

const P = {
  putty: 0xd9ccb9,
  trim: 0xf1ebe1,
  oak: 0xc08a5c,
  oakDark: 0x8d5f3c,
  ink: 0x25272c,
  forest: 0x32493f,
  rust: 0xb5573b,
  brass: 0xc69c62,
  oat: 0xe6dccb,
  sand: 0xd7c3a3,
  sage: 0x8fa294,
  ceramic: 0xf0ebe3,
  terracotta: 0xc27a55,
  leaf: 0x3e6a48,
  leafLight: 0x5b8a5c,
  alu: 0xc9c8c4,
};

export const STUDIO_SPOTS = ['Work', 'Skills', 'Projects', 'Experience', 'Contact'] as const;

interface View {
  target: THREE.Vector3;
  az: number;
  el: number;
  dist: number;
  ox: number;
  oy: number;
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export interface StudioHooks {
  onFirstFrame?: () => void;
  onFullQuality?: () => void;
  onHover?: (index: number | null) => void;
}

export interface StudioHandle {
  focus: (index: number | null) => void;
  highlight: (index: number | null) => void;
  anchors: () => { x: number; y: number; visible: boolean }[];
  upgrade: () => Promise<void>;
  beginIntro: () => void;
  pauseLoop: (paused: boolean) => void;
  renderFrame: (t: number, dt: number) => void;
  snapshot: () => string;
  phase: () => 'light' | 'full';
  dispose: () => void;
}

const stub = (): StudioHandle => ({
  focus: () => {},
  highlight: () => {},
  anchors: () => [],
  upgrade: async () => {},
  beginIntro: () => {},
  pauseLoop: () => {},
  renderFrame: () => {},
  snapshot: () => '',
  phase: () => 'light',
  dispose: () => {},
});

function searchParam(name: string) {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

export function mountStudio(host: HTMLElement, hooks: StudioHooks = {}): StudioHandle {
  const mounted = createStudioStage(host);
  if (!mounted) return stub();
  const stage = mounted;
  const { scene, camera, phone } = stage;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hold = searchParam('hold');
  const demo = searchParam('demo') === '1';
  const startLit = hold === 'full' || reduced;

  // ---------- background ----------
  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = 512;
  bgCanvas.height = 512;
  const bg = bgCanvas.getContext('2d')!;
  const bgGrad = bg.createRadialGradient(330, 250, 20, 256, 256, 420);
  bgGrad.addColorStop(0, '#4a403a');
  bgGrad.addColorStop(0.45, '#2a2523');
  bgGrad.addColorStop(1, '#141211');
  bg.fillStyle = bgGrad;
  bg.fillRect(0, 0, 512, 512);
  const bgTex = new THREE.CanvasTexture(bgCanvas);
  bgTex.colorSpace = THREE.SRGBColorSpace;
  scene.background = bgTex;
  scene.environmentIntensity = 0.42;

  // ---------- materials (stage 1: low-res canvases) ----------
  const lo = {
    floor: T.oakFloor(128, 1),
    wall: T.plaster('#d9ccb9', 128, 1),
    rug: T.rugTexture(128, 1),
    fabric: T.fabric('#ffffff', 64, 1),
    cork: T.cork(128, 1),
  };
  const M = {
    floor: new THREE.MeshStandardMaterial({ map: lo.floor.map, roughnessMap: lo.floor.grain, bumpMap: lo.floor.grain, bumpScale: 0.6, roughness: 0.85 }),
    floorEdge: new THREE.MeshStandardMaterial({ color: P.oakDark, roughness: 0.7 }),
    wall: new THREE.MeshStandardMaterial({ map: lo.wall.map, bumpMap: lo.wall.grain, bumpScale: 0.35, roughness: 0.95 }),
    trim: new THREE.MeshStandardMaterial({ color: P.trim, roughness: 0.55 }),
    oak: new THREE.MeshStandardMaterial({ color: 0xf0e2d2, map: lo.floor.map, roughness: 0.55, bumpMap: lo.floor.grain, bumpScale: 0.3 }),
    ink: new THREE.MeshStandardMaterial({ color: P.ink, roughness: 0.42, metalness: 0.15 }),
    inkMatte: new THREE.MeshStandardMaterial({ color: P.ink, roughness: 0.8 }),
    forest: new THREE.MeshStandardMaterial({ color: P.forest, map: lo.fabric, roughness: 0.92 }),
    oatFabric: new THREE.MeshStandardMaterial({ color: P.oat, map: lo.fabric, roughness: 0.95 }),
    rust: new THREE.MeshStandardMaterial({ color: P.rust, roughness: 0.6 }),
    brass: new THREE.MeshStandardMaterial({ color: P.brass, roughness: 0.32, metalness: 0.85 }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: P.ceramic, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
    terracotta: new THREE.MeshStandardMaterial({ color: P.terracotta, roughness: 0.85 }),
    sand: new THREE.MeshStandardMaterial({ color: P.sand, roughness: 0.8 }),
    sage: new THREE.MeshStandardMaterial({ color: P.sage, roughness: 0.75 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xf6f1e8, roughness: 0.9 }),
    alu: new THREE.MeshStandardMaterial({ color: P.alu, roughness: 0.35, metalness: 0.7 }),
    keys: new THREE.MeshStandardMaterial({ color: 0xeeeae3, roughness: 0.6 }),
    rug: new THREE.MeshStandardMaterial({ map: lo.rug.map, bumpMap: lo.rug.grain, bumpScale: 0.8, roughness: 1 }),
    cork: new THREE.MeshStandardMaterial({ map: lo.cork, roughness: 0.95 }),
    leaf: new THREE.MeshStandardMaterial({ color: P.leaf, roughness: 0.55, side: THREE.DoubleSide }),
    leafLight: new THREE.MeshStandardMaterial({ color: P.leafLight, roughness: 0.55, side: THREE.DoubleSide }),
    soil: new THREE.MeshStandardMaterial({ color: 0x3b2c22, roughness: 1 }),
    stem: new THREE.MeshStandardMaterial({ color: 0x5a4a2f, roughness: 0.8 }),
  };
  const books = [P.forest, P.rust, P.oat, P.ink, P.sand, P.sage, 0x7a5a45].map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 }),
  );
  const prints = ([0, 1, 2] as const).map((k) => new THREE.MeshStandardMaterial({ map: T.print(k), roughness: 0.9 }));

  // ---------- lights (lamp starts off so the poster matches the first frame) ----------
  scene.add(new THREE.HemisphereLight(0xe3e9f2, 0x7a5a42, startLit ? 0.55 : 0.42));
  const key = new THREE.DirectionalLight(0xffe3c4, startLit ? 2.4 : 1.2);
  key.position.set(5.5, 8, 6.5);
  key.castShadow = false;
  key.shadow.mapSize.set(phone ? 1024 : 2048, phone ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -3.6, right: 3.6, top: 3.6, bottom: -3.6, near: 1, far: 20 });
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 4;
  key.shadow.intensity = 0;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xc9d6ff, startLit ? 0.45 : 0.55);
  fill.position.set(-6, 3, 5);
  scene.add(fill);

  const S = 4.4;
  const H = 2.85;
  const WT = 0.12;
  const back = -S / 2;
  const left = -S / 2;

  const room = new THREE.Group();
  scene.add(room);
  const b = new Batch();

  // ---------- shell ----------
  b.add(chamfer(S, 0.16, S, 0.025, 3), M.floor, [0, -0.08, 0]);
  b.add(chamfer(S + 0.04, 0.06, S + 0.04, 0.02), M.floorEdge, [0, -0.19, 0]);

  // back wall with a window opening
  const win = { x: 0.95, y: 1.55, w: 1.05, h: 1.25 };
  const wallShape = new THREE.Shape();
  wallShape.moveTo(-S / 2, 0);
  wallShape.lineTo(S / 2, 0);
  wallShape.lineTo(S / 2, H);
  wallShape.lineTo(-S / 2, H);
  wallShape.lineTo(-S / 2, 0);
  const hole = new THREE.Path();
  hole.moveTo(win.x - win.w / 2, win.y - win.h / 2);
  hole.lineTo(win.x - win.w / 2, win.y + win.h / 2);
  hole.lineTo(win.x + win.w / 2, win.y + win.h / 2);
  hole.lineTo(win.x + win.w / 2, win.y - win.h / 2);
  hole.lineTo(win.x - win.w / 2, win.y - win.h / 2);
  wallShape.holes.push(hole);
  const backWall = new THREE.ExtrudeGeometry(wallShape, { depth: WT, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 });
  const uvs = backWall.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uvs.count; i += 1) uvs.setXY(i, uvs.getX(i) / S, uvs.getY(i) / H);
  b.add(backWall, M.wall, [0, 0, back - WT]);
  b.add(chamfer(WT, H, S + WT, 0.012), M.wall, [left - WT / 2, H / 2, -WT / 2]);

  // skirting and window joinery
  b.add(chamfer(S, 0.09, 0.022, 0.006), M.trim, [0, 0.045, back + 0.022]);
  b.add(chamfer(0.018, 0.09, S, 0.006), M.trim, [left + 0.009, 0.045, 0]);
  const fw = 0.05;
  const depth = WT + 0.04;
  for (const [x, y, w, h] of [
    [win.x, win.y + win.h / 2 + fw / 2, win.w + fw * 2, fw],
    [win.x - win.w / 2 - fw / 2, win.y, fw, win.h],
    [win.x + win.w / 2 + fw / 2, win.y, fw, win.h],
  ] as const) {
    b.add(chamfer(w, h, depth, 0.008), M.trim, [x, y, back - WT / 2 + 0.02]);
  }
  b.add(chamfer(win.w + 0.22, 0.04, 0.2, 0.01), M.trim, [win.x, win.y - win.h / 2 - 0.02, back + 0.05]);
  b.add(chamfer(0.03, win.h, 0.03, 0.006), M.trim, [win.x, win.y, back - WT / 2]);
  b.add(chamfer(win.w, 0.03, 0.03, 0.006), M.trim, [win.x, win.y + 0.12, back - WT / 2]);
  const view = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 1.75),
    new THREE.MeshBasicMaterial({ map: T.windowView(), color: new THREE.Color(1.25, 1.2, 1.15) }),
  );
  view.position.set(win.x - 0.05, win.y - 0.05, back - WT - 0.32);
  room.add(view);

  // light switch and outlet: small scale cues
  b.add(chamfer(0.012, 0.11, 0.075, 0.004), M.trim, [left + 0.006, 1.1, 1.55]);
  b.add(chamfer(0.075, 0.075, 0.012, 0.004), M.trim, [-1.35, 0.28, back + 0.006]);

  // ---------- rug ----------
  b.add(new RoundedBoxGeometry(2.3, 0.018, 1.6, 2, 0.008), M.rug, [0.35, 0.009, 0.25], [0, 0.05, 0]);

  // ---------- desk (Work) ----------
  const desk = new THREE.Matrix4().makeTranslation(-0.35, 0, back + 0.42);
  const deskH = 0.74;
  b.add(chamfer(1.5, 0.035, 0.68, 0.01, 3), M.oak, [0, deskH, 0], [0, 0, 0], 1, desk);
  for (const [x, z] of [[-0.68, 0.28], [0.68, 0.28], [-0.68, -0.28], [0.68, -0.28]] as const) {
    b.add(new THREE.CylinderGeometry(0.018, 0.012, deskH - 0.02, 12), M.oak, [x, (deskH - 0.02) / 2, z], [z > 0 ? 0.04 : -0.04, 0, x > 0 ? -0.04 : 0.04], 1, desk);
  }
  b.add(chamfer(1.36, 0.06, 0.03, 0.008), M.oak, [0, deskH - 0.05, -0.3], [0, 0, 0], 1, desk);
  // drawer unit
  b.add(chamfer(0.38, 0.5, 0.5, 0.012), M.sand, [0.48, 0.25 + 0.02, -0.04], [0, 0, 0], 1, desk);
  for (const y of [0.15, 0.38]) b.add(chamfer(0.12, 0.012, 0.01, 0.003), M.brass, [0.48, y, 0.215], [0, 0, 0], 1, desk);
  // monitor
  b.add(chamfer(0.68, 0.4, 0.022, 0.008, 3), M.ink, [-0.05, deskH + 0.4, -0.16], [-0.04, 0, 0], 1, desk);
  b.add(new THREE.CylinderGeometry(0.016, 0.016, 0.26, 12), M.alu, [-0.05, deskH + 0.14, -0.2], [0, 0, 0], 1, desk);
  b.add(chamfer(0.22, 0.012, 0.16, 0.005), M.alu, [-0.05, deskH + 0.024, -0.18], [0, 0, 0], 1, desk);
  const screenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.64, 0.36),
    new THREE.MeshBasicMaterial({ map: T.screen(), color: new THREE.Color(1.35, 1.35, 1.35) }),
  );
  screenMesh.position.set(-0.05 - 0.35, deskH + 0.4, back + 0.42 - 0.148);
  screenMesh.rotation.x = -0.04;
  room.add(screenMesh);
  b.add(tube([new THREE.Vector3(-0.05, deskH + 0.06, -0.24), new THREE.Vector3(-0.02, deskH + 0.01, -0.3), new THREE.Vector3(0.05, deskH - 0.3, -0.32), new THREE.Vector3(0.1, 0.02, -0.3)], 0.006), M.inkMatte, [0, 0, 0], [0, 0, 0], 1, desk);
  // keyboard + keycaps (instanced)
  b.add(chamfer(0.42, 0.014, 0.135, 0.005), M.alu, [-0.08, deskH + 0.025, 0.12], [0.03, 0, 0], 1, desk);
  const capGeo = new RoundedBoxGeometry(0.024, 0.01, 0.023, 1, 0.004);
  const caps = new THREE.InstancedMesh(capGeo, M.keys, 14 * 4 + 1);
  const dm = new THREE.Object3D();
  let ci = 0;
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 14; c += 1) {
      dm.position.set(-0.08 - 0.185 + c * 0.0285 + (r % 2) * 0.006 - 0.35, deskH + 0.037 + r * 0.0009, back + 0.42 + 0.06 + r * 0.027);
      dm.rotation.set(0.03, 0, 0);
      dm.scale.set(1, 1, 1);
      dm.updateMatrix();
      caps.setMatrixAt(ci, dm.matrix);
      ci += 1;
    }
  }
  dm.position.set(-0.08 - 0.35, deskH + 0.04, back + 0.42 + 0.17);
  dm.scale.set(6, 1, 1);
  dm.updateMatrix();
  caps.setMatrixAt(ci, dm.matrix);
  caps.castShadow = true;
  caps.receiveShadow = true;
  room.add(caps);
  // mouse, mug, notebook
  b.add(new THREE.SphereGeometry(0.03, 20, 12), M.ink, [0.24, deskH + 0.03, 0.12], [0, 0.2, 0], [1, 0.45, 1.6], desk);
  const mugProfile: [number, number][] = [[0, 0], [0.038, 0], [0.04, 0.005], [0.04, 0.09], [0.035, 0.092], [0.034, 0.012], [0, 0.012]];
  b.add(lathe(mugProfile, 32), M.ceramic, [0.42, deskH + 0.018, 0.08], [0, 0, 0], 1, desk);
  b.add(new THREE.TorusGeometry(0.024, 0.006, 8, 20, Math.PI), M.ceramic, [0.462, deskH + 0.063, 0.08], [0, 0, -Math.PI / 2], 1, desk);
  b.add(new THREE.CylinderGeometry(0.034, 0.034, 0.004, 24), M.soil, [0.42, deskH + 0.095, 0.08], [0, 0, 0], 1, desk);
  b.add(chamfer(0.2, 0.016, 0.26, 0.005), M.forest, [-0.5, deskH + 0.026, 0.06], [0, 0.25, 0], 1, desk);
  b.add(chamfer(0.19, 0.008, 0.25, 0.003), M.paper, [-0.5, deskH + 0.02, 0.06], [0, 0.25, 0], 1, desk);
  b.add(chamfer(0.012, 0.018, 0.26, 0.002), M.rust, [-0.44, deskH + 0.027, 0.04], [0, 0.25, 0], 1, desk);
  // architect lamp
  const lampBase = new THREE.Vector3(0.64, deskH + 0.018, -0.22);
  const j1 = new THREE.Vector3(0.66, deskH + 0.34, -0.12);
  const j2 = new THREE.Vector3(0.55, deskH + 0.54, 0.02);
  b.add(lathe([[0, 0], [0.075, 0], [0.078, 0.008], [0.07, 0.022], [0, 0.024]], 32), M.ink, [lampBase.x, lampBase.y, lampBase.z], [0, 0, 0], 1, desk);
  for (const [a, c] of [[lampBase.clone().setY(lampBase.y + 0.02), j1], [j1, j2]] as const) {
    const len = a.distanceTo(c);
    const g = new THREE.CylinderGeometry(0.008, 0.008, len, 10);
    g.translate(0, len / 2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), c.clone().sub(a).normalize()));
    b.add(g, M.brass, [a.x, a.y, a.z], [0, 0, 0], 1, desk);
  }
  b.add(new THREE.SphereGeometry(0.016, 14, 10), M.ink, [j1.x, j1.y, j1.z], [0, 0, 0], 1, desk);
  b.add(new THREE.SphereGeometry(0.014, 14, 10), M.ink, [j2.x, j2.y, j2.z], [0, 0, 0], 1, desk);
  const shadeGeo = lathe([[0.012, 0.0], [0.03, -0.01], [0.06, -0.07], [0.085, -0.13], [0.083, -0.132], [0.058, -0.072], [0.028, -0.012], [0.01, -0.002]], 40);
  b.add(shadeGeo, M.ink, [j2.x - 0.03, j2.y + 0.01, j2.z + 0.01], [-0.55, 0, -0.55], 1, desk);
  const bulbWorld = new THREE.Vector3(j2.x - 0.06, j2.y - 0.03, j2.z + 0.045).applyMatrix4(desk);
  const bulbMat = new THREE.MeshBasicMaterial({ color: startLit ? new THREE.Color(6, 4.6, 3) : new THREE.Color(0.38, 0.28, 0.2) });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 12), bulbMat);
  bulb.position.copy(bulbWorld);
  room.add(bulb);
  const lampMax = phone ? 4.2 : 5;
  const lamp = new THREE.SpotLight(0xffc48a, startLit ? lampMax : 0, 3.2, 0.85, 0.7, 1.4);
  lamp.position.copy(bulbWorld);
  lamp.target.position.set(bulbWorld.x - 0.25, deskH, bulbWorld.z + 0.25);
  lamp.castShadow = false;
  lamp.shadow.mapSize.set(512, 512);
  lamp.shadow.radius = 5;
  lamp.shadow.bias = -0.0008;
  scene.add(lamp, lamp.target);

  // ---------- task chair ----------
  const chair = new THREE.Matrix4().compose(new THREE.Vector3(-0.42, 0, back + 1.12), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.42, 0)), new THREE.Vector3(1, 1, 1));
  b.add(new RoundedBoxGeometry(0.46, 0.07, 0.44, 3, 0.03), M.forest, [0, 0.47, 0], [0, 0, 0], 1, chair);
  b.add(bendY(new RoundedBoxGeometry(0.44, 0.42, 0.05, 3, 0.022), 0.4), M.forest, [0, 0.82, 0.2], [-0.1, Math.PI, 0], 1, chair);
  b.add(tube([new THREE.Vector3(0, 0.44, 0.12), new THREE.Vector3(0, 0.5, 0.24), new THREE.Vector3(0, 0.68, 0.25)], 0.014, 16), M.ink, [0, 0, 0], [0, 0, 0], 1, chair);
  b.add(new THREE.CylinderGeometry(0.022, 0.026, 0.34, 14), M.alu, [0, 0.27, 0], [0, 0, 0], 1, chair);
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2;
    b.add(chamfer(0.3, 0.025, 0.04, 0.008), M.ink, [Math.cos(a) * 0.15, 0.08, Math.sin(a) * 0.15], [0, -a, -0.06], 1, chair);
    b.add(new THREE.SphereGeometry(0.024, 12, 8), M.inkMatte, [Math.cos(a) * 0.29, 0.026, Math.sin(a) * 0.29], [0, 0, 0], 1, chair);
  }

  // ---------- floating shelves (Skills) ----------
  const shelf = new THREE.Matrix4().makeTranslation(left + 0.12, 0, 0.05);
  for (const y of [1.18, 1.62]) b.add(chamfer(0.22, 0.032, 1.0, 0.008), M.oak, [0, y, 0], [0, 0, 0], 1, shelf);
  const bookSpec: [number, number][][] = [
    [[0.24, 0.035], [0.27, 0.03], [0.22, 0.04], [0.26, 0.028], [0.25, 0.034], [0.21, 0.03], [0.28, 0.036], [0.23, 0.03]],
    [[0.22, 0.04], [0.25, 0.03], [0.2, 0.034], [0.27, 0.03], [0.23, 0.036]],
  ];
  bookSpec.forEach((row, ri) => {
    const y = ri === 0 ? 1.196 : 1.636;
    let z = ri === 0 ? -0.44 : -0.05;
    row.forEach(([h, w], i) => {
      const lean = ri === 1 && i === row.length - 1 ? 0.28 : 0;
      b.add(chamfer(0.16, h, w, 0.004), books[(i + ri * 3) % books.length], [0, y + h / 2, z + w / 2 + (lean ? 0.04 : 0)], [lean, 0, 0], 1, shelf);
      z += w + 0.004;
    });
  });
  b.add(lathe([[0, 0], [0.05, 0], [0.06, 0.05], [0.045, 0.13], [0.025, 0.16], [0.028, 0.18], [0, 0.18]], 32), M.ceramic, [0.0, 1.636, -0.32], [0, 0, 0], 1, shelf);
  b.add(lathe([[0, 0], [0.045, 0], [0.05, 0.06], [0.0, 0.065]], 28), M.terracotta, [0.0, 1.196, 0.4], [0, 0, 0], 1, shelf);
  b.add(new THREE.SphereGeometry(0.035, 16, 12), M.leafLight, [0.0, 1.27, 0.4], [0, 0, 0], [1.2, 0.8, 1.2], shelf);
  b.add(chamfer(0.04, 0.12, 0.09, 0.006), M.brass, [0, 1.656 + 0.06, 0.36], [0, 0, 0], 1, shelf);

  // ---------- gallery frames (Projects) ----------
  const frames: [number, number, number, number, number][] = [
    [-0.82, 1.78, 0.5, 0.64, 0],
    [-0.22, 1.86, 0.42, 0.42, 1],
    [-0.22, 1.42, 0.42, 0.3, 2],
  ];
  for (const [x, y, w, h, k] of frames) {
    b.add(chamfer(w, h, 0.03, 0.005), M.ink, [x, y, back + 0.027]);
    b.add(new THREE.PlaneGeometry(w - 0.04, h - 0.04), M.paper, [x, y, back + 0.0425]);
    b.add(new THREE.PlaneGeometry(w - 0.14, h - 0.14), prints[k], [x, y, back + 0.0435]);
  }

  // ---------- pinboard with ten pins (Experience) ----------
  const board = new THREE.Matrix4().compose(new THREE.Vector3(left + 0.02, 1.62, -1.15), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)), new THREE.Vector3(1, 1, 1));
  b.add(chamfer(1.0, 0.62, 0.025, 0.006), M.oak, [0, 0, 0], [0, 0, 0], 1, board);
  b.add(new THREE.PlaneGeometry(0.94, 0.56), M.cork, [0, 0, 0.0135], [0, 0, 0], 1, board);
  const pins: THREE.Vector3[] = [];
  for (let i = 0; i < 10; i += 1) {
    const p = new THREE.Vector3(-0.4 + i * 0.089, -0.18 + Math.pow(i / 9, 1.3) * 0.34, 0.02);
    pins.push(p);
    const last = i === 9;
    b.add(new THREE.CylinderGeometry(0.0022, 0.0022, 0.02, 6), M.brass, [p.x, p.y, p.z - 0.002], [Math.PI / 2, 0, 0], 1, board);
    b.add(new THREE.SphereGeometry(last ? 0.016 : 0.011, 18, 12), last ? M.rust : M.brass, [p.x, p.y, p.z + 0.01], [0, 0, 0], [1, 1, 0.7], board);
  }
  b.add(tube(pins.map((p) => p.clone().setZ(0.022)), 0.0025, 60), M.rust, [0, 0, 0], [0, 0, 0], 1, board);
  for (const [x, y, r] of [[-0.3, 0.14, -0.06], [0.05, -0.12, 0.04], [0.28, 0.16, 0.05]] as const) {
    b.add(new THREE.BoxGeometry(0.13, 0.09, 0.002), M.paper, [x, y, 0.016], [0, 0, r], 1, board);
    for (let l = 0; l < 3; l += 1) {
      const lx = x - 0.012 * l * Math.sin(r);
      b.add(new THREE.PlaneGeometry(l === 0 ? 0.07 : 0.09, l === 0 ? 0.009 : 0.004), l === 0 ? M.ink : M.alu, [lx - (l === 0 ? 0.02 : 0.01), y + 0.022 - l * 0.018, 0.0175], [0, 0, r], 1, board);
    }
  }

  // ---------- fiddle-leaf plant ----------
  const plant = new THREE.Group();
  plant.position.set(left + 0.42, 0, back + 0.42);
  const pb = new Batch();
  pb.add(lathe([[0, 0], [0.16, 0], [0.19, 0.04], [0.21, 0.36], [0.225, 0.38], [0.225, 0.4], [0.2, 0.4], [0.19, 0.37], [0, 0.37]], 40), M.ceramic);
  pb.add(new THREE.CylinderGeometry(0.19, 0.19, 0.01, 32), M.soil, [0, 0.37, 0]);
  const stems: THREE.Vector3[][] = [
    [new THREE.Vector3(0, 0.37, 0), new THREE.Vector3(0.02, 0.9, 0.0), new THREE.Vector3(-0.02, 1.45, 0.03)],
    [new THREE.Vector3(0.03, 0.37, 0.02), new THREE.Vector3(0.12, 0.8, 0.06), new THREE.Vector3(0.22, 1.15, 0.1)],
  ];
  for (const s of stems) pb.add(tube(s, 0.012, 20), M.stem);
  const rr = (() => {
    let s = 5;
    return () => ((s = (s * 16807) % 2147483647) / 2147483647);
  })();
  const leafPositions: [THREE.Vector3[], number][] = [[stems[0], 11], [stems[1], 6]];
  for (const [stem, count] of leafPositions) {
    const curve = new THREE.CatmullRomCurve3(stem);
    for (let i = 0; i < count; i += 1) {
      const t = 0.3 + (i / count) * 0.7;
      const at = curve.getPointAt(t);
      const yaw = i * 2.4 + rr() * 0.5;
      const len = 0.2 + rr() * 0.06 + t * 0.05;
      const geo = leafGeometry(len, len * 0.42, 0.05 + rr() * 0.04);
      const tilt = 0.75 + rr() * 0.5 - t * 0.25;
      const m = new THREE.Matrix4().compose(at, new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, yaw, 0, 'YXZ')), new THREE.Vector3(1, 1, 1));
      pb.add(geo, rr() > 0.5 ? M.leaf : M.leafLight, [0, 0, 0], [0, 0, 0], 1, m);
    }
  }
  pb.build(plant);
  room.add(plant);

  // ---------- lounge chair + side table (Contact) ----------
  const lounge = new THREE.Matrix4().compose(new THREE.Vector3(1.25, 0, -0.35), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -0.75, 0)), new THREE.Vector3(1, 1, 1));
  for (const [x, z] of [[-0.3, 0.28], [0.3, 0.28], [-0.3, -0.28], [0.3, -0.28]] as const) {
    b.add(new THREE.CylinderGeometry(0.02, 0.013, 0.24, 12), M.oak, [x, 0.12, z], [z > 0 ? 0.12 : -0.12, 0, x > 0 ? -0.12 : 0.12], 1, lounge);
  }
  b.add(chamfer(0.7, 0.05, 0.66, 0.012), M.oak, [0, 0.25, 0], [0, 0, 0], 1, lounge);
  b.add(new RoundedBoxGeometry(0.66, 0.14, 0.62, 4, 0.05), M.oatFabric, [0, 0.34, 0.02], [0, 0, 0], 1, lounge);
  b.add(new RoundedBoxGeometry(0.66, 0.5, 0.14, 4, 0.055), M.oatFabric, [0, 0.6, -0.27], [-0.22, 0, 0], 1, lounge);
  for (const x of [-0.36, 0.36]) b.add(chamfer(0.05, 0.05, 0.62, 0.015), M.oak, [x, 0.5, 0.0], [0, 0, 0], 1, lounge);
  b.add(new RoundedBoxGeometry(0.32, 0.22, 0.08, 3, 0.035), M.rust, [0.12, 0.52, -0.16], [-0.25, -0.2, 0.15], 1, lounge);

  const sideTable = new THREE.Vector3(1.6, 0, 0.62);
  b.add(lathe([[0, 0], [0.16, 0], [0.16, 0.015], [0.03, 0.03], [0.022, 0.5], [0.0, 0.5]], 36), M.ink, [sideTable.x, 0, sideTable.z]);
  b.add(lathe([[0, 0.5], [0.24, 0.5], [0.25, 0.51], [0.25, 0.525], [0.24, 0.535], [0, 0.535]], 48), M.oak, [sideTable.x, 0, sideTable.z]);
  b.add(lathe([[0, 0], [0.04, 0], [0.065, 0.06], [0.05, 0.16], [0.028, 0.2], [0.03, 0.22], [0, 0.22]], 32), M.terracotta, [sideTable.x - 0.1, 0.535, sideTable.z - 0.08]);
  for (const [dx, dz, h] of [[0.0, 0.0, 0.42], [0.03, 0.02, 0.36], [-0.03, 0.01, 0.38]] as const) {
    b.add(tube([new THREE.Vector3(0, 0.72, 0), new THREE.Vector3(dx, 0.72 + h * 0.6, dz), new THREE.Vector3(dx * 2.5, 0.72 + h, dz * 2.5)], 0.003, 12), M.stem, [sideTable.x - 0.1, 0, sideTable.z - 0.08]);
  }

  // envelope floats above the table
  const envelope = new THREE.Group();
  const eb = new Batch();
  eb.add(chamfer(0.26, 0.006, 0.17, 0.002), M.paper);
  const flapShape = new THREE.Shape();
  flapShape.moveTo(-0.13, 0);
  flapShape.lineTo(0.13, 0);
  flapShape.lineTo(0, -0.1);
  flapShape.lineTo(-0.13, 0);
  const flap = new THREE.ExtrudeGeometry(flapShape, { depth: 0.002, bevelEnabled: false });
  eb.add(flap, M.paper, [0, 0.0045, -0.085], [-Math.PI / 2, 0, 0]);
  eb.add(new THREE.CylinderGeometry(0.018, 0.018, 0.004, 20), M.rust, [0, 0.007, 0.0]);
  eb.build(envelope);
  envelope.position.set(sideTable.x + 0.06, 0.74, sideTable.z + 0.06);
  room.add(envelope);

  b.build(room);

  // ---------- light patches and contact shadows ----------
  const patch = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: T.windowPatch(), color: 0xffc286, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  patch.rotation.x = -Math.PI / 2;
  patch.position.set(win.x + 0.28, 0.021, back + 1.05);
  patch.scale.set(1.0, 1.35, 1);
  patch.rotation.z = -0.25;
  room.add(patch);

  const blobTex = T.softBlob('rgba(20,14,10,0.6)', 'rgba(20,14,10,0)');
  const blob = (x: number, z: number, sx: number, sz: number, o: number, y = 0.02) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, opacity: o, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.scale.set(sx, sz, 1);
    room.add(m);
  };
  blob(-0.42, back + 1.12, 0.8, 0.8, 0.55);
  blob(1.25, -0.35, 1.1, 1.1, 0.5);
  blob(sideTable.x, sideTable.z, 0.6, 0.6, 0.55);
  blob(plant.position.x, plant.position.z, 0.7, 0.7, 0.6);
  blob(-0.35, back + 0.42, 1.8, 0.95, 0.35);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: T.softBlob('rgba(0,0,0,0.75)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.23;
  ground.scale.set(8.5, 8.5, 1);
  scene.add(ground);

  // dust in the window light
  const moteCount = phone ? 40 : 90;
  const moteGeo = new THREE.BufferGeometry();
  const motePos = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i += 1) {
    motePos[i * 3] = win.x - 0.4 + rr() * 1.2;
    motePos[i * 3 + 1] = 0.2 + rr() * 1.8;
    motePos[i * 3 + 2] = back + 0.2 + rr() * 1.4;
  }
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({ color: 0xffe0b5, size: 0.012, transparent: true, opacity: 0.8, depthWrite: false }));
  room.add(motes);

  const beamCount = phone ? 28 : 64;
  const beamGeo = new THREE.BufferGeometry();
  const beamPos = new Float32Array(beamCount * 3);
  const beamDir = lamp.target.position.clone().sub(bulbWorld).normalize();
  const beamRight = new THREE.Vector3().crossVectors(beamDir, new THREE.Vector3(0, 1, 0)).normalize();
  const beamUp = new THREE.Vector3().crossVectors(beamRight, beamDir).normalize();
  for (let i = 0; i < beamCount; i += 1) {
    const along = 0.08 + rr() * 1.35;
    const rad = along * 0.18 * (0.2 + rr());
    const th = rr() * Math.PI * 2;
    const p = bulbWorld
      .clone()
      .addScaledVector(beamDir, along)
      .addScaledVector(beamRight, Math.cos(th) * rad)
      .addScaledVector(beamUp, Math.sin(th) * rad);
    beamPos[i * 3] = p.x;
    beamPos[i * 3 + 1] = p.y;
    beamPos[i * 3 + 2] = p.z;
  }
  beamGeo.setAttribute('position', new THREE.BufferAttribute(beamPos, 3));
  const beamMat = new THREE.PointsMaterial({ color: 0xffd7a8, size: 0.014, transparent: true, opacity: startLit ? 0.7 : 0, depthWrite: false });
  const beamMotes = new THREE.Points(beamGeo, beamMat);
  scene.add(beamMotes);

  // ---------- camera ----------
  const anchors = [
    new THREE.Vector3(-0.4, deskH + 0.75, back + 0.3),
    new THREE.Vector3(left + 0.14, 1.95, 0.05),
    new THREE.Vector3(-0.6, 2.25, back + 0.05),
    new THREE.Vector3(left + 0.05, 2.06, -1.15),
    new THREE.Vector3(sideTable.x + 0.06, 0.98, sideTable.z + 0.06),
  ];

  const deg = Math.PI / 180;
  const overview: View = phone
    ? { target: new THREE.Vector3(-0.1, 1.05, -0.1), az: 45 * deg, el: 27 * deg, dist: 31, ox: 0, oy: -0.13 }
    : { target: new THREE.Vector3(-0.1, 1.0, -0.1), az: 45 * deg, el: 26 * deg, dist: 17.5, ox: -0.17, oy: 0.01 };
  const pulled: View = {
    ...overview,
    target: overview.target.clone().add(new THREE.Vector3(0, 0.06, 0.04)),
    el: overview.el + 2.4 * deg,
    dist: overview.dist * 1.2,
  };

  const hitters = anchors.map((a, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
    m.position.copy(a);
    m.userData.i = i;
    room.add(m);
    return m;
  });
  const hoverLights = anchors.map((a) => {
    const p = new THREE.PointLight(0xffc48a, 0, 1.7, 2);
    p.position.copy(a);
    scene.add(p);
    return p;
  });
  const spot = (target: [number, number, number], az: number, el: number, dist: number): View => ({
    target: new THREE.Vector3(...target),
    az: az * deg,
    el: el * deg,
    dist: phone ? dist * 1.9 : dist,
    ox: phone ? 0 : -0.2,
    oy: phone ? 0.17 : 0,
  });
  const views: View[] = [
    spot([-0.3, 1.05, back + 0.45], 28, 16, 5.4),
    spot([left + 0.15, 1.42, 0.05], 72, 10, 4.6),
    spot([-0.2, 1.5, back + 0.05], 18, 6, 5.6),
    spot([left + 0.05, 1.62, -1.15], 74, 6, 4.1),
    spot([1.45, 0.62, 0.3], 40, 22, 4.8),
  ];

  const opening = startLit ? overview : pulled;
  const cur: View = { ...opening, target: opening.target.clone() };
  let from: View = { ...cur, target: cur.target.clone() };
  let to: View = opening;
  let tween = 1;
  let duration = 1.7;
  let activeIndex: number | null = null;
  let hoverIndex: number | null = null;
  let htmlHover: number | null = null;
  let phase: 'light' | 'full' = 'light';
  let upgrading = false;
  let postFade = 0;
  let postFadeTarget = 0;
  let lampT = startLit ? 1 : 0;
  let lampWanted = startLit ? 1 : 0;
  let introDelay = -1;
  let introStarted = false;
  let drawn = 0;
  let fpsArmed = false;
  let postSetFade: ((k: number) => void) | null = null;

  function focus(index: number | null) {
    activeIndex = index;
    from = { ...cur, target: cur.target.clone() };
    to = index === null ? overview : views[index];
    duration = 1.7;
    tween = reduced ? 1 : 0;
    if (reduced) Object.assign(cur, { ...to, target: to.target.clone() });
  }

  function highlight(index: number | null) {
    htmlHover = index;
    hoverIndex = index;
    hooks.onHover?.(index);
  }

  function beginIntro() {
    if (introStarted || reduced || hold === 'light') return;
    introStarted = true;
    lampWanted = 1;
    if (activeIndex !== null) return;
    from = { ...cur, target: cur.target.clone() };
    to = overview;
    duration = 2.6;
    tween = 0;
  }

  function scheduleIntro() {
    if (reduced || hold === 'light' || hold === 'full' || introStarted) return;
    introDelay = 0.4;
  }

  const fps = createFpsWatch(() => {
    if (phase !== 'full') return;
    stage.detachPost();
    postSetFade = null;
    postFade = 0;
    postFadeTarget = 0;
    stage.setShadows(false);
    key.castShadow = false;
    lamp.castShadow = false;
    stage.setTier('mid');
    phase = 'light';
  });

  async function upgrade() {
    if (phase !== 'light' || upgrading) return;
    upgrading = true;
    const tier = detectTier();
    if (tier === 'light') {
      upgrading = false;
      scheduleIntro();
      return;
    }
    const hi = {
      floor: T.oakFloor(512, 4),
      wall: T.plaster('#d9ccb9', 256, 4),
      rug: T.rugTexture(512, 4),
      fabric: T.fabric('#ffffff', 128, 4),
      cork: T.cork(256, 4),
    };
    M.floor.map = hi.floor.map;
    M.floor.roughnessMap = hi.floor.grain;
    M.floor.bumpMap = hi.floor.grain;
    M.oak.map = hi.floor.map;
    M.oak.bumpMap = hi.floor.grain;
    M.wall.map = hi.wall.map;
    M.wall.bumpMap = hi.wall.grain;
    M.rug.map = hi.rug.map;
    M.rug.bumpMap = hi.rug.grain;
    M.forest.map = hi.fabric;
    M.oatFabric.map = hi.fabric;
    M.cork.map = hi.cork;
    for (const mat of [M.floor, M.oak, M.wall, M.rug, M.forest, M.oatFabric, M.cork]) mat.needsUpdate = true;
    lo.floor.map.dispose();
    lo.floor.grain.dispose();
    lo.wall.map.dispose();
    lo.wall.grain.dispose();
    lo.rug.map.dispose();
    lo.rug.grain.dispose();
    lo.fabric.dispose();
    lo.cork.dispose();

    stage.setTier(tier);
    stage.setShadows(true);
    key.castShadow = true;
    lamp.castShadow = tier === 'full' && !phone;
    key.shadow.intensity = 0;
    key.shadow.mapSize.set(phone || tier === 'mid' ? 1024 : 2048, phone || tier === 'mid' ? 1024 : 2048);

    const { createStudioPost } = await import(/* webpackChunkName: "studio-post" */ './post');
    const { width, height } = stage.size();
    const post = createStudioPost(stage.renderer, scene, camera, {
      tier,
      phone,
      width,
      height,
      dpr: stage.dpr(),
    });
    stage.attachPost(post);
    postSetFade = (k) => post.setFade(k);
    postFadeTarget = 1;
    phase = 'full';
    hooks.onFullQuality?.();
    scheduleIntro();
  }

  const pointer = new THREE.Vector2();
  const smooth = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const onPointer = (e: PointerEvent) => {
    pointer.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    ndc.set(pointer.x, -((e.clientY / innerHeight) * 2 - 1));
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(hitters, false)[0];
    const next = hit ? (hit.object.userData.i as number) : htmlHover;
    if (next !== hoverIndex) {
      hoverIndex = next;
      hooks.onHover?.(next);
    }
  };
  window.addEventListener('pointermove', onPointer);

  const dir = new THREE.Vector3();
  const mp = moteGeo.attributes.position as THREE.BufferAttribute;
  const bp = beamGeo.attributes.position as THREE.BufferAttribute;
  stage.onFrame((t, dt) => {
    drawn += 1;
    if (drawn === 2) {
      hooks.onFirstFrame?.();
      if (hold === 'full') void upgrade();
      else if (!demo && hold !== 'light') {
        const later = (cb: () => void) => {
          if (typeof requestIdleCallback === 'function') requestIdleCallback(() => cb(), { timeout: 900 });
          else setTimeout(cb, 320);
        };
        later(() => void upgrade());
      } else if (hold !== 'light' && !demo) {
        scheduleIntro();
      }
    }
    if (introDelay >= 0) {
      introDelay -= dt;
      if (introDelay <= 0) {
        introDelay = -1;
        beginIntro();
      }
    }
    if (postFade < postFadeTarget) {
      postFade = Math.min(postFadeTarget, postFade + dt / 0.85);
      postSetFade?.(postFade);
      key.shadow.intensity = postFade;
    }
    if (lampT !== lampWanted) {
      const dirLamp = Math.sign(lampWanted - lampT) || 1;
      lampT = THREE.MathUtils.clamp(lampT + dirLamp * (dt / 1.35), 0, 1);
      const k = easeInOutCubic(lampT);
      lamp.intensity = lampMax * k;
      bulbMat.color.setRGB(0.38 + 5.62 * k, 0.28 + 4.32 * k, 0.2 + 2.8 * k);
      key.intensity = 1.2 + 1.2 * k;
      fill.intensity = 0.55 - 0.1 * k;
      beamMat.opacity = 0.72 * k;
    }
    if (tween < 1) {
      tween = Math.min(1, tween + dt / duration);
      const k = easeInOutCubic(tween);
      cur.target.lerpVectors(from.target, to.target, k);
      cur.az = from.az + (to.az - from.az) * k;
      cur.el = from.el + (to.el - from.el) * k;
      cur.dist = from.dist + (to.dist - from.dist) * k;
      cur.ox = from.ox + (to.ox - from.ox) * k;
      cur.oy = from.oy + (to.oy - from.oy) * k;
      if (!fpsArmed && tween >= 1 && phase === 'full' && postFade >= 1) {
        fpsArmed = true;
        fps.arm();
      }
    }
    fps.sample(dt);
    smooth.lerp(pointer, 1 - Math.exp(-dt * 1.6));
    const idle = reduced ? 0 : 1;
    const az = cur.az + idle * (Math.sin(t * 0.13) * 0.022 + smooth.x * 0.035);
    const el = cur.el + idle * (Math.sin(t * 0.1 + 1) * 0.01 - smooth.y * 0.02);
    dir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    camera.position.copy(cur.target).addScaledVector(dir, cur.dist);
    camera.lookAt(cur.target);
    const { width, height } = stage.size();
    camera.setViewOffset(width, height, cur.ox * width, cur.oy * height, width, height);

    const lit = hoverIndex;
    for (let i = 0; i < hoverLights.length; i += 1) {
      const want = activeIndex === i ? 0.7 : lit === i ? 0.85 : 0;
      hoverLights[i].intensity += (want - hoverLights[i].intensity) * Math.min(1, dt * 7);
    }

    if (!reduced) {
      envelope.position.y = 0.74 + Math.sin(t * 1.4) * 0.025;
      envelope.rotation.y = Math.sin(t * 0.6) * 0.18;
      envelope.rotation.z = Math.sin(t * 0.9) * 0.04;
      plant.rotation.z = Math.sin(t * 0.7) * 0.006;
      for (let i = 0; i < moteCount; i += 1) {
        let y = mp.getY(i) + dt * 0.03;
        if (y > 2.0) y = 0.2;
        mp.setY(i, y);
        mp.setX(i, mp.getX(i) + Math.sin(t * 0.5 + i) * dt * 0.01);
      }
      mp.needsUpdate = true;
      if (lampT > 0.05) {
        for (let i = 0; i < beamCount; i += 1) {
          let y = bp.getY(i) + dt * 0.04;
          const along0 = 0.08 + ((i * 17) % 100) / 100 * 1.35;
          if (y > bulbWorld.y + 0.2) y = bulbWorld.y - along0 * 0.15;
          bp.setY(i, y);
          bp.setX(i, bp.getX(i) + Math.sin(t * 0.8 + i) * dt * 0.008);
        }
        bp.needsUpdate = true;
      }
    }
  });

  const v = new THREE.Vector3();
  const handle: StudioHandle = {
    focus,
    highlight,
    anchors: () => {
      const { width, height } = stage.size();
      return anchors.map((a) => {
        v.copy(a).project(camera);
        return { x: (v.x * 0.5 + 0.5) * width, y: (-v.y * 0.5 + 0.5) * height, visible: v.z < 1 };
      });
    },
    upgrade,
    beginIntro,
    pauseLoop: (paused) => stage.pauseLoop(paused),
    renderFrame: (t, dt) => stage.renderFrame(t, dt),
    snapshot: () => stage.snapshot(),
    phase: () => phase,
    dispose: () => {
      window.removeEventListener('pointermove', onPointer);
      fps.disarm();
      if ((window as unknown as { __studio?: StudioHandle }).__studio === handle) {
        delete (window as unknown as { __studio?: StudioHandle }).__studio;
      }
      stage.dispose();
    },
  };
  (window as unknown as { __studio?: StudioHandle }).__studio = handle;
  return handle;
}
