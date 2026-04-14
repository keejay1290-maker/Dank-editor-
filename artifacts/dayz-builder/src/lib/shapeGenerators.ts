import { MAX_OBJECTS } from "./constants";
import { getShapePoints2 } from "./shapeGenerators2";
import * as MP from "./shapeMasterpieces";
import { SHAPE_DEFS } from "./shapeParams";
import { Point3D } from "./types";
export type { Point3D };

function rotYapply(x: number, z: number, deg: number): [number, number] {
  const r = deg * Math.PI / 180;
  return [x * Math.cos(r) - z * Math.sin(r), x * Math.sin(r) + z * Math.cos(r)];
}

/**
 * 🪜 STAIR HELPER
 * Ensures consistent spiral/straight staircase materialization
 */
export function placeStairs(pts: Point3D[], centerX: number, centerZ: number, startY: number, height: number, steps: number, radius = 5): void {
    for (let i = 0; i < steps; i++) {
        const ratio = i / steps;
        const angle = ratio * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const z = centerZ + Math.sin(angle) * radius;
        const y = startY + ratio * height;
        pts.push({ x, y, z });
    }
}

// 🛡️ Parameter Fallback Helper
function d(params: Record<string, number>, key: string, def: number): number {
  const v = params[key];
  return (v !== undefined && v > 0 && !isNaN(v)) ? v : def;
}

export function getShapePoints(shapeType: string, params: Record<string, number>): Point3D[] {
  return getRawPoints(shapeType, params).slice(0, MAX_OBJECTS);
}

function getRawPoints(shapeType: string, params: Record<string, number>): Point3D[] {
  // 🛡️ Parameter Hardening: Inject defaults from SHAPE_DEFS if params are missing/NaN
  const def = (SHAPE_DEFS as any)[shapeType];
  const p = { ...params };

  // Global Structural Minimums (Prevents Degenerate/Zero-Point Builds)
  const structuralDefaults: Record<string, number> = {
    radius: 10, width: 20, height: 10, length: 20, depth: 20,
    segments: 12, rows: 5, cols: 5, latSegs: 8, lonSegs: 16,
    thickness: 2, scale: 1, count: 5, tiers: 3, floor: 1, roofs: 1
  };

  // 1. First Pass: Apply SHAPE_DEFS
  if (def && def.params) {
    for (const pd of def.params) {
      if (p[pd.id] === undefined || isNaN(p[pd.id])) {
        p[pd.id] = pd.val;
      }
    }
  }

  // 2. Second Pass: Apply Global Structural Minimums for missing keys used by generators
  Object.keys(structuralDefaults).forEach(key => {
    if (p[key] === undefined || isNaN(p[key])) {
      p[key] = structuralDefaults[key];
    }
  });

  // 🚀 FIX 2: Optimized density for Death Star (Target: ~1200 objects)
  if (shapeType === 'deathstar' || shapeType === 'death_star') {
    p.radius = d(p, 'radius', 40);
    p.latSegs = d(p, 'latSegs', 24); 
    p.lonSegs = d(p, 'lonSegs', 48);
  }

  // 🚀 FIX 4: Coordinate Enforcement (NWAF & Krasno)
  // Ensure builds at specific regions materialise above ground
  if (p.posX > 4000 && p.posX < 4100) { p.posY = 340; } // NWAF Plateau
  if (p.posX > 11900 && p.posX < 12000) { p.posY = 140; } // Krasno Airfield

  switch (shapeType) {
    // 🧱 PRIMITIVES (Core Geometry)
    case 'sphere':
    case 'full_sphere':
    case 'fullsphere':
    case 'complete_sphere':
    case 'sphere_full':         return gen_sphere(p, false);
    case 'hemisphere':          return gen_sphere(p, true);
    case 'cylinder':            return gen_cylinder(p);
    case 'cone':                return gen_cone(p);
    case 'torus':
    case 'ring':
    case 'ring_gate':
    case 'torus_gate':          return gen_torus(p);
    case 'disc':
    case 'platform':            return gen_disc(p);
    case 'cube':
    case 'box':                 return gen_bastion_square(p);
    case 'line':                return gen_wall_line(p);
    case 'arc':
    case 'wall_arc':            return gen_wall_arc(p);
    case 'cluster':             return gen_sphere(p, false); // Best fallback for cluster
    case 'spoke_hub':           return gen_ring_platform(p); 
    case 'helix':
    case 'dna_spiral':          return gen_helix(p);
    case 'hyperboloid':         return gen_hyperboloid(p);
    case 'mobius':
    case 'mobius_strip':        return gen_mobius(p);
    case 'icosphere':           return gen_icosphere(p);
    case 'dna_double':          return gen_dna_double(p);
    case 'celtic_ring':         return MP.gen_celtic_ring(p);
    
    // 🏛️ ARCHITECTURE (Canonical)
    case 'star_fort': return gen_star_fort(p);
    case 'pyramid_stepped': return gen_pyramid_stepped(p);
    case 'prison_tower': return gen_prison_tower(p);
    case 'azkaban_tower': return gen_azkaban_tower(p);
    case 'skyscraper': return gen_skyscraper(p);
    case 'wall_perimeter': return gen_wall_perimeter(p);
    case 'colosseum': return MP.gen_colosseum(p);
    case 'colosseum_complex': return MP.gen_colosseum(p);
    case 'castle_keep': return gen_castle_keep(p);
    case 'gothic_arch': return gen_gothic_arch(p);
    case 'bridge_truss': return gen_bridge_truss(p);
    case 'amphitheater': return gen_amphitheater(p);
    case 'vaulted_ceiling': return gen_vaulted_ceiling(p);
    case 'pitched_roof': return gen_pitched_roof(p);
    case 'staircase': return gen_staircase(p);
    case 'pyramid': return gen_pyramid(p);
    
    // 🪐 MASTERPIECES (Redirects to MP engine)
    case 'big_ben':
    case 'elizabeth_tower': return MP.gen_big_ben(p);
    case 'statue_liberty': return MP.gen_statue_liberty(p);
    case 'xwing':
    case 'x_wing': return MP.gen_xwing(p);
    case 'christ_redeemer': return MP.gen_christ_redeemer(p);
    case 'hogwarts': return MP.gen_hogwarts(p);
    case 'sydney_opera': return MP.gen_sydney_opera(p);
    case 'space_needle': return MP.gen_space_needle(p);
    case 'cn_tower': return MP.gen_cn_tower(p);
    case 'leaning_pisa':
    case 'tower_pisa':
    case 'pisa': return MP.gen_leaning_pisa(p);
    case 'sagrada_familia': return MP.gen_sagrada_familia(p);
    case 'arc_triomphe': return MP.gen_arc_triomphe(p);
    case 'parthenon': return MP.gen_parthenon(p);
    case 'deathstar':
    case 'death_star': return MP.gen_death_star(p);
    case 'millennium_falcon': return MP.gen_millennium_falcon(p);
    case 'stargate_portal': 
    case 'stargate': return MP.gen_stargate_portal(p);
    case 'helms_deep': 
    case 'helms_deep_gate':
    case 'helms_deep_keep': return MP.gen_helms_deep(p);
    case 'azkaban':
    case 'azkaban_prison': return MP.gen_azkaban_prison(p);
    case 'normandy_bunkers': return MP.gen_normandy_bunkers(p);
    case 'taj_mahal': return MP.gen_taj_mahal(p);
    case 'pyramid_giza': return MP.gen_pyramid_giza(p);
    case 'stonehenge': return MP.gen_stonehenge(p);
    case 'matrix_zion_dock':
    case 'zion_dock': return MP.gen_matrix_zion_dock(p);
    case 'halo_control_room': return MP.gen_halo_control_room(p);
    case 'nakatomi_plaza': return MP.gen_nakatomi_plaza(p);
    case 'jurassic_park_gate': return MP.gen_jurassic_park_gate(p);
    case 'peach_castle': return MP.gen_peach_castle(p);
    case 'shinra_hq': return MP.gen_shinra_hq(p);
    case 'orbital_station': return MP.gen_orbital_station(p);
    case 'borg_cube': return gen_borg_cube(p);
    case 'star_destroyer': return MP.gen_star_destroyer(p);
    case 'starship_enterprise': return MP.gen_starship_enterprise(p);
    case 'king_kong_empire': return MP.gen_king_kong_empire(p);
    case 'eye_of_sauron': return MP.gen_eye_of_sauron(p);
    case 'avengers_tower': 
    case 'stark_tower': 
    case 'tony_stark_tower': return MP.gen_tony_stark_tower(p);
    case 'police_station': return MP.gen_police_station(p);
    case 'hospital': return MP.gen_hospital(p);
    case 'supermarket': return MP.gen_supermarket(p);
    case 'log_cabin': return MP.gen_log_cabin(p);
    case 'black_hole': return MP.gen_black_hole(p);
    case 'alcatraz_prison': return MP.gen_alcatraz_prison(p);
    case 'roman_aqueduct': return MP.gen_roman_aqueduct(p);
    case 'military_fob': return MP.gen_military_fob(p);
    case 'checkpoint_charlie': return MP.gen_checkpoint_charlie(p);
    case 'trench_network': return MP.gen_trench_network(p);
    case 'crop_circle': return MP.gen_crop_circle(p);
    case 'shipwreck': return MP.gen_shipwreck(p);
    case 'deep_sea_oil_rig': 
    case 'oil_rig': return MP.gen_oil_rig(p);
    case 'bunker_complex': return MP.gen_bunker_line(p);
    case 'the_wall_game_of_thrones': return MP.gen_the_wall_game_of_thrones(p);
    case 'minas_tirith_tier': 
    case 'minas_tirith_wall':
    case 'minas_tirith': return MP.gen_minas_tirith(p);
    case 'panama_canal_locks': 
    case 'panama_canal': return MP.gen_panama_canal_locks(p);
    case 'airport_runway': return MP.gen_airport_runway(p);
    case 'bunker_complex_entrance': 
    case 'bunker_entrance': return MP.gen_bunker_complex_entrance(p);
    case 'medieval_fort': return MP.gen_medieval_fort(p);
    case 'bridge_of_khazad_dum': return MP.gen_bridge_of_khazad_dum(p);
    case 'fortress_of_solitude': return MP.gen_fortress_of_solitude(p);
    case 'wall_maria': return MP.gen_wall_maria(p);
    case 'barad_dur': return MP.gen_barad_dur(p);
    case 'tardis': return MP.gen_tardis(p);
    case 'nuketown': return MP.gen_nuketown(p);
    case 'dust2_a_site': return MP.gen_dust2_a_site(p);
    case 'golden_gate_bridge': return MP.gen_golden_gate_bridge(p);
    case 'the_pentagon': return MP.gen_the_pentagon(p);
    case 'atat_walker': 
    case 'at_at_walker': return MP.gen_atat_walker(p);
    case 'crashed_ufo':
    case 'ufo': return gen_crashed_ufo(p);
    case 'volcano': return gen_volcano(p);

    // 🚧 SEASONAL & MECHS
    case 'xmas_tree_large': return gen_xmas_tree_large(p);
    case 'jack_house': return gen_jack_house(p);
    case 'pumpkin_ring': return gen_pumpkin_ring(p);
    case 'easter_cross': return gen_easter_cross(p);
    case 'ice_wall': return gen_ice_wall(p);
    case 'lab_spider': return gen_lab_spider(p);
    case 'vault_door': return gen_vault_door(p);

    // 🦾 MECHS (Lite)
    case 'mech_bipedal': return gen_mech_bipedal(p);
    case 't800_endoskeleton': return gen_t800_endoskeleton(p);
    case 'mech_minigun': return gen_mech_minigun(p);
    case 'mech_walker': return gen_mech_walker(p);
    case 'cannon_turret': return gen_cannon_turret(p);
    
    // 💀 BODY PARTS
    case 'body_skull': return gen_body_skull(p);
    case 'body_hand': return gen_body_hand(p);
    case 'body_ribcage': return gen_body_ribcage(p);
    case 'body_spine': return gen_body_spine(p);
    case 'body_eye': return gen_body_eye(p);
    case 'body_humanoid': return gen_body_humanoid(p);
    case 'body_arm': return gen_body_arm(p);
    case 'body_leg': return gen_body_leg(p);
    case 'body_ball_joint': return gen_body_ball_joint(p);
    
    // 🛡️ FORTIFICATIONS
    case 'bastion_round': return gen_bastion_round(p);
    case 'bastion_square': return gen_bastion_square(p);
    case 'wall_line': return gen_wall_line(p);
    case 'wall_arc': return gen_wall_arc(p);
    case 'checkpoint': 
    case 'guard_post': 
    case 'bunker_hatch':
    case 'teleporter_bunker_hatch': return gen_checkpoint(p);
    case 'watchtower_post': return gen_watchtower_post(p);
    case 'grid_flat': return gen_grid_flat(p);
    case 'ring_platform': return gen_ring_platform(p);
    case 'cross': return gen_cross(p);
    case 'arrow': return gen_arrow(p);
    case 'letter_D': return gen_letter_D(p);
    case 'letter_Z': return gen_letter_Z(p);
    case 'mothership': 
    case 'alien_mothership': return gen_mothership(p);
    case 'eiffel_tower': return gen_eiffel_tower(p);
    case 'cyberpunk_nexus': return gen_cyberpunk_nexus(p);
    case 'freeway_curve': return gen_freeway_curve(p);
    case 'saturn': return gen_saturn(p);
    case 'crown': return gen_crown(p);
    case 'olympic_rings': return gen_olympic_rings(p);
    case 'submarine': return gen_submarine(p);
    case 'aircraft_carrier': return gen_aircraft_carrier(p);
    case 'destroyer': return gen_destroyer(p);
    case 'helicarrier': return gen_helicarrier(p);
    case 'generic': return gen_grid_flat(p); // Default fallback
    case 'text': return gen_grid_flat(p); // Placeholder for text
    
    case 'teleporter_scifi': 
    case 'sci_fi_gate': return gen_sci_fi_gate(p);
    case 'teleporter_transporter': 
    case 'teleporter_stargate': return MP.gen_stargate_portal(p);
    case 'teleporter_ufo': return gen_crashed_ufo(p);
    case 'teleporter_ritual': return MP.gen_crop_circle(p);
    case 'teleporter_lava': return gen_volcano(p);
    case 'teleporter_event_mega': return gen_colosseum(p);
    case 'tunnel_circle': return gen_tunnel_circle(p);
    case 'tunnel_square': return gen_tunnel_square(p);
    case 'tunnel_hex': return gen_tunnel_hex(p);
    case 'reactor_core': return gen_reactor_core(p);
    case 'treehouse': return gen_treehouse(p);
    case 'fuel_depot': return gen_fuel_depot(p);
    case 'sniper_nest': return gen_sniper_nest(p);
    case 'farmstead': return gen_farmstead(p);
    case 'survivor_camp': return gen_survivor_camp(p);
    case 'bunker_line': return gen_bunker_line(p);
    case 'power_relay': return gen_power_relay(p);
    case 'radio_outpost': return gen_radio_outpost(p);
    case 'dragon': return gen_dragon(p);
    case 'pirate_ship': return gen_pirate_ship(p);
    case 'pvp_arena': return gen_pvp_arena(p);
    case 'helipad': return gen_helipad(p);
    case 'arena_maze': return gen_arena_maze(p);
    case 'arena_colosseum': return gen_arena_colosseum(p);
    default: return gen_grid_flat(p); // Absolute fallback
  }
}

export function gen_sphere(p: Record<string, number>, hemi: boolean): Point3D[] {
  const pts: Point3D[] = [];
  const latSegs = p.latSegs || 16;
  const lonSegs = p.lonSegs || 32;
  const radius = p.radius || 20;

  const latMax = hemi ? 0 : -Math.PI / 2;
  for (let i = 0; i <= latSegs; i++) {
    const lat = Math.PI / 2 + (latMax - Math.PI / 2) * i / latSegs;
    const y = radius * Math.sin(lat), r = radius * Math.cos(lat);
    for (let j = 0; j < lonSegs; j++) {
      const a = 2 * Math.PI * j / lonSegs;
      const yaw = -(a * 180 / Math.PI) + 90;
      const pitch = -(lat * 180 / Math.PI);
      pts.push({ x: r * Math.cos(a), y, z: r * Math.sin(a), yaw, pitch });
    }
  }
  return pts;
}

export function gen_deathstar(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const radius = p.radius || 40;
  const dishRadius = p.dishRadius || 12;
  const dishDepth = p.dishDepth || 8;
  const dishLatRad = (p.dishLat || 30) * Math.PI / 180;
  const dX = Math.cos(dishLatRad), dY = Math.sin(dishLatRad);

  const latSegs = p.latSegs || 32;
  const lonSegs = p.lonSegs || 64;

  for (let i = 0; i <= latSegs; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / latSegs;
    const y = radius * Math.sin(lat), r_at_y = radius * Math.cos(lat);
    for (let j = 0; j < lonSegs; j++) {
      const a = 2 * Math.PI * j / lonSegs;
      const px = r_at_y * Math.cos(a), pz = r_at_y * Math.sin(a);
      const dot = (px / radius) * dX + (y / radius) * dY;
      const ang = Math.acos(Math.min(1, Math.max(-1, dot)));
      const dr = Math.asin(Math.min(1, dishRadius / radius));
      if (ang < dr) continue;
      const yaw = -(a * 180 / Math.PI) + 90;
      const pitch = -(lat * 180 / Math.PI);
      pts.push({ x: px, y, z: pz, yaw, pitch });
    }
  }
  const bc = { x: radius * dX, y: radius * dY };
  for (let ri = 1; ri <= 8; ri++) {
    const dr = dishRadius * ri / 8;
    const dep = dishDepth * (1 - (dr / dishRadius) ** 2);
    for (let j = 0; j < 64; j++) {
      const a = 2 * Math.PI * j / 64;
      pts.push({ x: bc.x - dep * dX + dr * Math.cos(a), y: bc.y - dep * dY, z: dr * Math.sin(a), yaw: -(a * 180 / Math.PI) + 90 });
    }
  }
  return pts;
}

export function gen_torus(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const majorR = p.majorR || 40;
  const minorR = p.minorR || 8;
  const majorSegs = p.majorSegs || 64;
  const minorSegs = p.minorSegs || 16;

  for (let i = 0; i < majorSegs; i++) {
    const u = 2 * Math.PI * i / majorSegs;
    for (let j = 0; j < minorSegs; j++) {
      const v = 2 * Math.PI * j / minorSegs;
      const yaw = -(u * 180 / Math.PI) + 90;
      const pitch = -(v * 180 / Math.PI);
      pts.push({ 
        x: (majorR + minorR * Math.cos(v)) * Math.cos(u), 
        y: minorR * Math.sin(v), 
        z: (majorR + minorR * Math.cos(v)) * Math.sin(u),
        yaw, pitch
      });
    }
  }
  return pts;
}

export function gen_disc(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const inner = p.innerRadius || 0;
  const radius = p.radius || 30;
  const rings = p.rings || 5;
  const points = p.points || 12;

  for (let ri = 0; ri < rings; ri++) {
    const r = inner + (radius - inner) * (ri + 1) / rings;
    for (let j = 0; j < points; j++) {
      const a = 2 * Math.PI * j / points;
      pts.push({ x: r * Math.cos(a), y: 0, z: r * Math.sin(a) });
    }
  }
  return pts;
}

export function gen_helix(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const turns = p.turns || 3;
  const pointsPerTurn = p.pointsPerTurn || 16;
  const strands = p.strands || 1;
  const radius = p.radius || 10;
  const height = p.height || 30;

  const total = turns * pointsPerTurn;
  for (let s = 0; s < strands; s++) {
    const ph = 2 * Math.PI * s / strands;
    for (let i = 0; i <= total; i++) {
      const t = i / total, a = 2 * Math.PI * turns * t + ph;
      pts.push({ x: radius * Math.cos(a), y: height * t, z: radius * Math.sin(a) });
    }
  }
  return pts;
}

export function gen_cone(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const rings = p.rings || 10;
  const radius = p.radius || 20;
  const height = p.height || 40;
  const points = p.points || 16;

  for (let ri = 0; ri <= rings; ri++) {
    const t = ri / rings, r = radius * (1 - t), y = height * t;
    if (r < 0.5) { pts.push({ x: 0, y, z: 0 }); continue; }
    for (let j = 0; j < points; j++) {
      const a = 2 * Math.PI * j / points;
      pts.push({ x: r * Math.cos(a), y, z: r * Math.sin(a) });
    }
  }
  return pts;
}

export function gen_cylinder(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const radius = d(p, 'radius', 15), height = d(p, 'height', 20);
  const rings = d(p, 'rings', 4), points = d(p, 'points', 12);
  for (let ri = 0; ri <= rings; ri++) {
    const y = height * ri / rings;
    for (let j = 0; j < points; j++) {
      const a = 2 * Math.PI * j / points;
      pts.push({ x: radius * Math.cos(a), y, z: radius * Math.sin(a) });
    }
  }
  if (p.caps) {
    for (let j = 0; j < points; j++) {
      const a = 2 * Math.PI * j / points;
      pts.push({ x: radius * Math.cos(a) / 2, y: 0, z: radius * Math.sin(a) / 2 });
      pts.push({ x: radius * Math.cos(a) / 2, y: height, z: radius * Math.sin(a) / 2 });
    }
  }
  return pts;
}

export function gen_hyperboloid(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const rt = d(p, 'radiusTop', 15), rw = d(p, 'radiusMid', 5), h = d(p, 'height', 20);
  const rings = d(p, 'rings', 8), points = d(p, 'points', 14);
  for (let ri = 0; ri <= rings; ri++) {
    const t = (ri / rings) * 2 - 1;
    const y = (t + 1) * h / 2;
    const r = rw + (rt - rw) * t * t; // (Simplified hyperboloid)
    for (let j = 0; j < points; j++) {
      const a = 2 * Math.PI * j / points;
      pts.push({ x: r * Math.cos(a), y, z: r * Math.sin(a) });
    }
  }
  return pts;
}

export function gen_mobius(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const radius = d(p, 'radius', 30), width = d(p, 'width', 10);
  const rings = d(p, 'rings', 50), points = d(p, 'points', 8);
  for (let i = 0; i <= rings; i++) {
    const u = 2 * Math.PI * i / rings;
    for (let j = 0; j < points; j++) {
      const v = -width / 2 + width * j / (points - 1);
      const x = (radius + v * Math.cos(u / 2)) * Math.cos(u);
      const y = (radius + v * Math.cos(u / 2)) * Math.sin(u);
      const z = v * Math.sin(u / 2);
      pts.push({ x, y: z + radius * 0.5, z: y });
    }
  }
  return pts;
}

export function gen_icosphere(p: Record<string, number>): Point3D[] {
  const r = d(p, 'radius', 10);
  const subs = d(p, 'subdivisions', 2);
  const t = (1 + Math.sqrt(5)) / 2;
  let verts: [number, number, number][] = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
  ].map(v => { const l = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2); return v.map(x => x / l * r) as [number, number, number]; });
  const faces = [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  const midpoint = (a: [number,number,number], b: [number,number,number]): [number,number,number] => {
    const m: [number,number,number] = [(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
    const l = Math.sqrt(m[0]**2+m[1]**2+m[2]**2);
    return m.map(x => x/l*r) as [number,number,number];
  };
  let subdFaces = faces;
  for (let s = 0; s < Math.min(subs, 3); s++) {
    const next: number[][] = [];
    subdFaces.forEach(f => {
      const a_v = verts[f[0]], b_v = verts[f[1]], c_v = verts[f[2]];
      const ab = midpoint(a_v, b_v), bc = midpoint(b_v, c_v), ca = midpoint(c_v, a_v);
      const li = verts.length; verts.push(ab, bc, ca);
      next.push([f[0],li,li+2],[li,f[1],li+1],[li+2,li+1,f[2]],[li,li+1,li+2]);
    });
    subdFaces = next;
  }
  const seen = new Set<string>();
  const finalPts: Point3D[] = [];
  verts.forEach(v => {
    const k = `${v[0].toFixed(3)},${v[1].toFixed(3)},${v[2].toFixed(3)}`;
    if (!seen.has(k)) { seen.add(k); finalPts.push({ x: v[0], y: v[1], z: v[2] }); }
  });
  return finalPts;
}

function gen_body_skull(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius || 20;
  const jawDrop = p.jawDrop || 2;
  const eyeSocket = p.eyeSocket || 8;
  for (let i = 0; i <= 8; i++) {
    const lat = Math.PI / 2 - Math.PI * 0.6 * i / 8;
    const y = r * Math.sin(lat), cr = r * Math.cos(lat);
    const n = Math.max(4, Math.round(12 * Math.cos(lat)));
    for (let j = 0; j < n; j++) { const a = 2 * Math.PI * j / n; pts.push({ x: cr * Math.cos(a), y: y + r * 0.1, z: cr * Math.sin(a) }); }
  }
  for (let j = 0; j < 120; j++) {
    const a = Math.PI * j / 13;
    pts.push({ x: r * 0.7 * Math.cos(a), y: -r * 0.3, z: r * 0.6 * Math.sin(a) });
    pts.push({ x: r * 0.7 * Math.cos(a), y: -r * 0.3 - jawDrop * 0.4, z: r * 0.6 * Math.sin(a) });
  }
  [-1, 1].forEach(side => {
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: side * r * 0.35 + r * 0.2 * Math.cos(a), y: r * 0.15, z: -eyeSocket + r * 0.15 * Math.sin(a) }); }
  });
  for (let t = 0; t < 8; t++) {
    const a = Math.PI * (t + 0.5) / 8;
    pts.push({ x: r * 0.55 * Math.cos(a), y: -r * 0.3 - jawDrop * 0.3, z: r * 0.5 * Math.sin(a) });
    pts.push({ x: r * 0.55 * Math.cos(a), y: -r * 0.3 - jawDrop * 0.7, z: r * 0.5 * Math.sin(a) });
  }
  return pts;
}

function gen_body_arm(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const length = p.length || 30;
  const upperRadius = p.upperRadius || 6;
  const lowerRadius = p.lowerRadius || 4;
  const segH = length / 3;
  const joints = [upperRadius, lowerRadius, lowerRadius * 0.8];
  for (let seg = 0; seg < 3; seg++) {
    const r = joints[seg];
    const yBase = seg * segH;
    for (let ring = 0; ring <= 4; ring++) {
      const y = yBase + segH * ring / 4;
      const cr = r * (seg === 2 ? (1 - ring * 0.15) : 1);
      for (let j = 0; j < 120; j++) {
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
        for (let j = 0; j < 120; j++) {
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
  const length = p.length || 40;
  const thighRadius = p.thighRadius || 8;
  const shinRadius = p.shinRadius || 5;
  const footLen = p.footLen || 12;
  const segH = length / 3;
  const radii = [thighRadius, shinRadius, shinRadius * 0.75];
  for (let seg = 0; seg < 3; seg++) {
    const r = radii[seg];
    const yBase = -(seg + 1) * segH;
    for (let ring = 0; ring <= 5; ring++) {
      const y = yBase + segH * ring / 5;
      for (let j = 0; j < 120; j++) {
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
        for (let j = 0; j < 120; j++) {
          const a = 2 * Math.PI * j / 10;
          pts.push({ x: jr * Math.cos(a), y: jointY + jy, z: jr * Math.sin(a) });
        }
      }
    }
  }
  // foot
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    pts.push({ x: (t - 0.5) * footLen, y: -3 * segH, z: -radii[2] * 0.5 });
    pts.push({ x: (t - 0.5) * footLen, y: -3 * segH, z: radii[2] });
  }
  return pts;
}

function gen_body_ball_joint(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius || 10;
  // outer socket ring
  for (let i = 0; i <= 8; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 8;
    const y = r * Math.sin(lat), cr = r * Math.cos(lat);
    for (let j = 0; j < 120; j++) {
      const a = 2 * Math.PI * j / 16;
      pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) });
    }
  }
  // inner ball
  const ir = r * 0.7;
  for (let i = 0; i <= 6; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 6;
    const y = ir * Math.sin(lat), cr = ir * Math.cos(lat);
    for (let j = 0; j < 120; j++) {
      const a = 2 * Math.PI * j / 12;
      pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) });
    }
  }
  return pts;
}

function gen_body_hand(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const ps = p.palmSize || 10;
  const fingerCount = p.fingerCount || 5;
  const fingerLength = p.fingerLength || 15;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { pts.push({ x: (i - 1.5) * ps * 0.3, y: 0, z: (j - 1.5) * ps * 0.3 }); }
  for (let f = 0; f < fingerCount; f++) {
    const fx = (f - (fingerCount - 1) / 2) * ps * 0.22;
    const segLen = fingerLength / 4;
    for (let s = 0; s < 4; s++) {
      const y = ps * 0.5 + segLen * s;
      const w = ps * 0.08 * (1 - s * 0.15);
      pts.push({ x: fx - w, y, z: 0 }, { x: fx + w, y, z: 0 });
      if (s < 3) { pts.push({ x: fx, y: y + segLen * 0.5, z: w * 1.2 }); }
    }
    pts.push({ x: fx, y: ps * 0.5 + fingerLength, z: 0 });
  }
  const tx = -ps * 0.55, ty = ps * 0.1;
  for (let s = 0; s < 3; s++) { pts.push({ x: tx - ps * 0.05, y: ty + fingerLength * 0.2 * s, z: s * ps * 0.08 }, { x: tx + ps * 0.05, y: ty + fingerLength * 0.2 * s, z: s * ps * 0.08 }); }
  return pts;
}

function gen_body_ribcage(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const width = p.width || 30;
  const height = p.height || 40;
  const ribs = p.ribs || 12;
  const hw = width / 2;
  for (let i = 0; i <= 8; i++) pts.push({ x: 0, y: height * i / 8, z: 0 });
  for (let r = 0; r < ribs; r++) {
    const y = height * (r + 0.5) / ribs;
    const rw = hw * (0.7 + 0.3 * Math.sin(Math.PI * r / ribs));
    const rz = rw * 0.5;
    for (let j = 0; j <= 10; j++) {
      const a = Math.PI * j / 10;
      pts.push({ x: rw * Math.cos(a), y, z: rz * Math.sin(a) });
      pts.push({ x: -rw * Math.cos(a), y, z: rz * Math.sin(a) });
    }
    if (r > 0 && r < ribs - 1) pts.push({ x: 0, y, z: rz });
  }
  const pr = hw * 0.7;
  for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 16; pts.push({ x: pr * Math.cos(a) * 0.9, y: -height * 0.1, z: pr * 0.5 * Math.sin(a) }); }
  return pts;
}

function gen_body_spine(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const height = d(p, 'height', 20), vertebrae = d(p, 'segments', 8);
  const width = d(p, 'width', 4);
  const vh = height / vertebrae;
  const hw = width / 2;
  for (let v = 0; v < vertebrae; v++) {
    const y = v * vh;
    pts.push({ x: -hw, y, z: -hw / 2 }, { x: hw, y, z: -hw / 2 }, { x: -hw, y, z: hw / 2 }, { x: hw, y, z: hw / 2 });
    pts.push({ x: 0, y: y + vh * 0.4, z: hw * 1.5 });
    pts.push({ x: -hw * 1.8, y, z: 0 }, { x: hw * 1.8, y, z: 0 });
  }
  return pts;
}

function gen_body_eye(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius || 10;
  const irisRadius = p.irisRadius || 5;
  const pupilR = p.pupilR || 2;
  for (let i = 0; i <= 8; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 8;
    const y = r * Math.sin(lat), cr = r * Math.cos(lat);
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 12; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 20; pts.push({ x: irisRadius * Math.cos(a), y: r * 0.85, z: irisRadius * Math.sin(a) }); }
  for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 12; pts.push({ x: pupilR * Math.cos(a), y: r * 0.95, z: pupilR * Math.sin(a) }); }
  return pts;
}

function gen_body_humanoid(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height || 180;
  const w = p.width || 60;
  const hr = h * 0.1;
  for (let i = 0; i <= 5; i++) { const lat = -Math.PI / 2 + Math.PI * i / 5; const y = h * 0.85 + hr * Math.sin(lat), r = hr * Math.cos(lat); for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: r * Math.cos(a), y, z: r * Math.sin(a) }); } }
  for (let i = 0; i <= 5; i++) { const t = i / 5; const y = h * 0.45 + h * 0.3 * t; const tw = w * (0.7 + 0.3 * (1 - t)); pts.push({ x: -tw / 2, y, z: 0 }, { x: tw / 2, y, z: 0 }, { x: 0, y, z: tw * 0.3 }, { x: 0, y, z: -tw * 0.3 }); }
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 6; i++) { const y = h * 0.75 - h * 0.3 * i / 6; const x = side * (w / 2 + h * 0.2 * i / 6); pts.push({ x, y, z: 0 }); }
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 4; pts.push({ x: side * (w / 2 + h * 0.3) + h * 0.04 * Math.cos(a), y: h * 0.45, z: h * 0.04 * Math.sin(a) }); }
  });
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 8; i++) { const y = h * 0.45 - h * 0.45 * i / 8; const x = side * w * 0.2; pts.push({ x, y, z: 0 }); }
    pts.push({ x: side * w * 0.2, y: 0, z: -h * 0.06 }, { x: side * w * 0.2, y: 0, z: h * 0.08 });
  });
  return pts;
}

function gen_bastion_round(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const radius = d(p, 'radius', 20), height = d(p, 'height', 10);
  const rings = d(p, 'rings', 4), segs = d(p, 'points', 12);
  for (let ri = 0; ri <= rings; ri++) {
    const y = height * ri / rings;
    for (let j = 0; j < segs; j++) {
      const a = 2 * Math.PI * j / segs;
      pts.push({ x: radius * Math.cos(a), y, z: radius * Math.sin(a) });
    }
  }
  return pts;
}

function gen_bastion_square(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const width = d(p, 'width', 20), height = d(p, 'height', 10);
  const rings = d(p, 'rings', 4), points = d(p, 'points', 4);
  const depth = d(p, 'depth', width), spacing = d(p, 'spacing', 5);
  const hW = width / 2, hD = depth / 2;
  for (let ri = 0; ri <= rings; ri++) {
    const y = height * ri / rings;
    const sides = [
      { ax: -hW, az: -hD, dx: spacing, dz: 0, n: Math.ceil(width / spacing) },
      { ax: hW, az: -hD, dx: 0, dz: spacing, n: Math.ceil(depth / spacing) },
      { ax: hW, az: hD, dx: -spacing, dz: 0, n: Math.ceil(width / spacing) },
      { ax: -hW, az: hD, dx: 0, dz: -spacing, n: Math.ceil(depth / spacing) },
    ];
    sides.forEach(s => { for (let i = 0; i < s.n; i++) pts.push({ x: s.ax + s.dx * i, y, z: s.az + s.dz * i }); });
  }
  return pts;
}

function gen_tower(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const radius = d(p, 'radius', 5), height = d(p, 'height', 30);
  const rings = d(p, 'rings', 5), points = d(p, 'points', 8);
  for (let ri = 0; ri <= rings; ri++) {
    const y = height * ri / rings;
    for (let j = 0; j < points; j++) {
      const a = 2 * Math.PI * j / points;
      pts.push({ x: radius * Math.cos(a), y, z: radius * Math.sin(a) });
    }
  }
  return pts;
}

function gen_wall_line(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const length = d(p, 'length', 40), height = d(p, 'height', 6);
  const spacing = d(p, 'spacing', 5), rings = d(p, 'rings', 3);
  const n = Math.ceil(length / spacing);
  for (let ri = 0; ri <= rings; ri++) {
    const y = height * ri / rings;
    for (let i = 0; i < n; i++) pts.push({ x: spacing * i - length / 2, y, z: 0 });
  }
  return pts;
}

function gen_wall_arc(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const radius = d(p, 'radius', 20), arcDeg = d(p, 'angle', 180);
  const spacing = d(p, 'spacing', 5), height = d(p, 'height', 6);
  const rings = d(p, 'rings', 3);
  const arcRad = arcDeg * Math.PI / 180;
  const n = Math.ceil(radius * arcRad / spacing);
  for (let ri = 0; ri <= rings; ri++) {
    const y = height * ri / rings;
    for (let i = 0; i <= n; i++) {
      const a = -arcRad / 2 + arcRad * i / n;
      pts.push({ x: radius * Math.sin(a), y, z: radius * Math.cos(a) - radius });
    }
  }
  return pts;
}

function gen_star_fort(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const radius = d(p, 'radius', 40), points = d(p, 'points', 5);
  const depth  = d(p, 'depth', 20), height = d(p, 'height', 10);
  const layers = d(p, 'layers', 3);
  for (let ri = 0; ri < layers; ri++) {
    const y = height * ri / Math.max(layers - 1, 1);
    const npts = points * 2;
    for (let i = 0; i < npts; i++) {
      const a = 2 * Math.PI * i / npts;
      const dist = (i % 2 === 0) ? radius : (radius - depth);
      pts.push({ x: dist * Math.cos(a), y, z: dist * Math.sin(a) });
    }
  }
  return pts;
}

function gen_grid_flat(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const width = d(p, 'width', 40), depth = d(p, 'depth', 40), spacing = d(p, 'spacing', 4);
  const rows = Math.ceil(depth / spacing), cols = Math.ceil(width / spacing);
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < cols; col++)
      pts.push({ x: (col - (cols - 1) / 2) * spacing, y: 0, z: (row - (rows - 1) / 2) * spacing });
  return pts;
}

function gen_staircase(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const steps = d(p, 'steps', 10), height = d(p, 'height', 20), width = d(p, 'width', 10);
  const stepH = height / steps, stepD = width / steps;
  const curve = d(p, 'curve', 0);
  for (let i = 0; i < steps; i++) {
    if (curve > 0) {
      const a = i / steps * width / curve;
      pts.push({ x: curve * Math.sin(a), y: stepH * i, z: curve * (1 - Math.cos(a)) });
    } else {
      pts.push({ x: 0, y: stepH * i, z: width * i / steps - width / 2 });
    }
  }
  return pts;
}

function gen_pyramid(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const levels = d(p, 'layers', 5), height = d(p, 'height', 20), baseSize = d(p, 'width', 30);
  const shrink = d(p, 'shrink', 20), spacing = d(p, 'spacing', 5);
  const levelH = height / levels;
  for (let lvl = 0; lvl < levels; lvl++) {
    const y = levelH * lvl;
    const size = baseSize * (1 - lvl / levels);
    const n = Math.ceil(size * 4 / spacing);
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
  const radius = d(p, 'radius', 20), width = d(p, 'width', 4);
  const rings = d(p, 'rings', 3), points = d(p, 'points', 32);
  const height = d(p, 'height', 10);
  for (let ri = 0; ri < rings; ri++) {
    const r = radius + ri * (width / Math.max(rings - 1, 1));
    for (let j = 0; j < points; j++) {
      const a = 2 * Math.PI * j / points;
      pts.push({ x: r * Math.cos(a), y: height, z: r * Math.sin(a) });
    }
  }
  return pts;
}

function gen_cross(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const width = d(p, 'width', 20), height = d(p, 'height', 20), depth = d(p, 'depth', 4);
  const spacing = d(p, 'spacing', 5), rings = d(p, 'rings', 3);
  const hW = width / 2, hH = height / 2;
  const hw = depth / 2, hlen = width / 2;
  for (let ri = 0; ri <= rings; ri++) {
    const y = height * ri / rings;
    const n = Math.ceil(width / spacing);
    for (let i = 0; i <= n; i++) {
      const t = spacing * i - hlen;
      pts.push({ x: t, y, z: 0 }); // Horizontal arm
      pts.push({ x: 0, y, z: t }); // Vertical arm
    }
  }
  return pts;
}


function gen_arrow(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const length = p.length || 60;
  const width = p.width || 12;
  const headL = p.headL || 20;
  const headW = p.headW || 24;
  const spacing = p.spacing || 5;
  const rings = p.rings || 3;
  const height = p.height || 10;
  const shaftEnd = length / 2 - headL;
  for (let ri = 0; ri <= rings; ri++) {
    const y = height * ri / rings;
    const hw = width / 2;
    const n = Math.ceil(shaftEnd / spacing);
    for (let i = 0; i <= n; i++) { const z = -length / 2 + shaftEnd * i / n; pts.push({ x: -hw, y, z }, { x: hw, y, z }); }
    const hn = Math.ceil(headW / spacing);
    for (let i = 0; i <= hn; i++) {
      const t = i / hn; const z = shaftEnd + headL * t; const x = headW / 2 * (1 - t);
      pts.push({ x, y, z }, { x: -x, y, z });
    }
    pts.push({ x: 0, y, z: length / 2 });
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

function gen_letter_D(p: Record<string, number>): Point3D[] {
  const size = d(p, 'height', 20), depth = d(p, 'depth', 4);
  const spacing = d(p, 'spacing', 5), rings = d(p, 'rings', 3);
  return letterPoints('D', size, depth, spacing, rings);
}

function gen_letter_Z(p: Record<string, number>): Point3D[] {
  const size = d(p, 'height', 20), depth = d(p, 'depth', 4);
  const spacing = d(p, 'spacing', 5), rings = d(p, 'rings', 3);
  return letterPoints('Z', size, depth, spacing, rings);
}

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
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: r * Math.cos(a), y, z: r * Math.sin(a) }); }
  }
  // Eye sockets (two oblong rings, front-facing)
  [-1, 1].forEach(side => {
    const ex = side * hW * 0.42;
    for (let j = 0; j < 120; j++) {
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
  for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: hW * 0.78 * Math.cos(a), y: headBot + hW * 0.1, z: hW * 0.62 * Math.sin(a) }); }
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
      for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: sX + (eX - sX) * t + r * Math.cos(a), y: sY + (eY - sY) * t, z: r * Math.sin(a) }); }
    }
    // Elbow joint
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: eX + w * 0.09 * Math.cos(a), y: eY, z: w * 0.09 * Math.sin(a) }); }
    // Forearm
    for (let i = 0; i <= 7; i++) {
      const t = i / 7, r = w * 0.062;
      for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 5; pts.push({ x: eX + (wX - eX) * t + r * Math.cos(a), y: eY + (wY - eY) * t, z: r * Math.sin(a) }); }
    }
    // Hand
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: wX + w * 0.1 * Math.cos(a), y: wY - h * 0.02, z: w * 0.07 * Math.sin(a) }); }
  });

  // ── LEGS ──────────────────────────────────────────────────────
  [-1, 1].forEach(side => {
    const lx = side * w * 0.22;
    const kneeY = pelvisY - h * 0.27;
    const ankleY = kneeY - h * 0.24;
    // Upper leg (femur — thick)
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, r = w * 0.1 - w * 0.025 * t;
      for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: lx + r * Math.cos(a), y: pelvisY - t * h * 0.27, z: r * Math.sin(a) }); }
    }
    // Knee cap
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: lx + w * 0.12 * Math.cos(a), y: kneeY, z: w * 0.12 * Math.sin(a) }); }
    // Shin (thinner)
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, r = w * 0.068;
      for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: lx + r * Math.cos(a), y: kneeY - t * h * 0.24, z: r * Math.sin(a) }); }
    }
    // Ankle joint
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: lx + w * 0.085 * Math.cos(a), y: ankleY, z: w * 0.085 * Math.sin(a) }); }
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
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
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
      for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: side * (w / 2 + w * 0.12) + r * Math.cos(a), y, z: r * Math.sin(a) }); }
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
      for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: side * w * 0.6 + r * Math.cos(a), y, z: r * Math.sin(a) }); }
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
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: lx + w * 0.05 * Math.cos(a), y: h * 0.28, z: w * 0.05 * Math.sin(a) }); }
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
  for (let j = 0; j < 120; j++) {
    const a = 2 * Math.PI * j / 12;
    pts.push({ x: r * Math.cos(a), y: 0, z: r * Math.sin(a) });
    pts.push({ x: r * 0.7 * Math.cos(a), y: h * 0.1, z: r * 0.7 * Math.sin(a) });
  }
  // Rotating turret body
  for (let ri = 0; ri <= 5; ri++) {
    const y = h * 0.1 + h * 0.4 * ri / 5;
    const cr = r * 0.6 * (1 - ri * 0.05);
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
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
      for (let j = 0; j < 120; j++) {
        const a = 2 * Math.PI * j / 6;
        pts.push({ x: bx + barrelR * Math.cos(a), y, z: bz + barrelR * Math.sin(a) });
      }
    }
  }
  // ammo drum
  for (let ri = 0; ri <= 6; ri++) {
    const y = h * 0.15 + h * 0.25 * ri / 6;
    const dr = r * 0.5;
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 16; pts.push({ x: dr * Math.cos(a), y, z: dr * Math.sin(a) }); }
  }
  return pts;
}

function gen_mech_walker(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height;   // total height  (default 20)
  const w = p.width;    // body half-width (default 14)

  // ── BODY: solid rectangular building block ─────────────────────────────────
  // Sits from bodyBot to bodyTop in Y; half-extents bw × bl
  const bodyBot = h * 0.52;
  const bodyTop = h;
  const bw = w * 0.38;   // half body width  (X)
  const bl = w * 0.52;   // half body length (Z)

  // Perimeter rings at multiple Y levels
  const bodyRings = 5;
  for (let ri = 0; ri <= bodyRings; ri++) {
    const by = bodyBot + (bodyTop - bodyBot) * ri / bodyRings;
    const stepsX = 5, stepsZ = 7;
    for (let xi = 0; xi <= stepsX; xi++) {
      const bx = -bw + bw * 2 * xi / stepsX;
      pts.push({ x: bx, y: by, z: -bl });
      pts.push({ x: bx, y: by, z:  bl });
    }
    for (let zi = 1; zi < stepsZ; zi++) {
      const bz = -bl + bl * 2 * zi / stepsZ;
      pts.push({ x: -bw, y: by, z: bz });
      pts.push({ x:  bw, y: by, z: bz });
    }
  }
  // Interior cross-braces at mid height (gives building interior feel)
  const midY = (bodyBot + bodyTop) * 0.5;
  for (let xi = 0; xi <= 4; xi++) {
    const bx = -bw + bw * 2 * xi / 4;
    for (let zi = 0; zi <= 4; zi++) {
      const bz = -bl + bl * 2 * zi / 4;
      pts.push({ x: bx, y: midY, z: bz });
    }
  }

  // ── 8 LEGS: spider arrangement ─────────────────────────────────────────────
  // Angles from the Z-axis (forward), in radians — 4 per side, symmetric
  // Spider looks natural with pairs at: ±38°, ±68°, ±112°, ±142°
  const legDeg = [38, 68, 112, 142];
  const legAngles: number[] = [
    ...legDeg.map(d =>  d * Math.PI / 180),   // right side
    ...legDeg.map(d => -d * Math.PI / 180),   // left side
  ];

  legAngles.forEach(la => {
    // Unit vector pointing outward from body along this leg's horizontal direction
    const ox = Math.sin(la);
    const oz = Math.cos(la);

    // Hip: where leg meets body, at body perimeter
    const hipX = ox * bw * 0.95;
    const hipZ = oz * bl * 0.95;
    const hipY = bodyBot + (bodyTop - bodyBot) * 0.15;

    // Knee: angles outward strongly then bends down
    const kneeR = w * 0.82;   // horizontal reach of knee from centre
    const kneeX = ox * kneeR;
    const kneeZ = oz * kneeR;
    const kneeY = h * 0.28;   // knee is lower than hip but above ground

    // Foot: final ground contact point
    const footR = w * 1.35;
    const footX = ox * footR;
    const footZ = oz * footR;
    const footY = 0;

    // Upper segment — hip → knee  (dense: 10 pts)
    const seg1 = 10;
    for (let i = 0; i <= seg1; i++) {
      const t = i / seg1;
      pts.push({
        x: hipX + (kneeX - hipX) * t,
        y: hipY + (kneeY - hipY) * t,
        z: hipZ + (kneeZ - hipZ) * t,
      });
    }

    // Lower segment — knee → foot  (dense: 10 pts)
    const seg2 = 10;
    for (let i = 1; i <= seg2; i++) {
      const t = i / seg2;
      pts.push({
        x: kneeX + (footX - kneeX) * t,
        y: kneeY + (footY - kneeY) * t,
        z: kneeZ + (footZ - kneeZ) * t,
      });
    }

    // Foot claw — 3 short prongs fanning outward at ground level
    const perpX = oz;   // perpendicular to leg direction
    const perpZ = -ox;
    for (const off of [-0.10, 0, 0.10]) {
      pts.push({
        x: footX + ox * w * 0.06 + perpX * off * w,
        y: footY,
        z: footZ + oz * w * 0.06 + perpZ * off * w,
      });
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
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 20; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Cockpit offset to port side
  const cpx = -r * 0.6, cpz = r * 0.25;
  for (let i = 0; i <= 4; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 4;
    const y = r * 0.12 + r * 0.1 * Math.sin(lat), cr = r * 0.15 * Math.cos(lat);
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: cpx + cr * Math.cos(a), y, z: cpz + cr * Math.sin(a) }); }
  }
  // Forward mandibles (2 prongs)
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      pts.push({ x: r * 0.6 * (1 - t * 0.3), y: 0, z: side * (r * 0.3 + r * 0.05 * t) + r * 0.7 * t });
    }
    // mandible tip
    for (let j = 0; j < 120; j++) {
      const a = 2 * Math.PI * j / 6;
      pts.push({ x: r * 0.42 + r * 0.04 * Math.cos(a), y: r * 0.04 * Math.sin(a), z: side * r * 0.35 + r * 0.7 });
    }
  });
  // Top surface details — quad gun turrets
  [{ x: 0, z: -r * 0.2 }, { x: 0, z: r * 0.2 }].forEach(pos => {
    for (let j = 0; j < 120; j++) {
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
      for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: -r * 0.8 + r * 0.08 * Math.cos(a), y, z: ez + r * 0.08 * Math.sin(a) }); }
    }
  }
  return pts;
}

function gen_mothership(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const R = p.radius || 100;
  const T = p.thickness || 8;
  const rings = p.rings || 12;
  const spokes = p.spokes || 24;

  // 1. Concentric Rings
  for (let ri = 0; ri <= rings; ri++) {
    const r = R * (ri / rings);
    const n = Math.max(8, Math.ceil(2 * Math.PI * r / 5));
    for (let j = 0; j < n; j++) {
      const a = 2 * Math.PI * j / n;
      pts.push({ x: r * Math.cos(a), y: 0, z: r * Math.sin(a) });
      pts.push({ x: r * Math.cos(a), y: T, z: r * Math.sin(a) });
    }
  }

  // 2. Radial Spokes
  for (let s = 0; s < spokes; s++) {
    const a = 2 * Math.PI * s / spokes;
    for (let i = 0; i <= 10; i++) {
        const r = R * i / 10;
        pts.push({ x: r * Math.cos(a), y: 0, z: r * Math.sin(a) });
        pts.push({ x: r * Math.cos(a), y: T, z: r * Math.sin(a) });
        // Vertical struts
        pts.push({ x: r * Math.cos(a), y: T * 0.5, z: r * Math.sin(a) });
    }
  }

  // 3. Command Bridge (Central Hub)
  for (let yi = 0; yi <= 15; yi++) {
      const r = (R * 0.15) * (1 - yi/30);
      const n = Math.max(8, Math.ceil(2 * Math.PI * r / 4));
      for (let j = 0; j < n; j++) {
          const a = 2 * Math.PI * j / n;
          pts.push({ x: r * Math.cos(a), y: T + yi, z: r * Math.sin(a) });
      }
  }

  return pts;
}

function gen_skyscraper(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h      = p.height || 120;
  const w      = p.width  || 30;
  const floors = p.floors || 20;
  const floorH = h / floors;

  const MAT_MAIN   = "staticobj_wall_cncsmall_8";
  const MAT_BASE   = "staticobj_wall_stone2";
  const MAT_ACCENT = "staticobj_wall_milcnc_4";

  // Helper: place wall panels along a straight line, with correct yaw
  function face(x1: number, z1: number, x2: number, z2: number, y: number, mat: string, spacing = 8) {
    const dx = x2 - x1, dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    // yaw so the 8m wall panel spans along the face direction
    const yaw = Math.atan2(dx, dz) * 180 / Math.PI + 90;
    const steps = Math.max(1, Math.round(len / spacing));
    for (let i = 0; i < steps; i++) {
      const t = (i + 0.5) / steps;
      pts.push({ x: x1 + dx * t, y, z: z1 + dz * t, yaw, name: mat });
    }
  }

  for (let f = 0; f <= floors; f++) {
    const y    = f * floorH;
    const taper = 1 - f * 0.005;
    const hw   = (w / 2) * taper;
    const hd   = (w * 0.6) * taper;
    const mat  = f < 3 ? MAT_BASE : MAT_MAIN;
    const sp   = f < 3 ? 8 : 8;

    // Four faces: N, S, E, W
    face(-hw, -hd,  hw, -hd, y, mat, sp);  // North (Z-)
    face(-hw,  hd,  hw,  hd, y, mat, sp);  // South (Z+)
    face(-hw, -hd, -hw,  hd, y, mat, sp);  // West  (X-)
    face( hw, -hd,  hw,  hd, y, mat, sp);  // East  (X+)

    // Art Deco accent pillars every 5 floors
    if (f % 5 === 0) {
      pts.push({ x:  hw + 0.5, y, z: 0, name: MAT_ACCENT, yaw: 90 });
      pts.push({ x: -hw - 0.5, y, z: 0, name: MAT_ACCENT, yaw: 90 });
    }
  }

  // Setback floors (Art Deco)
  [0.6, 0.75, 0.9].forEach(ht => {
    const y  = h * ht;
    const sw = w * (1.3 - ht * 0.5);
    const sh = w * 0.5 * (1.3 - ht * 0.5);
    face(-sw/2, -sh,  sw/2, -sh, y, MAT_BASE);
    face(-sw/2,  sh,  sw/2,  sh, y, MAT_BASE);
    face(-sw/2, -sh, -sw/2,  sh, y, MAT_BASE);
    face( sw/2, -sh,  sw/2,  sh, y, MAT_BASE);
  });

  // Antenna spire
  for (let i = 0; i <= 10; i++) {
    const ay = h + h * 0.15 * i / 10;
    const r  = w * 0.025 * (1 - i / 10);
    for (let j = 0; j < 4; j++) {
      const a = 2 * Math.PI * j / 4;
      pts.push({ x: r * Math.cos(a), y: ay, z: r * Math.sin(a), name: MAT_ACCENT, yaw: j * 90 });
    }
  }

  return pts;
}

function gen_prison_tower(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height, r = p.radius;
  const wallRings = p.wallRings || 8;
  const crenHeight = p.crenHeight || 3;
  const WALL_PTS = 24;   // points around circumference
  const INNER_R  = r * 0.82; // inner wall radius

  // ── Outer + inner wall rings at each height level ──────────────────────────
  for (let ri = 0; ri <= wallRings; ri++) {
    const y = h * ri / wallRings;
    for (let j = 0; j < WALL_PTS; j++) {
      const a = 2 * Math.PI * j / WALL_PTS;
      pts.push({ x: r       * Math.cos(a), y, z: r       * Math.sin(a) });
      pts.push({ x: INNER_R * Math.cos(a), y, z: INNER_R * Math.sin(a) });
    }
  }

  // ── Interior floor plates at each level ────────────────────────────────────
  const floors = Math.max(2, Math.round(wallRings / 2));
  for (let fi = 0; fi <= floors; fi++) {
    const y = h * fi / floors;
    const gridN = Math.ceil(INNER_R * 2 / 3);
    for (let xi = 0; xi <= gridN; xi++) {
      for (let zi = 0; zi <= gridN; zi++) {
        const fx = -INNER_R + INNER_R * 2 * xi / gridN;
        const fz = -INNER_R + INNER_R * 2 * zi / gridN;
        if (fx * fx + fz * fz <= INNER_R * INNER_R * 0.92) {
          pts.push({ x: fx, y, z: fz });
        }
      }
    }
  }

  // ── Entrance gap (south face, ground level) ────────────────────────────────
  // Door arch — 3 points wide at y=0..doorH
  const doorH = Math.min(h * 0.25, 5);
  const doorW = Math.PI / 6; // ±30° arc gap
  for (let di = 0; di <= 6; di++) {
    const y = doorH * di / 6;
    const a = Math.PI / 2; // south
    pts.push({ x: r       * Math.cos(a), y, z: r       * Math.sin(a) });
    pts.push({ x: INNER_R * Math.cos(a), y, z: INNER_R * Math.sin(a) });
    // arch top
    if (di === 6) {
      for (let ai = 0; ai <= 4; ai++) {
        const aa = a - doorW + doorW * 2 * ai / 4;
        pts.push({ x: r * Math.cos(aa), y, z: r * Math.sin(aa) });
      }
    }
  }

  // ── Battlements at top ─────────────────────────────────────────────────────
  const crenN = 16;
  for (let j = 0; j < crenN; j++) {
    const a = 2 * Math.PI * j / crenN;
    const cr = r * 1.02;
    pts.push({ x: cr * Math.cos(a), y: h,              z: cr * Math.sin(a) });
    pts.push({ x: cr * Math.cos(a), y: h + crenHeight, z: cr * Math.sin(a) });
  }

  // ── Conical roof ───────────────────────────────────────────────────────────
  for (let ri = 0; ri <= 8; ri++) {
    const t = ri / 8;
    const y = h + crenHeight + h * 0.35 * t;
    const cr = r * 1.02 * (1 - t);
    if (cr > 0.5) {
      for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 14; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
    }
  }

  return pts;
}

function gen_sci_fi_gate(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height || 6, w = p.width || p.radius || 8;
  // Two vertical pylons
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 12; i++) {
      const y = h * i / 12;
      const r = w * 0.06;
      for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: side * w / 2 + r * Math.cos(a), y, z: r * Math.sin(a) }); }
    }
    // Energy conduits up the pylons
    for (let i = 0; i <= 20; i++) {
      pts.push({ x: side * (w / 2 + w * 0.04), y: h * i / 20, z: 0 });
    }
    // Pylon caps
    for (let i = 0; i <= 4; i++) {
      const y = h + h * 0.08 * i / 4;
      const r = w * 0.08 * (1 - i / 4);
      for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: side * w / 2 + r * Math.cos(a), y, z: r * Math.sin(a) }); }
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
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 12; pts.push({ x: hw * Math.cos(a), y: gy, z: hw * 0.1 * Math.sin(a) }); }
  }
  return pts;
}

function gen_cannon_turret(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.baseRadius, h = p.height;
  // Base pivot ring
  for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 12; pts.push({ x: r * Math.cos(a), y: 0, z: r * Math.sin(a) }); }
  // Turret body - octagonal prism
  for (let ri = 0; ri <= 5; ri++) {
    const y = h * 0.1 + h * 0.4 * ri / 5;
    for (let j = 0; j < 120; j++) { const a = Math.PI / 4 * j + Math.PI / 8; pts.push({ x: r * 0.7 * Math.cos(a), y, z: r * 0.7 * Math.sin(a) }); }
  }
  // Twin cannons
  [-1, 1].forEach(side => {
    const cx = side * r * 0.2;
    for (let i = 0; i <= 15; i++) {
      const barrelR = r * 0.07;
      pts.push({ x: cx, y: h * 0.5, z: -r * 1.2 * i / 15 });
      // barrel rings
      if (i % 3 === 0) {
        for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: cx + barrelR * Math.cos(a), y: h * 0.5, z: -r * 1.2 * i / 15 + barrelR * Math.sin(a) }); }
      }
    }
    // Muzzle brake
    for (let j = 0; j < 120; j++) {
      const a = 2 * Math.PI * j / 8;
      pts.push({ x: cx + r * 0.1 * Math.cos(a), y: h * 0.5, z: -r * 1.2 });
    }
  });
  // Sensor array on top
  for (let i = 0; i <= 4; i++) {
    const y = h * 0.5 + h * 0.08 * i / 4;
    pts.push({ x: 0, y, z: 0 });
  }
  for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: r * 0.15 * Math.cos(a), y: h * 0.58, z: r * 0.15 * Math.sin(a) }); }
  return pts;
}

function gen_tunnel_circle(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = d(p, 'radius', 8), len = p.length || p.height || 30, segs = d(p, 'segments', 14);
  const ptsCircle = d(p, 'points', 16);
  for (let i = 0; i <= segs; i++) {
    const z = -len / 2 + len * i / segs;
    for (let j = 0; j < ptsCircle; j++) {
      const a = 2 * Math.PI * j / ptsCircle;
      pts.push({ x: r * Math.cos(a), y: r * Math.sin(a), z });
    }
  }
  return pts;
}

function gen_tunnel_square(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const width = d(p, 'width', 8), height = d(p, 'height', 6), len = d(p, 'length', 30);
  const segs = d(p, 'segments', 10), spacing = d(p, 'spacing', 5);
  const hw = width / 2, hh = height / 2;
  for (let i = 0; i <= segs; i++) {
    const z = -len / 2 + len * i / segs;
    const sides = [
      [[-hw, -hh], [hw, -hh]],
      [[hw, -hh], [hw, hh]],
      [[hw, hh], [-hw, hh]],
      [[-hw, hh], [-hw, -hh]],
    ];
    const n = Math.ceil(width / spacing);
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
  const r = d(p, 'radius', 8), len = d(p, 'length', 30), segs = d(p, 'segments', 10);
  const spacing = d(p, 'spacing', 5);
  for (let i = 0; i <= segs; i++) {
    const z = -len / 2 + len * i / segs;
    for (let j = 0; j < 6; j++) {
      const a = Math.PI / 3 * j, b = Math.PI / 3 * (j + 1);
      const n = Math.ceil(r * Math.PI / 3 / spacing);
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
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Plasma rings - torus stacks
  const ringCount = p.rings || 5;
  for (let ri = 0; ri < ringCount; ri++) {
    const y = h * 0.1 + h * 0.8 * ri / (ringCount - 1);
    const rr = r * (0.5 + 0.5 * Math.sin(Math.PI * ri / (ringCount - 1)));
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 20; pts.push({ x: rr * Math.cos(a), y, z: rr * Math.sin(a) }); }
    // inner ring
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 12; pts.push({ x: rr * 0.6 * Math.cos(a), y, z: rr * 0.6 * Math.sin(a) }); }
  }
  // Outer containment sphere
  for (let i = 0; i <= 8; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 8;
    const y = h / 2 + r * Math.sin(lat), cr = r * Math.cos(lat);
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 16; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
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
    for (let j = 0; j < 120; j++) {
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
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 12; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
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
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Battlements on main keep
  for (let j = 0; j < 120; j++) {
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
      for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: tx + tr * Math.cos(a), y, z: tz + tr * Math.sin(a) }); }
    }
    // Conical roof
    for (let ri = 0; ri <= 5; ri++) {
      const y = th + th * 0.3 * ri / 5;
      const cr = tr * (1 - ri / 5);
      if (cr > 0.3) {
        for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: tx + cr * Math.cos(a), y, z: tz + cr * Math.sin(a) }); }
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
  const steps = Math.max(1, p.steps || 6);
  const baseSize = p.baseSize || 40;
  const height = p.height || 20;
  const stepH = height / steps;
  const shrinkPer = Math.min(0.99, p.shrink || 0.15);
  const spacing = p.spacing || 6;

  for (let s = 0; s < steps; s++) {
    const size = baseSize * Math.pow(1 - shrinkPer, s);
    const y = s * stepH;
    const hw = size / 2, hd = size * 0.8 / 2;
    const n = Math.max(1, Math.ceil(size / spacing));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push({ x: -hw + size * t, y, z: -hd }, { x: -hw + size * t, y, z: hd });
      pts.push({ x: -hw, y, z: -hd + size * 0.8 * t }, { x: hw, y, z: -hd + size * 0.8 * t });
    }
    // step riser face
    const rn = Math.max(1, Math.ceil(stepH / spacing));
    for (let ri = 0; ri <= rn; ri++) {
      const ry = y + stepH * ri / rn;
      const nextSize = baseSize * Math.pow(1 - shrinkPer, s + 1);
      const nhw = nextSize / 2;
      const ratio = hw > 0 ? (nhw / hw) : 1;
      pts.push({ x: nhw, y: ry, z: -hd * ratio }, { x: -nhw, y: ry, z: -hd * ratio });
      pts.push({ x: nhw, y: ry, z: hd * ratio }, { x: -nhw, y: ry, z: hd * ratio });
    }
  }
  return pts;
}

function gen_crashed_ufo(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = d(p, 'radius', 40);
  // Saucer hull — flattened sphere
  for (let i = 0; i <= 8; i++) {
    const lat = -Math.PI / 2 + Math.PI * i / 8;
    const y = r * 0.2 * Math.sin(lat), cr = r * Math.cos(lat);
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 18; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Dome on top
  for (let i = 0; i <= 5; i++) {
    const lat = Math.PI * i / 10;
    const y = r * 0.2 + r * 0.25 * Math.sin(lat), cr = r * 0.3 * Math.cos(lat);
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Crash furrow (gouge in ground) — tilt applied via debris placement
  const tiltFactor = Math.sin((d(p, 'tiltDeg', 25)) * Math.PI / 180);
  const furLen = r * 1.8;
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const fw = r * 0.25 * (1 - t * 0.6);
    pts.push({ x: fw, y: -r * 0.15 * t, z: furLen * t });
    pts.push({ x: -fw, y: -r * 0.15 * t, z: furLen * t });
  }
  // Debris chunks around crash site — spread influenced by tilt
  const debrisN = d(p, 'debris', 8);
  for (let d_val = 0; d_val < debrisN; d_val++) {
    const da = 2 * Math.PI * d_val / debrisN;
    const dr = r * (0.8 + tiltFactor * 0.4) + r * 0.4 * Math.sin(d_val * 2.1);
    pts.push({ x: dr * Math.cos(da), y: 0, z: dr * Math.sin(da) });
    pts.push({ x: dr * 0.7 * Math.cos(da + 0.3), y: r * 0.05 * tiltFactor, z: dr * 0.7 * Math.sin(da + 0.3) });
  }
  return pts;
}

function gen_volcano(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = d(p, 'baseRadius', 60);
  const h = d(p, 'height', 40);
  const cR = d(p, 'craterRadius', 15);
  const spacing = d(p, 'spacing', 6);
  const rings = d(p, 'rings', 12);
  const rimHeight = p.rimHeight || 3;
  
  for (let ri = 0; ri <= rings; ri++) {
    const t = ri / rings;
    const cr = cR + (r - cR) * Math.pow(1 - t, 1.8);
    const y = h * Math.pow(t, 0.8);
    const n = Math.max(8, Math.round(cr * Math.PI * 2 / spacing));
    for (let j = 0; j < n; j++) { const a = 2 * Math.PI * j / n; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  for (let j = 0; j < 32; j++) { const a = 2 * Math.PI * j / 32; pts.push({ x: r * Math.cos(a), y: 0, z: r * Math.sin(a) }); }
  for (let j = 0; j < 28; j++) {
    const a = 2 * Math.PI * j / 28;
    const bump = cR * (1 + 0.22 * Math.sin(j * 5 + 1));
    pts.push({ x: bump * Math.cos(a), y: h, z: bump * Math.sin(a) });
    pts.push({ x: bump * 0.85 * Math.cos(a), y: h + rimHeight, z: bump * 0.85 * Math.sin(a) });
  }
  for (let ri = 1; ri <= 3; ri++) {
    const cr2 = cR * 0.8 * (1 - ri / 4);
    const cy = h - h * 0.06 * ri;
    for (let j = 0; j < 16; j++) { const a = 2 * Math.PI * j / 16; pts.push({ x: cr2 * Math.cos(a), y: cy, z: cr2 * Math.sin(a) }); }
  }
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
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 5; pts.push({ x: r * Math.cos(a), y: towerTop + h * 0.06 * t, z: r * Math.sin(a) }); }
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
  for (let j = 0; j < 120; j++) {
    const a = 2 * Math.PI * j / 44;
    pts.push({ x: eRx * Math.cos(a), y: eyeY + eRz * 0.35 * Math.sin(a * 2), z: eRz * Math.sin(a) });
  }
  // Mid iris ring
  for (let j = 0; j < 120; j++) {
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
  const h = Math.max(10, p.height || 30);
  const w = Math.max(10, p.width || 20);
  const legH = h * 0.42;
  const bodyY = legH;
  const bodyH = h * 0.35;
  const bW = w * 0.45;
  const bD = w * 0.6;
  
  function drawWall(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) {
    const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
    const len = Math.max(0.1, Math.sqrt(dx*dx + dy*dy + dz*dz));
    const yaw = Math.atan2(dx, dz) * 180 / Math.PI + 90; 
    const steps = Math.max(1, Math.ceil(len / 3.5)); // dense 3.5m steps fits 4m walls well
    for (let i=0; i<=steps; i++) {
       const t = i/steps;
       pts.push({ x: x1+dx*t, y: y1+dy*t, z: z1+dz*t, yaw: yaw });
    }
  }

  // BODY HULL (Box)
  for(let i=0; i<=5; i++) {
     const y = bodyY + bodyH * (i/5);
     drawWall(-bW, y, -bD, -bW, y, bD); // L
     drawWall(bW, y, -bD, bW, y, bD);   // R
     drawWall(-bW, y, -bD, bW, y, -bD); // F
     drawWall(-bW, y, bD, bW, y, bD);   // B
  }

  // LEGS
  const legCX = bW * 0.85, legCZ = bD * 0.75;
  [[legCX, legCZ], [legCX, -legCZ], [-legCX, legCZ], [-legCX, -legCZ]].forEach(([lx, lz]) => {
     for(let h_tier=0; h_tier<=Math.ceil(legH/3); h_tier++) {
        const y = h_tier * 3;
        for(let j=0; j < 120; j++) {
           const a = j * Math.PI / 4;
           pts.push({ x: lx + w*0.12*Math.cos(a), y, z: lz + w*0.12*Math.sin(a), yaw: -a * 180 / Math.PI + 90 });
        }
     }
  });

  // NECK
  const neckLen = w * 0.7;
  const headZ = -bD - neckLen;
  for(let i=0; i<=3; i++) {
     const y = bodyY + bodyH * 0.3 + i*2;
     drawWall(-w*0.15, y, -bD, -w*0.15, y, headZ);
     drawWall(w*0.15, y, -bD, w*0.15, y, headZ);
  }

  // HEAD
  const hW = w*0.28, hH = h*0.22, hD = w*0.35;
  const headY = bodyY + bodyH*0.1;
  for(let i=0; i<=5; i++) {
     const y = headY + hH * (i/5);
     drawWall(-hW, y, headZ, -hW, y, headZ-hD);
     drawWall(hW, y, headZ, hW, y, headZ-hD);
     drawWall(-hW, y, headZ-hD, hW, y, headZ-hD); // face
  }

  // CANNONS
  drawWall(-hW*0.6, headY+hH*0.2, headZ-hD, -hW*0.6, headY+hH*0.2, headZ-hD-w*0.5);
  drawWall(hW*0.6, headY+hH*0.2, headZ-hD, hW*0.6, headY+hH*0.2, headZ-hD-w*0.5);
  
  return pts;
}

// ── NEW MASTERPIECE GENERATORS ──────────────────────────────────
function gen_eiffel_tower(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const baseSize = Math.max(20, p.width || 60);
  const height = Math.max(30, p.height || 120);

  const MAT_LEG    = "staticobj_wall_milcnc_4";
  const MAT_ANCHOR = "staticobj_roadblock_cncblock";
  const MAT_LATTICE = "staticobj_wall_tin_5";

  function drawWall(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, mat: string = MAT_LEG) {
    const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
    const len = Math.max(0.1, Math.sqrt(dx*dx + dy*dy + dz*dz));
    const yaw = Math.atan2(dx, dz) * 180 / Math.PI + 90;
    const pitch = Math.atan2(dy, Math.sqrt(dx*dx + dz*dz)) * -180 / Math.PI;
    const steps = Math.max(1, Math.ceil(len / 3.5));
    for (let i = 0; i < steps; i++) {
      const t = (i + 0.5) / steps;  // center-based: no endpoint overlap
      pts.push({ x: x1+dx*t, y: y1+dy*t, z: z1+dz*t, yaw, pitch, name: mat });
    }
  }

  // Draw 4 curved tapering legs
  const legSteps = 30;
  for (let i=0; i<legSteps; i++) {
     const t1 = i/legSteps;
     const t2 = (i+1)/legSteps;
     
     // exponential curve inward
     const w1 = (baseSize / 2) * Math.pow(1 - t1, 1.8);
     const w2 = (baseSize / 2) * Math.pow(1 - t2, 1.8);
     const y1 = height * t1;
     const y2 = height * t2;

     const mat = i < 3 ? MAT_ANCHOR : MAT_LEG;

     // 4 pillars
     [[1,1], [1,-1], [-1,1], [-1,-1]].forEach(([sx, sz]) => {
        drawWall(w1*sx, y1, w1*sz, w2*sx, y2, w2*sz, mat);
     });
     
     // Horizontal braces every 1/5th height
     if (i > 0 && i % Math.floor(legSteps/5) === 0) {
        drawWall(-w1, y1, -w1, w1, y1, -w1, MAT_LATTICE);
        drawWall(w1, y1, -w1, w1, y1, w1, MAT_LATTICE);
        drawWall(w1, y1, w1, -w1, y1, w1, MAT_LATTICE);
        drawWall(-w1, y1, w1, -w1, y1, -w1, MAT_LATTICE);
     }
  }
  return pts;
}

function gen_cyberpunk_nexus(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = Math.max(40, p.height || 100);
  const w = Math.max(15, p.width || 30);
  
  function drawWall(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) {
    const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
    const len = Math.max(0.1, Math.sqrt(dx*dx + dy*dy + dz*dz));
    const yaw = Math.atan2(dx, dz) * 180 / Math.PI + 90; 
    const steps = Math.max(1, Math.ceil(len / 3.5)); 
    for (let i=0; i<=steps; i++) { pts.push({ x: x1+dx*(i/steps), y: y1+dy*(i/steps), z: z1+dz*(i/steps), yaw }); }
  }

  // Main Central Spire (Hexagonal)
  for(let y_tier=0; y_tier<=h; y_tier+=4) {
    const t = y_tier/h;
    const cw = (w/2) * (1 - t*0.3); // slight taper
    for(let j=0; j < 120; j++) {
       const a1 = j * Math.PI/3;
       const a2 = (j+1) * Math.PI/3;
       drawWall(cw*Math.cos(a1), y_tier, cw*Math.sin(a1), cw*Math.cos(a2), y_tier, cw*Math.sin(a2));
    }
  }

  // Sub-towers clustered around it
  for(let i=0; i<3; i++) {
     const subH = h * (0.4 + 0.3*Math.random());
     const subW = (w/2) * 0.6;
     const angle = i * (Math.PI*2/3) + Math.PI/6;
     const cx = (w/2 * 1.5) * Math.cos(angle);
     const cz = (w/2 * 1.5) * Math.sin(angle);
     
     for(let y_tier=0; y_tier<=subH; y_tier+=4) {
        for(let j=0; j < 120; j++) {
           const a1 = j * Math.PI/2 + angle;
           const a2 = (j+1) * Math.PI/2 + angle;
           drawWall(cx+subW*Math.cos(a1), y_tier, cz+subW*Math.sin(a1), cx+subW*Math.cos(a2), y_tier, cz+subW*Math.sin(a2));
        }
     }
  }

  // Connecting sky-bridges
  for(let bridgeY = h*0.3; bridgeY <= h*0.8; bridgeY += h*0.4) {
     for(let i=0; i<3; i++) {
        const angle = i * (Math.PI*2/3) + Math.PI/6;
        const cx = (w/2 * 1.5) * Math.cos(angle);
        const cz = (w/2 * 1.5) * Math.sin(angle);
        drawWall(0, bridgeY, 0, cx, bridgeY, cz);
     }
  }

  return pts;
}

function gen_castle_keep(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const w = Math.max(20, p.width || 40);
  const h = Math.max(10, p.height || 20);
  
  function drawWall(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) {
    const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
    const len = Math.max(0.1, Math.sqrt(dx*dx + dy*dy + dz*dz));
    const yaw = Math.atan2(dx, dz) * 180 / Math.PI + 90; 
    const steps = Math.max(1, Math.ceil(len / 3.5)); 
    for (let i=0; i<=steps; i++) { pts.push({ x: x1+dx*(i/steps), y: y1+dy*(i/steps), z: z1+dz*(i/steps), yaw }); }
  }

  // Square layout with 4 corner towers
  // Main walls
  for(let y=0; y<=h; y+=4) {
     drawWall(-w/2, y, -w/2, w/2, y, -w/2);
     drawWall(-w/2, y, w/2, w/2, y, w/2);
     drawWall(-w/2, y, -w/2, -w/2, y, w/2);
     drawWall(w/2, y, -w/2, w/2, y, w/2);
  }

  // 4 circular towers at corners
  [[1,1], [1,-1], [-1,1], [-1,-1]].forEach(([sx, sz]) => {
     const cx = sx * w/2;
     const cz = sz * w/2;
     const tr = w*0.15;
     for(let y=0; y<=h*1.3; y+=3) { // Towers taller than walls
        for(let j=0; j < 120; j++) {
           const a1 = j * Math.PI/4;
           const a2 = (j+1) * Math.PI/4;
           drawWall(cx+tr*Math.cos(a1), y, cz+tr*Math.sin(a1), cx+tr*Math.cos(a2), y, cz+tr*Math.sin(a2));
        }
     }
  });

  return pts;
}

function gen_borg_cube(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = (p.size || p.width || 100) * 0.5; // half-edge
  const g = Math.max(2, Math.round(p.gridLines || 6));

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
  const r = p.radius || p.width / 2 || 50, h = p.height || 35;
  // Elliptical outer wall tiers
  const tiers = p.tiers || 6;
  for (let tier = 0; tier < tiers; tier++) {
    const tierH = h / tiers;
    const tierR = r - tier * r * 0.04;
    for (let ri = 0; ri <= 6; ri++) {
      const y = tier * tierH + tierH * ri / 6;
      for (let j = 0; j < 120; j++) {
        const a = 2 * Math.PI * j / 64;
        // Elliptical (longer than wide like the real thing)
        pts.push({ x: tierR * Math.cos(a) * 1.2, y, z: tierR * Math.sin(a) });
      }
    }
    // Arch columns at each tier
    const archN = p.arches || 80;
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
  for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 64; pts.push({ x: aFloor * Math.cos(a) * 1.2, y: 0, z: aFloor * Math.sin(a) }); }
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
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 10; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Cap — torus-like mushroom head
  const capY = h * 0.6;
  for (let ri = 0; ri <= 8; ri++) {
    const t = ri / 8;
    const y = capY + h * 0.4 * t;
    const cr = r * Math.sin(Math.PI * t);
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 20; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Shock ring at ground
  for (let ri = 1; ri <= 3; ri++) {
    const cr = r * ri * 0.8;
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 20; pts.push({ x: cr * Math.cos(a), y: r * 0.05 * ri, z: cr * Math.sin(a) }); }
  }
  // Rolling debris cloud ring mid-height
  const cloudY = h * 0.3;
  for (let j = 0; j < 120; j++) {
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
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 14; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Accretion disk — glowing torus
  for (let i = 0; i < 20; i++) {
    const u = 2 * Math.PI * i / 20;
    for (let j = 0; j < 120; j++) {
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
      for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 6; pts.push({ x: jr * Math.cos(a), y: jy, z: jr * Math.sin(a) }); }
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
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 24; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Central raised section
  for (let i = 0; i <= 5; i++) {
    const lat = 0 + Math.PI / 2 * i / 5;
    const y = r * 0.15 + r * 0.25 * Math.sin(lat), cr = r * 0.35 * Math.cos(lat);
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 14; pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); }
  }
  // Tractor beam emitter array (ring of emitters on underside)
  const emN = p.emitterCount || 8;
  for (let e = 0; e < emN; e++) {
    const ea = 2 * Math.PI * e / emN;
    const ex = r * 0.6 * Math.cos(ea), ez = r * 0.6 * Math.sin(ea);
    for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: ex + r * 0.06 * Math.cos(a), y: -r * 0.1, z: ez + r * 0.06 * Math.sin(a) }); }
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
      for (let j = 0; j < 120; j++) { const a = 2 * Math.PI * j / 8; pts.push({ x: nx + r * 0.1 * Math.cos(a), y, z: nz + r * 0.1 * Math.sin(a) }); }
    }
  }
  return pts;
}

function gen_celtic_ring(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const r = p.radius || 30, h = p.height || 8;
  const stoneN = Math.max(4, p.stoneCount || 24);
  const sw = r * 0.05;
  for (let j = 0; j < stoneN; j++) {
    const a = 2 * Math.PI * j / stoneN;
    const sx = r * Math.cos(a), sz = r * Math.sin(a);
    for (let ri = 0; ri <= 5; ri++) { 
      const y = h * ri / 5; 
      pts.push({ x: sx, y, z: sz }, { x: sx + sw * Math.cos(a + Math.PI / 2), y, z: sz + sw * Math.sin(a + Math.PI / 2) }); 
    }
  }
  const innerN = Math.floor(Math.max(3, stoneN * 0.6));
  for (let j = 0; j < innerN; j++) {
    const a = 2 * Math.PI * j / innerN;
    const sx = r * 0.55 * Math.cos(a), sz = r * 0.55 * Math.sin(a);
    for (let ri = 0; ri <= 4; ri++) { 
      const y = h * 0.8 * ri / 4; 
      pts.push({ x: sx, y, z: sz }); 
    }
  }
  const archN = p.archCount || 6;
  for (let j = 0; j < archN; j++) {
    const a = 2 * Math.PI * j / archN;
    const a2 = 2 * Math.PI * (j + 0.5) / archN;
    const sx = r * 1.1 * Math.cos(a), sz = r * 1.1 * Math.sin(a);
    const sx2 = r * 1.1 * Math.cos(a2), sz2 = r * 1.1 * Math.sin(a2);
    const ah = h * 1.5;
    for (let ri = 0; ri <= 6; ri++) { 
      const y = ah * ri / 6; 
      pts.push({ x: sx, y, z: sz }); 
      pts.push({ x: sx2, y, z: sz2 });
    }
    for (let k = 0; k <= 6; k++) { 
      const t = k / 6; 
      pts.push({ x: sx + (sx2 - sx) * t, y: ah, z: sz + (sz2 - sz) * t }); 
    }
  }
  for (let i = 0; i <= 8; i++) {
    const t = i / 8, cr = r * 0.06 * (1 - t * 0.9);
    const y = h * 0.5 * t;
    for (let j = 0; j < 120; j++) { 
      const a = 2 * Math.PI * j / 8 + t * 0.5; 
      pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) }); 
    }
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

function gen_survivor_camp(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const radius = p.radius || 20;
  const tents = p.tents || 5;
  for (let i = 0; i < tents; i++) {
    const a = 2 * Math.PI * i / tents;
    const x = radius * Math.cos(a), z = radius * Math.sin(a);
    // Tent corners
    pts.push({ x: x - 2, y: 0, z: z - 2 }, { x: x + 2, y: 0, z: z - 2 }, { x: x + 2, y: 0, z: z + 2 }, { x: x - 2, y: 0, z: z + 2 });
    pts.push({ x, y: 2.5, z }); // center pole
  }
  pts.push({ x: 0, y: 0, z: 0 }); // campfire
  return pts;
}

function gen_bunker_line(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const length = p.length || 60;
  const spacing = p.spacing || 15;
  const n = Math.ceil(length / spacing);
  for (let i = 0; i < n; i++) {
    const x = spacing * i - length / 2;
    // Small bunker box
    pts.push({ x: x - 2, y: 0, z: -2 }, { x: x + 2, y: 0, z: -2 }, { x: x + 2, y: 2, z: -2 }, { x: x - 2, y: 2, z: -2 });
    pts.push({ x, y: 1.5, z: 2 }); // barrel/nest
  }
  return pts;
}

function gen_power_relay(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const height = p.height || 20;
  const width = p.width || 10;
  for (let i = 0; i <= 6; i++) {
    const y = height * i / 6;
    const w = width * (1 - i / 10);
    pts.push({ x: -w, y, z: -w }, { x: w, y, z: -w }, { x: w, y, z: w }, { x: -w, y, z: w });
  }
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 2 * i;
    pts.push({ x: width * 0.8 * Math.cos(a), y: height * 0.7, z: width * 0.8 * Math.sin(a) });
  }
  return pts;
}

function gen_radio_outpost(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const height = p.height || 40;
  const radius = p.radius || 15;
  for (let i = 0; i <= 10; i++) {
    const y = height * i / 10;
    pts.push({ x: 0, y, z: 0 });
    if (i % 3 === 0) {
      for (let j = 0; j < 4; j++) {
        const a = Math.PI / 2 * j;
        pts.push({ x: 2 * Math.cos(a), y, z: 2 * Math.sin(a) });
      }
    }
  }
  [[-radius, -radius], [radius, -radius], [radius, radius], [-radius, radius]].forEach(([x, z]) => {
    pts.push({ x, y: 0, z });
    pts.push({ x, y: 3, z });
  });
  return pts;
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

// ─── DRAGON ───────────────────────────────────────────────────────────────────
function gen_dragon(p: Record<string, number>): Point3D[] {
  const s = p.scale ?? 1;
  const len = (p.length ?? 12) * s;
  const wings = (p.wings ?? 8) * s;
  const neck = (p.neck ?? 4) * s;
  const pts: Point3D[] = [];
  const seg = 20;
  // Serpentine body — sinusoidal spine
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const bx = Math.sin(t * Math.PI * 2.4) * len * 0.18;
    const by = t * len * 0.25 + Math.sin(t * Math.PI) * len * 0.12;
    const bz = -t * len;
    const r = len * 0.07 * (1 - t * 0.4) + 0.2 * s;
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      pts.push({ x: bx + Math.cos(ang) * r, y: by + Math.sin(ang) * r * 0.6, z: bz });
    }
  }
  // Neck
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const nx = Math.sin(t * Math.PI * 0.5) * neck * 0.4;
    const ny = len * 0.25 + t * neck;
    const nz = -len * 0.08 + t * neck * 0.2;
    const r = len * 0.05 + 0.15 * s;
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2;
      pts.push({ x: nx + Math.cos(ang) * r, y: ny + Math.sin(ang) * r * 0.7, z: nz });
    }
  }
  // Head
  const hx = Math.sin(Math.PI * 0.5) * neck * 0.4, hy = len * 0.25 + neck, hz = neck * 0.2;
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const hw = len * 0.09 * (1 - t * 0.5);
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      pts.push({ x: hx + Math.cos(ang) * hw, y: hy + Math.sin(ang) * hw * 0.5 + t * len * 0.05, z: hz + t * len * 0.12 });
    }
  }
  // Horns
  [-1, 1].forEach(side => {
    for (let i = 0; i < 5; i++) {
      pts.push({ x: hx + side * (len * 0.04 + i * len * 0.015), y: hy + len * 0.04 + i * len * 0.03, z: hz - i * len * 0.018 });
    }
  });
  // Wings — swept back membrane ribs
  [-1, 1].forEach(side => {
    for (let r = 0; r <= 6; r++) {
      const rib = r / 6;
      const wy = len * 0.15 + rib * len * 0.02;
      const wLen = wings * (1 - rib * 0.55);
      const wz = -len * 0.2 - rib * len * 0.08;
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        pts.push({ x: side * (len * 0.07 + t * wLen), y: wy - t * wLen * 0.28, z: wz + t * wLen * 0.15 });
      }
    }
    // wing membrane fill
    for (let r = 0; r < 6; r++) {
      const rib = r / 6;
      const wy = len * 0.15 + rib * len * 0.02;
      const wz = -len * 0.2 - rib * len * 0.08;
      for (let i = 1; i <= 5; i++) {
        const t = i / 6;
        pts.push({ x: side * (len * 0.07 + t * wings * 0.6), y: wy - t * wings * 0.2, z: wz + rib * len * 0.05 });
      }
    }
  });
  // Tail — tapering spiral tip
  for (let i = 0; i <= 15; i++) {
    const t = i / 15;
    pts.push({ x: Math.sin(t * Math.PI * 1.5) * len * 0.09 * (1 - t), y: -t * len * 0.06, z: -len - t * len * 0.35 });
  }
  // Legs
  [-1, 1].forEach(side => {
    [0.15, 0.45].forEach(zt => {
      const bz = -zt * len;
      for (let i = 0; i <= 5; i++) {
        pts.push({ x: side * (len * 0.08 + i * len * 0.025), y: len * 0.01 - i * len * 0.028, z: bz });
      }
      // foot claws
      [-1, 0, 1].forEach(cl => {
        pts.push({ x: side * (len * 0.22 + cl * len * 0.03), y: 0, z: bz + cl * len * 0.03 });
      });
    });
  });
  return pts;
}

// ─── PIRATE SHIP ──────────────────────────────────────────────────────────────
function gen_pirate_ship(p: Record<string, number>): Point3D[] {
  const s = p.scale ?? 1;
  const L = (p.length ?? 20) * s;
  const W = L * 0.28;
  const H = L * 0.3;
  const masts = Math.round(p.masts ?? 3);
  const pts: Point3D[] = [];
  // Hull — double-arc cross-sections along length
  const hullSeg = 24;
  for (let i = 0; i <= hullSeg; i++) {
    const t = (i / hullSeg) * 2 - 1; // -1..1 along length
    const nt = Math.abs(t);
    const widthMult = Math.sqrt(1 - nt * nt * 0.55); // taper at bow/stern
    const hullW = W * widthMult;
    const hullH = H * 0.42 * (1 - nt * 0.2);
    const flare = 1 + (1 - nt) * 0.18; // widen at midship
    const segs = 12;
    for (let j = 0; j <= segs; j++) {
      const ang = (j / segs) * Math.PI;
      pts.push({ x: Math.cos(ang) * hullW * flare, y: Math.sin(ang) * hullH - hullH, z: t * L * 0.5 });
    }
  }
  // Deck planks (flat top)
  for (let i = -4; i <= 4; i++) {
    for (let j = -14; j <= 14; j++) {
      if (Math.abs(i) === 4 || Math.abs(j) === 14) continue;
      const zt = j / 14;
      const xLimit = W * 0.85 * Math.sqrt(1 - zt * zt * 0.6);
      if (Math.abs(i * W * 0.11) < xLimit) {
        pts.push({ x: i * W * 0.11, y: H * 0.01, z: zt * L * 0.45 });
      }
    }
  }
  // Railings — left and right sides
  [-1, 1].forEach(side => {
    for (let j = -10; j <= 10; j++) {
      const zt = j / 10;
      const xw = W * 0.85 * Math.sqrt(1 - zt * zt * 0.6);
      pts.push({ x: side * xw, y: H * 0.06, z: zt * L * 0.44 });
      pts.push({ x: side * xw, y: H * 0.14, z: zt * L * 0.44 });
    }
  });
  // Bow — pointed front
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    pts.push({ x: 0, y: H * 0.08 - t * H * 0.05, z: L * 0.5 + t * L * 0.08 });
  }
  // Bowsprit diagonal mast
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    pts.push({ x: 0, y: H * 0.12 + t * H * 0.45, z: L * 0.45 - t * L * 0.12 });
  }
  // Stern castle
  for (let i = 0; i <= 5; i++) {
    const t = i / 5;
    const w = W * 0.55 * (1 - t * 0.35);
    [-1, 1].forEach(side => pts.push({ x: side * w, y: H * 0.02 + t * H * 0.4, z: -L * 0.38 - t * L * 0.02 }));
    pts.push({ x: 0, y: H * 0.02 + t * H * 0.4, z: -L * 0.38 - t * L * 0.02 });
  }
  // Masts
  const mastZ = [L * 0.28, 0, -L * 0.25].slice(0, masts);
  const mastH = [H * 2.1, H * 2.6, H * 1.9];
  mastZ.forEach((mz, mi) => {
    const mh = mastH[mi];
    for (let i = 0; i <= 16; i++) {
      pts.push({ x: 0, y: H * 0.05 + (i / 16) * mh, z: mz });
    }
    // Crow's nest
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * W * 0.08, y: H * 0.05 + mh * 0.75, z: mz + Math.sin(ang) * W * 0.08 });
    }
    // Yard arms
    [0.55, 0.8].forEach(yt => {
      const armL = W * 0.9 * (1 - yt * 0.4);
      for (let i = 0; i <= 8; i++) {
        const t = i / 8 * 2 - 1;
        pts.push({ x: t * armL, y: H * 0.05 + mh * yt, z: mz });
        // sails — triangulated mesh
        if (i < 8) {
          for (let k = 1; k <= 4; k++) {
            const st = k / 5;
            pts.push({ x: t * armL * (1 - st * 0.15), y: H * 0.05 + mh * yt - st * mh * 0.2, z: mz + st * L * 0.015 });
          }
        }
      }
    });
  });
  // Cannons — both sides
  [-1, 1].forEach(side => {
    for (let i = -3; i <= 3; i++) {
      pts.push({ x: side * W * 0.82, y: H * 0.0, z: i * L * 0.09 });
      pts.push({ x: side * (W * 0.82 + s * 0.5), y: H * 0.0, z: i * L * 0.09 });
    }
  });
  // Flag on main mast
  const mainMZ = mastZ[Math.floor(masts / 2)];
  const mainMH = mastH[Math.floor(masts / 2)];
  for (let i = 0; i <= 3; i++) {
    for (let j = 0; j <= 4; j++) {
      pts.push({ x: i * W * 0.1, y: H * 0.05 + mainMH + j * W * 0.06, z: mainMZ });
    }
  }
  return pts;
}

// ─── PVP ARENA ────────────────────────────────────────────────────────────────
function gen_pvp_arena(p: Record<string, number>): Point3D[] {
  const s = p.scale ?? 1;
  const R = (p.radius ?? 15) * s;
  const H = (p.height ?? 5) * s;
  const walls = Math.round(p.walls ?? 8);
  const detail = Math.round(p.detail ?? 2);
  const pts: Point3D[] = [];
  // Outer wall — polygon ring
  for (let i = 0; i < walls; i++) {
    const a0 = (i / walls) * Math.PI * 2;
    const a1 = ((i + 1) / walls) * Math.PI * 2;
    for (let t = 0; t <= 10; t++) {
      const ta = a0 + (a1 - a0) * (t / 10);
      const wx = Math.cos(ta) * R, wz = Math.sin(ta) * R;
      for (let y = 0; y <= 8; y++) {
        pts.push({ x: wx, y: y * H / 8, z: wz });
      }
    }
    // Wall gates / gaps at each vertex
    const gx = Math.cos((i + 0.5) / walls * Math.PI * 2) * R * 0.96;
    const gz = Math.sin((i + 0.5) / walls * Math.PI * 2) * R * 0.96;
    pts.push({ x: gx, y: H * 0.5, z: gz });
  }
  // Wall top crenellations
  for (let i = 0; i < walls * 8; i++) {
    const ang = (i / (walls * 8)) * Math.PI * 2;
    const cx = Math.cos(ang) * R, cz = Math.sin(ang) * R;
    if (i % 2 === 0) pts.push({ x: cx, y: H * 1.08, z: cz });
  }
  // Corner towers
  for (let i = 0; i < walls; i++) {
    const ang = (i / walls) * Math.PI * 2;
    const tx = Math.cos(ang) * (R + s * 0.6), tz = Math.sin(ang) * (R + s * 0.6);
    for (let y = 0; y <= 10; y++) {
      const tH = H * 1.4;
      for (let a = 0; a < 6; a++) {
        const ta = (a / 6) * Math.PI * 2;
        pts.push({ x: tx + Math.cos(ta) * s * 1.0, y: y * tH / 10, z: tz + Math.sin(ta) * s * 1.0 });
      }
    }
    // Tower top
    pts.push({ x: tx, y: H * 1.5, z: tz });
  }
  // Arena floor — grid with looted crates (cross pattern)
  const gridSteps = Math.ceil(R / (s * 2));
  for (let ix = -gridSteps; ix <= gridSteps; ix++) {
    for (let iz = -gridSteps; iz <= gridSteps; iz++) {
      const fx = ix * s * 2, fz = iz * s * 2;
      if (Math.sqrt(fx * fx + fz * fz) < R * 0.92) {
        if (ix === 0 || iz === 0) pts.push({ x: fx, y: 0, z: fz }); // center cross
        else if (Math.abs(ix) % 3 === 0 && Math.abs(iz) % 3 === 0) pts.push({ x: fx, y: 0, z: fz }); // loot spots
      }
    }
  }
  // Center podium / objective
  for (let y = 0; y <= 5; y++) {
    for (let a = 0; a < 10; a++) {
      const ang = (a / 10) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * s * 1.5, y: y * H * 0.1, z: Math.sin(ang) * s * 1.5 });
    }
  }
  // Elevated platforms — 4 corners inside
  [0, 1, 2, 3].forEach(i => {
    const ang = (i / 4) * Math.PI * 2;
    const px = Math.cos(ang) * R * 0.6, pz = Math.sin(ang) * R * 0.6;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        if (Math.abs(dx) === 2 || Math.abs(dz) === 2) {
          pts.push({ x: px + dx * s * 0.6, y: H * 0.38, z: pz + dz * s * 0.6 });
        }
      }
    }
    // Platform pillar
    for (let y = 0; y <= 5; y++) {
      pts.push({ x: px, y: y * H * 0.075, z: pz });
    }
  });
  // Bleacher steps — outside ring (lightweight always)
  if (detail >= 1) {
    for (let i = 0; i < walls * 6; i++) {
      const ang = (i / (walls * 6)) * Math.PI * 2;
      for (let step = 1; step <= 3; step++) {
        const sr = R + step * s * 0.8;
        pts.push({ x: Math.cos(ang) * sr, y: step * H * 0.12, z: Math.sin(ang) * sr });
      }
    }
  }
  // ── MEDIUM: stair ramps (4 ramps from floor up to wall walkway) + barricade cover clusters ──
  if (detail >= 2) {
    for (let i = 0; i < 4; i++) {
      const ang = ((i + 0.5) / 4) * Math.PI * 2;
      const rx = Math.cos(ang) * (R - s * 1.5), rz = Math.sin(ang) * (R - s * 1.5);
      for (let step = 0; step <= 5; step++) {
        pts.push({ x: rx + Math.cos(ang) * step * s * 0.55, y: step * H * 0.14, z: rz + Math.sin(ang) * step * s * 0.55 });
      }
    }
    // Cover barricades at 4 diagonal floor positions
    [0.125, 0.375, 0.625, 0.875].forEach(f => {
      const ax = Math.cos(f * Math.PI * 2) * R * 0.45, az = Math.sin(f * Math.PI * 2) * R * 0.45;
      for (let di = -2; di <= 2; di++) {
        pts.push({ x: ax + di * s * 0.65, y: 0, z: az });
        pts.push({ x: ax, y: 0, z: az + di * s * 0.65 });
      }
      // Stacked crate (2 high)
      pts.push({ x: ax, y: s * 0.7, z: az });
    });
  }
  // ── HEAVY: wall walkway + barrel loot ring + barbed wire cap ──
  if (detail >= 3) {
    // Inner wall walkway at 75% height
    for (let i = 0; i < walls * 14; i++) {
      const ang = (i / (walls * 14)) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * R * 0.88, y: H * 0.75, z: Math.sin(ang) * R * 0.88 });
    }
    // Loot barrel ring at 8 positions near wall
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const bx = Math.cos(ang) * R * 0.72, bz = Math.sin(ang) * R * 0.72;
      for (let dy = 0; dy <= 2; dy++) pts.push({ x: bx, y: dy * s * 0.45, z: bz });
    }
    // Garbage containers as extra cover (4 positions)
    [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(ang => {
      const cx = Math.cos(ang) * R * 0.35, cz = Math.sin(ang) * R * 0.35;
      for (let dx = -1; dx <= 1; dx++) {
        pts.push({ x: cx + dx * s * 0.9, y: 0, z: cz });
        pts.push({ x: cx + dx * s * 0.9, y: s * 0.8, z: cz });
      }
    });
    // Barbed wire top of wall
    for (let i = 0; i < walls * 18; i++) {
      const ang = (i / (walls * 18)) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * R, y: H * 1.18, z: Math.sin(ang) * R });
    }
  }
  return pts;
}

// ─── HELIPAD ──────────────────────────────────────────────────────────────────
function gen_helipad(p: Record<string, number>): Point3D[] {
  const s = p.scale ?? 1;
  const R = (p.radius ?? 8) * s;
  const elevated = (p.elevated ?? 0) > 0;
  const lights = (p.lights ?? 1) > 0;
  const pts: Point3D[] = [];
  const platH = elevated ? (p.height ?? 4) * s : 0;
  // Landing circle — double ring
  [R, R * 0.92].forEach(r => {
    for (let i = 0; i < 64; i++) {
      const ang = (i / 64) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * r, y: platH, z: Math.sin(ang) * r });
    }
  });
  // H marking — horizontal bars
  for (let i = -8; i <= 8; i++) {
    pts.push({ x: i * R * 0.1, y: platH + 0.02, z: -R * 0.35 });
    pts.push({ x: i * R * 0.1, y: platH + 0.02, z:  R * 0.35 });
    if (i >= -1 && i <= 1) pts.push({ x: i * R * 0.1, y: platH + 0.02, z: 0 });
  }
  // H vertical strokes
  for (let i = -4; i <= 4; i++) {
    pts.push({ x: -R * 0.35, y: platH + 0.02, z: i * R * 0.09 });
    pts.push({ x:  R * 0.35, y: platH + 0.02, z: i * R * 0.09 });
  }
  // Safety stripe — dashed circle
  for (let i = 0; i < 32; i++) {
    if (i % 2 === 0) {
      const ang = (i / 32) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * R * 0.98, y: platH + 0.02, z: Math.sin(ang) * R * 0.98 });
    }
  }
  // Elevated platform structure
  if (elevated) {
    // Support legs
    [0, 1, 2, 3].forEach(i => {
      const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const lx = Math.cos(ang) * R * 0.75, lz = Math.sin(ang) * R * 0.75;
      for (let y = 0; y <= 10; y++) {
        pts.push({ x: lx, y: (y / 10) * platH, z: lz });
      }
      // Cross bracing
      const ang2 = ((i + 1) / 4) * Math.PI * 2 + Math.PI / 4;
      const lx2 = Math.cos(ang2) * R * 0.75, lz2 = Math.sin(ang2) * R * 0.75;
      for (let k = 0; k <= 6; k++) {
        const t = k / 6;
        pts.push({ x: lx + (lx2 - lx) * t, y: platH * (0.3 + t * 0.15), z: lz + (lz2 - lz) * t });
      }
    });
    // Platform deck edge
    for (let i = 0; i < 32; i++) {
      const ang = (i / 32) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * R, y: platH, z: Math.sin(ang) * R });
      pts.push({ x: Math.cos(ang) * R, y: platH - s * 0.4, z: Math.sin(ang) * R });
    }
  }
  // Corner lights
  if (lights) {
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const lx = Math.cos(ang) * R * 0.96, lz = Math.sin(ang) * R * 0.96;
      pts.push({ x: lx, y: platH + s * 0.12, z: lz });
      pts.push({ x: lx, y: platH + s * 0.25, z: lz });
    }
    // Windsock pole
    for (let i = 0; i <= 8; i++) {
      pts.push({ x: R * 0.92, y: platH + i * s * 0.25, z: R * 0.92 });
    }
    // Windsock
    for (let i = 0; i <= 5; i++) {
      const t = i / 5;
      pts.push({ x: R * 0.92 + t * s * 0.6, y: platH + s * 2.2 - t * s * 0.4, z: R * 0.92 + t * s * 0.1 });
    }
  }
  // Approach indicators — landing zone arrows (two sides)
  [-1, 1].forEach(side => {
    for (let i = 0; i <= 3; i++) {
      pts.push({ x: side * (R * 1.1 + i * s * 0.8), y: platH + 0.02, z: 0 });
    }
    // Arrowhead
    [-1, 0, 1].forEach(dy => {
      pts.push({ x: side * (R * 1.1 + s * 2.8), y: platH + 0.02, z: dy * s * 0.5 });
    });
  });
  return pts;
}

// ─── ARENA COLOSSEUM ──────────────────────────────────────────────────────────
function gen_arena_colosseum(p: Record<string, number>): Point3D[] {
  const s = p.scale ?? 1;
  const rX = (p.radiusX ?? 22) * s;
  const rZ = (p.radiusZ ?? 15) * s;
  const H = (p.height ?? 7) * s;
  const tiers = Math.max(1, Math.round(p.tiers ?? 3));
  const detail = Math.round(p.detail ?? 2);
  const pts: Point3D[] = [];
  const segs = 72;

  // Outer facade — each tier steps inward slightly, arched openings every 8th seg
  for (let tier = 0; tier < tiers; tier++) {
    const taper = 1 - tier * 0.055;
    const tierBaseY = tier * H / tiers;
    const tierH = H / tiers;
    for (let i = 0; i < segs; i++) {
      const isArch = i % 8 === 0; // skip every 8th = arch opening
      if (isArch) continue;
      const ang = (i / segs) * Math.PI * 2;
      const ox = Math.cos(ang) * rX * taper, oz = Math.sin(ang) * rZ * taper;
      for (let y = 0; y <= 4; y++) {
        pts.push({ x: ox, y: tierBaseY + (y / 4) * tierH, z: oz });
      }
    }
    // Arch crown points
    for (let i = 0; i < segs; i += 8) {
      const ang = (i / segs) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * rX * taper, y: tierBaseY + tierH * 0.85, z: Math.sin(ang) * rZ * taper });
    }
  }
  // Top parapet with crenellations
  for (let i = 0; i < segs; i++) {
    const ang = (i / segs) * Math.PI * 2;
    const taper = 1 - (tiers - 1) * 0.055;
    if (i % 3 !== 0) pts.push({ x: Math.cos(ang) * rX * taper, y: H, z: Math.sin(ang) * rZ * taper });
    else pts.push({ x: Math.cos(ang) * rX * taper, y: H * 1.1, z: Math.sin(ang) * rZ * taper }); // merlon
  }

  // Tiered seating rings (step inward + upward per tier)
  for (let tier = 0; tier < tiers; tier++) {
    const seatR = 0.74 - tier * 0.14;
    const seatY = tier * H * 0.2;
    const seatSegs = 48;
    for (let i = 0; i < seatSegs; i++) {
      const ang = (i / seatSegs) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * rX * seatR, y: seatY, z: Math.sin(ang) * rZ * seatR });
      pts.push({ x: Math.cos(ang) * rX * seatR, y: seatY + H * 0.025, z: Math.sin(ang) * rZ * seatR });
    }
  }

  // Arena floor — elliptical grid (sand)
  const flX = rX * 0.5, flZ = rZ * 0.5;
  for (let i = -8; i <= 8; i++) {
    for (let j = -8; j <= 8; j++) {
      const fx = i * flX / 8, fz = j * flZ / 8;
      if ((fx * fx) / (flX * flX) + (fz * fz) / (flZ * flZ) <= 1) {
        if (i % 3 === 0 || j % 3 === 0) pts.push({ x: fx, y: 0, z: fz });
      }
    }
  }
  // Podium / sponsor box (long side, both sides)
  [-1, 1].forEach(side => {
    for (let i = -3; i <= 3; i++) {
      pts.push({ x: i * rX * 0.07, y: H * 0.22 * 2, z: side * rZ * 0.68 });
      pts.push({ x: i * rX * 0.07, y: H * 0.22 * 2 + H * 0.08, z: side * rZ * 0.68 });
    }
  });
  // N/S/E/W gates — pillars flanking each entrance
  [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(ang => {
    [-1, 1].forEach(side => {
      const ga = ang + side * 0.07;
      const taper = 1 - (tiers - 1) * 0.055;
      const gx = Math.cos(ga) * rX * taper, gz = Math.sin(ga) * rZ * taper;
      for (let y = 0; y <= 6; y++) pts.push({ x: gx, y: y * H / 6, z: gz });
    });
  });
  // Underground hypogeum — corridor grid beneath the floor
  const hypRows = 4, hypCols = 7;
  for (let r = 0; r <= hypRows; r++) {
    for (let c = 0; c <= hypCols; c++) {
      const hx = (c / hypCols * 2 - 1) * flX * 0.88;
      const hz = (r / hypRows * 2 - 1) * flZ * 0.88;
      if ((hx * hx) / (flX * flX) + (hz * hz) / (flZ * flZ) < 1) {
        if (r === 0 || r === hypRows || c === 0 || c === hypCols) {
          for (let y = 0; y <= 3; y++) pts.push({ x: hx, y: -H * 0.25 + y * H * 0.07, z: hz });
        } else {
          pts.push({ x: hx, y: -H * 0.25, z: hz });
        }
      }
    }
  }
  // ── MEDIUM: vomitorium stairways (4 tunnel access ramps) + cover barrels on sand ──
  if (detail >= 2) {
    [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(ang => {
      const startX = Math.cos(ang) * flX * 0.45, startZ = Math.sin(ang) * flZ * 0.45;
      const endX   = Math.cos(ang) * rX * 0.72,  endZ   = Math.sin(ang) * rZ * 0.72;
      for (let step = 0; step <= 5; step++) {
        const t = step / 5;
        pts.push({ x: startX + (endX - startX) * t, y: step * H * 0.12, z: startZ + (endZ - startZ) * t });
        if (step < 5) {
          pts.push({ x: startX + (endX - startX) * t + Math.sin(ang) * s * 0.9, y: step * H * 0.12, z: startZ + (endZ - startZ) * t - Math.cos(ang) * s * 0.9 });
          pts.push({ x: startX + (endX - startX) * t - Math.sin(ang) * s * 0.9, y: step * H * 0.12, z: startZ + (endZ - startZ) * t + Math.cos(ang) * s * 0.9 });
        }
      }
    });
    // Barrel/crate cover on floor at 6 positions
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const bx = Math.cos(ang) * flX * 0.65, bz = Math.sin(ang) * flZ * 0.65;
      pts.push({ x: bx, y: 0, z: bz });
      pts.push({ x: bx, y: s * 0.7, z: bz });
    }
  }
  // ── HEAVY: wall walkway ring + pallet stacks at arches + barbed wire cap ──
  if (detail >= 3) {
    const taper = 1 - (tiers - 1) * 0.055;
    for (let i = 0; i < 80; i++) {
      const ang = (i / 80) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * rX * taper * 0.9, y: H * 0.85, z: Math.sin(ang) * rZ * taper * 0.9 });
    }
    // Pallet/crate stacks under every arch
    for (let i = 0; i < segs; i += 8) {
      const ang = (i / segs) * Math.PI * 2;
      const ax = Math.cos(ang) * rX * taper * 0.96, az = Math.sin(ang) * rZ * taper * 0.96;
      for (let dy = 0; dy <= 2; dy++) pts.push({ x: ax, y: dy * s * 0.5, z: az });
    }
    // Barbed wire on parapet
    for (let i = 0; i < 96; i++) {
      const ang = (i / 96) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * rX * taper, y: H * 1.18, z: Math.sin(ang) * rZ * taper });
    }
  }
  return pts;
}

// ─── ARENA FORT ───────────────────────────────────────────────────────────────
function gen_arena_fort(p: Record<string, number>): Point3D[] {
  const s = p.scale ?? 1;
  const W = (p.width ?? 28) * s;
  const D = (p.depth ?? 28) * s;
  const H = (p.height ?? 6) * s;
  const bastions = (p.bastions ?? 1) > 0;
  const detail = Math.round(p.detail ?? 2);
  const pts: Point3D[] = [];
  const hw = W / 2, hd = D / 2;

  // Main perimeter walls — 4 sides with crenellations
  const wallSegW = Math.ceil(W / (s * 1.5));
  const wallSegD = Math.ceil(D / (s * 1.5));
  for (let i = 0; i <= wallSegW; i++) {
    const t = i / wallSegW;
    const wx = -hw + t * W;
    [-hd, hd].forEach(wz => {
      for (let y = 0; y <= 5; y++) pts.push({ x: wx, y: y * H / 5, z: wz });
      if (i % 3 === 0) pts.push({ x: wx, y: H * 1.1, z: wz }); // merlon
    });
  }
  for (let i = 0; i <= wallSegD; i++) {
    const t = i / wallSegD;
    const wz = -hd + t * D;
    [-hw, hw].forEach(wx => {
      for (let y = 0; y <= 5; y++) pts.push({ x: wx, y: y * H / 5, z: wz });
      if (i % 3 === 0) pts.push({ x: wx, y: H * 1.1, z: wz });
    });
  }

  // Corner bastions — pentagonal projections
  if (bastions) {
    [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].forEach(([bx, bz]) => {
      const sx = Math.sign(bx), sz = Math.sign(bz);
      // 3 faces of the bastion
      const bW = s * 5.5, bProj = s * 4.0;
      [
        [bx + sx * bProj, bz, bx + sx * bProj, bz + sz * bW * 0.5],
        [bx + sx * bProj, bz + sz * bW * 0.5, bx, bz + sz * bW * 0.5],
        [bx, bz + sz * bW * 0.5, bx, bz],
      ].forEach(([x1, z1, x2, z2]) => {
        const len = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
        const steps = Math.ceil(len / (s * 1.2));
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const fx = x1 + (x2 - x1) * t, fz = z1 + (z2 - z1) * t;
          for (let y = 0; y <= 5; y++) pts.push({ x: fx, y: y * H / 5, z: fz });
          if (i % 3 === 0) pts.push({ x: fx, y: H * 1.15, z: fz });
        }
      });
      // Bastion interior — flagpole / cannon platform
      pts.push({ x: bx + sx * bProj * 0.5, y: H, z: bz + sz * bW * 0.25 });
      for (let y = 0; y <= 4; y++) pts.push({ x: bx + sx * bProj * 0.5, y: H + y * s * 0.6, z: bz + sz * bW * 0.25 });
    });
  }

  // Midpoint wall towers — one on each of the 4 walls
  [[0, -hd], [0, hd], [-hw, 0], [hw, 0]].forEach(([tx, tz]) => {
    const tR = s * 2.5;
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      for (let y = 0; y <= 7; y++) pts.push({ x: tx + Math.cos(ang) * tR, y: y * H * 1.25 / 7, z: tz + Math.sin(ang) * tR });
    }
    pts.push({ x: tx, y: H * 1.35, z: tz });
  });

  // Gate openings — N/S with portcullis frames
  [[0, -hd, 0, 1], [0, hd, 0, -1]].forEach(([gx, gz, , gsz]) => {
    // Gate arch
    for (let a = 0; a <= 6; a++) {
      const ang = (a / 6) * Math.PI;
      pts.push({ x: gx + Math.cos(ang) * s * 2, y: Math.sin(ang) * H * 0.55 + H * 0.05, z: gz });
    }
    // Portcullis bars
    for (let b = -2; b <= 2; b++) {
      for (let y = 0; y <= 4; y++) pts.push({ x: gx + b * s * 0.5, y: y * H * 0.12, z: gz });
    }
  });

  // Interior divider wall (creates 2 halves — attacker/defender)
  for (let i = 0; i <= wallSegW; i++) {
    const t = i / wallSegW;
    const wx = -hw + t * W;
    // Only draw if not near gates (skip center gap)
    if (Math.abs(wx) > W * 0.12) {
      for (let y = 0; y <= 3; y++) pts.push({ x: wx, y: y * H * 0.55 / 3, z: 0 });
    }
  }

  // Interior cover — barricades at 4 quadrant positions
  [[-hw * 0.45, -hd * 0.45], [hw * 0.45, -hd * 0.45], [-hw * 0.45, hd * 0.45], [hw * 0.45, hd * 0.45]].forEach(([cx, cz]) => {
    for (let i = -2; i <= 2; i++) {
      pts.push({ x: cx + i * s * 0.8, y: 0, z: cz });
      pts.push({ x: cx + i * s * 0.8, y: s * 1.2, z: cz });
      pts.push({ x: cx, y: 0, z: cz + i * s * 0.8 });
      pts.push({ x: cx, y: s * 1.2, z: cz + i * s * 0.8 });
    }
  });

  // Loot crates — center of each half
  [[0, -hd * 0.5], [0, hd * 0.5]].forEach(([lx, lz]) => {
    for (let y = 0; y <= 2; y++) {
      for (let a = 0; a < 6; a++) {
        const ang = (a / 6) * Math.PI * 2;
        pts.push({ x: lx + Math.cos(ang) * s * 1.5, y: y * s * 0.5, z: lz + Math.sin(ang) * s * 1.5 });
      }
    }
  });

  // ── MEDIUM: staircase ramps up to each corner bastion + wall-walk access ──
  if (detail >= 2) {
    [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].forEach(([tx, tz]) => {
      const dirX = -Math.sign(tx), dirZ = -Math.sign(tz);
      for (let step = 0; step <= 5; step++) {
        pts.push({ x: tx + dirX * step * s * 0.55, y: step * H * 0.15, z: tz + dirZ * step * s * 0.55 });
        pts.push({ x: tx + dirX * step * s * 0.55 + Math.abs(dirZ) * s * 0.6, y: step * H * 0.15, z: tz + dirZ * step * s * 0.55 });
      }
    });
    // Wall-walk sections along each side at H*0.7
    const wwSegsW = Math.ceil(W / (s * 2));
    for (let i = 0; i <= wwSegsW; i++) {
      const wx = -hw + (i / wwSegsW) * W;
      [-hd, hd].forEach(wz => pts.push({ x: wx, y: H * 0.72, z: wz * 0.93 }));
    }
    // Pallet/garbage-container covers: 6 positions per half
    [[0, -hd * 0.65], [0, hd * 0.65]].forEach(([hcx, hcz]) => {
      for (let dx = -2; dx <= 2; dx++) {
        pts.push({ x: hcx + dx * s * 1.1, y: 0, z: hcz });
        pts.push({ x: hcx + dx * s * 1.1, y: s * 0.85, z: hcz });
      }
    });
  }
  // ── HEAVY: full perimeter wall-walk + barbed wire cap + murder holes + crate towers ──
  if (detail >= 3) {
    // Outer parapet walkway (on top of walls)
    const wwW = Math.ceil(W / (s * 1.2)), wwD = Math.ceil(D / (s * 1.2));
    for (let i = 0; i <= wwW; i++) {
      const wx = -hw + (i / wwW) * W;
      [-hd, hd].forEach(wz => pts.push({ x: wx, y: H * 1.0, z: wz * 0.97 }));
    }
    for (let i = 0; i <= wwD; i++) {
      const wz = -hd + (i / wwD) * D;
      [-hw, hw].forEach(wx => pts.push({ x: wx * 0.97, y: H * 1.0, z: wz }));
    }
    // Barbed wire on crenellations
    for (let i = 0; i <= Math.ceil(W / (s * 0.8)); i++) {
      const wx = -hw + (i / Math.ceil(W / (s * 0.8))) * W;
      [-hd, hd].forEach(wz => pts.push({ x: wx, y: H * 1.22, z: wz }));
    }
    // Crate towers inside — 4 stackable pallet columns at quadrant centres
    [[-hw * 0.55, -hd * 0.55], [hw * 0.55, -hd * 0.55], [-hw * 0.55, hd * 0.55], [hw * 0.55, hd * 0.55]].forEach(([cx, cz]) => {
      for (let y = 0; y <= 4; y++) pts.push({ x: cx, y: y * s * 0.6, z: cz });
    });
    // Murder hole drops (drop points along wall inset)
    for (let i = 1; i < 4; i++) {
      const wx = -hw + (i / 4) * W;
      [-hd, hd].forEach(wz => pts.push({ x: wx, y: H * 0.9, z: wz * 0.88 }));
    }
  }
  return pts;
}

// ─── ARENA MAZE ───────────────────────────────────────────────────────────────
function gen_arena_maze(p: Record<string, number>): Point3D[] {
  const s       = p.scale  ?? 1;
  const size    = Math.max(5, Math.round(p.size  ?? 10));
  const H       = (p.wallH  ?? 3) * s;
  const seed    = Math.round(p.seed   ?? 42);
  const roomSz  = Math.min(Math.round(p.roomSz ?? 3), Math.floor(size / 2) - 1 || 1);
  const detail  = Math.round(p.detail ?? 2);
  const pts: Point3D[] = [];

  const cellW = size, cellH = size;
  const mid   = Math.floor(size / 2);

  // ── Seeded LCG RNG — different seed = completely different maze ──
  let rng = (seed * 6364136223846793005 + 1) >>> 0;
  const rand = () => {
    rng ^= rng << 13; rng ^= rng >> 17; rng ^= rng << 5;
    return (rng >>> 0) / 0xffffffff;
  };
  // Warm up the RNG
  for (let i = 0; i < 32; i++) rand();

  // ── Winner's room: clear a (roomSz×roomSz) zone at the grid centre ──
  const roomR0 = mid - Math.floor(roomSz / 2);
  const roomR1 = roomR0 + roomSz - 1;   // inclusive
  const roomC0 = mid - Math.floor(roomSz / 2);
  const roomC1 = roomC0 + roomSz - 1;

  // Wall grids (true = wall present)
  const hWalls: boolean[][] = Array.from({ length: cellH + 1 }, () => Array(cellW).fill(true));
  const vWalls: boolean[][] = Array.from({ length: cellH }, () => Array(cellW + 1).fill(true));
  const visited = Array.from({ length: cellH }, () => Array(cellW).fill(false));

  // Pre-clear all cells inside the winner's room and remove their internal walls
  for (let r = roomR0; r <= roomR1; r++) {
    for (let c = roomC0; c <= roomC1; c++) {
      visited[r][c] = true;
      if (r > roomR0) hWalls[r][c] = false;      // horizontal wall above
      if (c > roomC0) vWalls[r][c] = false;      // vertical wall to the left
    }
  }
  // Carve exactly one entry corridor from the centre of each side of the winner's room
  // into the first adjacent cell (the DFS will connect these to the rest of the maze)
  const roomMidR = Math.floor((roomR0 + roomR1) / 2);
  const roomMidC = Math.floor((roomC0 + roomC1) / 2);
  if (roomR0 > 0)        hWalls[roomR0][roomMidC]     = false; // North door
  if (roomR1 < cellH-1)  hWalls[roomR1+1][roomMidC]   = false; // South door
  if (roomC0 > 0)        vWalls[roomMidR][roomC0]     = false; // West door
  if (roomC1 < cellW-1)  vWalls[roomMidR][roomC1+1]   = false; // East door

  // ── Recursive-backtracker DFS — generates a perfect maze ──
  // Start the DFS from a cell adjacent to each door so all 4 doors connect
  const starts: [number, number][] = [];
  if (roomR0 > 0 && !visited[roomR0-1][roomMidC])        { starts.push([roomR0-1, roomMidC]); visited[roomR0-1][roomMidC] = true; }
  if (roomR1 < cellH-1 && !visited[roomR1+1][roomMidC])  { starts.push([roomR1+1, roomMidC]); visited[roomR1+1][roomMidC] = true; }
  if (roomC0 > 0 && !visited[roomMidR][roomC0-1])        { starts.push([roomMidR, roomC0-1]); visited[roomMidR][roomC0-1] = true; }
  if (roomC1 < cellW-1 && !visited[roomMidR][roomC1+1])  { starts.push([roomMidR, roomC1+1]); visited[roomMidR][roomC1+1] = true; }

  // Also start from the four corner cells of the grid for full coverage
  [[0,0],[0,cellW-1],[cellH-1,0],[cellH-1,cellW-1]].forEach(([r,c]) => {
    if (!visited[r][c]) { visited[r][c] = true; starts.push([r, c]); }
  });

  const stack: [number, number][] = [...starts];

  while (stack.length) {
    const idx = stack.length - 1;
    const [r, c] = stack[idx];
    const nbrs: [number, number, string][] = [];
    if (r > 0 && !visited[r-1][c]) nbrs.push([r-1, c, 'N']);
    if (r < cellH-1 && !visited[r+1][c]) nbrs.push([r+1, c, 'S']);
    if (c > 0 && !visited[r][c-1]) nbrs.push([r, c-1, 'W']);
    if (c < cellW-1 && !visited[r][c+1]) nbrs.push([r, c+1, 'E']);
    if (!nbrs.length) { stack.splice(idx, 1); continue; }
    const [nr, nc, dir] = nbrs[Math.floor(rand() * nbrs.length)];
    visited[nr][nc] = true;
    if (dir === 'N')      hWalls[r][c]     = false;
    else if (dir === 'S') hWalls[r+1][c]   = false;
    else if (dir === 'W') vWalls[r][c]     = false;
    else if (dir === 'E') vWalls[r][c+1]   = false;
    stack.push([nr, nc]);
  }

  // ── Render maze walls as vertical point columns ──
  const cellSz   = s * 2.5;
  const offX     = -(cellW * cellSz) / 2;
  const offZ     = -(cellH * cellSz) / 2;
  const wallSteps = 3;

  // Helper: skip wall segments that are INSIDE the winner's room
  const inRoom  = (r: number, c: number) => r >= roomR0 && r <= roomR1 && c >= roomC0 && c <= roomC1;
  // Skip a boundary wall only if BOTH cells it separates are inside the room
  const hSkip   = (r: number, c: number) => inRoom(r, c) && inRoom(r-1, c);
  const vSkip   = (r: number, c: number) => inRoom(r, c) && inRoom(r, c-1);

  for (let r = 0; r <= cellH; r++) {
    for (let c = 0; c < cellW; c++) {
      if (!hWalls[r][c]) continue;
      if (r > 0 && hSkip(r, c)) continue;
      const x1 = offX + c * cellSz, z = offZ + r * cellSz, x2 = x1 + cellSz;
      for (let i = 0; i <= wallSteps; i++) {
        const wx = x1 + (x2 - x1) * (i / wallSteps);
        for (let y = 0; y <= 3; y++) pts.push({ x: wx, y: y * H / 3, z });
      }
    }
  }
  for (let r = 0; r < cellH; r++) {
    for (let c = 0; c <= cellW; c++) {
      if (!vWalls[r][c]) continue;
      if (c > 0 && vSkip(r, c)) continue;
      const x = offX + c * cellSz, z1 = offZ + r * cellSz, z2 = z1 + cellSz;
      for (let i = 0; i <= wallSteps; i++) {
        const wz = z1 + (z2 - z1) * (i / wallSteps);
        for (let y = 0; y <= 3; y++) pts.push({ x, y: y * H / 3, z: wz });
      }
    }
  }

  // ── N/S outer maze entry pillars ──
  [[offX + cellW * cellSz * 0.5, offZ - cellSz * 0.5],
   [offX + cellW * cellSz * 0.5, offZ + cellH * cellSz + cellSz * 0.5]].forEach(([gx, gz]) => {
    [-1, 1].forEach(side => {
      for (let y = 0; y <= 4; y++) pts.push({ x: gx + side * cellSz * 0.35, y: y * H / 4, z: gz });
    });
  });

  // ── Winner's Room: explicit square walls with 4 arched doorways + corner pillars ──
  const rxMin = offX + roomC0 * cellSz;
  const rxMax = offX + (roomC1 + 1) * cellSz;
  const rzMin = offZ + roomR0 * cellSz;
  const rzMax = offZ + (roomR1 + 1) * cellSz;
  const rCX   = (rxMin + rxMax) / 2;
  const rCZ   = (rzMin + rzMax) / 2;
  const doorHalfW = cellSz * 0.38; // half-width of each arched doorway

  // Corner pillars of the winner's room (tall, prominent)
  [[rxMin, rzMin],[rxMax, rzMin],[rxMin, rzMax],[rxMax, rzMax]].forEach(([px, pz]) => {
    for (let y = 0; y <= 6; y++) pts.push({ x: px, y: y * H / 5, z: pz });
    pts.push({ x: px, y: H * 1.3, z: pz });
  });

  // 4 sides: draw wall segments, skip the doorway gap at the centre of each side
  const wSteps = Math.ceil((rxMax - rxMin) / (s * 0.8));
  for (let i = 0; i <= wSteps; i++) {
    const t  = i / wSteps;
    const wx = rxMin + t * (rxMax - rxMin);
    const nearDoor = Math.abs(wx - rCX) < doorHalfW;
    if (!nearDoor) {
      [rzMin, rzMax].forEach(wz => {
        for (let y = 0; y <= 4; y++) pts.push({ x: wx, y: y * H / 4, z: wz });
        pts.push({ x: wx, y: H * 1.1, z: wz }); // merlon
      });
    } else {
      // Arch crown over doorway
      for (let a = 0; a <= 5; a++) {
        const ang = (a / 5) * Math.PI;
        const ax  = rCX + Math.cos(ang) * doorHalfW * 0.9;
        const ay  = Math.sin(ang) * H * 0.45 + H * 0.1;
        [rzMin, rzMax].forEach(wz => pts.push({ x: ax, y: ay, z: wz }));
      }
    }
  }
  const dSteps = Math.ceil((rzMax - rzMin) / (s * 0.8));
  for (let i = 0; i <= dSteps; i++) {
    const t  = i / dSteps;
    const wz = rzMin + t * (rzMax - rzMin);
    const nearDoor = Math.abs(wz - rCZ) < doorHalfW;
    if (!nearDoor) {
      [rxMin, rxMax].forEach(wx => {
        for (let y = 0; y <= 4; y++) pts.push({ x: wx, y: y * H / 4, z: wz });
        pts.push({ x: wx, y: H * 1.1, z: wz });
      });
    } else {
      for (let a = 0; a <= 5; a++) {
        const ang = (a / 5) * Math.PI;
        const az  = rCZ + Math.cos(ang) * doorHalfW * 0.9;
        const ay  = Math.sin(ang) * H * 0.45 + H * 0.1;
        [rxMin, rxMax].forEach(wx => pts.push({ x: wx, y: ay, z: az }));
      }
    }
  }

  // ── Winner's Room: raised loot podium at centre ──
  // Square podium platform (3 tiers) — place your prize loot here
  const podSteps  = Math.ceil((rxMax - rxMin) * 0.38 / (s * 0.7));
  const podR      = (rxMax - rxMin) * 0.38;
  for (let tier = 0; tier < 3; tier++) {
    const pr = podR - tier * podR * 0.28;
    const py = tier * H * 0.2;
    for (let i = 0; i <= podSteps * 4; i++) {
      const ang = (i / (podSteps * 4)) * Math.PI * 2;
      pts.push({ x: rCX + Math.cos(ang) * pr, y: py, z: rCZ + Math.sin(ang) * pr });
    }
    // Flat top surface point grid
    if (tier === 2) {
      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          pts.push({ x: rCX + dx * pr * 0.35, y: py + H * 0.05, z: rCZ + dz * pr * 0.35 });
        }
      }
    }
  }
  // Loot spawn markers on podium surface (for the winner's prize)
  const lootRad = podR * 0.5;
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    pts.push({ x: rCX + Math.cos(ang) * lootRad, y: H * 0.4 + s * 0.1, z: rCZ + Math.sin(ang) * lootRad });
    pts.push({ x: rCX + Math.cos(ang) * lootRad, y: H * 0.4 + s * 0.6, z: rCZ + Math.sin(ang) * lootRad });
  }
  pts.push({ x: rCX, y: H * 0.4, z: rCZ });        // centre loot point
  pts.push({ x: rCX, y: H * 0.4 + s * 0.8, z: rCZ }); // second tier

  // Loot drops scattered through corridors
  for (let r = 0; r < cellH; r += 2) {
    for (let c = 0; c < cellW; c += 2) {
      if (inRoom(r, c)) continue; // skip inside winner's room
      const lx = offX + c * cellSz + cellSz * 0.5, lz = offZ + r * cellSz + cellSz * 0.5;
      pts.push({ x: lx, y: 0, z: lz });
    }
  }

  // ── MEDIUM: outer barbed-wire cap + stacked dead-end crates ──
  if (detail >= 2) {
    for (let c = 0; c < cellW; c++) {
      pts.push({ x: offX + c * cellSz + cellSz * 0.5, y: H * 1.12, z: offZ });
      pts.push({ x: offX + c * cellSz + cellSz * 0.5, y: H * 1.12, z: offZ + cellH * cellSz });
    }
    for (let r = 0; r < cellH; r++) {
      pts.push({ x: offX,                  y: H * 1.12, z: offZ + r * cellSz + cellSz * 0.5 });
      pts.push({ x: offX + cellW * cellSz, y: H * 1.12, z: offZ + r * cellSz + cellSz * 0.5 });
    }
    let cnt = 0;
    for (let r = 0; r < cellH; r += 2) {
      for (let c = 0; c < cellW; c += 2) {
        if (inRoom(r, c)) continue;
        if (cnt++ % 3 === 0) {
          pts.push({ x: offX + c * cellSz + cellSz * 0.5, y: s * 0.7, z: offZ + r * cellSz + cellSz * 0.5 });
        }
      }
    }
  }

  // ── HEAVY: winner's room elevated parapet ring + gang-plank ramps ──
  if (detail >= 3) {
    // Elevated walkway on top of winner's room walls
    const wRingSteps = 32;
    for (let i = 0; i <= wRingSteps; i++) {
      const t  = i / wRingSteps;
      const wx = rxMin + t * (rxMax - rxMin);
      [rzMin, rzMax].forEach(wz => pts.push({ x: wx, y: H * 1.05, z: wz }));
    }
    for (let i = 0; i <= wRingSteps; i++) {
      const t  = i / wRingSteps;
      const wz = rzMin + t * (rzMax - rzMin);
      [rxMin, rxMax].forEach(wx => pts.push({ x: wx, y: H * 1.05, z: wz }));
    }
    // 4 ramp access points — one per corridor leading to each doorway
    [[rCX, rzMin - cellSz], [rCX, rzMax + cellSz],
     [rxMin - cellSz, rCZ], [rxMax + cellSz, rCZ]].forEach(([sx, sz]) => {
      const dx = sx === rCX ? 0 : (sx < rCX ? 1 : -1);
      const dz = sz === rCZ ? 0 : (sz < rCZ ? 1 : -1);
      for (let step = 0; step <= 5; step++) {
        pts.push({ x: sx + dx * step * s * 0.4, y: step * H * 0.18, z: sz + dz * step * s * 0.4 });
      }
    });
  }

  // 🏆 TROPHY: Grenade_ChemGas at dead centre of winner's square podium
  pts.push({ x: rCX, y: H * 0.45 + s * 0.2, z: rCZ, name: "Grenade_ChemGas" as any });

  return pts;
}

// ─── ARENA SIEGE ──────────────────────────────────────────────────────────────
function gen_arena_siege(p: Record<string, number>): Point3D[] {
  const s = p.scale ?? 1;
  const W = (p.width ?? 35) * s;
  const wallH = (p.wallH ?? 6) * s;
  const towerH = (p.towerH ?? 14) * s;
  const detail = Math.round(p.detail ?? 2);
  const pts: Point3D[] = [];
  const hw = W / 2;

  // ─ DEFENDER SIDE (z < 0): Curtain wall with 3 towers ─
  const wallLen = W * 0.88, wallZ = -W * 0.3;
  const wallSegs = Math.ceil(wallLen / (s * 1.5));
  // Curtain wall
  for (let i = 0; i <= wallSegs; i++) {
    const wx = -wallLen / 2 + (i / wallSegs) * wallLen;
    for (let y = 0; y <= 5; y++) pts.push({ x: wx, y: y * wallH / 5, z: wallZ });
    if (i % 3 === 0) pts.push({ x: wx, y: wallH * 1.08, z: wallZ }); // merlon
  }
  // 3 wall towers (left, center, right)
  [-wallLen * 0.42, 0, wallLen * 0.42].forEach(tx => {
    const tR = s * 2.8;
    for (let a = 0; a < 10; a++) {
      const ang = (a / 10) * Math.PI * 2;
      for (let y = 0; y <= 8; y++) pts.push({ x: tx + Math.cos(ang) * tR, y: y * wallH * 1.4 / 8, z: wallZ + Math.sin(ang) * tR });
    }
    // Tower battlements
    for (let a = 0; a < 12; a++) {
      const ang = (a / 12) * Math.PI * 2;
      if (a % 2 === 0) pts.push({ x: tx + Math.cos(ang) * tR, y: wallH * 1.5, z: wallZ + Math.sin(ang) * tR });
    }
  });
  // Gate — center gap in wall with portcullis arch
  for (let a = 0; a <= 8; a++) {
    const ang = (a / 8) * Math.PI;
    pts.push({ x: Math.cos(ang) * s * 2.5, y: Math.sin(ang) * wallH * 0.55 + wallH * 0.05, z: wallZ });
  }
  // Defender side walls (return walls)
  [-1, 1].forEach(side => {
    const rx = side * wallLen * 0.44;
    const rLen = W * 0.22;
    for (let i = 0; i <= 5; i++) {
      const rz = wallZ + (i / 5) * rLen;
      for (let y = 0; y <= 4; y++) pts.push({ x: rx, y: y * wallH / 4, z: rz });
    }
  });

  // ─ CENTRAL KEEP / OBJECTIVE TOWER ─ (z = +W*0.18)
  const keepZ = W * 0.18, keepR = s * 4.5;
  for (let y = 0; y <= 16; y++) {
    const yr = y / 16;
    const r = keepR * (1 - yr * 0.12); // slight taper
    const segs = 10;
    for (let a = 0; a < segs; a++) {
      const ang = (a / segs) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * r, y: yr * towerH, z: keepZ + Math.sin(ang) * r });
    }
  }
  // Keep battlements
  for (let a = 0; a < 16; a++) {
    const ang = (a / 16) * Math.PI * 2;
    const cr = keepR * 0.88;
    if (a % 2 === 0) pts.push({ x: Math.cos(ang) * cr, y: towerH * 1.07, z: keepZ + Math.sin(ang) * cr });
    pts.push({ x: Math.cos(ang) * cr, y: towerH, z: keepZ + Math.sin(ang) * cr });
  }
  // Keep entrance ramp
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    pts.push({ x: 0, y: t * towerH * 0.12, z: keepZ - keepR - t * s * 3 });
    [-1, 1].forEach(side => pts.push({ x: side * s * 1.2, y: t * towerH * 0.12, z: keepZ - keepR - t * s * 3 }));
  }
  // Keep balcony at mid-height
  for (let a = 0; a < 12; a++) {
    const ang = (a / 12) * Math.PI * 2;
    pts.push({ x: Math.cos(ang) * (keepR + s * 0.8), y: towerH * 0.5, z: keepZ + Math.sin(ang) * (keepR + s * 0.8) });
  }

  // ─ ATTACKER SIDE (z > 0): Spawn trenches + ladder ─
  const attackerZ = W * 0.38;
  [-1, 1].forEach(side => {
    const trX = side * hw * 0.45;
    for (let i = 0; i <= 8; i++) {
      const tz = attackerZ + i * s * 0.9;
      pts.push({ x: trX, y: -s * 0.8, z: tz });
      pts.push({ x: trX + side * s * 1.5, y: -s * 0.8, z: tz });
      pts.push({ x: trX, y: 0, z: tz });
    }
  });
  // Approach ladders / sandbag cover toward the keep
  [-hw * 0.3, hw * 0.3].forEach(lx => {
    for (let i = 0; i <= 5; i++) {
      const lz = attackerZ - i * (attackerZ - keepZ - keepR * 1.5) / 5;
      pts.push({ x: lx, y: 0, z: lz });
      pts.push({ x: lx, y: s * 1.1, z: lz });
    }
  });

  // ─ ARENA BOUNDARY WALL (outer ring) ─
  const boundR = hw * 1.05;
  for (let a = 0; a < 48; a++) {
    const ang = (a / 48) * Math.PI * 2;
    for (let y = 0; y <= 2; y++) pts.push({ x: Math.cos(ang) * boundR, y: y * s, z: Math.sin(ang) * boundR });
  }

  // ── MEDIUM: wall-walk on curtain wall + stair towers + attacker crate cover ──
  if (detail >= 2) {
    const wallLen2 = W * 0.88, wallZ2 = -W * 0.3;
    // Wall-walk on curtain top
    for (let i = 0; i <= 12; i++) {
      const wx = -wallLen2 / 2 + (i / 12) * wallLen2;
      pts.push({ x: wx, y: wallH * 0.9, z: wallZ2 * 0.93 });
    }
    // Stair ramp at each wall tower (3 towers)
    [-wallLen2 * 0.42, 0, wallLen2 * 0.42].forEach(tx => {
      for (let step = 0; step <= 5; step++) {
        pts.push({ x: tx, y: step * wallH * 0.22, z: wallZ2 + step * s * 0.6 });
        pts.push({ x: tx + s * 0.8, y: step * wallH * 0.22, z: wallZ2 + step * s * 0.6 });
      }
    });
    // Attacker-side wooden crate cover clusters
    [-hw * 0.35, hw * 0.35].forEach(lx => {
      for (let i = -2; i <= 2; i++) {
        pts.push({ x: lx + i * s * 0.7, y: 0, z: W * 0.28 });
        pts.push({ x: lx + i * s * 0.7, y: s * 0.8, z: W * 0.28 });
      }
    });
    // Keep stair ramp (double-staircase)
    const keepZ2 = W * 0.18, keepR2 = s * 4.5;
    [-1, 1].forEach(side => {
      for (let step = 0; step <= 7; step++) {
        pts.push({ x: side * s * 1.5, y: step * towerH * 0.12, z: keepZ2 - keepR2 - step * s * 0.5 });
      }
    });
  }
  // ── HEAVY: tower walkway rings + keep balcony barbed wire + pallet stacks ──
  if (detail >= 3) {
    // Tower cap rings (walkway on top of each wall tower)
    const wallLen3 = W * 0.88, wallZ3 = -W * 0.3;
    [-wallLen3 * 0.42, 0, wallLen3 * 0.42].forEach(tx => {
      for (let a = 0; a < 12; a++) {
        const ang = (a / 12) * Math.PI * 2;
        pts.push({ x: tx + Math.cos(ang) * s * 2.4, y: wallH * 1.5, z: wallZ3 + Math.sin(ang) * s * 2.4 });
      }
    });
    // Keep top platform walkway
    const keepZ3 = W * 0.18;
    for (let a = 0; a < 18; a++) {
      const ang = (a / 18) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * s * 3.5, y: towerH * 1.05, z: keepZ3 + Math.sin(ang) * s * 3.5 });
    }
    // Barbed wire on outer ring
    for (let a = 0; a < 56; a++) {
      const ang = (a / 56) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * boundR, y: s * 1.3, z: Math.sin(ang) * boundR });
    }
    // Pallet stacks flanking gate
    [-s * 3, s * 3].forEach(ox => {
      for (let y = 0; y <= 3; y++) pts.push({ x: ox, y: y * s * 0.55, z: wallZ3 });
    });
  }
  return pts;
}

// ─── ARENA COMPOUND ───────────────────────────────────────────────────────────
function gen_arena_compound(p: Record<string, number>): Point3D[] {
  const s = p.scale ?? 1;
  const W = (p.width ?? 32) * s;
  const D = (p.depth ?? 24) * s;
  const H = (p.height ?? 4) * s;
  const rows = Math.max(1, Math.round(p.rows ?? 3)); // interior cover rows
  const detail = Math.round(p.detail ?? 2);
  const pts: Point3D[] = [];
  const hw = W / 2, hd = D / 2;

  // Perimeter fence wall
  const segW = Math.ceil(W / (s * 1.2)), segD = Math.ceil(D / (s * 1.2));
  for (let i = 0; i <= segW; i++) {
    const wx = -hw + (i / segW) * W;
    [-hd, hd].forEach(wz => {
      for (let y = 0; y <= 3; y++) pts.push({ x: wx, y: y * H / 3, z: wz });
    });
  }
  for (let i = 0; i <= segD; i++) {
    const wz = -hd + (i / segD) * D;
    [-hw, hw].forEach(wx => {
      for (let y = 0; y <= 3; y++) pts.push({ x: wx, y: y * H / 3, z: wz });
    });
  }

  // Corner watchtowers
  [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].forEach(([tx, tz]) => {
    const tR = s * 2.0;
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      for (let y = 0; y <= 8; y++) pts.push({ x: tx + Math.cos(ang) * tR, y: y * H * 1.8 / 8, z: tz + Math.sin(ang) * tR });
    }
    // Ladder rungs
    for (let y = 0; y <= 6; y++) pts.push({ x: tx, y: y * H * 1.8 / 8, z: tz + tR });
  });

  // Entry gates N/S
  [[0, -hd], [0, hd]].forEach(([gx, gz]) => {
    for (let y = 0; y <= 4; y++) {
      [-s * 1.8, s * 1.8].forEach(ox => pts.push({ x: gx + ox, y: y * H / 4, z: gz }));
    }
    // Gate arch
    for (let a = 0; a <= 6; a++) {
      const ang = (a / 6) * Math.PI;
      pts.push({ x: gx + Math.cos(ang) * s * 1.8, y: Math.sin(ang) * H * 0.5 + H * 0.05, z: gz });
    }
  });

  // Interior cover rows (horizontal barricade lines)
  for (let r = 0; r < rows; r++) {
    const rz = -hd * 0.65 + (r / Math.max(rows - 1, 1)) * D * 0.65;
    const gaps = [hw * 0.3 * ((r % 2 === 0) ? -1 : 1)]; // stagger gaps left/right
    for (let i = 0; i <= Math.ceil(W / (s * 1.5)); i++) {
      const wx = -hw * 0.85 + (i / Math.ceil(W / (s * 1.5))) * W * 0.85 * 2;
      const nearGap = gaps.some(g => Math.abs(wx - g) < s * 2.5);
      if (!nearGap) {
        pts.push({ x: wx, y: 0, z: rz });
        pts.push({ x: wx, y: s * 1.5, z: rz });
      }
    }
    // Flanking sandbag pillars
    [-hw * 0.85, hw * 0.85].forEach(flx => {
      for (let y = 0; y <= 2; y++) pts.push({ x: flx, y: y * s * 0.6, z: rz });
    });
  }

  // Central loot area — crate cluster
  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 2;
    pts.push({ x: Math.cos(ang) * s * 3, y: 0, z: Math.sin(ang) * s * 3 });
    pts.push({ x: Math.cos(ang) * s * 3, y: s * 1.0, z: Math.sin(ang) * s * 3 });
  }
  // Center podium / flag stand
  for (let y = 0; y <= 5; y++) pts.push({ x: 0, y: y * s * 0.4, z: 0 });

  // Objective markers — 4 cardinal capture points inside
  [[0, -hd * 0.55], [0, hd * 0.55], [-hw * 0.55, 0], [hw * 0.55, 0]].forEach(([ox, oz]) => {
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2;
      pts.push({ x: ox + Math.cos(ang) * s * 1.2, y: 0, z: oz + Math.sin(ang) * s * 1.2 });
      pts.push({ x: ox + Math.cos(ang) * s * 1.2, y: s * 0.8, z: oz + Math.sin(ang) * s * 1.2 });
    }
  });

  // Vehicle blocker X-positions
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    pts.push({ x: i * hw * 0.35, y: 0, z: -hd });
    pts.push({ x: i * hw * 0.35, y: s, z: -hd });
    pts.push({ x: i * hw * 0.35, y: 0, z: hd });
    pts.push({ x: i * hw * 0.35, y: s, z: hd });
  }
  // ── MEDIUM: watchtower stair ladders + garbage-container cover rows ──
  if (detail >= 2) {
    // External ladder rungs at each corner tower
    [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].forEach(([tx, tz]) => {
      for (let step = 0; step <= 6; step++) {
        pts.push({ x: tx + Math.sign(tx) * s * 0.4, y: step * H * 0.22, z: tz });
        pts.push({ x: tx, y: step * H * 0.22, z: tz + Math.sign(tz) * s * 0.4 });
      }
    });
    // Garbage container clusters at 6 interior positions
    [[-hw * 0.5, 0], [hw * 0.5, 0], [0, -hd * 0.4], [0, hd * 0.4],
     [-hw * 0.55, -hd * 0.45], [hw * 0.55, hd * 0.45]].forEach(([cx, cz]) => {
      for (let dy = 0; dy <= 1; dy++) pts.push({ x: cx, y: dy * s * 0.9, z: cz });
      pts.push({ x: cx + s * 1.1, y: 0, z: cz });
      pts.push({ x: cx - s * 1.1, y: 0, z: cz });
    });
    // Wall-top walk (inset from outer edge)
    for (let i = 0; i <= Math.ceil(W / (s * 1.8)); i++) {
      const wx = -hw * 0.94 + (i / Math.ceil(W / (s * 1.8))) * W * 0.94;
      [-hd, hd].forEach(wz => pts.push({ x: wx, y: H * 0.88, z: wz * 0.95 }));
    }
  }
  // ── HEAVY: full perimeter parapet walk + wooden crate towers + barbed cap ──
  if (detail >= 3) {
    // Side wall-top walks
    for (let i = 0; i <= Math.ceil(D / (s * 1.8)); i++) {
      const wz = -hd * 0.94 + (i / Math.ceil(D / (s * 1.8))) * D * 0.94;
      [-hw, hw].forEach(wx => pts.push({ x: wx * 0.95, y: H * 0.88, z: wz }));
    }
    // Wooden crate towers at all 4 quadrant objectives
    [[0, -hd * 0.55], [0, hd * 0.55], [-hw * 0.55, 0], [hw * 0.55, 0]].forEach(([ox, oz]) => {
      for (let y = 0; y <= 4; y++) pts.push({ x: ox, y: y * s * 0.65, z: oz });
    });
    // Barbed wire cap on perimeter
    for (let i = 0; i <= Math.ceil(W / (s * 0.9)); i++) {
      const wx = -hw + (i / Math.ceil(W / (s * 0.9))) * W;
      [-hd, hd].forEach(wz => pts.push({ x: wx, y: H * 1.2, z: wz }));
    }
    for (let i = 0; i <= Math.ceil(D / (s * 0.9)); i++) {
      const wz = -hd + (i / Math.ceil(D / (s * 0.9))) * D;
      [-hw, hw].forEach(wx => pts.push({ x: wx, y: H * 1.2, z: wz }));
    }
  }
  return pts;
}

function gen_wall_perimeter(p: Record<string, number>): Point3D[] {
  const s       = p.scale ?? 1;
  const W       = (p.width ?? 30) * s;
  const D       = (p.depth ?? 30) * s;
  const wallH   = (p.wallH ?? 3) * s;
  const spacing = Math.max(0.5, (p.wallSpacing ?? 3) * s);
  const gapN    = (p.gapN ?? 0) > 0.5;
  const gapS    = (p.gapS ?? 1) > 0.5;
  const gapE    = (p.gapE ?? 0) > 0.5;
  const gapW    = (p.gapW ?? 0) > 0.5;
  const gapHW   = (p.gapWidth ?? 4) * s / 2;
  const corners = (p.corners ?? 1) > 0.5;
  const tH      = (p.towerH ?? 8) * s;

  const pts: Point3D[] = [];
  const hw = W / 2, hd = D / 2;
  const wallLayers   = Math.max(2, Math.round(wallH / 1.5));
  const towerLayers  = Math.max(3, Math.round(tH / 1.5));

  const addSide = (
    x1: number, z1: number, x2: number, z2: number, hasGate: boolean
  ) => {
    const len = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
    const n   = Math.ceil(len / spacing);
    const cx  = (x1 + x2) / 2, cz = (z1 + z2) / 2;
    for (let i = 0; i <= n; i++) {
      const t  = i / n;
      const wx = x1 + (x2 - x1) * t, wz = z1 + (z2 - z1) * t;
      const distFromMid = Math.sqrt((wx - cx) ** 2 + (wz - cz) ** 2);
      if (hasGate && distFromMid < gapHW) {
        if (Math.abs(distFromMid - gapHW) < spacing * 0.75) {
          for (let y = 0; y <= towerLayers; y++)
            pts.push({ x: wx, y: (y / towerLayers) * tH, z: wz });
        }
        continue;
      }
      for (let y = 0; y <= wallLayers; y++)
        pts.push({ x: wx, y: (y / wallLayers) * wallH, z: wz });
    }
  };

  addSide(-hw,  hd,  hw,  hd,  gapN);
  addSide(-hw, -hd,  hw, -hd,  gapS);
  addSide( hw, -hd,  hw,  hd,  gapE);
  addSide(-hw, -hd, -hw,  hd,  gapW);

  if (corners) {
    const tR = spacing * 0.8;
    ([[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]] as [number, number][]).forEach(([cx, cz]) => {
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        for (let y = 0; y <= towerLayers; y++)
          pts.push({
            x: cx + Math.cos(ang) * tR,
            y: (y / towerLayers) * tH,
            z: cz + Math.sin(ang) * tR,
          });
      }
    });
  }

  return pts;
}

// ─── IRON THRONE (Game of Thrones) ────────────────────────────────────────────
function gen_iron_throne(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const s = p.scale ?? 1;
  const totalH = (p.height ?? 14) * s;
  const spikeCount = Math.round(p.spikeCount ?? 11);

  // === DAIS — 3 stepped tiers (ascending platform) ===
  for (let tier = 0; tier < 3; tier++) {
    const w = (10 - tier * 2) * s;
    const d = (8 - tier * 1.5) * s;
    const y = tier * 1.5 * s;
    const sp = 1.5 * s;
    for (let x = -w / 2; x <= w / 2; x += sp) {
      pts.push({ x, y, z: -d / 2 });
      pts.push({ x, y, z:  d / 2 });
    }
    for (let z = -d / 2 + sp; z < d / 2; z += sp) {
      pts.push({ x: -w / 2, y, z });
      pts.push({ x:  w / 2, y, z });
    }
  }

  // === THRONE SEAT — raised platform ===
  const seatY = 4.5 * s;
  const seatW = 5 * s;
  const seatD = 3.5 * s;
  const sp2 = 1.2 * s;
  for (let x = -seatW / 2; x <= seatW / 2; x += sp2) {
    pts.push({ x, y: seatY, z: -seatD / 2 });
    pts.push({ x, y: seatY, z:  seatD / 2 });
  }
  for (let z = -seatD / 2 + sp2; z < seatD / 2; z += sp2) {
    pts.push({ x: -seatW / 2, y: seatY, z });
    pts.push({ x:  seatW / 2, y: seatY, z });
  }
  for (let x = -seatW / 2 + sp2; x < seatW / 2; x += sp2 * 1.5) {
    for (let z = -seatD / 2 + sp2; z < seatD / 2; z += sp2 * 1.5) {
      pts.push({ x, y: seatY, z });
    }
  }

  // === ARMRESTS — horizontal bars flanking seat ===
  const armY = seatY + 1.5 * s;
  for (let z = -seatD / 2 - sp2; z <= seatD / 2 + sp2; z += sp2) {
    pts.push({ x: -seatW / 2, y: armY, z });
    pts.push({ x:  seatW / 2, y: armY, z });
  }
  // armrest caps extending forward
  for (let x = -seatW / 2 - sp2; x <= seatW / 2 + sp2; x += sp2) {
    pts.push({ x, y: armY, z: -seatD / 2 - sp2 });
  }

  // === SWORD-SPIKE BACK — the iconic tall jagged crown ===
  // Center spike tallest, edges shorter — classic Iron Throne silhouette
  const backZ = seatD / 2 + 0.5 * s;
  const backW = 9 * s;
  for (let i = 0; i < spikeCount; i++) {
    const t = i / (spikeCount - 1); // 0 = left edge, 1 = right edge
    const x = -backW / 2 + t * backW;
    const centerF = 1 - Math.abs(t - 0.5) * 1.8;
    const spikeTopY = seatY + totalH * Math.max(0.1, centerF);
    const spikeLen = spikeTopY - seatY;
    const steps = Math.max(2, Math.round(spikeLen / (1.6 * s)));
    for (let j = 0; j <= steps; j++) {
      const y = seatY + (j / steps) * spikeLen;
      const lean = (t - 0.5) * j * 0.4 * s; // swords splay outward from center
      const fwd  = -j * 0.05 * s;            // subtle forward tilt
      pts.push({ x: x + lean, y, z: backZ + fwd });
    }
  }

  // === CROSS-SWORDS — protruding melted blades at various angles ===
  const prongsCount = Math.round(spikeCount * 0.7);
  for (let i = 0; i < prongsCount; i++) {
    const t = i / prongsCount;
    const angle = (t - 0.5) * Math.PI * 0.9; // ±81° horizontal fan
    const baseX = (-backW / 2 + t * backW) * 0.65;
    const baseY = seatY + 1.5 * s + (i % 4) * 2.0 * s;
    const pLen  = 3.5 * s;
    for (let j = 1; j <= 3; j++) {
      const r = pLen * j / 3;
      pts.push({
        x: baseX + Math.sin(angle) * r,
        y: baseY + Math.cos(angle) * r * 0.35,
        z: backZ - r * 0.12,
      });
    }
  }

  return pts;
}

// ─── GOTHIC ARCH ─────────────────────────────────────────────────────────────
// Series of pointed Gothic arches (arcade). bays = number of arches along depth axis.
function gen_gothic_arch(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const w = d(p, 'width', 10);      // arch inner clear width
  const h = d(p, 'height', 20);     // apex height from ground
  const depth = d(p, 'depth', 40);  // total length of arcade
  const bays = Math.max(1, Math.round(d(p, 'bays', 3)));
  const thickness = d(p, 'thickness', 2); // arch ring depth (front+back face)
  const pillarW = d(p, 'pillarW', 2.5);   // width of each pillar

  const baySpacing = depth / bays;
  const N = 24; // points per arch half

  // Pointed gothic arch: two circles offset from centre so they intersect at top
  // Each half uses radius = 0.7*w centred at ±w/2 from arch centre
  const R = w * 0.72;

  function archPoints(zPos: number): void {
    // Left half arc: centre at (-w/2 + R*overlap, springH) where springH = 0
    // Standard gothic: circles centred at 0 and w, radius = w
    for (let i = 0; i <= N; i++) {
      const t = i / N; // 0 = base, 1 = apex
      // left arc: centre (0, 0), radius R — sweeps from 90° clockwise to 60° ish
      const a = (Math.PI / 2) + t * (Math.PI / 3);
      const x = -w / 2 + R - R * Math.cos(a);
      const y = R * Math.sin(a);
      if (y >= 0 && y <= h) {
        pts.push({ x, y, z: zPos });
        pts.push({ x, y, z: zPos + thickness });
      }
    }
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const a = (Math.PI / 2) + t * (Math.PI / 3);
      const x = w / 2 - R + R * Math.cos(a);
      const y = R * Math.sin(a);
      if (y >= 0 && y <= h) {
        pts.push({ x, y, z: zPos });
        pts.push({ x, y, z: zPos + thickness });
      }
    }
    // Floor line & pillar base
    const pSteps = Math.max(2, Math.round(pillarW / 1.5));
    for (let j = 0; j <= pSteps; j++) {
      const frac = j / pSteps;
      pts.push({ x: -w / 2 - pillarW * frac, y: 0, z: zPos });
      pts.push({ x:  w / 2 + pillarW * frac, y: 0, z: zPos });
    }
    // Pillar height
    const pillarSteps = Math.max(2, Math.round(h * 0.4 / 2));
    for (let j = 0; j <= pillarSteps; j++) {
      const py = (j / pillarSteps) * h * 0.4;
      pts.push({ x: -w / 2 - pillarW / 2, y: py, z: zPos });
      pts.push({ x:  w / 2 + pillarW / 2, y: py, z: zPos });
    }
  }

  // Place arches along depth axis
  for (let b = 0; b <= bays; b++) {
    archPoints(b * baySpacing);
  }
  // Connecting top spine (ridge line) along arcade length
  const ridgeSteps = Math.max(8, bays * 4);
  for (let i = 0; i <= ridgeSteps; i++) {
    pts.push({ x: 0, y: h, z: (i / ridgeSteps) * depth });
  }
  // Side walkway (at bottom) along length
  const walkSteps = Math.max(8, bays * 4);
  for (let i = 0; i <= walkSteps; i++) {
    const z = (i / walkSteps) * depth;
    pts.push({ x: -w / 2 - pillarW, y: 0, z });
    pts.push({ x:  w / 2 + pillarW, y: 0, z });
  }
  return pts;
}

// ─── BRIDGE TRUSS ─────────────────────────────────────────────────────────────
// Warren truss bridge with diagonal members, top/bottom chords, and deck beams.
function gen_bridge_truss(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const length = d(p, 'span', 60), height = d(p, 'height', 15);
  const width  = d(p, 'width', 10), panels = Math.max(4, Math.round(d(p, 'panels', 12)));
  const supportPillars = Math.round(d(p, 'pillars', 2));

  const panelLen = length / panels;
  const hw = width / 2;

  // For each of 2 side trusses (at +hw and -hw)
  for (const side of [-hw, hw]) {
    // Top chord
    const topSteps = panels * 4;
    for (let i = 0; i <= topSteps; i++) {
      pts.push({ x: (i / topSteps) * length, y: height, z: side });
    }
    // Bottom chord (deck level)
    for (let i = 0; i <= topSteps; i++) {
      pts.push({ x: (i / topSteps) * length, y: 0, z: side });
    }
    // Vertical end posts
    const postSteps = Math.max(3, Math.round(height / 3));
    for (let j = 0; j <= postSteps; j++) {
      pts.push({ x: 0,      y: (j / postSteps) * height, z: side });
      pts.push({ x: length, y: (j / postSteps) * height, z: side });
    }
    // Warren diagonals — alternating direction
    for (let i = 0; i < panels; i++) {
      const x0 = i * panelLen;
      const x1 = (i + 1) * panelLen;
      const diagSteps = Math.max(4, Math.round(Math.sqrt(panelLen ** 2 + height ** 2) / 2));
      if (i % 2 === 0) {
        // diagonal: bottom-left to top-right
        for (let k = 0; k <= diagSteps; k++) {
          const t = k / diagSteps;
          pts.push({ x: x0 + t * panelLen, y: t * height, z: side });
        }
      } else {
        // diagonal: top-left to bottom-right
        for (let k = 0; k <= diagSteps; k++) {
          const t = k / diagSteps;
          pts.push({ x: x0 + t * panelLen, y: height - t * height, z: side });
        }
      }
    }
  }

  // Cross-deck beams (connecting the two sides at bottom and top)
  const beamCount = panels + 1;
  const crossSteps = Math.max(4, Math.round(width / 2));
  for (let i = 0; i < beamCount; i++) {
    const bx = i * panelLen;
    for (let k = 0; k <= crossSteps; k++) {
      const z = -hw + (k / crossSteps) * width;
      pts.push({ x: bx, y: 0,      z });
      pts.push({ x: bx, y: height, z });
    }
  }

  // Deck surface cross-planks
  const deckPlanks = Math.max(panels, 16);
  for (let i = 0; i <= deckPlanks; i++) {
    const x = (i / deckPlanks) * length;
    for (let k = 0; k <= crossSteps; k++) {
      pts.push({ x, y: 0, z: -hw + (k / crossSteps) * width });
    }
  }

  // Under-structure support pillars
  if (supportPillars > 0) {
    const pillarH = p.pillarH ?? 12;
    for (let i = 1; i <= supportPillars; i++) {
      const px = length * i / (supportPillars + 1);
      const pSteps = Math.max(4, Math.round(pillarH / 2));
      for (let j = 0; j <= pSteps; j++) {
        const py = -pillarH + (j / pSteps) * pillarH;
        pts.push({ x: px, y: py, z: -hw });
        pts.push({ x: px, y: py, z:  hw });
      }
      // Footing
      for (let k = 0; k <= crossSteps; k++) {
        pts.push({ x: px, y: -pillarH, z: -hw + (k / crossSteps) * width });
      }
    }
  }

  return pts;
}

// ─── AMPHITHEATER ─────────────────────────────────────────────────────────────
// Tiered semi-circular seating bowl — arena/event venue.
function gen_amphitheater(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const innerR   = p.innerR  ?? 12;   // stage/floor radius
  const rows     = Math.max(2, Math.round(p.rows ?? 8));
  const rowD     = p.rowD    ?? 3.5;  // depth per row
  const rowH     = p.rowH    ?? 1.5;  // rise per row
  const arcDeg   = p.arcDeg  ?? 200;  // arc of seating (180 = semi, 360 = full)
  const ptsPerRow = Math.max(12, Math.round(p.segsPerRow ?? 28));
  const withStage = (p.stage ?? 1) > 0;

  const arcRad = arcDeg * Math.PI / 180;
  const startAngle = -arcRad / 2 - Math.PI / 2;

  for (let r = 0; r < rows; r++) {
    const radius = innerR + r * rowD;
    const y = r * rowH;
    for (let i = 0; i <= ptsPerRow; i++) {
      const a = startAngle + (i / ptsPerRow) * arcRad;
      pts.push({ x: radius * Math.cos(a), y, z: radius * Math.sin(a) });
    }
    // Riser (vertical face of each tier)
    const riserSteps = Math.max(2, Math.round(rowH / 0.8));
    for (let i = 0; i <= ptsPerRow; i++) {
      const a = startAngle + (i / ptsPerRow) * arcRad;
      for (let j = 0; j <= riserSteps; j++) {
        const ry = (r - 1) * rowH + (j / riserSteps) * rowH;
        if (ry >= 0) pts.push({ x: radius * Math.cos(a), y: ry, z: radius * Math.sin(a) });
      }
    }
  }

  // Stage floor
  if (withStage) {
    const stageR = innerR;
    const stageSegs = Math.max(12, Math.round(p.segsPerRow ?? 28));
    const stageRings = Math.max(2, Math.round(stageR / 4));
    for (let ri = 0; ri <= stageRings; ri++) {
      const r = (ri / stageRings) * stageR;
      for (let i = 0; i < stageSegs; i++) {
        const a = 2 * Math.PI * i / stageSegs;
        pts.push({ x: r * Math.cos(a), y: 0, z: r * Math.sin(a) });
      }
    }
  }

  // Outer retaining walls at the two open ends
  const outerR = innerR + rows * rowD;
  const wallSteps = Math.max(4, Math.round(rows * rowH / 2));
  for (let j = 0; j <= wallSteps; j++) {
    const wy = (j / wallSteps) * (rows * rowH);
    const a0 = startAngle;
    const a1 = startAngle + arcRad;
    pts.push({ x: innerR * Math.cos(a0), y: wy, z: innerR * Math.sin(a0) });
    pts.push({ x: outerR * Math.cos(a0), y: wy, z: outerR * Math.sin(a0) });
    pts.push({ x: innerR * Math.cos(a1), y: wy, z: innerR * Math.sin(a1) });
    pts.push({ x: outerR * Math.cos(a1), y: wy, z: outerR * Math.sin(a1) });
  }

  return pts;
}

// ─── VAULTED CEILING ──────────────────────────────────────────────────────────
// Barrel vault with optional cross-ribbing — cathedral/crypt ceiling.
function gen_vaulted_ceiling(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const width  = d(p, 'width', 20);  // span of each arch
  const length = d(p, 'depth', 30);  // length of the vault
  const height = d(p, 'height', 10); // user-defined peak height
  const bays   = Math.max(1, Math.round(d(p, 'bays', 3)));
  const ribSegs = Math.max(8, Math.round(d(p, 'ribSegs', 16))); // points per arch rib
  const withFloor = (p.floor ?? 0) > 0;
  const withWalls = (p.walls ?? 1) > 0;

  const bayLen  = length / bays;
  const hw      = width / 2;
  const archR   = hw;
  const apex    = height; // height of apex above springing line

  // Longitudinal rib spacing (along length)
  const longRibs = Math.max(4, Math.round(p.longRibs ?? 8));

  // Main transverse arch ribs (at each bay boundary)
  for (let b = 0; b <= bays; b++) {
    const z = b * bayLen;
    for (let i = 0; i <= ribSegs; i++) {
      const a = (i / ribSegs) * Math.PI;
      const x = -hw + archR - archR * Math.cos(a);
      const y = apex * Math.sin(a);
      pts.push({ x: x - hw + archR, y, z });
    }
  }

  // Longitudinal barrel surface — lines running along the vault length
  for (let i = 0; i <= longRibs; i++) {
    const a = (i / longRibs) * Math.PI;
    const x = -hw + archR * (1 - Math.cos(a));
    const y = archR * Math.sin(a);
    const lenSteps = Math.max(8, bays * 4);
    for (let j = 0; j <= lenSteps; j++) {
      pts.push({ x: x - hw + archR, y, z: (j / lenSteps) * length });
    }
  }

  // Cross-groin ribs (diagonal — Gothic cross vault feel)
  for (let b = 0; b < bays; b++) {
    const z0 = b * bayLen;
    const z1 = (b + 1) * bayLen;
    const groinSteps = Math.max(8, Math.round(Math.sqrt((bayLen) ** 2 + (width) ** 2) / 2));
    for (let i = 0; i <= groinSteps; i++) {
      const t = i / groinSteps;
      const a = t * Math.PI;
      const y = archR * Math.sin(a) * 0.9;
      // diagonal left-front to right-back
      pts.push({ x: -hw + t * width, y, z: z0 + t * bayLen });
      // diagonal right-front to left-back
      pts.push({ x: hw - t * width, y, z: z0 + t * bayLen });
    }
  }

  // Side walls (pillars down to floor)
  if (withWalls) {
    const wallH = p.wallH ?? 4;
    const wallSteps = Math.max(4, Math.round(wallH / 2));
    for (let b = 0; b <= bays; b++) {
      const z = b * bayLen;
      for (let j = 0; j <= wallSteps; j++) {
        const wy = -wallH + (j / wallSteps) * wallH;
        pts.push({ x: -hw, y: wy, z });
        pts.push({ x:  hw, y: wy, z });
      }
    }
    // Longitudinal wall bottom line
    const longSteps = bays * 4;
    for (let i = 0; i <= longSteps; i++) {
      pts.push({ x: -hw, y: -(p.wallH ?? 4), z: (i / longSteps) * length });
      pts.push({ x:  hw, y: -(p.wallH ?? 4), z: (i / longSteps) * length });
    }
  }

  // Floor
  if (withFloor) {
    const floorY = -(p.wallH ?? 4);
    const fx = Math.max(4, Math.round(width / 3));
    const fz = Math.max(4, bays * 3);
    for (let i = 0; i <= fx; i++) {
      for (let j = 0; j <= fz; j++) {
        pts.push({ x: -hw + (i / fx) * width, y: floorY, z: (j / fz) * length });
      }
    }
  }

  return pts;
}

// ─── PITCHED ROOF FRAME ───────────────────────────────────────────────────────
// Peaked roof truss system — rafters, ridge beam, collar ties, king posts.
function gen_pitched_roof(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const width  = p.width  ?? 20;   // total width (eave to eave)
  const length = p.length ?? 40;   // ridge length
  const pitch  = p.pitch  ?? 8;    // rise from eave to ridge
  const bays   = Math.max(2, Math.round(p.bays ?? 8)); // number of rafter pairs
  const withCollarTie = (p.collarTie ?? 1) > 0;
  const withKingPost  = (p.kingPost  ?? 1) > 0;

  const hw     = width / 2;
  const bayLen = length / bays;
  const rafterLen = Math.sqrt(hw ** 2 + pitch ** 2);
  const rafterSteps = Math.max(6, Math.round(rafterLen / 2));

  for (let b = 0; b <= bays; b++) {
    const z = b * bayLen;
    // Left rafter: from (-hw, 0) to (0, pitch)
    for (let i = 0; i <= rafterSteps; i++) {
      const t = i / rafterSteps;
      pts.push({ x: -hw + t * hw, y: t * pitch, z });
    }
    // Right rafter: from (hw, 0) to (0, pitch)
    for (let i = 0; i <= rafterSteps; i++) {
      const t = i / rafterSteps;
      pts.push({ x: hw - t * hw, y: t * pitch, z });
    }
    // Tie beam (bottom of truss, eave to eave)
    const tieSteps = Math.max(4, Math.round(width / 3));
    for (let i = 0; i <= tieSteps; i++) {
      pts.push({ x: -hw + (i / tieSteps) * width, y: 0, z });
    }
    // Collar tie (at 50% height)
    if (withCollarTie) {
      const ct = 0.5;
      const ctW = hw * (1 - ct);
      const ctY = pitch * ct;
      const ctSteps = Math.max(3, Math.round(ctW * 2 / 2));
      for (let i = 0; i <= ctSteps; i++) {
        pts.push({ x: -ctW + (i / ctSteps) * ctW * 2, y: ctY, z });
      }
    }
    // King post (centre vertical)
    if (withKingPost) {
      const kpH = pitch * 0.6;
      const kpSteps = Math.max(3, Math.round(kpH / 2));
      for (let j = 0; j <= kpSteps; j++) {
        pts.push({ x: 0, y: (j / kpSteps) * kpH, z });
      }
    }
  }

  // Ridge beam (along length at apex)
  const ridgeSteps = Math.max(8, bays * 4);
  for (let i = 0; i <= ridgeSteps; i++) {
    pts.push({ x: 0, y: pitch, z: (i / ridgeSteps) * length });
  }
  // Eave plates (top of walls, eave level, along each side)
  const eaveSteps = Math.max(8, bays * 4);
  for (let i = 0; i <= eaveSteps; i++) {
    const z = (i / eaveSteps) * length;
    pts.push({ x: -hw, y: 0, z });
    pts.push({ x:  hw, y: 0, z });
  }

  return pts;
}

// ─── LOG CABIN ────────────────────────────────────────────────────────────────
// Classic log cabin outline — stacked log walls, door & window openings, gable.
function gen_log_cabin(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const width    = p.width    ?? 16;  // X extent
  const depth    = p.depth    ?? 12;  // Z extent
  const height   = p.height   ?? 8;   // wall height
  const logGap   = p.logGap   ?? 1.2; // vertical spacing between log rows
  const doorW    = p.doorW    ?? 3;
  const doorH    = p.doorH    ?? 5;
  const windowW  = p.windowW  ?? 2.5;
  const windowH  = p.windowH  ?? 2;
  const withRoof = (p.roof    ?? 1) > 0;
  const roofPitch = p.roofPitch ?? 5;

  const hw = width / 2;
  const hd = depth / 2;
  const rows = Math.max(2, Math.round(height / logGap));
  const logStepsX = Math.max(4, Math.round(width / 2));
  const logStepsZ = Math.max(4, Math.round(depth / 2));

  // Helper: draw a horizontal log segment on one wall, skipping opening
  const drawLog = (y: number, axis: 'x' | 'z', from: number, to: number,
                   fixed: number, oppFixed: number,
                   openStart?: number, openEnd?: number) => {
    const steps = Math.max(4, Math.round(Math.abs(to - from) / 1.5));
    for (let i = 0; i <= steps; i++) {
      const v = from + (i / steps) * (to - from);
      if (openStart !== undefined && openEnd !== undefined &&
          v >= openStart && v <= openEnd) continue;
      if (axis === 'x') {
        pts.push({ x: v, y, z: fixed });
        pts.push({ x: v, y, z: oppFixed });
      } else {
        pts.push({ x: fixed, y, z: v });
        pts.push({ x: oppFixed, y, z: v });
      }
    }
  };

  for (let r = 0; r <= rows; r++) {
    const y = (r / rows) * height;
    // Front wall (z = -hd): door opening in centre
    const doorSide = doorW / 2;
    const frontOpen = y < doorH ? { s: -doorSide, e: doorSide } : undefined;
    drawLog(y, 'x', -hw, hw, -hd, -hd, frontOpen?.s, frontOpen?.e);
    // Back wall (z = +hd): window opening
    const backOpen = (y > height * 0.3 && y < height * 0.3 + windowH) ? { s: -windowW / 2, e: windowW / 2 } : undefined;
    drawLog(y, 'x', -hw, hw, hd, hd, backOpen?.s, backOpen?.e);
    // Left wall (x = -hw)
    const leftOpen = (y > height * 0.35 && y < height * 0.35 + windowH) ? { s: -windowW / 2, e: windowW / 2 } : undefined;
    drawLog(y, 'z', -hd, hd, -hw, -hw, leftOpen?.s, leftOpen?.e);
    // Right wall (x = +hw)
    drawLog(y, 'z', -hd, hd, hw, hw, leftOpen?.s, leftOpen?.e);
  }

  // Corner notches (little protrusions at each corner, every other log)
  const notch = 0.6;
  for (let r = 0; r <= rows; r += 2) {
    const y = (r / rows) * height;
    for (const [cx, cz] of [[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd]]) {
      const sx = Math.sign(cx), sz = Math.sign(cz);
      for (let k = 0; k <= 3; k++) {
        pts.push({ x: cx + sx * notch * (k / 3), y, z: cz });
        pts.push({ x: cx, y, z: cz + sz * notch * (k / 3) });
      }
    }
  }

  // Gabled roof
  if (withRoof) {
    const ridgeY = height + roofPitch;
    // Gable ends (triangular faces at z = ±hd)
    for (const gz of [-hd, hd]) {
      const gStepsY = Math.max(4, Math.round(roofPitch / 1.5));
      for (let j = 0; j <= gStepsY; j++) {
        const t = j / gStepsY;
        const gW = hw * (1 - t);
        const gy = height + t * roofPitch;
        const gStepsX = Math.max(3, Math.round(gW * 2 / 1.5));
        for (let i = 0; i <= gStepsX; i++) {
          pts.push({ x: -gW + (i / gStepsX) * gW * 2, y: gy, z: gz });
        }
      }
    }
    // Ridge beam
    const ridgeSteps = Math.max(6, Math.round(depth / 2));
    for (let i = 0; i <= ridgeSteps; i++) {
      pts.push({ x: 0, y: ridgeY, z: -hd + (i / ridgeSteps) * depth });
    }
    // Rafters (along eaves)
    const rafterSegs = Math.max(4, Math.round(depth / 3));
    const rafterSteps = Math.max(4, Math.round(Math.sqrt(hw ** 2 + roofPitch ** 2) / 2));
    for (let i = 0; i <= rafterSegs; i++) {
      const z = -hd + (i / rafterSegs) * depth;
      for (let j = 0; j <= rafterSteps; j++) {
        const t = j / rafterSteps;
        pts.push({ x: -hw + t * hw, y: height + t * roofPitch, z });
        pts.push({ x:  hw - t * hw, y: height + t * roofPitch, z });
      }
    }
  }

  return pts;
}

// ─── FREEWAY CURVE ────────────────────────────────────────────────────────────
// Elevated curved road/pier section — inspired by DayZDisco Freeway Creator 2.0.
// arcDeg=0 = straight; arcDeg=90 = quarter curve; arcDeg=180 = U-turn.
function gen_freeway_curve(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const segments  = Math.max(4, Math.round(p.segments ?? 12));  // sections along road
  const segLen    = p.segLen    ?? 10;    // length of each straight segment (m)
  const roadW     = p.roadW     ?? 10;   // road deck width
  const arcDegPerSeg = p.arcDeg ?? 0;   // turning angle per segment (degrees)
  const withPillars  = (p.pillars ?? 1) > 0;
  const pillarH   = p.pillarH   ?? 8;
  const deckSteps = Math.max(4, Math.round(roadW / 2));

  // Walk along the road, accumulating heading direction
  let cx = 0, cz = 0, headingDeg = 0;

  for (let s = 0; s < segments; s++) {
    const rad = headingDeg * Math.PI / 180;
    const dx = Math.sin(rad), dz = Math.cos(rad);
    // Perpendicular (right hand side)
    const px = Math.cos(rad), pz = -Math.sin(rad);

    const x0 = cx, z0 = cz;
    const x1 = cx + dx * segLen, z1 = cz + dz * segLen;

    // Road deck surface (cross-section lines along the segment)
    const longSteps = Math.max(4, Math.round(segLen / 2));
    for (let i = 0; i <= longSteps; i++) {
      const t = i / longSteps;
      const mx = x0 + t * (x1 - x0);
      const mz = z0 + t * (z1 - z0);
      // Cross-deck beam
      for (let k = 0; k <= deckSteps; k++) {
        const off = -roadW / 2 + (k / deckSteps) * roadW;
        pts.push({ x: mx + off * px, y: 0, z: mz + off * pz });
      }
    }

    // Guardrails (left and right edges, along the segment)
    const railSteps = Math.max(4, Math.round(segLen / 2));
    for (let i = 0; i <= railSteps; i++) {
      const t = i / railSteps;
      const mx = x0 + t * (x1 - x0);
      const mz = z0 + t * (z1 - z0);
      pts.push({ x: mx + (roadW / 2) * px, y: 1.2, z: mz + (roadW / 2) * pz });
      pts.push({ x: mx - (roadW / 2) * px, y: 1.2, z: mz - (roadW / 2) * pz });
    }

    // Support pillar at the start of each segment
    if (withPillars) {
      const pillarSteps = Math.max(4, Math.round(pillarH / 2));
      for (let j = 0; j <= pillarSteps; j++) {
        const py = -pillarH + (j / pillarSteps) * pillarH;
        // Two pillars per segment (left and right)
        pts.push({ x: cx + (roadW * 0.35) * px, y: py, z: cz + (roadW * 0.35) * pz });
        pts.push({ x: cx - (roadW * 0.35) * px, y: py, z: cz - (roadW * 0.35) * pz });
      }
    }

    // Advance position and turn
    cx = x1; cz = z1;
    headingDeg += arcDegPerSeg;
  }

  return pts;
}

// ─── gen_saturn ─────────────────────────────────────────────────────────────
function gen_saturn(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const R = p.bodyRadius, ri = p.ringInner, ro = p.ringOuter;
  const lat = Math.round(p.latSegs), lon = Math.round(p.lonSegs), rsegs = Math.round(p.ringSegs);
  const tiltRad = (p.tilt ?? 25) * Math.PI / 180;
  // Sphere body
  for (let i = 0; i <= lat; i++) {
    const φ = Math.PI / 2 - Math.PI * i / lat;
    const y = R * Math.sin(φ), r = R * Math.cos(φ);
    for (let j = 0; j < lon; j++) {
      const a = 2 * Math.PI * j / lon;
      pts.push({ x: r * Math.cos(a), y, z: r * Math.sin(a) });
    }
  }
  // Flat ring (4 concentric circles, tilted)
  for (let k = 0; k <= 3; k++) {
    const ringR = ri + (ro - ri) * k / 3;
    for (let j = 0; j < rsegs; j++) {
      const a = 2 * Math.PI * j / rsegs;
      const px = ringR * Math.cos(a);
      const pzFlat = ringR * Math.sin(a);
      pts.push({ x: px, y: pzFlat * Math.sin(tiltRad), z: pzFlat * Math.cos(tiltRad) });
    }
  }
  return pts;
}

// ─── gen_crown ──────────────────────────────────────────────────────────────
function gen_crown(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const { radius, baseH, spikeH, points } = p;
  const numPts = Math.round(points);
  const baseSegs = 32;
  // Bottom and top-of-base rim rings
  for (let h = 0; h <= 1; h++) {
    const y = h === 0 ? 0 : baseH * 0.55;
    for (let j = 0; j < baseSegs; j++) {
      const a = 2 * Math.PI * j / baseSegs;
      pts.push({ x: radius * Math.cos(a), y, z: radius * Math.sin(a) });
    }
  }
  // Spike / valley zigzag
  const totalPts = numPts * 2;
  for (let i = 0; i < totalPts; i++) {
    const a = 2 * Math.PI * i / totalPts;
    const px = radius * Math.cos(a), pz = radius * Math.sin(a);
    const isSpike = i % 2 === 0;
    const topY = isSpike ? baseH + spikeH : baseH * 0.55;
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      pts.push({ x: px, y: baseH * 0.2 + (topY - baseH * 0.2) * t, z: pz });
    }
  }
  return pts;
}

// ─── gen_olympic_rings ──────────────────────────────────────────────────────
function gen_olympic_rings(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const { ringR, tubeR } = p;
  const n = Math.round(p.segs);
  const gap = ringR * 1.72;
  // 5 ring centres: 3 on top row, 2 on bottom row (classic Olympic layout in XZ)
  const centres: [number, number][] = [
    [-2 * gap, 0],
    [-gap,    -ringR * 0.9],
    [0,        0],
    [gap,     -ringR * 0.9],
    [2 * gap,  0],
  ];
  for (const [cx, cz] of centres) {
    for (let j = 0; j < n; j++) {
      const a = 2 * Math.PI * j / n;
      for (let k = 0; k < 8; k++) {
        const b = 2 * Math.PI * k / 8;
        const r = ringR + tubeR * Math.cos(b);
        pts.push({ x: cx + r * Math.cos(a), y: tubeR * Math.sin(b), z: cz + r * Math.sin(a) });
      }
    }
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

// ─── SUBMARINE ───────────────────────────────────────────────────────────────
function gen_submarine(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const L = p.length;   // total length
  const R = p.radius;   // hull radius
  const ctH = p.ctHeight; // conning tower height
  const segs = Math.round(p.segs);

  // Hull — cylindrical body along Z axis
  const hullRings = Math.max(8, Math.round(L / R));
  for (let ri = 0; ri <= hullRings; ri++) {
    const z = -L / 2 + L * ri / hullRings;
    // Taper at bow (front/positive Z) and stern (back/negative Z)
    const tBow  = Math.max(0, (z - (L / 2 - R * 1.5)) / (R * 1.5));
    const tStern = Math.max(0, (-z - (L / 2 - R * 1.0)) / (R * 1.0));
    const taper  = Math.max(0, 1 - tBow * 0.8 - tStern * 0.6);
    const cr = R * taper;
    if (cr < 0.5) continue;
    for (let j = 0; j < segs; j++) {
      const a = 2 * Math.PI * j / segs;
      pts.push({ x: cr * Math.cos(a), y: cr * Math.sin(a), z });
    }
  }

  // Conning tower (sail) — rectangular block above hull centre
  const ctW = R * 0.55, ctD = R * 1.8;
  const ctZ0 = -ctD * 0.6, ctZ1 = ctD * 0.6;
  const ctY0 = R * 0.8, ctY1 = ctY0 + ctH;
  const ctStepsZ = 5, ctStepsY = 5;
  for (let zi = 0; zi <= ctStepsZ; zi++) {
    const z = ctZ0 + (ctZ1 - ctZ0) * zi / ctStepsZ;
    for (let yi = 0; yi <= ctStepsY; yi++) {
      const y = ctY0 + (ctY1 - ctY0) * yi / ctStepsY;
      pts.push({ x: -ctW, y, z }); pts.push({ x: ctW, y, z });
    }
  }
  // CT top + front/back faces
  for (let xi = 0; xi <= 4; xi++) {
    const x = -ctW + ctW * 2 * xi / 4;
    pts.push({ x, y: ctY1, z: ctZ0 }); pts.push({ x, y: ctY1, z: ctZ1 });
  }

  // Rudder fins at stern — 4 fins (top, bottom, left, right)
  const finAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  const finZ = -L / 2 + R * 0.8;
  finAngles.forEach(fa => {
    const fx = Math.cos(fa), fy = Math.sin(fa);
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      pts.push({ x: (R + R * 0.7 * t) * fx, y: (R + R * 0.7 * t) * fy, z: finZ + R * 0.4 * t });
    }
  });

  // Propeller hub at stern
  for (let j = 0; j < 120; j++) {
    const a = 2 * Math.PI * j / 8;
    pts.push({ x: R * 0.15 * Math.cos(a), y: R * 0.15 * Math.sin(a), z: -L / 2 });
  }
  // 3 propeller blades
  for (let b = 0; b < 3; b++) {
    const ba = b * 2 * Math.PI / 3;
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      pts.push({ x: Math.cos(ba) * R * 0.5 * t, y: Math.sin(ba) * R * 0.5 * t, z: -L / 2 - R * 0.1 });
    }
  }

  return pts;
}

// ─── AIRCRAFT CARRIER ────────────────────────────────────────────────────────
function gen_aircraft_carrier(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const L = p.length;   // deck length (along Z)
  const W = p.width;    // deck width (along X)
  const DH = p.deckH;  // deck height above waterline
  const islandH = p.islandH; // island/tower height
  const stepsZ = Math.round(L / 6), stepsX = Math.round(W / 4);

  // FLIGHT DECK — flat upper surface with perimeter rails
  const deckY = DH;
  // Long edges
  for (let zi = 0; zi <= stepsZ; zi++) {
    const z = -L / 2 + L * zi / stepsZ;
    pts.push({ x: -W / 2, y: deckY, z }); pts.push({ x: W / 2, y: deckY, z });
  }
  // Short edges (bow & stern)
  for (let xi = 0; xi <= stepsX; xi++) {
    const x = -W / 2 + W * xi / stepsX;
    pts.push({ x, y: deckY, z: -L / 2 }); pts.push({ x, y: deckY, z: L / 2 });
  }
  // Deck surface lines (catapult tracks + centre line)
  for (let zi = 0; zi <= stepsZ; zi++) {
    const z = -L / 2 + L * zi / stepsZ;
    pts.push({ x: 0,           y: deckY + 0.1, z });  // centre line
    pts.push({ x: -W * 0.3,   y: deckY + 0.1, z });  // port cat
    pts.push({ x:  W * 0.3,   y: deckY + 0.1, z });  // stbd cat
  }

  // HULL — vertical sides below deck
  const hullStepsY = 4;
  for (let yi = 0; yi <= hullStepsY; yi++) {
    const y = DH * yi / hullStepsY;
    for (let zi = 0; zi <= stepsZ; zi++) {
      const z = -L / 2 + L * zi / stepsZ;
      // Narrow hull (ships are narrower at waterline)
      const hw = W * 0.5 * (0.6 + 0.4 * (y / DH));
      pts.push({ x: -hw, y, z }); pts.push({ x: hw, y, z });
    }
  }
  // Hull bow/stern faces
  for (let yi = 0; yi <= hullStepsY; yi++) {
    const y = DH * yi / hullStepsY;
    const hw = W * 0.5 * (0.6 + 0.4 * (y / DH));
    for (let xi = 0; xi <= stepsX; xi++) {
      const x = -hw + hw * 2 * xi / stepsX;
      pts.push({ x, y, z: L / 2 }); pts.push({ x, y, z: -L / 2 });
    }
  }

  // ISLAND (superstructure) — starboard side, mid-ship
  const isX = W * 0.38, isZ0 = -L * 0.05, isZ1 = L * 0.18;
  const isW = W * 0.14, isD = isZ1 - isZ0;
  const isStepsZ = 4, isStepsY = 6;
  for (let zi = 0; zi <= isStepsZ; zi++) {
    const z = isZ0 + isD * zi / isStepsZ;
    for (let yi = 0; yi <= isStepsY; yi++) {
      const y = deckY + islandH * yi / isStepsY;
      pts.push({ x: isX - isW, y, z }); pts.push({ x: isX + isW, y, z });
    }
  }
  for (let yi = 0; yi <= isStepsY; yi++) {
    const y = deckY + islandH * yi / isStepsY;
    for (let zi = 0; zi <= isStepsZ; zi++) {
      const z = isZ0 + isD * zi / isStepsZ;
      pts.push({ x: isX, y, z: isZ0 }); pts.push({ x: isX, y, z: isZ1 });
    }
  }
  // Radar mast on island
  for (let i = 0; i <= 6; i++) {
    pts.push({ x: isX, y: deckY + islandH + i * 2, z: (isZ0 + isZ1) / 2 });
  }
  // Radar dish
  for (let j = 0; j < 120; j++) {
    const a = 2 * Math.PI * j / 8;
    pts.push({ x: isX + 3 * Math.cos(a), y: deckY + islandH + 12, z: (isZ0 + isZ1) / 2 + 3 * Math.sin(a) });
  }

  // Parked aircraft silhouettes on deck (simple cross shapes)
  [[-W * 0.15, L * 0.2], [W * 0.1, -L * 0.1], [-W * 0.2, -L * 0.25]].forEach(([ax, az]) => {
    // Wing span
    for (let i = -1; i <= 1; i++) pts.push({ x: ax + i * W * 0.08, y: deckY + 0.5, z: az as number });
    // Fuselage
    for (let i = -1; i <= 1; i++) pts.push({ x: ax, y: deckY + 0.5, z: (az as number) + i * L * 0.05 });
  });

  return pts;
}

// ─── AVENGERS HELICARRIER ────────────────────────────────────────────────────
// SHIELD Helicarrier: huge flat deck + 4 massive propellers at corners + island buildings
function gen_helicarrier(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const L = p.length;   // deck length
  const W = p.width;    // deck width
  const DH = p.deckH;  // hull depth
  const propR = p.propR; // propeller radius
  const stepsZ = Math.round(L / 8), stepsX = Math.round(W / 5);

  // MAIN DECK — flat top surface
  const deckY = DH;
  for (let zi = 0; zi <= stepsZ; zi++) {
    const z = -L / 2 + L * zi / stepsZ;
    pts.push({ x: -W / 2, y: deckY, z }); pts.push({ x: W / 2, y: deckY, z });
  }
  for (let xi = 0; xi <= stepsX; xi++) {
    const x = -W / 2 + W * xi / stepsX;
    pts.push({ x, y: deckY, z: -L / 2 }); pts.push({ x, y: deckY, z: L / 2 });
  }

  // HULL — 3 level sides
  [0, DH * 0.5, DH].forEach(y => {
    const hw = W * 0.5 * (y === 0 ? 0.7 : y === DH * 0.5 ? 0.85 : 1.0);
    for (let zi = 0; zi <= stepsZ; zi++) {
      const z = -L / 2 + L * zi / stepsZ;
      pts.push({ x: -hw, y, z }); pts.push({ x: hw, y, z });
    }
    for (let xi = 0; xi <= stepsX; xi++) {
      const x = -hw + hw * 2 * xi / stepsX;
      pts.push({ x, y, z: -L / 2 }); pts.push({ x, y, z: L / 2 });
    }
  });

  // 4 CORNER PROPELLER PODS — the defining feature of the Helicarrier
  const corners = [
    { cx:  W * 0.38, cz:  L * 0.38 },
    { cx: -W * 0.38, cz:  L * 0.38 },
    { cx:  W * 0.38, cz: -L * 0.38 },
    { cx: -W * 0.38, cz: -L * 0.38 },
  ];
  corners.forEach(({ cx, cz }) => {
    const podY = deckY - DH * 0.3;
    const podR = propR * 0.2;

    // Mounting struts from hull down to pod
    for (let i = 0; i <= 4; i++) {
      pts.push({ x: cx, y: deckY - DH * i / 4, z: cz });
    }
    // Pod nacelle (cylinder)
    for (let j = 0; j < 120; j++) {
      const a = 2 * Math.PI * j / 12;
      pts.push({ x: cx + podR * Math.cos(a), y: podY, z: cz + podR * Math.sin(a) });
    }
    // Propeller rotor disc — 4 blades
    for (let b = 0; b < 4; b++) {
      const ba = b * Math.PI / 2;
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        pts.push({ x: cx + propR * t * Math.cos(ba), y: podY + 0.5, z: cz + propR * t * Math.sin(ba) });
      }
    }
    // Blade tips ring
    for (let j = 0; j < 120; j++) {
      const a = 2 * Math.PI * j / 20;
      pts.push({ x: cx + propR * Math.cos(a), y: podY + 0.5, z: cz + propR * Math.sin(a) });
    }
  });

  // DECK BUILDINGS — Novo clocktower stand-in + barracks along deck
  // Tower (Novo clocktower style — tall, rectangular)
  const twX = W * 0.05, twZ = L * 0.05;
  const twW = W * 0.05, twH = DH * 1.8;
  for (let yi = 0; yi <= 8; yi++) {
    const y = deckY + twH * yi / 8;
    for (let xi = -1; xi <= 1; xi++) pts.push({ x: twX + twW * xi, y, z: twZ });
    for (let zi = -1; zi <= 1; zi++) pts.push({ x: twX, y, z: twZ + twW * zi });
  }
  // Military barracks (3 along deck)
  [[-L * 0.2, W * 0.1], [0, -W * 0.1], [L * 0.25, W * 0.12]].forEach(([bz, bx]) => {
    const barW = W * 0.09, barD = L * 0.06, barH = DH * 0.6;
    const by = deckY;
    [[bx as number - barW, barH, bz as number - barD], [bx as number + barW, barH, bz as number - barD],
     [bx as number - barW, barH, bz as number + barD], [bx as number + barW, barH, bz as number + barD]].forEach(([x, h, z]) => {
      for (let yi = 0; yi <= 3; yi++) pts.push({ x: x as number, y: by + (h as number) * yi / 3, z: z as number });
    });
  });

  // Landing lights along deck edges
  for (let zi = 0; zi <= stepsZ; zi += 3) {
    const z = -L / 2 + L * zi / stepsZ;
    pts.push({ x: -W / 2 + 1, y: deckY + 0.5, z });
    pts.push({ x:  W / 2 - 1, y: deckY + 0.5, z });
  }

  return pts;
}

// ─── VAULT DOOR ──────────────────────────────────────────────────────────────
function gen_vault_door(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const R = p.radius;
  const thickness = p.thickness;
  const rings = Math.round(p.rings);
  const spokes = Math.round(p.spokes);
  const segs = Math.round(p.segs);

  // Multiple concentric rings (like a vault/safe door)
  for (let ri = 0; ri <= rings; ri++) {
    const r = R * (ri / rings);
    if (r < 0.5) continue;
    for (let j = 0; j < segs; j++) {
      const a = 2 * Math.PI * j / segs;
      pts.push({ x: r * Math.cos(a), y: 0, z: r * Math.sin(a) });
      // Back face (thickness)
      pts.push({ x: r * Math.cos(a), y: thickness, z: r * Math.sin(a) });
    }
  }

  // Radial spokes connecting rings
  for (let s = 0; s < spokes; s++) {
    const a = 2 * Math.PI * s / spokes;
    for (let i = 0; i <= 8; i++) {
      const r = R * i / 8;
      pts.push({ x: r * Math.cos(a), y: 0, z: r * Math.sin(a) });
    }
  }

  // Rim edge (the outer cylindrical edge of the door)
  const rimSegs = Math.round(thickness * 4);
  for (let j = 0; j < segs; j++) {
    const a = 2 * Math.PI * j / segs;
    for (let yi = 0; yi <= rimSegs; yi++) {
      pts.push({ x: R * Math.cos(a), y: thickness * yi / rimSegs, z: R * Math.sin(a) });
    }
  }

  // Handle wheel — small circle in the centre
  const hwR = R * 0.15;
  for (let j = 0; j < 120; j++) {
    const a = 2 * Math.PI * j / 12;
    pts.push({ x: hwR * Math.cos(a), y: thickness + 0.5, z: hwR * Math.sin(a) });
  }
  // Handle spokes
  for (let s = 0; s < 4; s++) {
    const a = Math.PI / 2 * s;
    for (let i = 0; i <= 4; i++) {
      const r = hwR * i / 4;
      pts.push({ x: r * Math.cos(a), y: thickness + 0.5, z: r * Math.sin(a) });
    }
  }

  // Locking bolts around rim
  const boltCount = 8;
  for (let b = 0; b < boltCount; b++) {
    const a = 2 * Math.PI * b / boltCount;
    const bR = R * 0.85;
    for (let j = 0; j < 120; j++) {
      const ba = 2 * Math.PI * j / 6;
      pts.push({ x: bR * Math.cos(a) + 1.5 * Math.cos(ba), y: 0, z: bR * Math.sin(a) + 1.5 * Math.sin(ba) });
    }
  }

  return pts;
}

// ─── LAB SPIDER MECH ─────────────────────────────────────────────────────────
// Futuristic biomechanical spider with a laboratory building body and pipe legs
function gen_lab_spider(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height;
  const w = p.width;

  // BODY: compact octagonal laboratory pod (like a bioresearch dome)
  const bodyBot = h * 0.50;
  const bodyTop = h;
  const bR = w * 0.30;  // body radius (octagonal)

  // Octagonal perimeter at 4 heights
  const bodyLevels = 5;
  for (let ri = 0; ri <= bodyLevels; ri++) {
    const by = bodyBot + (bodyTop - bodyBot) * ri / bodyLevels;
    const rScale = ri === 0 || ri === bodyLevels ? 0.85 : 1.0; // taper top/bottom
    for (let j = 0; j < 120; j++) {
      const a = Math.PI / 4 * j + Math.PI / 8;
      pts.push({ x: bR * rScale * Math.cos(a), y: by, z: bR * rScale * Math.sin(a) });
    }
  }
  // Dome top
  for (let i = 0; i <= 4; i++) {
    const lat = Math.PI / 2 * i / 4;
    const y = bodyTop + w * 0.12 * Math.sin(lat);
    const cr = bR * 0.85 * Math.cos(lat);
    for (let j = 0; j < 120; j++) {
      const a = 2 * Math.PI * j / 8;
      pts.push({ x: cr * Math.cos(a), y, z: cr * Math.sin(a) });
    }
  }

  // 8 PIPE LEGS — sci-fi articulated, angled sharply like insect legs
  const legDeg = [35, 65, 115, 145];
  const legAngles = [...legDeg.map(d => d * Math.PI / 180), ...legDeg.map(d => -d * Math.PI / 180)];

  legAngles.forEach(la => {
    const ox = Math.sin(la), oz = Math.cos(la);

    // Hip joint (at body edge)
    const hipX = ox * bR * 0.95, hipZ = oz * bR * 0.95;
    const hipY = bodyBot + (bodyTop - bodyBot) * 0.1;

    // First joint — angles steeply UP then out (insect style: femur goes up first)
    const femurLen = w * 0.55;
    const femX = hipX + ox * femurLen * 0.6;
    const femZ = hipZ + oz * femurLen * 0.6;
    const femY = hipY + h * 0.22; // goes UP first

    // Knee joint — then bends sharply DOWN
    const kneeX = femX + ox * w * 0.35;
    const kneeZ = femZ + oz * w * 0.35;
    const kneeY = h * 0.15; // drops to near-ground

    // Foot
    const footX = ox * w * 1.25, footZ = oz * w * 1.25, footY = 0;

    // Hip → femur (upper, goes outward+upward)
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      pts.push({ x: hipX + (femX - hipX) * t, y: hipY + (femY - hipY) * t, z: hipZ + (femZ - hipZ) * t });
    }
    // Femur → knee (angles sharply back down)
    for (let i = 1; i <= 8; i++) {
      const t = i / 8;
      pts.push({ x: femX + (kneeX - femX) * t, y: femY + (kneeY - femY) * t, z: femZ + (kneeZ - femZ) * t });
    }
    // Knee → foot (shin, steeply downward)
    for (let i = 1; i <= 8; i++) {
      const t = i / 8;
      pts.push({ x: kneeX + (footX - kneeX) * t, y: kneeY + (footY - kneeY) * t, z: kneeZ + (footZ - kneeZ) * t });
    }
    // Foot claw — 3 prongs
    const perpX = oz, perpZ = -ox;
    for (const off of [-0.08, 0, 0.08]) {
      pts.push({ x: footX + perpX * off * w + ox * w * 0.06, y: 0, z: footZ + perpZ * off * w + oz * w * 0.06 });
    }
    // Hip pipe joint (small ring)
    for (let j = 0; j < 120; j++) {
      const a = 2 * Math.PI * j / 6;
      const perpA = la + Math.PI / 2;
      pts.push({ x: hipX + Math.cos(perpA) * 0.8, y: hipY + 0.8 * Math.sin(a), z: hipZ + Math.sin(perpA) * 0.8 });
    }
  });

  return pts;
}

// ─── NAVAL DESTROYER ─────────────────────────────────────────────────────────
function gen_destroyer(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const L = p.length;
  const W = p.width;
  const DH = p.deckH;
  const stepsZ = Math.round(L / 5);

  // Hull cross-sections (V-shaped bottom like a real destroyer)
  const hullLevels = 5;
  for (let yi = 0; yi <= hullLevels; yi++) {
    const y = DH * yi / hullLevels;
    const keel = W * 0.08; // keel width at bottom
    const beam = W * 0.5 * (keel / W + (1 - keel / W) * (y / DH)); // widens toward deck
    for (let zi = 0; zi <= stepsZ; zi++) {
      const z = -L / 2 + L * zi / stepsZ;
      // Taper bow sharply
      const bow = Math.max(0, (z - L * 0.35) / (L * 0.15));
      const bw = beam * (1 - bow * 0.9);
      pts.push({ x: -bw, y, z }); pts.push({ x: bw, y, z });
    }
  }
  // Deck perimeter
  const deckY = DH;
  for (let zi = 0; zi <= stepsZ; zi++) {
    const z = -L / 2 + L * zi / stepsZ;
    pts.push({ x: -W / 2, y: deckY, z }); pts.push({ x: W / 2, y: deckY, z });
  }

  // Bridge superstructure — mid-ship
  const brZ0 = -L * 0.05, brZ1 = L * 0.12, brH = DH * 1.2, brW = W * 0.4;
  for (let yi = 0; yi <= 5; yi++) {
    const y = deckY + brH * yi / 5;
    const bw = brW * (1 - yi * 0.08);
    for (let xi = -1; xi <= 1; xi++) pts.push({ x: bw * xi, y, z: brZ0 });
    for (let xi = -1; xi <= 1; xi++) pts.push({ x: bw * xi, y, z: brZ1 });
    pts.push({ x: -bw, y, z: (brZ0 + brZ1) / 2 }); pts.push({ x: bw, y, z: (brZ0 + brZ1) / 2 });
  }

  // Gun turret (bow)
  const turY = deckY + 1, turZ = L * 0.28;
  for (let j = 0; j < 120; j++) {
    const a = 2 * Math.PI * j / 10;
    pts.push({ x: W * 0.08 * Math.cos(a), y: turY, z: turZ + W * 0.08 * Math.sin(a) });
  }
  // Gun barrel
  for (let i = 0; i <= 6; i++) pts.push({ x: 0, y: turY + 0.5, z: turZ + W * 0.08 + i * 2 });

  // Missile launcher (rear deck)
  const mlZ = -L * 0.3;
  for (let i = 0; i < 4; i++) {
    const mx = -W * 0.12 + i * W * 0.08;
    for (let j = 0; j <= 3; j++) pts.push({ x: mx, y: deckY + j * 1.5, z: mlZ });
  }

  // Radar mast
  for (let i = 0; i <= 8; i++) pts.push({ x: 0, y: deckY + brH + i * 2, z: (brZ0 + brZ1) / 2 });
  for (let j = 0; j < 120; j++) {
    const a = 2 * Math.PI * j / 8;
    pts.push({ x: 4 * Math.cos(a), y: deckY + brH + 16, z: (brZ0 + brZ1) / 2 + 4 * Math.sin(a) });
  }

  return pts;
}

// ─── CHRISTMAS TREE (GIANT) ──────────────────────────────────────────────────
function gen_xmas_tree_large(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height, tiers = Math.round(p.tiers), topR = p.topRadius;

  // Layered cone tiers — each tier slightly overlaps the one above
  for (let t = 0; t < tiers; t++) {
    const tierFrac = (t + 1) / tiers;
    const tierY = h * (1 - tierFrac);         // bottom of this tier
    const tierTop = h * (1 - t / tiers);      // top of this tier
    const tierR = topR + (p.baseRadius - topR) * tierFrac;
    const tierMidR = tierR * 0.65; // each tier's peak is narrower
    // Base ring of this tier
    const pts2 = Math.max(8, Math.round(24 * tierFrac));
    for (let j = 0; j < pts2; j++) {
      const a = 2 * Math.PI * j / pts2;
      pts.push({ x: tierR * Math.cos(a), y: tierY, z: tierR * Math.sin(a) });
    }
    // Mid ring (halfway up tier)
    const midPts = Math.max(6, Math.round(16 * tierFrac));
    for (let j = 0; j < midPts; j++) {
      const a = 2 * Math.PI * j / midPts;
      pts.push({ x: tierMidR * Math.cos(a), y: (tierY + tierTop) / 2, z: tierMidR * Math.sin(a) });
    }
  }
  // Star/tip at top
  for (let j = 0; j < 120; j++) {
    const a = 2 * Math.PI * j / 5;
    pts.push({ x: topR * 0.3 * Math.cos(a), y: h, z: topR * 0.3 * Math.sin(a) });
    pts.push({ x: topR * 0.6 * Math.cos(a + Math.PI / 5), y: h + topR * 0.2, z: topR * 0.6 * Math.sin(a + Math.PI / 5) });
  }
  // Trunk
  for (let i = 0; i <= 3; i++) {
    const ry = -h * 0.12 * i / 3;
    for (let j = 0; j < 120; j++) {
      const a = 2 * Math.PI * j / 6;
      pts.push({ x: topR * 0.18 * Math.cos(a), y: ry, z: topR * 0.18 * Math.sin(a) });
    }
  }
  // Decorative baubles at random-ish tier levels
  const baubleAngles = [0, 0.8, 1.8, 2.6, 3.5, 4.3, 5.1, 0.3, 1.1, 2.2, 3.0, 4.0];
  baubleAngles.forEach((ba, bi) => {
    const tierFrac = (bi % tiers + 0.5) / tiers;
    const bR = (topR + (p.baseRadius - topR) * tierFrac) * 0.7;
    const bY = h * (1 - tierFrac) + h * 0.08;
    pts.push({ x: bR * Math.cos(ba), y: bY, z: bR * Math.sin(ba) });
  });

  return pts;
}

// ─── JACK SKELLINGTON'S HOUSE (Spiral Hill) ──────────────────────────────────
// Halloween: spiral hill with a spooky house on top, graveyard fence around base
function gen_jack_house(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const hillR = p.hillRadius, hillH = p.hillHeight;
  const houseH = p.houseHeight, houseW = p.houseWidth;

  // SPIRAL HILL — helix-like mound that tapers to a point
  const spiralTurns = 2.5;
  const spiralSteps = 80;
  for (let i = 0; i <= spiralSteps; i++) {
    const t = i / spiralSteps;
    const angle = spiralTurns * 2 * Math.PI * t;
    const r = hillR * (1 - t * 0.85);  // spiral inward
    const y = hillH * t;               // rises as it spirals
    pts.push({ x: r * Math.cos(angle), y, z: r * Math.sin(angle) });
    // Path width (2 tracks)
    const perpX = Math.sin(angle) * 1.5, perpZ = -Math.cos(angle) * 1.5;
    pts.push({ x: r * Math.cos(angle) + perpX, y, z: r * Math.sin(angle) + perpZ });
    pts.push({ x: r * Math.cos(angle) - perpX, y, z: r * Math.sin(angle) - perpZ });
  }

  // SPOOKY HOUSE at the top of the hill
  const hx = 0, hz = 0, hy = hillH;
  const hw = houseW / 2, hd = houseW * 0.65;
  // Walls — 4 sides
  const wallSteps = 5;
  for (let yi = 0; yi <= wallSteps; yi++) {
    const y = hy + houseH * yi / wallSteps;
    pts.push({ x: hx - hw, y, z: hz - hd }); pts.push({ x: hx + hw, y, z: hz - hd });
    pts.push({ x: hx - hw, y, z: hz + hd }); pts.push({ x: hx + hw, y, z: hz + hd });
    pts.push({ x: hx - hw, y, z: hz });     pts.push({ x: hx + hw, y, z: hz });
  }
  // Tall pointed roof (Gothic)
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    pts.push({ x: hx - hw * (1 - t), y: hy + houseH + houseH * 0.7 * t, z: hz - hd + hd * 2 * t * 0 });
    pts.push({ x: hx + hw * (1 - t), y: hy + houseH + houseH * 0.7 * t, z: hz - hd });
    pts.push({ x: hx + hw * (1 - t), y: hy + houseH + houseH * 0.7 * t, z: hz + hd });
  }
  pts.push({ x: hx, y: hy + houseH * 1.7, z: hz }); // roof peak

  // Graveyard fence around base of hill
  const fenceCount = 20;
  for (let i = 0; i < fenceCount; i++) {
    const a = 2 * Math.PI * i / fenceCount;
    const fr = hillR * 1.05;
    pts.push({ x: fr * Math.cos(a), y: 0, z: fr * Math.sin(a) });
    pts.push({ x: fr * Math.cos(a), y: 2.5, z: fr * Math.sin(a) });
    pts.push({ x: fr * Math.cos(a), y: 4, z: fr * Math.sin(a) }); // pointed top
  }

  // Gravestones scattered at base
  for (let g = 0; g < 6; g++) {
    const ga = g * Math.PI / 3 + 0.2;
    const gr = hillR * 0.7;
    pts.push({ x: gr * Math.cos(ga), y: 0, z: gr * Math.sin(ga) });
    pts.push({ x: gr * Math.cos(ga), y: 2, z: gr * Math.sin(ga) });
    pts.push({ x: gr * Math.cos(ga), y: 3, z: gr * Math.sin(ga) }); // top arch
  }

  // Moon behind house (large circle above)
  const moonR = houseW * 0.55;
  for (let j = 0; j < 120; j++) {
    const a = 2 * Math.PI * j / 16;
    pts.push({ x: hx + moonR * Math.cos(a), y: hy + houseH * 1.5, z: hz - houseW * 1.8 + moonR * Math.sin(a) });
  }

  return pts;
}

// ─── PUMPKIN RING ────────────────────────────────────────────────────────────
function gen_pumpkin_ring(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const radius = p.radius, count = Math.round(p.count), pumpH = p.pumpHeight;

  // Ring of pumpkin-shaped objects (round body + stem)
  for (let i = 0; i < count; i++) {
    const a = 2 * Math.PI * i / count;
    const px = radius * Math.cos(a), pz = radius * Math.sin(a);

    // Pumpkin body (spheroid with vertical ribs)
    const ribs = 6;
    for (let r = 0; r < ribs; r++) {
      const ra = r * 2 * Math.PI / ribs;
      for (let j = 0; j < 120; j++) {
        const ja = Math.PI / 2 - Math.PI * j / 7;
        const pr = pumpH * 0.45 * Math.cos(ja);
        const py = pumpH * 0.5 * Math.sin(ja) + pumpH * 0.5;
        pts.push({ x: px + pr * Math.cos(ra), y: py, z: pz + pr * Math.sin(ra) });
      }
    }
    // Stem
    for (let j = 0; j <= 3; j++) {
      pts.push({ x: px, y: pumpH + j * 0.8, z: pz });
    }
    // Face (eyes/mouth suggested by 3 dots)
    pts.push({ x: px + pumpH * 0.2, y: pumpH * 0.6, z: pz - pumpH * 0.45 });
    pts.push({ x: px - pumpH * 0.2, y: pumpH * 0.6, z: pz - pumpH * 0.45 });
    pts.push({ x: px,               y: pumpH * 0.35, z: pz - pumpH * 0.45 });
  }

  // Outer ring of tombstones
  const tmbCount = count * 2;
  for (let i = 0; i < tmbCount; i++) {
    const a = 2 * Math.PI * i / tmbCount;
    const tr = radius * 1.45;
    pts.push({ x: tr * Math.cos(a), y: 0,   z: tr * Math.sin(a) });
    pts.push({ x: tr * Math.cos(a), y: 1.8, z: tr * Math.sin(a) });
    pts.push({ x: tr * Math.cos(a), y: 2.8, z: tr * Math.sin(a) });
  }

  return pts;
}

// ─── EASTER CROSS ────────────────────────────────────────────────────────────
function gen_easter_cross(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const h = p.height, w = p.width, thick = p.thickness;

  // Vertical beam
  for (let i = 0; i <= Math.round(h / thick); i++) {
    const y = i * thick;
    for (let j = 0; j < 120; j++) {
      const a = 2 * Math.PI * j / 8;
      pts.push({ x: thick * 0.4 * Math.cos(a), y, z: thick * 0.4 * Math.sin(a) });
    }
  }
  // Horizontal crossbar (at 65% up the cross)
  const crossY = h * 0.65;
  for (let i = 0; i <= Math.round(w / thick); i++) {
    const x = -w / 2 + i * thick;
    for (let j = 0; j < 120; j++) {
      const a = 2 * Math.PI * j / 8;
      pts.push({ x, y: crossY + thick * 0.4 * Math.cos(a), z: thick * 0.4 * Math.sin(a) });
    }
  }

  // Easter eggs scattered around the base in a ring
  const eggCount = Math.round(p.eggs);
  for (let i = 0; i < eggCount; i++) {
    const a = 2 * Math.PI * i / eggCount;
    const er = w * 0.6;
    pts.push({ x: er * Math.cos(a), y: 0, z: er * Math.sin(a) });
    pts.push({ x: er * Math.cos(a), y: 0.8, z: er * Math.sin(a) });
    pts.push({ x: er * Math.cos(a), y: 1.3, z: er * Math.sin(a) });
  }

  // Spring flower ring
  const flwCount = eggCount;
  for (let i = 0; i < flwCount; i++) {
    const a = 2 * Math.PI * i / flwCount + Math.PI / flwCount;
    const fr = w * 0.8;
    for (let j = 0; j < 120; j++) {
      const fa = 2 * Math.PI * j / 5;
      pts.push({ x: fr * Math.cos(a) + 0.8 * Math.cos(fa), y: 0, z: fr * Math.sin(a) + 0.8 * Math.sin(fa) });
    }
  }


  return pts;
}

// ─── ICE WALL / SNOW WALL ─────────────────────────────────────────────────────
function gen_ice_wall(p: Record<string, number>): Point3D[] {
  const pts: Point3D[] = [];
  const len = p.length, h = p.height, thick = p.thickness;
  const stepsL = Math.round(len / 2), stepsH = Math.round(h / 2);

  // Front face of wall
  for (let li = 0; li <= stepsL; li++) {
    const z = -len / 2 + len * li / stepsL;
    for (let hi2 = 0; hi2 <= stepsH; hi2++) {
      const y = h * hi2 / stepsH;
      pts.push({ x: 0, y, z });
    }
  }
  // Back face
  for (let li = 0; li <= stepsL; li++) {
    const z = -len / 2 + len * li / stepsL;
    for (let hi2 = 0; hi2 <= stepsH; hi2++) {
      const y = h * hi2 / stepsH;
      pts.push({ x: thick, y, z });
    }
  }
  // Top with icicle spikes
  const icicleCount = Math.round(len / 3);
  for (let i = 0; i < icicleCount; i++) {
    const z = -len / 2 + (len * i / icicleCount) + len / (2 * icicleCount);
    const iH = h * (0.1 + Math.random() * 0.15);
    for (let j = 0; j <= 4; j++) {
      pts.push({ x: thick / 2, y: h + iH * (1 - j / 4), z });
    }
  }
  // Crenellations (battlements) at top for ice castle wall feel
  const battCount = Math.round(len / 5);
  for (let b = 0; b < battCount; b++) {
    const z = -len / 2 + (b + 0.5) * (len / battCount);
    pts.push({ x: 0,     y: h,       z }); pts.push({ x: thick, y: h,       z });
    pts.push({ x: 0,     y: h + 2.5, z }); pts.push({ x: thick, y: h + 2.5, z });
    pts.push({ x: 0,     y: h + 2.5, z: z - 1 }); pts.push({ x: thick, y: h + 2.5, z: z - 1 });
    pts.push({ x: 0,     y: h + 2.5, z: z + 1 }); pts.push({ x: thick, y: h + 2.5, z: z + 1 });
  }

  return pts;
}
