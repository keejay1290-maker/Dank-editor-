import fs from 'fs';
import path from 'path';

const validObjectsFile = 'c:/Users/Shadow/Downloads/Dank-editor-preview/tmp_valid_objects.json';

if (!fs.existsSync(validObjectsFile)) {
    console.error('Missing scan file.');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(validObjectsFile, 'utf8'));
const validObjects = new Set(data.objects.map(s => s.toLowerCase()));

// Rule 6: Get most frequent valid objects from scan
const mostFrequentWalls = data.objects.filter(obj => obj.toLowerCase().includes('wall')).slice(0, 5);
const mostFrequentContainers = data.objects.filter(obj => obj.toLowerCase().includes('container')).slice(0, 5);

const defaultWall = mostFrequentWalls[0] || 'Land_Wall_Concrete_4m';
const defaultContainer = mostFrequentContainers[0] || 'Land_Container_1Bo';

// Rule 3: Intelligent Fallbacks
const fallbacks = {
    'land_castle_wall2_04': mostFrequentWalls.find(w => w.toLowerCase().includes('stone')) || defaultWall,
    'land_wall_concrete_8m': defaultWall,
    'land_wall_brick_4m': mostFrequentWalls.find(w => w.toLowerCase().includes('brick')) || defaultWall,
    'land_office2': defaultContainer,
    'land_houseblock_5f': defaultContainer,
    'land_prison_wall_large': defaultWall,
    'land_mil_watchtower': 'Land_Mil_GuardTower'
};

const filesToRevise = [
    'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/lib/completedBuilds.ts',
    'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/App.tsx',
    'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/lib/dayzObjects.ts'
];

for (const filePath of filesToRevise) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    let revised = content;
    let updates = 0;

    if (filePath.endsWith('dayzObjects.ts')) {
        // Special logic for cleaning up the selection list
        // Rule 1 & 3: Purge any non-scanned or non-object assets
        const itemRegex = /{\s*value:\s*\"([^\"]+)\",\s*label:\s*\"([^\"]+)\",\s*group:\s*\"([^\"]+)\"\s*},?/g;
        let match;
        const matches = [];
        while ((match = itemRegex.exec(content)) !== null) {
            const value = match[1];
            if (!validObjects.has(value.toLowerCase()) && !value.includes('.p3d')) {
                matches.push(match[0]);
            }
        }
        for(const m of matches) {
            revised = revised.split(m).join('');
            updates++;
        }
    } else {
        // Rule 4: Revision of actual build objects
        const objRegex = /(frameObj|fillObj|suggestedClass|name):\s*\"([^\"]+)\"/g;
        let match;
        const replacements = new Map();
        while ((match = objRegex.exec(content)) !== null) {
            const key = match[1];
            const originalValue = match[2];
            const lower = originalValue.toLowerCase();

            if (!validObjects.has(lower) && !originalValue.includes('.p3d')) {
                let replacement = fallbacks[lower];
                if (!replacement) {
                    if (lower.includes('wall')) replacement = defaultWall;
                    else if (lower.includes('container')) replacement = defaultContainer;
                    else replacement = defaultWall;
                }
                replacements.set(`${key}: \"${originalValue}\"`, `${key}: \"${replacement}\"`);
            }
        }
        for (const [oldStr, newStr] of replacements) {
            revised = revised.split(oldStr).join(newStr);
            updates++;
        }
    }

    if (updates > 0) {
        fs.writeFileSync(filePath, revised);
        console.log(`REVISED ${path.basename(filePath)}: ${updates} updates applied.`);
    }
}
console.log('ENFORCEMENT_AUDIT_COMPLETE');
