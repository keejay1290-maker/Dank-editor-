import fs from 'fs';
import path from 'path';

const completedBuildsFile = 'c:/Users/Shadow/Downloads/Dank-editor-preview/artifacts/dayz-builder/src/lib/completedBuilds.ts';
if (!fs.existsSync(completedBuildsFile)) {
    process.exit(1);
}

const content = fs.readFileSync(completedBuildsFile, 'utf8');

// Function to convert ID to Title Case
function toTitleCase(id) {
    if (id === 'atat_walker') return 'AT-AT Walker';
    if (id === 'fob_bastion') return 'FOB Bastion';
    return id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Regex to find id and name in the same object block
const buildBlockRegex = /id:\s*\"([^\"]+)\",[\s\S]*?name:\s*\"[^\"]+\"/g;

let revised = content;
let match;
let count = 0;

const blocks = [];
const regex = /id:\s*\"([^\"]+)\",[\s\S]*?name:\s*\"[^\"]+\"/g;

while ((match = regex.exec(content)) !== null) {
    const id = match[1];
    const fullBlock = match[0];
    const originalName = toTitleCase(id);
    const newBlock = fullBlock.replace(/name:\s*\"[^\"]+\"/, `name: \"${originalName}\"`);
    revised = revised.split(fullBlock).join(newBlock);
    count++;
}

fs.writeFileSync(completedBuildsFile, revised);
console.log(`REPLICATED_ORIGINAL_NAMES: ${count} prebuilds restored.`);
