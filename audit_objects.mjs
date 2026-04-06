import fs from 'fs';
import path from 'path';

const validLower = new Set(JSON.parse(fs.readFileSync('valid_objects_lower.json', 'utf-8')));

const TARGET_FILES = [
    'artifacts/dayz-builder/src/lib/dayzObjects.ts',
    'artifacts/dayz-builder/src/lib/completedBuilds.ts',
    'artifacts/dayz-builder/src/lib/shapeGenerators.ts'
];

let totalRemovedDayzObj = 0;
let removedList = {};
let removedBuilds = [];

function processFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn('File not found:', filePath);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;

    if (filePath.includes('dayzObjects.ts')) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match(/value:\s*"([^"]+)"/);
            if (match) {
                const objName = match[1];
                if (!validLower.has(objName.toLowerCase())) {
                    if (!removedList[objName]) removedList[objName] = new Set();
                    removedList[objName].add('dayzObjects.ts');
                    lines[i] = '// [REMOVED INVALID] ' + lines[i];
                    totalRemovedDayzObj++;
                }
            }
        }
        content = lines.join('\n');
    }
    else if (filePath.includes('completedBuilds.ts')) {
        // We will parse the AST or do a robust replacement
        // Since it's an array of objects COMPLETED_BUILDS, we can just evaluate it? No, it has TS types.
        // Let's use regex to find each object block: \s*\{\s*id: "[^"]+".*?\}, (roughly)
        // Actually, we can just replace 'tf_' presets entirely.
        // And if ANY preset uses an invalid frameObj or fillObj, we remove the whole preset block, or we set them to "".
        // The safest robust way is to replace invalid values with `""`. The UI can filter out empty strings later.
        
        const lines = content.split('\n');
        let currentBuildName = 'Unknown';
        let currentBuildId = '';
        let insideBuild = false;
        let buildStartLine = -1;
        let markForDeletion = false;

        for (let i = 0; i < lines.length; i++) {
            const idMatch = lines[i].match(/id:\s*"([^"]+)"/);
            if (idMatch) {
                currentBuildId = idMatch[1];
                insideBuild = true;
                buildStartLine = i - 1; // approx start of `{`
                markForDeletion = false;
                if (currentBuildId.startsWith('tf_') || currentBuildId === 'transformers') {
                    markForDeletion = true;
                }
            }
            
            const nameMatch = lines[i].match(/name:\s*"([^"]+)"/);
            if (nameMatch) {
                currentBuildName = nameMatch[1];
            }

            const match = lines[i].match(/(frameObj|fillObj|extraFrame|extraFill):\s*"([^"]+)"/);
            if (match) {
                const prop = match[1];
                const objName = match[2];
                if (!validLower.has(objName.toLowerCase())) {
                    if (!removedList[objName]) removedList[objName] = new Set();
                    removedList[objName].add(`completedBuilds.ts (${currentBuildName})`);
                    
                    if (prop === 'frameObj' || prop === 'fillObj') {
                        // Critical object is missing. Mark this preset for deletion.
                        markForDeletion = true;
                    } else {
                        // Just remove the optional property
                        lines[i] = `// [REMOVED INVALID OPTIONAL] ` + lines[i];
                    }
                }
            }

            if (insideBuild && lines[i].match(/^\s*\},?/)) {
                // End of build block
                if (markForDeletion) {
                    removedBuilds.push(currentBuildName);
                    // comment out the entire block
                    for (let j = buildStartLine; j <= i; j++) {
                        lines[j] = `// [REMOVED BUILD - INVALID/SCRAPPED] ` + lines[j];
                    }
                }
                insideBuild = false;
            }
        }
        content = lines.join('\n');
    }
    else if (filePath.includes('shapeGenerators.ts')) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match(/(?:defaultFrameObj|defaultFillObj):\s*"([^"]+)"/);
            if (match) {
                const objName = match[1];
                if (!validLower.has(objName.toLowerCase())) {
                    if (!removedList[objName]) removedList[objName] = new Set();
                    removedList[objName].add('shapeGenerators.ts');
                    lines[i] = lines[i].replace(`"${objName}"`, `""`);
                }
            }
        }
        content = lines.join('\n');
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${filePath}`);
    }
}

for (const fp of TARGET_FILES) {
    processFile(fp);
}

const report = Object.keys(removedList).map(k => `${k} (found in ${Array.from(removedList[k]).join(', ')})`);
fs.writeFileSync('removed_objects_report.txt', 'REMOVED OBJECTS:\n' + report.join('\n') + '\n\nREMOVED BUILDS:\n' + removedBuilds.join('\n'));
console.log(`Total removed in dayzObjects: ${totalRemovedDayzObj}`);
console.log(`Removed builds: ${removedBuilds.length}`);
