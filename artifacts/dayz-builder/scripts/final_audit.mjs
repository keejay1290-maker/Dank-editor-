import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogueFile = path.resolve(__dirname, '../src/lib/masterObjectCatalogue.ts');
const buildsFile = path.resolve(__dirname, '../src/lib/completedBuilds.ts');

const catalogueCode = fs.readFileSync(catalogueFile, 'utf8');
const objects = Array.from(catalogueCode.matchAll(/"(Land_[^"]+|staticobj_[^"]+|StaticObj_[^"]+)"/gi)).map(m => m[1]);
const masterLower = new Set(objects.map(o => o.toLowerCase()));

const buildsCode = fs.readFileSync(buildsFile, 'utf8');
const builds = [];
let braceDepth = 0;
let current = "";
for (const char of buildsCode.split("COMPLETED_BUILDS:")[1] || "") {
    if (char === '{') braceDepth++;
    if (braceDepth > 0) current += char;
    if (char === '}') {
        braceDepth--;
        if (braceDepth === 0) {
            builds.push(current);
            current = "";
        }
    }
}

const report = builds.map(b => {
    const idMatch = b.match(/"id":\s*"([^"]+)"/);
    const nameMatch = b.match(/"name":\s*"([^"]+)"/);
    const frameMatch = b.match(/"frameObj":\s*"([^"]+)"/);
    const fillMatch = b.match(/"fillObj":\s*"([^"]+)"/);
    
    const id = idMatch ? idMatch[1] : "unknown";
    const name = nameMatch ? nameMatch[1] : id;
    const frame = frameMatch ? frameMatch[1] : "N/A";
    const fill = fillMatch ? fillMatch[1] : "N/A";
    
    const frameValid = frame === "N/A" || masterLower.has(frame.toLowerCase());
    const fillValid = fill === "N/A" || masterLower.has(fill.toLowerCase());
    
    return { id, name, frame, fill, valid: frameValid && fillValid };
});

const output = [
    "DANKVAULT ARCHITECTURAL PIPELINE - FINAL FLEET AUDIT",
    "===================================================",
    `Total Builds Analyzed: ${report.length}`,
    `Compliant Builds: ${report.filter(r => r.valid).length}`,
    `Non-Compliant: ${report.filter(r => !r.valid).length}`,
    "",
    "DETAILED STATUS:",
    "----------------"
];

report.forEach(r => {
    output.push(`${r.valid ? "✅" : "❌"} [${r.id}] ${r.name} - Asset: ${r.frame}`);
});

fs.writeFileSync('../FINAL_AUDIT_REPORT.txt', output.join("\n"), 'utf8');
console.log(`Final audit complete. ${report.length} builds verified.`);
