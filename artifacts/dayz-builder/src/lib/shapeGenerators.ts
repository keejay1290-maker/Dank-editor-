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
    case 't800_endoskeleton': return gen_t800_endoskeleton(p);
    case 'atat_walker': return gen_atat_walker(p);
    case 'borg_cube': return gen_borg_cube(p);
    case 'eye_of_sauron': return gen_eye_of_sauron(p);
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
    case 'treehouse': return gen_treehouse(p);
    case 'checkpoint': return gen_checkpoint(p);
    case 'watchtower_post': return gen_watchtower_post(p);
    case 'fuel_depot': return gen_fuel_depot(p);
    case 'sniper_nest': return gen_sniper_nest(p);
    case 'farmstead': return gen_farmstead(p);
    case 'survivor_camp': return gen_survivor_camp(p);
    case 'bunker_line': return gen_bunker_line(p);
    case 'power_relay': return gen_power_relay(p);
    case 'radio_outpost': return gen_radio_outpost(p);
    case 'tf_bumblebee': return gen_tf_bumblebee(p);
    case 'tf_optimus': return gen_tf_optimus(p);
    case 'tf_ironhide': return gen_tf_ironhide(p);
    case 'tf_jazz': return gen_tf_jazz(p);
    case 'tf_ratchet': return gen_tf_ratchet(p);
    case 'tf_megatron': return gen_tf_megatron(p);
    case 'tf_starscream': return gen_tf_starscream(p);
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

// ─── T-800 ENDOSKELETON ──────────────────────────────────────────
function gen_t800_endoskeleton(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height, w = p.width;
  const hW = w * 0.22; // head half-width

  // ── HEAD (skull cage) ──────────────────────────────────────────
  const headTop = h, headBot = h * 0.87, headMid = (headTop + headBot) / 2;
  // Cranium rings
  for (let ri = 0; ri <= 2; ri++) {
    const y = headBot + (headTop - headBot) * ri / 2;
    const r = hW * (0.75 + 0.25 * ri / 2);
    for (let j = 0; j < 10; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: r * Math.cos(a), y, z: r * Math.sin(a) }); }
  }
  // Eye sockets (two oblong rings, front-facing)
  [-1, 1].forEach(side => {
    const ex = side * hW * 0.42;
    for (let j = 0; j < 8; j++) {
      const a = 2 * Math.PI * j / 8;
      pts.push({ x: ex + hW * 0.28 * Math.cos(a), y: headMid + hW * 0.05, z: -hW * 0.8 + hW * 0.12 * Math.sin(a) });
    }
    pts.push({ x: ex, y: headMid, z: -hW * 0.88 }); // glowing eye
  });
  // Cheekbones (front arcs)
  [-1, 1].forEach(side => {
    for (let j = 0; j <= 4; j++) {
      const t = j / 4, a = -Math.PI * 0.25 + Math.PI * 0.5 * t;
      pts.push({ x: side * hW * 0.88 * Math.cos(a), y: headMid - hW * 0.12, z: -hW * 0.7 * Math.sin(a + Math.PI / 2) });
    }
  });
  // Jaw / lower skull
  for (let j = 0; j < 10; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: hW * 0.78 * Math.cos(a), y: headBot + hW * 0.1, z: hW * 0.62 * Math.sin(a) }); }
  // Teeth row
  for (let i = -4; i <= 4; i++) { if (i !== 0) pts.push({ x: i * hW * 0.18, y: headBot, z: -hW * 0.62 }); }

  // ── NECK (vertebrae cross) ─────────────────────────────────────
  for (let i = 0; i <= 5; i++) {
    const y = h * 0.82 + (headBot - h * 0.82) * i / 5;
    pts.push({ x: -hW * 0.22, y, z: 0 }, { x: hW * 0.22, y, z: 0 });
    pts.push({ x: 0, y, z: -hW * 0.22 }, { x: 0, y, z: hW * 0.22 });
  }

  // ── SPINE (posterior) ──────────────────────────────────────────
  for (let i = 0; i <= 14; i++) { pts.push({ x: 0, y: h * 0.18 + h * 0.64 * i / 14, z: w * 0.13 }); }

  // ── RIBCAGE ───────────────────────────────────────────────────
  const chestTop = h * 0.8, chestBot = h * 0.54;
  const numRibs = 8;
  for (let ri = 0; ri < numRibs; ri++) {
    const y = chestBot + (chestTop - chestBot) * ri / (numRibs - 1);
    const ribW = w * 0.44 * (1 - ri * 0.012);
    const ribD = w * 0.21;
    // Front arc of rib (9 points)
    for (let j = -4; j <= 4; j++) {
      const t = j / 4;
      pts.push({ x: t * ribW, y, z: -Math.sqrt(Math.max(0, 1 - t * t)) * ribD });
    }
    // Side rib segments (going backward)
    [-1, 1].forEach(side => {
      for (let j = 0; j <= 3; j++) {
        const t = j / 3;
        pts.push({ x: side * ribW * (0.85 + 0.15 * t), y, z: -ribD * (1 - t) + ribD * 0.55 * t });
      }
    });
  }
  // Sternum (central line)
  for (let i = 0; i <= 6; i++) { pts.push({ x: 0, y: chestBot + (chestTop - chestBot) * i / 6, z: -w * 0.18 }); }

  // ── PELVIS ────────────────────────────────────────────────────
  const pelvisY = h * 0.5;
  for (let j = 0; j <= 10; j++) {
    const a = Math.PI * j / 10;
    pts.push({ x: w * 0.38 * Math.cos(a), y: pelvisY, z: w * 0.19 * Math.sin(a) });
  }
  pts.push({ x: -w * 0.35, y: pelvisY - h * 0.04, z: 0 }, { x: w * 0.35, y: pelvisY - h * 0.04, z: 0 });
  pts.push({ x: -w * 0.25, y: pelvisY - h * 0.07, z: 0 }, { x: w * 0.25, y: pelvisY - h * 0.07, z: 0 });

  // ── ARMS ──────────────────────────────────────────────────────
  [-1, 1].forEach(side => {
    const sX = side * w * 0.5, sY = h * 0.77;
    const eX = side * w * 0.57, eY = h * 0.6;
    const wX = side * w * 0.62, wY = h * 0.43;
    // Upper arm
    for (let i = 0; i <= 7; i++) {
      const t = i / 7;
      const r = w * 0.075 - w * 0.01 * t;
      for (let j = 0; j < 6; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: sX + (eX - sX) * t + r * Math.cos(a), y: sY + (eY - sY) * t, z: r * Math.sin(a) }); }
    }
    // Elbow joint
    for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: eX + w * 0.09 * Math.cos(a), y: eY, z: w * 0.09 * Math.sin(a) }); }
    // Forearm
    for (let i = 0; i <= 7; i++) {
      const t = i / 7, r = w * 0.062;
      for (let j = 0; j < 5; j++) { const a = 2 * Math.PI * j / 5; pts.push({ x: eX + (wX - eX) * t + r * Math.cos(a), y: eY + (wY - eY) * t, z: r * Math.sin(a) }); }
    }
    // Hand
    for (let j = 0; j < 6; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: wX + w * 0.1 * Math.cos(a), y: wY - h * 0.02, z: w * 0.07 * Math.sin(a) }); }
  });

  // ── LEGS ──────────────────────────────────────────────────────
  [-1, 1].forEach(side => {
    const lx = side * w * 0.22;
    const kneeY = pelvisY - h * 0.27;
    const ankleY = kneeY - h * 0.24;
    // Upper leg (femur — thick)
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, r = w * 0.1 - w * 0.025 * t;
      for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: lx + r * Math.cos(a), y: pelvisY - t * h * 0.27, z: r * Math.sin(a) }); }
    }
    // Knee cap
    for (let j = 0; j < 10; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: lx + w * 0.12 * Math.cos(a), y: kneeY, z: w * 0.12 * Math.sin(a) }); }
    // Shin (thinner)
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, r = w * 0.068;
      for (let j = 0; j < 6; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: lx + r * Math.cos(a), y: kneeY - t * h * 0.24, z: r * Math.sin(a) }); }
    }
    // Ankle joint
    for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: lx + w * 0.085 * Math.cos(a), y: ankleY, z: w * 0.085 * Math.sin(a) }); }
    // Foot
    pts.push({ x: lx - w * 0.13, y: 0, z: -w * 0.08 }, { x: lx + w * 0.13, y: 0, z: -w * 0.08 });
    pts.push({ x: lx - w * 0.1, y: 0, z: w * 0.14 }, { x: lx + w * 0.1, y: 0, z: w * 0.14 });
    pts.push({ x: lx, y: 0, z: -w * 0.2 }); // front toe
  });

  return pts;
}

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
  const r = p.baseRadius, h = p.height, cR = p.craterRadius;
  // Curved sides: power curve gives wide base that steepens near top (Mt Fuji profile)
  const rings = p.rings || 10;
  for (let ri = 0; ri <= rings; ri++) {
    const t = ri / rings;
    // Exponential taper: very gentle at base, steep near crater
    const cr = cR + (r - cR) * Math.pow(1 - t, 1.8);
    const y = h * Math.pow(t, 0.8); // compress height at top → flatter summit shoulder
    const n = Math.max(8, Math.round(cr * Math.PI * 2 / (p.spacing || 6)));
    for (let j = 0; j < n; j++) { const a = 2 * Math.PI * j / n; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Wide flat base skirt (extra ring at ground to emphasise breadth)
  for (let j = 0; j < 32; j++) { const a = 2 * Math.PI * j / 32; pts.push({ x: r * Math.cos(a), y: 0, z: r * Math.sin(a) }); }
  // Crater rim — jagged bumps for rocky look
  for (let j = 0; j < 28; j++) {
    const a = 2 * Math.PI * j / 28;
    const bump = cR * (1 + 0.22 * Math.sin(j * 5 + 1));
    pts.push({ x: bump * Math.cos(a), y: h, z: bump * Math.sin(a) });
    pts.push({ x: bump * 0.85 * Math.cos(a), y: h + p.rimHeight, z: bump * 0.85 * Math.sin(a) });
  }
  // Crater interior (concave bowl)
  for (let ri = 1; ri <= 3; ri++) {
    const cr2 = cR * 0.8 * (1 - ri / 4);
    const cy = h - h * 0.06 * ri;
    for (let j = 0; j < 16; j++) { const a = 2 * Math.PI * j / 16; pts.push({ x: cr2 * Math.cos(a), y: cy, z: cr2 * Math.sin(a) }); }
  }
  // Lava flows: 3 streams down the sides
  [0, 2.1, 4.4].forEach(startA => {
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const cr3 = cR + (r - cR) * Math.pow(t, 0.7);
      const a = startA + 0.18 * Math.sin(t * 8);
      pts.push({ x: cr3 * Math.cos(a), y: h * (1 - t), z: cr3 * Math.sin(a) });
    }
  });
  return pts;
}

// Eye of Sauron: Barad-dûr spire + fiery oval eye + flame corona
function gen_eye_of_sauron(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height, tw = p.towerWidth, eR = p.eyeRadius;

  // ── BARAD-DÛR TOWER (4-sided tapering dark spire) ─────────────
  const towerTop = h * 0.62;
  for (let ri = 0; ri <= 18; ri++) {
    const t = ri / 18;
    const y = towerTop * t;
    const w = tw * Math.pow(1 - t, 0.7); // tapers more steeply
    const hw = w * 0.5, hd = w * 0.42;
    pts.push({ x: -hw, y, z: -hd }, { x: hw, y, z: -hd }, { x: hw, y, z: hd }, { x: -hw, y, z: hd });
    // Buttress fins every 4 rings
    if (ri > 0 && ri % 3 === 0 && t < 0.85) {
      const fin = w * 0.35;
      [-1, 1].forEach(side => {
        pts.push({ x: side * (hw + fin), y, z: 0 });
        pts.push({ x: side * (hw + fin * 0.5), y, z: -hd });
        pts.push({ x: side * (hw + fin * 0.5), y, z: hd });
      });
    }
  }
  // Spire needle tip
  for (let i = 0; i <= 8; i++) {
    const t = i / 8, r = tw * 0.1 * (1 - t);
    for (let j = 0; j < 5; j++) { const a = 2 * Math.PI * j / 5; pts.push({ x: r * Math.cos(a), y: towerTop + h * 0.06 * t, z: r * Math.sin(a) }); }
  }
  // Dark platform/battlement ring at tower base
  [tw * 1.1, tw * 1.5, tw * 2.0].forEach(br => {
    const n = Math.round(br * 2.5);
    for (let j = 0; j < n; j++) { const a = 2 * Math.PI * j / n; pts.push({ x: br * Math.cos(a), y: 0, z: br * Math.sin(a) }); }
  });

  // ── THE EYE (wide oval / cat-eye ellipse above tower) ──────────
  const eyeY = h * 0.75;
  const eRx = eR, eRz = eR * 0.32; // wide & narrow (slit eye)
  // Outer eye ring (oval)
  for (let j = 0; j < 44; j++) {
    const a = 2 * Math.PI * j / 44;
    pts.push({ x: eRx * Math.cos(a), y: eyeY + eRz * 0.35 * Math.sin(a * 2), z: eRz * Math.sin(a) });
  }
  // Mid iris ring
  for (let j = 0; j < 28; j++) {
    const a = 2 * Math.PI * j / 28;
    pts.push({ x: eRx * 0.55 * Math.cos(a), y: eyeY + eRz * 0.25 * Math.sin(a * 2), z: eRz * 0.55 * Math.sin(a) });
  }
  // Vertical pupil slit (the slit in the eye)
  for (let i = -5; i <= 5; i++) {
    const t = i / 5;
    pts.push({ x: eRx * 0.04, y: eyeY + eRz * t, z: eRz * 0.08 * Math.sign(t || 1) * Math.abs(t) });
  }
  // Horizontal eyelid lines (upper and lower arcs)
  [-1, 1].forEach(lid => {
    for (let j = -8; j <= 8; j++) {
      const t = j / 8;
      pts.push({ x: eRx * 0.9 * t, y: eyeY + lid * eRz * 0.7 * Math.sqrt(1 - t * t), z: eRz * 0.12 * lid });
    }
  });

  // ── FLAME CORONA (radiating spikes of fire around the eye) ─────
  const numFlames = 20;
  for (let j = 0; j < numFlames; j++) {
    const a = 2 * Math.PI * j / numFlames;
    // Vary flame lengths using a deterministic wave
    const flLen = eRx * (0.5 + 0.5 * Math.abs(Math.sin(j * 1.9 + 0.7)));
    const bx = eRx * 0.95 * Math.cos(a), bz = eRz * 0.95 * Math.sin(a);
    const mx = (eRx + flLen * 0.5) * Math.cos(a), mz = (eRz + flLen * 0.25) * Math.sin(a);
    const tx2 = (eRx + flLen) * Math.cos(a), tz2 = (eRz + flLen * 0.4) * Math.sin(a);
    pts.push({ x: bx, y: eyeY, z: bz });
    pts.push({ x: mx, y: eyeY + flLen * 0.35, z: mz });
    pts.push({ x: tx2, y: eyeY + flLen * 0.65, z: tz2 });
  }

  return pts;
}

// AT-AT Walker: 4-legged quadruped body + neck + boxy head with twin cannons
function gen_atat_walker(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height, w = p.width;
  const legH = h * 0.42;

  // ── 4 LEGS (column legs, 2 on each side) ──────────────────────
  const legCX = w * 0.38, legCZ = w * 0.45;
  [[legCX, legCZ], [legCX, -legCZ], [-legCX, legCZ], [-legCX, -legCZ]].forEach(([lx, lz]) => {
    // Upper leg joint at body attach
    for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: lx + w * 0.08 * Math.cos(a), y: legH, z: lz + w * 0.08 * Math.sin(a) }); }
    // Leg column
    for (let i = 0; i <= 10; i++) { const r = w * 0.06; const y = legH * i / 10; for (let j = 0; j < 6; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: lx + r * Math.cos(a), y, z: lz + r * Math.sin(a) }); } }
    // Ankle
    for (let j = 0; j < 8; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: lx + w * 0.09 * Math.cos(a), y: legH * 0.38, z: lz + w * 0.09 * Math.sin(a) }); }
    // Flat foot (rectangular pad)
    pts.push({ x: lx - w * 0.12, y: 0, z: lz - w * 0.14 }, { x: lx + w * 0.12, y: 0, z: lz - w * 0.14 });
    pts.push({ x: lx - w * 0.12, y: 0, z: lz + w * 0.14 }, { x: lx + w * 0.12, y: 0, z: lz + w * 0.14 });
    pts.push({ x: lx, y: 0, z: lz - w * 0.18 }); // forward toe
  });

  // ── BODY (massive rectangular hull elevated on legs) ──────────
  const bodyY = legH, bodyTop = bodyY + h * 0.32;
  const bW = w * 0.52, bD = w * 0.58;
  for (let ri = 0; ri <= 5; ri++) {
    const y = bodyY + h * 0.32 * ri / 5;
    pts.push({ x: -bW, y, z: -bD }, { x: bW, y, z: -bD }, { x: bW, y, z: bD }, { x: -bW, y, z: bD });
  }
  // Vertical corner edges
  [[bW, bD], [bW, -bD], [-bW, bD], [-bW, -bD]].forEach(([ex, ez]) => {
    for (let i = 0; i <= 4; i++) { pts.push({ x: ex, y: bodyY + h * 0.32 * i / 4, z: ez }); }
  });
  // Undercarriage panel lines (3 horizontal ribs on underside)
  for (let ri = 0; ri <= 2; ri++) {
    const z2 = -bD + bD * 2 * ri / 2;
    pts.push({ x: -bW, y: bodyY + h * 0.04, z: z2 }, { x: bW, y: bodyY + h * 0.04, z: z2 });
  }

  // ── NECK (forward-extending from front of body) ────────────────
  const neckLen = w * 0.5;
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const y = bodyTop - h * 0.04 + h * 0.1 * t;
    const nz = -bD - neckLen * t;
    pts.push({ x: -w * 0.1, y, z: nz }, { x: w * 0.1, y, z: nz });
    if (i % 2 === 0) pts.push({ x: 0, y: y + h * 0.04, z: nz }, { x: 0, y: y - h * 0.04, z: nz });
  }

  // ── HEAD (rectangular box with viewport & twin cannons) ────────
  const headZ = -bD - neckLen;
  const headY = bodyTop + h * 0.03;
  const hW2 = w * 0.18, hD = w * 0.2, hH = h * 0.13;
  for (let ri = 0; ri <= 3; ri++) {
    const y = headY + hH * ri / 3;
    pts.push({ x: -hW2, y, z: headZ - hD }, { x: hW2, y, z: headZ - hD });
    pts.push({ x: hW2, y, z: headZ + hD }, { x: -hW2, y, z: headZ + hD });
  }
  // Viewport strip (windows across front of head)
  for (let i = -3; i <= 3; i++) { pts.push({ x: i * hW2 * 0.3, y: headY + hH * 0.7, z: headZ - hD - w * 0.01 }); }
  // Twin chin cannons (two long barrels hanging below front)
  [-1, 1].forEach(side => {
    const cx = side * hW2 * 0.55;
    for (let i = 0; i <= 10; i++) { pts.push({ x: cx, y: headY + hH * 0.2, z: headZ - hD - w * 0.38 * i / 10 }); }
    for (let j = 0; j < 6; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: cx + w * 0.04 * Math.cos(a), y: headY + hH * 0.2, z: headZ - hD - w * 0.38 + w * 0.03 * Math.sin(a) }); }
  });

  return pts;
}

// Borg Cube: wireframe cube with Borg-style circuitry grid on all 6 faces
function gen_borg_cube(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.size * 0.5; // half-edge
  const g = Math.max(2, Math.round(p.gridLines || 4));

  // Helper: draw a face grid (normal axis = n, axes = u/v)
  const face = (n: 'x' | 'y' | 'z', nVal: number, uA: 'x' | 'y' | 'z', vA: 'x' | 'y' | 'z') => {
    for (let ui = 0; ui <= g; ui++) {
      for (let vi = 0; vi <= g; vi++) {
        const uV = -s + 2 * s * ui / g;
        const vV = -s + 2 * s * vi / g;
        const pt: Point3D = { x: 0, y: 0, z: 0 };
        pt[n] = nVal; pt[uA] = uV; pt[vA] = vV;
        pts.push(pt);
      }
    }
    // Extra structural lines (Borg circuitry channels)
    [Math.round(g / 3), Math.round(2 * g / 3)].forEach(ci => {
      const cV = -s + 2 * s * ci / g;
      for (let k = 0; k <= g; k++) {
        const kV = -s + 2 * s * k / g;
        const p1: Point3D = { x: 0, y: 0, z: 0 }; p1[n] = nVal; p1[uA] = cV; p1[vA] = kV;
        const p2: Point3D = { x: 0, y: 0, z: 0 }; p2[n] = nVal; p2[uA] = kV; p2[vA] = cV;
        pts.push(p1, p2);
      }
    });
  };
  face('z', s, 'x', 'y'); face('z', -s, 'x', 'y');
  face('x', s, 'y', 'z'); face('x', -s, 'y', 'z');
  face('y', s, 'x', 'z'); face('y', -s, 'x', 'z');
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

// ─── ⚡ LIGHTWEIGHT BUILDINGS ────────────────────────────────────────────────

// TREEHOUSE — 4 corner pillar columns + elevated platform + A-frame roof  [22 pts]
function gen_treehouse(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.size * 0.5;
  const ph = p.platformH;
  const wh = p.wallH;
  // Corner pillars: ground → mid → platform level (3 pts × 4 corners = 12)
  ([[-s,-s],[s,-s],[s,s],[-s,s]] as [number,number][]).forEach(([x,z]) => {
    pts.push({x, y:0, z});
    pts.push({x, y:ph*0.55, z});
    pts.push({x, y:ph, z});
  });
  // Platform mid-edge markers (4 pts)
  pts.push({x:-s, y:ph, z:0}); pts.push({x:s, y:ph, z:0});
  pts.push({x:0, y:ph, z:-s}); pts.push({x:0, y:ph, z:s});
  // Wall corners above platform (4 pts)
  ([[-s,-s],[s,-s],[s,s],[-s,s]] as [number,number][]).forEach(([x,z]) =>
    pts.push({x, y:ph+wh, z})
  );
  // A-frame roof ridge (2 pts)
  pts.push({x:-s*0.8, y:ph+wh+wh*0.65, z:0});
  pts.push({x:s*0.8,  y:ph+wh+wh*0.65, z:0});
  return pts; // 22 pts
}

// MILITARY CHECKPOINT — zigzag barriers + guard nests + towers + approach  [9 pts]
function gen_checkpoint(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const w = p.width, d = p.depth;
  // Staggered barrier zigzag
  pts.push({x:-w*0.33, y:0, z:-d*0.2});
  pts.push({x:0,       y:0, z: d*0.1});
  pts.push({x: w*0.33, y:0, z:-d*0.2});
  // Guard sandbag nests (flanking)
  pts.push({x:-w*0.55, y:0, z:-d*0.45});
  pts.push({x: w*0.55, y:0, z:-d*0.45});
  // Watchtowers (rear)
  pts.push({x:-w*0.45, y:0, z:-d*0.9});
  pts.push({x: w*0.45, y:0, z:-d*0.9});
  // Approach channel markers
  pts.push({x:-w*0.2, y:0, z:d*0.5});
  pts.push({x: w*0.2, y:0, z:d*0.5});
  return pts; // 9 pts
}

// WATCHTOWER TRIANGLE — equilateral triangle of towers + wall midpoints + centre  [7 pts]
function gen_watchtower_post(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius;
  const towers: [number,number][] = [
    [0, -r],
    [r*Math.sin(Math.PI*2/3), r*Math.cos(Math.PI*2/3)],
    [r*Math.sin(Math.PI*4/3), r*Math.cos(Math.PI*4/3)],
  ];
  towers.forEach(([x,z]) => pts.push({x, y:0, z}));
  for (let i=0;i<3;i++) {
    const [ax,az]=towers[i], [bx,bz]=towers[(i+1)%3];
    pts.push({x:(ax+bx)/2, y:0, z:(az+bz)/2});
  }
  pts.push({x:0, y:0, z:0});
  return pts; // 7 pts
}

// FUEL DEPOT — canopy + storage tanks + cylindrical pumps + barrier + guards  [10 pts]
function gen_fuel_depot(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.size;
  pts.push({x:0,        y:0, z:-s*0.25}); // canopy
  pts.push({x:-s*0.3,   y:0, z: s*0.3});  // big tank L
  pts.push({x: s*0.3,   y:0, z: s*0.3});  // big tank R
  pts.push({x:-s*0.18,  y:0, z: s*0.55}); // cylinder L
  pts.push({x: s*0.18,  y:0, z: s*0.55}); // cylinder R
  pts.push({x:-s*0.4,   y:0, z:-s*0.55}); // barrier L
  pts.push({x:0,        y:0, z:-s*0.45}); // barrier C
  pts.push({x: s*0.4,   y:0, z:-s*0.55}); // barrier R
  pts.push({x:-s*0.65,  y:0, z:-s*0.3});  // guard L
  pts.push({x: s*0.65,  y:0, z:-s*0.3});  // guard R
  return pts; // 10 pts
}

// SNIPER NEST — irregular rock pentagon base + elevated shooting perch  [8 pts]
function gen_sniper_nest(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius, h = p.height;
  const varR = [1.0, 0.85, 1.1, 0.9, 1.05];
  for (let i=0;i<5;i++) {
    const a = Math.PI*2*i/5 - Math.PI/2;
    pts.push({x: r*varR[i]*Math.cos(a), y:0, z: r*varR[i]*Math.sin(a)});
  }
  pts.push({x:-r*0.4, y:h, z:-r*0.35}); // elevated firing L
  pts.push({x: r*0.4, y:h, z:-r*0.35}); // elevated firing R
  pts.push({x:0,      y:0, z: r*1.4});   // concealed approach rock
  return pts; // 8 pts
}

// RURAL FARMSTEAD — house corners + barn corners + silo + well + fence posts  [16 pts]
function gen_farmstead(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.size;
  // Main house (small rectangle, left side)
  const hx=-s*0.35,hz=-s*0.2,hw=s*0.25,hd=s*0.2;
  ([[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]] as [number,number][]).forEach(([dx,dz]) =>
    pts.push({x:hx+dx, y:0, z:hz+dz})
  );
  // Barn (larger, right side)
  const bx=s*0.2,bz=s*0.1,bw=s*0.3,bd=s*0.28;
  ([[-bw,-bd],[bw,-bd],[bw,bd],[-bw,bd]] as [number,number][]).forEach(([dx,dz]) =>
    pts.push({x:bx+dx, y:0, z:bz+dz})
  );
  pts.push({x: s*0.55, y:0, z:-s*0.25}); // silo
  pts.push({x:-s*0.05, y:0, z:-s*0.02}); // well
  // Perimeter fence posts (6)
  for (let i=0;i<6;i++) {
    const a = Math.PI*2*i/6;
    pts.push({x:s*0.72*Math.cos(a), y:0, z:s*0.6*Math.sin(a)});
  }
  return pts; // 16 pts
}

// SURVIVOR CAMP — fire centre + tent ring + supply cluster + lookouts  [10 pts]
function gen_survivor_camp(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius;
  pts.push({x:0, y:0, z:0});           // central fireplace
  pts.push({x:0,  y:0, z:-r});         // N tent
  pts.push({x:r,  y:0, z:0});          // E tent
  pts.push({x:0,  y:0, z:r});          // S tent
  pts.push({x:-r, y:0, z:0});          // W tent
  pts.push({x:r*1.3,  y:0, z:-r*0.8}); // supply A
  pts.push({x:r*1.6,  y:0, z:-r*1.0}); // supply B
  pts.push({x:r*1.4,  y:0, z:-r*1.25});// supply C
  pts.push({x:-r*1.5, y:0, z:-r*1.0}); // lookout W
  pts.push({x: r*1.5, y:0, z: r*0.8}); // lookout E
  return pts; // 10 pts
}

// BUNKER DEFENCE LINE — parallel sandbag walls + command bunker + flankers  [11 pts]
function gen_bunker_line(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const l = p.length, w = p.width;
  const zPos = [-0.5,-0.17,0.17,0.5] as const;
  zPos.forEach(t => pts.push({x:-w*0.5, y:0, z:l*t})); // left wall
  zPos.forEach(t => pts.push({x: w*0.5, y:0, z:l*t})); // right wall
  pts.push({x:0,      y:0, z:l*0.65});  // command bunker
  pts.push({x:-w*1.3, y:0, z:l*0.55}); // flank bunker L
  pts.push({x: w*1.3, y:0, z:l*0.55}); // flank bunker R
  return pts; // 11 pts
}

// POWER RELAY STATION — 3 towers in row + storage tanks + substations  [8 pts]
function gen_power_relay(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const sp = p.spacing;
  pts.push({x:-sp, y:0, z:0});   // tower L
  pts.push({x:0,   y:0, z:0});   // tower C
  pts.push({x:sp,  y:0, z:0});   // tower R
  pts.push({x:-sp*0.4, y:0, z:sp*0.6}); // tank L
  pts.push({x: sp*0.4, y:0, z:sp*0.6}); // tank R
  pts.push({x:-sp*0.7, y:0, z:-sp*0.35}); // substation L
  pts.push({x:0,       y:0, z:-sp*0.35}); // substation C
  pts.push({x: sp*0.7, y:0, z:-sp*0.35}); // substation R
  return pts; // 8 pts
}

// RADIO OUTPOST — central mast + 3 guy-wire anchors + 2 instrument sheds  [6 pts]
function gen_radio_outpost(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius;
  pts.push({x:0, y:0, z:0}); // central mast
  [0,2,4].map(i => Math.PI*2*i/3 - Math.PI/2).forEach(a =>
    pts.push({x:r*Math.cos(a), y:0, z:r*Math.sin(a)})
  );
  pts.push({x:-r*0.5, y:0, z:-r*0.35}); // instrument shed L
  pts.push({x: r*0.5, y:0, z:-r*0.35}); // instrument shed R
  return pts; // 6 pts
}

// ─── 🤖 TRANSFORMER MECHS — Movie-accurate humanoid robot point clouds ─────────
// Shared low-level drawing primitives used by all 7 character generators
function _tfRing(pts: Point3D[], cx: number, cy: number, cz: number, rx: number, rz: number, n: number) {
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 2 * i / n;
    pts.push({ x: cx + rx * Math.cos(a), y: cy, z: cz + rz * Math.sin(a) });
  }
}
function _tfCol(pts: Point3D[], x: number, z: number, y0: number, y1: number, n: number) {
  for (let i = 0; i <= n; i++) pts.push({ x, y: y0 + (y1 - y0) * i / n, z });
}
function _tfBox(pts: Point3D[], cx: number, cy: number, cz: number, w: number, h: number, d: number, slices = 3) {
  const hw = w / 2, hd = d / 2;
  for (let i = 0; i <= slices; i++) {
    const y = cy + h * i / slices;
    pts.push({ x: cx - hw, y, z: cz - hd }, { x: cx + hw, y, z: cz - hd },
              { x: cx - hw, y, z: cz + hd }, { x: cx + hw, y, z: cz + hd });
  }
  [0, h].forEach(dy => {
    for (let i = 0; i <= 3; i++) {
      const t = i / 3;
      pts.push({ x: cx - hw + w * t, y: cy + dy, z: cz - hd },
               { x: cx - hw + w * t, y: cy + dy, z: cz + hd },
               { x: cx - hw, y: cy + dy, z: cz - hd + d * t },
               { x: cx + hw, y: cy + dy, z: cz - hd + d * t });
    }
  });
}
// Shared mech body builder — called by each character generator
interface TFConfig {
  H: number;        // total height (m)
  chW: number;      // chest width
  chD: number;      // chest depth
  legSp: number;    // half-distance between legs
  legW: number;     // leg width
  armX: number;     // arm x offset from chest edge
  canon: 0|1|2;     // 0=none, 1=right arm, 2=both arms
  wings: number;    // wing span each side (0=none)
  stacks: boolean;  // smokestack columns on shoulders (truck)
  grill: boolean;   // truck grille rows on chest
  jetNose: boolean; // jet cockpit plate on chest
  medCross: boolean;// medical cross on chest
  headType: 0|1|2|3;// 0=round/bee, 1=bucket/prime, 2=seeker/jet, 3=alien/megatron
  headW: number;    // head width
  headH: number;    // head height
  spoiler: boolean; // rear spoiler wing (Jazz)
}
function _buildMechPts(c: TFConfig): Point3D[] {
  const pts: Point3D[] = [];
  const H = c.H;
  // Y breakpoints (bottom up)
  const fY  = 0,       anY = H*.10, knY = H*.27, hipY = H*.43,
        wstY= H*.51,   chBY= H*.54, chTY= H*.79, shY = H*.81,
        nkY = H*.84,   hdBY= H*.87, hdTY= H*1.0;
  const chH = chTY - chBY;

  // ── FEET (wide toe, forward-pointing)
  [-c.legSp, c.legSp].forEach(lx => {
    for (let i = 0; i <= 3; i++) pts.push({ x: lx, y: fY, z: -c.chD * .6 + i * c.chD * .4 });
    pts.push({ x: lx - c.legW * .7, y: fY, z: -c.chD * .6 },
             { x: lx + c.legW * .7, y: fY, z: -c.chD * .6 });
    _tfCol(pts, lx, -c.chD * .25, fY, anY, 2);
  });

  // ── LOWER LEGS / SHINS
  [-c.legSp, c.legSp].forEach(lx => {
    for (let i = 0; i <= 5; i++) {
      const y = anY + (knY - anY) * i / 5;
      pts.push({ x: lx - c.legW, y, z: -c.chD * .28 },
               { x: lx + c.legW, y, z: -c.chD * .28 });
      if (i === 0 || i === 5) {
        pts.push({ x: lx - c.legW, y, z: c.chD * .28 },
                 { x: lx + c.legW, y, z: c.chD * .28 });
      }
    }
  });

  // ── KNEES (protruding front plates)
  [-c.legSp, c.legSp].forEach(lx => {
    _tfRing(pts, lx, knY, -c.chD * .4, c.legW * .7, c.legW * .4, 6);
    pts.push({ x: lx, y: knY + H * .02, z: -c.chD * .55 });
  });

  // ── THIGHS (slightly wider than shins, taper toward knee)
  [-c.legSp, c.legSp].forEach(lx => {
    for (let i = 0; i <= 5; i++) {
      const t = i / 5, y = knY + (hipY - knY) * t;
      const tw = c.legW * (.9 + .25 * t);
      pts.push({ x: lx - tw, y, z: -c.chD * .25 },
               { x: lx + tw, y, z: -c.chD * .25 });
      if (i === 0 || i === 5) pts.push({ x: lx, y, z: c.chD * .25 });
    }
  });

  // ── PELVIS (hip plate)
  const pelW = c.legSp * 2.2;
  _tfBox(pts, 0, hipY, 0, pelW, H * .05, c.chD * .8, 2);
  // crotch
  _tfCol(pts, 0, 0, hipY - H * .03, hipY, 2);

  // ── WAIST (narrow barrel joint)
  _tfRing(pts, 0, wstY, 0, c.chW * .22, c.chD * .22, 7);
  _tfRing(pts, 0, wstY + H * .015, 0, c.chW * .26, c.chD * .26, 7);

  // ── CHEST (main hero torso box — wider toward shoulders)
  for (let i = 0; i <= 6; i++) {
    const t = i / 6, y = chBY + chH * t;
    const cw = c.chW * (.75 + .25 * t);
    pts.push({ x: -cw / 2, y, z: -c.chD / 2 }, { x: cw / 2, y, z: -c.chD / 2 });
    if (i === 0 || i === 6) {
      pts.push({ x: -cw / 2, y, z: c.chD / 2 }, { x: cw / 2, y, z: c.chD / 2 });
    }
    if (i % 2 === 0) pts.push({ x: 0, y, z: -c.chD / 2 - .1 }); // front midline
  }
  // chest back vertical edges
  _tfCol(pts, -c.chW / 2, c.chD / 2, chBY, chTY, 4);
  _tfCol(pts,  c.chW / 2, c.chD / 2, chBY, chTY, 4);

  // Truck grille (Optimus/Ironhide)
  if (c.grill) {
    for (let row = 0; row < 5; row++) {
      const gy = chBY + chH * (.12 + row * .16);
      for (let col = -3; col <= 3; col++) {
        pts.push({ x: col * c.chW * .12, y: gy, z: -c.chD / 2 - .08 });
      }
    }
  }
  // Jet cockpit plate (Starscream)
  if (c.jetNose) {
    const jy = chBY + chH * .5;
    for (let i = -2; i <= 2; i++) pts.push({ x: i * c.chW * .1, y: jy + i * H * .018, z: -c.chD / 2 - H * .035 });
    pts.push({ x: 0, y: jy - H * .05, z: -c.chD / 2 - H * .07 }); // nose tip
  }
  // Medical cross (Ratchet)
  if (c.medCross) {
    const my = chBY + chH * .5;
    [-1, 0, 1].forEach(dx => pts.push({ x: dx * c.chW * .12, y: my, z: -c.chD / 2 - .05 }));
    [-1, 0, 1].forEach(dy => pts.push({ x: 0, y: my + dy * H * .04, z: -c.chD / 2 - .05 }));
  }

  // ── SHOULDERS (angular armor pads)
  [-1, 1].forEach(side => {
    const sx = side * (c.chW / 2 + H * .035);
    _tfRing(pts, sx, shY, 0, H * .04, H * .035, 6);
    // shoulder armor plate — faces outward
    for (let i = 0; i <= 3; i++) {
      pts.push({ x: sx + side * H * .02 * i / 3, y: shY - H * .03 * i, z: -c.chD * .3 });
    }
    // smokestack columns on shoulder (Optimus/truck type)
    if (c.stacks) {
      for (let si = 0; si <= 5; si++) {
        pts.push({ x: sx + side * H * .025, y: chTY + si * H * .07, z: c.chD * .35 });
      }
    }
  });

  // ── UPPER ARMS (extend outward from shoulder then drop)
  [-1, 1].forEach(side => {
    const ax = side * (c.chW / 2 + c.armX);
    const armTopY = shY - H * .03;
    // horizontal segment (from body to elbow)
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      pts.push({ x: side * (c.chW / 2 + H * .035 + c.armX * .5 * t), y: armTopY - H * .025 * t, z: -H * .02 },
               { x: side * (c.chW / 2 + H * .035 + c.armX * .5 * t), y: armTopY - H * .025 * t, z:  H * .015 });
    }
    // elbow ring
    _tfRing(pts, ax, armTopY - H * .12, -H * .02, H * .028, H * .02, 5);
    // forearm — drops down from elbow
    const elbY = armTopY - H * .12;
    for (let i = 0; i <= 5; i++) {
      const y = elbY - H * .18 * i / 5;
      pts.push({ x: ax - H * .022, y, z: -H * .018 },
               { x: ax + H * .022, y, z: -H * .018 });
    }
    // cannon barrel on arm (Megatron=right huge, Ironhide=both)
    if ((c.canon === 1 && side === 1) || c.canon === 2) {
      const canY = elbY - H * .12;
      for (let i = 0; i <= 5; i++) {
        pts.push({ x: ax + side * H * .06 * (i / 5), y: canY - H * .04 * i / 5, z: -H * .045 - i * H * .025 });
      }
      // cannon muzzle ring
      _tfRing(pts, ax + side * H * .06, canY - H * .04, -H * .16, H * .03, H * .02, 6);
    }
    // hand / fist
    _tfRing(pts, ax, elbY - H * .21, -H * .018, H * .025, H * .018, 5);
    pts.push({ x: ax, y: elbY - H * .26, z: -H * .02 }); // lower fist point
  });

  // ── WINGS (Starscream / flying types)
  if (c.wings > 0) {
    [-1, 1].forEach(side => {
      // main wing spar — sweeps back and out
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        pts.push({ x: side * (c.chW / 2 + c.wings * t), y: shY - H * .06 * t, z: c.chD * .3 + H * .12 * t });
      }
      // leading edge strip
      for (let i = 0; i <= 4; i++) {
        const t = i / 4;
        pts.push({ x: side * (c.chW / 2 + c.wings * (.5 + .5 * t)), y: shY - H * .09, z: c.chD * .1 + H * .06 * t });
      }
      // wing tip point
      pts.push({ x: side * (c.chW / 2 + c.wings + H * .05), y: shY - H * .12, z: c.chD * .3 + H * .18 });
    });
  }

  // Rear spoiler (Jazz)
  if (c.spoiler) {
    for (let i = -2; i <= 2; i++) {
      pts.push({ x: i * c.chW * .25, y: chTY + H * .04, z: c.chD * .55 });
    }
    _tfCol(pts, -c.chW * .4, c.chD * .5, chTY, chTY + H * .035, 2);
    _tfCol(pts,  c.chW * .4, c.chD * .5, chTY, chTY + H * .035, 2);
  }

  // ── NECK
  _tfCol(pts, 0, -H * .01, nkY, hdBY, 2);

  // ── HEAD — 4 distinctive styles
  switch (c.headType) {
    case 0: { // Round helm with visor + antennae (Bumblebee / Jazz / Ironhide / Ratchet)
      const hR = c.headW / 2;
      _tfRing(pts, 0, hdBY + c.headH * .3, -hR * .4, hR, hR * .7, 8);
      _tfRing(pts, 0, hdBY + c.headH * .7, -hR * .3, hR * .75, hR * .5, 8);
      pts.push({ x: 0, y: hdTY, z: 0 }); // crown top
      // visor strip (eyes)
      for (let i = -3; i <= 3; i++) pts.push({ x: i * hR * .25, y: hdBY + c.headH * .4, z: -hR - .05 });
      // antennae
      pts.push({ x: -hR * .6, y: hdTY + H * .015, z: -hR * .3 });
      pts.push({  x: hR * .6, y: hdTY + H * .015, z: -hR * .3 });
      break;
    }
    case 1: { // Bucket helmet (Optimus Prime)
      const hw = c.headW / 2, hd2 = c.chD * .38;
      _tfBox(pts, 0, hdBY, 0, c.headW, c.headH, hd2 * 2, 3);
      // face plate / mouthguard strip
      for (let i = -2; i <= 2; i++) pts.push({ x: i * hw * .4, y: hdBY + c.headH * .3, z: -hd2 - .05 });
      // eye slots
      pts.push({ x: -hw * .4, y: hdBY + c.headH * .65, z: -hd2 - .05 });
      pts.push({  x: hw * .4, y: hdBY + c.headH * .65, z: -hd2 - .05 });
      // crest fin
      _tfCol(pts, 0, -hd2 * .3, hdBY + c.headH, hdBY + c.headH + H * .025, 2);
      pts.push({ x: -hw * .2, y: hdTY + H * .01, z: -hd2 * .3 });
      pts.push({  x: hw * .2, y: hdTY + H * .01, z: -hd2 * .3 });
      break;
    }
    case 2: { // Seeker jet helm (Starscream — swept crown ridge, angular)
      const hR2 = c.headW / 2;
      _tfRing(pts, 0, hdBY + c.headH * .35, -hR2 * .35, hR2, hR2 * .65, 8);
      _tfRing(pts, 0, hdBY + c.headH * .72, -hR2 * .25, hR2 * .65, hR2 * .45, 8);
      // swept-back crown ridge
      for (let i = 0; i <= 4; i++) {
        pts.push({ x: 0, y: hdBY + c.headH * (.7 + i * .1), z: -hR2 * .2 + i * hR2 * .35 });
      }
      // lateral intake bumps
      pts.push({ x: -hR2 * .85, y: hdBY + c.headH * .5, z: 0 });
      pts.push({  x: hR2 * .85, y: hdBY + c.headH * .5, z: 0 });
      // red eye visor
      for (let i = -2; i <= 2; i++) pts.push({ x: i * hR2 * .28, y: hdBY + c.headH * .42, z: -hR2 - .05 });
      break;
    }
    case 3: { // Alien angular helm (Megatron — no face, spiked)
      const hw = c.headW / 2;
      [[-hw,-c.chD*.3],[hw,-c.chD*.3],[-hw,c.chD*.3],[hw,c.chD*.3]].forEach(([hx,hz]) => {
        pts.push({ x: hx, y: hdBY, z: hz });
        pts.push({ x: hx * .6, y: hdTY - H * .02, z: hz * .6 });
      });
      // swept crown spike
      pts.push({ x: 0, y: hdTY, z: -c.chD * .15 });
      pts.push({ x: 0, y: hdTY + H * .03, z: 0 });
      // red eye slot
      for (let i = -3; i <= 3; i++) pts.push({ x: i * hw * .22, y: hdBY + c.headH * .55, z: -c.chD * .35 });
      // lateral face spikes
      pts.push({ x: -hw - H * .02, y: hdBY + c.headH * .5, z: -c.chD * .1 });
      pts.push({  x: hw + H * .02, y: hdBY + c.headH * .5, z: -c.chD * .1 });
      break;
    }
  }
  return pts;
}

// ── Individual character generators ──────────────────────────────────────────

function gen_tf_bumblebee(p: Record<string, number>): Point3D[] {
  // Chevy Camaro car-mech — compact, wide chest, sporty legs, visor helm, antennae
  const s = p.scale ?? 1;
  const H = 12 * s;
  const pts = _buildMechPts({
    H, chW: 4.8 * s, chD: 2.0 * s, legSp: 1.6 * s, legW: 0.9 * s,
    armX: H * .065, canon: 0, wings: 0, stacks: false,
    grill: false, jetNose: false, medCross: false, spoiler: false,
    headType: 0, headW: H * .1, headH: H * .13,
  });
  // Car hood chest plate (Camaro stripe)
  for (let i = -1; i <= 1; i++) {
    const gy = H * .55 + H * .06 * (i + 1);
    pts.push({ x: i * H * .04, y: gy, z: -H * .111 }, { x: 0, y: gy + H * .03, z: -H * .11 - .05 });
  }
  // Door wings folded onto back/sides
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 3; i++) {
      pts.push({ x: side * (2.5 * s + i * s * .25), y: H * .72 - i * H * .04, z: H * .085 + i * .1 });
    }
  });
  // Shoulder wheel arches
  [-1, 1].forEach(side => {
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * 2 * i / 6;
      pts.push({ x: side * (2.4 * s + .55 * s * Math.cos(a)), y: H * .73 + .55 * s * Math.sin(a), z: 0 });
    }
  });
  return pts;
}

function gen_tf_optimus(p: Record<string, number>): Point3D[] {
  // Peterbilt 379 semi-truck mech — tallest, massive chest, bucket helm, smoke stacks
  const s = p.scale ?? 1;
  const H = 16 * s;
  const pts = _buildMechPts({
    H, chW: 6.5 * s, chD: 2.6 * s, legSp: 2.0 * s, legW: 1.2 * s,
    armX: H * .08, canon: 0, wings: 0, stacks: true,
    grill: true, jetNose: false, medCross: false, spoiler: false,
    headType: 1, headW: H * .105, headH: H * .13,
  });
  // Truck front bumper at feet
  for (let i = -3; i <= 3; i++) pts.push({ x: i * s * .5, y: 0, z: -1.5 * s });
  // Fuel tank cylinders at hip sides
  [-1, 1].forEach(side => {
    for (let i = 0; i < 5; i++) {
      const a = Math.PI * i / 4;
      pts.push({ x: side * (3.5 * s + .5 * s * Math.cos(a)), y: H * .43, z: .5 * s * Math.sin(a) });
    }
  });
  // Windshield plate above grille
  for (let i = -2; i <= 2; i++) pts.push({ x: i * s * .7, y: H * .76, z: -H * .145 });
  return pts;
}

function gen_tf_ironhide(p: Record<string, number>): Point3D[] {
  // GMC Topkick off-road truck mech — bulkiest build, dual forearm cannons
  const s = p.scale ?? 1;
  const H = 13 * s;
  const pts = _buildMechPts({
    H, chW: 6.0 * s, chD: 2.4 * s, legSp: 2.1 * s, legW: 1.2 * s,
    armX: H * .09, canon: 2, wings: 0, stacks: false,
    grill: true, jetNose: false, medCross: false, spoiler: false,
    headType: 0, headW: H * .115, headH: H * .14,
  });
  // Extra armour plates on thighs
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 3; i++) {
      pts.push({ x: side * (2.3 * s + H * .01), y: H * (.27 + i * .04), z: -H * .025 - .1 });
    }
  });
  // Wheel wells on shins
  [-1, 1].forEach(side => {
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * 2 * i / 6;
      pts.push({ x: side * (2.1 * s + .6 * s * Math.cos(a)), y: H * .17 + .6 * s * Math.sin(a), z: H * .02 });
    }
  });
  return pts;
}

function gen_tf_jazz(p: Record<string, number>): Point3D[] {
  // Pontiac Solstice sports-car mech — slender, athletic, rear spoiler
  const s = p.scale ?? 1;
  const H = 12 * s;
  const pts = _buildMechPts({
    H, chW: 4.2 * s, chD: 1.8 * s, legSp: 1.4 * s, legW: 0.75 * s,
    armX: H * .06, canon: 0, wings: 0, stacks: false,
    grill: false, jetNose: false, medCross: false, spoiler: true,
    headType: 0, headW: H * .09, headH: H * .12,
  });
  // Solstice racing stripe on chest
  for (let i = -4; i <= 4; i++) {
    pts.push({ x: i * H * .03, y: H * .62 + Math.abs(i) * H * .015, z: -H * .092 - .05 });
  }
  // Slim ankle spoilers
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 2; i++) pts.push({ x: side * (1.5 * s + i * .3 * s), y: H * .08, z: .4 * s });
  });
  return pts;
}

function gen_tf_ratchet(p: Record<string, number>): Point3D[] {
  // Hummer H2 rescue mech — stocky, blocky, medical cross, search-and-rescue gear
  const s = p.scale ?? 1;
  const H = 12 * s;
  const pts = _buildMechPts({
    H, chW: 5.6 * s, chD: 2.3 * s, legSp: 1.9 * s, legW: 1.1 * s,
    armX: H * .07, canon: 0, wings: 0, stacks: false,
    grill: true, jetNose: false, medCross: true, spoiler: false,
    headType: 0, headW: H * .115, headH: H * .14,
  });
  // Roof-rack sensor array on top of chest
  for (let i = -3; i <= 3; i++) {
    pts.push({ x: i * s * .6, y: H * .8 + H * .025, z: H * .08 });
    if (Math.abs(i) <= 1) pts.push({ x: i * s * .6, y: H * .8 + H * .065, z: H * .08 });
  }
  // Heavy shoulder pads (roof sections)
  [-1, 1].forEach(side => {
    _tfBox(pts, side * (3.0 * s), H * .78, H * .06, 1.2 * s, H * .05, H * .12, 1);
  });
  return pts;
}

function gen_tf_megatron(p: Record<string, number>): Point3D[] {
  // Cybertronian jet / tank leader — alien angular build, massive right fusion cannon
  const s = p.scale ?? 1;
  const H = 15 * s;
  const pts = _buildMechPts({
    H, chW: 4.5 * s, chD: 2.0 * s, legSp: 1.7 * s, legW: 1.0 * s,
    armX: H * .11, canon: 1, wings: 0, stacks: false,
    grill: false, jetNose: false, medCross: false, spoiler: false,
    headType: 3, headW: H * .105, headH: H * .14,
  });
  // Alien chest spines / Cybertronian armour plates
  for (let i = -2; i <= 2; i++) {
    pts.push({ x: i * H * .05, y: H * .7 + Math.abs(i) * H * .015, z: -H * .105 - .06 });
  }
  // Fusion cannon housing (right shoulder extension)
  for (let i = 0; i <= 5; i++) {
    pts.push({ x: H * .33 + i * H * .035, y: H * .72 - i * H * .01, z: -H * .04 });
  }
  _tfRing(pts, H * .5, H * .67, -H * .04, H * .055, H * .04, 7);
  // Leg armour spines
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 3; i++) {
      pts.push({ x: side * (1.7 * s + i * H * .012), y: H * (.28 + i * .03), z: -H * .032 - .05 });
    }
  });
  // Jet alt-mode wing stubs on back
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 3; i++) {
      pts.push({ x: side * (2.3 * s + i * H * .02), y: H * .65 - i * H * .02, z: H * .1 + i * H * .04 });
    }
  });
  return pts;
}

function gen_tf_starscream(p: Record<string, number>): Point3D[] {
  // F-22 Raptor air commander — lean frame, massive swept wings, jet cockpit chest
  const s = p.scale ?? 1;
  const H = 14 * s;
  const pts = _buildMechPts({
    H, chW: 4.0 * s, chD: 1.9 * s, legSp: 1.5 * s, legW: 0.85 * s,
    armX: H * .07, canon: 0, wings: 6.0 * s, stacks: false,
    grill: false, jetNose: true, medCross: false, spoiler: false,
    headType: 2, headW: H * .095, headH: H * .125,
  });
  // Vertical tail fins on back
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 4; i++) {
      pts.push({ x: side * (s * 1.0 + i * s * .15), y: H * .75 + i * H * .05, z: H * .1 });
    }
    // tail fin tip
    pts.push({ x: side * (1.6 * s), y: H * .97, z: H * .1 });
  });
  // Leg-mounted missile pods
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 2; i++) {
      pts.push({ x: side * (1.5 * s), y: H * (.13 + i * .04), z: -H * .032 - .06 });
    }
  });
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
