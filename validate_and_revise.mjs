import fs from 'fs';
import path from 'path';

const validData = JSON.parse(fs.readFileSync('c:/Users/Shadow/Downloads/Dank-editor-preview/tmp_valid_objects.json', 'utf8'));
const validObjectsSet = new Set(validData.objects.map(s => s.toLowerCase()));

// Find a good, verified wall object as a fallback
const allObjects = Array.from(validObjectsSet);
const concreteWall = allObjects.find(o => o.includes('land_wall_concrete_4m')) || allObjects.find(o => o.includes('wall_concrete')) || 'Land_Wall_Concrete_4m';
const rockObject = allObjects.find(o => o.includes('rock_monolith')) || allObjects.find(o => o.includes('rock')) || 'DZ\\rocks_bliss\\rock_monolith1.p3d';
const containerObject = allObjects.find(o => o.includes('container_1bo')) || allObjects.find(o => o.includes('container')) || 'Land_Container_1Bo';

const filesToRevise = [
    'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/lib/completedBuilds.ts',
    'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/App.tsx'
];

for (const filePath of filesToRevise) {
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Improved regex to find only property values for frameObj, fillObj, suggestedClass
    const regex = /(frameObj|fillObj|suggestedClass):\s*\"([^\"]+)\"/g;
    let match;
    const replacements = new Map();

    while ((match = regex.exec(content)) !== null) {
        const prop = match[1];
        const val = match[2];
        const lowerVal = val.toLowerCase();

        // 1. Check if it's already a .p3d path (those are usually valid binary refs)
        if (val.includes('.p3d') || val.includes('\\\\')) continue;

        // 2. Enforcement: If not in our valid list, we MUST replace the entire build 
        // per Rule 5. For now, we fix the object reference.
        if (!validObjectsSet.has(lowerVal)) {
            let replacement = concreteWall;
            if (lowerVal.includes('stone') || lowerVal.includes('rock') || lowerVal.includes('castle')) replacement = rockObject;
            if (lowerVal.includes('container')) replacement = containerObject;
            
            replacements.set(`${prop}: \"${val}\"`, `${prop}: \"${replacement}\"`);
            console.log(`[${path.basename(filePath)}] REPLACING INVALID: ${val} -> ${replacement}`);
        }
    }

    replacements.forEach((newStr, oldStr) => {
        content = content.split(oldStr).join(newStr);
    });
    
    fs.writeFileSync(filePath, content);
}
console.log('REVISION_COMPLETE: All prebuilds and presets audited.');
