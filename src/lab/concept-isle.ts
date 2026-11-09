import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import gsap from 'gsap';
import { contactShadow, createStage, matte, prefersReducedMotion, satin, softKeyLight } from './kit';

const C = {
  grass: 0x62a04f,
  grassDark: 0x5f9457,
  sand: 0xf1d3a1,
  rock: 0xc7704f,
  rockDeep: 0x8c4936,
  path: 0xfff1dc,
  coral: 0xff7357,
  cream: 0xfff6ea,
  navy: 0x22304d,
  teal: 0x2f9e98,
  indigo: 0x5b5bd6,
  wood: 0xb9784f,
  leaf: 0x3f7f48,
  leafLight: 0x9cc76a,
  trunk: 0x8a5a3c,
  cloud: 0xfffbf5,
};

export const ISLE_STATIONS = ['Home', 'Work', 'Experience', 'Skills', 'Projects', 'Contact'] as const;

const STATION_POINTS: [number, number][] = [
  [-4.6, 2.6],
  [-2.2, -1.2],
  [1.3, -3.3],
  [4.2, -0.6],
  [2.6, 2.9],
  [-0.8, 4.4],
];

const box = (w: number, h: number, d: number, r = 0.08, s = 4) => new RoundedBoxGeometry(w, h, d, s, r);

function shadowed<T extends THREE.Object3D>(object: T): T {
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return object;
}

function islandGeometry(radius: number) {
  const pts: THREE.Vector2[] = [];
  pts.push(new THREE.Vector2(0.001, -4.2));
  pts.push(new THREE.Vector2(radius * 0.18, -3.9));
  pts.push(new THREE.Vector2(radius * 0.42, -2.9));
  pts.push(new THREE.Vector2(radius * 0.68, -1.7));
  pts.push(new THREE.Vector2(radius * 0.88, -0.75));
  pts.push(new THREE.Vector2(radius * 0.98, -0.28));
  pts.push(new THREE.Vector2(radius * 1.0, -0.12));
  return new THREE.LatheGeometry(pts, 72);
}

function topGeometry(radius: number, thickness: number) {
  const pts: THREE.Vector2[] = [new THREE.Vector2(0.001, 0)];
  const bevel = 0.22;
  pts.push(new THREE.Vector2(radius - bevel, 0));
  for (let i = 1; i <= 8; i += 1) {
    const a = (i / 8) * (Math.PI / 2);
    pts.push(new THREE.Vector2(radius - bevel + Math.sin(a) * bevel, -bevel + Math.cos(a) * bevel));
  }
  pts.push(new THREE.Vector2(radius, -thickness));
  pts.push(new THREE.Vector2(0.001, -thickness));
  return new THREE.LatheGeometry(pts.reverse(), 96);
}

function tree(scale: number, tone: number) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.6, 10), matte(C.trunk, 0.8));
  trunk.position.y = 0.3;
  g.add(trunk);
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 18), matte(tone, 0.7));
  crown.scale.set(1, 1.18, 1);
  crown.position.y = 0.95;
  g.add(crown);
  const crown2 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 14), matte(tone, 0.7));
  crown2.position.set(0.26, 0.72, 0.12);
  g.add(crown2);
  g.scale.setScalar(scale);
  return shadowed(g);
}

function cloud() {
  const g = new THREE.Group();
  const mat = matte(C.cloud, 0.95, { emissive: 0xfff3e6, emissiveIntensity: 0.12 });
  const parts: [number, number, number, number][] = [
    [0, 0, 0, 0.55],
    [0.55, -0.08, 0.05, 0.42],
    [-0.55, -0.12, 0, 0.38],
    [0.22, 0.22, -0.1, 0.4],
  ];
  for (const [x, y, z, r] of parts) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat);
    m.position.set(x, y, z);
    g.add(m);
  }
  return g;
}

function cart() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(box(0.78, 0.42, 0.52, 0.1), satin(C.coral));
  body.position.y = 0.42;
  g.add(body);
  const rim = new THREE.Mesh(box(0.84, 0.07, 0.58, 0.03), satin(C.cream));
  rim.position.y = 0.64;
  g.add(rim);
  const hollow = new THREE.Mesh(box(0.66, 0.04, 0.4, 0.02), matte(0x6b2a22, 0.8));
  hollow.position.y = 0.665;
  g.add(hollow);
  const parcel = new THREE.Mesh(box(0.26, 0.2, 0.22, 0.04), matte(C.sand, 0.7));
  parcel.position.set(0.12, 0.72, 0.02);
  parcel.rotation.y = 0.4;
  g.add(parcel);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 10, 24, Math.PI), satin(C.navy));
  handle.rotation.y = Math.PI / 2;
  handle.position.set(-0.46, 0.68, 0);
  g.add(handle);
  const wheelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 20);
  const wheelMat = satin(C.navy, { roughness: 0.5 });
  for (const [x, z] of [[0.26, 0.24], [-0.26, 0.24], [0.26, -0.24], [-0.26, -0.24]]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.x = Math.PI / 2;
    w.position.set(x, 0.12, z);
    g.add(w);
  }
  return shadowed(g);
}

function signboard() {
  const g = new THREE.Group();
  const postMat = matte(C.wood, 0.7);
  for (const x of [-0.62, 0.62]) {
    const post = new THREE.Mesh(box(0.12, 1.5, 0.12, 0.04), postMat);
    post.position.set(x, 0.75, 0);
    g.add(post);
  }
  const board = new THREE.Mesh(box(1.6, 0.8, 0.14, 0.07), satin(C.navy));
  board.position.y = 1.2;
  g.add(board);
  const stripe = new THREE.Mesh(box(0.9, 0.12, 0.02, 0.03), satin(C.coral));
  stripe.position.set(-0.22, 1.32, 0.08);
  g.add(stripe);
  const stripe2 = new THREE.Mesh(box(0.6, 0.08, 0.02, 0.03), satin(C.cream));
  stripe2.position.set(-0.37, 1.12, 0.08);
  g.add(stripe2);
  return shadowed(g);
}

function desk() {
  const g = new THREE.Group();
  const top = new THREE.Mesh(box(1.7, 0.1, 0.85, 0.04), matte(C.cream, 0.5));
  top.position.y = 0.78;
  g.add(top);
  const legMat = satin(C.navy);
  for (const [x, z] of [[-0.75, 0.34], [0.75, 0.34], [-0.75, -0.34], [0.75, -0.34]]) {
    const leg = new THREE.Mesh(box(0.07, 0.76, 0.07, 0.03), legMat);
    leg.position.set(x, 0.38, z);
    g.add(leg);
  }
  const screen = new THREE.Mesh(box(1.0, 0.62, 0.06, 0.04), satin(C.navy));
  screen.position.set(0, 1.3, -0.18);
  g.add(screen);
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(0.88, 0.5),
    new THREE.MeshBasicMaterial({ color: 0x8fd6c8, toneMapped: false }),
  );
  glass.position.set(0, 1.3, -0.145);
  g.add(glass);
  const lines = new THREE.Group();
  const lineColors = [C.coral, C.cream, C.cream, C.indigo];
  lineColors.forEach((color, i) => {
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3 + ((i * 37) % 5) * 0.08, 0.04),
      new THREE.MeshBasicMaterial({ color, toneMapped: false }),
    );
    line.position.set(-0.2 + ((i * 13) % 3) * 0.04, 1.44 - i * 0.09, -0.14);
    lines.add(line);
  });
  g.add(lines);
  const stand = new THREE.Mesh(box(0.12, 0.36, 0.1, 0.03), legMat);
  stand.position.set(0, 0.98, -0.2);
  g.add(stand);
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.15, 18), satin(C.coral));
  mug.position.set(0.58, 0.9, 0.12);
  g.add(mug);
  return shadowed(g);
}

/** Ten pillars, one per year, rising toward the present. */
function decade() {
  const g = new THREE.Group();
  const geo = box(0.34, 1, 0.34, 0.08, 3);
  for (let i = 0; i < 10; i += 1) {
    const h = 0.25 + i * 0.16;
    const last = i === 9;
    const m = new THREE.Mesh(geo, last ? satin(C.coral) : satin(i % 2 ? C.cream : 0xf6e3c6));
    m.scale.y = h;
    const a = -0.9 + (i / 9) * 1.8;
    m.position.set(Math.sin(a) * 1.4, h / 2, Math.cos(a) * 1.4 - 1.2);
    g.add(m);
  }
  return shadowed(g);
}

/** Two stacks, frontend and backend. */
function stacks() {
  const g = new THREE.Group();
  const geo = box(0.5, 0.5, 0.5, 0.1);
  const front = [
    [0, 0.25, 0], [0.55, 0.25, 0.05], [0.28, 0.75, 0.02],
  ];
  const back = [
    [0, 0.25, 0], [0.55, 0.25, -0.05], [0, 0.75, 0], [0.55, 0.75, 0], [0.28, 1.25, 0],
  ];
  for (const [x, y, z] of front) {
    const m = new THREE.Mesh(geo, satin(C.teal));
    m.position.set(x - 1.1, y, z);
    m.rotation.y = 0.12;
    g.add(m);
  }
  for (const [x, y, z] of back) {
    const m = new THREE.Mesh(geo, satin(C.indigo));
    m.position.set(x + 0.35, y, z);
    m.rotation.y = -0.1;
    g.add(m);
  }
  return shadowed(g);
}

function frames() {
  const g = new THREE.Group();
  const frameMat = satin(C.navy);
  const canvasMat = matte(C.cream, 0.9);
  [[-0.9, 0.95, 1.2, -0.1], [0.25, 1.15, 1.55, 0], [1.3, 0.85, 1.0, 0.12]].forEach(([x, w, h, ry]) => {
    const f = new THREE.Group();
    const outer = new THREE.Mesh(box(w, h, 0.1, 0.05), frameMat);
    outer.position.y = h / 2 + 0.25;
    f.add(outer);
    const inner = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.16, h - 0.16), canvasMat);
    inner.position.set(0, h / 2 + 0.25, 0.052);
    f.add(inner);
    const leg = new THREE.Mesh(box(0.06, 0.6, 0.06, 0.02), frameMat);
    leg.position.set(0, 0.3, -0.12);
    leg.rotation.x = -0.3;
    f.add(leg);
    f.position.x = x;
    f.rotation.y = ry;
    g.add(f);
  });
  return shadowed(g);
}

function mailbox() {
  const g = new THREE.Group();
  const post = new THREE.Mesh(box(0.12, 0.9, 0.12, 0.04), matte(C.wood, 0.7));
  post.position.y = 0.45;
  g.add(post);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.5, 8, 24), satin(C.coral));
  body.rotation.z = Math.PI / 2;
  body.position.y = 1.08;
  g.add(body);
  const flag = new THREE.Mesh(box(0.04, 0.32, 0.16, 0.015), satin(C.navy));
  flag.position.set(0.12, 1.36, 0.28);
  g.add(flag);
  const bench = new THREE.Group();
  const seat = new THREE.Mesh(box(1.3, 0.1, 0.42, 0.04), matte(C.wood, 0.65));
  seat.position.y = 0.42;
  bench.add(seat);
  const back = new THREE.Mesh(box(1.3, 0.38, 0.08, 0.04), matte(C.wood, 0.65));
  back.position.set(0, 0.72, -0.2);
  bench.add(back);
  for (const x of [-0.55, 0.55]) {
    const leg = new THREE.Mesh(box(0.08, 0.42, 0.36, 0.03), satin(C.navy));
    leg.position.set(x, 0.21, 0);
    bench.add(leg);
  }
  bench.position.set(1.2, 0, -0.2);
  bench.rotation.y = -0.4;
  g.add(bench);
  return shadowed(g);
}

export interface IsleHandle {
  goTo: (index: number) => void;
  dispose: () => void;
}

export function mountIsle(host: HTMLElement, onArrive: (index: number) => void): IsleHandle {
  const stage = createStage(host, { background: null, fov: 30, exposure: 1.05, envIntensity: 0.55 });
  if (!stage) return { goTo: () => {}, dispose: () => {} };
  const { scene, camera, phone } = stage;
  const reduced = prefersReducedMotion();
  gsap.ticker.lagSmoothing(0);

  scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x8a5a3c, 0.9));
  const key = softKeyLight(0xffe2c2, 2.6, phone, 9);
  key.position.set(-6, 11, 7);
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xffb48a, 0.9);
  rim.position.set(8, 4, -8);
  scene.add(rim);

  const world = new THREE.Group();
  scene.add(world);

  const radius = 7.4;
  const top = new THREE.Mesh(topGeometry(radius, 0.5), matte(C.grass, 0.85));
  top.receiveShadow = true;
  world.add(top);
  const sandRing = new THREE.Mesh(new THREE.TorusGeometry(radius - 0.05, 0.16, 12, 120), matte(C.sand, 0.8));
  sandRing.rotation.x = Math.PI / 2;
  sandRing.position.y = -0.42;
  world.add(sandRing);
  const rock = new THREE.Mesh(islandGeometry(radius), matte(C.rock, 0.9, { flatShading: false }));
  rock.position.y = -0.45;
  world.add(rock);
  const rockLayer = new THREE.Mesh(islandGeometry(radius * 0.72), matte(C.rockDeep, 0.95));
  rockLayer.position.y = -1.6;
  rockLayer.scale.y = 0.75;
  world.add(rockLayer);

  const stationVecs = STATION_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z));
  const curve = new THREE.CatmullRomCurve3(stationVecs, false, 'centripetal', 0.5);
  const stepCount = 70;
  const stepGeo = new THREE.CylinderGeometry(0.26, 0.28, 0.06, 20);
  const steps = new THREE.InstancedMesh(stepGeo, matte(C.path, 0.75), stepCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < stepCount; i += 1) {
    const p = curve.getPointAt(i / (stepCount - 1));
    dummy.position.set(p.x, 0.03, p.z);
    const s = 0.85 + ((i * 7919) % 10) / 40;
    dummy.scale.set(s, 1, s);
    dummy.updateMatrix();
    steps.setMatrixAt(i, dummy.matrix);
  }
  steps.receiveShadow = true;
  world.add(steps);

  const stationU = stationVecs.map((_, i) => {
    let best = 0;
    let bestD = Infinity;
    for (let k = 0; k <= 400; k += 1) {
      const d = curve.getPointAt(k / 400).distanceToSquared(stationVecs[i]);
      if (d < bestD) {
        bestD = d;
        best = k / 400;
      }
    }
    return best;
  });

  const props = [signboard(), desk(), decade(), stacks(), frames(), mailbox()];
  const facing = [0.6, 0.9, 0.2, -0.6, 0.55, 0.9];
  props.forEach((prop, i) => {
    const [x, z] = STATION_POINTS[i];
    const out = new THREE.Vector3(x, 0, z).normalize().multiplyScalar(1.3);
    prop.position.set(x + out.x, 0, z + out.z);
    prop.rotation.y = facing[i];
    world.add(prop);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.3, 0.05, 40), matte(C.sand, 0.8));
    pad.position.set(x + out.x, 0.02, z + out.z);
    pad.receiveShadow = true;
    world.add(pad);
  });

  const trees: [number, number, number, number][] = [
    [-5.8, -1.2, 1.1, C.leaf], [-4.6, -3.6, 0.9, C.leafLight], [-1.8, -5.6, 1.2, C.leaf],
    [4.8, -4.2, 1.0, C.leafLight], [6.0, 1.8, 1.15, C.leaf], [4.9, 4.4, 0.8, C.leafLight],
    [-3.3, 5.6, 1.0, C.leaf], [-6.3, 1.0, 0.75, C.leafLight], [0.8, 0.4, 0.85, C.leafLight],
    [-0.6, -3.4, 0.7, C.leaf], [2.0, 5.8, 0.9, C.leaf],
  ];
  const treeGroups = trees.map(([x, z, s, tone]) => {
    const t = tree(s, tone);
    t.position.set(x, 0, z);
    t.rotation.y = x * 3.1;
    world.add(t);
    return t;
  });

  const rocks = [[-6.4, 3.2, 0.4], [6.6, -1.4, 0.32], [3.6, -5.8, 0.36], [-2.6, 1.6, 0.25]];
  for (const [x, z, s] of rocks) {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 1), matte(0xd9c7b0, 0.9));
    r.scale.set(s * 1.3, s * 0.7, s);
    r.position.set(x, s * 0.3, z);
    world.add(shadowed(r));
  }

  const clouds = [
    [-10, 3.5, -6, 1.4], [9, 2.2, -9, 1.8], [11, -1.5, 4, 1.2], [-11, -2.5, 5, 1.5], [2, 5.5, -12, 1.3],
  ].map(([x, y, z, s]) => {
    const c = cloud();
    c.position.set(x, y, z);
    c.scale.setScalar(s);
    scene.add(c);
    return { c, base: new THREE.Vector3(x, y, z), speed: 0.15 + s * 0.05 };
  });

  const islandShadow = contactShadow(18, 18, 0.25, '30, 40, 70');
  islandShadow.position.y = -6.5;
  scene.add(islandShadow);

  const mover = cart();
  world.add(mover);

  const state = { u: stationU[0], camBlend: 0 };
  const tmpP = new THREE.Vector3();
  const tmpT = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  const camPos = new THREE.Vector3();

  const overview = {
    pos: phone ? new THREE.Vector3(19, 18, 39) : new THREE.Vector3(14, 8.8, 20),
    look: phone ? new THREE.Vector3(0.6, 3.4, 0) : new THREE.Vector3(-4.2, -1.1, 0.8),
  };

  function placeMover() {
    curve.getPointAt(state.u, tmpP);
    curve.getTangentAt(state.u, tmpT);
    mover.position.set(tmpP.x, 0.06, tmpP.z);
    mover.rotation.y = Math.atan2(-tmpT.z, tmpT.x);
  }

  function placeCamera() {
    const near = mover.position.clone();
    const offset = phone ? new THREE.Vector3(6, 8.5, 12.5) : new THREE.Vector3(8.5, 6.8, 12);
    const closePos = near.clone().add(offset);
    const closeLook = near.clone().add(new THREE.Vector3(phone ? 0 : -2.6, phone ? -0.6 : 0.4, 0));
    camPos.copy(overview.pos).lerp(closePos, state.camBlend);
    lookAt.copy(overview.look).lerp(closeLook, state.camBlend);
  }

  let current = 0;
  let tween: gsap.core.Timeline | null = null;
  function goTo(index: number) {
    const target = stationU[index];
    tween?.kill();
    const dist = Math.abs(target - state.u);
    if (reduced) {
      state.u = target;
      state.camBlend = index === 0 ? 0 : 1;
      current = index;
      onArrive(index);
      return;
    }
    tween = gsap.timeline({ onComplete: () => onArrive(index) });
    tween.to(state, { u: target, duration: Math.min(0.8 + dist * 3.2, 2.4), ease: 'power2.inOut' }, 0);
    tween.to(state, { camBlend: index === 0 ? 0 : 1, duration: 1.4, ease: 'power2.inOut' }, 0);
    current = index;
  }

  const pointer = new THREE.Vector2();
  const onPointer = (e: PointerEvent) => {
    pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener('pointermove', onPointer);
  const smoothPointer = new THREE.Vector2();

  stage.onFrame((t, dt) => {
    placeMover();
    if (!reduced) {
      mover.position.y += Math.abs(Math.sin(t * 9)) * 0.015 * (tween?.isActive() ? 1 : 0);
      world.position.y = Math.sin(t * 0.6) * 0.12;
      for (const tg of treeGroups) tg.rotation.z = Math.sin(t * 1.2 + tg.position.x) * 0.02;
      for (const { c, base, speed } of clouds) {
        c.position.x = base.x + Math.sin(t * speed * 0.3) * 1.4;
        c.position.y = base.y + Math.sin(t * speed + base.z) * 0.2;
      }
    }
    smoothPointer.lerp(pointer, 1 - Math.exp(-dt * 3));
    placeCamera();
    camera.position.copy(camPos);
    camera.position.x += smoothPointer.x * 0.6;
    camera.position.y += -smoothPointer.y * 0.35;
    camera.lookAt(lookAt);
    key.target.position.set(0, 0, 0);
  });

  placeMover();
  void current;

  return {
    goTo,
    dispose: () => {
      tween?.kill();
      window.removeEventListener('pointermove', onPointer);
      stage.dispose();
    },
  };
}
