import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import gsap from 'gsap';
import { contactShadow, createStage, matte, prefersReducedMotion, satin, softKeyLight } from './kit';

const C = {
  wall: 0x3d3866,
  wallSide: 0x4a4478,
  floor: 0xc98f5e,
  floorEdge: 0x9e6a43,
  rug: 0xe5684b,
  cream: 0xfbf1e2,
  ink: 0x1d1b33,
  teal: 0x2fa39a,
  mustard: 0xf2b84b,
  lilac: 0x9d8cff,
  coral: 0xff7a5c,
  leaf: 0x3f8a5a,
  pot: 0xe9d9c4,
  wood: 0xa86c44,
};

export const STUDIO_SPOTS = ['Work', 'Skills', 'Projects', 'Experience', 'Contact'] as const;

const rb = (w: number, h: number, d: number, r = 0.06, s = 4) => new RoundedBoxGeometry(w, h, d, s, r);

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function screenTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 320;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 512, 320);
  g.addColorStop(0, '#1b2140');
  g.addColorStop(1, '#2b2f5e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 320);
  const colors = ['#ff7a5c', '#9d8cff', '#fbf1e2', '#2fa39a', '#f2b84b'];
  let y = 40;
  for (let i = 0; i < 9; i += 1) {
    const indent = [0, 1, 2, 2, 1, 2, 3, 1, 0][i] * 26;
    let x = 36 + indent;
    for (let k = 0; k < 3; k += 1) {
      const w = 30 + ((i * 7 + k * 13) % 6) * 22;
      ctx.fillStyle = colors[(i + k * 2) % colors.length];
      ctx.globalAlpha = k === 0 ? 1 : 0.75;
      ctx.beginPath();
      ctx.roundRect(x, y, w, 12, 6);
      ctx.fill();
      x += w + 12;
    }
    y += 28;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function windowTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 320;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 320);
  g.addColorStop(0, '#2c2f6b');
  g.addColorStop(0.55, '#c86f8a');
  g.addColorStop(1, '#ffb27a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 320);
  ctx.fillStyle = 'rgba(255, 236, 210, 0.95)';
  ctx.beginPath();
  ctx.arc(170, 210, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2a55';
  ctx.beginPath();
  ctx.moveTo(0, 320);
  ctx.lineTo(0, 250);
  ctx.quadraticCurveTo(80, 200, 150, 260);
  ctx.quadraticCurveTo(210, 230, 256, 250);
  ctx.lineTo(256, 320);
  ctx.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export interface StudioHandle {
  focus: (index: number | null) => void;
  /** Screen-space anchors for HTML hotspots, in CSS pixels. */
  anchors: () => { x: number; y: number; visible: boolean }[];
  dispose: () => void;
}

export function mountStudio(host: HTMLElement): StudioHandle {
  const stage = createStage(host, { background: null, fov: 26, exposure: 1.0, envIntensity: 0.35 });
  if (!stage) return { focus: () => {}, anchors: () => [], dispose: () => {} };
  const { scene, camera, phone } = stage;
  const reduced = prefersReducedMotion();
  gsap.ticker.lagSmoothing(0);

  scene.add(new THREE.HemisphereLight(0xb9b3ff, 0x4a2f2a, 0.75));
  const moon = softKeyLight(0xffc9a8, 1.7, phone, 6);
  moon.position.set(3, 9, 7);
  scene.add(moon, moon.target);
  const lamp = new THREE.SpotLight(0xffc37a, 40, 9, 0.75, 0.6, 1.6);
  lamp.castShadow = !phone;
  lamp.shadow.mapSize.set(1024, 1024);
  lamp.shadow.bias = -0.0005;
  lamp.shadow.radius = 6;
  scene.add(lamp, lamp.target);

  const room = new THREE.Group();
  scene.add(room);

  const S = 6;
  room.add(mesh(rb(S, 0.4, S, 0.12), matte(C.floor, 0.7), 0, -0.2, 0));
  room.add(mesh(rb(S + 0.1, 0.18, S + 0.1, 0.08), matte(C.floorEdge, 0.8), 0, -0.48, 0));
  room.add(mesh(rb(S, 4.2, 0.3, 0.12), matte(C.wall, 0.85), 0, 2.1, -S / 2 + 0.15));
  room.add(mesh(rb(0.3, 4.2, S, 0.12), matte(C.wallSide, 0.85), -S / 2 + 0.15, 2.1, 0));
  const skirting = matte(C.ink, 0.6);
  room.add(mesh(rb(S - 0.3, 0.16, 0.06, 0.03), skirting, 0.15, 0.08, -S / 2 + 0.33));
  room.add(mesh(rb(0.06, 0.16, S - 0.3, 0.03), skirting, -S / 2 + 0.33, 0.08, 0.15));

  const rug = mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.04, 64), matte(C.rug, 0.95), 0.6, 0.02, 0.7);
  rug.scale.z = 0.72;
  room.add(rug);
  const rugInner = mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.045, 64), matte(0xf08a6a, 0.95), 0.6, 0.025, 0.7);
  rugInner.scale.z = 0.72;
  room.add(rugInner);

  // Window on the back wall
  const win = new THREE.Group();
  win.add(mesh(rb(1.5, 1.8, 0.14, 0.06), satin(C.cream), 0, 0, 0));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.26, 1.56), new THREE.MeshBasicMaterial({ map: windowTexture(), toneMapped: false }));
  glass.position.z = 0.075;
  win.add(glass);
  win.add(mesh(rb(0.06, 1.56, 0.04, 0.02), satin(C.cream), 0, 0, 0.09));
  win.add(mesh(rb(1.26, 0.06, 0.04, 0.02), satin(C.cream), 0, 0.1, 0.09));
  win.position.set(1.6, 2.5, -S / 2 + 0.32);
  room.add(win);

  // Desk (Work)
  const desk = new THREE.Group();
  desk.add(mesh(rb(2.5, 0.12, 1.1, 0.05), matte(C.cream, 0.45), 0, 1.0, 0));
  for (const [x, z] of [[-1.15, 0.45], [1.15, 0.45], [-1.15, -0.45], [1.15, -0.45]]) {
    desk.add(mesh(rb(0.08, 1.0, 0.08, 0.03), satin(C.ink), x, 0.5, z));
  }
  desk.add(mesh(rb(0.7, 0.62, 1.0, 0.05), satin(C.lilac), 0.82, 0.62, 0));
  const monitor = new THREE.Group();
  monitor.add(mesh(rb(1.3, 0.82, 0.07, 0.05), satin(C.ink), 0, 0, 0));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.72), new THREE.MeshBasicMaterial({ map: screenTexture(), toneMapped: false }));
  screen.position.z = 0.04;
  monitor.add(screen);
  monitor.add(mesh(rb(0.1, 0.36, 0.08, 0.03), satin(C.ink), 0, -0.55, -0.04));
  monitor.add(mesh(rb(0.42, 0.04, 0.26, 0.02), satin(C.ink), 0, -0.72, 0));
  monitor.position.set(-0.15, 1.78, -0.25);
  desk.add(monitor);
  desk.add(mesh(rb(0.8, 0.04, 0.28, 0.02), satin(C.cream), -0.15, 1.08, 0.22));
  desk.add(mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.17, 20), satin(C.coral), 0.75, 1.145, 0.25));
  // Lamp
  const lampArm = new THREE.Group();
  lampArm.add(mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.04, 24), satin(C.ink), 0, 0, 0));
  const arm1 = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 10), satin(C.ink), 0.1, 0.33, 0);
  arm1.rotation.z = -0.3;
  lampArm.add(arm1);
  const shade = mesh(new THREE.ConeGeometry(0.18, 0.26, 24, 1, true), satin(C.mustard, { side: THREE.DoubleSide }), 0.34, 0.68, 0);
  shade.rotation.z = 0.9;
  lampArm.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe2b0, toneMapped: false }));
  bulb.position.set(0.4, 0.62, 0);
  lampArm.add(bulb);
  lampArm.position.set(1.0, 1.06, -0.35);
  desk.add(lampArm);
  desk.position.set(0.3, 0, -S / 2 + 1.05);
  room.add(desk);
  const lampWorld = new THREE.Vector3();
  bulb.getWorldPosition(lampWorld);
  lamp.position.set(desk.position.x + 1.4, 1.68, desk.position.z - 0.35);
  lamp.target.position.set(desk.position.x - 0.2, 1.0, desk.position.z + 0.4);

  // Chair
  const chair = new THREE.Group();
  chair.add(mesh(rb(0.7, 0.14, 0.7, 0.06), satin(C.teal), 0, 0.62, 0));
  chair.add(mesh(rb(0.7, 0.75, 0.12, 0.06), satin(C.teal), 0, 1.05, 0.32));
  chair.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 10), satin(C.ink), 0, 0.32, 0));
  chair.add(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 20), satin(C.ink), 0, 0.05, 0));
  chair.position.set(0.1, 0, -S / 2 + 2.15);
  chair.rotation.y = 0.35;
  room.add(chair);

  // Shelf on the left wall (Skills)
  const shelf = new THREE.Group();
  const plank = rb(0.5, 0.08, 2.2, 0.03);
  for (const y of [0, 0.75]) shelf.add(mesh(plank, matte(C.wood, 0.6), 0, y, 0));
  const bookColors = [C.teal, C.lilac, C.coral, C.mustard, C.cream, C.teal, C.lilac];
  let z = -0.95;
  bookColors.forEach((color, i) => {
    const h = 0.42 + ((i * 5) % 3) * 0.08;
    const w = 0.14 + ((i * 3) % 2) * 0.04;
    const b = mesh(rb(0.36, h, w, 0.025, 2), satin(color, { roughness: 0.5 }), 0, 0.04 + h / 2, z + w / 2);
    if (i === 6) b.rotation.x = 0.25;
    shelf.add(b);
    z += w + 0.03;
  });
  const blocks = [C.coral, C.lilac, C.teal];
  blocks.forEach((color, i) => {
    shelf.add(mesh(rb(0.26, 0.26, 0.26, 0.05), satin(color), 0, 0.92 + (i === 2 ? 0.26 : 0), -0.6 + i * 0.3 - (i === 2 ? 0.45 : 0)));
  });
  shelf.add(mesh(new THREE.SphereGeometry(0.16, 24, 16), satin(C.cream), 0, 0.95, 0.6));
  shelf.position.set(-S / 2 + 0.55, 1.7, 0.5);
  room.add(shelf);

  // Frames on the back wall (Projects), blank on purpose
  const frames = new THREE.Group();
  [[-0.65, 0.2, 0.9, 1.15], [0.35, 0.38, 0.75, 0.6], [0.35, -0.3, 0.75, 0.55]].forEach(([x, y, w, h], i) => {
    frames.add(mesh(rb(w, h, 0.06, 0.03), satin(C.ink), x, y, 0));
    const art = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.12, h - 0.12), matte([C.cream, C.mustard, C.lilac][i], 0.9));
    art.position.set(x, y, 0.035);
    frames.add(art);
  });
  frames.position.set(-1.45, 2.65, -S / 2 + 0.33);
  room.add(frames);

  // Pinboard with ten rising pins (Experience) on the left wall
  const board = new THREE.Group();
  board.add(mesh(rb(0.08, 0.9, 1.8, 0.04), matte(0xe8d3b3, 0.95), 0, 0, 0));
  const pin = new THREE.SphereGeometry(0.05, 14, 10);
  for (let i = 0; i < 10; i += 1) {
    board.add(mesh(pin, satin(i === 9 ? C.coral : C.ink), 0.06, -0.3 + i * 0.065, -0.72 + i * 0.16));
  }
  board.position.set(-S / 2 + 0.34, 3.2, 0.6);
  room.add(board);

  // Plant and envelope (Contact)
  const plant = new THREE.Group();
  plant.add(mesh(new THREE.CylinderGeometry(0.32, 0.25, 0.55, 28), satin(C.pot), 0, 0.275, 0));
  const leafMat = matte(C.leaf, 0.7);
  [[0, 0.85, 0, 0.38], [0.22, 1.12, 0.05, 0.28], [-0.2, 1.05, -0.08, 0.3], [0.05, 1.35, -0.05, 0.22]].forEach(([x, y, z2, r]) => {
    const leaf = mesh(new THREE.SphereGeometry(r, 20, 14), leafMat, x, y, z2);
    leaf.scale.y = 1.2;
    plant.add(leaf);
  });
  plant.position.set(-2.2, 0, -2.1);
  room.add(plant);

  const contact = new THREE.Group();
  contact.add(mesh(rb(0.9, 0.5, 0.9, 0.12), satin(C.cream), 0, 0.25, 0));
  const env = new THREE.Group();
  env.add(mesh(rb(0.62, 0.04, 0.42, 0.02), satin(C.coral), 0, 0, 0));
  const flap = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 3), satin(0xe85f44), 0, 0.03, -0.06);
  flap.scale.set(1, 1, 0.5);
  env.add(flap);
  env.position.set(0, 0.55, 0);
  env.rotation.y = 0.3;
  contact.add(env);
  contact.position.set(1.9, 0, 1.6);
  room.add(contact);

  const shadow = contactShadow(11, 11, 0.55, '8, 6, 20');
  shadow.position.y = -0.58;
  scene.add(shadow);

  // Dust motes in the lamp light
  const motes = new THREE.Points(
    (() => {
      const g = new THREE.BufferGeometry();
      const arr = new Float32Array(60 * 3);
      for (let i = 0; i < 60; i += 1) {
        arr[i * 3] = (Math.random() - 0.5) * 4;
        arr[i * 3 + 1] = Math.random() * 3.6 + 0.2;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
      }
      g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      return g;
    })(),
    new THREE.PointsMaterial({ color: 0xffe2b8, size: 0.035, transparent: true, opacity: 0.7, depthWrite: false }),
  );
  room.add(motes);

  room.rotation.y = 0;

  // Hotspot anchors in world space, same order as STUDIO_SPOTS
  const anchors = [
    new THREE.Vector3(desk.position.x - 0.15, 2.45, desk.position.z),
    new THREE.Vector3(-S / 2 + 0.6, 2.75, 0.5),
    new THREE.Vector3(-1.45, 3.45, -S / 2 + 0.4),
    new THREE.Vector3(-S / 2 + 0.4, 3.85, 0.6),
    new THREE.Vector3(1.9, 1.05, 1.6),
  ];

  const views = {
    overview: { pos: phone ? new THREE.Vector3(17, 15.5, 17) : new THREE.Vector3(14.5, 11.2, 14.5), look: phone ? new THREE.Vector3(-0.4, 2.6, -0.4) : new THREE.Vector3(-1.9, 1.5, 0.4) },
    spots: [
      { pos: new THREE.Vector3(5.5, 4.2, 5.2), look: new THREE.Vector3(-0.6, 1.6, -1.6) },
      { pos: new THREE.Vector3(4.5, 4.2, 3.6), look: new THREE.Vector3(-2.6, 2.2, 0.3) },
      { pos: new THREE.Vector3(3.2, 4.6, 6.0), look: new THREE.Vector3(-1.8, 2.6, -2.2) },
      { pos: new THREE.Vector3(4.2, 5.0, 3.6), look: new THREE.Vector3(-2.6, 3.0, 0.4) },
      { pos: new THREE.Vector3(6.5, 4.2, 6.8), look: new THREE.Vector3(0.6, 0.6, 0.6) },
    ],
  };
  const cam = { pos: views.overview.pos.clone(), look: views.overview.look.clone() };

  function focus(index: number | null) {
    const v = index === null ? views.overview : views.spots[index];
    const pos = phone && index !== null ? v.pos.clone().multiplyScalar(1.35) : v.pos;
    if (reduced) {
      cam.pos.copy(pos);
      cam.look.copy(v.look);
      return;
    }
    gsap.to(cam.pos, { x: pos.x, y: pos.y, z: pos.z, duration: 1.3, ease: 'power3.inOut', overwrite: true });
    gsap.to(cam.look, { x: v.look.x, y: v.look.y, z: v.look.z, duration: 1.3, ease: 'power3.inOut', overwrite: true });
  }

  const pointer = new THREE.Vector2();
  const smooth = new THREE.Vector2();
  const onPointer = (e: PointerEvent) => pointer.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
  window.addEventListener('pointermove', onPointer);

  const motePos = motes.geometry.attributes.position as THREE.BufferAttribute;
  stage.onFrame((t, dt) => {
    smooth.lerp(pointer, 1 - Math.exp(-dt * 2.5));
    camera.position.copy(cam.pos);
    camera.position.x += smooth.x * 0.5;
    camera.position.z -= smooth.x * 0.5;
    camera.position.y -= smooth.y * 0.35;
    camera.lookAt(cam.look);
    if (!reduced) {
      for (let i = 0; i < motePos.count; i += 1) {
        motePos.setY(i, 0.2 + ((motePos.getY(i) - 0.2 + dt * 0.08) % 3.6));
      }
      motePos.needsUpdate = true;
      plant.rotation.z = Math.sin(t * 0.9) * 0.015;
      env.position.y = 0.58 + Math.sin(t * 1.6) * 0.04;
      env.rotation.y = 0.3 + Math.sin(t * 0.7) * 0.12;
      lamp.intensity = 40 + Math.sin(t * 2.1) * 0.8;
    }
  });

  const v = new THREE.Vector3();
  return {
    focus,
    anchors: () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      return anchors.map((a) => {
        v.copy(a).project(camera);
        return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, visible: v.z < 1 };
      });
    },
    dispose: () => {
      window.removeEventListener('pointermove', onPointer);
      stage.dispose();
    },
  };
}
