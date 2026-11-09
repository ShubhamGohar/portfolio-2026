import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const isPhone = () => window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  phone: boolean;
  /** Registers a per-frame callback; `t` is seconds since mount, `dt` is clamped. */
  onFrame: (fn: (t: number, dt: number) => void) => void;
  onResize: (fn: (width: number, height: number) => void) => void;
  dispose: () => void;
}

interface StageOptions {
  background: number | null;
  fov?: number;
  shadows?: boolean;
  exposure?: number;
  envIntensity?: number;
}

/**
 * Shared renderer setup for the lab concepts: DPR and drawing-buffer caps,
 * a procedural RoomEnvironment (no HDR download), one soft shadow map,
 * 30fps on phones, and a loop that stops while the tab is hidden.
 */
export function createStage(host: HTMLElement, options: StageOptions): Stage | null {
  const phone = isPhone();
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: !phone,
      alpha: options.background === null,
      powerPreference: phone ? 'low-power' : 'high-performance',
    });
  } catch {
    return null;
  }

  if (options.background !== null) renderer.setClearColor(options.background, 1);
  else renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = options.exposure ?? 1;
  renderer.shadowMap.enabled = options.shadows ?? true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envMap;
  scene.environmentIntensity = options.envIntensity ?? 0.6;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(options.fov ?? 35, 1, 0.1, 200);

  const frameFns: ((t: number, dt: number) => void)[] = [];
  const resizeFns: ((w: number, h: number) => void)[] = [];
  const timer = new THREE.Timer();
  timer.connect(document);
  const minFrame = phone ? 1 / 30 : 0;
  let acc = 0;

  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    const edgeCap = phone ? 1280 : 2560;
    const dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.75, edgeCap / Math.max(width, height));
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    for (const fn of resizeFns) fn(width, height);
  };

  const loop = (time: number) => {
    timer.update(time);
    const dt = Math.min(timer.getDelta(), 0.1);
    acc += dt;
    if (acc < minFrame) return;
    const step = acc;
    acc = 0;
    const t = timer.getElapsed();
    for (const fn of frameFns) fn(t, step);
    renderer.render(scene, camera);
  };

  const onVisibility = () => {
    if (document.hidden) renderer.setAnimationLoop(null);
    else renderer.setAnimationLoop(loop);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(host);
  document.addEventListener('visibilitychange', onVisibility);
  requestAnimationFrame(() => {
    resize();
    renderer.setAnimationLoop(loop);
  });

  (window as unknown as { __labInfo?: THREE.WebGLInfo }).__labInfo = renderer.info;

  return {
    renderer,
    scene,
    camera,
    phone,
    onFrame: (fn) => frameFns.push(fn),
    onResize: (fn) => resizeFns.push(fn),
    dispose: () => {
      renderer.setAnimationLoop(null);
      timer.dispose();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        for (const material of materials) {
          for (const value of Object.values(material)) {
            if (value instanceof THREE.Texture) value.dispose();
          }
          material.dispose();
        }
      });
      envMap.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}

export function softKeyLight(color: number, intensity: number, phone: boolean, extent = 8) {
  const light = new THREE.DirectionalLight(color, intensity);
  light.castShadow = true;
  const size = phone ? 1024 : 2048;
  light.shadow.mapSize.set(size, size);
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 60;
  light.shadow.camera.left = -extent;
  light.shadow.camera.right = extent;
  light.shadow.camera.top = extent;
  light.shadow.camera.bottom = -extent;
  light.shadow.bias = -0.0004;
  light.shadow.normalBias = 0.03;
  light.shadow.radius = 5;
  return light;
}

/** A radial-gradient texture drawn on a 2D canvas (contact shadows, glows, sky). */
export function radialTexture(stops: [number, string][], size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function contactShadow(width: number, depth: number, opacity = 0.5, tint = '10, 8, 20') {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshBasicMaterial({
      map: radialTexture([
        [0, `rgba(${tint}, ${opacity})`],
        [0.55, `rgba(${tint}, ${opacity * 0.35})`],
        [1, `rgba(${tint}, 0)`],
      ]),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = -1;
  return mesh;
}

export function matte(color: number, roughness = 0.62, extra: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
}

export function satin(color: number, extra: THREE.MeshPhysicalMaterialParameters = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.38,
    metalness: 0,
    clearcoat: 0.6,
    clearcoatRoughness: 0.28,
    ...extra,
  });
}
