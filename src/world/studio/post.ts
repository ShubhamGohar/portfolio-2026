import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import type { QualityTier } from './quality';

const FinishShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uVignette: { value: 0 },
    uGrain: { value: 0 },
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

export interface StudioPost {
  render: (dt: number) => void;
  resize: (w: number, h: number, dpr: number) => void;
  setTime: (t: number) => void;
  setFade: (k: number) => void;
  dispose: () => void;
}

/**
 * Stage-2 chunk: GTAO (desktop full), bloom, grain, vignette.
 * Mid skips GTAO and MSAA and uses FXAA instead.
 */
export function createStudioPost(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  opts: { tier: QualityTier; phone: boolean; width: number; height: number; dpr: number },
): StudioPost {
  const full = opts.tier === 'full' && !opts.phone;
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: full ? 4 : 0 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));

  let gtao: GTAOPass | null = null;
  const gtaoMax = 0.85;
  if (full) {
    gtao = new GTAOPass(scene, camera, 1, 1);
    gtao.blendIntensity = 0;
    gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.4, thickness: 1.2, scale: 1.1, samples: 12 });
    gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
    composer.addPass(gtao);
  }

  const bloomMax = 0.5;
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0, 0.5, 2.2);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const fxaa = full ? null : new ShaderPass(FXAAShader);
  if (fxaa) composer.addPass(fxaa);

  const finish = new ShaderPass(FinishShader);
  composer.addPass(finish);

  const vMax = 0.22;
  const gMax = 0.03;
  let fade = 0;

  const applyFade = () => {
    if (gtao) gtao.blendIntensity = gtaoMax * fade;
    bloom.strength = bloomMax * fade;
    finish.uniforms.uVignette.value = vMax * fade;
    finish.uniforms.uGrain.value = gMax * fade;
  };

  const resize = (w: number, h: number, dpr: number) => {
    if (!w || !h) return;
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    if (opts.phone || opts.tier === 'mid') bloom.resolution.set(w / 2, h / 2);
    finish.uniforms.uRes.value.set(w * dpr, h * dpr);
    fxaa?.material.uniforms.resolution.value.set(1 / (w * dpr), 1 / (h * dpr));
  };

  resize(opts.width, opts.height, opts.dpr);
  applyFade();

  return {
    render: (dt) => composer.render(dt),
    resize,
    setTime: (t) => {
      finish.uniforms.uTime.value = t;
    },
    setFade: (k) => {
      fade = Math.min(1, Math.max(0, k));
      applyFade();
    },
    dispose: () => {
      for (const pass of composer.passes) pass.dispose();
      composer.dispose();
    },
  };
}
