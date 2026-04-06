import fs from 'fs';

const paramsFile = 'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/lib/shapeParams.ts';
let code = fs.readFileSync(paramsFile, 'utf8');

const injection = `
  azkaban_prison: { label: "Azkaban Prison", group: "Monuments", params: [ { id: "width", label: "Width", val: 40, min: 20, max: 100, step: 5 }, { id: "height", label: "Height", val: 100, min: 40, max: 200, step: 10 } ] },
  stargate_portal: { label: "Stargate Portal", group: "Sci-Fi", params: [ { id: "radius", label: "Radius", val: 20, min: 10, max: 80, step: 2 } ] },
  helms_deep: { label: "Helm's Deep", group: "Monuments", params: [ { id: "width", label: "Wall Length", val: 100, min: 40, max: 250, step: 10 } ] },
  jurassic_park_gate: { label: "Jurassic Park Gate", group: "Monuments", params: [ { id: "width", label: "Width", val: 30, min: 10, max: 80, step: 5 }, { id: "height", label: "Height", val: 25, min: 10, max: 60, step: 5 } ] },
  nakatomi_plaza: { label: "Nakatomi Plaza", group: "Monuments", params: [ { id: "width", label: "Width", val: 30, min: 10, max: 80, step: 5 }, { id: "height", label: "Height", val: 140, min: 40, max: 250, step: 10 } ] },
  matrix_zion_dock: { label: "Zion Dock", group: "Sci-Fi", params: [ { id: "width", label: "Radius", val: 100, min: 40, max: 200, step: 10 } ] },
  fortress_of_solitude: { label: "Fortress of Solitude", group: "Monuments", params: [ { id: "width", label: "Radius", val: 60, min: 20, max: 150, step: 5 } ] },
  wall_maria: { label: "Wall Maria", group: "Monuments", params: [ { id: "width", label: "Radius", val: 200, min: 50, max: 400, step: 10 }, { id: "height", label: "Height", val: 50, min: 20, max: 100, step: 5 } ] },
  barad_dur: { label: "Barad-dûr", group: "Monuments", params: [ { id: "width", label: "Base Width", val: 50, min: 20, max: 100, step: 5 }, { id: "height", label: "Height", val: 200, min: 50, max: 350, step: 10 } ] },
  tardis: { label: "TARDIS", group: "Sci-Fi", params: [] },
  nuketown: { label: "Nuketown", group: "Military", params: [] },
  dust2_a_site: { label: "Dust 2 - A Site", group: "Military", params: [] },
  peach_castle: { label: "Peach's Castle", group: "Monuments", params: [] },
  shinra_hq: { label: "Shinra HQ", group: "Sci-Fi", params: [ { id: "width", label: "Radius", val: 40, min: 20, max: 100, step: 5 }, { id: "height", label: "Height", val: 180, min: 50, max: 300, step: 10 } ] },
  halo_control_room: { label: "Halo Control Room", group: "Sci-Fi", params: [ { id: "width", label: "Base Width", val: 100, min: 40, max: 200, step: 10 }, { id: "height", label: "Height", val: 80, min: 30, max: 150, step: 10 } ] },
  colosseum: { label: "The Colosseum", group: "Monuments", params: [ { id: "width", label: "Radius", val: 80, min: 30, max: 150, step: 5 }, { id: "height", label: "Height", val: 40, min: 15, max: 80, step: 5 } ] },
  golden_gate_bridge: { label: "Golden Gate Bridge", group: "Monuments", params: [ { id: "width", label: "Span", val: 300, min: 100, max: 600, step: 20 }, { id: "height", label: "Height", val: 100, min: 30, max: 200, step: 10 } ] },
  normandy_bunkers: { label: "Normandy Bunkers", group: "Military", params: [ { id: "width", label: "Length", val: 120, min: 40, max: 300, step: 10 } ] },
  the_pentagon: { label: "The Pentagon", group: "Military", params: [ { id: "width", label: "Radius", val: 100, min: 30, max: 200, step: 5 } ] },
  pyramid_giza: { label: "Pyramid of Giza", group: "Monuments", params: [ { id: "width", label: "Base Width", val: 120, min: 30, max: 250, step: 10 } ] },
  taj_mahal: { label: "Taj Mahal", group: "Monuments", params: [] },
  stonehenge: { label: "Stonehenge", group: "Monuments", params: [] },
  starship_enterprise: { label: "Starship Enterprise", group: "Sci-Fi", params: [ { id: "width", label: "Scale %", val: 100, min: 50, max: 300, step: 10 } ] },
  star_destroyer: { label: "Star Destroyer", group: "Sci-Fi", params: [ { id: "width", label: "Width", val: 100, min: 30, max: 250, step: 10 }, { id: "length", label: "Length", val: 200, min: 50, max: 500, step: 10 } ] },
  king_kong_empire: { label: "Empire State (Kong)", group: "Monuments", params: [] },
`;

// Insert after export const SHAPE_DEFS: Record<string, ShapeDef> = {
const idx = code.indexOf('export const SHAPE_DEFS: Record<string, ShapeDef> = {');
if (idx > -1 && !code.includes('azkaban_prison:')) {
   const insertPos = code.indexOf('{', idx) + 1;
   code = code.slice(0, insertPos) + injection + code.slice(insertPos);
   fs.writeFileSync(paramsFile, code);
   console.log("Injected shapeParams!");
}
