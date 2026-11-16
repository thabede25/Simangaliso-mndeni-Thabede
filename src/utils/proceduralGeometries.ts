import * as THREE from 'three';

/**
 * Creates a rounded-corner slab oriented flat on the XZ plane with bottom at y = 0.
 */
export function createRoundedSlabGeometry(
  width: number,
  depth: number,
  height: number,
  radius: number,
  bevelSize = 0.006
): THREE.ExtrudeGeometry {
  const hw = width / 2 - bevelSize;
  const hd = depth / 2 - bevelSize;
  const r = Math.min(radius, hw * 0.45, hd * 0.45);

  const shape = new THREE.Shape();
  shape.moveTo(-hw + r, -hd);
  shape.lineTo(hw - r, -hd);
  shape.quadraticCurveTo(hw, -hd, hw, -hd + r);
  shape.lineTo(hw, hd - r);
  shape.quadraticCurveTo(hw, hd, hw - r, hd);
  shape.lineTo(-hw + r, hd);
  shape.quadraticCurveTo(-hw, hd, -hw, hd - r);
  shape.lineTo(-hw, -hd + r);
  shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd);

  const innerDepth = Math.max(0.002, height - bevelSize * 2);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: innerDepth,
    bevelEnabled: true,
    bevelThickness: bevelSize,
    bevelSize,
    bevelSegments: 2,
    curveSegments: 8,
  });

  // Rotate from XY extrusion (+Z) to XZ slab (+Y up), resting at y = 0
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, bevelSize, 0);

  // Normalize UVs across [0, 1] x [0, 1] so canvas textures map cleanly without tiling/smearing
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    uv.setXY(i, x / width + 0.5, 1 - (z / depth + 0.5));
  }
  uv.needsUpdate = true;

  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a LatheGeometry for a hollow ceramic coffee mug resting at y = 0.
 */
export function createCeramicMugGeometry(): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.072, 0),
    new THREE.Vector2(0.076, 0.015),
    new THREE.Vector2(0.078, 0.165),
    new THREE.Vector2(0.074, 0.175),
    new THREE.Vector2(0.066, 0.175),
    new THREE.Vector2(0.064, 0.022),
    new THREE.Vector2(0, 0.022),
  ];
  const geo = new THREE.LatheGeometry(pts, 24);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a spun-metal desk lamp shade via LatheGeometry.
 */
export function createLampShadeGeometry(): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(0.045, 0.24),
    new THREE.Vector2(0.075, 0.22),
    new THREE.Vector2(0.145, 0.11),
    new THREE.Vector2(0.22, 0.0),
    new THREE.Vector2(0.212, -0.005),
    new THREE.Vector2(0.138, 0.105),
    new THREE.Vector2(0.068, 0.21),
    new THREE.Vector2(0.04, 0.23),
  ];
  const geo = new THREE.LatheGeometry(pts, 28);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a curved TubeGeometry jumper wire arching cleanly between two XZ points.
 */
export function createJumperWireGeometry(
  start: [number, number, number],
  end: [number, number, number],
  arcHeight = 0.07
): THREE.TubeGeometry {
  const midX = (start[0] + end[0]) * 0.5;
  const midZ = (start[2] + end[2]) * 0.5;
  const peakY = Math.max(start[1], end[1]) + arcHeight;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(...start),
    new THREE.Vector3(start[0] + (midX - start[0]) * 0.35, peakY, start[2] + (midZ - start[2]) * 0.35),
    new THREE.Vector3(end[0] + (midX - end[0]) * 0.35, peakY, end[2] + (midZ - end[2]) * 0.35),
    new THREE.Vector3(...end),
  ]);
  return new THREE.TubeGeometry(curve, 14, 0.0045, 6, false);
}

/**
 * Creates a smooth desk-hugging USB-C cable connecting the laptop to the Arduino rig.
 */
export function createUsbCableGeometry(): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.54, 0.022, -0.45),
    new THREE.Vector3(-0.36, 0.018, -0.52),
    new THREE.Vector3(-0.08, 0.016, -0.34),
    new THREE.Vector3(0.28, 0.017, -0.2),
    new THREE.Vector3(0.61, 0.036, -0.2),
  ]);
  return new THREE.TubeGeometry(curve, 28, 0.007, 8, false);
}

/**
 * Generates MacBook-style keycap coordinates and dimensions for InstancedMesh rendering.
 */
export interface KeySpec {
  x: number;
  z: number;
  w: number;
  d: number;
}

const KEY_ROWS: { z: number; depth: number; keys: number[] }[] = [
  // Function row
  { z: -0.148, depth: 0.032, keys: [1.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.2] },
  // Number row
  { z: -0.102, depth: 0.042, keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5] },
  // QWERTY row
  { z: -0.052, depth: 0.042, keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
  // ASDF row
  { z: -0.002, depth: 0.042, keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75] },
  // ZXCV row
  { z: 0.048, depth: 0.042, keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25] },
  // Spacebar row
  { z: 0.098, depth: 0.044, keys: [1.1, 1.1, 1.1, 1.35, 5.2, 1.35, 1.1, 1.1, 1.1] },
];

export function buildLaptopKeySpecs(): KeySpec[] {
  const unit = 0.066;
  const gap = 0.006;
  const totalWidth = 14.5 * unit;
  const list: KeySpec[] = [];

  for (const row of KEY_ROWS) {
    let x = -totalWidth / 2;
    for (const units of row.keys) {
      const w = units * unit;
      list.push({
        x: x + w / 2,
        z: row.z,
        w: w - gap,
        d: row.depth,
      });
      x += w;
    }
  }
  return list;
}
