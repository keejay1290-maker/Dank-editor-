export interface Point3D { x: number; y: number; z: number; }

function rotYapply(x: number, z: number, deg: number): [number, number] {
  const r = deg * Math.PI / 180;
  return [x * Math.cos(r) - z * Math.sin(r), x * Math.sin(r) + z * Math.cos(r)];
}

export function getShapePoints(shapeType: string, params: Record<string, number>): Point3D[] {
  const p = params;
  switch (shapeType) {
    case 'sphere': return gen_sphere(p, false);
    case 'hemisphere': return gen_sphere(p, true);
    case 'deathstar': return gen_deathstar(p);
    case 'torus': return gen_torus(p);
    case 'disc': return gen_disc(p);
    case 'helix': return gen_helix(p);
    case 'cone': return gen_cone(p);
    case 'cylinder': return gen_cylinder(p);
    case 'hyperboloid': return gen_hyperboloid(p);
    case 'mobius': return gen_mobius(p);
    case 'icosphere': return gen_icosphere(p);
    case 'body_skull': return gen_body_skull(p);
    case 'body_hand': return gen_body_hand(p);
    case 'body_ribcage': return gen_body_ribcage(p);
    case 'body_spine': return gen_body_spine(p);
    case 'body_eye': return gen_body_eye(p);
    case 'body_humanoid': return gen_body_humanoid(p);
    case 'body_arm': return gen_body_arm(p);
    case 'body_leg': return gen_body_leg(p);
    case 'body_ball_joint': return gen_body_ball_joint(p);
    case 'bastion_round': return gen_bastion_round(p);
    case 'bastion_square': return gen_bastion_square(p);
    case 'tower': return gen_tower(p);
    case 'wall_line': return gen_wall_line(p);
    case 'wall_arc': return gen_wall_arc(p);
    case 'star_fort': return gen_star_fort(p);
    case 'grid_flat': return gen_grid_flat(p);
    case 'staircase': return gen_staircase(p);
    case 'pyramid': return gen_pyramid(p);
    case 'ring_platform': return gen_ring_platform(p);
    case 'cross': return gen_cross(p);
    case 'arrow': return gen_arrow(p);
    case 'letter_D': return gen_letter_D(p);
    case 'letter_Z': return gen_letter_Z(p);
    case 'mech_bipedal': return gen_mech_bipedal(p);
    case 'mech_minigun': return gen_mech_minigun(p);
    case 'mech_walker': return gen_mech_walker(p);
    case 'millennium_falcon': return gen_millennium_falcon(p);
    case 'skyscraper': return gen_skyscraper(p);
    case 'prison_tower': return gen_prison_tower(p);
    case 'sci_fi_gate': return gen_sci_fi_gate(p);
    case 'cannon_turret': return gen_cannon_turret(p);
    case 'tunnel_circle': return gen_tunnel_circle(p);
    case 'tunnel_square': return gen_tunnel_square(p);
    case 'tunnel_hex': return gen_tunnel_hex(p);
    case 'dna_double': return gen_dna_double(p);
    case 'reactor_core': return gen_reactor_core(p);
    case 'orbital_station': return gen_orbital_station(p);
    case 'azkaban_tower': return gen_azkaban_tower(p);
    case 'pyramid_stepped': return gen_pyramid_stepped(p);
    case 'crashed_ufo': return gen_crashed_ufo(p);
    case 'volcano': return gen_volcano(p);
    case 'colosseum': return gen_colosseum(p);
    case 'stonehenge': return gen_stonehenge(p);
    case 'mushroom_cloud': return gen_mushroom_cloud(p);
    case 'black_hole': return gen_black_hole(p);
    case 'alien_mothership': return gen_alien_mothership(p);
    case 'celtic_ring': return gen_celtic_ring(p);
    default: return [];
  }
}

function gen_sphere(p: Record<string, number>, hemi: boolean): Point3D[] {
  const pts: Point3D[] = [];
  const latMax = hemi ? 0 : -Math.PI / 2;
  for (let i = 0; i <= p.latSegs; i++) {
    const lat = Math.PI / 2 + (latMax - Math.PI / 2) * i / p.latSegs;
    const y = p.radius * Math.sin(lat), r = p.radius * Math.cos(lat);
    for (let j = 0; j < p.lonSegs; j++) {
      const a = 2 * Math.PI * j / p.lonSegs;
      pts.push({ x: r * Math.cos(a), y, z: r * Math.sin(a) });
    }
  }
  return pts;
}

function gen_deathstar(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const dishLatRad = p.dishLat * Math.PI / 180;
  const dX = Math.cos(dishLatRad), dY = Math.sin(dishLatRad);
  for (let i = 0; i <= p.latSegs; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / p.latSegs;
    const y = p.radius * Math.sin(lat), r = p.radius * Math.cos(lat);
    for (let j = 0; j < p.lonSegs; j++) {
      const a = 2 * Math.PI * j / p.lonSegs;
      const px = r * Math.cos(a), pz = r * Math.sin(a);
      const dot = px / p.radius * dX + y / p.radius * dY;
      const ang = Math.acos(Math.min(1, Math.max(-1, dot)));
      const dr = Math.asin(Math.min(1, p.dishRadius / p.radius));
      if (ang < dr) continue;
      pts.push({ x: px, y, z: pz });
    }
  }
  const bc = { x: p.radius * dX, y: p.radius * dY };
  for (let ri = 1; ri <= 4; ri++) {
    const dr = p.dishRadius * ri / 4;
    const dep = p.dishDepth * (1 - (dr / p.dishRadius) ** 2);
    for (let j = 0; j < 24; j++) {
      const a = 2 * Math.PI * j / 24;
      pts.push({ x: bc.x - dep * dX + dr * Math.cos(a) * 0.7, y: bc.y - dep * dY, z: dr * Math.sin(a) });
    }
  }
  return pts;
}

function gen_torus(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  for (let i = 0; i < p.majorSegs; i++) {
    const u = 2 * Math.PI * i / p.majorSegs;
    for (let j = 0; j < p.minorSegs; j++) {
      const v = 2 * Math.PI * j / p.minorSegs;
      pts.push({ x: (p.majorR + p.minorR * Math.cos(v)) * Math.cos(u), y: p.minorR * Math.sin(v), z: (p.majorR + p.minorR * Math.cos(v)) * Math.sin(u) });
    }
  }
  return pts;
}

function gen_disc(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const inner = p.innerRadius || 0;
  for (let ri = 0; ri < p.rings; ri++) {
    const r = inner + (p.radius - inner) * (ri + 1) / p.rings;
    for (let j = 0; j < p.points; j++) {
      const a = 2 * Math.PI * j / p.points;
      pts.push({ x: r * Math.cos(a), y: 0, z: r * Math.sin(a) });
    }
  }
  return pts;
}

function gen_helix(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const total = p.turns * p.pointsPerTurn;
  for (let s = 0; s < p.strands; s++) {
    const ph = 2 * Math.PI * s / p.strands;
    for (let i = 0; i <= total; i++) {
      const t = i / total, a = 2 * Math.PI * p.turns * t + ph;
      pts.push({ x: p.radius * Math.cos(a), y: p.height * t, z: p.radius * Math.sin(a) });
    }
  }
  return pts;
}

function gen_cone(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  for (let ri = 0; ri <= p.rings; ri++) {
    const t = ri / p.rings, r = p.radius * (1 - t), y = p.height * t;
    if (r < 0.5) { pts.push({ x: 0, y, z: 0 }); continue; }
    for (let j = 0; j < p.points; j++) {
      const a = 2 * Math.PI * j / p.points;
      pts.push({ x: r * Math.cos(a), y, z: r * Math.sin(a) });
    }
  }
  return pts;
}

function gen_cylinder(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  for (let ri = 0; ri <= p.rings; ri++) {
    const y = p.height * ri / p.rings;
    for (let j = 0; j < p.points; j++) {
      const a = 2 * Math.PI * j / p.points;
      pts.push({ x: p.radius * Math.cos(a), y, z: p.radius * Math.sin(a) });
    }
  }
  if (p.caps) {
    for (let j = 0; j < p.points; j++) {
      const a = 2 * Math.PI * j / p.points;
      pts.push({ x: p.radius * Math.cos(a) / 2, y: 0, z: p.radius * Math.sin(a) / 2 });
      pts.push({ x: p.radius * Math.cos(a) / 2, y: p.height, z: p.radius * Math.sin(a) / 2 });
    }
  }
  return pts;
}

function gen_hyperboloid(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  for (let ri = 0; ri <= p.rings; ri++) {
    const t = ri / p.rings, y = p.height * t - p.height / 2;
    const r = p.radiusMid + Math.pow(2 * t - 1, 2) * (p.radiusTop - p.radiusMid);
    for (let j = 0; j < p.points; j++) {
      const a = 2 * Math.PI * j / p.points;
      pts.push({ x: r * Math.cos(a), y: y + p.height / 2, z: r * Math.sin(a) });
    }
  }
  return pts;
}

function gen_mobius(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  for (let i = 0; i < p.segs; i++) {
    const u = 2 * Math.PI * i / p.segs;
    for (let j = 0; j < p.widthSegs; j++) {
      const v = (j / (p.widthSegs - 1) - 0.5) * p.width;
      pts.push({
        x: (p.radius + v * Math.cos(u / 2)) * Math.cos(u),
        y: v * Math.sin(u / 2),
        z: (p.radius + v * Math.cos(u / 2)) * Math.sin(u),
      });
    }
  }
  return pts;
}

function gen_icosphere(p: Record<string, number>): Point3D[] {
  const t = (1 + Math.sqrt(5)) / 2;
  let verts: [number, number, number][] = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
  ].map(v => { const l = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2); return v.map(x => x / l * p.radius) as [number, number, number]; });
  const faces = [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  const midpoint = (a: [number,number,number], b: [number,number,number]): [number,number,number] => {
    const m: [number,number,number] = [(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
    const l = Math.sqrt(m[0]**2+m[1]**2+m[2]**2);
    return m.map(x => x/l*p.radius) as [number,number,number];
  };
  let subdFaces = faces;
  for (let s = 0; s < Math.min(p.subdivisions, 3); s++) {
    const next: number[][] = [];
    subdFaces.forEach(f => {
      const a = verts[f[0]], b = verts[f[1]], c = verts[f[2]];
      const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a);
      const li = verts.length; verts.push(ab, bc, ca);
      next.push([f[0],li,li+2],[li,f[1],li+1],[li+2,li+1,f[2]],[li,li+1,li+2]);
    });
    subdFaces = next;
  }
  const seen = new Set<string>();
  const pts: Point3D[] = [];
  verts.forEach(v => {
    const k = `${v[0].toFixed(3)},${v[1].toFixed(3)},${v[2].toFixed(3)}`;
    if (!seen.has(k)) { seen.add(k); pts.push({ x: v[0], y: v[1], z: v[2] }); }
  });
  return pts;
}

function gen_body_skull(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius;
  for (let i = 0; i <= 8; i++) {
    const lat = Math.PI / 2 - Math.PI * 0.6 * i / 8;
    const y = r * Math.sin(lat), cr = r * Math.cos(lat);
    const n = Math.max(4, Math.round(12 * Math.cos(lat)));
    for (let j = 0; j < n; j++) { const a = 2 * Math.PI * j / n; pts.push({ x: cr * Math.cos(a), y: y + r * 0.1, z: cr * Math.sin(a) }); }
  }
  for (let j = 0; j < 14; j++) {
    const a = Math.PI * j / 13;
    pts.push({ x: r * 0.7 * Math.cos(a), y: -r * 0.3, z: r * 0.6 * Math.sin(a) });
    pts.push({ x: r * 0.7 * Math.cos(a), y: -r * 0.3 - p.jawDrop * 0.4, z: r * 0.6 * Math.sin(a) });
  }
  [-1, 1].forEach(side => {
    for (let j = 0; j < 10; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: side * r * 0.35 + r * 0.2 * Math.cos(a), y: r * 0.15, z: -p.eyeSocket + r * 0.15 * Math.sin(a) }); }
  });
  for (let t = 0; t < 8; t++) {
    const a = Math.PI * (t + 0.5) / 8;
    pts.push({ x: r * 0.55 * Math.cos(a), y: -r * 0.3 - p.jawDrop * 0.3, z: r * 0.5 * Math.sin(a) });
    pts.push({ x: r * 0.55 * Math.cos(a), y: -r * 0.3 - p.jawDrop * 0.7, z: r * 0.5 * Math.sin(a) });
  }
  return pts;
}

function gen_body_arm(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const segH = p.length / 3;
  const joints = [p.upperRadius, p.lowerRadius, p.lowerRadius * 0.8];
  for (let seg = 0; seg < 3; seg++) {
    const r = joints[seg];
    const yBase = seg * segH;
    for (let ring = 0; ring <= 4; ring++) {
      const y = yBase + segH * ring / 4;
      const cr = r * (seg === 2 ? (1 - ring * 0.15) : 1);
      for (let j = 0; j < 8; j++) {
        const a = 2 * Math.PI * j / 8;
        pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) });
      }
    }
    // Ball joint at each segment end
    if (seg < 2) {
      const bj = p.ballJointRadius || r * 1.2;
      const jointY = (seg + 1) * segH;
      for (let i = 0; i <= 4; i++) {
        const lat = -Math.PI / 2 + Math.PI * i / 4;
        const jy = bj * Math.sin(lat), jr = bj * Math.cos(lat);
        for (let j = 0; j < 8; j++) {
          const a = 2 * Math.PI * j / 8;
          pts.push({ x: jr * Math.cos(a), y: jointY + jy, z: jr * Math.sin(a) });
        }
      }
    }
  }
  return pts;
}

function gen_body_leg(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const segH = p.length / 3;
  const radii = [p.thighRadius, p.shinRadius, p.shinRadius * 0.75];
  for (let seg = 0; seg < 3; seg++) {
    const r = radii[seg];
    const yBase = -(seg + 1) * segH;
    for (let ring = 0; ring <= 5; ring++) {
      const y = yBase + segH * ring / 5;
      for (let j = 0; j < 10; j++) {
        const a = 2 * Math.PI * j / 10;
        pts.push({ x: r * Math.cos(a), y, z: r * Math.sin(a) });
      }
    }
    // knee/ankle ball joint
    if (seg < 2) {
      const bj = (p.ballJointRadius || r * 1.2);
      const jointY = -(seg + 1) * segH;
      for (let i = 0; i <= 4; i++) {
        const lat = -Math.PI / 2 + Math.PI * i / 4;
        const jy = bj * Math.sin(lat), jr = bj * Math.cos(lat);
        for (let j = 0; j < 10; j++) {
          const a = 2 * Math.PI * j / 10;
          pts.push({ x: jr * Math.cos(a), y: jointY + jy, z: jr * Math.sin(a) });
        }
      }
    }
  }
  // foot
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    pts.push({ x: (t - 0.5) * p.footLen, y: -3 * segH, z: -radii[2] * 0.5 });
    pts.push({ x: (t - 0.5) * p.footLen, y: -3 * segH, z: radii[2] });
  }
  return pts;
}

function gen_body_ball_joint(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius;
  // outer socket ring
  for (let i = 0; i <= 8; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 8;
    const y = r * Math.sin(lat), cr = r * Math.cos(lat);
    for (let j = 0; j < 16; j++) {
      const a = 2 * Math.PI * j / 16;
      pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) });
    }
  }
  // inner ball
  const ir = r * 0.7;
  for (let i = 0; i <= 6; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 6;
    const y = ir * Math.sin(lat), cr = ir * Math.cos(lat);
    for (let j = 0; j < 12; j++) {
      const a = 2 * Math.PI * j / 12;
      pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) });
    }
  }
  return pts;
}

function gen_body_hand(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const ps = p.palmSize;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { pts.push({ x: (i - 1.5) * ps * 0.3, y: 0, z: (j - 1.5) * ps * 0.3 }); }
  for (let f = 0; f < p.fingerCount; f++) {
    const fx = (f - (p.fingerCount - 1) / 2) * ps * 0.22;
    const segLen = p.fingerLength / 4;
    for (let s = 0; s < 4; s++) {
      const y = ps * 0.5 + segLen * s;
      const w = ps * 0.08 * (1 - s * 0.15);
      pts.push({ x: fx - w, y, z: 0 }, { x: fx + w, y, z: 0 });
      if (s < 3) { pts.push({ x: fx, y: y + segLen * 0.5, z: w * 1.2 }); }
    }
    pts.push({ x: fx, y: ps * 0.5 + p.fingerLength, z: 0 });
  }
  const tx = -ps * 0.55, ty = ps * 0.1;
  for (let s = 0; s < 3; s++) { pts.push({ x: tx - ps * 0.05, y: ty + p.fingerLength * 0.2 * s, z: s * ps * 0.08 }, { x: tx + ps * 0.05, y: ty + p.fingerLength * 0.2 * s, z: s * ps * 0.08 }); }
  return pts;
}

function gen_body_ribcage(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const hw = p.width / 2;
  for (let i = 0; i <= 8; i++) pts.push({ x: 0, y: p.height * i / 8, z: 0 });
  for (let r = 0; r < p.ribs; r++) {
    const y = p.height * (r + 0.5) / p.ribs;
    const rw = hw * (0.7 + 0.3 * Math.sin(Math.PI * r / p.ribs));
    const rz = rw * 0.5;
    for (let j = 0; j <= 10; j++) {
      const a = Math.PI * j / 10;
      pts.push({ x: rw * Math.cos(a), y, z: rz * Math.sin(a) });
      pts.push({ x: -rw * Math.cos(a), y, z: rz * Math.sin(a) });
    }
    if (r > 0 && r < p.ribs - 1) pts.push({ x: 0, y, z: rz });
  }
  const pr = hw * 0.7;
  for (let j = 0; j < 16; j++) { const a = 2 * Math.PI * j / 16; pts.push({ x: pr * Math.cos(a) * 0.9, y: -p.height * 0.1, z: pr * 0.5 * Math.sin(a) }); }
  return pts;
}

function gen_body_spine(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const vh = p.height / p.vertebrae;
  const hw = p.width / 2;
  for (let v = 0; v < p.vertebrae; v++) {
    const y = v * vh;
    pts.push({ x: -hw, y, z: -hw / 2 }, { x: hw, y, z: -hw / 2 }, { x: -hw, y, z: hw / 2 }, { x: hw, y, z: hw / 2 });
    pts.push({ x: 0, y: y + vh * 0.4, z: hw * 1.5 });
    pts.push({ x: -hw * 1.8, y, z: 0 }, { x: hw * 1.8, y, z: 0 });
  }
  return pts;
}

function gen_body_eye(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius;
  for (let i = 0; i <= 8; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 8;
    const y = r * Math.sin(lat), cr = r * Math.cos(lat);
    for (let j = 0; j < 12; j++) { const a = 2 * Math.PI * j / 12; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  for (let j = 0; j < 20; j++) { const a = 2 * Math.PI * j / 20; pts.push({ x: p.irisRadius * Math.cos(a), y: r * 0.85, z: p.irisRadius * Math.sin(a) }); }
  for (let j = 0; j < 12; j++) { const a = 2 * Math.PI * j / 12; pts.push({ x: p.pupilR * Math.cos(a), y: r * 0.95, z: p.pupilR * Math.sin(a) }); }
  return pts;
}

function gen_body_humanoid(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height, w = p.width;
  const hr = h * 0.1;
  for (let i = 0; i <= 5; i++) { const lat = -Math.PI / 2 + Math.PI * i / 5; const y = h * 0.85 + hr * Math.sin(lat), r = hr * Math.cos(lat); for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: r * Math.cos(a), y, z: r * Math.sin(a) }); } }
  for (let i = 0; i <= 5; i++) { const t = i / 5; const y = h * 0.45 + h * 0.3 * t; const tw = w * (0.7 + 0.3 * (1 - t)); pts.push({ x: -tw / 2, y, z: 0 }, { x: tw / 2, y, z: 0 }, { x: 0, y, z: tw * 0.3 }, { x: 0, y, z: -tw * 0.3 }); }
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 6; i++) { const y = h * 0.75 - h * 0.3 * i / 6; const x = side * (w / 2 + h * 0.2 * i / 6); pts.push({ x, y, z: 0 }); }
    for (let j = 0; j < 4; j++) { const a = 2 * Math.PI * j / 4; pts.push({ x: side * (w / 2 + h * 0.3) + h * 0.04 * Math.cos(a), y: h * 0.45, z: h * 0.04 * Math.sin(a) }); }
  });
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 8; i++) { const y = h * 0.45 - h * 0.45 * i / 8; const x = side * w * 0.2; pts.push({ x, y, z: 0 }); }
    pts.push({ x: side * w * 0.2, y: 0, z: -h * 0.06 }, { x: side * w * 0.2, y: 0, z: h * 0.08 });
  });
  return pts;
}

function gen_bastion_round(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  for (let ri = 0; ri <= (p.wallRings || 2); ri++) {
    const y = p.wallH * ri / (p.wallRings || 2);
    for (let j = 0; j < p.bastionSegs; j++) {
      const a = 2 * Math.PI * j / p.bastionSegs;
      pts.push({ x: p.radius * Math.cos(a), y, z: p.radius * Math.sin(a) });
    }
  }
  return pts;
}

function gen_bastion_square(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const hW = p.width / 2, hD = p.depth / 2;
  const rings = p.wallRings || 2;
  for (let ri = 0; ri <= rings; ri++) {
    const y = p.wallH * ri / rings;
    const sides = [
      { ax: -hW, az: -hD, dx: p.spacing, dz: 0, n: Math.ceil(p.width / p.spacing) },
      { ax: hW, az: -hD, dx: 0, dz: p.spacing, n: Math.ceil(p.depth / p.spacing) },
      { ax: hW, az: hD, dx: -p.spacing, dz: 0, n: Math.ceil(p.width / p.spacing) },
      { ax: -hW, az: hD, dx: 0, dz: -p.spacing, n: Math.ceil(p.depth / p.spacing) },
    ];
    sides.forEach(s => { for (let i = 0; i < s.n; i++) pts.push({ x: s.ax + s.dx * i, y, z: s.az + s.dz * i }); });
  }
  return pts;
}

function gen_tower(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  for (let ri = 0; ri <= p.rings; ri++) {
    const y = p.height * ri / p.rings;
    for (let j = 0; j < p.points; j++) {
      const a = 2 * Math.PI * j / p.points;
      pts.push({ x: p.radius * Math.cos(a), y, z: p.radius * Math.sin(a) });
    }
  }
  return pts;
}

function gen_wall_line(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const n = Math.ceil(p.length / p.spacing);
  for (let ri = 0; ri <= (p.rings || 2); ri++) {
    const y = p.height * ri / (p.rings || 2);
    for (let i = 0; i < n; i++) pts.push({ x: p.spacing * i - p.length / 2, y, z: 0 });
  }
  return pts;
}

function gen_wall_arc(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const arcRad = p.arcDeg * Math.PI / 180;
  const n = Math.ceil(p.radius * arcRad / p.spacing);
  for (let ri = 0; ri <= (p.rings || 2); ri++) {
    const y = p.height * ri / (p.rings || 2);
    for (let i = 0; i <= n; i++) {
      const a = -arcRad / 2 + arcRad * i / n;
      pts.push({ x: p.radius * Math.sin(a), y, z: p.radius * Math.cos(a) - p.radius });
    }
  }
  return pts;
}

function gen_star_fort(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  for (let ri = 0; ri <= (p.rings || 2); ri++) {
    const y = p.height * ri / (p.rings || 2);
    const npts = p.points * 2;
    for (let i = 0; i <= npts; i++) {
      const a = 2 * Math.PI * i / npts;
      const r = i % 2 === 0 ? p.outerR : p.innerR;
      pts.push({ x: r * Math.cos(a), y, z: r * Math.sin(a) });
    }
  }
  return pts;
}

function gen_grid_flat(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  for (let row = 0; row < p.rows; row++)
    for (let col = 0; col < p.cols; col++)
      pts.push({ x: (col - (p.cols - 1) / 2) * p.spacingX, y: 0, z: (row - (p.rows - 1) / 2) * p.spacingZ });
  return pts;
}

function gen_staircase(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  for (let i = 0; i < p.steps; i++) {
    if (p.curve > 0) {
      const a = i / p.steps * p.stepD * p.steps / p.curve;
      pts.push({ x: p.curve * Math.sin(a), y: p.stepH * i, z: p.curve * (1 - Math.cos(a)) });
    } else {
      pts.push({ x: 0, y: p.stepH * i, z: p.stepD * i - p.stepD * p.steps / 2 });
    }
  }
  return pts;
}

function gen_pyramid(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  for (let lvl = 0; lvl < p.levels; lvl++) {
    const y = p.levelH * lvl;
    const size = p.baseSize * Math.pow(1 - p.shrink / 100, lvl);
    const n = Math.ceil(size * 4 / p.spacing);
    const half = size / 2;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      pts.push({ x: -half + size * t, y, z: -half }, { x: -half + size * t, y, z: half });
      pts.push({ x: -half, y, z: -half + size * t }, { x: half, y, z: -half + size * t });
    }
  }
  return pts;
}

function gen_ring_platform(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  for (let ri = 0; ri < p.rings; ri++) {
    const r = p.innerR + (p.outerR - p.innerR) * ri / (p.rings - 1 || 1);
    for (let j = 0; j < p.points; j++) {
      const a = 2 * Math.PI * j / p.points;
      pts.push({ x: r * Math.cos(a), y: p.height, z: r * Math.sin(a) });
    }
  }
  return pts;
}

function gen_cross(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const hw = p.armW / 2, hlen = p.armLen / 2;
  for (let ri = 0; ri <= (p.rings || 2); ri++) {
    const y = p.height * ri / (p.rings || 2);
    let n = Math.ceil(p.armLen / p.spacing);
    for (let i = 0; i <= n; i++) { const x = -hlen + p.armLen * i / n; pts.push({ x, y, z: -hw }, { x, y, z: hw }); }
    n = Math.ceil(p.armLen / p.spacing);
    for (let i = 0; i <= n; i++) { const z = -hlen + p.armLen * i / n; if (Math.abs(z) > hw) pts.push({ x: -hw, y, z }, { x: hw, y, z }); }
  }
  return pts;
}

function gen_arrow(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const shaftEnd = p.length / 2 - p.headL;
  for (let ri = 0; ri <= (p.rings || 2); ri++) {
    const y = p.height * ri / (p.rings || 2);
    const hw = p.width / 2;
    const n = Math.ceil(shaftEnd / p.spacing);
    for (let i = 0; i <= n; i++) { const z = -p.length / 2 + shaftEnd * i / n; pts.push({ x: -hw, y, z }, { x: hw, y, z }); }
    const hn = Math.ceil(p.headW / p.spacing);
    for (let i = 0; i <= hn; i++) {
      const t = i / hn; const z = shaftEnd + p.headL * t; const x = p.headW / 2 * (1 - t);
      pts.push({ x, y, z }, { x: -x, y, z });
    }
    pts.push({ x: 0, y, z: p.length / 2 });
  }
  return pts;
}

function letterPoints(letter: string, size: number, depth: number, spacing: number, rings: number): Point3D[] {
  const pts: Point3D[] = [];
  const segs: Array<[number, number, number, number]> = letter === 'D'
    ? [[0, 0, 0, 1], [0, 1, 0.5, 1], [0.5, 1, 0.5, 0], [0, 0, 0.5, 0.5]] // D shape
    : [[0, 1, 1, 1], [1, 1, 0, 0], [0, 0, 1, 0]]; // Z shape
  for (let ri = 0; ri <= rings; ri++) {
    const y = depth * ri / rings;
    segs.forEach(([x1, z1, x2, z2]) => {
      const len = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2) * size;
      const n = Math.ceil(len / spacing);
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        pts.push({ x: (x1 + (x2 - x1) * t - 0.5) * size, y, z: (z1 + (z2 - z1) * t - 0.5) * size });
      }
    });
    if (letter === 'D') {
      const arcN = 16;
      for (let j = 0; j <= arcN; j++) {
        const a = -Math.PI / 2 + Math.PI * j / arcN;
        pts.push({ x: size * 0.5 * Math.cos(a), y, z: size * 0.5 + size * 0.5 * Math.sin(a) });
      }
    }
  }
  return pts;
}

function gen_letter_D(p: Record<string, number>): Point3D[] { return letterPoints('D', p.size, p.depth, p.spacing, p.rings); }
function gen_letter_Z(p: Record<string, number>): Point3D[] { return letterPoints('Z', p.size, p.depth, p.spacing, p.rings); }

// ─── SCI-FI SHAPES ───────────────────────────────────────────────

function gen_mech_bipedal(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height, w = p.width;
  // cockpit sphere
  const ch = h * 0.12;
  for (let i = 0; i <= 6; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 6;
    const y = h * 0.85 + ch * Math.sin(lat), cr = ch * Math.cos(lat);
    for (let j = 0; j < 10; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // chest box
  for (let i = 0; i <= 4; i++) {
    const y = h * 0.55 + (h * 0.25) * i / 4;
    const hw = w / 2, hd = w * 0.35;
    pts.push({ x: -hw, y, z: -hd }, { x: hw, y, z: -hd }, { x: -hw, y, z: hd }, { x: hw, y, z: hd });
  }
  // shoulder cannons
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 6; i++) {
      const y = h * 0.8 - h * 0.12 * i / 6;
      const r = w * 0.08;
      for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: side * (w / 2 + w * 0.12) + r * Math.cos(a), y, z: r * Math.sin(a) }); }
    }
    // gun barrel
    for (let i = 0; i <= 8; i++) { pts.push({ x: side * (w / 2 + w * 0.12), y: h * 0.8, z: -w * 0.3 * i / 8 }); }
  });
  // arms with pistons
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 8; i++) {
      const y = h * 0.7 - h * 0.25 * i / 8;
      const x = side * (w / 2 + w * 0.05 * i / 8);
      pts.push({ x, y, z: 0 });
    }
    // forearm cannon
    for (let i = 0; i <= 6; i++) {
      const r = w * 0.06;
      const y = h * 0.45 - h * 0.1 * i / 6;
      for (let j = 0; j < 6; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: side * w * 0.6 + r * Math.cos(a), y, z: r * Math.sin(a) }); }
    }
  });
  // legs
  [-1, 1].forEach(side => {
    const lx = side * w * 0.22;
    for (let i = 0; i <= 10; i++) {
      const y = h * 0.5 - h * 0.5 * i / 10;
      pts.push({ x: lx, y, z: 0 });
    }
    // knee pad
    for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: lx + w * 0.05 * Math.cos(a), y: h * 0.28, z: w * 0.05 * Math.sin(a) }); }
    // foot
    pts.push({ x: lx - w * 0.15, y: 0, z: -w * 0.1 }, { x: lx + w * 0.15, y: 0, z: -w * 0.1 });
    pts.push({ x: lx - w * 0.15, y: 0, z: w * 0.2 }, { x: lx + w * 0.15, y: 0, z: w * 0.2 });
  });
  return pts;
}

function gen_mech_minigun(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height, r = p.baseRadius;
  // Base platform
  for (let j = 0; j < 12; j++) {
    const a = 2 * Math.PI * j / 12;
    pts.push({ x: r * Math.cos(a), y: 0, z: r * Math.sin(a) });
    pts.push({ x: r * 0.7 * Math.cos(a), y: h * 0.1, z: r * 0.7 * Math.sin(a) });
  }
  // Rotating turret body
  for (let ri = 0; ri <= 5; ri++) {
    const y = h * 0.1 + h * 0.4 * ri / 5;
    const cr = r * 0.6 * (1 - ri * 0.05);
    for (let j = 0; j < 10; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Multi barrel array (6 barrels rotating around center)
  const barrelR = r * 0.15;
  const barrelOrbit = r * 0.3;
  const numBarrels = p.barrelCount || 6;
  for (let b = 0; b < numBarrels; b++) {
    const ba = 2 * Math.PI * b / numBarrels;
    const bx = barrelOrbit * Math.cos(ba);
    const bz = barrelOrbit * Math.sin(ba);
    for (let i = 0; i <= 12; i++) {
      const y = h * 0.5 + h * 0.5 * i / 12;
      pts.push({ x: bx, y, z: bz });
    }
    // barrel ring detail
    for (let ri = 0; ri <= 4; ri++) {
      const y = h * 0.5 + h * 0.1 * ri;
      for (let j = 0; j < 6; j++) {
        const a = 2 * Math.PI * j / 6;
        pts.push({ x: bx + barrelR * Math.cos(a), y, z: bz + barrelR * Math.sin(a) });
      }
    }
  }
  // ammo drum
  for (let ri = 0; ri <= 6; ri++) {
    const y = h * 0.15 + h * 0.25 * ri / 6;
    const dr = r * 0.5;
    for (let j = 0; j < 16; j++) { const a = 2 * Math.PI * j / 16; pts.push({ x: dr * Math.cos(a), y, z: dr * Math.sin(a) }); }
  }
  return pts;
}

function gen_mech_walker(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height, w = p.width;
  // Main body hexagonal
  for (let ri = 0; ri <= 4; ri++) {
    const y = h * 0.5 + h * 0.3 * ri / 4;
    for (let j = 0; j < 6; j++) {
      const a = Math.PI / 3 * j + Math.PI / 6;
      pts.push({ x: w * 0.5 * Math.cos(a), y, z: w * 0.4 * Math.sin(a) });
    }
  }
  // Sensor dome
  for (let i = 0; i <= 5; i++) {
    const lat = 0 + Math.PI / 2 * i / 5;
    const y = h * 0.8 + w * 0.15 * Math.sin(lat), cr = w * 0.15 * Math.cos(lat);
    for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // 4 articulated legs
  const legAngles = [Math.PI * 0.25, Math.PI * 0.75, -Math.PI * 0.75, -Math.PI * 0.25];
  legAngles.forEach(la => {
    const lx = w * 0.45 * Math.cos(la), lz = w * 0.45 * Math.sin(la);
    // thigh
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      pts.push({ x: lx + lx * 0.3 * t, y: h * 0.5 - h * 0.25 * t, z: lz + lz * 0.3 * t });
    }
    // shin
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const kx = lx * 1.3, kz = lz * 1.3;
      pts.push({ x: kx + kx * 0.1 * t, y: h * 0.25 - h * 0.25 * t, z: kz + kz * 0.1 * t });
    }
    // foot claw
    const fx = lx * 1.4, fz = lz * 1.4;
    for (let c = -1; c <= 1; c++) {
      pts.push({ x: fx + c * w * 0.06, y: 0, z: fz - w * 0.1 });
      pts.push({ x: fx + c * w * 0.04, y: 0, z: fz + w * 0.05 });
    }
  });
  // Weapon hardpoints
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 6; i++) {
      const y = h * 0.65;
      pts.push({ x: side * (w * 0.5 + w * 0.1 * i / 6), y, z: -w * 0.5 * i / 6 });
    }
  });
  return pts;
}

function gen_millennium_falcon(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius;
  // Main saucer hull — flattened ellipsoid
  for (let i = 0; i <= 8; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 8;
    const y = r * 0.18 * Math.sin(lat), cr = r * Math.cos(lat);
    for (let j = 0; j < 20; j++) { const a = 2 * Math.PI * j / 20; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Cockpit offset to port side
  const cpx = -r * 0.6, cpz = r * 0.25;
  for (let i = 0; i <= 4; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 4;
    const y = r * 0.12 + r * 0.1 * Math.sin(lat), cr = r * 0.15 * Math.cos(lat);
    for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: cpx + cr * Math.cos(a), y, z: cpz + cr * Math.sin(a) }); }
  }
  // Forward mandibles (2 prongs)
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      pts.push({ x: r * 0.6 * (1 - t * 0.3), y: 0, z: side * (r * 0.3 + r * 0.05 * t) + r * 0.7 * t });
    }
    // mandible tip
    for (let j = 0; j < 6; j++) {
      const a = 2 * Math.PI * j / 6;
      pts.push({ x: r * 0.42 + r * 0.04 * Math.cos(a), y: r * 0.04 * Math.sin(a), z: side * r * 0.35 + r * 0.7 });
    }
  });
  // Top surface details — quad gun turrets
  [{ x: 0, z: -r * 0.2 }, { x: 0, z: r * 0.2 }].forEach(pos => {
    for (let j = 0; j < 8; j++) {
      const a = 2 * Math.PI * j / 8;
      pts.push({ x: pos.x + r * 0.08 * Math.cos(a), y: r * 0.18, z: pos.z + r * 0.08 * Math.sin(a) });
    }
    // gun barrels
    [-1, 1].forEach(s => {
      pts.push({ x: pos.x, y: r * 0.18, z: pos.z + s * r * 0.08 });
      pts.push({ x: pos.x, y: r * 0.22, z: pos.z + s * r * 0.16 });
    });
  });
  // Engine nacelles at rear
  for (let e = -1; e <= 1; e++) {
    const ez = e * r * 0.15;
    for (let i = 0; i <= 5; i++) {
      const y = r * 0.05 * i / 5;
      for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: -r * 0.8 + r * 0.08 * Math.cos(a), y, z: ez + r * 0.08 * Math.sin(a) }); }
    }
  }
  return pts;
}

function gen_skyscraper(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height, w = p.width;
  const floors = p.floors || 20;
  const floorH = h / floors;
  // Main tower - taper slightly
  for (let f = 0; f <= floors; f++) {
    const y = f * floorH;
    const taper = 1 - f * 0.005;
    const hw = (w / 2) * taper, hd = (w * 0.6) * taper;
    pts.push({ x: -hw, y, z: -hd }, { x: hw, y, z: -hd }, { x: hw, y, z: hd }, { x: -hw, y, z: hd });
    // Window lines every few floors
    if (f % 3 === 0) {
      const step = w * 0.2;
      for (let wx = -hw + step; wx < hw; wx += step) {
        pts.push({ x: wx, y: y + floorH * 0.3, z: -hd });
        pts.push({ x: wx, y: y + floorH * 0.3, z: hd });
      }
    }
  }
  // Antenna spire
  for (let i = 0; i <= 8; i++) {
    const y = h + h * 0.15 * i / 8;
    const r = w * 0.03 * (1 - i / 8);
    for (let j = 0; j < 4; j++) { const a = 2 * Math.PI * j / 4; pts.push({ x: r * Math.cos(a), y, z: r * Math.sin(a) }); }
  }
  // Setback floors (Art Deco look)
  [0.6, 0.75, 0.9].forEach(ht => {
    const y = h * ht;
    const sw = w * (1.3 - ht * 0.5);
    const sh = w * 0.5 * (1.3 - ht * 0.5);
    pts.push({ x: -sw / 2, y, z: -sh }, { x: sw / 2, y, z: -sh }, { x: sw / 2, y, z: sh }, { x: -sw / 2, y, z: sh });
  });
  return pts;
}

function gen_prison_tower(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height, r = p.radius;
  // Main tower cylinder with thick walls
  for (let ri = 0; ri <= p.wallRings; ri++) {
    const y = h * ri / p.wallRings;
    for (let j = 0; j < 20; j++) {
      const a = 2 * Math.PI * j / 20;
      pts.push({ x: r * Math.cos(a), y, z: r * Math.sin(a) });
      // inner wall
      pts.push({ x: r * 0.85 * Math.cos(a), y, z: r * 0.85 * Math.sin(a) });
    }
  }
  // Battlements / crenellations at top
  const crenN = 16;
  for (let j = 0; j < crenN; j++) {
    const a = 2 * Math.PI * j / crenN;
    const cr = r * 1.05;
    pts.push({ x: cr * Math.cos(a), y: h, z: cr * Math.sin(a) });
    pts.push({ x: cr * Math.cos(a), y: h + p.crenHeight, z: cr * Math.sin(a) });
  }
  // Arrow slit windows
  for (let row = 1; row <= 4; row++) {
    const y = h * row / 5;
    for (let j = 0; j < 6; j++) {
      const a = 2 * Math.PI * j / 6;
      pts.push({ x: r * Math.cos(a), y: y - p.windowH / 2, z: r * Math.sin(a) });
      pts.push({ x: r * Math.cos(a), y: y + p.windowH / 2, z: r * Math.sin(a) });
    }
  }
  // Conical roof
  for (let ri = 0; ri <= 6; ri++) {
    const t = ri / 6;
    const y = h + p.crenHeight + h * 0.3 * t;
    const cr = r * 1.05 * (1 - t);
    if (cr > 0.5) {
      for (let j = 0; j < 12; j++) { const a = 2 * Math.PI * j / 12; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
    }
  }
  return pts;
}

function gen_sci_fi_gate(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height, w = p.width;
  // Two vertical pylons
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 12; i++) {
      const y = h * i / 12;
      const r = w * 0.06;
      for (let j = 0; j < 6; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: side * w / 2 + r * Math.cos(a), y, z: r * Math.sin(a) }); }
    }
    // Energy conduits up the pylons
    for (let i = 0; i <= 20; i++) {
      pts.push({ x: side * (w / 2 + w * 0.04), y: h * i / 20, z: 0 });
    }
    // Pylon caps
    for (let i = 0; i <= 4; i++) {
      const y = h + h * 0.08 * i / 4;
      const r = w * 0.08 * (1 - i / 4);
      for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: side * w / 2 + r * Math.cos(a), y, z: r * Math.sin(a) }); }
    }
  });
  // Horizontal arch across top
  const arcN = 20;
  for (let i = 0; i <= arcN; i++) {
    const a = Math.PI * i / arcN;
    const x = w / 2 * Math.cos(a);
    const y = h + w * 0.1 * Math.sin(a);
    pts.push({ x, y, z: 0 }, { x, y, z: w * 0.05 }, { x, y, z: -w * 0.05 });
  }
  // Energy field rings in the gate aperture
  for (let ri = 1; ri <= 5; ri++) {
    const gy = h * ri / 6;
    const hw = w * 0.4;
    for (let j = 0; j < 12; j++) { const a = 2 * Math.PI * j / 12; pts.push({ x: hw * Math.cos(a), y: gy, z: hw * 0.1 * Math.sin(a) }); }
  }
  return pts;
}

function gen_cannon_turret(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.baseRadius, h = p.height;
  // Base pivot ring
  for (let j = 0; j < 12; j++) { const a = 2 * Math.PI * j / 12; pts.push({ x: r * Math.cos(a), y: 0, z: r * Math.sin(a) }); }
  // Turret body - octagonal prism
  for (let ri = 0; ri <= 5; ri++) {
    const y = h * 0.1 + h * 0.4 * ri / 5;
    for (let j = 0; j < 8; j++) { const a = Math.PI / 4 * j + Math.PI / 8; pts.push({ x: r * 0.7 * Math.cos(a), y, z: r * 0.7 * Math.sin(a) }); }
  }
  // Twin cannons
  [-1, 1].forEach(side => {
    const cx = side * r * 0.2;
    for (let i = 0; i <= 15; i++) {
      const barrelR = r * 0.07;
      pts.push({ x: cx, y: h * 0.5, z: -r * 1.2 * i / 15 });
      // barrel rings
      if (i % 3 === 0) {
        for (let j = 0; j < 6; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: cx + barrelR * Math.cos(a), y: h * 0.5, z: -r * 1.2 * i / 15 + barrelR * Math.sin(a) }); }
      }
    }
    // Muzzle brake
    for (let j = 0; j < 8; j++) {
      const a = 2 * Math.PI * j / 8;
      pts.push({ x: cx + r * 0.1 * Math.cos(a), y: h * 0.5, z: -r * 1.2 });
    }
  });
  // Sensor array on top
  for (let i = 0; i <= 4; i++) {
    const y = h * 0.5 + h * 0.08 * i / 4;
    pts.push({ x: 0, y, z: 0 });
  }
  for (let j = 0; j < 6; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: r * 0.15 * Math.cos(a), y: h * 0.58, z: r * 0.15 * Math.sin(a) }); }
  return pts;
}

function gen_tunnel_circle(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius, len = p.length, segs = p.segments || 8;
  for (let i = 0; i <= segs; i++) {
    const z = -len / 2 + len * i / segs;
    for (let j = 0; j < p.points; j++) {
      const a = 2 * Math.PI * j / p.points;
      pts.push({ x: r * Math.cos(a), y: r * Math.sin(a), z });
    }
  }
  return pts;
}

function gen_tunnel_square(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const hw = p.width / 2, hh = p.height / 2, len = p.length, segs = p.segments || 8;
  for (let i = 0; i <= segs; i++) {
    const z = -len / 2 + len * i / segs;
    const sides = [
      [[-hw, -hh], [hw, -hh]],
      [[hw, -hh], [hw, hh]],
      [[hw, hh], [-hw, hh]],
      [[-hw, hh], [-hw, -hh]],
    ];
    const n = Math.ceil(p.width / (p.spacing || 5));
    sides.forEach(([a, b]) => {
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        pts.push({ x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, z });
      }
    });
  }
  return pts;
}

function gen_tunnel_hex(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius, len = p.length, segs = p.segments || 8;
  for (let i = 0; i <= segs; i++) {
    const z = -len / 2 + len * i / segs;
    for (let j = 0; j < 6; j++) {
      const a = Math.PI / 3 * j + Math.PI / 6;
      const b = Math.PI / 3 * (j + 1) + Math.PI / 6;
      const n = Math.ceil(r * Math.PI / 3 / (p.spacing || 5));
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        pts.push({ x: r * (Math.cos(a) * (1 - t) + Math.cos(b) * t), y: r * (Math.sin(a) * (1 - t) + Math.sin(b) * t), z });
      }
    }
  }
  return pts;
}

function gen_dna_double(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const total = p.turns * p.pointsPerTurn;
  for (let i = 0; i <= total; i++) {
    const t = i / total, angle = 2 * Math.PI * p.turns * t;
    pts.push({ x: p.radius * Math.cos(angle), y: p.height * t, z: p.radius * Math.sin(angle) });
    pts.push({ x: p.radius * Math.cos(angle + Math.PI), y: p.height * t, z: p.radius * Math.sin(angle + Math.PI) });
    // rungs between strands
    if (i % 3 === 0) {
      const steps = 4;
      for (let s = 0; s <= steps; s++) {
        const rx = p.radius * Math.cos(angle) * (1 - 2 * s / steps);
        const rz = p.radius * Math.sin(angle) * (1 - 2 * s / steps);
        pts.push({ x: rx, y: p.height * t, z: rz });
      }
    }
  }
  return pts;
}

function gen_reactor_core(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius, h = p.height;
  // Central column
  for (let i = 0; i <= 12; i++) {
    const y = h * i / 12;
    const cr = r * 0.15;
    for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Plasma rings - torus stacks
  const ringCount = p.rings || 5;
  for (let ri = 0; ri < ringCount; ri++) {
    const y = h * 0.1 + h * 0.8 * ri / (ringCount - 1);
    const rr = r * (0.5 + 0.5 * Math.sin(Math.PI * ri / (ringCount - 1)));
    for (let j = 0; j < 20; j++) { const a = 2 * Math.PI * j / 20; pts.push({ x: rr * Math.cos(a), y, z: rr * Math.sin(a) }); }
    // inner ring
    for (let j = 0; j < 12; j++) { const a = 2 * Math.PI * j / 12; pts.push({ x: rr * 0.6 * Math.cos(a), y, z: rr * 0.6 * Math.sin(a) }); }
  }
  // Outer containment sphere
  for (let i = 0; i <= 8; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 8;
    const y = h / 2 + r * Math.sin(lat), cr = r * Math.cos(lat);
    for (let j = 0; j < 16; j++) { const a = 2 * Math.PI * j / 16; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Support struts radiating out
  for (let s = 0; s < 6; s++) {
    const sa = 2 * Math.PI * s / 6;
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      pts.push({ x: r * t * Math.cos(sa), y: h * 0.1, z: r * t * Math.sin(sa) });
      pts.push({ x: r * t * Math.cos(sa), y: h * 0.9, z: r * t * Math.sin(sa) });
    }
  }
  return pts;
}

function gen_orbital_station(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius;
  // Main ring torus
  for (let i = 0; i < 24; i++) {
    const u = 2 * Math.PI * i / 24;
    for (let j = 0; j < 12; j++) {
      const v = 2 * Math.PI * j / 12;
      const mr = r * 0.15;
      pts.push({
        x: (r + mr * Math.cos(v)) * Math.cos(u),
        y: mr * Math.sin(v),
        z: (r + mr * Math.cos(v)) * Math.sin(u)
      });
    }
  }
  // Central hub sphere
  for (let i = 0; i <= 8; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 8;
    const y = r * 0.2 * Math.sin(lat), cr = r * 0.2 * Math.cos(lat);
    for (let j = 0; j < 12; j++) { const a = 2 * Math.PI * j / 12; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Spokes connecting hub to ring
  for (let s = 0; s < 6; s++) {
    const sa = 2 * Math.PI * s / 6;
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      pts.push({ x: r * t * Math.cos(sa), y: 0, z: r * t * Math.sin(sa) });
    }
  }
  // Solar panels extending from hub
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 6; i++) {
      const y = side * r * 0.8 * i / 6;
      const hw = r * 0.4 * (1 - i * 0.1);
      pts.push({ x: -hw, y, z: 0 }, { x: hw, y, z: 0 });
      pts.push({ x: 0, y, z: -r * 0.08 }, { x: 0, y, z: r * 0.08 });
    }
  });
  return pts;
}

function gen_azkaban_tower(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height, r = p.baseRadius;
  const towers = p.towerCount || 5;
  // Main keep (tallest central tower)
  for (let ri = 0; ri <= 16; ri++) {
    const y = h * ri / 16;
    const cr = r * (1 - ri * 0.01);
    for (let j = 0; j < 10; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Battlements on main keep
  for (let j = 0; j < 16; j++) {
    const a = 2 * Math.PI * j / 16;
    pts.push({ x: r * Math.cos(a), y: h, z: r * Math.sin(a) });
    pts.push({ x: r * Math.cos(a), y: h + r * 0.3, z: r * Math.sin(a) });
  }
  // Surrounding smaller towers in a ring
  for (let t = 0; t < towers; t++) {
    const ta = 2 * Math.PI * t / towers;
    const tx = r * 2.5 * Math.cos(ta), tz = r * 2.5 * Math.sin(ta);
    const th = h * 0.7, tr = r * 0.6;
    for (let ri = 0; ri <= 10; ri++) {
      const y = th * ri / 10;
      for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: tx + tr * Math.cos(a), y, z: tz + tr * Math.sin(a) }); }
    }
    // Conical roof
    for (let ri = 0; ri <= 5; ri++) {
      const y = th + th * 0.3 * ri / 5;
      const cr = tr * (1 - ri / 5);
      if (cr > 0.3) {
        for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: tx + cr * Math.cos(a), y, z: tz + cr * Math.sin(a) }); }
      }
    }
    // Connecting walls between towers
    const nextTa = 2 * Math.PI * ((t + 1) % towers) / towers;
    const nx = r * 2.5 * Math.cos(nextTa), nz = r * 2.5 * Math.sin(nextTa);
    const wallSegs = 8;
    const wallH = h * 0.3;
    for (let wi = 0; wi <= wallSegs; wi++) {
      const wt = wi / wallSegs;
      const wx = tx + (nx - tx) * wt, wz = tz + (nz - tz) * wt;
      pts.push({ x: wx, y: wallH, z: wz });
      pts.push({ x: wx, y: wallH + wallH * 0.2, z: wz });
    }
  }
  // Dungeon gate
  pts.push({ x: -r * 0.3, y: 0, z: r }, { x: r * 0.3, y: 0, z: r });
  pts.push({ x: -r * 0.3, y: h * 0.25, z: r }, { x: r * 0.3, y: h * 0.25, z: r });
  // Arch over gate
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI * i / 8;
    pts.push({ x: r * 0.3 * Math.cos(a), y: h * 0.25 + r * 0.3 * Math.sin(a), z: r });
  }
  return pts;
}

function gen_pyramid_stepped(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const steps = p.steps || 6;
  const baseSize = p.baseSize;
  const stepH = p.height / steps;
  const shrinkPer = p.shrink || 0.15;
  for (let s = 0; s < steps; s++) {
    const size = baseSize * Math.pow(1 - shrinkPer, s);
    const y = s * stepH;
    const hw = size / 2, hd = size * 0.8 / 2;
    const n = Math.ceil(size / (p.spacing || 6));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push({ x: -hw + size * t, y, z: -hd }, { x: -hw + size * t, y, z: hd });
      pts.push({ x: -hw, y, z: -hd + size * 0.8 * t }, { x: hw, y, z: -hd + size * 0.8 * t });
    }
    // step riser face
    const rn = Math.ceil(stepH / (p.spacing || 6));
    for (let ri = 0; ri <= rn; ri++) {
      const ry = y + stepH * ri / rn;
      const nextSize = baseSize * Math.pow(1 - shrinkPer, s + 1);
      const nhw = nextSize / 2;
      pts.push({ x: nhw, y: ry, z: -hd * (nhw / hw) }, { x: -nhw, y: ry, z: -hd * (nhw / hw) });
      pts.push({ x: nhw, y: ry, z: hd * (nhw / hw) }, { x: -nhw, y: ry, z: hd * (nhw / hw) });
    }
  }
  return pts;
}

function gen_crashed_ufo(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius;
  // Saucer hull — flattened sphere
  for (let i = 0; i <= 8; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 8;
    const y = r * 0.2 * Math.sin(lat), cr = r * Math.cos(lat);
    for (let j = 0; j < 18; j++) { const a = 2 * Math.PI * j / 18; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Dome on top
  for (let i = 0; i <= 5; i++) {
    const lat = Math.PI * i / 10;
    const y = r * 0.2 + r * 0.25 * Math.sin(lat), cr = r * 0.3 * Math.cos(lat);
    for (let j = 0; j < 10; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Crash furrow (gouge in ground) — tilt applied via debris placement
  const tiltFactor = Math.sin((p.tiltDeg || 25) * Math.PI / 180);
  const furLen = r * 1.8;
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const fw = r * 0.25 * (1 - t * 0.6);
    pts.push({ x: fw, y: -r * 0.15 * t, z: furLen * t });
    pts.push({ x: -fw, y: -r * 0.15 * t, z: furLen * t });
  }
  // Debris chunks around crash site — spread influenced by tilt
  const debrisN = p.debris || 8;
  for (let d = 0; d < debrisN; d++) {
    const da = 2 * Math.PI * d / debrisN;
    const dr = r * (0.8 + tiltFactor * 0.4) + r * 0.4 * Math.sin(d * 2.1);
    pts.push({ x: dr * Math.cos(da), y: 0, z: dr * Math.sin(da) });
    pts.push({ x: dr * 0.7 * Math.cos(da + 0.3), y: r * 0.05 * tiltFactor, z: dr * 0.7 * Math.sin(da + 0.3) });
  }
  return pts;
}

function gen_volcano(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.baseRadius, h = p.height;
  // Outer cone
  for (let ri = 0; ri <= p.rings; ri++) {
    const t = ri / p.rings;
    const cr = r * (1 - t) + p.craterRadius * t, y = h * t;
    const n = Math.max(6, Math.ceil(cr * 2 * Math.PI / (p.spacing || 8)));
    for (let j = 0; j < n; j++) { const a = 2 * Math.PI * j / n; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Crater rim bumpy
  for (let j = 0; j < 24; j++) {
    const a = 2 * Math.PI * j / 24;
    const bump = p.craterRadius * (1 + 0.15 * Math.sin(j * 3));
    pts.push({ x: bump * Math.cos(a), y: h, z: bump * Math.sin(a) });
    pts.push({ x: bump * Math.cos(a), y: h + p.rimHeight, z: bump * Math.sin(a) });
  }
  // Lava channel down one side
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const lx = (p.craterRadius * (1 - t) + r * t) * 0.1;
    pts.push({ x: lx, y: h * (1 - t), z: (p.craterRadius + (r - p.craterRadius) * t) * 0.85 });
  }
  return pts;
}

function gen_colosseum(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius, h = p.height;
  // Elliptical outer wall tiers
  const tiers = p.tiers || 3;
  for (let tier = 0; tier < tiers; tier++) {
    const tierH = h / tiers;
    const tierR = r - tier * r * 0.04;
    for (let ri = 0; ri <= 3; ri++) {
      const y = tier * tierH + tierH * ri / 3;
      for (let j = 0; j < 32; j++) {
        const a = 2 * Math.PI * j / 32;
        // Elliptical (longer than wide like the real thing)
        pts.push({ x: tierR * Math.cos(a) * 1.2, y, z: tierR * Math.sin(a) });
      }
    }
    // Arch columns at each tier
    const archN = p.arches || 20;
    for (let j = 0; j < archN; j++) {
      const a = 2 * Math.PI * j / archN;
      const ax = r * Math.cos(a) * 1.2, az = r * Math.sin(a);
      pts.push({ x: ax, y: tier * tierH, z: az });
      pts.push({ x: ax, y: tier * tierH + tierH, z: az });
      // arch keystone
      pts.push({ x: ax * 0.95, y: tier * tierH + tierH * 0.8, z: az * 0.95 });
    }
  }
  // Arena floor
  const aFloor = r * 0.55;
  for (let j = 0; j < 16; j++) { const a = 2 * Math.PI * j / 16; pts.push({ x: aFloor * Math.cos(a) * 1.2, y: 0, z: aFloor * Math.sin(a) }); }
  return pts;
}

function gen_stonehenge(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const outerR = p.outerRadius, innerR = p.innerRadius;
  const stoneH = p.stoneHeight, stoneW = p.stoneWidth;
  const n = p.outerCount || 30;
  // Outer sarsen circle with lintels
  for (let j = 0; j < n; j++) {
    const a = 2 * Math.PI * j / n;
    const sx = outerR * Math.cos(a), sz = outerR * Math.sin(a);
    const hw = stoneW / 2;
    // upright stone
    for (let ri = 0; ri <= 4; ri++) { const y = stoneH * ri / 4; pts.push({ x: sx, y, z: sz }); }
    // lintel across to next stone (every other one is a trilithon pair)
    if (j % 2 === 0) {
      const a2 = 2 * Math.PI * (j + 1) / n;
      const sx2 = outerR * Math.cos(a2), sz2 = outerR * Math.sin(a2);
      for (let k = 0; k <= 5; k++) {
        const t = k / 5;
        pts.push({ x: sx + (sx2 - sx) * t, y: stoneH, z: sz + (sz2 - sz) * t });
      }
    }
  }
  // Inner horseshoe trilithons
  const triliN = Math.max(2, p.trilithonCount || 5);
  for (let j = 0; j < triliN; j++) {
    const a = Math.PI * j / (triliN - 1) - Math.PI / 2;
    const sx = innerR * Math.cos(a), sz = innerR * Math.sin(a);
    const th = stoneH * 1.4;
    for (let ri = 0; ri <= 4; ri++) { const y = th * ri / 4; pts.push({ x: sx - stoneW, y, z: sz }, { x: sx + stoneW, y, z: sz }); }
    // lintel
    for (let k = 0; k <= 4; k++) {
      const t = k / 4; pts.push({ x: sx - stoneW + stoneW * 2 * t, y: th, z: sz });
    }
  }
  // Altar stone at center
  pts.push({ x: 0, y: 0, z: 0 }, { x: stoneW * 2, y: 0, z: 0 }, { x: 0, y: 0, z: stoneW });
  pts.push({ x: stoneW * 2, y: 0, z: stoneW }, { x: 0, y: stoneW * 0.3, z: stoneW * 0.5 }, { x: stoneW * 2, y: stoneW * 0.3, z: stoneW * 0.5 });
  return pts;
}

function gen_mushroom_cloud(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius, h = p.height;
  // Stem (narrow cylinder flaring at base and top)
  for (let ri = 0; ri <= 12; ri++) {
    const t = ri / 12, y = h * 0.6 * t;
    const cr = r * 0.15 * (1 + Math.abs(2 * t - 1) * 2);
    for (let j = 0; j < 10; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Cap — torus-like mushroom head
  const capY = h * 0.6;
  for (let ri = 0; ri <= 8; ri++) {
    const t = ri / 8;
    const y = capY + h * 0.4 * t;
    const cr = r * Math.sin(Math.PI * t);
    for (let j = 0; j < 20; j++) { const a = 2 * Math.PI * j / 20; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Shock ring at ground
  for (let ri = 1; ri <= 3; ri++) {
    const cr = r * ri * 0.8;
    for (let j = 0; j < 20; j++) { const a = 2 * Math.PI * j / 20; pts.push({ x: cr * Math.cos(a), y: r * 0.05 * ri, z: cr * Math.sin(a) }); }
  }
  // Rolling debris cloud ring mid-height
  const cloudY = h * 0.3;
  for (let j = 0; j < 24; j++) {
    const a = 2 * Math.PI * j / 24, cr = r * 0.7;
    pts.push({ x: cr * Math.cos(a), y: cloudY, z: cr * Math.sin(a) });
    pts.push({ x: cr * 0.8 * Math.cos(a + 0.3), y: cloudY + h * 0.04, z: cr * 0.8 * Math.sin(a + 0.3) });
  }
  return pts;
}

function gen_black_hole(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius;
  // Event horizon — perfect sphere
  for (let i = 0; i <= 10; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 10;
    const y = r * 0.3 * Math.sin(lat), cr = r * 0.3 * Math.cos(lat);
    for (let j = 0; j < 14; j++) { const a = 2 * Math.PI * j / 14; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Accretion disk — glowing torus
  for (let i = 0; i < 20; i++) {
    const u = 2 * Math.PI * i / 20;
    for (let j = 0; j < 10; j++) {
      const v = 2 * Math.PI * j / 10;
      const mr = r * 0.08;
      const disk = r * (0.5 + 0.3 * Math.random());
      pts.push({ x: (disk + mr * Math.cos(v)) * Math.cos(u), y: mr * 0.2 * Math.sin(v), z: (disk + mr * Math.cos(v)) * Math.sin(u) });
    }
  }
  // Gravitational lensing arcs
  for (let arc = 0; arc < (p.arcs || 4); arc++) {
    const arcA = 2 * Math.PI * arc / (p.arcs || 4);
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const distortion = 1 + 0.4 * Math.sin(Math.PI * t);
      const cr = r * distortion;
      const a = arcA + (Math.PI * 1.2) * t;
      pts.push({ x: cr * Math.cos(a), y: r * 0.05 * Math.sin(Math.PI * t), z: cr * Math.sin(a) });
    }
  }
  // Jet streams (relativistic jets)
  [-1, 1].forEach(dir => {
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const jy = dir * r * 2 * t;
      const jr = r * 0.1 * (1 - t * 0.8);
      for (let j = 0; j < 6; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: jr * Math.cos(a), y: jy, z: jr * Math.sin(a) }); }
    }
  });
  return pts;
}

function gen_alien_mothership(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius;
  // Main disk — very wide and flat
  for (let i = 0; i <= 6; i++) {
    const lat = -Math.PI / 4 + Math.PI / 2 * i / 6;
    const y = r * 0.15 * Math.sin(lat), cr = r * Math.cos(lat);
    for (let j = 0; j < 24; j++) { const a = 2 * Math.PI * j / 24; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Central raised section
  for (let i = 0; i <= 5; i++) {
    const lat = 0 + Math.PI / 2 * i / 5;
    const y = r * 0.15 + r * 0.25 * Math.sin(lat), cr = r * 0.35 * Math.cos(lat);
    for (let j = 0; j < 14; j++) { const a = 2 * Math.PI * j / 14; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Tractor beam emitter array (ring of emitters on underside)
  const emN = p.emitterCount || 8;
  for (let e = 0; e < emN; e++) {
    const ea = 2 * Math.PI * e / emN;
    const ex = r * 0.6 * Math.cos(ea), ez = r * 0.6 * Math.sin(ea);
    for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: ex + r * 0.06 * Math.cos(a), y: -r * 0.1, z: ez + r * 0.06 * Math.sin(a) }); }
    // Beam extending down
    for (let i = 0; i <= 6; i++) { pts.push({ x: ex, y: -r * 0.1 - r * 0.5 * i / 6, z: ez }); }
  }
  // Weapon modules around rim
  for (let w = 0; w < 12; w++) {
    const wa = 2 * Math.PI * w / 12;
    const wx = r * 0.92 * Math.cos(wa), wz = r * 0.92 * Math.sin(wa);
    pts.push({ x: wx, y: 0, z: wz });
    pts.push({ x: wx + r * 0.08 * Math.cos(wa), y: -r * 0.05, z: wz + r * 0.08 * Math.sin(wa) });
  }
  // Warp nacelles — 3 huge engines at rear
  for (let n = 0; n < 3; n++) {
    const na = 2 * Math.PI * n / 3;
    const nx = r * 0.7 * Math.cos(na), nz = r * 0.7 * Math.sin(na);
    for (let ri = 0; ri <= 8; ri++) {
      const y = -r * 0.15 + r * 0.1 * ri / 8;
      for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: nx + r * 0.1 * Math.cos(a), y, z: nz + r * 0.1 * Math.sin(a) }); }
    }
  }
  return pts;
}

function gen_celtic_ring(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius, h = p.height;
  // Outer standing stones in circle
  const stoneN = p.stoneCount || 24;
  for (let j = 0; j < stoneN; j++) {
    const a = 2 * Math.PI * j / stoneN;
    const sx = r * Math.cos(a), sz = r * Math.sin(a);
    const sw = r * 0.05;
    for (let ri = 0; ri <= 5; ri++) { const y = h * ri / 5; pts.push({ x: sx, y, z: sz }, { x: sx + sw * Math.cos(a + Math.PI / 2), y, z: sz + sw * Math.sin(a + Math.PI / 2) }); }
  }
  // Inner ring at half radius
  const innerN = Math.floor(stoneN * 0.6);
  for (let j = 0; j < innerN; j++) {
    const a = 2 * Math.PI * j / innerN;
    const sx = r * 0.55 * Math.cos(a), sz = r * 0.55 * Math.sin(a);
    for (let ri = 0; ri <= 4; ri++) { const y = h * 0.8 * ri / 4; pts.push({ x: sx, y, z: sz }); }
  }
  // Runic carved archways (taller paired stones with lintels)
  const archN = p.archCount || 6;
  for (let j = 0; j < archN; j++) {
    const a = 2 * Math.PI * j / archN;
    const a2 = 2 * Math.PI * (j + 0.5) / archN;
    const sx = r * 1.1 * Math.cos(a), sz = r * 1.1 * Math.sin(a);
    const sx2 = r * 1.1 * Math.cos(a2), sz2 = r * 1.1 * Math.sin(a2);
    const ah = h * 1.5;
    for (let ri = 0; ri <= 6; ri++) { const y = ah * ri / 6; pts.push({ x: sx, y, z: sz }); }
    for (let ri = 0; ri <= 6; ri++) { const y = ah * ri / 6; pts.push({ x: sx2, y, z: sz2 }); }
    // lintel
    for (let k = 0; k <= 6; k++) { const t = k / 6; pts.push({ x: sx + (sx2 - sx) * t, y: ah, z: sz + (sz2 - sz) * t }); }
  }
  // Sacred flame at center
  for (let i = 0; i <= 8; i++) {
    const t = i / 8, cr = r * 0.06 * (1 - t * 0.9);
    const y = h * 0.5 * t;
    for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8 + t * 0.5; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  return pts;
}

export function applyTransform(
  pts: Point3D[],
  posX: number,
  posY: number,
  posZ: number,
  rotYDeg: number,
  scale: number
): Point3D[] {
  return pts.map(pt => {
    const sx = pt.x * scale, sy = pt.y * scale, sz = pt.z * scale;
    const [rx, rz] = rotYapply(sx, sz, rotYDeg);
    return { x: rx + posX, y: sy + posY, z: rz + posZ };
  });
}
