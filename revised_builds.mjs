import fs from 'fs';
import path from 'path';

const validObjectsFile = 'c:/Users/Shadow/Downloads/Dank-editor-preview/tmp_valid_objects.json';
const completedBuildsFile = 'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/lib/completedBuilds.ts';

if (!fs.existsSync(validObjectsFile)) {
    console.error('Missing scan file.');
    process.exit(1);
}

const rawValid = JSON.parse(fs.readFileSync(validObjectsFile, 'utf8')).objects;
const validObjects = new Set(rawValid.map(s => s.toLowerCase()));

const fallbacks = {
    'land_castle_wall2_04': 'Land_Wall_Stone_8m',
    'land_wall_concrete_8m': 'Land_Wall_Concrete_4m',
    'land_wall_brick_4m': 'Land_Wall_Brick_2m',
    'land_office2': 'Land_City_PoliceStation',
    'land_houseblock_5f': 'Land_Tenement_Big',
    'land_prison_wall_large': 'Land_Wall_Concrete_4m',
    'land_mil_watchtower': 'Land_Mil_GuardTower'
};

const filesToRevise = [
    'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/lib/completedBuilds.ts',
    'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/App.tsx'
];

let totalReplacements = 0;

for (const filePath of filesToRevise) {
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    let revised = content;
    let fileReplacements = 0;

    // Simple regex to find values associated with frameObj, fillObj, or suggestedClass
    const objRegex = /(frameObj|fillObj|suggestedClass):\s*\"([^\"]+)\"/g;
    let match;
    const replacedPairs = new Set();

    while ((match = objRegex.exec(content)) !== null) {
        const key = match[1];
        const originalValue = match[2];
        const lower = originalValue.toLowerCase();
        
        // Skip .p3d paths as they are usually valid file references
        if (!validObjects.has(lower) && !originalValue.includes('.p3d') && !originalValue.includes('\\\\')) {
            let replacement = fallbacks[lower];
            if (!replacement) {
                if (lower.includes('wall')) replacement = 'Land_Wall_Concrete_4m';
                else if (lower.includes('house') || lower.includes('office')) replacement = 'Land_Tenement_Big';
                else if (lower.includes('container')) replacement = 'Land_Container_1Bo';
                else if (lower.includes('mil_')) replacement = 'Land_Mil_GuardTower';
                else replacement = 'Land_Wall_Concrete_4m';
            }
            
            const oldStr = `${key}: \"${originalValue}\"`;
            const newStr = `${key}: \"${replacement}\"`;
            
            if (!replacedPairs.has(oldStr)) {
                revised = revised.split(oldStr).join(newStr);
                replacedPairs.add(oldStr);
                fileReplacements++;
                console.log(`[${path.basename(filePath)}] REPLACED: ${originalValue} -> ${replacement} (${key})`);
            }
        }
    }

    if (fileReplacements > 0) {
        fs.writeFileSync(filePath, revised);
        totalReplacements += fileReplacements;
    }
}

console.log(`DONE: ${totalReplacements} unique invalid objects revised across all files.`);
