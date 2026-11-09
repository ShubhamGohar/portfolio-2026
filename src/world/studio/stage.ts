import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { StudioPost } from './post';
import { isPhone, type QualityTier } from './quality';

export interface StudioStage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  phone: boolean;
  size: () => { width: number; height: number };
  dpr: () => number;
  onFrame: (fn: (t: number, dt: number) => void) => void;
  onResize: (fn: (w: number, h: number) => void) => void;
  setShadows: (enabled: boolean) => void;
  setTier: (tier: QualityTier) => void;
  attachPost: (post: StudioPost) => void;
  detachPost: () => void;
  pauseLoop: (paused: boolean) => void;
  renderFrame: (t: number, dt: number) => void;
  snapshot: () => string;
  dispose: () => void;
}

/**
 * Stage-1 renderer: AgX, a local PMREM, no shadow maps, no composer.
 * Stage 2 attaches the post-processing chunk and turns shadows on.
 */
export function createStudioStage(host: HTMLElement): StudioStage | null {
  const phone = isPhone();
  const record = (() => {
    try {
      return new URLSearchParams(window.location.search).has('record');
    } catch {
      return false;
    }
  })();
  let renderer: THREE.WebGLRenderer;
  const make = (opts: THREE.WebGLRendererParameters) => new THREE.WebGLRenderer(opts);
  try {
    renderer = make({
      antialias: !phone,
      powerPreference: phone ? 'low-power' : 'high-performance',
      preserveDrawingBuffer: record,
      failIfMajorPerformanceCaveat: false,
    });
  } catch {
    try {
      renderer = make({ antialias: false, powerPreference: 'low-power', preserveDrawingBuffer: record, failIfMajorPerformanceCaveat: false });
    } catch {
      return null;
    }
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(20, 1, 0.5, 80);

  const frameFns: ((t: number, dt: number) => void)[] = [];
  const resizeFns: ((w: number, h: number) => void)[] = [];
  const timer = new THREE.Timer();
  timer.connect(document);
  let minFrame = phone ? 1 / 30 : 0;
  let acc = 0;
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let dprCap = phone ? 1.25 : 1.5;
  let post: StudioPost | null = null;
  let paused = false;

  const applySize = () => {
    if (!width || !height) return;
    const edgeCap = phone ? 1280 : 2560;
    pixelRatio = Math.min(window.devicePixelRatio || 1, dprCap, edgeCap / Math.max(width, height));
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    post?.resize(width, height, pixelRatio);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    for (const fn of resizeFns) fn(width, height);
  };

  const resize = () => {
    width = host.clientWidth;
    height = host.clientHeight;
    applySize();
  };

  const renderFrame = (t: number, dt: number) => {
    for (const fn of frameFns) fn(t, dt);
    if (post) {
      post.setTime(t);
      post.render(dt);
    } else {
      renderer.render(scene, camera);
    }
  };

  const loop = (time: number) => {
    if (paused) return;
    timer.update(time);
    const dt = Math.min(timer.getDelta(), 0.25);
    acc += dt;
    if (acc < minFrame) return;
    const step = acc;
    acc = 0;
    renderFrame(timer.getElapsed(), step);
  };

  const onVisibility = () => {
    if (paused) return;
    renderer.setAnimationLoop(document.hidden ? null : loop);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  document.addEventListener('visibilitychange', onVisibility);
  requestAnimationFrame(() => {
    resize();
    renderer.setAnimationLoop(loop);
  });
  (window as unknown as { __labInfo?: THREE.WebGLInfo }).__labInfo = renderer.info;
  renderer.info.autoReset = false;
  frameFns.push(() => renderer.info.reset());

  return {
    renderer,
    scene,
    camera,
    phone,
    size: () => ({ width, height }),
    dpr: () => pixelRatio,
    onFrame: (fn) => frameFns.push(fn),
    onResize: (fn) => resizeFns.push(fn),
    setShadows: (enabled) => {
      renderer.shadowMap.enabled = enabled;
    },
    setTier: (tier) => {
      dprCap = tier === 'full' ? (phone ? 1.5 : 1.75) : phone ? 1.25 : 1.5;
      minFrame = phone || tier !== 'full' ? 1 / 30 : 0;
      applySize();
    },
    attachPost: (next) => {
      post = next;
      post.resize(width, height, pixelRatio);
    },
    detachPost: () => {
      post?.dispose();
      post = null;
    },
    pauseLoop: (value) => {
      paused = value;
      renderer.setAnimationLoop(value || document.hidden ? null : loop);
    },
    renderFrame: (t, dt) => {
      timer.reset();
      renderFrame(t, dt);
    },
    snapshot: () => renderer.domElement.toDataURL('image/jpeg', 0.92),
    dispose: () => {
      renderer.setAnimationLoop(null);
      timer.dispose();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      post?.dispose();
      post = null;
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        for (const m of mats) {
          for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose();
          m.dispose();
        }
      });
      if (scene.background instanceof THREE.Texture) scene.background.dispose();
      env.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
