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
  azkaban_prison: { label: "Azkaban Prison", group: "Sci-Fi / Movies", params: [ { id: "width", label: "Width", val: 40, min: 20, max: 100, step: 2 }, { id: "height", label: "Height", val: 100, min: 40, max: 200, step: 5 } ] },
  stargate_portal: { label: "Stargate Portal", group: "Sci-Fi / Movies", params: [ { id: "radius", label: "Radius", val: 20, min: 10, max: 80, step: 2 } ] },
  helms_deep: { label: "Helm's Deep", group: "Sci-Fi / Movies", params: [ { id: "width", label: "Wall Length", val: 100, min: 40, max: 250, step: 10 } ] },
  jurassic_park_gate: { label: "Jurassic Park Gate", group: "Sci-Fi / Movies", params: [ { id: "width", label: "Width", val: 30, min: 10, max: 80, step: 5 }, { id: "height", label: "Height", val: 25, min: 10, max: 60, step: 5 } ] },
  nakatomi_plaza: { label: "Nakatomi Plaza", group: "Sci-Fi / Movies", params: [ { id: "width", label: "Width", val: 30, min: 10, max: 80, step: 5 }, { id: "height", label: "Height", val: 140, min: 40, max: 250, step: 10 } ] },
  matrix_zion_dock: { label: "Zion Dock", group: "Sci-Fi / Movies", params: [ { id: "width", label: "Radius", val: 100, min: 40, max: 200, step: 10 } ] },
  fortress_of_solitude: { label: "Fortress of Solitude", group: "Sci-Fi / Movies", params: [ { id: "width", label: "Radius", val: 60, min: 20, max: 150, step: 5 } ] },
  wall_maria: { label: "Wall Maria", group: "Sci-Fi / Movies", params: [ { id: "width", label: "Radius", val: 200, min: 50, max: 400, step: 10 }, { id: "height", label: "Height", val: 50, min: 20, max: 100, step: 5 } ] },
  barad_dur: { label: "Barad-dr", group: "Sci-Fi / Movies", params: [ { id: "width", label: "Base Width", val: 50, min: 20, max: 100, step: 5 }, { id: "height", label: "Height", val: 200, min: 50, max: 350, step: 10 } ] },
  tardis: { label: "TARDIS", group: "Sci-Fi / Movies", params: [ { id: "height", label: "Height", val: 10, min: 4, max: 30, step: 1 } ] },
  nuketown: { label: "Nuketown", group: "Military", params: [ { id: "width", label: "Arena Width", val: 60, min: 20, max: 150, step: 5 } ] },
  dust2_a_site: { label: "Dust 2 - A Site", group: "Military", params: [ { id: "width", label: "Site Width", val: 50, min: 20, max: 120, step: 5 } ] },
  peach_castle: { label: "Peach's Castle", group: "Monuments", params: [ { id: "radius", label: "Castle Radius", val: 40, min: 10, max: 100, step: 5 } ] },
  shinra_hq: { label: "Shinra HQ", group: "Sci-Fi / Movies", params: [ { id: "width", label: "Radius", val: 40, min: 20, max: 100, step: 5 }, { id: "height", label: "Height", val: 180, min: 50, max: 300, step: 10 } ] },
  halo_control_room: { label: "Halo Control Room", group: "Sci-Fi / Movies", params: [ { id: "width", label: "Base Width", val: 100, min: 40, max: 200, step: 10 }, { id: "height", label: "Height", val: 80, min: 30, max: 150, step: 10 } ] },
  colosseum: { label: "The Colosseum", group: "Monuments", params: [ { id: "width", label: "Radius", val: 80, min: 30, max: 150, step: 5 }, { id: "height", label: "Height", val: 40, min: 15, max: 80, step: 5 } ] },
  golden_gate_bridge: { label: "Golden Gate Bridge", group: "Monuments", params: [ { id: "width", label: "Span", val: 300, min: 100, max: 600, step: 20 }, { id: "height", label: "Height", val: 100, min: 30, max: 200, step: 10 } ] },
  normandy_bunkers: { label: "Normandy Bunkers", group: "Military", params: [ { id: "width", label: "Length", val: 120, min: 40, max: 300, step: 10 } ] },
  the_pentagon: { label: "The Pentagon", group: "Military", params: [ { id: "width", label: "Radius", val: 100, min: 30, max: 200, step: 5 } ] },
  pyramid_giza: { label: "Pyramid of Giza", group: "Monuments", params: [ { id: "width", label: "Base Width", val: 120, min: 30, max: 250, step: 10 } ] },
  taj_mahal: { label: "Taj Mahal", group: "Monuments", params: [ { id: "radius", label: "Base Radius", val: 30, min: 10, max: 80, step: 2 } ] },
  stonehenge: { label: "Stonehenge", group: "Monuments", params: [ { id: "radius", label: "Ring Radius", val: 25, min: 8, max: 60, step: 2 } ] },
  starship_enterprise: { label: "Starship Enterprise", group: "Sci-Fi / Movies", params: [ { id: "width", label: "Scale %", val: 100, min: 50, max: 300, step: 10 } ] },
  star_destroyer: { label: "Star Destroyer", group: "Sci-Fi / Movies", params: [ { id: "width", label: "Width", val: 100, min: 30, max: 250, step: 10 }, { id: "length", label: "Length", val: 200, min: 50, max: 500, step: 10 } ] },
  king_kong_empire: { label: "Empire State (Kong)", group: "Monuments", params: [ { id: "height", label: "Tower Height", val: 180, min: 50, max: 350, step: 10 } ] },
  avengers_tower: { label: "Avengers Tower", group: "Sci-Fi / Movies", params: [ { id: "height", label: "Tower Height", val: 125, min: 40, max: 250, step: 5 } ] },
  crashed_ufo: { label: "Crashed UFO", group: "Sci-Fi / Epic", params: [ { id: "radius", label: "UFO Radius", val: 40, min: 10, max: 150, step: 2 }, { id: "tiltDeg", label: "Crash Tilt", val: 25, min: 0, max: 60, step: 1 }, { id: "debris", label: "Debris Count", val: 8, min: 0, max: 50, step: 2 } ] },
  shipwreck: { label: "Shipwreck", group: "Sci-Fi / Epic", params: [ { id: "length", label: "Ship Length", val: 60, min: 20, max: 200, step: 5 }, { id: "tiltDeg", label: "Hull List", val: 15, min: 0, max: 45, step: 1 } ] },
  volcano: { label: "Active Volcano", group: "Monuments", params: [ { id: "height", label: "Summit Height", val: 40, min: 10, max: 150, step: 5 }, { id: "baseRadius", label: "Base Radius", val: 60, min: 20, max: 200, step: 5 }, { id: "craterRadius", label: "Crater Size", val: 15, min: 5, max: 50, step: 2 } ] },

  //  SCI-FI / EPIC 

  deathstar: {
    label: " Death Star", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Equatorial Radius (m)", val: 40, min: 5, max: 200, step: 1 },
      { id: "latSegs", label: "Latitude Segments", val: 10, min: 4, max: 20, step: 1 },
      { id: "lonSegs", label: "Longitude Segments", val: 16, min: 6, max: 32, step: 1 },
      { id: "dishRadius", label: "Dish Indent Radius (m)", val: 12, min: 2, max: 60, step: 0.5 },
      { id: "dishDepth", label: "Dish Depth (m)", val: 8, min: 1, max: 30, step: 0.5 },
      { id: "dishLat", label: "Dish Latitude (deg)", val: 30, min: -80, max: 80, step: 1 },
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
      { id: "majorSegs", label: "Segments Around", val: 32, min: 6, max: 80 },
      { id: "minorSegs", label: "Segments Tube", val: 12, min: 3, max: 32 },
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
    label: "Mbius Strip", group: "Sci-Fi / Epic",
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
    label: " Millennium Falcon", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Hull Radius (m)", val: 40, min: 8, max: 120 },
    ]
  },
  orbital_station: {
    label: " Orbital Station", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Ring Radius (m)", val: 35, min: 10, max: 150 },
    ]
  },
  reactor_core: {
    label: " Reactor Core", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Radius (m)", val: 25, min: 5, max: 100 },
      { id: "height", label: "Height (m)", val: 30, min: 5, max: 120 },
      { id: "rings", label: "Plasma Rings", val: 5, min: 2, max: 12 },
    ]
  },
  sci_fi_gate: {
    label: " Sci-Fi Portal Gate", group: "Sci-Fi / Epic",
    params: [
      { id: "width", label: "Gate Width (m)", val: 40, min: 8, max: 150 },
      { id: "height", label: "Gate Height (m)", val: 30, min: 5, max: 100 },
    ]
  },
  dna_double: {
    label: " DNA Double Helix", group: "Sci-Fi / Epic",
    params: [
      { id: "radius", label: "Helix Radius (m)", val: 12, min: 3, max: 60 },
      { id: "height", label: "Total Height (m)", val: 40, min: 5, max: 200 },
      { id: "turns", label: "Turns", val: 5, min: 2, max: 20 },
      { id: "pointsPerTurn", label: "Points/Turn", val: 12, min: 4, max: 32 },
    ]
  },

  //  MECHS 
  mech_bipedal: {
    label: " Mech  Bipedal Warrior", group: "Mechs",
    params: [
      { id: "height", label: "Mech Height (m)", val: 25, min: 8, max: 100 },
      { id: "width", label: "Shoulder Width (m)", val: 14, min: 4, max: 60 },
    ]
  },
  t800_endoskeleton: {
    label: " T-800 Endoskeleton", group: "Mechs",
    params: [
      { id: "height", label: "Total Height (m)", val: 22, min: 8, max: 80 },
      { id: "width", label: "Shoulder Width (m)", val: 10, min: 4, max: 50 },
    ]
  },
  atat_walker: {
    label: " AT-AT Walker", group: "Mechs",
    params: [
      { id: "height", label: "Total Height (m)", val: 30, min: 10, max: 100 },
      { id: "width", label: "Body Width (m)", val: 20, min: 8, max: 80 },
    ]
  },
  borg_cube: {
    label: " Borg Cube", group: "Sci-Fi / Movies",
    params: [
      { id: "size", label: "Cube Size (m)", val: 40, min: 10, max: 200 },
      { id: "gridLines", label: "Grid Lines per Face", val: 4, min: 2, max: 8, step: 1 },
    ]
  },
  eye_of_sauron: {
    label: " Eye of Sauron", group: "Sci-Fi / Movies",
    params: [
      { id: "height", label: "Total Height (m)", val: 90, min: 30, max: 300 },
      { id: "towerWidth", label: "Tower Base Width (m)", val: 28, min: 8, max: 100 },
      { id: "eyeRadius", label: "Eye Radius (m)", val: 22, min: 8, max: 80 },
    ]
  },
  mech_minigun: {
    label: " Mech  Minigun Turret", group: "Mechs",
    params: [
      { id: "baseRadius", label: "Base Radius (m)", val: 10, min: 3, max: 50 },
      { id: "height", label: "Total Height (m)", val: 20, min: 5, max: 80 },
      { id: "barrelCount", label: "Barrel Count", val: 6, min: 2, max: 12, step: 1 },
    ]
  },
  mech_walker: {
    label: " Mech  Spider Walker", group: "Mechs",
    params: [
      { id: "height", label: "Body Height (m)", val: 20, min: 5, max: 80 },
      { id: "width", label: "Body Width (m)", val: 18, min: 4, max: 70 },
    ]
  },
  cannon_turret: {
    label: " Cannon Turret", group: "Mechs",
    params: [
      { id: "baseRadius", label: "Base Radius (m)", val: 10, min: 3, max: 40 },
      { id: "height", label: "Turret Height (m)", val: 15, min: 3, max: 60 },
    ]
  },

  //  BODY PARTS 
  body_skull: {
    label: " Skull", group: "Body Parts",
    params: [
      { id: "radius", label: "Skull Radius (m)", val: 12, min: 3, max: 50 },
      { id: "eyeSocket", label: "Eye Socket Depth (m)", val: 4, min: 1, max: 15 },
      { id: "jawDrop", label: "Jaw Drop (m)", val: 6, min: 0, max: 20 },
    ]
  },
  body_hand: {
    label: " Giant Hand", group: "Body Parts",
    params: [
      { id: "palmSize", label: "Palm Size (m)", val: 12, min: 3, max: 50 },
      { id: "fingerLength", label: "Finger Length (m)", val: 18, min: 5, max: 80 },
      { id: "fingerCount", label: "Fingers", val: 5, min: 3, max: 5, step: 1 },
    ]
  },
  body_ribcage: {
    label: " Ribcage", group: "Body Parts",
    params: [
      { id: "width", label: "Width (m)", val: 16, min: 4, max: 60 },
      { id: "height", label: "Height (m)", val: 20, min: 5, max: 80 },
      { id: "ribs", label: "Rib Pairs", val: 7, min: 3, max: 12, step: 1 },
    ]
  },
  body_spine: {
    label: " Spine Column", group: "Body Parts",
    params: [
      { id: "height", label: "Spine Height (m)", val: 30, min: 5, max: 100 },
      { id: "vertebrae", label: "Vertebrae Count", val: 20, min: 6, max: 40, step: 1 },
      { id: "width", label: "Vertebra Width (m)", val: 4, min: 1, max: 20 },
    ]
  },
  body_eye: {
    label: " Giant Eye", group: "Body Parts",
    params: [
      { id: "radius", label: "Eyeball Radius (m)", val: 15, min: 4, max: 60 },
      { id: "irisRadius", label: "Iris Radius (m)", val: 7, min: 1, max: 40 },
      { id: "pupilR", label: "Pupil Radius (m)", val: 3, min: 0.5, max: 20 },
    ]
  },
  body_humanoid: {
    label: " Full Humanoid Figure", group: "Body Parts",
    params: [
      { id: "height", label: "Figure Height (m)", val: 30, min: 8, max: 120 },
      { id: "width", label: "Shoulder Width (m)", val: 12, min: 3, max: 50 },
    ]
  },
  body_arm: {
    label: " Robot Arm", group: "Body Parts",
    params: [
      { id: "length", label: "Arm Length (m)", val: 20, min: 5, max: 80 },
      { id: "upperRadius", label: "Upper Arm Radius (m)", val: 3, min: 0.5, max: 15 },
      { id: "lowerRadius", label: "Lower Arm Radius (m)", val: 2, min: 0.5, max: 12 },
      { id: "ballJointRadius", label: "Ball Joint Radius (m)", val: 4, min: 1, max: 20 },
    ]
  },
  body_leg: {
    label: " Robot Leg", group: "Body Parts",
    params: [
      { id: "length", label: "Leg Length (m)", val: 25, min: 5, max: 100 },
      { id: "thighRadius", label: "Thigh Radius (m)", val: 4, min: 1, max: 18 },
      { id: "shinRadius", label: "Shin Radius (m)", val: 3, min: 0.5, max: 14 },
      { id: "ballJointRadius", label: "Ball Joint Radius (m)", val: 5, min: 1, max: 22 },
      { id: "footLen", label: "Foot Length (m)", val: 8, min: 2, max: 30 },
    ]
  },
  body_ball_joint: {
    label: " Ball Joint", group: "Body Parts",
    params: [
      { id: "radius", label: "Joint Radius (m)", val: 6, min: 1, max: 30 },
    ]
  },

  //  FORTIFICATIONS 
  bastion_round: {
    label: " Round Fort Bastion", group: "Fortifications",
    params: [
      { id: "radius", label: "Bastion Radius (m)", val: 20, min: 5, max: 100 },
      { id: "wallH", label: "Wall Height (m)", val: 15, min: 3, max: 50 },
      { id: "wallRings", label: "Height Rings", val: 2, min: 1, max: 8, step: 1 },
      { id: "bastionSegs", label: "Segments", val: 16, min: 6, max: 32, step: 1 },
    ]
  },
  bastion_square: {
    label: " Square Fort", group: "Fortifications",
    params: [
      { id: "width", label: "Width (m)", val: 80, min: 10, max: 300 },
      { id: "depth", label: "Depth (m)", val: 80, min: 10, max: 300 },
      { id: "wallH", label: "Wall Height (m)", val: 15, min: 3, max: 50 },
      { id: "wallRings", label: "Height Rings", val: 2, min: 1, max: 8, step: 1 },
      { id: "spacing", label: "Obj Spacing (m)", val: 8, min: 2, max: 30 },
    ]
  },
  tower: {
    label: " Tower / Turret", group: "Fortifications",
    params: [
      { id: "radius", label: "Radius (m)", val: 5, min: 2, max: 50 },
      { id: "height", label: "Height (m)", val: 30, min: 3, max: 100 },
      { id: "rings", label: "Height Sections", val: 5, min: 2, max: 20, step: 1 },
      { id: "points", label: "Points/Ring", val: 8, min: 3, max: 24, step: 1 },
    ]
  },
  prison_tower: {
    label: " Prison Tower (Azkaban)", group: "Fortifications",
    params: [
      { id: "radius", label: "Tower Radius (m)", val: 15, min: 4, max: 80 },
      { id: "height", label: "Tower Height (m)", val: 40, min: 8, max: 160 },
      { id: "wallRings", label: "Height Rings", val: 8, min: 3, max: 20, step: 1 },
      { id: "crenHeight", label: "Crenellation Height (m)", val: 3, min: 1, max: 10 },
      { id: "windowH", label: "Arrow Slit Height (m)", val: 4, min: 1, max: 15 },
    ]
  },
  azkaban_tower: {
    label: " Azkaban Prison Complex", group: "Fortifications",
    params: [
      { id: "baseRadius", label: "Main Keep Radius (m)", val: 20, min: 5, max: 80 },
      { id: "height", label: "Main Keep Height (m)", val: 60, min: 15, max: 200 },
      { id: "towerCount", label: "Surrounding Towers", val: 5, min: 3, max: 8, step: 1 },
    ]
  },
  wall_line: {
    label: " Wall (Straight)", group: "Fortifications",
    params: [
      { id: "length", label: "Length (m)", val: 80, min: 4, max: 500 },
      { id: "height", label: "Height (m)", val: 15, min: 2, max: 60 },
      { id: "spacing", label: "Spacing (m)", val: 8, min: 1, max: 30 },
      { id: "rings", label: "Height Rings", val: 2, min: 1, max: 8, step: 1 },
    ]
  },
  wall_arc: {
    label: " Wall (Arc)", group: "Fortifications",
    params: [
      { id: "radius", label: "Arc Radius (m)", val: 40, min: 5, max: 200 },
      { id: "arcDeg", label: "Arc Degrees", val: 180, min: 10, max: 360 },
      { id: "height", label: "Height (m)", val: 12, min: 2, max: 60 },
      { id: "spacing", label: "Spacing (m)", val: 8, min: 1, max: 30 },
      { id: "rings", label: "Height Rings", val: 2, min: 1, max: 8, step: 1 },
    ]
  },
  star_fort: {
    label: " Star Fort", group: "Fortifications",
    params: [
      { id: "radius", label: "Radius (m)", val: 40, min: 10, max: 200 },
      { id: "points", label: "Star Points", val: 5, min: 3, max: 12, step: 1 },
      { id: "depth", label: "Star Depth (m)", val: 20, min: 5, max: 150 },
      { id: "height", label: "Wall Height (m)", val: 10, min: 2, max: 50 },
      { id: "layers", label: "Layers", val: 3, min: 1, max: 20, step: 1 },
    ]
  },

  //  TUNNELS 
  tunnel_circle: {
    label: " Tunnel (Circular)", group: "Tunnels",
    params: [
      { id: "radius", label: "Tunnel Radius (m)", val: 8, min: 2, max: 50 },
      { id: "length", label: "Tunnel Length (m)", val: 40, min: 5, max: 300 },
      { id: "points", label: "Points/Ring", val: 12, min: 4, max: 32, step: 1 },
      { id: "segments", label: "Segments Along", val: 8, min: 2, max: 40, step: 1 },
    ]
  },
  tunnel_square: {
    label: " Tunnel (Square)", group: "Tunnels",
    params: [
      { id: "width", label: "Width (m)", val: 10, min: 2, max: 50 },
      { id: "height", label: "Height (m)", val: 8, min: 2, max: 40 },
      { id: "length", label: "Length (m)", val: 40, min: 5, max: 300 },
      { id: "spacing", label: "Spacing (m)", val: 4, min: 1, max: 20 },
      { id: "segments", label: "Segments Along", val: 8, min: 2, max: 40, step: 1 },
    ]
  },
  tunnel_hex: {
    label: " Tunnel (Hexagonal)", group: "Tunnels",
    params: [
      { id: "radius", label: "Hex Radius (m)", val: 8, min: 2, max: 50 },
      { id: "length", label: "Length (m)", val: 40, min: 5, max: 300 },
      { id: "spacing", label: "Spacing (m)", val: 4, min: 1, max: 20 },
      { id: "segments", label: "Segments Along", val: 8, min: 2, max: 40, step: 1 },
    ]
  },

  //  ARCHITECTURE 
  pyramid_stepped: {
    label: " Stepped Pyramid", group: "Architecture",
    params: [
      { id: "baseSize", label: "Base Size (m)", val: 80, min: 10, max: 300 },
      { id: "height", label: "Total Height (m)", val: 40, min: 5, max: 200 },
      { id: "steps", label: "Steps", val: 6, min: 2, max: 16, step: 1 },
      { id: "shrink", label: "Shrink Factor (0-0.5)", val: 0.18, min: 0.05, max: 0.5, step: 0.01 },
      { id: "spacing", label: "Object Spacing (m)", val: 6, min: 1, max: 25 },
    ]
  },

  //  PRIMITIVES 
  grid_flat: {
    label: " Flat Grid", group: "Primitives",
    params: [
      { id: "cols", label: "Columns", val: 8, min: 1, max: 30, step: 1 },
      { id: "rows", label: "Rows", val: 8, min: 1, max: 30, step: 1 },
      { id: "spacingX", label: "X Spacing (m)", val: 8, min: 1, max: 50 },
      { id: "spacingZ", label: "Z Spacing (m)", val: 8, min: 1, max: 50 },
    ]
  },
  staircase: {
    label: " Staircase", group: "Primitives",
    params: [
      { id: "steps", label: "Steps", val: 12, min: 2, max: 40, step: 1 },
      { id: "stepW", label: "Width (m)", val: 6, min: 1, max: 30 },
      { id: "stepH", label: "Step Height (m)", val: 1.5, min: 0.3, max: 5 },
      { id: "stepD", label: "Depth (m)", val: 2, min: 0.5, max: 10 },
      { id: "curve", label: "Curve Radius (0=straight)", val: 0, min: 0, max: 50 },
    ]
  },
  pyramid: {
    label: " Stepped Pyramid (simple)", group: "Primitives",
    params: [
      { id: "levels", label: "Levels", val: 5, min: 2, max: 12, step: 1 },
      { id: "baseSize", label: "Base Size (m)", val: 60, min: 5, max: 300 },
      { id: "shrink", label: "Shrink/Level (%)", val: 20, min: 5, max: 50 },
      { id: "levelH", label: "Level Height (m)", val: 4, min: 1, max: 20 },
      { id: "spacing", label: "Spacing (m)", val: 8, min: 1, max: 30 },
    ]
  },
  ring_platform: {
    label: " Ring Platform", group: "Primitives",
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
      { id: "width", label: "Width (m)", val: 20, min: 5, max: 150 },
      { id: "height", label: "Height (m)", val: 20, min: 2, max: 50 },
      { id: "depth", label: "Depth/Thickness (m)", val: 4, min: 1, max: 40 },
      { id: "spacing", label: "Spacing (m)", val: 5, min: 1, max: 20 },
      { id: "rings", label: "Height Rings", val: 3, min: 1, max: 6, step: 1 },
    ]
  },
  arrow: {
    label: " Arrow Shape", group: "Primitives",
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

  //  EPIC UNIQUE 
  celtic_ring: {
    label: " Celtic Stone Ring", group: "Epic / Unique",
    params: [
      { id: "radius", label: "Ring Radius (m)", val: 30, min: 8, max: 120 },
      { id: "height", label: "Stone Height (m)", val: 8, min: 2, max: 30 },
      { id: "stoneCount", label: "Standing Stones", val: 24, min: 8, max: 48, step: 1 },
      { id: "archCount", label: "Outer Arch Gates", val: 6, min: 3, max: 12, step: 1 },
    ]
  },

  //   LIGHTWEIGHT BUILDINGS 
  treehouse: {
    label: " Treehouse", group: " Lightweight",
    params: [
      { id: "size", label: "Platform Width (m)", val: 8, min: 4, max: 20 },
      { id: "platformH", label: "Platform Height (m)", val: 6, min: 2, max: 16 },
      { id: "wallH", label: "Wall Height (m)", val: 3, min: 1, max: 8 },
    ]
  },
  checkpoint: {
    label: " Military Checkpoint", group: " Lightweight",
    params: [
      { id: "width", label: "Road Width (m)", val: 12, min: 6, max: 30 },
      { id: "depth", label: "Checkpoint Depth (m)", val: 8, min: 4, max: 20 },
    ]
  },
  watchtower_post: {
    label: " Watchtower Triangle", group: " Lightweight",
    params: [
      { id: "radius", label: "Triangle Radius (m)", val: 12, min: 6, max: 40 },
    ]
  },
  fuel_depot: {
    label: " Fuel Depot", group: " Lightweight",
    params: [
      { id: "size", label: "Depot Size (m)", val: 10, min: 6, max: 30 },
    ]
  },
  sniper_nest: {
    label: " Sniper Rock Nest", group: " Lightweight",
    params: [
      { id: "radius", label: "Rock Spread (m)", val: 4, min: 2, max: 12 },
      { id: "height", label: "Perch Height (m)", val: 3, min: 1, max: 10 },
    ]
  },
  farmstead: {
    label: " Rural Farmstead", group: " Lightweight",
    params: [
      { id: "size", label: "Compound Size (m)", val: 14, min: 8, max: 40 },
    ]
  },
  survivor_camp: {
    label: " Survivor Camp", group: " Lightweight",
    params: [
      { id: "radius", label: "Camp Radius (m)", val: 6, min: 3, max: 20 },
    ]
  },
  bunker_line: {
    label: " Bunker Defence Line", group: " Lightweight",
    params: [
      { id: "length", label: "Line Length (m)", val: 20, min: 8, max: 60 },
      { id: "width", label: "Channel Width (m)", val: 6, min: 3, max: 16 },
    ]
  },
  power_relay: {
    label: " Power Relay Station", group: " Lightweight",
    params: [
      { id: "spacing", label: "Tower Spacing (m)", val: 12, min: 6, max: 30 },
    ]
  },
  radio_outpost: {
    label: " Radio Outpost", group: " Lightweight",
    params: [
      { id: "radius", label: "Guy-Wire Radius (m)", val: 8, min: 4, max: 20 },
    ]
  },

  //   TRANSFORMERS 
  tf_bumblebee: {
    label: " Bumblebee", group: " Transformers",
    params: [
      { id: "scale", label: "Mech Scale", val: 1, min: 0.4, max: 3, step: 0.05 },
    ]
  },
  tf_optimus: {
    label: " Optimus Prime", group: " Transformers",
    params: [
      { id: "scale", label: "Mech Scale", val: 1, min: 0.4, max: 3, step: 0.05 },
    ]
  },
  tf_ironhide: {
    label: " Ironhide", group: " Transformers",
    params: [
      { id: "scale", label: "Mech Scale", val: 1, min: 0.4, max: 3, step: 0.05 },
    ]
  },
  tf_jazz: {
    label: " Jazz", group: " Transformers",
    params: [
      { id: "scale", label: "Mech Scale", val: 1, min: 0.4, max: 3, step: 0.05 },
    ]
  },
  tf_ratchet: {
    label: " Ratchet", group: " Transformers",
    params: [
      { id: "scale", label: "Mech Scale", val: 1, min: 0.4, max: 3, step: 0.05 },
    ]
  },
  tf_megatron: {
    label: " Megatron", group: " Transformers",
    params: [
      { id: "scale", label: "Mech Scale", val: 1, min: 0.4, max: 3, step: 0.05 },
    ]
  },
  tf_starscream: {
    label: " Starscream", group: " Transformers",
    params: [
      { id: "scale", label: "Mech Scale", val: 1, min: 0.4, max: 3, step: 0.05 },
    ]
  },
  dragon: {
    label: " Dragon", group: " Fantasy & Mythic",
    params: [
      { id: "scale",  label: "Overall Scale",  val: 1,  min: 0.3, max: 4,  step: 0.05 },
      { id: "length", label: "Body Length",     val: 12, min: 6,   max: 30, step: 1    },
      { id: "wings",  label: "Wingspan",        val: 8,  min: 3,   max: 20, step: 0.5  },
      { id: "neck",   label: "Neck Length",     val: 4,  min: 1,   max: 10, step: 0.5  },
    ]
  },
  pirate_ship: {
    label: " Pirate Ship", group: " Nautical",
    params: [
      { id: "scale",  label: "Overall Scale", val: 1,  min: 0.3, max: 4,  step: 0.05 },
      { id: "length", label: "Hull Length",   val: 20, min: 10,  max: 50, step: 1    },
      { id: "masts",  label: "Mast Count",    val: 3,  min: 1,   max: 4,  step: 1    },
    ]
  },
  pvp_arena: {
    label: " PVP Arena", group: " Structures",
    params: [
      { id: "scale",  label: "Overall Scale",            val: 1,  min: 0.3, max: 4,   step: 0.05 },
      { id: "radius", label: "Arena Radius",             val: 15, min: 6,   max: 40,  step: 1    },
      { id: "height", label: "Wall Height",              val: 5,  min: 2,   max: 15,  step: 0.5  },
      { id: "walls",  label: "Wall Segments",            val: 8,  min: 4,   max: 12,  step: 1    },
      { id: "detail", label: "Detail (1=Light 2=Med 3=Heavy)", val: 2, min: 1, max: 3, step: 1   },
    ]
  },
  helipad: {
    label: " Helipad", group: " Structures",
    params: [
      { id: "scale",    label: "Overall Scale",   val: 1, min: 0.3, max: 4,  step: 0.05 },
      { id: "radius",   label: "Pad Radius",      val: 8, min: 3,   max: 25, step: 0.5  },
      { id: "elevated", label: "Elevated (0=No)", val: 0, min: 0,   max: 1,  step: 1    },
      { id: "height",   label: "Platform Height", val: 4, min: 1,   max: 15, step: 0.5  },
      { id: "lights",   label: "Lights (0=No)",   val: 1, min: 0,   max: 1,  step: 1    },
    ]
  },
  arena_colosseum: {
    label: " Colosseum", group: " Arenas",
    params: [
      { id: "scale",   label: "Overall Scale",              val: 1,  min: 0.3, max: 4,  step: 0.05 },
      { id: "radiusX", label: "Major Radius (m)",           val: 22, min: 10,  max: 50, step: 1    },
      { id: "radiusZ", label: "Minor Radius (m)",           val: 15, min: 8,   max: 35, step: 1    },
      { id: "height",  label: "Wall Height (m)",            val: 7,  min: 3,   max: 20, step: 0.5  },
      { id: "tiers",   label: "Seating Tiers",              val: 3,  min: 1,   max: 4,  step: 1    },
      { id: "detail",  label: "Detail (1=Light 2=Med 3=Heavy)", val: 2, min: 1, max: 3, step: 1   },
    ]
  },
  arena_fort: {
    label: " Fortress Arena", group: " Arenas",
    params: [
      { id: "scale",   label: "Overall Scale",              val: 1,  min: 0.3, max: 4,  step: 0.05 },
      { id: "width",   label: "Width (m)",                  val: 28, min: 15,  max: 60, step: 1    },
      { id: "depth",   label: "Depth (m)",                  val: 28, min: 15,  max: 60, step: 1    },
      { id: "height",  label: "Wall Height",                val: 6,  min: 3,   max: 15, step: 0.5  },
      { id: "bastions",label: "Bastions (0=No)",            val: 1,  min: 0,   max: 1,  step: 1    },
      { id: "detail",  label: "Detail (1=Light 2=Med 3=Heavy)", val: 2, min: 1, max: 3, step: 1   },
    ]
  },
  arena_maze: {
    label: " Maze Arena", group: " Arenas",
    params: [
      { id: "scale",  label: "Overall Scale",               val: 1,    min: 0.3, max: 3,     step: 0.05 },
      { id: "size",   label: "Grid Size",                   val: 10,   min: 5,   max: 18,    step: 1    },
      { id: "wallH",  label: "Wall Height",                 val: 3,    min: 1.5, max: 8,     step: 0.5  },
      { id: "seed",   label: "Maze Seed (roll for new maze)", val: 42, min: 1,   max: 9999,  step: 1    },
      { id: "roomSz", label: "Winner Room Size (cells)",    val: 3,    min: 2,   max: 5,     step: 1    },
      { id: "detail", label: "Detail (1=Light 2=Med 3=Heavy)", val: 2, min: 1,   max: 3,     step: 1    },
    ]
  },
  arena_siege: {
    label: " Siege Arena", group: " Arenas",
    params: [
      { id: "scale",   label: "Overall Scale",              val: 1,  min: 0.3, max: 4,  step: 0.05 },
      { id: "width",   label: "Arena Width (m)",            val: 35, min: 20,  max: 70, step: 1    },
      { id: "wallH",   label: "Defender Wall H",            val: 6,  min: 3,   max: 12, step: 0.5  },
      { id: "towerH",  label: "Keep Height (m)",            val: 14, min: 6,   max: 30, step: 1    },
      { id: "detail",  label: "Detail (1=Light 2=Med 3=Heavy)", val: 2, min: 1, max: 3, step: 1   },
    ]
  },
  arena_compound: {
    label: " Compound Arena", group: " Arenas",
    params: [
      { id: "scale",  label: "Overall Scale",               val: 1,  min: 0.3, max: 4,  step: 0.05 },
      { id: "width",  label: "Width (m)",                   val: 32, min: 15,  max: 70, step: 1    },
      { id: "depth",  label: "Depth (m)",                   val: 24, min: 15,  max: 50, step: 1    },
      { id: "height", label: "Wall Height",                 val: 4,  min: 2,   max: 10, step: 0.5  },
      { id: "rows",   label: "Cover Rows",                  val: 3,  min: 1,   max: 6,  step: 1    },
      { id: "detail", label: "Detail (1=Light 2=Med 3=Heavy)", val: 2, min: 1, max: 3, step: 1    },
    ]
  },
  iron_throne: {
    label: " Iron Throne (GoT)", group: "Sci-Fi / Movies",
    params: [
      { id: "scale",      label: "Overall Scale",                val: 1,    min: 0.3, max: 3,   step: 0.05 },
      { id: "height",     label: "Back Height (m)",              val: 14,   min: 6,   max: 30,  step: 1    },
      { id: "spikeCount", label: "Sword Spikes in Back",         val: 11,   min: 5,   max: 20,  step: 1    },
    ]
  },
  wall_perimeter: {
    label: " Wall Perimeter", group: " Arenas",
    params: [
      { id: "scale",       label: "Overall Scale",                val: 1,  min: 0.3, max: 3,   step: 0.05 },
      { id: "width",       label: "Width E-W (m)",                val: 30, min: 6,   max: 300, step: 1    },
      { id: "depth",       label: "Depth N-S (m)",                val: 30, min: 6,   max: 300, step: 1    },
      { id: "wallSpacing", label: "Wall Object Spacing (m)",      val: 3,  min: 1,   max: 8,   step: 0.5  },
      { id: "wallH",       label: "Wall Height",                  val: 3,  min: 1,   max: 12,  step: 0.5  },
      { id: "gapN",        label: "Gate North (0=No 1=Yes)",      val: 0,  min: 0,   max: 1,   step: 1    },
      { id: "gapS",        label: "Gate South (0=No 1=Yes)",      val: 1,  min: 0,   max: 1,   step: 1    },
      { id: "gapE",        label: "Gate East (0=No 1=Yes)",       val: 0,  min: 0,   max: 1,   step: 1    },
      { id: "gapW",        label: "Gate West (0=No 1=Yes)",       val: 0,  min: 0,   max: 1,   step: 1    },
      { id: "gapWidth",    label: "Gate Width (m)",               val: 4,  min: 2,   max: 16,  step: 0.5  },
      { id: "corners",     label: "Corner Towers (0=No 1=Yes)",   val: 1,  min: 0,   max: 1,   step: 1    },
      { id: "towerH",      label: "Tower Height",                 val: 8,  min: 3,   max: 24,  step: 0.5  },
    ]
  },

  //  ARCHITECTURE (DayZDisco-inspired) 
  gothic_arch: {
    label: " Gothic Arch Arcade", group: " Architecture",
    params: [
      { id: "width",     label: "Arch Inner Width (m)",     val: 12,  min: 4,  max: 40,  step: 0.5 },
      { id: "height",    label: "Arch Apex Height (m)",     val: 16,  min: 6,  max: 40,  step: 0.5 },
      { id: "depth",     label: "Arcade Total Length (m)",  val: 60,  min: 10, max: 200, step: 1   },
      { id: "bays",      label: "Number of Bays",           val: 5,   min: 1,  max: 20,  step: 1   },
      { id: "thickness", label: "Arch Ring Thickness (m)",  val: 2,   min: 0.5,max: 6,   step: 0.5 },
      { id: "pillarW",   label: "Pillar Width (m)",         val: 2.5, min: 1,  max: 8,   step: 0.5 },
    ]
  },
  bridge_truss: {
    label: " Bridge Truss", group: " Bridges",
    params: [
      { id: "length",   label: "Bridge Length (m)",         val: 80,  min: 20, max: 300, step: 1   },
      { id: "height",   label: "Truss Height (m)",          val: 12,  min: 4,  max: 40,  step: 0.5 },
      { id: "width",    label: "Road Width (m)",            val: 10,  min: 4,  max: 30,  step: 0.5 },
      { id: "panels",   label: "Truss Panels",              val: 12,  min: 4,  max: 32,  step: 1   },
      { id: "pillars",  label: "Support Pillars (0=none)",  val: 2,   min: 0,  max: 8,   step: 1   },
      { id: "pillarH",  label: "Pillar Height Below (m)",   val: 12,  min: 2,  max: 40,  step: 0.5 },
    ]
  },
  amphitheater: {
    label: " Amphitheater", group: " Amphitheater",
    params: [
      { id: "innerR",     label: "Stage Radius (m)",          val: 12, min: 4,   max: 60,  step: 0.5 },
      { id: "rows",       label: "Seating Rows",              val: 8,  min: 2,   max: 20,  step: 1   },
      { id: "rowD",       label: "Row Depth (m)",             val: 3.5,min: 1.5, max: 8,   step: 0.5 },
      { id: "rowH",       label: "Row Rise (m)",              val: 1.5,min: 0.5, max: 4,   step: 0.25},
      { id: "arcDeg",     label: "Arc of Seating () 180=semi 360=full", val: 200, min: 90, max: 360, step: 5 },
      { id: "segsPerRow", label: "Segments per Row",          val: 28, min: 12,  max: 60,  step: 2   },
      { id: "stage",      label: "Include Stage Floor (0/1)", val: 1,  min: 0,   max: 1,   step: 1   },
    ]
  },
  vaulted_ceiling: {
    label: " Vaulted Ceiling / Barrel Vault", group: " Architecture",
    params: [
      { id: "width",    label: "Vault Span Width (m)",      val: 16, min: 4,  max: 60,  step: 0.5 },
      { id: "length",   label: "Vault Length (m)",          val: 50, min: 10, max: 200, step: 1   },
      { id: "bays",     label: "Number of Bays",            val: 5,  min: 1,  max: 20,  step: 1   },
      { id: "ribSegs",  label: "Points per Arch Rib",       val: 16, min: 6,  max: 32,  step: 2   },
      { id: "longRibs", label: "Longitudinal Rib Lines",    val: 8,  min: 4,  max: 20,  step: 1   },
      { id: "walls",    label: "Side Walls (0=no 1=yes)",   val: 1,  min: 0,  max: 1,   step: 1   },
      { id: "wallH",    label: "Wall Height Below (m)",     val: 4,  min: 1,  max: 20,  step: 0.5 },
      { id: "floor",    label: "Floor (0=no 1=yes)",        val: 0,  min: 0,  max: 1,   step: 1   },
    ]
  },
  pitched_roof: {
    label: " Pitched Roof Frame", group: " Architecture",
    params: [
      { id: "width",      label: "Roof Span Width (m)",     val: 20, min: 4,  max: 80,  step: 0.5 },
      { id: "length",     label: "Roof Length (m)",         val: 40, min: 4,  max: 200, step: 1   },
      { id: "pitch",      label: "Ridge Height / Pitch (m)",val: 8,  min: 2,  max: 30,  step: 0.5 },
      { id: "bays",       label: "Rafter Bay Count",        val: 8,  min: 2,  max: 30,  step: 1   },
      { id: "collarTie",  label: "Collar Ties (0=no 1=yes)",val: 1,  min: 0,  max: 1,   step: 1   },
      { id: "kingPost",   label: "King Posts (0=no 1=yes)", val: 1,  min: 0,  max: 1,   step: 1   },
    ]
  },
  log_cabin: {
    label: " Log Cabin", group: " Log Cabin",
    params: [
      { id: "width",     label: "Cabin Width (m)",          val: 16, min: 6,  max: 50,  step: 0.5 },
      { id: "depth",     label: "Cabin Depth (m)",          val: 12, min: 6,  max: 50,  step: 0.5 },
      { id: "height",    label: "Wall Height (m)",          val: 7,  min: 3,  max: 20,  step: 0.5 },
      { id: "logGap",    label: "Log Row Spacing (m)",      val: 1.2,min: 0.5,max: 4,   step: 0.1 },
      { id: "doorW",     label: "Door Width (m)",           val: 3,  min: 1,  max: 6,   step: 0.5 },
      { id: "doorH",     label: "Door Height (m)",          val: 5,  min: 2,  max: 10,  step: 0.5 },
      { id: "windowW",   label: "Window Width (m)",         val: 2.5,min: 1,  max: 6,   step: 0.5 },
      { id: "windowH",   label: "Window Height (m)",        val: 2,  min: 0.5,max: 5,   step: 0.5 },
      { id: "roof",      label: "Include Gabled Roof (0/1)",val: 1,  min: 0,  max: 1,   step: 1   },
      { id: "roofPitch", label: "Roof Pitch Height (m)",    val: 5,  min: 1,  max: 15,  step: 0.5 },
    ]
  },
  freeway_curve: {
    label: " Freeway / Elevated Road", group: " Freeway",
    params: [
      { id: "segments", label: "Road Segments",              val: 12, min: 2,  max: 40,  step: 1   },
      { id: "segLen",   label: "Segment Length (m)",         val: 10, min: 5,  max: 30,  step: 1   },
      { id: "roadW",    label: "Road Deck Width (m)",        val: 10, min: 4,  max: 30,  step: 0.5 },
      { id: "arcDeg",   label: "Turn per Segment () 0=straight 15=U-turn", val: 0, min: -30, max: 30, step: 0.5 },
      { id: "pillars",  label: "Support Pillars (0=no 1=yes)",val: 1, min: 0,  max: 1,   step: 1   },
      { id: "pillarH",  label: "Pillar Depth Below (m)",    val: 8,  min: 2,  max: 30,  step: 0.5 },
    ]
  },
  saturn: {
    label: " Saturn Planet", group: " Sci-Fi",
    params: [
      { id: "bodyRadius", label: "Planet Radius (m)", val: 25, min: 10, max: 80 },
      { id: "ringInner",  label: "Ring Inner Radius (m)", val: 38, min: 15, max: 120 },
      { id: "ringOuter",  label: "Ring Outer Radius (m)", val: 60, min: 25, max: 180 },
      { id: "tilt",       label: "Ring Tilt Angle ()", val: 25, min: 0, max: 45 },
      { id: "latSegs",    label: "Planet Latitude Rings", val: 8, min: 4, max: 16 },
      { id: "lonSegs",    label: "Planet Longitude Points", val: 16, min: 8, max: 32 },
      { id: "ringSegs",   label: "Ring Detail (points)", val: 36, min: 16, max: 72 },
    ]
  },
  crown: {
    label: " Crown", group: " Medieval",
    params: [
      { id: "radius", label: "Crown Radius (m)", val: 12, min: 4, max: 50 },
      { id: "baseH",  label: "Base Band Height (m)", val: 6, min: 2, max: 20 },
      { id: "spikeH", label: "Spike Height (m)", val: 8, min: 2, max: 40 },
      { id: "points", label: "Number of Points", val: 5, min: 3, max: 12 },
    ]
  },
  olympic_rings: {
    label: " Olympic Rings", group: " Structures",
    params: [
      { id: "ringR", label: "Ring Radius (m)", val: 12, min: 4, max: 50 },
      { id: "tubeR", label: "Tube Thickness (m)", val: 2, min: 0.5, max: 8, step: 0.5 },
      { id: "segs",  label: "Ring Detail (segments)", val: 28, min: 10, max: 72 },
    ]
  },

  //  NAVAL 
  submarine: {
    label: " Submarine", group: " Naval",
    params: [
      { id: "length",   label: "Hull Length (m)",        val: 80, min: 30, max: 200 },
      { id: "radius",   label: "Hull Radius (m)",         val: 8,  min: 3,  max: 25  },
      { id: "ctHeight", label: "Conning Tower Height (m)",val: 10, min: 3,  max: 25  },
      { id: "segs",     label: "Hull Cross-Section Segs", val: 12, min: 6,  max: 24, step: 1 },
    ]
  },
  aircraft_carrier: {
    label: " Aircraft Carrier", group: " Naval",
    params: [
      { id: "length",   label: "Deck Length (m)",       val: 200, min: 80,  max: 400 },
      { id: "width",    label: "Deck Width (m)",         val: 36,  min: 15,  max: 70  },
      { id: "deckH",    label: "Hull Depth (m)",         val: 14,  min: 6,   max: 30  },
      { id: "islandH",  label: "Island Tower Height (m)",val: 20,  min: 8,   max: 50  },
    ]
  },
  destroyer: {
    label: " Destroyer / Warship", group: " Naval",
    params: [
      { id: "length", label: "Ship Length (m)", val: 120, min: 40, max: 250 },
      { id: "width",  label: "Beam Width (m)",  val: 16,  min: 6,  max: 40  },
      { id: "deckH",  label: "Hull Depth (m)",  val: 10,  min: 4,  max: 25  },
    ]
  },
  helicarrier: {
    label: " Avengers Helicarrier", group: " Naval",
    params: [
      { id: "length", label: "Carrier Length (m)",      val: 280, min: 100, max: 500 },
      { id: "width",  label: "Carrier Width (m)",        val: 80,  min: 30,  max: 150 },
      { id: "deckH",  label: "Hull Depth (m)",           val: 20,  min: 8,   max: 50  },
      { id: "propR",  label: "Propeller Radius (m)",     val: 35,  min: 15,  max: 80  },
    ]
  },

  //  VAULT 
  vault_door: {
    label: " Vault Door", group: " Monuments",
    params: [
      { id: "radius",    label: "Door Radius (m)",        val: 20, min: 5,  max: 60  },
      { id: "thickness", label: "Door Thickness (m)",     val: 4,  min: 1,  max: 15  },
      { id: "rings",     label: "Concentric Ring Bands",  val: 5,  min: 2,  max: 12, step: 1 },
      { id: "spokes",    label: "Spoke Count",            val: 8,  min: 4,  max: 16, step: 1 },
      { id: "segs",      label: "Circle Segments",        val: 32, min: 16, max: 64, step: 1 },
    ]
  },

  //  SCI-FI MECHS 
  lab_spider: {
    label: " Lab Spider Mech", group: " Mechs",
    params: [
      { id: "height", label: "Body Height (m)", val: 22, min: 10, max: 50 },
      { id: "width",  label: "Leg Span (m)",    val: 16, min: 8,  max: 40 },
    ]
  },

  //  SEASONAL 
  xmas_tree_large: {
    label: " Giant Christmas Tree", group: " Seasonal",
    params: [
      { id: "height",     label: "Tree Height (m)",      val: 30, min: 5,  max: 80  },
      { id: "baseRadius", label: "Base Radius (m)",       val: 18, min: 4,  max: 50  },
      { id: "topRadius",  label: "Top Tier Radius (m)",  val: 2,  min: 0.5,max: 10  },
      { id: "tiers",      label: "Tier Count",           val: 5,  min: 2,  max: 10, step: 1 },
    ]
  },
  jack_house: {
    label: " Jack's Spiral Hill", group: " Halloween",
    params: [
      { id: "hillRadius",  label: "Hill Base Radius (m)", val: 30, min: 10, max: 80 },
      { id: "hillHeight",  label: "Hill Height (m)",      val: 20, min: 8,  max: 50 },
      { id: "houseHeight", label: "House Height (m)",     val: 12, min: 4,  max: 30 },
      { id: "houseWidth",  label: "House Width (m)",      val: 10, min: 4,  max: 25 },
    ]
  },
  pumpkin_ring: {
    label: " Pumpkin Ring", group: " Halloween",
    params: [
      { id: "radius",     label: "Ring Radius (m)",   val: 20, min: 5,  max: 80  },
      { id: "count",      label: "Pumpkin Count",     val: 8,  min: 3,  max: 20, step: 1 },
      { id: "pumpHeight", label: "Pumpkin Height (m)",val: 4,  min: 1,  max: 10  },
    ]
  },
  easter_cross: {
    label: " Easter Cross", group: " Easter",
    params: [
      { id: "height",    label: "Cross Height (m)",    val: 20, min: 5,  max: 60  },
      { id: "width",     label: "Crossbar Width (m)",  val: 14, min: 4,  max: 40  },
      { id: "thickness", label: "Beam Thickness (m)",  val: 2,  min: 0.5,max: 6   },
      { id: "eggs",      label: "Easter Eggs (ring)",  val: 12, min: 4,  max: 24, step: 1 },
    ]
  },
  ice_wall: {
    label: " Ice / Snow Wall", group: " Seasonal",
    params: [
      { id: "length",    label: "Wall Length (m)",     val: 50, min: 10, max: 200 },
      { id: "height",    label: "Wall Height (m)",     val: 12, min: 4,  max: 40  },
      { id: "thickness", label: "Wall Thickness (m)",  val: 3,  min: 1,  max: 10  },
    ]
  },

  //  MASTERPIECES
  medieval_fort: {
    label: " Medieval Fort", group: " Masterpieces",
    params: [
      { id: "width",  label: "Fort Width (m)",  val: 60, min: 30, max: 200 },
      { id: "height", label: "Wall Height (m)", val: 15, min: 10, max: 40  },
    ]
  },
  bridge_of_khazad_dum: {
    label: " Bridge of Khazad-dm", group: " Masterpieces",
    params: [
      { id: "width", label: "Bridge Span (m)", val: 200, min: 100, max: 500 },
    ]
  },
  alcatraz_prison: {
    label: " Alcatraz Prison", group: " Masterpieces",
    params: [
      { id: "width",  label: "Island Width (m)",  val: 80, min: 40, max: 150 },
      { id: "length", label: "Island Length (m)", val: 60, min: 30, max: 150 },
    ]
  },
  roman_aqueduct: {
    label: " Roman Aqueduct", group: " Masterpieces",
    params: [
      { id: "width", label: "Aqueduct Span (m)", val: 150, min: 100, max: 400 },
    ]
  },
  military_fob: {
    label: " Military FOB", group: " Masterpieces",
    params: [
      { id: "width", label: "Base Width (m)", val: 50, min: 30, max: 120 },
    ]
  },
  checkpoint_charlie: {
    label: " Checkpoint Charlie", group: " Masterpieces",
    params: [
      { id: "width", label: "Road Width (m)", val: 20, min: 10, max: 50 },
    ]
  },
  trench_network: {
    label: " Trench Network", group: " Masterpieces",
    params: [
      { id: "width", label: "Trench Line (m)", val: 100, min: 50, max: 400 },
    ]
  },
  crop_circle: {
    label: " Crop Circle", group: " Masterpieces",
    params: [
      { id: "width", label: "Radius (m)", val: 60, min: 20, max: 150 },
    ]
  },
  the_wall_game_of_thrones: {
    label: " The Wall (GoT)", group: " Masterpieces",
    params: [
      { id: "width",  label: "Wall Length (m)", val: 300, min: 100, max: 800 },
      { id: "height", label: "Wall Height (m)", val: 100, min: 60,  max: 300 },
    ]
  },
  helms_deep_gate: {
    label: " Helm's Deep Gate", group: " Masterpieces",
    params: [
      { id: "width", label: "Fortification Span", val: 80, min: 40, max: 200 },
    ]
  },
  minas_tirith_tier: {
    label: " Minas Tirith Tier", group: " Masterpieces",
    params: [
      { id: "width", label: "Radius (m)", val: 120, min: 40, max: 250 },
      { id: "height", label: "Height (m)", val: 100, min: 40, max: 250 },
    ]
  },
  minas_tirith: {
    label: " Minas Tirith (City)", group: " Masterpieces",
    params: [
      { id: "width", label: "Radius (m)", val: 120, min: 40, max: 250 },
      { id: "height", label: "Height (m)", val: 100, min: 40, max: 250 },
    ]
  },
  oil_rig: {
    label: " Deep Sea Oil Rig", group: " Masterpieces",
    params: [
      { id: "width", label: "Platform Size (m)", val: 40, min: 20, max: 100 },
    ]
  },
  panama_canal_locks: {
    label: " Panama Canal Locks", group: " Masterpieces",
    params: [
      { id: "width", label: "Total Length (m)", val: 120, min: 60, max: 400 },
    ]
  },
  airport_runway: {
    label: " Airport Runway", group: " Masterpieces",
    params: [
      { id: "width", label: "Runway Length (m)", val: 800, min: 200, max: 2000 },
    ]
  },
  bunker_complex_entrance: {
    label: " Bunker Entrance Facade", group: " Masterpieces",
    params: [
      { id: "width", label: "Facade Width (m)", val: 40, min: 20, max: 100 },
    ]
  },
  cyberpunk_nexus: {
    label: " Cyberpunk Nexus", group: " Masterpieces",
    params: [
      { id: "width",  label: "Tower Width (m)",  val: 50,  min: 20, max: 150 },
      { id: "height", label: "Tower Height (m)", val: 100, min: 50, max: 300 },
    ]
  },
  skyscraper: {
    label: " Skyscraper", group: " Masterpieces",
    params: [
      { id: "height", label: "Tower Height (m)", val: 120, min: 40, max: 300, step: 5 },
      { id: "width",  label: "Tower Width (m)",  val: 30,  min: 10, max: 100, step: 2 },
      { id: "floors", label: "Number of Floors", val: 20,  min: 5,  max: 60,  step: 1 },
    ]
  },
  eiffel_tower: {
    label: " Eiffel Tower", group: " Masterpieces",
    params: [
      { id: "height", label: "Tower Height (m)", val: 120, min: 40, max: 300, step: 10 },
      { id: "width",  label: "Base Width (m)",  val: 60,  min: 20, max: 150, step: 5 },
    ]
  },
};

export const SHAPE_GROUPS = [...new Set(Object.values(SHAPE_DEFS).map(s => s.group))];
