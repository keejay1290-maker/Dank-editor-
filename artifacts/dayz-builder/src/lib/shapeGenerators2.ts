// shapeGenerators2.ts — Phase 2 shapes (30 total)
// Split from shapeGenerators.ts to avoid file-size limits

interface Point3D { x: number; y: number; z: number; }

export function getShapePoints2(shape: string, p: Record<string, number>): Point3D[] | null {
  switch (shape) {
    case 'mirror_portal':       return gen_mirror_portal(p);
    case 'wormhole_vortex':     return gen_wormhole_vortex(p);
    case 'obelisk_pad':         return gen_obelisk_pad(p);
    case 'neon_grid':           return gen_neon_grid(p);
    case 'summoning_pentagram': return gen_summoning_pentagram(p);
    case 'space_elevator':      return gen_space_elevator(p);
    case 'dyson_fragment':      return gen_dyson_fragment(p);
    case 'warp_core':           return gen_warp_core(p);
    case 'quantum_relay':       return gen_quantum_relay(p);
    case 'satellite_array':     return gen_satellite_array(p);
    case 'cryo_chamber':        return gen_cryo_chamber(p);
    case 'roman_aqueduct':      return gen_roman_aqueduct(p);
    case 'gothic_cathedral':    return gen_gothic_cathedral(p);
    case 'lighthouse_tower':    return gen_lighthouse_tower(p);
    case 'water_tower':         return gen_water_tower(p);
    case 'ziggurat':            return gen_ziggurat(p);
    case 'mushroom_ring':       return gen_mushroom_ring(p);
    case 'crystal_cave':        return gen_crystal_cave(p);
    case 'meteor_crater':       return gen_meteor_crater(p);
    case 'ancient_stump':       return gen_ancient_stump(p);
    case 'boxing_ring':         return gen_boxing_ring(p);
    case 'podium_stage':        return gen_podium_stage(p);
    case 'finish_arch':         return gen_finish_arch(p);
    case 'deathmatch_arena':    return gen_deathmatch_arena(p);
    case 'capture_tower':       return gen_capture_tower(p);
    case 'gallows':             return gen_gallows(p);
    case 'bone_throne':         return gen_bone_throne(p);
    case 'crypt_entrance':      return gen_crypt_entrance(p);
    case 'sacrificial_pit':     return gen_sacrificial_pit(p);
    case 'plague_shrine':       return gen_plague_shrine(p);
    default: return null;
  }
}

// ── Teleporter variants ───────────────────────────────────────────────────────

function gen_mirror_portal(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const r = (p.radius ?? 5) * s;
  const h = r * 1.6;
  [-1, 1].forEach(side => {
    const oz = side * r * 0.6;
    for (let i = 0; i <= 16; i++) {
      const a = Math.PI * i / 16;
      pts.push({ x: r * 0.7 * Math.cos(a), y: r * 0.7 * Math.sin(a), z: oz });
    }
    for (let j = 0; j <= 6; j++) {
      pts.push({ x: -r * 0.7, y: h * j / 6, z: oz });
      pts.push({ x:  r * 0.7, y: h * j / 6, z: oz });
    }
  });
  for (let i = 0; i <= 8; i++) {
    pts.push({ x: 0, y: h * 0.5 + h * 0.3 * i / 8, z: -r * 0.6 + r * 1.2 * i / 8 });
  }
  return pts;
}

function gen_wormhole_vortex(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const r = (p.radius ?? 5) * s;
  for (let ri = 0; ri < 10; ri++) {
    const t = ri / 9;
    const yr = r * 0.8 * t;
    const xzr = r * (1 - t * 0.7);
    const n = Math.max(8, Math.round(xzr * 2.5));
    const twist = t * Math.PI * 3;
    for (let j = 0; j < n; j++) {
      const a = 2 * Math.PI * j / n + twist;
      pts.push({ x: xzr * Math.cos(a), y: yr, z: xzr * Math.sin(a) });
    }
  }
  for (let d = 0; d < 8; d++) {
    const a = 2 * Math.PI * d / 8;
    pts.push({ x: r * 1.1 * Math.cos(a), y: 0, z: r * 1.1 * Math.sin(a) });
  }
  return pts;
}

function gen_obelisk_pad(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const r = (p.radius ?? 4) * s;
  const h = r * 3;
  [-1, 1].forEach(side => {
    const ox = side * r * 0.7;
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const w = s * (0.6 - t * 0.5);
      pts.push({ x: ox - w, y: h * t, z: -w });
      pts.push({ x: ox + w, y: h * t, z:  w });
    }
    pts.push({ x: ox, y: h + s * 0.4, z: 0 });
  });
  for (let j = 0; j < 16; j++) {
    const a = 2 * Math.PI * j / 16;
    pts.push({ x: r * Math.cos(a), y: 0.05, z: r * Math.sin(a) });
  }
  return pts;
}

function gen_neon_grid(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const r = (p.radius ?? 5) * s;
  const lines = Math.round(p.lines ?? 5);
  for (let i = -lines; i <= lines; i++) {
    const t = (i / lines) * r;
    for (let j = 0; j <= 10; j++) {
      const u = -r + 2 * r * j / 10;
      pts.push({ x: t, y: 0.05, z: u });
      pts.push({ x: u, y: 0.05, z: t });
    }
  }
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([sx,sz]) => {
    const px = sx * r, pz = sz * r;
    for (let i = 0; i <= 4; i++) pts.push({ x: px, y: s * 1.5 * i / 4, z: pz });
  });
  return pts;
}

function gen_summoning_pentagram(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const r = (p.radius ?? 5) * s;
  for (let i = 0; i < 5; i++) {
    const a1 = 2 * Math.PI * i / 5 - Math.PI / 2;
    const a2 = 2 * Math.PI * ((i + 2) % 5) / 5 - Math.PI / 2;
    const x1 = r * Math.cos(a1), z1 = r * Math.sin(a1);
    const x2 = r * Math.cos(a2), z2 = r * Math.sin(a2);
    for (let t = 0; t <= 8; t++) {
      pts.push({ x: x1 + (x2-x1)*t/8, y: 0.05, z: z1 + (z2-z1)*t/8 });
    }
    for (let j = 0; j <= 4; j++) pts.push({ x: r*1.05*Math.cos(a1), y: s*1.2*j/4, z: r*1.05*Math.sin(a1) });
  }
  for (let j = 0; j < 20; j++) {
    const a = 2*Math.PI*j/20;
    pts.push({ x: r*1.05*Math.cos(a), y: 0.05, z: r*1.05*Math.sin(a) });
  }
  return pts;
}

// ── Sci-Fi ────────────────────────────────────────────────────────────────────

function gen_space_elevator(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const h = (p.height ?? 20) * s;
  const r = (p.radius ?? 3) * s;
  const rings = Math.round(h / (s * 2));
  for (let i = 0; i <= rings; i++) {
    const y = h * i / rings;
    const rr = r * (1 - 0.3 * i / rings);
    const n = Math.max(6, Math.round(rr * 3));
    for (let j = 0; j < n; j++) {
      const a = 2 * Math.PI * j / n;
      pts.push({ x: rr * Math.cos(a), y, z: rr * Math.sin(a) });
    }
  }
  for (let i = 0; i <= 5; i++) {
    const y = h * i / 5;
    const rr = r * 2.5;
    for (let j = 0; j < 12; j++) {
      const a = 2 * Math.PI * j / 12;
      pts.push({ x: rr * Math.cos(a), y, z: rr * Math.sin(a) });
    }
  }
  for (let j = 0; j < 4; j++) {
    const a = Math.PI / 2 * j;
    for (let i = 0; i <= 6; i++) {
      pts.push({ x: r * 2.5 * Math.cos(a), y: h * i / 6, z: r * 2.5 * Math.sin(a) });
    }
  }
  return pts;
}

function gen_dyson_fragment(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const r = (p.radius ?? 8) * s;
  for (let lat = -4; lat <= 4; lat++) {
    const phi = (lat / 4) * Math.PI * 0.6;
    const yr = r * Math.sin(phi);
    const xzr = r * Math.cos(phi);
    const n = Math.max(6, Math.round(xzr * 1.5));
    for (let j = 0; j < n; j++) {
      const a = 2 * Math.PI * j / n;
      if (a < Math.PI * 1.4) pts.push({ x: xzr * Math.cos(a), y: yr, z: xzr * Math.sin(a) });
    }
  }
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI * 1.4 * i / 8;
    pts.push({ x: r * Math.cos(a), y: -r * 0.5, z: r * Math.sin(a) });
    pts.push({ x: r * Math.cos(a), y:  r * 0.5, z: r * Math.sin(a) });
  }
  return pts;
}

function gen_warp_core(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const len = (p.length ?? 12) * s;
  const r = (p.radius ?? 2) * s;
  [-1, 1].forEach(side => {
    const ox = side * (len * 0.3 + r);
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const y = len * t;
      const rr = r * (1 + 0.3 * Math.sin(t * Math.PI));
      for (let j = 0; j < 8; j++) {
        const a = 2 * Math.PI * j / 8;
        pts.push({ x: ox + rr * Math.cos(a), y, z: rr * Math.sin(a) });
      }
    }
  });
  for (let i = 0; i <= 6; i++) {
    const y = len * 0.3 + len * 0.4 * i / 6;
    pts.push({ x: -(len * 0.3 + r), y, z: 0 });
    pts.push({ x:  (len * 0.3 + r), y, z: 0 });
  }
  return pts;
}

function gen_quantum_relay(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const r = (p.radius ?? 6) * s;
  const cubes = Math.round(p.cubes ?? 6);
  for (let i = 0; i < cubes; i++) {
    const a = 2 * Math.PI * i / cubes;
    const cx = r * Math.cos(a), cz = r * Math.sin(a);
    const cy = s * 2 + s * 1.5 * Math.sin(a * 2);
    const hw = s * 0.7;
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dx,dz]) => {
      for (let j = 0; j <= 3; j++) pts.push({ x: cx + dx*hw, y: cy + s*1.4*j/3, z: cz + dz*hw });
    });
  }
  for (let j = 0; j < 16; j++) {
    const a = 2 * Math.PI * j / 16;
    pts.push({ x: r * Math.cos(a), y: s * 2, z: r * Math.sin(a) });
  }
  return pts;
}

function gen_satellite_array(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const r = (p.radius ?? 5) * s;
  for (let d = 0; d < 3; d++) {
    const a = (d / 3) * Math.PI * 2;
    const dx = r * Math.cos(a), dz = r * Math.sin(a);
    for (let i = 0; i <= 5; i++) pts.push({ x: dx, y: s * 3 * i / 5, z: dz });
    const dishR = s * 2;
    for (let j = 0; j < 12; j++) {
      const ja = 2 * Math.PI * j / 12;
      pts.push({ x: dx + dishR * Math.cos(ja), y: s * 3 + dishR * 0.3 * Math.sin(ja * 2), z: dz + dishR * Math.sin(ja) });
    }
    for (let j = 0; j < 6; j++) {
      const ja = 2 * Math.PI * j / 6;
      pts.push({ x: dx + dishR * 0.5 * Math.cos(ja), y: s * 3.1, z: dz + dishR * 0.5 * Math.sin(ja) });
    }
  }
  for (let i = 0; i <= 4; i++) {
    const t = i / 4;
    pts.push({ x: r * Math.cos(0) * t, y: s * 3, z: r * Math.sin(0) * t });
  }
  return pts;
}

function gen_cryo_chamber(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const pods = Math.round(p.pods ?? 4);
  const podH = s * 3;
  const podW = s * 0.8;
  for (let i = 0; i < pods; i++) {
    const ox = (i - (pods-1)/2) * s * 2;
    for (let j = 0; j <= 8; j++) {
      const t = j / 8;
      const y = podH * t;
      const rr = podW * (1 - 0.2 * Math.abs(t - 0.5) * 2);
      for (let k = 0; k < 8; k++) {
        const a = 2 * Math.PI * k / 8;
        pts.push({ x: ox + rr * Math.cos(a), y, z: rr * Math.sin(a) });
      }
    }
    pts.push({ x: ox, y: podH + s * 0.3, z: 0 });
    pts.push({ x: ox - podW, y: 0, z: 0 }, { x: ox + podW, y: 0, z: 0 });
  }
  for (let i = 0; i <= pods; i++) {
    const ox = (i - pods/2) * s * 2;
    for (let j = 0; j <= 3; j++) pts.push({ x: ox, y: podH * j / 3, z: podW * 1.2 });
  }
  return pts;
}

// ── Architecture ──────────────────────────────────────────────────────────────

function gen_roman_aqueduct(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const spans = Math.round(p.spans ?? 5);
  const archW = (p.archWidth ?? 4) * s;
  const archH = (p.archHeight ?? 6) * s;
  for (let i = 0; i < spans; i++) {
    const ox = i * archW;
    for (let j = 0; j <= 10; j++) {
      const a = Math.PI * j / 10;
      pts.push({ x: ox + archW * 0.5 * (1 - Math.cos(a)), y: archH * 0.5 * Math.sin(a), z: 0 });
      pts.push({ x: ox + archW * 0.5 * (1 - Math.cos(a)), y: archH * 0.5 * Math.sin(a), z: s });
    }
    for (let j = 0; j <= 4; j++) {
      pts.push({ x: ox, y: archH * j / 4, z: 0 });
      pts.push({ x: ox, y: archH * j / 4, z: s });
    }
  }
  for (let i = 0; i <= spans * 4; i++) {
    const x = i * archW / 4;
    pts.push({ x, y: archH, z: -s * 0.5 });
    pts.push({ x, y: archH, z:  s * 1.5 });
  }
  return pts;
}

function gen_gothic_cathedral(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const w = (p.width ?? 8) * s;
  const h = (p.height ?? 14) * s;
  [-1, 1].forEach(side => {
    const ox = side * w * 0.4;
    const spireH = h * 1.3;
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const rr = s * (1.2 - t * 0.9);
      pts.push({ x: ox, y: h + (spireH - h) * t, z: rr });
      pts.push({ x: ox, y: h + (spireH - h) * t, z: -rr });
      pts.push({ x: ox + rr, y: h + (spireH - h) * t, z: 0 });
      pts.push({ x: ox - rr, y: h + (spireH - h) * t, z: 0 });
    }
    for (let j = 0; j <= 6; j++) pts.push({ x: ox, y: h * j / 6, z: 0 });
  });
  for (let j = 0; j <= 10; j++) {
    const a = Math.PI * j / 10;
    pts.push({ x: w * 0.5 * (Math.cos(a) - 1), y: h * 0.6 + h * 0.3 * Math.sin(a), z: 0 });
  }
  for (let i = 0; i <= 8; i++) {
    const x = -w * 0.4 + w * 0.8 * i / 8;
    pts.push({ x, y: 0, z: -s * 2 }, { x, y: 0, z: s * 2 });
    pts.push({ x, y: h, z: -s * 2 }, { x, y: h, z: s * 2 });
  }
  return pts;
}

function gen_lighthouse_tower(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const h = (p.height ?? 12) * s;
  const segs = Math.round(h / (s * 0.8));
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const rr = s * (1.5 - t * 0.8);
    const n = Math.max(8, Math.round(rr * 4));
    for (let j = 0; j < n; j++) {
      const a = 2 * Math.PI * j / n;
      pts.push({ x: rr * Math.cos(a), y: h * t, z: rr * Math.sin(a) });
    }
  }
  for (let j = 0; j < 16; j++) {
    const a = 2 * Math.PI * j / 16;
    pts.push({ x: s * 0.9 * Math.cos(a), y: h + s * 0.3, z: s * 0.9 * Math.sin(a) });
    pts.push({ x: s * 1.3 * Math.cos(a), y: h + s * 0.1, z: s * 1.3 * Math.sin(a) });
  }
  for (let j = 0; j < 8; j++) {
    const a = 2 * Math.PI * j / 8;
    pts.push({ x: s * 0.5 * Math.cos(a), y: h + s * 0.8, z: s * 0.5 * Math.sin(a) });
  }
  return pts;
}

function gen_water_tower(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const legH = (p.legHeight ?? 6) * s;
  const tankR = (p.tankRadius ?? 3) * s;
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2;
    const lx = tankR * 0.7 * Math.cos(a), lz = tankR * 0.7 * Math.sin(a);
    for (let j = 0; j <= 6; j++) pts.push({ x: lx, y: legH * j / 6, z: lz });
    for (let j = 0; j <= 3; j++) {
      const y = legH * 0.3 * j / 3;
      pts.push({ x: lx, y, z: lz });
    }
  }
  for (let i = 0; i <= 2; i++) {
    const y = legH * 0.25 * i;
    for (let j = 0; j < 12; j++) {
      const a = 2 * Math.PI * j / 12;
      pts.push({ x: tankR * 0.7 * Math.cos(a), y, z: tankR * 0.7 * Math.sin(a) });
    }
  }
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    const rr = tankR * (1 - 0.15 * Math.abs(t - 0.5) * 2);
    const n = Math.round(rr * 3);
    for (let j = 0; j < n; j++) {
      const a = 2 * Math.PI * j / n;
      pts.push({ x: rr * Math.cos(a), y: legH + tankR * 1.2 * t, z: rr * Math.sin(a) });
    }
  }
  return pts;
}

function gen_ziggurat(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const tiers = Math.round(p.tiers ?? 4);
  const baseW = (p.baseWidth ?? 10) * s;
  for (let tier = 0; tier < tiers; tier++) {
    const t = tier / tiers;
    const w = baseW * (1 - t * 0.6);
    const y = baseW * 0.25 * tier;
    const h = baseW * 0.25;
    [0, h].forEach(dy => {
      for (let i = 0; i <= 6; i++) {
        const u = -w + 2 * w * i / 6;
        pts.push({ x: u, y: y + dy, z: -w }, { x: u, y: y + dy, z: w });
        pts.push({ x: -w, y: y + dy, z: u }, { x: w, y: y + dy, z: u });
      }
    });
    const rampZ = w + s * 0.2;
    for (let i = 0; i <= 4; i++) {
      pts.push({ x: -w * 0.3, y: y + h * i / 4, z: rampZ + s * 0.5 * i / 4 });
      pts.push({ x:  w * 0.3, y: y + h * i / 4, z: rampZ + s * 0.5 * i / 4 });
    }
  }
  return pts;
}

// ── Nature ────────────────────────────────────────────────────────────────────

function gen_mushroom_ring(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const r = (p.radius ?? 6) * s;
  const count = Math.round(p.count ?? 7);
  for (let i = 0; i < count; i++) {
    const a = 2 * Math.PI * i / count;
    const mx = r * Math.cos(a), mz = r * Math.sin(a);
    const mh = s * (1.5 + Math.sin(i * 1.7) * 0.5);
    const mr = s * (0.3 + Math.sin(i * 2.3) * 0.1);
    for (let j = 0; j <= 4; j++) pts.push({ x: mx, y: mh * j / 4, z: mz });
    for (let j = 0; j < 10; j++) {
      const ja = 2 * Math.PI * j / 10;
      const cr = mr * (1 + (1 - j / 10) * 1.5);
      pts.push({ x: mx + cr * Math.cos(ja), y: mh, z: mz + cr * Math.sin(ja) });
    }
  }
  return pts;
}

function gen_crystal_cave(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const r = (p.radius ?? 5) * s;
  const crystals = Math.round(p.crystals ?? 12);
  for (let i = 0; i < crystals; i++) {
    const a = 2 * Math.PI * i / crystals;
    const dist = r * (0.5 + Math.sin(i * 1.3) * 0.4);
    const cx = dist * Math.cos(a), cz = dist * Math.sin(a);
    const ch = s * (1 + Math.sin(i * 2.1) * 0.8);
    const cw = s * (0.2 + Math.sin(i * 1.7) * 0.1);
    for (let j = 0; j <= 5; j++) {
      const t = j / 5;
      const rr = cw * (1 - t * 0.8);
      pts.push({ x: cx + rr, y: ch * t, z: cz });
      pts.push({ x: cx - rr, y: ch * t, z: cz });
      pts.push({ x: cx, y: ch * t, z: cz + rr });
    }
    pts.push({ x: cx, y: ch, z: cz });
  }
  for (let j = 0; j < 16; j++) {
    const a = 2 * Math.PI * j / 16;
    pts.push({ x: r * 1.1 * Math.cos(a), y: 0, z: r * 1.1 * Math.sin(a) });
  }
  return pts;
}

function gen_meteor_crater(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const r = (p.radius ?? 7) * s;
  const depth = r * 0.3;
  for (let ring = 0; ring <= 4; ring++) {
    const t = ring / 4;
    const rr = r * t;
    const y = ring === 0 ? -depth : -depth * (1 - t) * (1 - t);
    const n = Math.max(8, Math.round(rr * 2));
    for (let j = 0; j < n; j++) {
      const a = 2 * Math.PI * j / n;
      pts.push({ x: rr * Math.cos(a), y, z: rr * Math.sin(a) });
    }
  }
  const rimN = Math.round(r * 2.5);
  for (let j = 0; j < rimN; j++) {
    const a = 2 * Math.PI * j / rimN;
    const jag = 1 + Math.sin(j * 1.7) * 0.15;
    pts.push({ x: r * jag * Math.cos(a), y: s * 0.4 * jag, z: r * jag * Math.sin(a) });
  }
  for (let d = 0; d < 8; d++) {
    const a = 2 * Math.PI * d / 8;
    const dist = r * (1.1 + Math.sin(d * 1.3) * 0.2);
    pts.push({ x: dist * Math.cos(a), y: 0, z: dist * Math.sin(a) });
  }
  return pts;
}

function gen_ancient_stump(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const r = (p.radius ?? 3) * s;
  const h = r * 1.2;
  const segs = Math.round(h / (s * 0.5));
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const rr = r * (1 + 0.1 * Math.sin(t * 5));
    const n = Math.round(rr * 3);
    for (let j = 0; j < n; j++) {
      const a = 2 * Math.PI * j / n;
      pts.push({ x: rr * Math.cos(a), y: h * t, z: rr * Math.sin(a) });
    }
  }
  for (let root = 0; root < 5; root++) {
    const a = 2 * Math.PI * root / 5;
    for (let i = 0; i <= 5; i++) {
      const t = i / 5;
      pts.push({ x: (r + t * r * 0.8) * Math.cos(a), y: -t * s * 0.3, z: (r + t * r * 0.8) * Math.sin(a) });
    }
  }
  for (let j = 0; j < 8; j++) {
    const a = 2 * Math.PI * j / 8;
    pts.push({ x: r * 0.7 * Math.cos(a), y: h + s * 0.1, z: r * 0.7 * Math.sin(a) });
  }
  return pts;
}

// ── Events ────────────────────────────────────────────────────────────────────

function gen_boxing_ring(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const hw = (p.halfWidth ?? 5) * s;
  const postH = s * 2.5;
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([sx,sz]) => {
    const px = sx * hw, pz = sz * hw;
    for (let i = 0; i <= 5; i++) pts.push({ x: px, y: postH * i / 5, z: pz });
  });
  [0.3, 0.6, 0.9].forEach(t => {
    const y = postH * t;
    for (let i = 0; i <= 6; i++) {
      const u = -hw + 2 * hw * i / 6;
      pts.push({ x: u, y, z: -hw }, { x: u, y, z: hw });
      pts.push({ x: -hw, y, z: u }, { x: hw, y, z: u });
    }
  });
  for (let i = 0; i <= 8; i++) {
    const u = -hw + 2 * hw * i / 8;
    pts.push({ x: u, y: s * 0.3, z: -hw }, { x: u, y: s * 0.3, z: hw });
    pts.push({ x: -hw, y: s * 0.3, z: u }, { x: hw, y: s * 0.3, z: u });
  }
  return pts;
}

function gen_podium_stage(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const w = (p.width ?? 8) * s;
  const d = (p.depth ?? 5) * s;
  const h = s * 1.2;
  for (let i = 0; i <= 6; i++) {
    const u = -w + 2 * w * i / 6;
    pts.push({ x: u, y: 0, z: -d }, { x: u, y: 0, z: d });
    pts.push({ x: u, y: h, z: -d }, { x: u, y: h, z: d });
  }
  for (let i = 0; i <= 4; i++) {
    const u = -d + 2 * d * i / 4;
    pts.push({ x: -w, y: 0, z: u }, { x: w, y: 0, z: u });
    pts.push({ x: -w, y: h, z: u }, { x: w, y: h, z: u });
  }
  for (let step = 0; step < 3; step++) {
    const sy = h * (1 - step / 3);
    const sz = d + step * s * 0.6;
    for (let i = 0; i <= 5; i++) {
      pts.push({ x: -w * 0.6 + w * 1.2 * i / 5, y: sy, z: sz });
    }
  }
  for (let i = 0; i <= 4; i++) pts.push({ x: 0, y: h + s * 1.5 * i / 4, z: 0 });
  pts.push({ x: -s * 0.4, y: h + s * 1.5, z: 0 }, { x: s * 0.4, y: h + s * 1.5, z: 0 });
  return pts;
}

function gen_finish_arch(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const w = (p.width ?? 8) * s;
  const h = (p.height ?? 5) * s;
  [-1, 1].forEach(side => {
    const ox = side * w;
    for (let i = 0; i <= 6; i++) pts.push({ x: ox, y: h * i / 6, z: 0 });
    for (let i = 0; i <= 3; i++) pts.push({ x: ox, y: h * i / 3, z: s * 0.5 });
  });
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * i / 10;
    pts.push({ x: w * Math.cos(a), y: h + h * 0.3 * Math.sin(a), z: 0 });
    pts.push({ x: w * Math.cos(a), y: h + h * 0.3 * Math.sin(a), z: s * 0.5 });
  }
  for (let i = 0; i <= 8; i++) {
    const x = -w + 2 * w * i / 8;
    pts.push({ x, y: h * 1.1, z: -s * 0.3 }, { x, y: h * 1.1, z: s * 0.8 });
  }
  return pts;
}

function gen_deathmatch_arena(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const r = (p.radius ?? 8) * s;
  const wallH = s * 2.5;
  const sides = 8;
  for (let i = 0; i < sides; i++) {
    const a1 = 2 * Math.PI * i / sides;
    const a2 = 2 * Math.PI * (i + 1) / sides;
    const x1 = r * Math.cos(a1), z1 = r * Math.sin(a1);
    const x2 = r * Math.cos(a2), z2 = r * Math.sin(a2);
    for (let t = 0; t <= 4; t++) {
      const f = t / 4;
      for (let wh = 0; wh <= 3; wh++) {
        pts.push({ x: x1+(x2-x1)*f, y: wallH*wh/3, z: z1+(z2-z1)*f });
      }
    }
  }
  for (let j = 0; j < 16; j++) {
    const a = 2 * Math.PI * j / 16;
    pts.push({ x: r * 0.5 * Math.cos(a), y: 0, z: r * 0.5 * Math.sin(a) });
  }
  for (let cover = 0; cover < 4; cover++) {
    const a = Math.PI / 4 + cover * Math.PI / 2;
    const cx = r * 0.6 * Math.cos(a), cz = r * 0.6 * Math.sin(a);
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dx,dz]) => {
      pts.push({ x: cx+dx*s*0.8, y: 0, z: cz+dz*s*0.8 });
      pts.push({ x: cx+dx*s*0.8, y: s*1.2, z: cz+dz*s*0.8 });
    });
  }
  return pts;
}

function gen_capture_tower(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const h = (p.height ?? 8) * s;
  const r = s * 1.5;
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const rr = r * (1 - t * 0.3);
    for (let j = 0; j < 8; j++) {
      const a = 2 * Math.PI * j / 8;
      pts.push({ x: rr * Math.cos(a), y: h * t, z: rr * Math.sin(a) });
    }
  }
  for (let i = 0; i <= 8; i++) pts.push({ x: 0, y: h + s * 2 * i / 8, z: 0 });
  for (let j = 0; j < 8; j++) {
    const a = 2 * Math.PI * j / 8;
    pts.push({ x: s * 0.3 * Math.cos(a), y: h + s * 2, z: s * 0.3 * Math.sin(a) });
  }
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 2 * i;
    for (let j = 0; j <= 4; j++) {
      pts.push({ x: r * 2 * Math.cos(a), y: s * 2 * j / 4, z: r * 2 * Math.sin(a) });
    }
  }
  return pts;
}

// ── Dark ──────────────────────────────────────────────────────────────────────

function gen_gallows(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const h = (p.height ?? 5) * s;
  for (let i = 0; i <= 8; i++) pts.push({ x: 0, y: h * i / 8, z: 0 });
  for (let i = 0; i <= 5; i++) pts.push({ x: s * 2 * i / 5, y: h, z: 0 });
  for (let i = 0; i <= 3; i++) pts.push({ x: s * 2, y: h - s * 0.5 * i / 3, z: 0 });
  for (let i = 0; i <= 4; i++) pts.push({ x: s * 2, y: h - s * 0.5 - s * 1.5 * i / 4, z: 0 });
  for (let i = 0; i <= 3; i++) {
    pts.push({ x: -s * 0.5, y: 0, z: -s * 0.5 + s * i / 3 });
    pts.push({ x:  s * 0.5, y: 0, z: -s * 0.5 + s * i / 3 });
  }
  pts.push({ x: s * 0.8, y: h * 0.6, z: 0 });
  return pts;
}

function gen_bone_throne(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const h = (p.height ?? 4) * s;
  for (let i = 0; i <= 6; i++) {
    pts.push({ x: -s, y: h * i / 6, z: 0 });
    pts.push({ x:  s, y: h * i / 6, z: 0 });
  }
  for (let i = 0; i <= 4; i++) {
    const u = -s + 2 * s * i / 4;
    pts.push({ x: u, y: s * 1.5, z: 0 });
    pts.push({ x: u, y: 0, z: 0 });
  }
  for (let spike = 0; spike < 5; spike++) {
    const sx = -s + 2 * s * spike / 4;
    for (let i = 0; i <= 3; i++) pts.push({ x: sx, y: h + s * 0.8 * i / 3, z: 0 });
    pts.push({ x: sx, y: h + s * 0.8, z: 0 });
  }
  for (let i = 0; i < 6; i++) {
    const a = 2 * Math.PI * i / 6;
    pts.push({ x: s * 0.3 * Math.cos(a), y: s * 1.5, z: s * 0.3 * Math.sin(a) });
  }
  return pts;
}

function gen_crypt_entrance(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const w = (p.width ?? 3) * s;
  const h = (p.height ?? 4) * s;
  [-1, 1].forEach(side => {
    const ox = side * w;
    for (let i = 0; i <= 6; i++) pts.push({ x: ox, y: h * i / 6, z: 0 });
    for (let i = 0; i <= 3; i++) pts.push({ x: ox, y: h * i / 3, z: s });
  });
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI * i / 8;
    pts.push({ x: w * Math.cos(a), y: h + w * Math.sin(a), z: 0 });
  }
  for (let step = 0; step < 3; step++) {
    const sy = -step * s * 0.3;
    const sz = step * s * 0.5;
    for (let i = 0; i <= 4; i++) {
      pts.push({ x: -w * 1.2 + 2 * w * 1.2 * i / 4, y: sy, z: sz });
    }
  }
  for (let i = 0; i <= 4; i++) {
    const u = -w + 2 * w * i / 4;
    pts.push({ x: u, y: h * 1.1, z: 0 }, { x: u, y: h * 1.1, z: s });
  }
  return pts;
}

function gen_sacrificial_pit(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const r = (p.radius ?? 5) * s;
  const depth = r * 0.4;
  for (let ring = 0; ring <= 3; ring++) {
    const t = ring / 3;
    const rr = r * t;
    const y = -depth * (1 - t);
    const n = Math.max(8, Math.round(rr * 2.5));
    for (let j = 0; j < n; j++) {
      const a = 2 * Math.PI * j / n;
      pts.push({ x: rr * Math.cos(a), y, z: rr * Math.sin(a) });
    }
  }
  for (let i = 0; i <= 4; i++) pts.push({ x: 0, y: -depth + s * 1.5 * i / 4, z: 0 });
  for (let j = 0; j < 6; j++) {
    const a = 2 * Math.PI * j / 6;
    pts.push({ x: s * 0.5 * Math.cos(a), y: s * 1.5, z: s * 0.5 * Math.sin(a) });
  }
  for (let stone = 0; stone < 6; stone++) {
    const a = 2 * Math.PI * stone / 6;
    const sx = r * 1.05 * Math.cos(a), sz = r * 1.05 * Math.sin(a);
    for (let i = 0; i <= 3; i++) pts.push({ x: sx, y: s * 1.2 * i / 3, z: sz });
  }
  return pts;
}

function gen_plague_shrine(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const h = (p.height ?? 6) * s;
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const rr = s * (0.8 - t * 0.5);
    for (let j = 0; j < 6; j++) {
      const a = 2 * Math.PI * j / 6;
      pts.push({ x: rr * Math.cos(a), y: h * t, z: rr * Math.sin(a) });
    }
  }
  const beakLen = s * 1.5;
  for (let i = 0; i <= 4; i++) pts.push({ x: 0, y: h + beakLen * i / 4, z: s * 0.3 * (1 - i / 4) });
  for (let j = 0; j < 8; j++) {
    const a = 2 * Math.PI * j / 8;
    pts.push({ x: s * 0.6 * Math.cos(a), y: h * 0.7, z: s * 0.6 * Math.sin(a) });
  }
  for (let i = 0; i < 3; i++) {
    const a = 2 * Math.PI * i / 3;
    for (let j = 0; j <= 3; j++) {
      pts.push({ x: s * 1.5 * Math.cos(a), y: s * 2 * j / 3, z: s * 1.5 * Math.sin(a) });
    }
  }
  return pts;
}
