import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Box with a small chamfer: crisp edges that still catch a highlight. */
export const chamfer = (w: number, h: number, d: number, r = 0.012, seg = 2) =>
  new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2.2, h / 2.2, d / 2.2));

export function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Lathe from [radius, height] pairs. */
export const lathe = (pts: [number, number][], seg = 40) =>
  new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0005), y)), seg);

/** Bend a geometry around the Y axis so a flat slab becomes a curved shell. */
export function bendY(geo: THREE.BufferGeometry, radius: number) {
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const a = x / radius;
    const rr = radius - z;
    p.setX(i, Math.sin(a) * rr);
    p.setZ(i, radius - Math.cos(a) * rr);
  }
  geo.computeVertexNormals();
  return geo;
}

/** A leaf blade: bezier outline, cupped across and drooping along its length. */
export function leafGeometry(length: number, width: number, droop: number) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(width, length * 0.22, width * 0.95, length * 0.72, 0, length);
  s.bezierCurveTo(-width * 0.95, length * 0.72, -width, length * 0.22, 0, 0);
  const g = new THREE.ShapeGeometry(s, 10);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i);
    const y = p.getY(i);
    const t = y / length;
    p.setZ(i, -droop * t * t + (x / width) ** 2 * width * 0.35);
  }
  g.computeVertexNormals();
  return g;
}

export const tube = (points: THREE.Vector3[], radius: number, seg = 32) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), seg, radius, 8, false);

/**
 * Collects static parts and merges them per material, so a room of ~200 parts
 * costs one draw call per material instead of one per part.
 */
export class Batch {
  private parts = new Map<THREE.Material, THREE.BufferGeometry[]>();
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private e = new THREE.Euler();
  private s = new THREE.Vector3();
  private v = new THREE.Vector3();

  add(
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    pos: [number, number, number] = [0, 0, 0],
    rot: [number, number, number] = [0, 0, 0],
    scale: number | [number, number, number] = 1,
    parent?: THREE.Matrix4,
  ) {
    this.q.setFromEuler(this.e.set(rot[0], rot[1], rot[2]));
    if (typeof scale === 'number') this.s.setScalar(scale);
    else this.s.set(scale[0], scale[1], scale[2]);
    this.m.compose(this.v.set(pos[0], pos[1], pos[2]), this.q, this.s);
    if (parent) this.m.premultiply(parent);
    const g = (geo.index ? geo.toNonIndexed() : geo.clone()).applyMatrix4(this.m);
    for (const name of Object.keys(g.attributes)) {
      if (name !== 'position' && name !== 'normal' && name !== 'uv') g.deleteAttribute(name);
    }
    if (!g.attributes.uv) {
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array((g.attributes.position.count) * 2), 2));
    }
    g.morphAttributes = {};
    const list = this.parts.get(mat) ?? [];
    list.push(g);
    this.parts.set(mat, list);
  }

  build(group: THREE.Group, shadows = true) {
    for (const [mat, list] of this.parts) {
      const merged = mergeGeometries(list, false);
      for (const g of list) g.dispose();
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, mat);
      mesh.castShadow = shadows;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    this.parts.clear();
    return group;
  }
}
