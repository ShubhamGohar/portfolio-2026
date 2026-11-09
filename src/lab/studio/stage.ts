import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const FinishShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uVignette: { value: 0.22 },
    uGrain: { value: 0.03 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform vec2 uRes;
    uniform float uVignette;
    uniform float uGrain;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 d = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
      float v = smoothstep(1.05, 0.2, length(d));
      c.rgb *= mix(1.0 - uVignette, 1.0, v);
      float n = hash(floor(vUv * uRes) + fract(uTime * 7.0) * 113.0) - 0.5;
      c.rgb += n * uGrain;
      gl_FragColor = c;
    }
  `,
};

export interface StudioStage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  phone: boolean;
  size: () => { width: number; height: number };
  onFrame: (fn: (t: number, dt: number) => void) => void;
  onResize: (fn: (w: number, h: number) => void) => void;
  dispose: () => void;
}

/**
 * Renderer for the Studio: AgX tone mapping, a PMREM RoomEnvironment (no download),
 * PCF shadows, and a short post chain. Phones skip GTAO, use half-res bloom,
 * swap 4x MSAA for FXAA and run at 30fps. SMAA is avoided: its lookup textures
 * alone cost ~34 KB gzip.
 */
export function createStudioStage(host: HTMLElement): StudioStage | null {
  const phone = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: phone ? 'low-power' : 'high-performance' });
  } catch {
    return null;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(20, 1, 0.5, 80);

  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: phone ? 0 : 4 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  let gtao: GTAOPass | null = null;
  if (!phone) {
    gtao = new GTAOPass(scene, camera, 1, 1);
    gtao.blendIntensity = 0.85;
    gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.4, thickness: 1.2, scale: 1.1, samples: 12 });
    gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
    composer.addPass(gtao);
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.5, 2.2);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const fxaa = phone ? new ShaderPass(FXAAShader) : null;
  if (fxaa) composer.addPass(fxaa);
  const finish = new ShaderPass(FinishShader);
  composer.addPass(finish);

  const frameFns: ((t: number, dt: number) => void)[] = [];
  const resizeFns: ((w: number, h: number) => void)[] = [];
  const timer = new THREE.Timer();
  timer.connect(document);
  const minFrame = phone ? 1 / 30 : 0;
  let acc = 0;
  let width = 1;
  let height = 1;

  const resize = () => {
    width = host.clientWidth;
    height = host.clientHeight;
    if (!width || !height) return;
    const edgeCap = phone ? 1280 : 2560;
    const dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.75, edgeCap / Math.max(width, height));
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    composer.setPixelRatio(dpr);
    composer.setSize(width, height);
    if (phone) bloom.resolution.set(width / 2, height / 2);
    finish.uniforms.uRes.value.set(width * dpr, height * dpr);
    fxaa?.material.uniforms.resolution.value.set(1 / (width * dpr), 1 / (height * dpr));
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    for (const fn of resizeFns) fn(width, height);
  };

  const loop = (time: number) => {
    timer.update(time);
    const dt = Math.min(timer.getDelta(), 0.25);
    acc += dt;
    if (acc < minFrame) return;
    const step = acc;
    acc = 0;
    const t = timer.getElapsed();
    for (const fn of frameFns) fn(t, step);
    finish.uniforms.uTime.value = t;
    composer.render(step);
  };

  const onVisibility = () => renderer.setAnimationLoop(document.hidden ? null : loop);
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
    onFrame: (fn) => frameFns.push(fn),
    onResize: (fn) => resizeFns.push(fn),
    dispose: () => {
      renderer.setAnimationLoop(null);
      timer.dispose();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
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
      for (const pass of composer.passes) pass.dispose();
      composer.dispose();
      env.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
