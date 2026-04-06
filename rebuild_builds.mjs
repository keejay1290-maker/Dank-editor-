// Rebuild completedBuilds.ts for vanilla-only
import fs from 'fs';

const validLower = new Set(JSON.parse(fs.readFileSync('valid_objects_lower.json', 'utf-8')));

const content = fs.readFileSync('artifacts/dayz-builder/src/lib/completedBuilds.ts', 'utf-8');
const lines = content.split('\n');

// Parse builds - find each { ... } block in the COMPLETED_BUILDS array
let builds = [];
let currentBuild = null;
let braceDepth = 0;
let inArray = false;
let headerLines = [];
let footerLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('COMPLETED_BUILDS:')) {
    inArray = true;
    headerLines = lines.slice(0, i + 1);
    continue;
  }
  
  if (!inArray) continue;
  
  // Track opening braces for build objects
  if (line.match(/^\s*\{/) && braceDepth === 0) {
    currentBuild = { startLine: i, lines: [line], props: {} };
    braceDepth = 1;
    continue;
  }
  
  if (currentBuild) {
    currentBuild.lines.push(line);
    braceDepth += (line.match(/\{/g) || []).length;
    braceDepth -= (line.match(/\}/g) || []).length;
    
    // Extract properties from the full block if possible
    if (braceDepth === 0) {
      const fullBlock = currentBuild.lines.join(' ');
      
      const idMatch = fullBlock.match(/\b"??id"??\s*:\s*"([^"]+)"/);
      if (idMatch) currentBuild.props.id = idMatch[1];
      
      const nameMatch = fullBlock.match(/\b"??name"??\s*:\s*"([^"]+)"/);
      if (nameMatch) currentBuild.props.name = nameMatch[1];
      
      const categoryMatch = fullBlock.match(/\b"??category"??\s*:\s*"([^"]+)"/);
      if (categoryMatch) currentBuild.props.category = categoryMatch[1];
      
      const frameMatch = fullBlock.match(/\b"??frameObj"??\s*:\s*"([^"]+)"/);
      if (frameMatch) currentBuild.props.frameObj = frameMatch[1];
      
      const fillMatch = fullBlock.match(/\b"??fillObj"??\s*:\s*"([^"]+)"/);
      if (fillMatch) currentBuild.props.fillObj = fillMatch[1];
      
      const extraFrameMatch = fullBlock.match(/\b"??extraFrame"??\s*:\s*"([^"]+)"/);
      if (extraFrameMatch) currentBuild.props.extraFrame = extraFrameMatch[1];
      
      const extraFillMatch = fullBlock.match(/\b"??extraFill"??\s*:\s*"([^"]+)"/);
      if (extraFillMatch) currentBuild.props.extraFill = extraFillMatch[1];

      builds.push(currentBuild);
      currentBuild = null;
    }
  }
  
  // End of array
  if (line.match(/^\];/) && !currentBuild) {
    footerLines = lines.slice(i);
    break;
  }
}

// Analyze each build
const report = [];
const survivingBuilds = [];
const removedBuilds = [];

for (const build of builds) {
  const p = build.props;
  const isTransformer = p.id?.startsWith('tf_');
  const frameValid = p.frameObj ? validLower.has(p.frameObj.toLowerCase()) : true;
  const fillValid = p.fillObj ? validLower.has(p.fillObj.toLowerCase()) : true;
  const extraFrameValid = p.extraFrame ? validLower.has(p.extraFrame.toLowerCase()) : true;
  const extraFillValid = p.extraFill ? validLower.has(p.extraFill.toLowerCase()) : true;
  
  if (isTransformer) {
    removedBuilds.push({ name: p.name, reason: 'SCRAPPED (Transformers)' });
    continue;
  }
  
  if (!frameValid || !fillValid) {
    // Try to find vanilla replacements
    const vanillaReplacements = {
      // Walls & barriers → Prison walls, containers, wreck vehicles
      'Land_HBarrier_5m_DE': 'Land_Mil_Fortified_Nest_Big',
      'Land_HBarrier_10m_DE': 'Land_Mil_Fortified_Nest_Big',
      'Land_HBarrier_Corner_DE': 'Land_Mil_Fortified_Nest_Small',
      'Land_BarrierConcrete_01_DE': 'StaticObj_Mil_HBarrier_Big',
      'Land_BarrierConcrete_02_DE': 'StaticObj_Mil_HBarrier_Big',
      'Land_Wall_Concrete_4m_DE': 'StaticObj_Mil_HBarrier_Big',
      'Land_Wall_Concrete_8m_DE': 'StaticObj_Mil_HBarrier_Big',
      'Land_Wall_Brick_4m_DE': 'StaticObj_Mil_HBarrier_Big',
      'Land_Wall_Brick_8m_DE': 'StaticObj_Mil_HBarrier_Big',
      'Land_Sandbag_Wall_DE': 'StaticObj_Mil_HBarrier_Small',
      'Land_Sandbag_Corner_DE': 'StaticObj_Mil_HBarrier_Small',
      'Land_Sandbag_Round_DE': 'StaticObj_Mil_HBarrier_Small',
      'Land_BarbedWire_01_DE': 'BarbedWire',
      'Land_TankTrap_DE': 'StaticObj_Roadblock_Wood_Small_DE',
      // Containers
      'StaticObj_Container_1D': 'Land_Container_1Bo_DE',
      'StaticObj_Container_1C': 'Land_Container_1Mo_DE',
      // Military buildings
      'Land_Mil_WatchtowerH_DE': 'Land_Mil_GuardTower',
      'Land_Mil_WatchtowerL_DE': 'Land_Mil_Tower_Small',
      'Land_Mil_Guardhouse_DE': 'Land_Mil_Guardhouse1',
      'Land_Mil_Tent_Small_DE': 'Land_Mil_Tent_Big1_1',
      'Land_Mil_Tent_Big_DE': 'Land_Mil_Tent_Big3',
      'Land_Bunker_DE': 'Land_Bunker1_Double',
      'Land_Bunker_Small_DE': 'Land_Bunker1_Left',
      // Wrecks
      'Land_Wreck_BTR_DE': 'StaticObj_Wreck_BMP1_DE',
      'Land_Wreck_T72_DE': 'StaticObj_Wreck_T72_Chassis_DE',
      'Land_Wreck_heli_MI8_DE': 'Wreck_MI8',
      'Land_Wreck_Ural_DE': 'StaticObj_Wreck_Ural_DE',
      'Land_Wreck_Uaz': 'StaticObj_Wreck_UAZ_DE',
      // Industrial
      'Land_GasTank_Cylindrical': 'Land_DieselPowerPlant_Tank_Small',
      'Land_GasTank_Big': 'Land_DieselPowerPlant_Tank_Big',
      'Land_Tank_SmallConcrete_Round': 'Land_DieselPowerPlant_Tank_Small',
      'Land_PowerLine_Tower_DE': 'Land_Power_Station',
      'Land_RadioTower_1_DE': 'Land_Radio_Building',
      // Misc
      'StaticObj_Rail_Platform_Segment': 'StaticObj_Wreck_Train_Wagon_Flat_DE',
      'StaticObj_Monument_Wall': 'Land_Castle_Bergfrit',
      'Land_ConcreteSlab_03_DE': 'StaticObj_Mil_HBarrier_Big',
      'Pallet_EP1': 'Land_Misc_Scaffolding',
      // Rocks/plants (p3d paths) → vanilla wreck objects
      'DZ\\\\rocks_bliss\\\\rock_monolith1.p3d': 'Land_Castle_Bergfrit2',
      'DZ\\\\rocks_bliss\\\\rock_monolith2.p3d': 'Land_Castle_Bergfrit',
      'DZ\\\\rocks_bliss\\\\stone9_moss.p3d': 'Land_Castle_Bastion2',
      'DZ\\\\rocks_bliss\\\\rock_spike1.p3d': 'Land_Castle_Bergfrit2',
      'DZ\\\\rocks_bliss\\\\clutter_01.p3d': 'Barrel_Green',
      'DZ\\\\plants_bliss\\\\tree\\\\t_betulapendula_2f_summer.p3d': 'Land_Misc_Scaffolding',
    };
    
    let newFrame = p.frameObj;
    let newFill = p.fillObj;
    let newExtraFrame = p.extraFrame;
    let newExtraFill = p.extraFill;
    
    if (!frameValid) {
      newFrame = vanillaReplacements[p.frameObj];
      if (!newFrame) {
        removedBuilds.push({ name: p.name, reason: `No vanilla replacement for frameObj: ${p.frameObj}` });
        continue;
      }
    }
    if (!fillValid) {
      newFill = vanillaReplacements[p.fillObj];
      if (!newFill) {
        removedBuilds.push({ name: p.name, reason: `No vanilla replacement for fillObj: ${p.fillObj}` });
        continue;
      }
    }
    
    // Replace in lines
    let blockText = build.lines.join('\n');
    if (!frameValid) blockText = blockText.replace(`"${p.frameObj}"`, `"${newFrame}"`);
    if (!fillValid) blockText = blockText.replace(`"${p.fillObj}"`, `"${newFill}"`);
    
    // Handle extra objects
    if (p.extraFrame && !extraFrameValid) {
      const rep = vanillaReplacements[p.extraFrame];
      if (rep) {
        blockText = blockText.replace(`extraFrame: "${p.extraFrame}"`, `extraFrame: "${rep}"`);
      } else {
        // Remove the extra line
        blockText = blockText.replace(/\s*extraFrame:.*?,?\n/, '\n');
      }
    }
    if (p.extraFill && !extraFillValid) {
      const rep = vanillaReplacements[p.extraFill];
      if (rep) {
        blockText = blockText.replace(`extraFill: "${p.extraFill}"`, `extraFill: "${rep}"`);
      } else {
        blockText = blockText.replace(/\s*extraFill:.*?,?\n/, '\n');
      }
    }
    
    build.lines = blockText.split('\n');
    survivingBuilds.push(build);
    report.push(`REMAPPED: ${p.name} — frame: ${p.frameObj}→${newFrame}, fill: ${p.fillObj}→${newFill}`);
  } else {
    // Handle extra objects that might be invalid  
    if (p.extraFrame && !extraFrameValid) {
      let blockText = build.lines.join('\n');
      blockText = blockText.replace(/\s*extraFrame:.*?,?\n/, '\n');
      build.lines = blockText.split('\n');
    }
    if (p.extraFill && !extraFillValid) {
      let blockText = build.lines.join('\n');
      blockText = blockText.replace(/\s*extraFill:.*?,?\n/, '\n');
      build.lines = blockText.split('\n');
    }
    survivingBuilds.push(build);
    report.push(`KEPT: ${p.name} (all objects valid)`);
  }
}

// Reconstruct file
const newContent = [
  ...headerLines,
  '',
  ...survivingBuilds.map(b => b.lines.join('\n')),
  ...footerLines
].join('\n');

fs.writeFileSync('artifacts/dayz-builder/src/lib/completedBuilds.ts', newContent, 'utf-8');

// Write report
const fullReport = [
  `SURVIVING BUILDS: ${survivingBuilds.length}`,
  `REMOVED BUILDS: ${removedBuilds.length}`,
  '',
  '=== KEPT/REMAPPED ===',
  ...report,
  '',
  '=== REMOVED ===',
  ...removedBuilds.map(b => `${b.name}: ${b.reason}`)
].join('\n');

fs.writeFileSync('vanilla_rebuild_report.txt', fullReport);
console.log(`Surviving: ${survivingBuilds.length}, Removed: ${removedBuilds.length}`);
console.log('Report: vanilla_rebuild_report.txt');
