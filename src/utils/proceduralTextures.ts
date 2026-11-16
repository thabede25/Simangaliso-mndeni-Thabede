import * as THREE from 'three';

function createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(128, 128);
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
  grad.addColorStop(0, 'rgba(24, 18, 12, 0.55)');
  grad.addColorStop(0.55, 'rgba(24, 18, 12, 0.22)');
  grad.addColorStop(1, 'rgba(24, 18, 12, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createWoodTextures(maxAnisotropy = 4): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const [canvas, ctx] = createCanvas(1024, 1024);
  ctx.fillStyle = '#c8a783';
  ctx.fillRect(0, 0, 1024, 1024);

  // Rich natural birch/oak wood grain fibers & subtle cathedral rings
  for (let i = 0; i < 1100; i++) {
    const y = (i * 1024) / 1100;
    const tone = 165 + Math.sin(i * 0.075) * 18 + Math.cos(i * 0.27) * 9;
    ctx.strokeStyle = `rgba(${Math.round(tone)}, ${Math.round(tone * 0.78)}, ${Math.round(tone * 0.56)}, 0.3)`;
    ctx.lineWidth = i % 19 === 0 ? 2.1 : 1.25;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 24) {
      const wave = Math.sin(x * 0.007 + i * 0.075) * 5.2 + Math.cos(x * 0.022) * 1.6;
      ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }

  // Realistic butcher-block plank seams with subtle tone shifts
  ctx.strokeStyle = 'rgba(48, 28, 14, 0.28)';
  ctx.lineWidth = 2.6;
  [256, 512, 768].forEach((py, idx) => {
    ctx.fillStyle = idx % 2 === 0 ? 'rgba(255,245,230,0.03)' : 'rgba(40,22,8,0.035)';
    ctx.fillRect(0, py - 256, 1024, 256);
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(1024, py);
    ctx.stroke();
  });

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 1.2);
  map.anisotropy = maxAnisotropy;

  const [bCanvas, bCtx] = createCanvas(512, 512);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 420; i++) {
    const y = (i * 512) / 420;
    const val = 114 + Math.round(Math.sin(i * 0.23) * 28);
    bCtx.strokeStyle = `rgb(${val},${val},${val})`;
    bCtx.lineWidth = 1.2;
    bCtx.beginPath();
    bCtx.moveTo(0, y);
    bCtx.lineTo(512, y + Math.sin(i) * 2);
    bCtx.stroke();
  }
  const bumpMap = new THREE.CanvasTexture(bCanvas);
  bumpMap.colorSpace = THREE.NoColorSpace;
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 1.2);

  // Satin oiled-oak roughness variation (pores slightly rougher, smooth grain slightly glossier)
  const [rCanvas, rCtx] = createCanvas(512, 512);
  rCtx.fillStyle = '#929292';
  rCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 360; i++) {
    const y = (i * 512) / 360;
    const val = 126 + Math.round(Math.sin(i * 0.19) * 24);
    rCtx.strokeStyle = `rgb(${val},${val},${val})`;
    rCtx.lineWidth = 1.5;
    rCtx.beginPath();
    rCtx.moveTo(0, y);
    rCtx.lineTo(512, y + Math.cos(i) * 2);
    rCtx.stroke();
  }
  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.colorSpace = THREE.NoColorSpace;
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 1.2);

  return { map, bumpMap, roughnessMap };
}

export function createDeskMatTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(512, 512);
  ctx.fillStyle = '#222428';
  ctx.fillRect(0, 0, 512, 512);

  for (let y = 0; y < 512; y += 4) {
    for (let x = 0; x < 512; x += 4) {
      const n = ((x * 17 + y * 31) % 17) - 8;
      const v = 34 + n;
      ctx.fillStyle = `rgb(${v}, ${v + 2}, ${v + 5})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  // Subtle perimeter stitch line
  ctx.strokeStyle = 'rgba(180, 145, 95, 0.28)';
  ctx.setLineDash([6, 5]);
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 492, 492);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createWalnutTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(256, 256);
  ctx.fillStyle = '#5c3c24';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 180; i++) {
    const y = (i * 256) / 180;
    const tone = 68 + Math.sin(i * 0.16) * 18;
    ctx.strokeStyle = `rgba(${Math.round(tone)}, ${Math.round(tone * 0.62)}, ${Math.round(tone * 0.38)}, 0.45)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y + Math.sin(i * 0.3) * 3);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createVinylRecordTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(512, 512);
  ctx.fillStyle = '#0c0c0e';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle anisotropic sheen wedge
  const grad = ctx.createConicGradient(0.4, 256, 256);
  grad.addColorStop(0, 'rgba(255,255,255,0.02)');
  grad.addColorStop(0.12, 'rgba(255,255,255,0.14)');
  grad.addColorStop(0.24, 'rgba(255,255,255,0.02)');
  grad.addColorStop(0.62, 'rgba(255,255,255,0.12)');
  grad.addColorStop(0.74, 'rgba(255,255,255,0.02)');
  grad.addColorStop(1, 'rgba(255,255,255,0.02)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(256, 256, 252, 0, Math.PI * 2);
  ctx.fill();

  // Concentric LP micro-grooves
  for (let r = 98; r < 248; r += 3.5) {
    ctx.strokeStyle = r % 28 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.045)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Center record label
  ctx.fillStyle = '#c2410c';
  ctx.beginPath();
  ctx.arc(256, 256, 86, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(256, 256, 78, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#fef3c7';
  ctx.font = '700 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MNDENI', 256, 224);
  ctx.font = '600 13px monospace';
  ctx.fillText('33⅓ RPM · JHB', 256, 294);
  ctx.textAlign = 'left';

  // Spindle hole
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.arc(256, 256, 12, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createStickyNoteTexture(
  bg: string,
  title: string,
  lines: string[],
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(256, 256);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  ctx.fillRect(0, 0, 256, 28);
  ctx.fillStyle = '#1f2937';
  ctx.font = '700 24px cursive, sans-serif';
  ctx.fillText(title, 20, 62);
  ctx.font = '18px cursive, sans-serif';
  lines.forEach((line, idx) => {
    ctx.fillText(line, 20, 102 + idx * 30);
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createTireTreadTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(256, 128);
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = '#09090b';
  for (let x = 0; x < 256; x += 24) {
    ctx.fillRect(x, 0, 10, 56);
    ctx.fillRect(x + 12, 72, 10, 56);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createBreadboardTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(512, 320);
  ctx.fillStyle = '#f5f4ef';
  ctx.fillRect(0, 0, 512, 320);

  // Red & Blue power rail stripes
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(16, 18, 480, 4);
  ctx.fillRect(16, 298, 480, 4);
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(16, 58, 480, 4);
  ctx.fillRect(16, 258, 480, 4);

  // Center DIP channel groove
  ctx.fillStyle = '#e4e2dc';
  ctx.fillRect(16, 148, 480, 24);

  // Tie-point socket holes
  ctx.fillStyle = '#27272a';
  for (let col = 26; col <= 486; col += 15) {
    // Top & bottom rails
    [32, 46, 272, 286].forEach((row) => {
      ctx.fillRect(col - 2, row - 2, 4, 4);
    });
    // Main terminal strips a-e and f-j
    for (let r = 0; r < 5; r++) {
      ctx.fillRect(col - 2, 80 + r * 14, 4, 4);
      ctx.fillRect(col - 2, 184 + r * 14, 4, 4);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createCadSheetTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(1024, 720);
  // Crisp cool-toned architectural drafting vellum for high contrast on warm oak
  ctx.fillStyle = '#edf2f7';
  ctx.fillRect(0, 0, 1024, 720);

  // Subtle background millimeter engineering grid
  ctx.strokeStyle = 'rgba(30, 64, 175, 0.11)';
  ctx.lineWidth = 1.2;
  for (let x = 24; x < 1000; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 24);
    ctx.lineTo(x, 696);
    ctx.stroke();
  }
  for (let y = 24; y < 696; y += 24) {
    ctx.beginPath();
    ctx.moveTo(24, y);
    ctx.lineTo(1000, y);
    ctx.stroke();
  }

  // Outer ISO drawing border & zone ticks
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, 976, 672);
  ctx.lineWidth = 1.6;
  ctx.strokeRect(32, 32, 960, 656);

  // LEFT VIEW: Open-Pit Haulage Bench & Ramp Cross-Section (Surpac / Whittle CAD)
  ctx.fillStyle = '#1e3a8a';
  ctx.font = '700 17px monospace';
  ctx.fillText('SECTION A-A: OPEN-PIT BENCH GEOMETRY & OREBODY ENVELOPE', 52, 64);

  // Pit benches stepped profile
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(64, 150);
  ctx.lineTo(140, 150);
  ctx.lineTo(165, 200);
  ctx.lineTo(220, 200);
  ctx.lineTo(245, 250);
  ctx.lineTo(300, 250);
  ctx.lineTo(325, 300);
  ctx.lineTo(410, 300);
  ctx.lineTo(435, 250);
  ctx.lineTo(490, 250);
  ctx.lineTo(515, 200);
  ctx.lineTo(570, 200);
  ctx.lineTo(595, 150);
  ctx.lineTo(660, 150);
  ctx.stroke();

  // Orebody hatched zone inside pit floor
  ctx.fillStyle = 'rgba(217, 119, 6, 0.18)';
  ctx.beginPath();
  ctx.moveTo(285, 230);
  ctx.lineTo(430, 220);
  ctx.lineTo(465, 345);
  ctx.lineTo(315, 360);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Hatch lines in orebody
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.55)';
  ctx.lineWidth = 1;
  for (let h = -40; h < 160; h += 12) {
    ctx.beginPath();
    ctx.moveTo(310 + h, 235);
    ctx.lineTo(295 + h, 345);
    ctx.stroke();
  }

  // Centerlines & Dimension callouts
  ctx.strokeStyle = '#dc2626';
  ctx.setLineDash([12, 4, 3, 4]);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(368, 110);
  ctx.lineTo(368, 380);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(140, 130);
  ctx.lineTo(595, 130);
  ctx.stroke();
  ctx.fillStyle = '#1e3a8a';
  ctx.font = '600 13px monospace';
  ctx.fillText('PIT CREST SPAN: 285.0 m  |  OVERALL SLOPE: 45.0°', 175, 122);
  ctx.fillText('BENCH H = 10.0m', 64, 185);
  ctx.fillStyle = '#b45309';
  ctx.fillText('Li2O ORE ZONE (1.34% AVG)', 290, 385);

  // RIGHT VIEW: Dense Medium Cyclone (Solid Edge Orthographic CAD)
  ctx.fillStyle = '#1e3a8a';
  ctx.font = '700 16px monospace';
  ctx.fillText('DETAIL B: DMC CYCLONE ASSEMBLY', 680, 64);

  // Cyclone body outline
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(760, 120);
  ctx.lineTo(880, 120);
  ctx.lineTo(880, 200);
  ctx.lineTo(835, 340);
  ctx.lineTo(805, 340);
  ctx.lineTo(760, 200);
  ctx.closePath();
  ctx.stroke();
  // Vortex finder pipe
  ctx.strokeRect(805, 92, 30, 62);
  // Feed inlet
  ctx.strokeRect(712, 132, 48, 28);
  // Axis line
  ctx.strokeStyle = '#dc2626';
  ctx.setLineDash([10, 4, 2, 4]);
  ctx.beginPath();
  ctx.moveTo(820, 78);
  ctx.lineTo(820, 368);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#1e3a8a';
  ctx.font = '12px monospace';
  ctx.fillText('Ø 650mm FEED', 685, 180);
  ctx.fillText('APEX SPIGOT', 845, 336);
  ctx.fillText('RD 1.55 MED', 892, 175);

  // BOTTOM LEFT: Plan View Haul Road Contour & Drillhole Collar Grid
  ctx.fillStyle = '#1e3a8a';
  ctx.font = '700 15px monospace';
  ctx.fillText('PLAN VIEW: COLLAR GRID & HAUL RAMP (10% GRADIENT)', 52, 442);
  ctx.strokeStyle = '#1e40af';
  ctx.lineWidth = 1.6;
  for (let r = 0; r < 4; r++) {
    ctx.beginPath();
    ctx.ellipse(270, 560, 180 - r * 36, 92 - r * 18, -0.1, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Drillhole collar crosses
  ctx.strokeStyle = '#dc2626';
  [
    [180, 530],
    [245, 515],
    [310, 535],
    [220, 595],
    [295, 590],
    [355, 560],
  ].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy);
    ctx.lineTo(cx + 5, cy);
    ctx.moveTo(cx, cy - 5);
    ctx.lineTo(cx, cy + 5);
    ctx.stroke();
  });

  // ISO TITLE BLOCK (Bottom-Right)
  ctx.fillStyle = '#f1ede2';
  ctx.fillRect(548, 532, 444, 156);
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 2.2;
  ctx.strokeRect(548, 532, 444, 156);
  ctx.beginPath();
  ctx.moveTo(548, 578);
  ctx.lineTo(992, 578);
  ctx.moveTo(548, 634);
  ctx.lineTo(992, 634);
  ctx.moveTo(775, 578);
  ctx.lineTo(775, 688);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 17px monospace';
  ctx.fillText('WITS MINING ENG · CAD DRAWING', 564, 562);
  ctx.font = '600 13px monospace';
  ctx.fillText('PROJECT: LITHIUM PIT & DMC', 564, 602);
  ctx.fillText('SOFTWARE: SOLID EDGE / SURPAC', 564, 622);
  ctx.fillText('ENG: S. M. THABEDE', 564, 660);
  ctx.fillText('JOBURG, RSA', 564, 678);
  ctx.fillText('SCALE: 1:250', 790, 602);
  ctx.fillText('UNITS: METERS', 790, 622);
  ctx.fillText('DWG: MNE-304-01', 790, 660);
  ctx.fillText('REV: C (APPROVED)', 790, 678);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createLaptopScreenTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(960, 600);
  ctx.fillStyle = '#0f131a';
  ctx.fillRect(0, 0, 960, 600);

  // Top bar
  ctx.fillStyle = '#181e29';
  ctx.fillRect(0, 0, 960, 44);
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(24, 22, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(44, 22, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(64, 22, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 16px monospace';
  ctx.fillText('GEOVIA SURPAC // LITHIUM_PEGMATITE_BLK.MDL', 94, 27);

  // Sidebar
  ctx.fillStyle = '#141923';
  ctx.fillRect(0, 44, 240, 556);
  ctx.font = '14px monospace';
  const items = [
    '01 Lithium Block Model',
    '02 Cooling Rig (UNO)',
    '03 Sasolburg Coal',
    '04 Maqueen V2 Rover',
    '05 Python Geostats',
    '06 Underground Ops',
  ];
  items.forEach((label, idx) => {
    if (idx === 0) {
      ctx.fillStyle = 'rgba(217, 119, 6, 0.24)';
      ctx.fillRect(12, 66 + idx * 46, 216, 36);
      ctx.fillStyle = '#fbbf24';
    } else {
      ctx.fillStyle = '#94a3b8';
    }
    ctx.fillText(label, 22, 89 + idx * 46);
  });

  // Isometric 3D Orebody Block Model + Pit Wireframe Lines
  const gx = 320;
  const gy = 86;
  const colors = ['#1e3a8a', '#0284c7', '#10b981', '#f59e0b', '#dc2626'];
  for (let row = 0; row < 11; row++) {
    for (let col = 0; col < 19; col++) {
      const dist = Math.hypot(col - 9, row - 5);
      if (dist < 7.8) {
        const gradeIdx = Math.min(4, Math.max(0, Math.floor((7.8 - dist) * 0.72)));
        ctx.fillStyle = colors[gradeIdx];
        ctx.fillRect(gx + col * 29, gy + row * 24, 26, 21);
      }
    }
  }
  // CAD Pit Shell Contour Overlay
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.72)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(595, 215, 255, 130, -0.08, 0, Math.PI * 2);
  ctx.stroke();

  // Bottom Terminal
  ctx.fillStyle = '#090c11';
  ctx.fillRect(240, 415, 720, 185);
  ctx.fillStyle = '#34d399';
  ctx.font = '15px monospace';
  ctx.fillText('$ python3 grade_tonnage.py --blocks li_kriged.csv --cutoff 0.65', 268, 455);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('Resource: 14.8 Mt @ 1.34% Li2O  |  Whittle Pit Shell #12', 268, 492);
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('Click Laptop to inspect all 6 engineering projects ->', 268, 535);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createTabletScreenTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(640, 440);
  // Scenic illustrated Highveld landscape wallpaper matching Tablet Home view
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#2563eb');
  sky.addColorStop(1, '#7dd3fc');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 640, 260);

  // Fluffy clouds
  ctx.fillStyle = '#ffffff';
  [
    [130, 120, 62],
    [190, 110, 74],
    [430, 95, 70],
    [495, 118, 56],
  ].forEach(([cx, cy, r]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Rolling green hills
  ctx.fillStyle = '#3f7d20';
  ctx.beginPath();
  ctx.moveTo(0, 270);
  ctx.lineTo(180, 175);
  ctx.lineTo(350, 240);
  ctx.lineTo(520, 165);
  ctx.lineTo(640, 235);
  ctx.lineTo(640, 440);
  ctx.lineTo(0, 440);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#84cc16';
  ctx.beginPath();
  ctx.moveTo(0, 290);
  ctx.quadraticCurveTo(320, 240, 640, 300);
  ctx.lineTo(640, 440);
  ctx.lineTo(0, 440);
  ctx.closePath();
  ctx.fill();

  // Winding golden path
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.moveTo(295, 275);
  ctx.lineTo(335, 275);
  ctx.lineTo(395, 440);
  ctx.lineTo(245, 440);
  ctx.closePath();
  ctx.fill();

  // Clock text
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 68px sans-serif';
  ctx.fillText('18:50', 34, 126);

  // Frosted "On my desk" widget & bottom dock
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(424, 34, 184, 185);
  ctx.fillStyle = '#18181b';
  ctx.font = '700 14px sans-serif';
  ctx.fillText('On my desk', 440, 60);
  ctx.font = '13px monospace';
  ctx.fillText('• Cooling Rig: 26°C', 440, 94);
  ctx.fillText('• 6 Projects Ready', 440, 124);
  ctx.fillText('• Vinyl LP Loaded', 440, 154);

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(190, 366, 260, 52);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createPhoneScreenTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(320, 640);
  ctx.fillStyle = '#faf8f4';
  ctx.fillRect(0, 0, 320, 640);

  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, 320, 96);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 20px sans-serif';
  ctx.fillText('Simangaliso AI', 26, 56);
  ctx.fillStyle = '#f59e0b';
  ctx.font = '14px monospace';
  ctx.fillText('Gemini Assistant', 26, 80);

  ctx.fillStyle = '#e7e5e4';
  ctx.fillRect(20, 124, 240, 92);
  ctx.fillStyle = '#18181b';
  ctx.font = '16px sans-serif';
  ctx.fillText('Ask about Wits Mining', 34, 158);
  ctx.fillText('projects & Python!', 34, 184);

  ctx.fillStyle = '#b45309';
  ctx.fillRect(68, 240, 232, 74);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Tell me about your', 84, 270);
  ctx.fillText('Sibanye vac work', 84, 294);

  ctx.fillStyle = '#e7e5e4';
  ctx.fillRect(20, 340, 248, 108);
  ctx.fillStyle = '#18181b';
  ctx.fillText('MQA Competence B &', 34, 376);
  ctx.fillText('underground stoping', 34, 404);
  ctx.fillText('operations...', 34, 432);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createDiaryCoverTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(400, 550);
  ctx.fillStyle = '#9c4221';
  ctx.fillRect(0, 0, 400, 550);

  // Buckram weave grain
  for (let i = 0; i < 1200; i++) {
    const x = (i * 73) % 400;
    const y = (i * 137) % 550;
    ctx.fillStyle = 'rgba(255, 240, 220, 0.05)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Spine hinge line
  ctx.fillStyle = 'rgba(25, 12, 5, 0.32)';
  ctx.fillRect(26, 0, 6, 550);

  // Cream label plate
  ctx.fillStyle = '#f8f4ec';
  ctx.fillRect(78, 132, 246, 136);
  ctx.strokeStyle = '#5c2814';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(86, 140, 230, 120);

  ctx.fillStyle = '#1c1917';
  ctx.font = '700 25px sans-serif';
  ctx.fillText('FIELD DIARY', 120, 192);
  ctx.fillStyle = '#78716c';
  ctx.font = '15px monospace';
  ctx.fillText('SIGN & LEAVE A NOTE', 108, 228);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}
