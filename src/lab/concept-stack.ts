import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { contactShadow, createStage, matte, prefersReducedMotion, satin, softKeyLight } from './kit';

gsap.registerPlugin(ScrollTrigger);

const C = {
  violet: 0x8b78ff,
  porcelain: 0xf1ede6,
  blue: 0x3a6cf4,
  coral: 0xff7f5c,
  ink: 0x161a2e,
  white: 0xffffff,
};

function slab(color: number, w: number, h: number, d: number) {
  return new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 6, 0.22), satin(color, { roughness: 0.32, clearcoat: 0.8 }));
}

/** Frontend layer: a grid of raised cards, like a product listing. */
function frontendLayer() {
  const g = new THREE.Group();
  const base = slab(C.violet, 4, 0.5, 4);
  g.add(base);
  const card = new RoundedBoxGeometry(0.95, 0.14, 1.15, 3, 0.06);
  const cardMat = satin(C.white, { roughness: 0.4 });
  const accentMat = satin(C.coral, { roughness: 0.4 });
  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      const m = new THREE.Mesh(card, i === 1 && j === 0 ? accentMat : cardMat);
      m.position.set(-1.15 + i * 1.15, 0.3, -0.7 + j * 1.4);
      g.add(m);
    }
  }
  return g;
}

/** Backend layer: rounded services joined by short pipes. */
function backendLayer() {
  const g = new THREE.Group();
  g.add(slab(C.porcelain, 4, 0.5, 4));
  const cyl = new THREE.CylinderGeometry(0.34, 0.34, 0.5, 32);
  const capMat = satin(C.violet, { roughness: 0.35 });
  const pts: [number, number][] = [[-1.1, -1.1], [1.1, -1.1], [0, 0], [-1.1, 1.1], [1.1, 1.1]];
  for (const [x, z] of pts) {
    const m = new THREE.Mesh(cyl, capMat);
    m.position.set(x, 0.42, z);
    g.add(m);
  }
  const pipeMat = satin(C.ink, { roughness: 0.5 });
  for (const [x, z] of pts.filter((p) => p[0] !== 0)) {
    const len = Math.hypot(x, z);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, len, 12), pipeMat);
    pipe.position.set(x / 2, 0.36, z / 2);
    pipe.rotation.z = Math.PI / 2;
    pipe.rotation.y = -Math.atan2(z, x);
    g.add(pipe);
  }
  return g;
}

/** Platform layer: a field of small domes. */
function platformLayer() {
  const g = new THREE.Group();
  g.add(slab(C.blue, 4, 0.5, 4));
  const dome = new THREE.SphereGeometry(0.16, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const mat = satin(C.porcelain, { roughness: 0.4 });
  const count = 36;
  const inst = new THREE.InstancedMesh(dome, mat, count);
  const d = new THREE.Object3D();
  let k = 0;
  for (let i = 0; i < 6; i += 1) {
    for (let j = 0; j < 6; j += 1) {
      d.position.set(-1.4 + i * 0.56, 0.25, -1.4 + j * 0.56);
      d.updateMatrix();
      inst.setMatrixAt(k, d.matrix);
      k += 1;
    }
  }
  g.add(inst);
  return g;
}

export interface StackHandle {
  dispose: () => void;
}

export function mountStack(host: HTMLElement, track: HTMLElement): StackHandle {
  const stage = createStage(host, { background: null, fov: 28, exposure: 1.0, envIntensity: 0.7 });
  if (!stage) return { dispose: () => {} };
  const { scene, camera, phone } = stage;
  const reduced = prefersReducedMotion();
  gsap.ticker.lagSmoothing(0);

  scene.add(new THREE.HemisphereLight(0xdcd6ff, 0x1a1530, 0.7));
  const key = softKeyLight(0xfff1e6, 2.4, phone, 6);
  key.position.set(5, 10, 6);
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x8fa8ff, 2.2);
  rim.position.set(-6, 4, -6);
  scene.add(rim);
  const warm = new THREE.PointLight(0xff8a65, 18, 14, 2);
  warm.position.set(4, 1, -3);
  scene.add(warm);

  const root = new THREE.Group();
  scene.add(root);

  const layers = [frontendLayer(), backendLayer(), platformLayer()];
  for (const layer of layers) {
    layer.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    root.add(layer);
  }

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ color: 0x05060d, opacity: 0.5 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.27;
  floor.receiveShadow = true;
  scene.add(floor);
  const pool = contactShadow(9, 9, 0.6, '4, 5, 12');
  pool.position.y = -0.26;
  scene.add(pool);

  const beads = new THREE.Group();
  const beadGeo = new THREE.SphereGeometry(0.17, 28, 18);
  for (let i = 0; i < 10; i += 1) {
    const m = new THREE.Mesh(beadGeo, i === 9 ? satin(C.coral) : satin(C.porcelain));
    const a = (i / 10) * Math.PI * 2;
    m.position.set(Math.cos(a) * 3.6, 0, Math.sin(a) * 3.6);
    m.castShadow = true;
    beads.add(m);
  }
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.6, 0.015, 8, 160),
    matte(0xb9b2ff, 0.5, { transparent: true, opacity: 0.45 }),
  );
  ring.rotation.x = Math.PI / 2;
  beads.add(ring);
  beads.scale.setScalar(0.001);
  root.add(beads);

  // Scroll state, scrubbed by ScrollTrigger. Each key is a pose.
  const s = {
    spread: 0,
    yaw: -0.55,
    camY: 7.5,
    camR: 15,
    lookY: 0.9,
    beads: 0,
    offsetX: phone ? 0 : 2.6,
  };

  const layerY = (i: number) => [1.2, 0.6, 0][i];

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut', duration: 1 } });
  tl.to(s, { spread: 1, yaw: -0.15, camY: 5.2, camR: 16.5, lookY: 1.9 }, 0)
    .to(s, { yaw: 0.35, camY: 3.4, lookY: 1.1 }, 1)
    .to(s, { spread: 0.15, yaw: 0.9, camY: 6.2, camR: 17, lookY: 0.8, beads: 1 }, 2)
    .to(s, { spread: 0, yaw: 1.6, camY: 9, camR: 16, lookY: 0.6, beads: 1 }, 3);

  let trigger: ScrollTrigger | undefined;
  if (!reduced) {
    trigger = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.9,
      onUpdate: (self) => tl.progress(self.progress),
    });
  }

  const pointer = new THREE.Vector2();
  const smooth = new THREE.Vector2();
  const onPointer = (e: PointerEvent) => pointer.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
  window.addEventListener('pointermove', onPointer);

  const look = new THREE.Vector3();
  stage.onFrame((t, dt) => {
    smooth.lerp(pointer, 1 - Math.exp(-dt * 3));
    const idle = reduced ? 0 : t;
    layers.forEach((layer, i) => {
      const gap = s.spread * 1.35;
      layer.position.y = layerY(i) + gap * (2 - i) + Math.sin(idle * 1.1 + i * 1.3) * 0.05 * (0.3 + s.spread);
      layer.rotation.y = s.spread * (i - 1) * 0.22 + Math.sin(idle * 0.5 + i) * 0.02;
    });
    root.rotation.y = s.yaw + idle * 0.04;
    beads.scale.setScalar(Math.max(0.001, s.beads));
    beads.rotation.y = -idle * 0.15;
    beads.position.y = 0.8 + Math.sin(idle * 0.8) * 0.1;
    beads.children.forEach((b, i) => {
      if (i < 10) b.position.y = Math.sin(idle * 1.4 + i * 0.7) * 0.12;
    });
    const r = phone ? s.camR * 2.05 : s.camR;
    camera.position.set(r * 0.62 + smooth.x * 0.8, s.camY * (phone ? 1.25 : 1) - smooth.y * 0.5, r * 0.78);
    look.set(-s.offsetX, s.lookY + (phone ? -2.5 : 0), 0);
    camera.lookAt(look);
  });

  return {
    dispose: () => {
      trigger?.kill();
      tl.kill();
      window.removeEventListener('pointermove', onPointer);
      stage.dispose();
    },
  };
}
