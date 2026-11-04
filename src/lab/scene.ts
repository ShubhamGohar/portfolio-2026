import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BACKGROUND = 0x130e1d;

function plastic(color: number, roughness: number) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0,
  });
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function radialTexture(inner: string, mid: string, outer: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const fade = ctx.createRadialGradient(256, 256, 24, 256, 256, 250);
  fade.addColorStop(0, inner);
  fade.addColorStop(0.46, mid);
  fade.addColorStop(1, outer);
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, 512, 512);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Peach sphere with shallow lathe bands, so it is not a stock primitive. */
function ribbedSphere(radius: number) {
  const points: THREE.Vector2[] = [];
  const steps = 32;
  for (let i = 0; i <= steps; i += 1) {
    const phi = (i / steps) * Math.PI;
    const rib = 1 + 0.008 * Math.cos(phi * 8);
    const r = Math.max(Math.sin(phi) * radius * rib, 0.001);
    points.push(new THREE.Vector2(r, -Math.cos(phi) * radius));
  }
  return new THREE.LatheGeometry(points, 80);
}

/**
 * Mounts a matte still life. Scroll orbits the camera around the cluster.
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
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  const look = new THREE.Vector3(0.08, 0.7, 0);

  const hemi = new THREE.HemisphereLight(0xfff7fb, 0x3a2844, 0.78);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff6ee, 1.7);
  key.position.set(3.4, 8.6, 5.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 22;
  key.shadow.camera.left = -4.5;
  key.shadow.camera.right = 4.5;
  key.shadow.camera.top = 4.5;
  key.shadow.camera.bottom = -4.5;
  key.shadow.bias = -0.00035;
  key.shadow.normalBias = 0.028;
  key.shadow.radius = 6;
  scene.add(key);
  scene.add(key.target);
  key.target.position.copy(look);
  key.shadow.camera.updateProjectionMatrix();

  const fill = new THREE.DirectionalLight(0xd4c6ff, 0.62);
  fill.position.set(-5.4, 3.1, 3.2);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffb0e4, 0.36);
  rim.position.set(2.2, 2.6, -4.8);
  scene.add(rim);

  const cluster = new THREE.Group();
  scene.add(cluster);

  const cube = new THREE.Mesh(
    new RoundedBoxGeometry(1.16, 1.16, 1.16, 5, 0.13),
    plastic(0xc4b0f4, 0.46),
  );
  cube.position.set(-0.92, 0.58, 0.02);
  cube.rotation.y = 0.86;

  const capsule = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.32, 0.78, 16, 40),
    plastic(0xf8a0d8, 0.4),
  );
  capsule.position.set(0.08, 0.71, -0.08);

  const sphereRadius = 0.62;
  const sphere = new THREE.Mesh(ribbedSphere(sphereRadius), plastic(0xf6b898, 0.4));
  sphere.position.set(1.18, sphereRadius, 0.1);

  for (const mesh of [cube, capsule, sphere]) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    cluster.add(mesh);
  }

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.ShadowMaterial({ color: 0x07040e, opacity: 0.42 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const contactMap = radialTexture(
    'rgba(7, 4, 14, 0.72)',
    'rgba(7, 4, 14, 0.28)',
    'rgba(7, 4, 14, 0)',
  );
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: contactMap ?? undefined,
      transparent: true,
      depthWrite: false,
    }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.012;
  contact.scale.set(3.8, 2.6, 1);
  cluster.add(contact);

  const glowMap = radialTexture(
    'rgba(255, 119, 241, 0.28)',
    'rgba(255, 119, 241, 0.08)',
    'rgba(255, 119, 241, 0)',
  );
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(6.2, 4.2),
    new THREE.MeshBasicMaterial({
      map: glowMap ?? undefined,
      transparent: true,
      depthWrite: false,
    }),
  );
  glow.position.set(0.35, 0.85, -1.7);
  scene.add(glow);

  const restAngle = 0.34;
  const endAngle = -0.72;
  const restDistance = 9.15;
  const endDistance = 8.35;
  const restHeight = 2.45;
  const endHeight = 1.85;

  function apply(progress: number) {
    const t = smoothstep(progress);
    const angle = THREE.MathUtils.lerp(restAngle, endAngle, t);
    const distance = THREE.MathUtils.lerp(restDistance, endDistance, t);
    camera.position.set(Math.sin(angle) * distance, THREE.MathUtils.lerp(restHeight, endHeight, t), Math.cos(angle) * distance);
    camera.lookAt(look);
    cluster.rotation.y = THREE.MathUtils.lerp(0.02, -0.85, t);
    sphere.position.y = THREE.MathUtils.lerp(sphereRadius, sphereRadius + 0.5, t);
    capsule.rotation.z = THREE.MathUtils.lerp(0, -0.55, t);
    capsule.position.y = THREE.MathUtils.lerp(0.71, 1.02, t);
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
        scrub: 0.85,
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
    if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      const material = object.material;
      const materials = Array.isArray(material) ? material : [material];
      for (const entry of materials) {
        const map = 'map' in entry ? entry.map : null;
        if (map instanceof THREE.Texture) map.dispose();
        entry.dispose();
      }
    });
    renderer.dispose();
  };
}
