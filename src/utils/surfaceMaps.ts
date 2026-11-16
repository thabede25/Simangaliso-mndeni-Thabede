export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2D(ix: number, iy: number, periodX: number, periodY: number, seed: number): number {
  const wx = ((ix % periodX) + periodX) % periodX;
  const wy = ((iy % periodY) + periodY) % periodY;
  let h = (wx * 374761393 + wy * 668265263 + seed * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Tileable 2D value noise in [0, 1] with periodic lattice.
 */
export function tileableValueNoise(
  u: number,
  v: number,
  freqX: number,
  freqY: number,
  seed: number
): number {
  const gx = u * freqX;
  const gy = v * freqY;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const fx = smoothstep(gx - x0);
  const fy = smoothstep(gy - y0);

  const n00 = hash2D(x0, y0, freqX, freqY, seed);
  const n10 = hash2D(x0 + 1, y0, freqX, freqY, seed);
  const n01 = hash2D(x0, y0 + 1, freqX, freqY, seed);
  const n11 = hash2D(x0 + 1, y0 + 1, freqX, freqY, seed);

  const nx0 = n00 + (n10 - n00) * fx;
  const nx1 = n01 + (n11 - n01) * fx;
  return nx0 + (nx1 - nx0) * fy;
}

/**
 * Multi-octave tileable FBM noise in [0, 1].
 */
export function tileableFbm2D(u: number, v: number, baseFreq: number, octaves = 4, seed = 101): number {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  let freq = baseFreq;

  for (let o = 0; o < octaves; o++) {
    sum += tileableValueNoise(u, v, freq, freq, seed + o * 31) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }

  return norm > 0 ? sum / norm : 0.5;
}

/**
 * Converts a scalar heightfield [0..1] into an RGBA tangent-space normal map buffer
 * using wrap-around 3x3 Sobel finite differences.
 */
export function heightFieldToNormalMapData(
  heights: Float32Array,
  width: number,
  height: number,
  strength = 2.4
): Uint8ClampedArray {
  const rgba = new Uint8ClampedArray(width * height * 4);

  const sample = (x: number, y: number): number => {
    const wx = ((x % width) + width) % width;
    const wy = ((y % height) + height) % height;
    return heights[wy * width + wx];
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tl = sample(x - 1, y - 1);
      const t = sample(x, y - 1);
      const tr = sample(x + 1, y - 1);
      const l = sample(x - 1, y);
      const r = sample(x + 1, y);
      const bl = sample(x - 1, y + 1);
      const b = sample(x, y + 1);
      const br = sample(x + 1, y + 1);

      // Sobel gradients
      const dx = (tr + 2 * r + br) - (tl + 2 * l + bl);
      const dy = (bl + 2 * b + br) - (tl + 2 * t + tr);

      let nx = -dx * strength;
      let ny = -dy * strength;
      let nz = 1.0;

      const invLen = 1 / Math.hypot(nx, ny, nz);
      nx *= invLen;
      ny *= invLen;
      nz *= invLen;

      const idx = (y * width + x) * 4;
      rgba[idx] = Math.round((nx * 0.5 + 0.5) * 255);
      rgba[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      rgba[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      rgba[idx + 3] = 255;
    }
  }

  return rgba;
}

export interface MicroScratch {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  depth: number;
  widthPx: number;
}

export interface DeskWoodSurfaceBuffers {
  size: number;
  heights: Float32Array;
  roughness: Uint8ClampedArray;
  scratches: MicroScratch[];
}

/**
 * Generates coupled heightfield and roughness buffers for a lived-in oiled oak desk:
 * - Anisotropic wood grain pores
 * - Butcher-block plank seam grooves
 * - Multi-octave FBM surface micro-noise (breaks up uniform specular highlights)
 * - Subtle matte dust patches & hairline micro-scratches
 */
export function buildDeskWoodSurfaceBuffers(size = 512): DeskWoodSurfaceBuffers {
  const heights = new Float32Array(size * size);
  const roughness = new Uint8ClampedArray(size * size * 4);
  const rand = mulberry32(48271);

  for (let y = 0; y < size; y++) {
    const v = y / size;
    // Butcher-block plank seams at quarters (0, 0.25, 0.5, 0.75)
    const plankPos = (v * 4) % 1;
    const seamDist = Math.min(plankPos, 1 - plankPos);
    const seamGroove = seamDist < 0.012 ? (1 - seamDist / 0.012) * 0.24 : 0;

    for (let x = 0; x < size; x++) {
      const u = x / size;

      // Fine directional wood pores stretched along u
      const grainNoise = tileableValueNoise(u, v, 8, 96, 17);
      const fiberWave = Math.sin((v * 82 + grainNoise * 2.2) * Math.PI * 2) * 0.5 + 0.5;
      const poreIndent = fiberWave < 0.28 ? (0.28 - fiberWave) * 0.45 : 0;

      // High-frequency surface micro-noise + broader workshop dust mottling
      const microNoise = tileableFbm2D(u, v, 24, 3, 211);
      const dustPatch = tileableFbm2D(u, v, 6, 3, 509);

      const h = Math.max(
        0,
        Math.min(1, 0.62 - poreIndent - seamGroove + (microNoise - 0.5) * 0.22)
      );
      heights[y * size + x] = h;

      // Roughness calibrated in [0.42..0.84] (~[107..214]) so raking light breaks up naturally
      const roughNorm = Math.max(
        0.38,
        Math.min(
          0.9,
          0.48 + poreIndent * 0.42 + seamGroove * 0.6 + (dustPatch - 0.45) * 0.36 + (microNoise - 0.5) * 0.14
        )
      );
      const rByte = Math.round(roughNorm * 255);
      const idx = (y * size + x) * 4;
      roughness[idx] = rByte;
      roughness[idx + 1] = rByte;
      roughness[idx + 2] = rByte;
      roughness[idx + 3] = 255;
    }
  }

  // Generate deterministic hairline micro-scratches across the oak top
  const scratches: MicroScratch[] = [];
  for (let i = 0; i < 64; i++) {
    const x0 = rand() * size;
    const y0 = rand() * size;
    const angle = (rand() - 0.5) * 1.45; // mostly horizontal/diagonal tool & mug slides
    const len = 14 + rand() * 54;
    const x1 = x0 + Math.cos(angle) * len;
    const y1 = y0 + Math.sin(angle) * len;
    const depth = 0.16 + rand() * 0.16;
    const widthPx = 0.8 + rand() * 0.7;
    scratches.push({ x0, y0, x1, y1, depth, widthPx });

    const steps = Math.ceil(len * 1.5);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const px = Math.round(x0 + (x1 - x0) * t);
      const py = Math.round(y0 + (y1 - y0) * t);
      const wx = ((px % size) + size) % size;
      const wy = ((py % size) + size) % size;
      const idx = wy * size + wx;
      heights[idx] = Math.max(0, heights[idx] - depth);

      // Scratches scatter light slightly more than oiled oak
      const rIdx = idx * 4;
      const boosted = Math.min(238, roughness[rIdx] + 42);
      roughness[rIdx] = boosted;
      roughness[rIdx + 1] = boosted;
      roughness[rIdx + 2] = boosted;
    }
  }

  return { size, heights, roughness, scratches };
}
