import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BACKGROUND = 0x130e1d;

type Solid = {
  mesh: THREE.Mesh;
  rest: THREE.Vector3;
  end: THREE.Vector3;
  restYaw: number;
  endYaw: number;
};

function matte(color: number, roughness: number) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0,
  });
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function place(solid: Solid, t: number) {
  solid.mesh.position.lerpVectors(solid.rest, solid.end, t);
  solid.mesh.rotation.y = THREE.MathUtils.lerp(solid.restYaw, solid.endYaw, t);
}

/**
 * Mounts a matte still life. Scroll eases the camera and the solids.
 * `prefers-reduced-motion` keeps the opening frame and skips ScrollTrigger.
 */
export function mountLabScene(host: HTMLElement): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
  } catch {
    return () => {};
  }

  renderer.setClearColor(BACKGROUND, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 40);

  const hemi = new THREE.HemisphereLight(0xf7f2ff, 0x23182f, 1.15);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff4ea, 2.65);
  key.position.set(3.4, 9.2, 4.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 2;
  key.shadow.camera.far = 22;
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.035;
  key.shadow.radius = 7;
  scene.add(key);
  scene.add(key.target);
  key.target.position.set(0.35, 0.3, 0);
  key.shadow.camera.updateProjectionMatrix();

  const fill = new THREE.DirectionalLight(0xd9ccff, 0.72);
  fill.position.set(-5.5, 3.2, 3.4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffc4ea, 0.42);
  rim.position.set(1.2, 3.4, -5.5);
  scene.add(rim);

  const cube = new THREE.Mesh(new RoundedBoxGeometry(1.16, 1.16, 1.16, 4, 0.06), matte(0xc9bce6, 0.84));
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.46, 1.28, 48), matte(0xe7e0f4, 0.82));
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.62, 64, 48), matte(0xf2d3bf, 0.74));
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.72, 48), matte(0xb7a4dc, 0.86));

  const solids: Solid[] = [
    {
      mesh: cube,
      rest: new THREE.Vector3(-0.78, 0.58, 0.06),
      end: new THREE.Vector3(-0.9, 0.62, 0.22),
      restYaw: 0.72,
      endYaw: 1.28,
    },
    {
      mesh: cone,
      rest: new THREE.Vector3(0.18, 0.64, -0.28),
      end: new THREE.Vector3(0.28, 0.86, -0.42),
      restYaw: 0.2,
      endYaw: 0.75,
    },
    {
      mesh: cylinder,
      rest: new THREE.Vector3(0.98, 0.36, 0.62),
      end: new THREE.Vector3(0.38, 0.4, 0.78),
      restYaw: 0.15,
      endYaw: 0.85,
    },
    {
      mesh: sphere,
      rest: new THREE.Vector3(1.62, 0.62, -0.05),
      end: new THREE.Vector3(1.28, 0.95, 0.12),
      restYaw: 0,
      endYaw: 0.45,
    },
  ];

  for (const solid of solids) {
    solid.mesh.castShadow = true;
    solid.mesh.receiveShadow = true;
    scene.add(solid.mesh);
  }

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.ShadowMaterial({ color: 0x07040e, opacity: 0.48 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);

  const restCamera = new THREE.Vector3(0.35, 1.85, 9.4);
  const endCamera = new THREE.Vector3(0.05, 1.48, 8.35);
  const restLook = new THREE.Vector3(0.38, 0.42, 0);
  const endLook = new THREE.Vector3(0.22, 0.58, 0.05);
  const look = new THREE.Vector3();

  function apply(progress: number) {
    const t = smoothstep(progress);
    for (const solid of solids) place(solid, t);
    camera.position.lerpVectors(restCamera, endCamera, t);
    look.lerpVectors(restLook, endLook, t);
    camera.lookAt(look);
  }

  function render() {
    renderer.render(scene, camera);
  }

  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    render();
  }

  apply(0);

  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  let trigger: ScrollTrigger | undefined;
  let frame = 0;

  if (!reduced) {
    const track = host.closest('[data-lab-track]');
    frame = window.requestAnimationFrame(() => {
      trigger = ScrollTrigger.create({
        trigger: track instanceof HTMLElement ? track : undefined,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.9,
        onUpdate: (self) => {
          apply(self.progress);
          render();
        },
      });
      render();
    });
  }

  return () => {
    window.cancelAnimationFrame(frame);
    trigger?.kill();
    observer.disconnect();
    host.removeChild(renderer.domElement);
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      const material = object.material;
      if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
      else material.dispose();
    });
    renderer.dispose();
  };
}
