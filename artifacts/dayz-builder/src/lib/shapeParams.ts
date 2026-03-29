export interface ParamDef {
  id: string;
  label: string;
  val: number;
  min: number;
  max: number;
  step?: number;
}

export interface ShapeDef {
  label: string;
  group: string;
  params: ParamDef[];
}

export const SHAPE_DEFS: Record<string, ShapeDef> = {
  // ── SCI-FI / EPIC ──────────────────────────────────────────────────────
  deathstar: {
    label: "☠ Death Star", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Equatorial Radius (m)", val: 40, min: 5, max: 200 },
      { id: "latSegs", label: "Latitude Segments", val: 10, min: 4, max: 20 },
      { id: "lonSegs", label: "Longitude Segments", val: 16, min: 6, max: 32 },
      { id: "dishRadius", label: "Dish Indent Radius (m)", val: 12, min: 2, max: 60 },
      { id: "dishDepth", label: "Dish Depth (m)", val: 8, min: 1, max: 30 },
      { id: "dishLat", label: "Dish Latitude (deg)", val: 30, min: -80, max: 80 },
    ]
  },
  sphere: {
    label: "Sphere Shell", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Radius (m)", val: 25, min: 2, max: 200 },
      { id: "latSegs", label: "Latitude Rings", val: 8, min: 3, max: 20 },
      { id: "lonSegs", label: "Longitude Points", val: 12, min: 4, max: 32 },
    ]
  },
  hemisphere: {
    label: "Hemisphere", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Radius (m)", val: 25, min: 2, max: 200 },
      { id: "latSegs", label: "Rings", val: 6, min: 2, max: 16 },
      { id: "lonSegs", label: "Points per Ring", val: 12, min: 4, max: 32 },
    ]
  },
  torus: {
    label: "Torus / Ring Gate", group: "Sci-Fi / Epic",
    params: [
      { id: "majorR", label: "Major Radius (m)", val: 30, min: 5, max: 150 },
      { id: "minorR", label: "Tube Radius (m)", val: 8, min: 1, max: 50 },
      { id: "majorSegs", label: "Segments Around", val: 16, min: 6, max: 48 },
      { id: "minorSegs", label: "Segments Tube", val: 8, min: 3, max: 16 },
    ]
  },
  disc: {
    label: "Flat Disc / Platform", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Radius (m)", val: 30, min: 2, max: 200 },
      { id: "rings", label: "Concentric Rings", val: 3, min: 1, max: 12 },
      { id: "points", label: "Points per Ring", val: 16, min: 4, max: 48 },
      { id: "innerRadius", label: "Inner Hole Radius", val: 0, min: 0, max: 150 },
    ]
  },
  helix: {
    label: "Helix / DNA Spiral", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Helix Radius (m)", val: 15, min: 2, max: 100 },
      { id: "height", label: "Total Height (m)", val: 30, min: 3, max: 200 },
      { id: "turns", label: "Turns", val: 4, min: 1, max: 20 },
      { id: "pointsPerTurn", label: "Points/Turn", val: 12, min: 4, max: 32 },
      { id: "strands", label: "Strands (1-4)", val: 1, min: 1, max: 4 },
    ]
  },
  cone: {
    label: "Cone", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Base Radius (m)", val: 20, min: 2, max: 150 },
      { id: "height", label: "Height (m)", val: 25, min: 2, max: 200 },
      { id: "rings", label: "Height Rings", val: 5, min: 2, max: 20 },
      { id: "points", label: "Points/Ring", val: 12, min: 3, max: 32 },
    ]
  },
  cylinder: {
    label: "Cylinder", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Radius (m)", val: 20, min: 2, max: 150 },
      { id: "height", label: "Height (m)", val: 20, min: 2, max: 150 },
      { id: "rings", label: "Height Segments", val: 4, min: 1, max: 20 },
      { id: "points", label: "Points/Ring", val: 12, min: 3, max: 32 },
      { id: "caps", label: "Caps (0=No, 1=Yes)", val: 1, min: 0, max: 1, step: 1 },
    ]
  },
  hyperboloid: {
    label: "Hyperboloid (hourglass)", group: "Sci-Fi / Epic",
    params: [
      { id: "radiusTop", label: "Top Radius (m)", val: 15, min: 1, max: 100 },
      { id: "radiusMid", label: "Waist Radius (m)", val: 8, min: 1, max: 100 },
      { id: "height", label: "Height (m)", val: 30, min: 4, max: 200 },
      { id: "rings", label: "Height Rings", val: 8, min: 3, max: 24 },
      { id: "points", label: "Points/Ring", val: 14, min: 4, max: 32 },
    ]
  },
  mobius: {
    label: "Möbius Strip", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Ring Radius (m)", val: 25, min: 5, max: 120 },
      { id: "width", label: "Strip Width (m)", val: 8, min: 1, max: 40 },
      { id: "segs", label: "Segments", val: 20, min: 8, max: 60 },
      { id: "widthSegs", label: "Width Divisions", val: 4, min: 1, max: 10 },
    ]
  },
  icosphere: {
    label: "Icosphere (faceted)", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Radius (m)", val: 25, min: 3, max: 150 },
      { id: "subdivisions", label: "Subdivisions (1-3)", val: 1, min: 1, max: 3, step: 1 },
    ]
  },
  millennium_falcon: {
    label: "⚡ Millennium Falcon", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Hull Radius (m)", val: 30, min: 8, max: 120 },
    ]
  },
  orbital_station: {
    label: "🛸 Orbital Station", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Ring Radius (m)", val: 35, min: 10, max: 150 },
    ]
  },
  reactor_core: {
    label: "⚛ Reactor Core", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Radius (m)", val: 25, min: 5, max: 100 },
      { id: "height", label: "Height (m)", val: 30, min: 5, max: 120 },
      { id: "rings", label: "Plasma Rings", val: 5, min: 2, max: 12 },
    ]
  },
  sci_fi_gate: {
    label: "🔮 Sci-Fi Portal Gate", group: "Sci-Fi / Epic",
    params: [
      { id: "width", label: "Gate Width (m)", val: 40, min: 8, max: 150 },
      { id: "height", label: "Gate Height (m)", val: 30, min: 5, max: 100 },
    ]
  },
  dna_double: {
    label: "🧬 DNA Double Helix", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Helix Radius (m)", val: 12, min: 3, max: 60 },
      { id: "height", label: "Total Height (m)", val: 40, min: 5, max: 200 },
      { id: "turns", label: "Turns", val: 5, min: 2, max: 20 },
      { id: "pointsPerTurn", label: "Points/Turn", val: 12, min: 4, max: 32 },
    ]
  },

  // ── MECHS ─────────────────────────────────────────────────────────────
  mech_bipedal: {
    label: "🤖 Mech — Bipedal Warrior", group: "Mechs",
    params: [
      { id: "height", label: "Mech Height (m)", val: 25, min: 8, max: 100 },
      { id: "width", label: "Shoulder Width (m)", val: 14, min: 4, max: 60 },
    ]
  },
  t800_endoskeleton: {
    label: "💀 T-800 Endoskeleton", group: "Mechs",
    params: [
      { id: "height", label: "Total Height (m)", val: 22, min: 8, max: 80 },
      { id: "width", label: "Shoulder Width (m)", val: 10, min: 4, max: 50 },
    ]
  },
  atat_walker: {
    label: "🐘 AT-AT Walker", group: "Mechs",
    params: [
      { id: "height", label: "Total Height (m)", val: 30, min: 10, max: 100 },
      { id: "width", label: "Body Width (m)", val: 20, min: 8, max: 80 },
    ]
  },
  borg_cube: {
    label: "🟩 Borg Cube", group: "Sci-Fi",
    params: [
      { id: "size", label: "Cube Size (m)", val: 40, min: 10, max: 200 },
      { id: "gridLines", label: "Grid Lines per Face", val: 4, min: 2, max: 8, step: 1 },
    ]
  },
  eye_of_sauron: {
    label: "👁 Eye of Sauron", group: "Sci-Fi",
    params: [
      { id: "height", label: "Total Height (m)", val: 90, min: 30, max: 300 },
      { id: "towerWidth", label: "Tower Base Width (m)", val: 28, min: 8, max: 100 },
      { id: "eyeRadius", label: "Eye Radius (m)", val: 22, min: 8, max: 80 },
    ]
  },
  mech_minigun: {
    label: "🔫 Mech — Minigun Turret", group: "Mechs",
    params: [
      { id: "baseRadius", label: "Base Radius (m)", val: 10, min: 3, max: 50 },
      { id: "height", label: "Total Height (m)", val: 20, min: 5, max: 80 },
      { id: "barrelCount", label: "Barrel Count", val: 6, min: 2, max: 12, step: 1 },
    ]
  },
  mech_walker: {
    label: "🕷 Mech — Spider Walker", group: "Mechs",
    params: [
      { id: "height", label: "Body Height (m)", val: 20, min: 5, max: 80 },
      { id: "width", label: "Body Width (m)", val: 18, min: 4, max: 70 },
    ]
  },
  cannon_turret: {
    label: "💥 Cannon Turret", group: "Mechs",
    params: [
      { id: "baseRadius", label: "Base Radius (m)", val: 10, min: 3, max: 40 },
      { id: "height", label: "Turret Height (m)", val: 15, min: 3, max: 60 },
    ]
  },

  // ── BODY PARTS ────────────────────────────────────────────────────────
  body_skull: {
    label: "💀 Skull", group: "Body Parts",
    params: [
      { id: "radius", label: "Skull Radius (m)", val: 12, min: 3, max: 50 },
      { id: "eyeSocket", label: "Eye Socket Depth (m)", val: 4, min: 1, max: 15 },
      { id: "jawDrop", label: "Jaw Drop (m)", val: 6, min: 0, max: 20 },
    ]
  },
  body_hand: {
    label: "✋ Giant Hand", group: "Body Parts",
    params: [
      { id: "palmSize", label: "Palm Size (m)", val: 12, min: 3, max: 50 },
      { id: "fingerLength", label: "Finger Length (m)", val: 18, min: 5, max: 80 },
      { id: "fingerCount", label: "Fingers", val: 5, min: 3, max: 5, step: 1 },
    ]
  },
  body_ribcage: {
    label: "🦴 Ribcage", group: "Body Parts",
    params: [
      { id: "width", label: "Width (m)", val: 16, min: 4, max: 60 },
      { id: "height", label: "Height (m)", val: 20, min: 5, max: 80 },
      { id: "ribs", label: "Rib Pairs", val: 7, min: 3, max: 12, step: 1 },
    ]
  },
  body_spine: {
    label: "🦴 Spine Column", group: "Body Parts",
    params: [
      { id: "height", label: "Spine Height (m)", val: 30, min: 5, max: 100 },
      { id: "vertebrae", label: "Vertebrae Count", val: 20, min: 6, max: 40, step: 1 },
      { id: "width", label: "Vertebra Width (m)", val: 4, min: 1, max: 20 },
    ]
  },
  body_eye: {
    label: "👁 Giant Eye", group: "Body Parts",
    params: [
      { id: "radius", label: "Eyeball Radius (m)", val: 15, min: 4, max: 60 },
      { id: "irisRadius", label: "Iris Radius (m)", val: 7, min: 1, max: 40 },
      { id: "pupilR", label: "Pupil Radius (m)", val: 3, min: 0.5, max: 20 },
    ]
  },
  body_humanoid: {
    label: "🧍 Full Humanoid Figure", group: "Body Parts",
    params: [
      { id: "height", label: "Figure Height (m)", val: 30, min: 8, max: 120 },
      { id: "width", label: "Shoulder Width (m)", val: 12, min: 3, max: 50 },
    ]
  },
  body_arm: {
    label: "💪 Robot Arm", group: "Body Parts",
    params: [
      { id: "length", label: "Arm Length (m)", val: 20, min: 5, max: 80 },
      { id: "upperRadius", label: "Upper Arm Radius (m)", val: 3, min: 0.5, max: 15 },
      { id: "lowerRadius", label: "Lower Arm Radius (m)", val: 2, min: 0.5, max: 12 },
      { id: "ballJointRadius", label: "Ball Joint Radius (m)", val: 4, min: 1, max: 20 },
    ]
  },
  body_leg: {
    label: "🦵 Robot Leg", group: "Body Parts",
    params: [
      { id: "length", label: "Leg Length (m)", val: 25, min: 5, max: 100 },
      { id: "thighRadius", label: "Thigh Radius (m)", val: 4, min: 1, max: 18 },
      { id: "shinRadius", label: "Shin Radius (m)", val: 3, min: 0.5, max: 14 },
      { id: "ballJointRadius", label: "Ball Joint Radius (m)", val: 5, min: 1, max: 22 },
      { id: "footLen", label: "Foot Length (m)", val: 8, min: 2, max: 30 },
    ]
  },
  body_ball_joint: {
    label: "⚙ Ball Joint", group: "Body Parts",
    params: [
      { id: "radius", label: "Joint Radius (m)", val: 6, min: 1, max: 30 },
    ]
  },

  // ── FORTIFICATIONS ────────────────────────────────────────────────────
  bastion_round: {
    label: "🏰 Round Fort Bastion", group: "Fortifications",
    params: [
      { id: "radius", label: "Bastion Radius (m)", val: 20, min: 5, max: 100 },
      { id: "wallH", label: "Wall Height (m)", val: 15, min: 3, max: 50 },
      { id: "wallRings", label: "Height Rings", val: 2, min: 1, max: 8, step: 1 },
      { id: "bastionSegs", label: "Segments", val: 16, min: 6, max: 32, step: 1 },
    ]
  },
  bastion_square: {
    label: "🏯 Square Fort", group: "Fortifications",
    params: [
      { id: "width", label: "Width (m)", val: 80, min: 10, max: 300 },
      { id: "depth", label: "Depth (m)", val: 80, min: 10, max: 300 },
      { id: "wallH", label: "Wall Height (m)", val: 15, min: 3, max: 50 },
      { id: "wallRings", label: "Height Rings", val: 2, min: 1, max: 8, step: 1 },
      { id: "spacing", label: "Obj Spacing (m)", val: 8, min: 2, max: 30 },
    ]
  },
  tower: {
    label: "🗼 Tower / Turret", group: "Fortifications",
    params: [
      { id: "radius", label: "Radius (m)", val: 8, min: 2, max: 50 },
      { id: "height", label: "Height (m)", val: 25, min: 3, max: 100 },
      { id: "rings", label: "Height Sections", val: 5, min: 2, max: 20, step: 1 },
      { id: "points", label: "Points/Ring", val: 8, min: 3, max: 20, step: 1 },
    ]
  },
  prison_tower: {
    label: "⛓ Prison Tower (Azkaban)", group: "Fortifications",
    params: [
      { id: "radius", label: "Tower Radius (m)", val: 15, min: 4, max: 80 },
      { id: "height", label: "Tower Height (m)", val: 40, min: 8, max: 160 },
      { id: "wallRings", label: "Height Rings", val: 8, min: 3, max: 20, step: 1 },
      { id: "crenHeight", label: "Crenellation Height (m)", val: 3, min: 1, max: 10 },
      { id: "windowH", label: "Arrow Slit Height (m)", val: 4, min: 1, max: 15 },
    ]
  },
  azkaban_tower: {
    label: "🏰 Azkaban Prison Complex", group: "Fortifications",
    params: [
      { id: "baseRadius", label: "Main Keep Radius (m)", val: 20, min: 5, max: 80 },
      { id: "height", label: "Main Keep Height (m)", val: 60, min: 15, max: 200 },
      { id: "towerCount", label: "Surrounding Towers", val: 5, min: 3, max: 8, step: 1 },
    ]
  },
  wall_line: {
    label: "🧱 Wall (Straight)", group: "Fortifications",
    params: [
      { id: "length", label: "Length (m)", val: 80, min: 4, max: 500 },
      { id: "height", label: "Height (m)", val: 15, min: 2, max: 60 },
      { id: "spacing", label: "Spacing (m)", val: 8, min: 1, max: 30 },
      { id: "rings", label: "Height Rings", val: 2, min: 1, max: 8, step: 1 },
    ]
  },
  wall_arc: {
    label: "🌙 Wall (Arc)", group: "Fortifications",
    params: [
      { id: "radius", label: "Arc Radius (m)", val: 40, min: 5, max: 200 },
      { id: "arcDeg", label: "Arc Degrees", val: 180, min: 10, max: 360 },
      { id: "height", label: "Height (m)", val: 12, min: 2, max: 60 },
      { id: "spacing", label: "Spacing (m)", val: 8, min: 1, max: 30 },
      { id: "rings", label: "Height Rings", val: 2, min: 1, max: 8, step: 1 },
    ]
  },
  star_fort: {
    label: "⭐ Star Fort", group: "Fortifications",
    params: [
      { id: "outerR", label: "Outer Radius (m)", val: 50, min: 10, max: 200 },
      { id: "innerR", label: "Inner Radius (m)", val: 30, min: 5, max: 150 },
      { id: "points", label: "Star Points", val: 5, min: 3, max: 8, step: 1 },
      { id: "height", label: "Wall Height (m)", val: 12, min: 2, max: 50 },
      { id: "rings", label: "Height Rings", val: 2, min: 1, max: 6, step: 1 },
    ]
  },

  // ── TUNNELS ────────────────────────────────────────────────────────────
  tunnel_circle: {
    label: "⭕ Tunnel (Circular)", group: "Tunnels",
    params: [
      { id: "radius", label: "Tunnel Radius (m)", val: 8, min: 2, max: 50 },
      { id: "length", label: "Tunnel Length (m)", val: 40, min: 5, max: 300 },
      { id: "points", label: "Points/Ring", val: 12, min: 4, max: 32, step: 1 },
      { id: "segments", label: "Segments Along", val: 8, min: 2, max: 40, step: 1 },
    ]
  },
  tunnel_square: {
    label: "▭ Tunnel (Square)", group: "Tunnels",
    params: [
      { id: "width", label: "Width (m)", val: 10, min: 2, max: 50 },
      { id: "height", label: "Height (m)", val: 8, min: 2, max: 40 },
      { id: "length", label: "Length (m)", val: 40, min: 5, max: 300 },
      { id: "spacing", label: "Spacing (m)", val: 4, min: 1, max: 20 },
      { id: "segments", label: "Segments Along", val: 8, min: 2, max: 40, step: 1 },
    ]
  },
  tunnel_hex: {
    label: "⬡ Tunnel (Hexagonal)", group: "Tunnels",
    params: [
      { id: "radius", label: "Hex Radius (m)", val: 8, min: 2, max: 50 },
      { id: "length", label: "Length (m)", val: 40, min: 5, max: 300 },
      { id: "spacing", label: "Spacing (m)", val: 4, min: 1, max: 20 },
      { id: "segments", label: "Segments Along", val: 8, min: 2, max: 40, step: 1 },
    ]
  },

  // ── ARCHITECTURE ───────────────────────────────────────────────────────
  skyscraper: {
    label: "🏢 Skyscraper", group: "Architecture",
    params: [
      { id: "width", label: "Base Width (m)", val: 20, min: 4, max: 80 },
      { id: "height", label: "Total Height (m)", val: 100, min: 20, max: 400 },
      { id: "floors", label: "Floors", val: 20, min: 5, max: 60, step: 1 },
    ]
  },
  pyramid_stepped: {
    label: "🔺 Stepped Pyramid", group: "Architecture",
    params: [
      { id: "baseSize", label: "Base Size (m)", val: 80, min: 10, max: 300 },
      { id: "height", label: "Total Height (m)", val: 40, min: 5, max: 200 },
      { id: "steps", label: "Steps", val: 6, min: 2, max: 16, step: 1 },
      { id: "shrink", label: "Shrink Factor (0-0.5)", val: 0.18, min: 0.05, max: 0.5, step: 0.01 },
      { id: "spacing", label: "Object Spacing (m)", val: 6, min: 1, max: 25 },
    ]
  },

  // ── PRIMITIVES ─────────────────────────────────────────────────────────
  grid_flat: {
    label: "⊞ Flat Grid", group: "Primitives",
    params: [
      { id: "cols", label: "Columns", val: 8, min: 1, max: 30, step: 1 },
      { id: "rows", label: "Rows", val: 8, min: 1, max: 30, step: 1 },
      { id: "spacingX", label: "X Spacing (m)", val: 8, min: 1, max: 50 },
      { id: "spacingZ", label: "Z Spacing (m)", val: 8, min: 1, max: 50 },
    ]
  },
  staircase: {
    label: "🪜 Staircase", group: "Primitives",
    params: [
      { id: "steps", label: "Steps", val: 12, min: 2, max: 40, step: 1 },
      { id: "stepW", label: "Width (m)", val: 6, min: 1, max: 30 },
      { id: "stepH", label: "Step Height (m)", val: 1.5, min: 0.3, max: 5 },
      { id: "stepD", label: "Depth (m)", val: 2, min: 0.5, max: 10 },
      { id: "curve", label: "Curve Radius (0=straight)", val: 0, min: 0, max: 50 },
    ]
  },
  pyramid: {
    label: "△ Stepped Pyramid (simple)", group: "Primitives",
    params: [
      { id: "levels", label: "Levels", val: 5, min: 2, max: 12, step: 1 },
      { id: "baseSize", label: "Base Size (m)", val: 60, min: 5, max: 300 },
      { id: "shrink", label: "Shrink/Level (%)", val: 20, min: 5, max: 50 },
      { id: "levelH", label: "Level Height (m)", val: 4, min: 1, max: 20 },
      { id: "spacing", label: "Spacing (m)", val: 8, min: 1, max: 30 },
    ]
  },
  ring_platform: {
    label: "⭕ Ring Platform", group: "Primitives",
    params: [
      { id: "outerR", label: "Outer Radius (m)", val: 40, min: 5, max: 200 },
      { id: "innerR", label: "Inner Radius (m)", val: 25, min: 2, max: 180 },
      { id: "height", label: "Height (m)", val: 8, min: 0, max: 50 },
      { id: "rings", label: "Concentric Rings", val: 2, min: 1, max: 8, step: 1 },
      { id: "points", label: "Points/Ring", val: 20, min: 4, max: 60, step: 1 },
    ]
  },
  cross: {
    label: "+ Cross / Plus Shape", group: "Primitives",
    params: [
      { id: "armLen", label: "Arm Length (m)", val: 30, min: 5, max: 150 },
      { id: "armW", label: "Arm Width (m)", val: 10, min: 2, max: 50 },
      { id: "height", label: "Height (m)", val: 8, min: 1, max: 40 },
      { id: "spacing", label: "Spacing (m)", val: 5, min: 1, max: 20 },
      { id: "rings", label: "Height Rings", val: 2, min: 1, max: 6, step: 1 },
    ]
  },
  arrow: {
    label: "→ Arrow Shape", group: "Primitives",
    params: [
      { id: "length", label: "Total Length (m)", val: 50, min: 10, max: 200 },
      { id: "width", label: "Shaft Width (m)", val: 8, min: 2, max: 40 },
      { id: "headW", label: "Head Width (m)", val: 20, min: 5, max: 80 },
      { id: "headL", label: "Head Length (m)", val: 15, min: 3, max: 60 },
      { id: "height", label: "Height (m)", val: 6, min: 1, max: 30 },
      { id: "spacing", label: "Spacing (m)", val: 5, min: 1, max: 20 },
    ]
  },
  letter_D: {
    label: "D Letter D", group: "Primitives",
    params: [
      { id: "size", label: "Letter Height (m)", val: 30, min: 5, max: 150 },
      { id: "depth", label: "Letter Depth (m)", val: 8, min: 1, max: 40 },
      { id: "spacing", label: "Obj Spacing (m)", val: 4, min: 1, max: 15 },
      { id: "rings", label: "Height Rings", val: 2, min: 1, max: 6, step: 1 },
    ]
  },
  letter_Z: {
    label: "Z Letter Z", group: "Primitives",
    params: [
      { id: "size", label: "Letter Height (m)", val: 30, min: 5, max: 150 },
      { id: "depth", label: "Letter Depth (m)", val: 8, min: 1, max: 40 },
      { id: "spacing", label: "Obj Spacing (m)", val: 4, min: 1, max: 15 },
      { id: "rings", label: "Height Rings", val: 2, min: 1, max: 6, step: 1 },
    ]
  },

  // ── EPIC UNIQUE ─────────────────────────────────────────────────────────────
  crashed_ufo: {
    label: "🛸 Crashed UFO", group: "Epic / Unique",
    params: [
      { id: "radius", label: "Saucer Radius (m)", val: 25, min: 5, max: 100 },
      { id: "tiltDeg", label: "Crash Tilt Angle (°)", val: 25, min: 5, max: 60 },
      { id: "debris", label: "Debris Pieces", val: 10, min: 4, max: 20, step: 1 },
    ]
  },
  volcano: {
    label: "🌋 Volcano", group: "Epic / Unique",
    params: [
      { id: "baseRadius", label: "Base Radius (m)", val: 50, min: 10, max: 200 },
      { id: "height", label: "Peak Height (m)", val: 60, min: 10, max: 250 },
      { id: "craterRadius", label: "Crater Radius (m)", val: 12, min: 2, max: 60 },
      { id: "rimHeight", label: "Rim Height (m)", val: 5, min: 1, max: 20 },
      { id: "rings", label: "Height Rings", val: 8, min: 3, max: 20, step: 1 },
      { id: "spacing", label: "Object Spacing (m)", val: 8, min: 2, max: 25 },
    ]
  },
  colosseum: {
    label: "🏟 Roman Colosseum", group: "Epic / Unique",
    params: [
      { id: "radius", label: "Outer Radius (m)", val: 60, min: 20, max: 250 },
      { id: "height", label: "Wall Height (m)", val: 30, min: 8, max: 100 },
      { id: "tiers", label: "Tiers (floors)", val: 3, min: 1, max: 5, step: 1 },
      { id: "arches", label: "Arches per Tier", val: 20, min: 8, max: 40, step: 1 },
    ]
  },
  stonehenge: {
    label: "🗿 Stonehenge", group: "Epic / Unique",
    params: [
      { id: "outerRadius", label: "Outer Ring Radius (m)", val: 30, min: 8, max: 120 },
      { id: "innerRadius", label: "Inner Horseshoe Radius (m)", val: 16, min: 4, max: 80 },
      { id: "stoneHeight", label: "Stone Height (m)", val: 8, min: 2, max: 30 },
      { id: "stoneWidth", label: "Stone Width (m)", val: 2, min: 0.5, max: 8 },
      { id: "outerCount", label: "Outer Stones", val: 30, min: 8, max: 60, step: 1 },
      { id: "trilithonCount", label: "Inner Trilithons", val: 5, min: 3, max: 8, step: 1 },
      { id: "archCount", label: "Outer Arch Pairs", val: 6, min: 3, max: 12, step: 1 },
    ]
  },
  mushroom_cloud: {
    label: "☢ Mushroom Cloud", group: "Epic / Unique",
    params: [
      { id: "radius", label: "Cap Radius (m)", val: 40, min: 10, max: 160 },
      { id: "height", label: "Total Height (m)", val: 80, min: 20, max: 300 },
    ]
  },
  black_hole: {
    label: "🌑 Black Hole", group: "Epic / Unique",
    params: [
      { id: "radius", label: "Accretion Disk Radius (m)", val: 30, min: 8, max: 120 },
      { id: "arcs", label: "Lensing Arcs", val: 4, min: 2, max: 8, step: 1 },
    ]
  },
  alien_mothership: {
    label: "🛸 Alien Mothership", group: "Epic / Unique",
    params: [
      { id: "radius", label: "Ship Radius (m)", val: 50, min: 15, max: 200 },
      { id: "emitterCount", label: "Tractor Beam Emitters", val: 8, min: 3, max: 12, step: 1 },
    ]
  },
  celtic_ring: {
    label: "⭕ Celtic Stone Ring", group: "Epic / Unique",
    params: [
      { id: "radius", label: "Ring Radius (m)", val: 30, min: 8, max: 120 },
      { id: "height", label: "Stone Height (m)", val: 8, min: 2, max: 30 },
      { id: "stoneCount", label: "Standing Stones", val: 24, min: 8, max: 48, step: 1 },
      { id: "archCount", label: "Outer Arch Gates", val: 6, min: 3, max: 12, step: 1 },
    ]
  },

  // ── ⚡ LIGHTWEIGHT BUILDINGS ───────────────────────────────────────────────
  treehouse: {
    label: "⚡ Treehouse", group: "⚡ Lightweight",
    params: [
      { id: "size", label: "Platform Width (m)", val: 8, min: 4, max: 20 },
      { id: "platformH", label: "Platform Height (m)", val: 6, min: 2, max: 16 },
      { id: "wallH", label: "Wall Height (m)", val: 3, min: 1, max: 8 },
    ]
  },
  checkpoint: {
    label: "⚡ Military Checkpoint", group: "⚡ Lightweight",
    params: [
      { id: "width", label: "Road Width (m)", val: 12, min: 6, max: 30 },
      { id: "depth", label: "Checkpoint Depth (m)", val: 8, min: 4, max: 20 },
    ]
  },
  watchtower_post: {
    label: "⚡ Watchtower Triangle", group: "⚡ Lightweight",
    params: [
      { id: "radius", label: "Triangle Radius (m)", val: 12, min: 6, max: 40 },
    ]
  },
  fuel_depot: {
    label: "⚡ Fuel Depot", group: "⚡ Lightweight",
    params: [
      { id: "size", label: "Depot Size (m)", val: 10, min: 6, max: 30 },
    ]
  },
  sniper_nest: {
    label: "⚡ Sniper Rock Nest", group: "⚡ Lightweight",
    params: [
      { id: "radius", label: "Rock Spread (m)", val: 4, min: 2, max: 12 },
      { id: "height", label: "Perch Height (m)", val: 3, min: 1, max: 10 },
    ]
  },
  farmstead: {
    label: "⚡ Rural Farmstead", group: "⚡ Lightweight",
    params: [
      { id: "size", label: "Compound Size (m)", val: 14, min: 8, max: 40 },
    ]
  },
  survivor_camp: {
    label: "⚡ Survivor Camp", group: "⚡ Lightweight",
    params: [
      { id: "radius", label: "Camp Radius (m)", val: 6, min: 3, max: 20 },
    ]
  },
  bunker_line: {
    label: "⚡ Bunker Defence Line", group: "⚡ Lightweight",
    params: [
      { id: "length", label: "Line Length (m)", val: 20, min: 8, max: 60 },
      { id: "width", label: "Channel Width (m)", val: 6, min: 3, max: 16 },
    ]
  },
  power_relay: {
    label: "⚡ Power Relay Station", group: "⚡ Lightweight",
    params: [
      { id: "spacing", label: "Tower Spacing (m)", val: 12, min: 6, max: 30 },
    ]
  },
  radio_outpost: {
    label: "⚡ Radio Outpost", group: "⚡ Lightweight",
    params: [
      { id: "radius", label: "Guy-Wire Radius (m)", val: 8, min: 4, max: 20 },
    ]
  },

  // ── 🤖 TRANSFORMERS ─────────────────────────────────────────────────────────
  tf_bumblebee: {
    label: "🟡 Bumblebee", group: "🤖 Transformers",
    params: [
      { id: "scale", label: "Mech Scale", val: 1, min: 0.4, max: 3, step: 0.05 },
    ]
  },
  tf_optimus: {
    label: "🔴 Optimus Prime", group: "🤖 Transformers",
    params: [
      { id: "scale", label: "Mech Scale", val: 1, min: 0.4, max: 3, step: 0.05 },
    ]
  },
  tf_ironhide: {
    label: "⚫ Ironhide", group: "🤖 Transformers",
    params: [
      { id: "scale", label: "Mech Scale", val: 1, min: 0.4, max: 3, step: 0.05 },
    ]
  },
  tf_jazz: {
    label: "⚪ Jazz", group: "🤖 Transformers",
    params: [
      { id: "scale", label: "Mech Scale", val: 1, min: 0.4, max: 3, step: 0.05 },
    ]
  },
  tf_ratchet: {
    label: "🟢 Ratchet", group: "🤖 Transformers",
    params: [
      { id: "scale", label: "Mech Scale", val: 1, min: 0.4, max: 3, step: 0.05 },
    ]
  },
  tf_megatron: {
    label: "🩶 Megatron", group: "🤖 Transformers",
    params: [
      { id: "scale", label: "Mech Scale", val: 1, min: 0.4, max: 3, step: 0.05 },
    ]
  },
  tf_starscream: {
    label: "🩵 Starscream", group: "🤖 Transformers",
    params: [
      { id: "scale", label: "Mech Scale", val: 1, min: 0.4, max: 3, step: 0.05 },
    ]
  },
};

export const SHAPE_GROUPS = [...new Set(Object.values(SHAPE_DEFS).map(s => s.group))];
