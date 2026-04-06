import fs from 'fs';
import path from 'path';

const validObjectsFile = 'c:/Users/Shadow/Downloads/Dank-editor-preview/tmp_valid_objects.json';
const dayzObjectsFile = 'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/lib/dayzObjects.ts';

if (!fs.existsSync(validObjectsFile)) {
    console.error('Scan file not found.');
    process.exit(1);
}

const validObjects = new Set(JSON.parse(fs.readFileSync(validObjectsFile, 'utf8')).objects.map(s => s.toLowerCase()));
const content = fs.readFileSync(dayzObjectsFile, 'utf8');

// Use a more generic regex for DayzObject entries: { value: "...", label: "...", group: "..." }
const itemRegex = /{\s*value:\s*\"([^\"]+)\",\s*label:\s*\"([^\"]+)\",\s*group:\s*\"([^\"]+)\"\s*},?/g;
let revised = content;
let match;
let removedCount = 0;
const removedList = [];

while ((match = itemRegex.exec(content)) !== null) {
    const value = match[1];
    const lower = value.toLowerCase();
    
    // Check if the object is NOT in our valid list and isn't a p3d (which we treat as valid for now)
    if (!validObjects.has(lower) && !value.includes('.p3d') && !value.includes('\\\\')) {
        removedList.push(value);
        removedCount++;
    }
}

// Perform specific removals to avoid breaking the file structure
// This fulfills Rule 3: Use only valid objects that are known to work.
if (removedCount > 0) {
    for (const p of removedList) {
        // String.replace with target escaped correctly. 
        // Note: we look for the exact string entry.
        const entryStart = content.indexOf(`value: \"${p}\"`);
        if (entryStart !== -1) {
            // Find the surrounding { ... }
            const startOfLine = content.lastIndexOf('{', entryStart);
            const endOfLine = content.indexOf('},', entryStart);
            if (startOfLine !== -1 && endOfLine !== -1) {
                const fullEntrySnippet = content.substring(startOfLine, endOfLine + 2);
                revised = revised.split(fullEntrySnippet).join('');
            }
        }
    }
    fs.writeFileSync(dayzObjectsFile, revised);
}

console.log(`CLEANUP COMPLETE: ${removedCount} invalid objects removed from the selectable catalog.`);
if (removedList.length > 0) {
    console.log(`Sample removed: ${removedList.slice(0, 5).join(', ')}`);
}
